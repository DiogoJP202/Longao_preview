import type { CafeTable, Tab, TabItem } from './types';

/** Itens que ainda contam para a conta — cancelados ficam visíveis, mas não somam. */
export function itensAtivos(tab: Tab): TabItem[] {
  return tab.items.filter(i => !i.cancellation);
}

export function subtotal(tab: Tab): number {
  return itensAtivos(tab).reduce((s, i) => s + i.price * i.quantity, 0);
}

export function valorDoDesconto(tab: Tab): number {
  const d = tab.discount;
  if (!d) return 0;
  // Desconto de item incide só sobre aquela linha; sem item, sobre a conta toda.
  const alvo = d.itemId ? itensAtivos(tab).find(i => i.id === d.itemId) : null;
  if (d.itemId && !alvo) return 0; // o item foi cancelado depois
  const base = alvo ? alvo.price * alvo.quantity : subtotal(tab);
  const bruto = d.kind === 'percent' ? (base * d.amount) / 100 : d.amount;
  // Nunca deixa o desconto ultrapassar a base sobre a qual incide.
  return Math.min(Math.max(bruto, 0), base);
}

export function total(tab: Tab): number {
  return subtotal(tab) - valorDoDesconto(tab);
}

export function pago(tab: Tab): number {
  return tab.payments.reduce((s, p) => s + p.amount, 0);
}

export function restante(tab: Tab): number {
  // Arredonda para o centavo, senão sobra resíduo de ponto flutuante e a
  // comanda nunca chega exatamente a zero.
  return Math.max(0, Math.round((total(tab) - pago(tab)) * 100) / 100);
}

export function totalDaMesa(table: CafeTable): number {
  return table.tab ? total(table.tab) : 0;
}

export function restanteDaMesa(table: CafeTable): number {
  return table.tab ? restante(table.tab) : 0;
}

export function formatBRL(v: number): string {
  return `R$ ${v.toFixed(2).replace('.', ',')}`;
}

/** Cronômetro da comanda, no formato de prova: MM:SS até 1h, depois HH:MM:SS. */
export function formatDuracao(desde: Date, agora: number = Date.now()): string {
  const s = Math.max(0, Math.floor((agora - desde.getTime()) / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  const dois = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${dois(h)}:${dois(m)}:${dois(seg)}` : `${dois(m)}:${dois(seg)}`;
}

export function formatHora(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
