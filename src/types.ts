export type OrderStatus = 'new' | 'preparing' | 'ready' | 'picked_up';
export type ConsumptionType = 'local' | 'takeaway';
export type PaymentType = 'pix' | 'card' | 'cash';
export type AppView =
  | 'overview'
  | 'pos'
  | 'tables'
  | 'production'
  | 'pickup'
  | 'mobile'
  | 'menu'
  | 'reports';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  note?: string;
}

export interface Order {
  id: number;
  customer: string;
  items: OrderItem[];
  status: OrderStatus;
  consumption: ConsumptionType;
  payment: PaymentType;
  total: number;
  createdAt: Date;
  startedAt?: Date;
  readyAt?: Date;
  /** Preenchido quando o pedido nasce de uma comanda de mesa. O KDS mostra
      isto no lugar do nome, para o barista saber onde entregar. */
  tableLabel?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  available: boolean;
  isFilteredCoffee?: boolean;
}

export interface CustomizationOption {
  value: string;
  label: string;
}

export interface CustomizationGroup {
  id: string;
  label: string;
  type: 'single' | 'multi';
  defaultValue?: string;
  options: CustomizationOption[];
}

// ─── Mesas e Comandas ─────────────────────────────────────────────────────────

export type TableStatus = 'free' | 'occupied' | 'awaiting_payment' | 'reserved';
export type TableShape = 'round' | 'square' | 'communal' | 'counter';
export type AreaId = 'salao' | 'jardim' | 'balcao' | 'externa';
export type TabPaymentMethod = 'pix' | 'credit' | 'debit' | 'cash';
export type DiscountKind = 'percent' | 'value';

export interface TabItemCancellation {
  reason: string;
  note?: string;
  at: Date;
}

export interface TabItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  addedAt: Date;
  cancellation?: TabItemCancellation;
}

export interface TabPayment {
  id: string;
  method: TabPaymentMethod;
  amount: number;
  at: Date;
}

export interface TabDiscount {
  kind: DiscountKind;
  amount: number;
  reason: string;
  by: string;
  at: Date;
  /** Ausente = desconto na conta inteira. Preenchido = só naquele item. */
  itemId?: string;
}

export interface TimelineEntry {
  id: string;
  at: Date;
  text: string;
}

export interface Tab {
  id: string;
  customer: string;
  people: number;
  note?: string;
  openedAt: Date;
  items: TabItem[];
  payments: TabPayment[];
  discount?: TabDiscount;
  timeline: TimelineEntry[];
}

export interface CafeTable {
  id: string;
  label: string;
  area: AreaId;
  shape: TableShape;
  seats: number;
  status: TableStatus;
  tab?: Tab;
  /** Mesas absorvidas por esta quando o grupo é juntado. */
  mergedWith?: string[];
  /** Preenchido na mesa absorvida, apontando para a anfitriã. */
  mergedInto?: string;
}

/** Alvo do PDV quando ele é aberto a partir de uma comanda. */
export interface PosTarget {
  tableId: string;
  label: string;
}
