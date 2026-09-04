import { useEffect, useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { useApp } from '../context';
import { calcularResumo, formatMinSeg } from '../resumo';
import { formatBRL, formatDuracao, restante } from '../tabMath';
import { CATEGORIES } from '../data';

/** Mantém cronômetros e permanência médios andando. */
function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

function StatBlock({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      className="px-4 md:px-8 py-4 md:py-6 border-r even:border-r-0 md:even:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0 md:first:pl-0"
      style={{ borderColor: '#CEC8BC' }}
    >
      <div className="font-mono text-[9px] md:text-[10px] tracking-widest mb-1.5 md:mb-2" style={{ color: '#625E57' }}>
        {label}
      </div>
      <div
        className={`font-display font-black leading-none text-[1.9rem] md:text-[2.8rem] ${mono ? 'font-mono' : ''}`}
        style={{ color: '#1A1714' }}
      >
        {value}
      </div>
    </div>
  );
}

function HourlyChart({ dados }: { dados: { hour: string; count: number; atual: boolean }[] }) {
  const max = Math.max(...dados.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {dados.map(d => (
        <div key={d.hour} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full transition-all duration-300"
            style={{
              height: `${(d.count / max) * 100}%`,
              minHeight: 2,
              background: d.atual ? '#DD3E22' : '#B4AC9D',
            }}
          />
          <span className="font-mono text-[8px]" style={{ color: d.atual ? '#DD3E22' : '#736B5E' }}>
            {d.hour}
          </span>
        </div>
      ))}
    </div>
  );
}

function OrderStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: '#8A5A0C',
    preparing: '#DD3E22',
    ready: '#26663F',
    picked_up: '#736B5E',
  };
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: map[status] || '#736B5E' }} />;
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

/** Barra fina de ocupação do salão — três estados, sem depender só de cor. */
function BarraOcupacao({
  ocupadas,
  pagamento,
  reservadas,
  livres,
}: {
  ocupadas: number;
  pagamento: number;
  reservadas: number;
  livres: number;
}) {
  const total = Math.max(1, ocupadas + pagamento + reservadas + livres);
  const faixas = [
    { qtd: ocupadas, cor: '#DD3E22' },
    { qtd: pagamento, cor: '#8A5A0C' },
    { qtd: reservadas, cor: '#625E57' },
    { qtd: livres, cor: '#CEC8BC' },
  ];
  return (
    <div className="flex h-1.5 w-full overflow-hidden">
      {faixas.map((f, i) => (
        <div
          key={i}
          className="transition-all duration-500"
          style={{ width: `${(f.qtd / total) * 100}%`, background: f.cor }}
        />
      ))}
    </div>
  );
}

