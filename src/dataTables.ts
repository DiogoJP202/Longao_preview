import type {
  AreaId,
  CafeTable,
  TabItem,
  TabPaymentMethod,
  TableStatus,
  TimelineEntry,
} from './types';

export const AREAS: { id: AreaId; label: string; setor: string }[] = [
  { id: 'salao', label: 'Salão', setor: 'SETOR 01' },
  { id: 'jardim', label: 'Jardim', setor: 'SETOR 02' },
  { id: 'balcao', label: 'Balcão', setor: 'SETOR 03' },
  { id: 'externa', label: 'Externa', setor: 'SETOR 04' },
];

export const CANCEL_REASONS = [
  'Cliente desistiu',
  'Item lançado incorretamente',
  'Produto indisponível',
  'Cortesia',
  'Outro',
];

export const DISCOUNT_REASONS = ['Cortesia', 'Cliente recorrente', 'Evento', 'Funcionário', 'Outro'];

export const PAYMENT_METHOD_LABELS: Record<TabPaymentMethod, string> = {
  pix: 'PIX',
  credit: 'Cartão de crédito',
  debit: 'Cartão de débito',
  cash: 'Dinheiro',
};

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  free: 'Livre',
  occupied: 'Ocupada',
  awaiting_payment: 'Pagamento',
  reserved: 'Reservada',
};

/** Quem aparece como responsável nos descontos — no protótipo é fixo. */
export const OPERADOR = 'Flavia';

const min = (m: number) => new Date(Date.now() - m * 60000);

let tabItemSeq = 0;
function item(
  productId: string,
  name: string,
  price: number,
  quantity: number,
  customizations: string[],
  minutesAgo: number
): TabItem {
  return {
    id: `ti${++tabItemSeq}`,
    productId,
    name,
    price,
    quantity,
    customizations,
    addedAt: min(minutesAgo),
  };
}

let timelineSeq = 0;
const ev = (minutesAgo: number, text: string): TimelineEntry => ({
  id: `tl${++timelineSeq}`,
  at: min(minutesAgo),
  text,
});

