export type OrderStatus = 'new' | 'preparing' | 'ready' | 'picked_up';
export type ConsumptionType = 'local' | 'takeaway';
export type PaymentType = 'pix' | 'card' | 'cash';
export type AppView = 'overview' | 'pos' | 'production' | 'pickup' | 'mobile' | 'menu' | 'reports';

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
