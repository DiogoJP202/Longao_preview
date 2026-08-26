import { useEffect, useState, useCallback } from 'react';
import { useApp } from '../context';
import type { Order } from '../types';

function useTimer(startTime: Date | undefined, running: boolean) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !running) {
      setElapsed(startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime, running]);

  return elapsed;
}

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timerColor(seconds: number): string {
  if (seconds >= 600) return '#C83020'; // 10+ min
  if (seconds >= 300) return '#D4902A'; // 5-10 min
  return '#6A6660';
}

function timerLabel(seconds: number): string {
  if (seconds >= 600) return 'ATRASADO';
  if (seconds >= 300) return 'ATENÇÃO';
  return '';
}

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: (id: number) => void }) {
  const isNew = order.status === 'new';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';

  const timerStart = isPreparing ? order.startedAt : isReady ? order.startedAt : order.createdAt;
  const elapsed = useTimer(timerStart, isPreparing);
  const color = isPreparing ? timerColor(elapsed) : '#35322C';
  const warn = isPreparing ? timerLabel(elapsed) : '';

  return (
    <div
      className="border p-4 transition-all duration-300"
      style={{
        borderColor: isReady ? '#4A9B6F' : isNew ? '#2E2B27' : '#242120',
        background: isReady ? '#0D1A12' : '#111110',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-display font-black text-3xl leading-none" style={{ color: '#EDEAE2' }}>
            #{String(order.id).padStart(3, '0')}
          </div>
          <div className="font-display font-bold text-sm tracking-widest mt-0.5" style={{ color: '#6A6660' }}>
            {order.customer}
          </div>
        </div>
        <div className="text-right">
          <div
            className="font-mono text-xl leading-none"
            style={{ color, letterSpacing: '0.05em' }}
          >
            {isPreparing ? formatTimer(elapsed) : isReady ? '✓' : '--:--'}
          </div>
          {warn && (
            <div className="font-mono text-[9px] tracking-widest mt-0.5" style={{ color }}>
              {warn}
            </div>
          )}
          {order.consumption === 'takeaway' && (
            <div className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#6A6660' }}>
              VIAGEM
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="border-t py-2 mb-3 space-y-1.5" style={{ borderColor: '#242120' }}>
        {order.items.map(item => (
          <div key={item.id}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px]" style={{ color: '#DD3E22' }}>
                {item.quantity}
              </span>
              <span className="text-[12px] font-medium uppercase tracking-wide" style={{ color: '#EDEAE2' }}>
                {item.name}
              </span>
            </div>
            {item.customizations.length > 0 && (
              <div className="ml-4">
                <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6A6660' }}>
                  {item.customizations.join(' / ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      {isNew && (
        <button
          onClick={() => onAdvance(order.id)}
          className="w-full py-2 font-mono text-[11px] tracking-widest border transition-all duration-150"
          style={{ borderColor: '#DD3E22', color: '#DD3E22' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#DD3E22';
            (e.currentTarget as HTMLElement).style.color = 'white';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#DD3E22';
          }}
        >
          INICIAR
        </button>
      )}
      {isPreparing && (
        <button
          onClick={() => onAdvance(order.id)}
          className="w-full py-2 font-mono text-[11px] tracking-widest transition-all duration-150"
          style={{ background: '#DD3E22', color: 'white' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#B83018')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#DD3E22')}
        >
          MARCAR COMO PRONTO
        </button>
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  subtitle,
  tag,
  orders,
  onAdvance,
  accentColor,
}: {
  title: string;
  subtitle: string;
  tag: string;
  orders: Order[];
  onAdvance: (id: number) => void;
  accentColor: string;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Column header */}
      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: '#242120' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display font-black text-2xl tracking-widest" style={{ color: '#EDEAE2' }}>
              {title}
            </div>
            <div className="font-mono text-[10px] tracking-widest mt-0.5" style={{ color: accentColor }}>
              {tag}
            </div>
          </div>
          <div
            className="font-display font-black text-3xl"
            style={{ color: orders.length > 0 ? accentColor : '#35322C' }}
          >
            {String(orders.length).padStart(2, '0')}
          </div>
        </div>
        <div className="text-[11px] mt-1" style={{ color: '#35322C' }}>
          {subtitle}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orders.length === 0 && (
          <div className="py-8 font-mono text-[10px] tracking-widest text-center" style={{ color: '#2E2B27' }}>
            SEM PEDIDOS
          </div>
        )}
        {orders.map(order => (
          <OrderCard key={order.id} order={order} onAdvance={onAdvance} />
        ))}
      </div>
    </div>
  );
}

export default function Production() {
  const { orders, advanceOrderStatus } = useApp();
  const [tick, setTick] = useState(0);

  // Force re-render every second for timers
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const newOrders = orders.filter(o => o.status === 'new');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  void tick; // used to trigger re-render

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-4 border-b shrink-0"
        style={{ borderColor: '#242120' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-display font-black text-2xl tracking-widest" style={{ color: '#EDEAE2' }}>
            PRODUÇÃO
          </span>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6A6660' }}>
            KDS
          </span>
        </div>
        <div className="font-mono text-[11px] tracking-widest" style={{ color: '#6A6660' }}>
          {newOrders.length + preparingOrders.length + readyOrders.length} PEDIDOS ATIVOS
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 flex min-h-0">
        <KanbanColumn
          title="LARGADA"
          tag="NOVO PEDIDO"
          subtitle="Novo pedido"
          orders={newOrders}
          onAdvance={advanceOrderStatus}
          accentColor="#D4902A"
        />
        <div className="w-px shrink-0" style={{ background: '#242120' }} />
        <KanbanColumn
          title="EM RITMO"
          tag="PREPARANDO"
          subtitle="Preparando"
          orders={preparingOrders}
          onAdvance={advanceOrderStatus}
          accentColor="#DD3E22"
        />
        <div className="w-px shrink-0" style={{ background: '#242120' }} />
        <KanbanColumn
          title="CHEGADA"
          tag="PRONTO"
          subtitle="Pronto"
          orders={readyOrders}
          onAdvance={advanceOrderStatus}
          accentColor="#4A9B6F"
        />
      </div>
    </div>
  );
}
