import { useEffect, useState } from 'react';
import { useApp } from '../context';

export default function Pickup() {
  const { orders } = useApp();
  const [flashId, setFlashId] = useState<number | null>(null);
  const [prevReady, setPrevReady] = useState<number[]>([]);

  const readyOrders = orders.filter(o => o.status === 'ready');
  const preparingOrders = orders.filter(o => o.status === 'new' || o.status === 'preparing');

  // Flash animation when a new order becomes ready
  useEffect(() => {
    const currentReadyIds = readyOrders.map(o => o.id);
    const newlyReady = currentReadyIds.filter(id => !prevReady.includes(id));
    if (newlyReady.length > 0) {
      setFlashId(newlyReady[0]);
      const timeout = setTimeout(() => setFlashId(null), 3000);
      setPrevReady(currentReadyIds);
      return () => clearTimeout(timeout);
    }
    setPrevReady(currentReadyIds);
  }, [readyOrders.length]);

  const flashOrder = flashId ? orders.find(o => o.id === flashId) : null;

  return (
    <div
      className="h-full flex flex-col overflow-hidden relative"
      style={{ background: '#080807', aspectRatio: 'auto' }}
    >
      {/* Flash animation overlay */}
      {flashOrder && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{
            background: '#DD3E22',
            animation: 'fadeInOut 3s ease-in-out forwards',
          }}
        >
          <style>{`
            @keyframes fadeInOut {
              0% { opacity: 0; }
              10% { opacity: 1; }
              80% { opacity: 1; }
              100% { opacity: 0; pointer-events: none; }
            }
          `}</style>
          <div className="font-display font-black text-center text-[4rem] sm:text-[6rem] md:text-[8rem]" style={{ lineHeight: 1, color: 'white' }}>
            #{String(flashOrder.id).padStart(3, '0')}
          </div>
          <div className="font-display font-black text-center mt-2 text-[2rem] sm:text-[3rem] md:text-[4rem] px-4" style={{ lineHeight: 1, color: 'white' }}>
            {flashOrder.customer}
          </div>
          <div className="font-mono tracking-widest mt-6 text-[0.8rem] md:text-[1.2rem]" style={{ color: 'rgba(255,255,255,0.7)' }}>
            PRONTO PARA RETIRADA
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-end justify-between gap-4 px-6 md:px-16 pt-8 md:pt-14 pb-6 md:pb-8 border-b" style={{ borderColor: '#1A1816' }}>
        <div>
          <div className="font-display font-black tracking-tight text-[2.6rem] sm:text-[3.5rem] md:text-[5rem]" style={{ lineHeight: 1, color: '#EDEAE2' }}>
            LONGÃO
          </div>
          <div className="font-mono text-[12px] tracking-widest mt-2" style={{ color: '#35322C' }}>
            CAFÉ / CORRIDA / VILA BUARQUE
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[11px] tracking-widest mb-1" style={{ color: '#35322C' }}>
            RETIRADA
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x min-h-0 overflow-y-auto md:overflow-visible" style={{ borderColor: '#1A1816' }}>
        {/* Preparing */}
        <div className="flex-1 px-6 md:px-16 py-6 md:py-10 md:overflow-y-auto">
          <div className="font-mono text-[11px] tracking-widest mb-8" style={{ color: '#35322C' }}>
            EM PREPARO
          </div>
          <div className="space-y-4 md:space-y-5">
            {preparingOrders.length === 0 && (
              <div className="font-mono text-[12px] tracking-widest" style={{ color: '#1A1816' }}>
                —
              </div>
            )}
            {preparingOrders.map(order => (
              <div key={order.id} className="flex items-baseline gap-4 md:gap-6">
                <span className="font-display font-black text-[2.2rem] md:text-[3.5rem]" style={{ lineHeight: 1, color: '#2E2B27' }}>
                  {String(order.id).padStart(3, '0')}
                </span>
                <span className="font-display font-bold text-lg md:text-2xl tracking-widest truncate" style={{ color: '#3A3835' }}>
                  {order.customer}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ready */}
        <div className="flex-1 px-6 md:px-16 py-6 md:py-10 md:overflow-y-auto" style={{ background: '#0A0A09' }}>
          <div className="font-mono text-[11px] tracking-widest mb-8" style={{ color: '#4A9B6F' }}>
            PRONTO
          </div>
          <div className="space-y-4 md:space-y-5">
            {readyOrders.length === 0 && (
              <div className="font-mono text-[12px] tracking-widest" style={{ color: '#1A1816' }}>
                —
              </div>
            )}
            {readyOrders.map(order => (
              <div
                key={order.id}
                className="flex items-baseline gap-4 md:gap-6 transition-all duration-500"
                style={{ animation: order.id === flashId ? 'none' : undefined }}
              >
                <span
                  className="font-display font-black text-[3rem] md:text-[5rem]"
                  style={{ lineHeight: 1, color: '#EDEAE2' }}
                >
                  {String(order.id).padStart(3, '0')}
                </span>
                <div>
                  <div className="font-display font-black text-2xl md:text-4xl tracking-widest" style={{ color: '#EDEAE2' }}>
                    {order.customer}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#4A9B6F' }}>
                    RETIRAR NO BALCÃO
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-6 md:px-16 py-4 md:py-5 border-t flex items-center justify-between gap-3 shrink-0"
        style={{ borderColor: '#1A1816' }}
      >
        <div className="font-mono text-[10px] tracking-widest" style={{ color: '#1A1816' }}>
          SEU PEDIDO ESTÁ QUASE LÁ.
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4A9B6F' }} />
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#1A1816' }}>
            AO VIVO
          </span>
        </div>
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(time.getHours()).padStart(2, '0');
  const m = String(time.getMinutes()).padStart(2, '0');
  const s = String(time.getSeconds()).padStart(2, '0');
  return (
    <div className="font-display font-black text-[1.6rem] md:text-[2.5rem]" style={{ lineHeight: 1, color: '#EDEAE2' }}>
      {h}:{m}
      <span className="text-base md:text-2xl" style={{ color: '#35322C' }}>:{s}</span>
    </div>
  );
}
