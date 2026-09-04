import type { CafeTable, Order, TabPaymentMethod } from './types';
import { MENU_ITEMS, HOURLY_DATA, TOP_PRODUCTS } from './data';
import { itensAtivos, pago, restante } from './tabMath';

/**
 * Movimento do dia antes desta sessão. É a única parte simulada dos números —
 * tudo o mais é calculado dos pedidos e das comandas em memória, para que os
 * indicadores se mexam de verdade quando alguém clica durante a apresentação.
 */
export const BASE_DIA = {
  pedidos: 123,
  faturamento: 3284.5,
  tempoMedioSeg: 402, // 06:42
  amostrasDeTempo: 96,
  porHora: HOURLY_DATA,
  produtos: TOP_PRODUCTS,
  pagamentos: { pix: 71, credit: 24, debit: 14, cash: 14 } as Record<TabPaymentMethod, number>,
  categorias: {
    espresso: 1150,
    filtrado: 620,
    gelado: 380,
    matcha: 640,
    comida: 320,
    doce: 174.5,
  } as Record<string, number>,
};

const categoriaDe = (productId: string) => MENU_ITEMS.find(m => m.id === productId)?.category ?? 'outros';

export interface ResumoDoDia {
  pedidosHoje: number;
  emPreparo: number;
  novos: number;
  prontos: number;
  tempoMedioSeg: number;
  faturamento: number;
  ticketMedio: number;

  // Salão
  mesasTotal: number;
  mesasOcupadas: number;
  mesasLivres: number;
  mesasReservadas: number;
  mesasAguardandoPagamento: number;
  comandasAbertas: number;
  totalEmAberto: number;
  pessoasNoSalao: number;
  permanenciaMediaSeg: number;

  topProdutos: { name: string; count: number; revenue: number }[];
  porHora: { hour: string; count: number; atual: boolean }[];
  picoHora: string;
  picoQtd: number;
  pagamentos: { metodo: TabPaymentMethod; qtd: number; pct: number }[];
  categorias: { id: string; valor: number; pct: number }[];
}

/**
 * Regra de faturamento, para não contar a mesma venda duas vezes:
 * pedido de balcão entra quando fica pronto; consumo de mesa entra só quando
 * a comanda recebe pagamento — porque o pedido de mesa e a comanda descrevem
 * o mesmo item.
 */
