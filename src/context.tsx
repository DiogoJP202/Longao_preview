import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Order, MenuItem, AppView, OrderStatus } from './types';
import { INITIAL_ORDERS, MENU_ITEMS, DEMO_ORDER } from './data';

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

  const startDemo = useCallback(() => {
    setOrders(INITIAL_ORDERS);
    setMenuItems(MENU_ITEMS);
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