export default function Overview() {
  useTick();
  const { orders, tables, setView } = useApp();
  const r = calcularResumo(orders, tables);

  const activeOrders = orders.filter(o => o.status !== 'picked_up').slice(-6).reverse();
  const mesasEmDestaque = tables
    .filter(t => t.tab && !t.mergedInto)
    .sort((a, b) => a.tab!.openedAt.getTime() - b.tab!.openedAt.getTime())
    .slice(0, 4);

  return (
    <div className="p-5 sm:p-8 md:p-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 md:mb-12">
        <div>
          <div className="flex items-baseline gap-4">
            <h1
              className="font-display font-black tracking-tight text-[2.4rem] sm:text-[3rem] md:text-[3.5rem]"
              style={{ lineHeight: 1, color: '#1A1714' }}
            >
              LONGÃO
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
            <span className="font-mono text-[11px] tracking-widest" style={{ color: '#625E57' }}>
              QUARTA, 26 AGO
            </span>
            <span style={{ color: '#736B5E' }}>—</span>
            <span className="font-mono text-[11px] tracking-widest" style={{ color: '#625E57' }}>
              VILA BUARQUE
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#625E57' }}>
            ABERTO
          </div>
          <div className="w-2 h-2 rounded-full ml-auto" style={{ background: '#26663F' }} />
        </div>
      </div>

      {/* Indicadores do dia */}
      <div className="border-t border-b grid grid-cols-2 md:flex mb-4" style={{ borderColor: '#CEC8BC' }}>
        <StatBlock label="PEDIDOS HOJE" value={String(r.pedidosHoje)} />
        <StatBlock label="EM PREPARO" value={String(r.emPreparo).padStart(2, '0')} />
        <StatBlock label="TEMPO MÉDIO" value={formatMinSeg(r.tempoMedioSeg)} mono />
        <StatBlock label="FATURAMENTO" value={formatBRL(r.faturamento)} />
      </div>

      {/* Ocupação do salão */}
      <button
        onClick={() => setView('tables')}
        className="w-full text-left border p-5 mb-10 md:mb-12 transition-all duration-150"
        style={{ borderColor: '#CEC8BC', background: '#EFECE6' }}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
            SALÃO
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest" style={{ color: '#DD3E22' }}>
            MESAS E COMANDAS
            <ArrowRight size={11} />
          </span>
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4 mb-4">
          <div>
            <div className="font-display font-black text-[2.2rem] leading-none" style={{ color: '#1A1714' }}>
              {r.mesasOcupadas + r.mesasAguardandoPagamento}
              <span className="text-[1.2rem]" style={{ color: '#736B5E' }}> / {r.mesasTotal}</span>
            </div>
            <div className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#625E57' }}>
              MESAS EM USO
            </div>
          </div>
          <div>
            <div className="font-display font-black text-[2.2rem] leading-none" style={{ color: '#1A1714' }}>
              {formatBRL(r.totalEmAberto)}
            </div>
            <div className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#625E57' }}>
              EM ABERTO NAS COMANDAS
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display font-black text-[2.2rem] leading-none" style={{ color: '#1A1714' }}>
              <Users size={18} strokeWidth={2} style={{ color: '#736B5E' }} />
              {r.pessoasNoSalao}
            </div>
            <div className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#625E57' }}>
              PESSOAS NO SALÃO
            </div>
          </div>
          <div>
            <div className="font-display font-black font-mono text-[2.2rem] leading-none" style={{ color: '#1A1714' }}>
              {formatMinSeg(r.permanenciaMediaSeg)}
            </div>
            <div className="font-mono text-[9px] tracking-widest mt-1" style={{ color: '#625E57' }}>
              PERMANÊNCIA MÉDIA
            </div>
          </div>
        </div>

        <BarraOcupacao
          ocupadas={r.mesasOcupadas}
          pagamento={r.mesasAguardandoPagamento}
          reservadas={r.mesasReservadas}
          livres={r.mesasLivres}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 font-mono text-[9px] tracking-widest">
          <span style={{ color: '#DD3E22' }}>{r.mesasOcupadas} OCUPADAS</span>
          <span style={{ color: '#8A5A0C' }}>{r.mesasAguardandoPagamento} PAGAMENTO</span>
          <span style={{ color: '#625E57' }}>{r.mesasReservadas} RESERVADA{r.mesasReservadas === 1 ? '' : 'S'}</span>
          <span style={{ color: '#736B5E' }}>{r.mesasLivres} LIVRES</span>
        </div>
      </button>

      {/* Duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
        <div>
          <div className="flex items-center justify-between gap-3 mb-5 md:mb-6">
            <span className="font-display font-bold text-xl tracking-widest" style={{ color: '#1A1714' }}>
              AGORA NO LONGÃO
            </span>
            <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
              {activeOrders.length} ATIVOS
            </span>
          </div>

          <div className="border-t" style={{ borderColor: '#CEC8BC' }}>
            {activeOrders.length === 0 && (
              <div className="py-6 font-mono text-[11px] tracking-widest" style={{ color: '#736B5E' }}>
                NENHUM PEDIDO ATIVO
              </div>
            )}
            {activeOrders.map(order => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 py-4 border-b"
                style={{ borderColor: '#CEC8BC' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <span
                    className="font-display font-black text-xl sm:text-2xl w-10 sm:w-12 shrink-0"
                    style={{ color: '#1A1714' }}
                  >
                    #{String(order.id).padStart(3, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {order.tableLabel && (
                        <span
                          className="font-mono text-[9px] tracking-widest px-1.5 py-0.5 shrink-0"
                          style={{ background: '#F9E6E0', color: '#DD3E22' }}
                        >
                          {order.tableLabel}
                        </span>
                      )}
                      <span className="text-[13px] font-medium truncate" style={{ color: '#1A1714' }}>
                        {order.customer}
                      </span>
                    </div>
                    <div className="text-[11px] mt-0.5 truncate" style={{ color: '#625E57' }}>
                      {order.items.map(i => i.name).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <OrderStatusDot status={order.status} />
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                    <StatusLabel status={order.status} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Comandas mais antigas — onde a atenção precisa ir primeiro */}
          {mesasEmDestaque.length > 0 && (
            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                  COMANDAS ABERTAS HÁ MAIS TEMPO
                </span>
                <span className="font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
                  {r.comandasAbertas} ABERTAS
                </span>
              </div>
              <div className="border-t" style={{ borderColor: '#CEC8BC' }}>
                {mesasEmDestaque.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setView('tables')}
                    className="w-full flex items-center justify-between gap-3 py-3 border-b text-left"
                    style={{ borderColor: '#CEC8BC' }}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="font-display font-black text-base w-24 shrink-0" style={{ color: '#1A1714' }}>
                        {t.label}
                      </span>
                      <span className="text-[13px] truncate" style={{ color: '#625E57' }}>
                        {t.tab!.customer}
                      </span>
                    </span>
                    <span className="flex items-center gap-4 shrink-0">
                      <span className="font-mono text-[11px]" style={{ color: '#625E57' }}>
                        {formatDuracao(t.tab!.openedAt)}
                      </span>
                      <span className="font-mono text-[12px] w-20 text-right" style={{ color: '#1A1714' }}>
                        {formatBRL(restante(t.tab!))}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Movimento */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                MOVIMENTO DO DIA
              </span>
              <span className="font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
                PICO {r.picoHora.toUpperCase()} · {r.picoQtd}
              </span>
            </div>
            <HourlyChart dados={r.porHora} />
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-6 md:space-y-8">
          <div className="border p-5 md:p-6" style={{ borderColor: '#CEC8BC' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              MAIS PEDIDO HOJE
            </div>
            {r.topProdutos.slice(0, 3).map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: '#CEC8BC' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display font-black text-base w-5 shrink-0" style={{ color: '#736B5E' }}>
                    {i + 1}
                  </span>
                  <span className="text-[13px] truncate" style={{ color: '#1A1714' }}>
                    {p.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div
                    className="h-1 transition-all duration-500"
                    style={{
                      width: `${(p.count / Math.max(1, r.topProdutos[0].count)) * 60}px`,
                      background: i === 0 ? '#DD3E22' : '#B4AC9D',
                    }}
                  />
                  <span className="font-mono text-[11px] w-6 text-right" style={{ color: '#625E57' }}>
                    {p.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border p-5 md:p-6" style={{ borderColor: '#CEC8BC' }}>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              PRÓXIMO EVENTO
            </div>
            <div className="font-display font-bold text-lg leading-tight" style={{ color: '#1A1714' }}>
              CORRIDA NOTURNA
            </div>
            <div className="font-mono text-[11px] mt-1" style={{ color: '#625E57' }}>
              SEX, 29 AGO — 19H00
            </div>
            <div className="mt-3 text-[12px]" style={{ color: '#736B5E' }}>
              Vila Buarque · 5km / 10km
            </div>
            <div
              className="mt-4 inline-block px-3 py-1 text-[10px] font-mono tracking-widest border"
              style={{ color: '#625E57', borderColor: '#B4AC9D' }}
            >
              EM BREVE: INTEGRAÇÃO DE EVENTOS
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="border p-4" style={{ borderColor: '#CEC8BC' }}>
              <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: '#625E57' }}>
                TICKET MÉDIO
              </div>
              <div className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
                {formatBRL(r.ticketMedio)}
              </div>
            </div>
            <div className="border p-4" style={{ borderColor: '#CEC8BC' }}>
              <div className="font-mono text-[9px] tracking-widest mb-1" style={{ color: '#625E57' }}>
                CATEGORIA LÍDER
              </div>
              <div className="font-display font-black text-2xl leading-none" style={{ color: '#1A1714' }}>
                {(CATEGORIES.find(c => c.id === r.categorias[0]?.id)?.label ?? '—').toUpperCase()}
              </div>
              <div className="font-mono text-[10px] mt-1" style={{ color: '#625E57' }}>
                {r.categorias[0]?.pct ?? 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