export function calcularResumo(orders: Order[], tables: CafeTable[], agora = Date.now()): ResumoDoDia {
  const deBalcao = orders.filter(o => !o.tableLabel);
  const balcaoFaturado = deBalcao.filter(o => o.status === 'ready' || o.status === 'picked_up');

  const comandas = tables.map(t => t.tab).filter((t): t is NonNullable<typeof t> => !!t);
  const recebidoEmMesas = comandas.reduce((s, t) => s + pago(t), 0);

  const faturamento =
    BASE_DIA.faturamento + balcaoFaturado.reduce((s, o) => s + o.total, 0) + recebidoEmMesas;

  const pedidosHoje = BASE_DIA.pedidos + orders.length;

  // Tempo médio de preparo: média ponderada entre a base do dia e o que foi
  // medido de verdade no KDS, para o número se mexer sem pular a cada pedido.
  const medidos = orders
    .filter(o => o.startedAt && o.readyAt)
    .map(o => (o.readyAt!.getTime() - o.startedAt!.getTime()) / 1000);
  const somaMedida = medidos.reduce((s, v) => s + v, 0);
  const tempoMedioSeg = Math.round(
    (BASE_DIA.tempoMedioSeg * BASE_DIA.amostrasDeTempo + somaMedida) /
      (BASE_DIA.amostrasDeTempo + medidos.length)
  );

  // ─── Salão ───
  const ocupadas = tables.filter(t => t.status === 'occupied').length;
  const aguardando = tables.filter(t => t.status === 'awaiting_payment').length;
  const permanencias = comandas.map(t => (agora - t.openedAt.getTime()) / 1000);
  const permanenciaMediaSeg = permanencias.length
    ? Math.round(permanencias.reduce((s, v) => s + v, 0) / permanencias.length)
    : 0;

  // ─── Ranking de produtos ───
  const ranking = new Map<string, { name: string; count: number; revenue: number }>();
  const somar = (name: string, qtd: number, valor: number) => {
    const atual = ranking.get(name) ?? { name, count: 0, revenue: 0 };
    atual.count += qtd;
    atual.revenue += valor;
    ranking.set(name, atual);
  };
  BASE_DIA.produtos.forEach(p => somar(p.name, p.count, p.revenue));
  deBalcao.forEach(o => o.items.forEach(i => somar(i.name, i.quantity, i.price * i.quantity)));
  comandas.forEach(t => itensAtivos(t).forEach(i => somar(i.name, i.quantity, i.price * i.quantity)));
  const topProdutos = [...ranking.values()].sort((a, b) => b.count - a.count);

  // ─── Movimento por hora ───
  const horaAtual = new Date(agora).getHours();
  const rotuloAtual = `${String(horaAtual).padStart(2, '0')}h`;
  const porHoraMap = new Map(BASE_DIA.porHora.map(h => [h.hour, h.count]));
  orders.forEach(o => {
    const r = `${String(o.createdAt.getHours()).padStart(2, '0')}h`;
    porHoraMap.set(r, (porHoraMap.get(r) ?? 0) + 1);
  });
  const porHora = [...porHoraMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([hour, count]) => ({ hour, count, atual: hour === rotuloAtual }));
  const pico = porHora.reduce((a, b) => (b.count > a.count ? b : a), porHora[0]);

  // ─── Formas de pagamento ───
  const pagCount: Record<TabPaymentMethod, number> = { ...BASE_DIA.pagamentos };
  balcaoFaturado.forEach(o => {
    const m: TabPaymentMethod = o.payment === 'card' ? 'credit' : o.payment;
    pagCount[m] += 1;
  });
  comandas.forEach(t => t.payments.forEach(p => (pagCount[p.method] += 1)));
  const totalPag = Object.values(pagCount).reduce((s, v) => s + v, 0) || 1;
  const pagamentos = (Object.keys(pagCount) as TabPaymentMethod[])
    .map(metodo => ({ metodo, qtd: pagCount[metodo], pct: Math.round((pagCount[metodo] / totalPag) * 100) }))
    .sort((a, b) => b.qtd - a.qtd);

  // ─── Faturamento por categoria ───
  const catValor: Record<string, number> = { ...BASE_DIA.categorias };
  const somarCat = (productId: string, valor: number) => {
    const c = categoriaDe(productId);
    catValor[c] = (catValor[c] ?? 0) + valor;
  };
  balcaoFaturado.forEach(o => o.items.forEach(i => somarCat(i.productId, i.price * i.quantity)));
  comandas.forEach(t => itensAtivos(t).forEach(i => somarCat(i.productId, i.price * i.quantity)));
  const totalCat = Object.values(catValor).reduce((s, v) => s + v, 0) || 1;
  const categorias = Object.entries(catValor)
    .map(([id, valor]) => ({ id, valor, pct: Math.round((valor / totalCat) * 100) }))
    .sort((a, b) => b.valor - a.valor);

  return {
    pedidosHoje,
    emPreparo: orders.filter(o => o.status === 'preparing').length,
    novos: orders.filter(o => o.status === 'new').length,
    prontos: orders.filter(o => o.status === 'ready').length,
    tempoMedioSeg,
    faturamento,
    ticketMedio: faturamento / Math.max(1, pedidosHoje),

    mesasTotal: tables.length,
    mesasOcupadas: ocupadas,
    mesasLivres: tables.filter(t => t.status === 'free').length,
    mesasReservadas: tables.filter(t => t.status === 'reserved').length,
    mesasAguardandoPagamento: aguardando,
    comandasAbertas: comandas.length,
    totalEmAberto: comandas.reduce((s, t) => s + restante(t), 0),
    pessoasNoSalao: comandas.reduce((s, t) => s + t.people, 0),
    permanenciaMediaSeg,

    topProdutos,
    porHora,
    picoHora: pico?.hour ?? '—',
    picoQtd: pico?.count ?? 0,
    pagamentos,
    categorias,
  };
}

export function formatMinSeg(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = Math.round(seg % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
