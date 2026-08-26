import { useApp } from '../context';
import { TOP_PRODUCTS, HOURLY_DATA } from '../data';

function BarH({ label, value, max, accent }: { label: string; value: number; max: number; accent?: boolean }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-4 py-2.5 border-b" style={{ borderColor: '#CEC8BC' }}>
      <div className="w-24 sm:w-36 text-[12px] shrink-0 truncate" style={{ color: '#1A1714' }}>
        {label}
      </div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-1 relative" style={{ background: '#D7D2C7' }}>
          <div
            className="absolute left-0 top-0 h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: accent ? '#DD3E22' : '#B4AC9D' }}
          />
        </div>
        <span className="font-mono text-[11px] w-8 text-right shrink-0" style={{ color: '#625E57' }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function MiniBar({ value, max, hour, current }: { value: number; max: number; hour: string; current?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div
        className="w-full"
        style={{
          height: `${Math.max((value / max) * 64, 2)}px`,
          background: current ? '#DD3E22' : '#B4AC9D',
        }}
      />
      <span className="font-mono text-[8px]" style={{ color: '#736B5E' }}>
        {hour}
      </span>
    </div>
  );
}

export default function Reports() {
  const { orders } = useApp();

  const totalOrders = orders.length + 123;
  const revenue = 3284.50 + orders.filter(o => o.status !== 'new').length * 28;
  const avgTicket = revenue / totalOrders;
  const maxHourly = Math.max(...HOURLY_DATA.map(d => d.count));
  const maxProduct = TOP_PRODUCTS[0].count;

  return (
    <div className="p-5 sm:p-8 md:p-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight" style={{ color: '#1A1714' }}>
          RELATÓRIOS
        </h1>
        <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#625E57' }}>
          QUARTA, 26 AGO — RECAPITULAÇÃO DO DIA
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 border mb-8 md:mb-10" style={{ borderColor: '#CEC8BC' }}>
        {[
          { label: 'FATURAMENTO', value: `R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, small: true },
          { label: 'PEDIDOS', value: String(totalOrders) },
          { label: 'TICKET MÉDIO', value: `R$ ${avgTicket.toFixed(2).replace('.', ',')}`, small: true },
          { label: 'TEMPO MÉDIO', value: '06:42', mono: true },
        ].map(m => (
          <div
            key={m.label}
            className="px-4 md:px-6 py-4 md:py-6 border-r even:border-r-0 md:even:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            style={{ borderColor: '#CEC8BC' }}
          >
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
              {m.label}
            </div>
            <div
              className={`font-display font-black leading-none ${m.small ? 'text-[1.3rem] md:text-[1.6rem]' : 'text-[1.9rem] md:text-[2.5rem]'} ${m.mono ? 'font-mono' : ''}`}
              style={{ color: '#1A1714' }}
            >
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-10">
        {/* Products */}
        <div>
          <div className="font-mono text-[10px] tracking-widest mb-5" style={{ color: '#625E57' }}>
            PRODUTOS MAIS VENDIDOS
          </div>
          <div>
            {TOP_PRODUCTS.map((p, i) => (
              <BarH key={p.name} label={p.name} value={p.count} max={maxProduct} accent={i === 0} />
            ))}
          </div>
        </div>

        {/* Hourly + stats */}
        <div className="space-y-8">
          {/* Hourly */}
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              HORÁRIOS DE PICO
            </div>
            <div className="flex items-end gap-1 h-16">
              {HOURLY_DATA.map(d => (
                <MiniBar key={d.hour} value={d.count} max={maxHourly} hour={d.hour} current={d.hour === '10h'} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>PICO ÀS 10H</span>
              <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>22 PEDIDOS</span>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="border p-5" style={{ borderColor: '#CEC8BC' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              FATURAMENTO POR CATEGORIA
            </div>
            {[
              { label: 'Café', pct: 42 },
              { label: 'Matcha & Chá', pct: 28 },
              { label: 'Comidas', pct: 18 },
              { label: 'Doces', pct: 12 },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 mb-2.5">
                <div className="w-20 text-[12px]" style={{ color: '#1A1714' }}>
                  {item.label}
                </div>
                <div className="flex-1 h-0.5 relative" style={{ background: '#D7D2C7' }}>
                  <div
                    className="absolute left-0 top-0 h-full"
                    style={{ width: `${item.pct}%`, background: '#B4AC9D' }}
                  />
                </div>
                <span className="font-mono text-[10px] w-8 text-right" style={{ color: '#625E57' }}>
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Payment methods */}
          <div className="border p-5" style={{ borderColor: '#CEC8BC' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              FORMAS DE PAGAMENTO
            </div>
            {[
              { label: 'PIX', pct: 58, color: '#DD3E22' },
              { label: 'Cartão', pct: 31, color: '#625E57' },
              { label: 'Dinheiro', pct: 11, color: '#736B5E' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between mb-2">
                <span className="text-[12px]" style={{ color: '#1A1714' }}>{item.label}</span>
                <span className="font-mono text-[11px]" style={{ color: item.color }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
        DADOS DEMONSTRATIVOS — LONGÃO OS v0.1
      </div>
    </div>
  );
}
