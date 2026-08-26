import { useState, useCallback } from 'react';
import { X, Plus, Minus, Check, ChevronRight } from 'lucide-react';
import { useApp } from '../context';
import { CATEGORIES, MENU_ITEMS, CUSTOMIZATIONS, FILTERED_COFFEE_BEANS, FILTERED_COFFEE_METHODS } from '../data';
import type { OrderItem } from '../types';

interface CartItem extends OrderItem {}

let itemIdCounter = 100;

// ─── Filtered Coffee Panel ────────────────────────────────────────────────────
function FilteredCoffeePanel({
  onAdd,
  onClose,
}: {
  onAdd: (item: CartItem) => void;
  onClose: () => void;
}) {
  const [selectedBean, setSelectedBean] = useState(FILTERED_COFFEE_BEANS[0].id);
  const [selectedMethod, setSelectedMethod] = useState(FILTERED_COFFEE_METHODS[0].id);

  const bean = FILTERED_COFFEE_BEANS.find(b => b.id === selectedBean)!;
  const method = FILTERED_COFFEE_METHODS.find(m => m.id === selectedMethod)!;

  const handleAdd = () => {
    onAdd({
      id: String(++itemIdCounter),
      productId: 'filtrado',
      name: 'Filtrado',
      price: 18,
      quantity: 1,
      customizations: [method.label, bean.origin.split(' — ')[1] || bean.origin],
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto" style={{ background: '#E5E2DB' }}>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#625E57' }}>
              CAFÉ FILTRADO
            </div>
            <h2 className="font-display font-black text-4xl tracking-tight" style={{ color: '#1A1714' }}>
              FILTRADO
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
              R$ 18,00
            </span>
            <button onClick={onClose} className="p-2" style={{ color: '#625E57' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Bean selection */}
        <div className="mb-8">
          <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
            GRÃO DE ORIGEM
          </div>
          <div className="grid grid-cols-2 gap-3">
            {FILTERED_COFFEE_BEANS.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBean(b.id)}
                className="p-4 text-left border transition-all duration-150"
                style={{
                  borderColor: selectedBean === b.id ? '#DD3E22' : '#CEC8BC',
                  background: selectedBean === b.id ? '#F9E6E0' : 'transparent',
                }}
              >
                <div className="font-display font-bold text-base" style={{ color: '#1A1714' }}>
                  {b.origin}
                </div>
                <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#625E57' }}>
                  {b.notes}
                </div>
                <div className="flex gap-4 mt-2">
                  <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>
                    {b.altitude}
                  </span>
                  <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>
                    {b.process}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Method selection */}
        <div className="mb-8">
          <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
            MÉTODO DE PREPARO
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FILTERED_COFFEE_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className="p-3 text-left border transition-all duration-150 relative"
                style={{
                  borderColor: selectedMethod === m.id ? '#DD3E22' : '#CEC8BC',
                  background: selectedMethod === m.id ? '#F9E6E0' : 'transparent',
                }}
              >
                {m.recommended && (
                  <div
                    className="absolute top-0 right-0 font-mono text-[8px] tracking-widest px-1.5 py-0.5"
                    style={{ background: '#DD3E22', color: 'white' }}
                  >
                    ★ REC.
                  </div>
                )}
                <div className="font-display font-bold text-lg" style={{ color: '#1A1714' }}>
                  {m.label}
                </div>
                <div className="font-mono text-[9px] mt-0.5" style={{ color: '#625E57' }}>
                  {m.note}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Barista recommendation */}
        <div className="border p-4 mb-8 flex items-start gap-3" style={{ borderColor: '#B4AC9D', background: '#EFECE6' }}>
          <div className="font-mono text-[10px] tracking-widest" style={{ color: '#DD3E22' }}>
            ★ BARISTA
          </div>
          <div>
            <div className="text-[13px]" style={{ color: '#1A1714' }}>
              Para o {bean.origin.split(' — ')[0]}, recomendamos o {
                FILTERED_COFFEE_METHODS.find(m => m.recommended)?.label
              } — destaca as notas de {bean.notes.split(' / ')[0].toLowerCase()} e a acidez natural.
            </div>
          </div>
        </div>

        {/* Summary + Add */}
        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: '#CEC8BC' }}>
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#625E57' }}>
              SELEÇÃO
            </div>
            <div className="text-[13px]" style={{ color: '#1A1714' }}>
              {bean.origin} · {method.label}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 font-display font-bold text-lg tracking-widest transition-all duration-150"
            style={{ background: '#DD3E22', color: 'white' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#B83018')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#DD3E22')}
          >
            ADICIONAR
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Customization Panel ──────────────────────────────────────────────────────
function CustomizePanel({
  product,
  onAdd,
  onClose,
}: {
  product: (typeof MENU_ITEMS)[0];
  onAdd: (item: CartItem) => void;
  onClose: () => void;
}) {
  const groups = CUSTOMIZATIONS[product.id] || [];
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    groups.forEach(g => {
      if (g.type === 'single' && g.defaultValue) init[g.id] = [g.defaultValue];
      else init[g.id] = [];
    });
    return init;
  });
  const [note, setNote] = useState('');

  const toggleOption = (groupId: string, value: string, type: 'single' | 'multi') => {
    setSelections(prev => {
      if (type === 'single') return { ...prev, [groupId]: [value] };
      const current = prev[groupId] || [];
      return {
        ...prev,
        [groupId]: current.includes(value) ? current.filter(v => v !== value) : [...current, value],
      };
    });
  };

  const handleAdd = () => {
    const customizations = Object.values(selections).flat().filter(Boolean);
    onAdd({
      id: String(++itemIdCounter),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      customizations,
      note: note || undefined,
    });
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto" style={{ background: '#E5E2DB' }}>
      <div className="p-8 max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#625E57' }}>
              PERSONALIZAR
            </div>
            <h2 className="font-display font-black text-4xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
              {product.name.toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            <button onClick={onClose} style={{ color: '#625E57' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {groups.length === 0 && (
          <div className="py-6 font-mono text-[11px]" style={{ color: '#625E57' }}>
            Sem opções de personalização
          </div>
        )}

        {groups.map(group => (
          <div key={group.id} className="mb-6">
            <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: '#625E57' }}>
              {group.label.toUpperCase()}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.options.map(opt => {
                const isSelected = (selections[group.id] || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(group.id, opt.value, group.type)}
                    className="px-4 py-2 text-[13px] border transition-all duration-100"
                    style={{
                      borderColor: isSelected ? '#DD3E22' : '#CEC8BC',
                      background: isSelected ? '#DD3E22' : 'transparent',
                      color: isSelected ? 'white' : '#1A1714',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="mb-8">
          <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: '#625E57' }}>
            OBSERVAÇÃO
          </div>
          <input
            type="text"
            placeholder="Digite uma observação..."
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-4 py-3 text-[13px] outline-none border bg-transparent"
            style={{ borderColor: '#CEC8BC', color: '#1A1714' }}
          />
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-4 font-display font-bold text-xl tracking-widest transition-all duration-150"
          style={{ background: '#DD3E22', color: 'white' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#B83018')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#DD3E22')}
        >
          ADICIONAR AO PEDIDO
        </button>
      </div>
    </div>
  );
}

// ─── Confirmation Overlay ─────────────────────────────────────────────────────
function ConfirmationOverlay({ orderNum, onDone }: { orderNum: number; onDone: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: '#E5E2DB' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: '#DD3E22' }}
      >
        <Check size={32} strokeWidth={2.5} color="white" />
      </div>
      <div className="font-display font-black tracking-widest" style={{ fontSize: '2.2rem', color: '#1A1714' }}>
        PEDIDO #{String(orderNum).padStart(3, '0')}
      </div>
      <div className="font-display font-bold text-2xl tracking-widest mt-1" style={{ color: '#DD3E22' }}>
        REGISTRADO
      </div>
      <div className="font-mono text-[11px] tracking-widest mt-4" style={{ color: '#625E57' }}>
        ENVIADO PARA PRODUÇÃO
      </div>
      <button
        onClick={onDone}
        className="mt-10 px-8 py-3 font-display font-bold text-lg tracking-widest border transition-all"
        style={{ borderColor: '#CEC8BC', color: '#1A1714' }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#DD3E22')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#CEC8BC')}
      >
        NOVO PEDIDO
      </button>
    </div>
  );
}

// ─── Main POS View ────────────────────────────────────────────────────────────
export default function POS() {
  const { orders, addOrder, menuItems, demoMode, demoStep } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [consumption, setConsumption] = useState<'local' | 'takeaway'>('local');
  const [payment, setPayment] = useState<'pix' | 'card' | 'cash'>('pix');
  const [customizeFor, setCustomizeFor] = useState<(typeof MENU_ITEMS)[0] | null>(null);
  const [showFilteredPanel, setShowFilteredPanel] = useState(false);
  const [confirmedOrderNum, setConfirmedOrderNum] = useState<number | null>(null);

  const isDemoCartStep = demoMode && demoStep === 2;
  const isDemoConfirmed = demoMode && demoStep === 3;

  const demoCart: CartItem[] = [
    { id: 'd1', productId: 'matcha_latte', name: 'Matcha Latte', price: 24, quantity: 1, customizations: ['Aveia', 'Gelado'] },
    { id: 'd2', productId: 'filtrado', name: 'Filtrado', price: 18, quantity: 1, customizations: ['V60', 'Brasil / Sul de Minas'] },
    { id: 'd3', productId: 'cookie', name: 'Cookie', price: 12, quantity: 1, customizations: [] },
  ];

  const activeCart = isDemoCartStep || isDemoConfirmed ? demoCart : cart;
  const activeCustomer = isDemoCartStep || isDemoConfirmed ? 'TONNY' : customerName;
  const nextOrderNum = Math.max(...orders.map(o => o.id), 44) + 1;
  const displayOrderNum = isDemoCartStep || isDemoConfirmed ? 45 : nextOrderNum;
  const total = activeCart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filteredProducts = menuItems.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleProductClick = useCallback((product: (typeof MENU_ITEMS)[0]) => {
    if (!product.available) return;
    if (product.isFilteredCoffee) {
      setShowFilteredPanel(true);
    } else {
      setCustomizeFor(product);
    }
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart(prev => [...prev, item]);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const confirmOrder = () => {
    const orderNum = nextOrderNum;
    addOrder({
      id: orderNum,
      customer: (customerName || 'CLIENTE').toUpperCase(),
      items: cart,
      status: 'new',
      consumption,
      payment,
      total,
      createdAt: new Date(),
    });
    setConfirmedOrderNum(orderNum);
    setCart([]);
    setCustomerName('');
  };

  const handleConfirmDone = () => {
    setConfirmedOrderNum(null);
    setSelectedCategory('all');
  };

  return (
    <div className="flex h-full relative" style={{ background: '#E5E2DB' }}>
      {/* Left: Products area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Category tabs */}
        <div className="border-b flex gap-0 shrink-0" style={{ borderColor: '#CEC8BC' }}>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="px-5 py-4 text-[12px] font-medium tracking-wider transition-all border-b-2"
                style={{
                  borderColor: active ? '#DD3E22' : 'transparent',
                  color: active ? '#1A1714' : '#625E57',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Products grid */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="grid grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product)}
                disabled={!product.available}
                className="border p-4 text-left transition-all duration-150 group"
                style={{
                  borderColor: '#CEC8BC',
                  background: 'transparent',
                  opacity: product.available ? 1 : 0.35,
                  cursor: product.available ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => {
                  if (product.available) {
                    (e.currentTarget as HTMLElement).style.borderColor = '#B4AC9D';
                    (e.currentTarget as HTMLElement).style.background = '#EFECE6';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#CEC8BC';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div className="font-display font-bold text-base leading-tight mb-2" style={{ color: '#1A1714' }}>
                  {product.name.toUpperCase()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px]" style={{ color: '#625E57' }}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                  {!product.available && (
                    <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5" style={{ background: '#F9E6E0', color: '#625E57' }}>
                      ESGOTADO
                    </span>
                  )}
                  {product.isFilteredCoffee && product.available && (
                    <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5" style={{ background: '#F9E6E0', color: '#8A5A0C' }}>
                      MÉTODO
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Overlay panels */}
          {showFilteredPanel && (
            <FilteredCoffeePanel
              onAdd={item => { addToCart(item); setShowFilteredPanel(false); }}
              onClose={() => setShowFilteredPanel(false)}
            />
          )}
          {customizeFor && (
            <CustomizePanel
              product={customizeFor}
              onAdd={item => { addToCart(item); setCustomizeFor(null); }}
              onClose={() => setCustomizeFor(null)}
            />
          )}
          {confirmedOrderNum && (
            <ConfirmationOverlay orderNum={confirmedOrderNum} onDone={handleConfirmDone} />
          )}
          {isDemoConfirmed && !confirmedOrderNum && (
            <ConfirmationOverlay orderNum={45} onDone={() => {}} />
          )}
        </div>
      </div>

      {/* Right: Cart panel */}
      <div
        className="w-[300px] shrink-0 border-l flex flex-col"
        style={{ borderColor: '#CEC8BC', background: '#DCD7CC' }}
      >
        {/* Order header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: '#CEC8BC' }}>
          <div className="flex items-center justify-between">
            <div className="font-display font-black text-3xl tracking-tight" style={{ color: '#1A1714' }}>
              #{String(displayOrderNum).padStart(3, '0')}
            </div>
            <div className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
              NOVO PEDIDO
            </div>
          </div>
          <input
            type="text"
            placeholder="Nome do cliente..."
            value={isDemoCartStep || isDemoConfirmed ? activeCustomer : customerName}
            onChange={e => setCustomerName(e.target.value.toUpperCase())}
            className="mt-3 w-full bg-transparent outline-none font-display font-bold text-xl tracking-wide border-b pb-2"
            style={{ color: '#1A1714', borderColor: '#CEC8BC' }}
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto">
          {activeCart.length === 0 ? (
            <div className="p-5 font-mono text-[11px] tracking-widest" style={{ color: '#736B5E' }}>
              NENHUM ITEM
            </div>
          ) : (
            activeCart.map(item => (
              <div key={item.id} className="border-b px-5 py-3" style={{ borderColor: '#CEC8BC' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px]" style={{ color: '#DD3E22' }}>
                        {item.quantity}×
                      </span>
                      <span className="text-[13px] font-medium" style={{ color: '#1A1714' }}>
                        {item.name}
                      </span>
                    </div>
                    {item.customizations.length > 0 && (
                      <div className="ml-6 mt-0.5">
                        {item.customizations.map(c => (
                          <div key={c} className="font-mono text-[10px]" style={{ color: '#625E57' }}>
                            ↳ {c}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <div className="ml-6 mt-0.5 font-mono text-[10px] italic" style={{ color: '#736B5E' }}>
                        {item.note}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px]" style={{ color: '#625E57' }}>
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                    {!isDemoCartStep && !isDemoConfirmed && (
                      <button onClick={() => removeFromCart(item.id)} style={{ color: '#736B5E' }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Consumption + payment + total */}
        <div className="border-t p-5 space-y-4" style={{ borderColor: '#CEC8BC' }}>
          {/* Consumption */}
          <div>
            <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#625E57' }}>
              CONSUMO
            </div>
            <div className="flex gap-2">
              {(['local', 'takeaway'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setConsumption(c)}
                  className="flex-1 py-1.5 text-[11px] font-mono tracking-widest border transition-all"
                  style={{
                    borderColor: consumption === c ? '#DD3E22' : '#CEC8BC',
                    background: consumption === c ? '#DD3E22' : 'transparent',
                    color: consumption === c ? 'white' : '#625E57',
                  }}
                >
                  {c === 'local' ? 'NO LOCAL' : 'VIAGEM'}
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#625E57' }}>
              PAGAMENTO
            </div>
            <div className="flex gap-2">
              {(['pix', 'card', 'cash'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPayment(p)}
                  className="flex-1 py-1.5 text-[11px] font-mono tracking-widest border transition-all"
                  style={{
                    borderColor: payment === p ? '#DD3E22' : '#CEC8BC',
                    background: payment === p ? '#DD3E22' : 'transparent',
                    color: payment === p ? 'white' : '#625E57',
                  }}
                >
                  {p === 'pix' ? 'PIX' : p === 'card' ? 'CARTÃO' : 'DINHEIRO'}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: '#CEC8BC' }}>
            <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
              TOTAL
            </span>
            <span className="font-display font-black text-3xl" style={{ color: '#1A1714' }}>
              R$ {total.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={confirmOrder}
            disabled={activeCart.length === 0 && !isDemoCartStep && !isDemoConfirmed}
            className="w-full py-4 font-display font-bold text-xl tracking-widest transition-all duration-150"
            style={{
              background: activeCart.length > 0 || isDemoCartStep ? '#DD3E22' : '#D7D2C7',
              color: activeCart.length > 0 || isDemoCartStep ? 'white' : '#736B5E',
              cursor: activeCart.length > 0 || isDemoCartStep ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={e => {
              if (activeCart.length > 0 || isDemoCartStep)
                (e.currentTarget as HTMLElement).style.background = '#B83018';
            }}
            onMouseLeave={e => {
              if (activeCart.length > 0 || isDemoCartStep)
                (e.currentTarget as HTMLElement).style.background = '#DD3E22';
            }}
          >
            CONFIRMAR PEDIDO
          </button>
        </div>
      </div>
    </div>
  );
}
