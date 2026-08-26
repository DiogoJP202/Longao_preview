import { useApp } from '../context';
import { HOURLY_DATA, TOP_PRODUCTS } from '../data';

function StatBlock({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-r last:border-r-0 px-8 py-6 first:pl-0" style={{ borderColor: '#242120' }}>
      <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#6A6660' }}>
        {label}
      </div>
      <div
        className={`font-display font-black leading-none ${mono ? 'font-mono' : ''}`}
        style={{ fontSize: '2.8rem', color: '#EDEAE2' }}
      >
        {value}
      </div>
    </div>
  );
}

function HourlyChart() {
  const max = Math.max(...HOURLY_DATA.map(d => d.count));
  return (
    <div className="flex items-end gap-1.5 h-20">
      {HOURLY_DATA.map(d => (
        <div key={d.hour} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full transition-all"
            style={{
              height: `${(d.count / max) * 100}%`,
              minHeight: 2,
              background: d.hour === '10h' ? '#DD3E22' : '#2E2B27',
            }}
          />
          <span className="font-mono text-[8px]" style={{ color: '#35322C' }}>
            {d.hour}
          </span>
        </div>
      ))}
    </div>
  );
}

function OrderStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: '#D4902A',
    preparing: '#DD3E22',
    ready: '#4A9B6F',
    picked_up: '#35322C',
  };
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: map[status] || '#35322C' }}
    />
  );
}

function StatusLabel({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: 'novo',
    preparing: 'preparando',
    ready: 'pronto',
    picked_up: 'retirado',
  };
  return <>{map[status] || status}</>;
}

export default function Overview() {
  const { orders } = useApp();

  const todayOrders = orders.length + 123;
  const inProgress = orders.filter(o => o.status === 'preparing').length;
  const revenue = 3284.50 + orders.filter(o => o.status === 'ready' || o.status === 'picked_up').length * 24;
  const activeOrders = orders.filter(o => o.status !== 'picked_up').slice(-6).reverse();

  return (
    <div className="p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <div className="flex items-baseline gap-4">
            <h1 className="font-display font-black tracking-tight" style={{ fontSize: '3.5rem', lineHeight: 1, color: '#EDEAE2' }}>
              LONGÃO
            </h1>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-mono text-[11px] tracking-widest" style={{ color: '#6A6660' }}>
              QUARTA, 26 AGO
            </span>
            <span style={{ color: '#35322C' }}>—</span>
            <span className="font-mono text-[11px] tracking-widest" style={{ color: '#6A6660' }}>
              VILA BUARQUE
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#6A6660' }}>
            ABERTO
          </div>
          <div className="w-2 h-2 rounded-full ml-auto" style={{ background: '#4A9B6F' }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="border-t border-b flex mb-12" style={{ borderColor: '#242120' }}>
        <StatBlock label="PEDIDOS HOJE" value={String(todayOrders)} />
        <StatBlock label="EM PREPARO" value={String(inProgress).padStart(2, '0')} />
        <StatBlock label="TEMPO MÉDIO" value="06:42" mono />
        <StatBlock
          label="FATURAMENTO"
          value={`R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-[1fr_320px] gap-10">
        {/* Left: agora no longão + chart */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-display font-bold text-xl tracking-widest" style={{ color: '#EDEAE2' }}>
                AGORA NO LONGÃO
              </span>
            </div>
            <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6A6660' }}>
              {activeOrders.length} ATIVOS
            </span>
          </div>

          <div className="border-t" style={{ borderColor: '#242120' }}>
            {activeOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between py-4 border-b"
                style={{ borderColor: '#242120' }}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display font-black text-2xl w-12" style={{ color: '#EDEAE2' }}>
                    #{String(order.id).padStart(3, '0')}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium" style={{ color: '#EDEAE2' }}>
                      {order.customer}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#6A6660' }}>
                      {order.items.map(i => i.name).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusDot status={order.status} />
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: '#6A6660' }}>
                    <StatusLabel status={order.status} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mt-10">
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#6A6660' }}>
              MOVIMENTO DO DIA
            </div>
            <HourlyChart />
          </div>
        </div>

        {/* Right: highlights */}
        <div className="space-y-8">
          {/* Top product */}
          <div className="border p-6" style={{ borderColor: '#242120' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#6A6660' }}>
              MAIS PEDIDO HOJE
            </div>
            {TOP_PRODUCTS.slice(0, 3).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: '#242120' }}>
                <div className="flex items-center gap-3">
                  <span className="font-display font-black text-base w-5" style={{ color: '#35322C' }}>
                    {i + 1}
                  </span>
                  <span className="text-[13px]" style={{ color: '#EDEAE2' }}>{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-1"
                    style={{
                      width: `${(p.count / 24) * 60}px`,
                      background: i === 0 ? '#DD3E22' : '#2E2B27',
                    }}
                  />
                  <span className="font-mono text-[11px]" style={{ color: '#6A6660' }}>
                    {p.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Next event */}
          <div className="border p-6" style={{ borderColor: '#242120' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#6A6660' }}>
              PRÓXIMO EVENTO
            </div>
            <div className="font-display font-bold text-lg leading-tight" style={{ color: '#EDEAE2' }}>
              CORRIDA NOTURNA
            </div>
            <div className="font-mono text-[11px] mt-1" style={{ color: '#6A6660' }}>
              SEX, 29 AGO — 19H00
            </div>
            <div className="mt-3 text-[12px]" style={{ color: '#35322C' }}>
              Vila Buarque · 5km / 10km
            </div>
            <div
              className="mt-4 inline-block px-3 py-1 text-[10px] font-mono tracking-widest border"
              style={{ color: '#6A6660', borderColor: '#2E2B27' }}
            >
              EM BREVE: INTEGRAÇÃO DE EVENTOS
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border p-4" style={{ borderColor: '#242120' }}>
              <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: '#6A6660' }}>TICKET MÉDIO</div>
              <div className="font-display font-black text-2xl" style={{ color: '#EDEAE2' }}>R$ 25,86</div>
            </div>
            <div className="border p-4" style={{ borderColor: '#242120' }}>
              <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: '#6A6660' }}>PICO DE HOJE</div>
              <div className="font-display font-black text-2xl" style={{ color: '#EDEAE2' }}>10H</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
