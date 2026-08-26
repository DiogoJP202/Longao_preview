import type { Order, MenuItem, CustomizationGroup } from './types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 41,
    customer: 'ANA',
    items: [
      { id: 'i41a', productId: 'filtrado', name: 'Filtrado', price: 18, quantity: 1, customizations: ['V60', 'Guest Coffee'] },
    ],
    status: 'ready',
    consumption: 'local',
    payment: 'pix',
    total: 18,
    createdAt: new Date(Date.now() - 28 * 60000),
    startedAt: new Date(Date.now() - 22 * 60000),
    readyAt: new Date(Date.now() - 12 * 60000),
  },
  {
    id: 42,
    customer: 'BIA',
    items: [
      { id: 'i42a', productId: 'espresso', name: 'Espresso', price: 8, quantity: 1, customizations: ['Duplo'] },
      { id: 'i42b', productId: 'cookie', name: 'Cookie', price: 12, quantity: 1, customizations: [] },
    ],
    status: 'preparing',
    consumption: 'local',
    payment: 'card',
    total: 20,
    createdAt: new Date(Date.now() - 9 * 60000),
    startedAt: new Date(Date.now() - 6 * 60000),
  },
  {
    id: 43,
    customer: 'GABRIEL',
    items: [
      { id: 'i43a', productId: 'matcha_latte', name: 'Matcha Latte', price: 24, quantity: 1, customizations: ['Integral', 'Quente'] },
    ],
    status: 'new',
    consumption: 'takeaway',
    payment: 'pix',
    total: 24,
    createdAt: new Date(Date.now() - 3 * 60000),
  },
  {
    id: 44,
    customer: 'LUCAS',
    items: [
      { id: 'i44a', productId: 'filtrado', name: 'Filtrado', price: 18, quantity: 1, customizations: ['Origami', 'Brasil / Sul de Minas'] },
      { id: 'i44b', productId: 'pao_queijo', name: 'Pão de Queijo', price: 8, quantity: 1, customizations: [] },
    ],
    status: 'new',
    consumption: 'local',
    payment: 'card',
    total: 26,
    createdAt: new Date(Date.now() - 90000),
  },
];

export const DEMO_ORDER: Order = {
  id: 45,
  customer: 'TONNY',
  items: [
    { id: 'd1', productId: 'matcha_latte', name: 'Matcha Latte', price: 24, quantity: 1, customizations: ['Aveia', 'Gelado'] },
    { id: 'd2', productId: 'filtrado', name: 'Filtrado', price: 18, quantity: 1, customizations: ['V60', 'Brasil / Sul de Minas'] },
    { id: 'd3', productId: 'cookie', name: 'Cookie', price: 12, quantity: 1, customizations: [] },
  ],
  status: 'new',
  consumption: 'local',
  payment: 'pix',
  total: 54,
  createdAt: new Date(),
};

export const MENU_ITEMS: MenuItem[] = [
  { id: 'espresso', name: 'Espresso', category: 'espresso', price: 8, available: true },
  { id: 'espresso_duplo', name: 'Espresso Duplo', category: 'espresso', price: 10, available: true },
  { id: 'cappuccino', name: 'Cappuccino', category: 'espresso', price: 16, available: true },
  { id: 'latte', name: 'Latte', category: 'espresso', price: 18, available: true },
  { id: 'flat_white', name: 'Flat White', category: 'espresso', price: 18, available: true },
  { id: 'filtrado', name: 'Filtrado', category: 'filtrado', price: 18, available: true, isFilteredCoffee: true },
  { id: 'cold_brew', name: 'Cold Brew', category: 'gelado', price: 20, available: true },
  { id: 'iced_latte', name: 'Iced Latte', category: 'gelado', price: 22, available: true },
  { id: 'mate_limao', name: 'Mate com Limão', category: 'gelado', price: 16, available: true },
  { id: 'matcha', name: 'Matcha', category: 'matcha', price: 20, available: true },
  { id: 'matcha_latte', name: 'Matcha Latte', category: 'matcha', price: 24, available: true },
  { id: 'cha_hibisco', name: 'Chá Hibisco / Maracujá', category: 'matcha', price: 15, available: true },
  { id: 'pao_queijo', name: 'Pão de Queijo', category: 'comida', price: 8, available: true },
  { id: 'roll_queijo', name: 'Roll de Queijo', category: 'comida', price: 14, available: true },
  { id: 'sanduiche', name: 'Sanduíche', category: 'comida', price: 26, available: true },
  { id: 'cookie', name: 'Cookie', category: 'doce', price: 12, available: true },
  { id: 'cinnamon', name: 'Cinnamon Roll', category: 'doce', price: 16, available: true },
  { id: 'cheesecake_choco', name: 'Cheesecake de Chocolate', category: 'doce', price: 22, available: true },
  { id: 'cheesecake_frutas', name: 'Cheesecake Frutas Vermelhas', category: 'doce', price: 22, available: false },
];

export const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'espresso', label: 'Espresso' },
  { id: 'filtrado', label: 'Filtrados' },
  { id: 'gelado', label: 'Gelados' },
  { id: 'matcha', label: 'Matcha & Chá' },
  { id: 'comida', label: 'Comidas' },
  { id: 'doce', label: 'Doces' },
];