export const INITIAL_TABLES: CafeTable[] = [
  // ─── SALÃO ───
  { id: 't01', label: 'MESA 01', area: 'salao', shape: 'round', seats: 2, status: 'free' },
  {
    id: 't02',
    label: 'MESA 02',
    area: 'salao',
    shape: 'round',
    seats: 2,
    status: 'occupied',
    tab: {
      id: 'c02',
      customer: 'GABRIEL',
      people: 2,
      openedAt: min(34),
      items: [
        item('matcha_latte', 'Matcha Latte', 24, 1, ['Integral', 'Quente'], 32),
        item('cappuccino', 'Cappuccino', 16, 1, ['Regular', 'Aveia'], 32),
        item('cookie', 'Cookie', 12, 1, [], 20),
      ],
      payments: [],
      timeline: [
        ev(34, 'Comanda aberta'),
        ev(32, '1 × Matcha Latte e 1 × Cappuccino adicionados'),
        ev(20, '1 × Cookie adicionado'),
      ],
    },
  },
  { id: 't03', label: 'MESA 03', area: 'salao', shape: 'square', seats: 4, status: 'reserved' },
  {
    id: 't04',
    label: 'MESA 04',
    area: 'salao',
    shape: 'square',
    seats: 4,
    status: 'occupied',
    tab: {
      id: 'c04',
      customer: 'FLAVIA',
      people: 3,
      openedAt: min(84),
      items: [
        item('matcha_latte', 'Matcha Latte', 19, 2, ['Aveia', 'Gelado'], 82),
        item('filtrado', 'Filtrado', 18, 1, ['V60', 'Brasil / Sul de Minas'], 82),
        item('cookie', 'Cookie', 9, 2, [], 60),
        item('pao_queijo', 'Pão de Queijo', 10.5, 1, [], 38),
      ],
      payments: [],
      timeline: [
        ev(84, 'Comanda aberta'),
        ev(82, '2 × Matcha Latte e 1 × Filtrado adicionados'),
        ev(78, 'Pedido enviado para produção'),
        ev(72, 'Pedido entregue'),
        ev(60, '2 × Cookie adicionados'),
        ev(38, '1 × Pão de Queijo adicionado'),
      ],
    },
  },
  {
    id: 't05',
    label: 'MESA 05',
    area: 'salao',
    shape: 'communal',
    seats: 8,
    status: 'occupied',
    tab: {
      id: 'c05',
      customer: 'TONNY',
      people: 2,
      openedAt: min(42),
      items: [
        item('filtrado', 'Filtrado', 18, 2, ['Origami', 'Guest Coffee'], 40),
        item('sanduiche', 'Sanduíche', 26, 1, [], 25),
      ],
      payments: [],
      timeline: [
        ev(42, 'Comanda aberta'),
        ev(40, '2 × Filtrado adicionados'),
        ev(25, '1 × Sanduíche adicionado'),
      ],
    },
  },

  // ─── JARDIM ───
  {
    id: 't06',
    label: 'MESA 06',
    area: 'jardim',
    shape: 'round',
    seats: 2,
    status: 'occupied',
    tab: {
      id: 'c06',
      customer: 'BRUNO',
      people: 2,
      openedAt: min(19),
      items: [
        item('cold_brew', 'Cold Brew', 20, 2, [], 18),
        item('cinnamon', 'Cinnamon Roll', 16, 1, [], 18),
      ],
      payments: [],
      timeline: [ev(19, 'Comanda aberta'), ev(18, '2 × Cold Brew e 1 × Cinnamon Roll adicionados')],
    },
  },
  {
    id: 't07',
    label: 'MESA 07',
    area: 'jardim',
    shape: 'square',
    seats: 4,
    status: 'awaiting_payment',
    tab: {
      id: 'c07',
      customer: 'MARINA',
      people: 4,
      openedAt: min(68),
      items: [
        item('matcha_latte', 'Matcha Latte', 24, 2, ['Aveia', 'Gelado'], 66),
        item('espresso', 'Espresso', 8, 2, ['Duplo'], 66),
        item('cheesecake_choco', 'Cheesecake de Chocolate', 22, 2, [], 40),
        item('roll_queijo', 'Roll de Queijo', 14, 1, [], 40),
      ],
      payments: [],
      timeline: [
        ev(68, 'Comanda aberta'),
        ev(66, 'Bebidas adicionadas'),
        ev(40, 'Sobremesas adicionadas'),
        ev(4, 'Conta solicitada'),
      ],
    },
  },
  {
    id: 't08',
    label: 'MESA 08',
    area: 'jardim',
    shape: 'square',
    seats: 4,
    status: 'occupied',
    tab: {
      id: 'c08',
      customer: 'LUCAS',
      people: 1,
      openedAt: min(16),
      items: [
        item('latte', 'Latte', 18, 1, ['Grande', 'Aveia'], 15),
        item('pao_queijo', 'Pão de Queijo', 8, 1, [], 15),
      ],
      payments: [],
      timeline: [ev(16, 'Comanda aberta'), ev(15, '1 × Latte e 1 × Pão de Queijo adicionados')],
    },
  },

  // ─── BALCÃO ───
  {
    id: 'b01',
    label: 'BALCÃO 01',
    area: 'balcao',
    shape: 'counter',
    seats: 1,
    status: 'occupied',
    tab: {
      id: 'cb01',
      customer: 'RAFA',
      people: 1,
      openedAt: min(11),
      items: [item('espresso', 'Espresso', 8, 1, ['Simples'], 10)],
      payments: [],
      timeline: [ev(11, 'Comanda aberta'), ev(10, '1 × Espresso adicionado')],
    },
  },
  { id: 'b02', label: 'BALCÃO 02', area: 'balcao', shape: 'counter', seats: 1, status: 'free' },
  {
    id: 'b03',
    label: 'BALCÃO 03',
    area: 'balcao',
    shape: 'counter',
    seats: 1,
    status: 'awaiting_payment',
    tab: {
      id: 'cb03',
      customer: 'HELENA',
      people: 1,
      openedAt: min(29),
      items: [
        item('flat_white', 'Flat White', 18, 1, ['Integral'], 28),
        item('cookie', 'Cookie', 12, 1, [], 28),
      ],
      payments: [],
      timeline: [ev(29, 'Comanda aberta'), ev(28, 'Itens adicionados'), ev(2, 'Conta solicitada')],
    },
  },

  // ─── ÁREA EXTERNA ───
  {
    id: 't09',
    label: 'MESA 09',
    area: 'externa',
    shape: 'round',
    seats: 2,
    status: 'occupied',
    tab: {
      id: 'c09',
      customer: 'CAIO',
      people: 2,
      openedAt: min(52),
      items: [
        item('mate_limao', 'Mate com Limão', 16, 2, [], 50),
        item('cheesecake_choco', 'Cheesecake de Chocolate', 22, 1, [], 30),
      ],
      payments: [],
      timeline: [
        ev(52, 'Comanda aberta'),
        ev(50, '2 × Mate com Limão adicionados'),
        ev(30, 'Sobremesa adicionada'),
      ],
    },
  },
  { id: 't10', label: 'MESA 10', area: 'externa', shape: 'round', seats: 2, status: 'free' },
  {
    id: 't11',
    label: 'MESA 11',
    area: 'externa',
    shape: 'square',
    seats: 4,
    status: 'awaiting_payment',
    tab: {
      id: 'c11',
      customer: 'ISA',
      people: 3,
      openedAt: min(75),
      items: [
        item('iced_latte', 'Iced Latte', 22, 2, ['Aveia'], 73),
        item('matcha', 'Matcha', 20, 1, ['Gelado'], 73),
        item('cinnamon', 'Cinnamon Roll', 16, 2, [], 45),
      ],
      payments: [{ id: 'pg1', method: 'pix', amount: 40, at: min(6) }],
      timeline: [
        ev(75, 'Comanda aberta'),
        ev(73, 'Bebidas adicionadas'),
        ev(45, '2 × Cinnamon Roll adicionados'),
        ev(6, 'Pagamento parcial — PIX — R$ 40,00'),
      ],
    },
  },
  {
    id: 't12',
    label: 'MESA 12',
    area: 'externa',
    shape: 'communal',
    seats: 6,
    status: 'occupied',
    tab: {
      id: 'c12',
      customer: 'EQUIPE CORRIDA',
      people: 5,
      openedAt: min(26),
      items: [
        item('mate_limao', 'Mate com Limão', 16, 3, [], 24),
        item('pao_queijo', 'Pão de Queijo', 8, 4, [], 24),
      ],
      payments: [],
      timeline: [ev(26, 'Comanda aberta'), ev(24, 'Pedido do grupo adicionado')],
    },
  },
];
