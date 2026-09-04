import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type {
  Order,
  MenuItem,
  AppView,
  OrderStatus,
  CafeTable,
  Tab,
  TabItem,
  TabDiscount,
  TabPaymentMethod,
  TimelineEntry,
  PosTarget,
} from './types';
import { INITIAL_ORDERS, MENU_ITEMS, DEMO_ORDER } from './data';
import { INITIAL_TABLES, PAYMENT_METHOD_LABELS } from './dataTables';
import { formatBRL, itensAtivos, restante, total as totalDaComanda } from './tabMath';

export const DEMO_STEPS = [
  { view: 'overview' as AppView, title: 'VISÃO GERAL', desc: 'Indicadores e pedidos do dia' },
  { view: 'pos' as AppView, title: 'NOVO PEDIDO', desc: 'Registrando pedido #045 para TONNY' },
  { view: 'pos' as AppView, title: 'CARRINHO PREENCHIDO', desc: 'Matcha Latte + Filtrado + Cookie adicionados' },
  { view: 'pos' as AppView, title: 'PEDIDO CONFIRMADO', desc: '#045 enviado para a produção' },
  { view: 'production' as AppView, title: 'BARISTA RECEBE', desc: '#045 aparece em LARGADA' },
  { view: 'production' as AppView, title: 'EM PREPARO', desc: 'Barista inicia — timer começa a contar' },
  { view: 'production' as AppView, title: 'PEDIDO PRONTO', desc: '#045 marcado como pronto — vai para CHEGADA' },
  { view: 'pickup' as AppView, title: 'PAINEL DE RETIRADA', desc: 'TONNY vê o pedido pronto na TV' },
  { view: 'overview' as AppView, title: 'VENDA REGISTRADA', desc: 'Indicadores do dia atualizados' },
];

interface AppContextType {
  view: AppView;
  orders: Order[];
  menuItems: MenuItem[];
  demoMode: boolean;
  demoStep: number;
  toast: string | null;
  setView: (v: AppView) => void;
  advanceOrderStatus: (orderId: number) => void;
  addOrder: (order: Order) => void;
  toggleMenuAvailability: (itemId: string) => void;
  startDemo: () => void;
  stopDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  showToast: (msg: string) => void;