export const CUSTOMIZATIONS: Record<string, CustomizationGroup[]> = {
  matcha_latte: [
    { id: 'size', label: 'Tamanho', type: 'single', defaultValue: 'Regular', options: [{ value: 'Regular', label: 'Regular' }, { value: 'Grande', label: 'Grande' }] },
    { id: 'milk', label: 'Leite', type: 'single', defaultValue: 'Integral', options: [{ value: 'Integral', label: 'Integral' }, { value: 'Sem lactose', label: 'Sem lactose' }, { value: 'Aveia', label: 'Aveia' }] },
    { id: 'temp', label: 'Temperatura', type: 'single', defaultValue: 'Quente', options: [{ value: 'Quente', label: 'Quente' }, { value: 'Gelado', label: 'Gelado' }] },
    { id: 'extras', label: 'Extras', type: 'multi', options: [{ value: 'Dose extra', label: '+ Dose extra' }, { value: 'Menos gelo', label: '+ Menos gelo' }] },
  ],
  matcha: [
    { id: 'temp', label: 'Temperatura', type: 'single', defaultValue: 'Quente', options: [{ value: 'Quente', label: 'Quente' }, { value: 'Gelado', label: 'Gelado' }] },
  ],
  cappuccino: [
    { id: 'size', label: 'Tamanho', type: 'single', defaultValue: 'Regular', options: [{ value: 'Regular', label: 'Regular' }, { value: 'Grande', label: 'Grande' }] },
    { id: 'milk', label: 'Leite', type: 'single', defaultValue: 'Integral', options: [{ value: 'Integral', label: 'Integral' }, { value: 'Sem lactose', label: 'Sem lactose' }, { value: 'Aveia', label: 'Aveia' }] },
  ],
  latte: [
    { id: 'size', label: 'Tamanho', type: 'single', defaultValue: 'Regular', options: [{ value: 'Regular', label: 'Regular' }, { value: 'Grande', label: 'Grande' }] },
    { id: 'milk', label: 'Leite', type: 'single', defaultValue: 'Integral', options: [{ value: 'Integral', label: 'Integral' }, { value: 'Sem lactose', label: 'Sem lactose' }, { value: 'Aveia', label: 'Aveia' }] },
    { id: 'temp', label: 'Temperatura', type: 'single', defaultValue: 'Quente', options: [{ value: 'Quente', label: 'Quente' }, { value: 'Gelado', label: 'Gelado' }] },
  ],
  flat_white: [
    { id: 'milk', label: 'Leite', type: 'single', defaultValue: 'Integral', options: [{ value: 'Integral', label: 'Integral' }, { value: 'Sem lactose', label: 'Sem lactose' }, { value: 'Aveia', label: 'Aveia' }] },
  ],
  espresso: [
    { id: 'shots', label: 'Dose', type: 'single', defaultValue: 'Simples', options: [{ value: 'Simples', label: 'Simples' }, { value: 'Duplo', label: 'Duplo' }] },
  ],
  iced_latte: [
    { id: 'milk', label: 'Leite', type: 'single', defaultValue: 'Integral', options: [{ value: 'Integral', label: 'Integral' }, { value: 'Sem lactose', label: 'Sem lactose' }, { value: 'Aveia', label: 'Aveia' }] },
    { id: 'extras', label: 'Extras', type: 'multi', options: [{ value: 'Menos gelo', label: '+ Menos gelo' }] },
  ],
};

export const FILTERED_COFFEE_BEANS = [
  { id: 'brasil', origin: 'Brasil — Sul de Minas', notes: 'Chocolate / Castanhas / Caramelo', altitude: '1.200m', process: 'Natural' },
  { id: 'guest', origin: 'Guest Coffee', notes: 'Floral / Cítrico / Frutas amarelas', altitude: 'Variável', process: 'Lavado' },
];

export const FILTERED_COFFEE_METHODS = [
  { id: 'v60', label: 'V60', recommended: true, note: 'Destaca acidez e clareza' },
  { id: 'origami', label: 'Origami', recommended: false, note: 'Versátil, corpo médio' },
  { id: 'clever', label: 'Clever', recommended: false, note: 'Corpo pleno, suave' },
  { id: 'hario_suiren', label: 'Hario Suiren', recommended: false, note: 'Delicado, floral' },
  { id: 'melitta', label: 'Melitta', recommended: false, note: 'Clássico, encorpado' },
  { id: 'flatbed', label: 'Flatbed', recommended: false, note: 'Uniforme, suave' },
];

export const HOURLY_DATA = [
  { hour: '07h', count: 4 }, { hour: '08h', count: 12 }, { hour: '09h', count: 18 },
  { hour: '10h', count: 22 }, { hour: '11h', count: 19 }, { hour: '12h', count: 16 },
  { hour: '13h', count: 14 }, { hour: '14h', count: 11 }, { hour: '15h', count: 7 },
  { hour: '16h', count: 4 },
];

export const TOP_PRODUCTS = [
  { name: 'Matcha Latte', count: 24, revenue: 576 },
  { name: 'Espresso', count: 21, revenue: 168 },
  { name: 'Filtrado', count: 18, revenue: 324 },
  { name: 'Cookie', count: 16, revenue: 192 },
  { name: 'Cappuccino', count: 14, revenue: 224 },
  { name: 'Latte', count: 11, revenue: 198 },
];
