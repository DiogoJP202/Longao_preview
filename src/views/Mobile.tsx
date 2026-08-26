import { useState, useCallback } from 'react';
import { ChevronRight, X, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useApp } from '../context';
import { CATEGORIES, CUSTOMIZATIONS } from '../data';

interface MobileCartItem {
  id: string;
  name: string;
  price: number;
  customizations: string[];
}

type MobileView = 'home' | 'category' | 'product' | 'cart' | 'checkout' | 'confirm';

let mobileCounter = 200;

export default function Mobile() {
  const { menuItems, addOrder, orders } = useApp();
  const [mobileView, setMobileView] = useState<MobileView>('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<(typeof menuItems)[0] | null>(null);
  const [cart, setCart] = useState<MobileCartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [consumption, setConsumption] = useState<'local' | 'takeaway'>('local');

  const total = cart.reduce((s, i) => s + i.price, 0);
  const nextId = Math.max(...orders.map(o => o.id), 44) + 1;

  const categoryProducts = menuItems.filter(
    i => i.available && (selectedCategory ? i.category === selectedCategory : true)
  );

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    setCart(prev => [
      ...prev,
      { id: String(++mobileCounter), name: selectedProduct.name, price: selectedProduct.price, customizations: [] },
    ]);
    setMobileView('home');
    setSelectedProduct(null);
  };

  const handleOrder = () => {
    addOrder({
      id: nextId,
      customer: (customerName || 'CLIENTE').toUpperCase(),
      items: cart.map((c, i) => ({
        id: `m${i}`,
        productId: c.name.toLowerCase().replace(/ /g, '_'),
        name: c.name,
        price: c.price,
        quantity: 1,
        customizations: c.customizations,
      })),
      status: 'new',
      consumption,
      payment: 'pix',
      total,
      createdAt: new Date(),
    });
    setCart([]);
    setMobileView('confirm');
  };

  return (
    <div className="h-full flex items-center justify-center p-8" style={{ background: '#E5E2DB' }}>
      <div className="relative" style={{ width: 375, height: 700 }}>
        {/* Phone frame */}
        <div
          className="absolute inset-0 rounded-[40px] border-2 overflow-hidden shadow-2xl"
          style={{ borderColor: '#B4AC9D', background: '#DCD7CC' }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="font-mono text-[10px]" style={{ color: '#736B5E' }}>9:41</span>
            <div className="flex gap-1">
              {[1, 1, 0.5].map((o, i) => (
                <div key={i} className="w-1 rounded-full" style={{ height: 8, background: `rgba(53,50,44,${o})` }} />
              ))}
            </div>
          </div>

          {/* Screen content */}
          <div className="h-full overflow-hidden flex flex-col" style={{ height: 'calc(100% - 40px)' }}>
            {/* HOME */}
            {mobileView === 'home' && (
              <MobileHome
                cart={cart}
                total={total}
                onCategorySelect={cat => { setSelectedCategory(cat); setMobileView('category'); }}
                onViewCart={() => setMobileView('cart')}
              />
            )}

            {/* CATEGORY / PRODUCT LIST */}
            {mobileView === 'category' && (
              <MobileCategoryView
                products={categoryProducts}
                categoryLabel={CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}
                onBack={() => setMobileView('home')}
                onProduct={p => { setSelectedProduct(p); setMobileView('product'); }}
              />
            )}

            {/* PRODUCT DETAIL */}
            {mobileView === 'product' && selectedProduct && (
              <MobileProductView
                product={selectedProduct}
                onBack={() => setMobileView('category')}
                onAdd={handleAddProduct}
              />
            )}

            {/* CART */}
            {mobileView === 'cart' && (
              <MobileCart
                cart={cart}
                total={total}
                onBack={() => setMobileView('home')}
                onRemove={id => setCart(prev => prev.filter(i => i.id !== id))}
                onCheckout={() => setMobileView('checkout')}
              />
            )}

            {/* CHECKOUT */}
            {mobileView === 'checkout' && (
              <MobileCheckout
                total={total}
                customerName={customerName}
                consumption={consumption}
                orderId={nextId}
                onNameChange={setCustomerName}
                onConsumption={setConsumption}
                onBack={() => setMobileView('cart')}
                onOrder={handleOrder}
              />
            )}

            {/* CONFIRMATION */}
            {mobileView === 'confirm' && (
              <MobileConfirm
                orderId={nextId - 1}
                onDone={() => { setMobileView('home'); setCustomerName(''); }}
              />
            )}
          </div>
        </div>

        {/* Label */}
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
            QR CODE / AUTOATENDIMENTO
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileHome({
  cart,
  total,
  onCategorySelect,
  onViewCart,
}: {
  cart: MobileCartItem[];
  total: number;
  onCategorySelect: (c: string) => void;
  onViewCart: () => void;
}) {
  const MOBILE_CATEGORIES = [
    { id: 'espresso', label: 'CAFÉ', emoji: '☕' },
    { id: 'filtrado', label: 'FILTRADOS', emoji: '⚗' },
    { id: 'gelado', label: 'GELADOS', emoji: '❄' },
    { id: 'matcha', label: 'MATCHA', emoji: '🍵' },
    { id: 'comida', label: 'COMER', emoji: '🥐' },
    { id: 'doce', label: 'DOCES', emoji: '🍪' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-2 pb-6">
        <div className="font-display font-black text-4xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
          LONGÃO
        </div>
        <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#625E57' }}>
          O QUE VAMOS TOMAR HOJE?
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 px-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              className="border p-4 text-left transition-all"
              style={{ borderColor: '#CEC8BC' }}
              onTouchStart={() => {}}
            >
              <div className="text-2xl mb-2">{cat.emoji}</div>
              <div className="font-display font-bold text-lg tracking-widest" style={{ color: '#1A1714' }}>
                {cat.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <button
          onClick={onViewCart}
          className="mx-4 mb-4 flex items-center justify-between p-4 font-display font-bold text-base tracking-widest"
          style={{ background: '#DD3E22', color: 'white' }}
        >
          <span>{cart.length} {cart.length === 1 ? 'ITEM' : 'ITENS'} · R$ {total.toFixed(2).replace('.', ',')}</span>
          <span className="flex items-center gap-1">
            VER PEDIDO <ChevronRight size={16} />
          </span>
        </button>
      )}
    </div>
  );
}

function MobileCategoryView({
  products,
  categoryLabel,
  onBack,
  onProduct,
}: {
  products: ReturnType<typeof Array.prototype.filter>;
  categoryLabel: string;
  onBack: () => void;
  onProduct: (p: any) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b" style={{ borderColor: '#CEC8BC' }}>
        <button onClick={onBack} style={{ color: '#625E57' }}><ArrowLeft size={18} /></button>
        <span className="font-display font-bold text-xl tracking-widest" style={{ color: '#1A1714' }}>
          {categoryLabel.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {products.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onProduct(p)}
            className="w-full flex items-center justify-between px-5 py-4 border-b text-left"
            style={{ borderColor: '#CEC8BC' }}
          >
            <div>
              <div className="text-[14px] font-medium" style={{ color: '#1A1714' }}>{p.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px]" style={{ color: '#625E57' }}>
                R$ {p.price.toFixed(2).replace('.', ',')}
              </span>
              <ChevronRight size={14} color="#736B5E" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function MobileProductView({ product, onBack, onAdd }: { product: any; onBack: () => void; onAdd: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b" style={{ borderColor: '#CEC8BC' }}>
        <button onClick={onBack} style={{ color: '#625E57' }}><ArrowLeft size={18} /></button>
        <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>PRODUTO</span>
      </div>
      <div className="flex-1 px-5 pt-6">
        <div className="font-display font-black text-3xl leading-none" style={{ color: '#1A1714' }}>
          {product.name.toUpperCase()}
        </div>
        <div className="font-display font-black text-2xl mt-2" style={{ color: '#DD3E22' }}>
          R$ {product.price.toFixed(2).replace('.', ',')}
        </div>
      </div>
      <div className="px-4 pb-6">
        <button
          onClick={onAdd}
          className="w-full py-4 font-display font-bold text-xl tracking-widest"
          style={{ background: '#DD3E22', color: 'white' }}
        >
          ADICIONAR
        </button>
      </div>
    </div>
  );
}

function MobileCart({
  cart,
  total,
  onBack,
  onRemove,
  onCheckout,
}: {
  cart: MobileCartItem[];
  total: number;
  onBack: () => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b" style={{ borderColor: '#CEC8BC' }}>
        <button onClick={onBack} style={{ color: '#625E57' }}><ArrowLeft size={18} /></button>
        <span className="font-display font-bold text-xl tracking-widest" style={{ color: '#1A1714' }}>
          SEU PEDIDO
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#CEC8BC' }}>
            <div>
              <div className="text-[13px] font-medium" style={{ color: '#1A1714' }}>{item.name}</div>
              <div className="font-mono text-[11px]" style={{ color: '#625E57' }}>
                R$ {item.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <button onClick={() => onRemove(item.id)} style={{ color: '#736B5E' }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-4 pb-4 border-t pt-4 space-y-3" style={{ borderColor: '#CEC8BC' }}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] tracking-widest" style={{ color: '#625E57' }}>TOTAL</span>
          <span className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <button
          onClick={onCheckout}
          className="w-full py-4 font-display font-bold text-xl tracking-widest"
          style={{ background: '#DD3E22', color: 'white' }}
        >
          FAZER PEDIDO
        </button>
      </div>
    </div>
  );
}

function MobileCheckout({
  total, customerName, consumption, orderId, onNameChange, onConsumption, onBack, onOrder,
}: {
  total: number; customerName: string; consumption: 'local' | 'takeaway'; orderId: number;
  onNameChange: (n: string) => void; onConsumption: (c: 'local' | 'takeaway') => void;
  onBack: () => void; onOrder: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 pt-2 pb-4 border-b" style={{ borderColor: '#CEC8BC' }}>
        <button onClick={onBack} style={{ color: '#625E57' }}><ArrowLeft size={18} /></button>
        <span className="font-display font-bold text-xl tracking-widest" style={{ color: '#1A1714' }}>
          FINALIZAR
        </span>
      </div>
      <div className="flex-1 px-5 pt-6 space-y-6">
        <div>
          <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>SEU NOME</div>
          <input
            type="text"
            value={customerName}
            onChange={e => onNameChange(e.target.value.toUpperCase())}
            placeholder="DIGITE SEU NOME..."
            className="w-full bg-transparent outline-none border-b py-2 font-display font-bold text-xl"
            style={{ color: '#1A1714', borderColor: '#CEC8BC' }}
          />
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: '#625E57' }}>CONSUMO</div>
          <div className="flex gap-2">
            {(['local', 'takeaway'] as const).map(c => (
              <button
                key={c}
                onClick={() => onConsumption(c)}
                className="flex-1 py-3 font-mono text-[11px] tracking-widest border transition-all"
                style={{
                  borderColor: consumption === c ? '#DD3E22' : '#CEC8BC',
                  background: consumption === c ? '#DD3E22' : 'transparent',
                  color: consumption === c ? 'white' : '#625E57',
                }}
              >
                {c === 'local' ? 'NO LOCAL' : 'RETIRADA'}
              </button>
            ))}
          </div>
        </div>
        <div className="border p-4" style={{ borderColor: '#B4AC9D', background: '#EFECE6' }}>
          <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#DD3E22' }}>
            PAGAMENTO
          </div>
          <div className="text-[12px]" style={{ color: '#625E57' }}>
            O pagamento pode ser realizado no balcão.
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 border-t pt-4 space-y-2" style={{ borderColor: '#CEC8BC' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[11px] tracking-widest" style={{ color: '#625E57' }}>TOTAL</span>
          <span className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>
        <button
          onClick={onOrder}
          className="w-full py-4 font-display font-bold text-xl tracking-widest"
          style={{ background: '#DD3E22', color: 'white' }}
        >
          CONFIRMAR PEDIDO
        </button>
      </div>
    </div>
  );
}

function MobileConfirm({ orderId, onDone }: { orderId: number; onDone: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
        style={{ background: '#DD3E22' }}
      >
        <ShoppingBag size={24} color="white" />
      </div>
      <div className="font-display font-black text-2xl tracking-widest" style={{ color: '#1A1714' }}>
        PEDIDO #{String(orderId).padStart(3, '0')}
      </div>
      <div className="font-display font-bold text-lg tracking-widest mt-1" style={{ color: '#DD3E22' }}>
        CONFIRMADO
      </div>
      <div className="font-mono text-[11px] tracking-widest mt-4 mb-8" style={{ color: '#625E57' }}>
        ACOMPANHE NO PAINEL DE RETIRADA
      </div>
      <button
        onClick={onDone}
        className="px-8 py-3 font-display font-bold text-lg tracking-widest border transition-all"
        style={{ borderColor: '#CEC8BC', color: '#1A1714' }}
      >
        NOVO PEDIDO
      </button>
    </div>
  );
}