  // ─── Mesas e Comandas ───
  tables: CafeTable[];
  /** Quando preenchido, o PDV lança na comanda desta mesa em vez de abrir um pedido avulso. */
  posTarget: PosTarget | null;
  setPosTarget: (t: PosTarget | null) => void;
  openTab: (tableId: string, dados: { customer: string; people: number; note?: string }) => void;
  addItemsToTab: (tableId: string, items: TabItem[]) => void;
  transferTable: (fromId: string, toId: string) => void;
  mergeTables: (hostId: string, guestId: string) => void;
  unmergeTable: (hostId: string, guestId: string) => void;
  registerPayment: (tableId: string, method: TabPaymentMethod, amount: number) => void;
  cancelTabItems: (tableId: string, itemIds: string[], reason: string, note?: string) => void;
  applyDiscount: (tableId: string, discount: TabDiscount) => void;
  removeDiscount: (tableId: string) => void;
  updateTabCustomer: (tableId: string, customer: string, people: number) => void;
  requestPayment: (tableId: string) => void;
  closeTab: (tableId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<AppView>('overview');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [demoMode, setDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tables, setTables] = useState<CafeTable[]>(INITIAL_TABLES);
  const [posTarget, setPosTarget] = useState<PosTarget | null>(null);
  const seqRef = useRef(0);
  const novoId = (prefixo: string) => `${prefixo}${Date.now().toString(36)}${++seqRef.current}`;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const advanceOrderStatus = useCallback((orderId: number) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const next: OrderStatus =
          o.status === 'new' ? 'preparing' : o.status === 'preparing' ? 'ready' : 'picked_up';
        return {
          ...o,
          status: next,
          startedAt: next === 'preparing' ? new Date() : o.startedAt,
          readyAt: next === 'ready' ? new Date() : o.readyAt,
        };
      })
    );
  }, []);

  const addOrder = useCallback(
    (order: Order) => {
      setOrders(prev => [...prev, order]);
      showToast(`PEDIDO #0${order.id} REGISTRADO`);
    },
    [showToast]
  );

  const toggleMenuAvailability = useCallback((itemId: string) => {
    setMenuItems(prev => prev.map(item => (item.id === itemId ? { ...item, available: !item.available } : item)));
  }, []);

  // ─── Mesas e Comandas ───────────────────────────────────────────────────────

  /** Aplica uma transformação na comanda de uma mesa, deixando as outras intactas. */
  const patchTab = useCallback((tableId: string, fn: (tab: Tab, table: CafeTable) => Partial<CafeTable>) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId && t.tab ? { ...t, ...fn(t.tab, t) } : t))
    );
  }, []);

  const registrar = (tab: Tab, texto: string): TimelineEntry[] => [
    ...tab.timeline,
    { id: `tl${Date.now()}${Math.random().toString(36).slice(2, 6)}`, at: new Date(), text: texto },
  ];

  const openTab = useCallback(
    (tableId: string, dados: { customer: string; people: number; note?: string }) => {
      const nome = (dados.customer || 'CLIENTE').toUpperCase();
      setTables(prev =>
        prev.map(t =>
          t.id === tableId
            ? {
                ...t,
                status: 'occupied',
                tab: {
                  id: novoId('c'),
                  customer: nome,
                  people: dados.people,
                  note: dados.note,
                  openedAt: new Date(),
                  items: [],
                  payments: [],
                  timeline: [{ id: novoId('tl'), at: new Date(), text: 'Comanda aberta' }],
                },
              }
            : t
        )
      );
      const mesa = INITIAL_TABLES.find(t => t.id === tableId);
      showToast(`COMANDA ABERTA — ${mesa?.label ?? 'MESA'}`);
    },
    [showToast]
  );

  /**
   * Lança itens na comanda e, no mesmo gesto, cria o pedido que o KDS recebe.
   * O barista não precisa saber de mesas: para ele é só mais um pedido, com a
   * mesa no lugar do nome para saber onde entregar.
   */
  const addItemsToTab = useCallback(
    (tableId: string, items: TabItem[]) => {
      if (items.length === 0) return;
      let mesa: CafeTable | undefined;

      setTables(prev =>
        prev.map(t => {
          if (t.id !== tableId || !t.tab) return t;
          mesa = t;
          const resumo = items.map(i => `${i.quantity} × ${i.name}`).join(', ');
          return {
            ...t,
            tab: {
              ...t.tab,
              items: [...t.tab.items, ...items],
              timeline: registrar(t.tab, `${resumo} adicionados`),
            },
          };
        })
      );

      if (mesa) {
        const label = mesa.label;
        const cliente = mesa.tab?.customer ?? 'CLIENTE';
        setOrders(prev => {
          const id = Math.max(...prev.map(o => o.id), 44) + 1;
          const pedido: Order = {
            id,
            customer: cliente,
            tableLabel: label,
            items: items.map(i => ({
              id: i.id,
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              customizations: i.customizations,
            })),
            status: 'new',
            consumption: 'local',
            payment: 'pix',
            total: items.reduce((s, i) => s + i.price * i.quantity, 0),
            createdAt: new Date(),
          };
          return [...prev, pedido];
        });
        showToast(`ITENS LANÇADOS — ${label}`);
      }
    },
    [showToast]
  );

  const transferTable = useCallback(
    (fromId: string, toId: string) => {
      setTables(prev => {
        const origem = prev.find(t => t.id === fromId);
        const destino = prev.find(t => t.id === toId);
        if (!origem?.tab || !destino) return prev;
        const tabMovida: Tab = {
          ...origem.tab,
          timeline: registrar(origem.tab, `Comanda transferida da ${origem.label} para a ${destino.label}`),
        };
        return prev.map(t => {
          if (t.id === fromId) return { ...t, status: 'free', tab: undefined, mergedWith: undefined };
          if (t.id === toId) return { ...t, status: origem.status, tab: tabMovida };
          return t;
        });
      });
      const destino = tables.find(t => t.id === toId);
      showToast(`COMANDA TRANSFERIDA PARA ${destino?.label ?? 'A MESA'}`);
    },
    [showToast, tables]
  );

  /**
   * Juntar mesas: a anfitriã concentra a comanda e a convidada passa a apontar
   * para ela. Se a convidada tinha comanda, os itens são incorporados.
   */
  const mergeTables = useCallback(
    (hostId: string, guestId: string) => {
      setTables(prev => {
        const host = prev.find(t => t.id === hostId);
        const guest = prev.find(t => t.id === guestId);
        if (!host?.tab || !guest) return prev;
        const itensDoConvidado = guest.tab ? guest.tab.items : [];
        const pagamentosDoConvidado = guest.tab ? guest.tab.payments : [];
        const novoTab: Tab = {
          ...host.tab,
          people: host.tab.people + (guest.tab?.people ?? 0),
          items: [...host.tab.items, ...itensDoConvidado],
          payments: [...host.tab.payments, ...pagamentosDoConvidado],
          timeline: registrar(host.tab, `${guest.label} juntada à comanda`),
        };
        return prev.map(t => {
          if (t.id === hostId)
            return { ...t, tab: novoTab, mergedWith: [...(t.mergedWith ?? []), guestId] };
          if (t.id === guestId)
            return { ...t, status: 'occupied', tab: undefined, mergedInto: hostId };
          return t;
        });
      });
      const host = tables.find(t => t.id === hostId);
      const guest = tables.find(t => t.id === guestId);
      showToast(`${host?.label ?? ''} + ${guest?.label.replace(/\D+/g, '') ?? ''} JUNTADAS`);
    },
    [showToast, tables]
  );

  const unmergeTable = useCallback((hostId: string, guestId: string) => {
    setTables(prev =>
      prev.map(t => {
        if (t.id === hostId) return { ...t, mergedWith: (t.mergedWith ?? []).filter(id => id !== guestId) };
        if (t.id === guestId) return { ...t, status: 'free', mergedInto: undefined };
        return t;
      })
    );
  }, []);

  const registerPayment = useCallback(
    (tableId: string, method: TabPaymentMethod, amount: number) => {
      patchTab(tableId, tab => {
        const novoTab: Tab = {
          ...tab,
          payments: [...tab.payments, { id: novoId('pg'), method, amount, at: new Date() }],
          timeline: registrar(
            tab,
            `Pagamento — ${PAYMENT_METHOD_LABELS[method]} — ${formatBRL(amount)}`
          ),
        };
        // Quitou tudo: a mesa passa a aguardar o encerramento da comanda.
        return restante(novoTab) <= 0
          ? { tab: novoTab, status: 'awaiting_payment' as const }
          : { tab: novoTab };
      });
      showToast(`PAGAMENTO REGISTRADO — ${formatBRL(amount)}`);
    },
    [patchTab, showToast]
  );

  const cancelTabItems = useCallback(
    (tableId: string, itemIds: string[], reason: string, note?: string) => {
      patchTab(tableId, tab => {
        const nomes = tab.items.filter(i => itemIds.includes(i.id)).map(i => `${i.quantity} × ${i.name}`);
        return {
          tab: {
            ...tab,
            items: tab.items.map(i =>
              itemIds.includes(i.id) && !i.cancellation
                ? { ...i, cancellation: { reason, note, at: new Date() } }
                : i
            ),
            timeline: registrar(tab, `${nomes.join(', ')} cancelados — ${reason}`),
          },
        };
      });
      showToast('ITENS CANCELADOS');
    },
    [patchTab, showToast]
  );

  const applyDiscount = useCallback(
    (tableId: string, discount: TabDiscount) => {
      patchTab(tableId, tab => ({
        tab: {
          ...tab,
          discount,
          timeline: registrar(
            tab,
            `Desconto de ${discount.kind === 'percent' ? `${discount.amount}%` : formatBRL(discount.amount)} — ${discount.reason}`
          ),
        },
      }));
      showToast('DESCONTO APLICADO');
    },
    [patchTab, showToast]
  );

  const removeDiscount = useCallback(
    (tableId: string) => {
      patchTab(tableId, tab => ({
        tab: { ...tab, discount: undefined, timeline: registrar(tab, 'Desconto removido') },
      }));
    },
    [patchTab]
  );

  const updateTabCustomer = useCallback(
    (tableId: string, customer: string, people: number) => {
      patchTab(tableId, tab => ({
        tab: {
          ...tab,
          customer: (customer || 'CLIENTE').toUpperCase(),
          people,
          timeline: registrar(tab, 'Dados do cliente atualizados'),
        },
      }));
    },
    [patchTab]
  );

  const requestPayment = useCallback(
    (tableId: string) => {
      patchTab(tableId, tab => ({ status: 'awaiting_payment', tab: { ...tab, timeline: registrar(tab, 'Conta solicitada') } }));
    },
    [patchTab]
  );

  const closeTab = useCallback(
    (tableId: string) => {
      let label = 'MESA';
      setTables(prev => {
        const alvo = prev.find(t => t.id === tableId);
        if (alvo) label = alvo.label;
        const juntadas = alvo?.mergedWith ?? [];
        return prev.map(t => {
          if (t.id === tableId) return { ...t, status: 'free', tab: undefined, mergedWith: undefined };
          // Libera junto as mesas que estavam grudadas nesta.
          if (juntadas.includes(t.id)) return { ...t, status: 'free', tab: undefined, mergedInto: undefined };
          return t;
        });
      });
      showToast(`${label} LIBERADA`);
    },
    [showToast]
  );

  const startDemo = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setMenuItems(MENU_ITEMS);
    setTables(INITIAL_TABLES);
    setPosTarget(null);
    setDemoMode(true);
    setDemoStep(0);
    setView('overview');
  }, []);

  const stopDemo = useCallback(() => {
    setDemoMode(false);
    setDemoStep(0);
  }, []);

  const nextDemoStep = useCallback(() => {
    setDemoStep(prev => {
      const next = Math.min(prev + 1, DEMO_STEPS.length - 1);
      setView(DEMO_STEPS[next].view);

      if (next === 3) {
        setOrders(current => {
          if (current.find(o => o.id === 45)) return current;
          return [...current, { ...DEMO_ORDER, createdAt: new Date() }];
        });
      }
      if (next === 5) {
        setOrders(current =>
          current.map(o => (o.id === 45 ? { ...o, status: 'preparing', startedAt: new Date() } : o))
        );
      }
      if (next === 6 || next === 7) {
        setOrders(current =>
          current.map(o => (o.id === 45 ? { ...o, status: 'ready', readyAt: new Date() } : o))
        );
      }
      return next;
    });
  }, []);

  const prevDemoStep = useCallback(() => {
    setDemoStep(prev => {
      const next = Math.max(prev - 1, 0);
      setView(DEMO_STEPS[next].view);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        view, orders, menuItems, demoMode, demoStep, toast,
        setView, advanceOrderStatus, addOrder, toggleMenuAvailability,
        startDemo, stopDemo, nextDemoStep, prevDemoStep, showToast,
        tables, posTarget, setPosTarget,
        openTab, addItemsToTab, transferTable, mergeTables, unmergeTable,
        registerPayment, cancelTabItems, applyDiscount, removeDiscount,
        updateTabCustomer, requestPayment, closeTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
