import { useApp } from '../context';
import { calcularResumo, formatMinSeg } from '../resumo';
import { formatBRL } from '../tabMath';
import { CATEGORIES } from '../data';
import { PAYMENT_METHOD_LABELS } from '../dataTables';

function BarH({
  label,
  valor,
  max,
  sufixo,
  accent,
}: {
  label: string;
  valor: number;
  max: number;
  sufixo: string;
  accent?: boolean;
}) {
  const pct = Math.round((valor / Math.max(1, max)) * 100);
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
        <span className="font-mono text-[11px] w-12 text-right shrink-0" style={{ color: '#625E57' }}>
          {sufixo}
        </span>
      </div>
    </div>
  );
}

function MiniBar({ value, max, hour, current }: { value: number; max: number; hour: string; current?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div
        className="w-full transition-all duration-500"
        style={{ height: `${Math.max((value / Math.max(1, max)) * 64, 2)}px`, background: current ? '#DD3E22' : '#B4AC9D' }}
      />
      <span className="font-mono text-[8px]" style={{ color: current ? '#DD3E22' : '#736B5E' }}>
        {hour}
      </span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border p-5" style={{ borderColor: '#CEC8BC' }}>
      <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
        {titulo}
      </div>
      {children}
    </div>
  );
}

export default function Reports() {
  const { orders, tables } = useApp();
  const r = calcularResumo(orders, tables);

  const maxHourly = Math.max(...r.porHora.map(d => d.count), 1);
  const maxProduto = r.topProdutos[0]?.count ?? 1;
  const maxCategoria = r.categorias[0]?.valor ?? 1;

  const indicadores = [
    { label: 'FATURAMENTO', valor: formatBRL(r.faturamento), small: true },
    { label: 'PEDIDOS', valor: String(r.pedidosHoje) },
    { label: 'TICKET MÉDIO', valor: formatBRL(r.ticketMedio), small: true },
    { label: 'TEMPO MÉDIO', valor: formatMinSeg(r.tempoMedioSeg), mono: true },
  ];

  const salao = [
    { label: 'COMANDAS ABERTAS', valor: String(r.comandasAbertas).padStart(2, '0') },
    { label: 'EM ABERTO', valor: formatBRL(r.totalEmAberto), small: true },
    { label: 'PESSOAS NO SALÃO', valor: String(r.pessoasNoSalao).padStart(2, '0') },
    { label: 'PERMANÊNCIA MÉDIA', valor: formatMinSeg(r.permanenciaMediaSeg), mono: true },
  ];

  return (
    <div className="p-5 sm:p-8 md:p-10 max-w-4xl">
      <div className="mb-8 md:mb-10">
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight" style={{ color: '#1A1714' }}>
          RELATÓRIOS
        </h1>
        <div className="font-mono text-[10px] tracking-widest mt-1" style={{ color: '#625E57' }}>
          QUARTA, 26 AGO — RECAPITULAÇÃO DO DIA
        </div>
      </div>

      {/* Indicadores do dia */}
      <div className="grid grid-cols-2 md:grid-cols-4 border mb-4" style={{ borderColor: '#CEC8BC' }}>
        {indicadores.map(m => (
          <div
            key={m.label}
            className="px-4 md:px-6 py-4 md:py-6 border-r even:border-r-0 md:even:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            style={{ borderColor: '#CEC8BC' }}
          >
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
              {m.label}
            </div>
            <div
              className={`font-display font-black leading-none ${
                m.small ? 'text-[1.3rem] md:text-[1.6rem]' : 'text-[1.9rem] md:text-[2.5rem]'
              } ${m.mono ? 'font-mono' : ''}`}
              style={{ color: '#1A1714' }}
            >
              {m.valor}
            </div>
          </div>
        ))}
      </div>

      {/* Salão */}
      <div className="grid grid-cols-2 md:grid-cols-4 border mb-8 md:mb-10" style={{ borderColor: '#CEC8BC', background: '#EFECE6' }}>
        {salao.map(m => (
          <div
            key={m.label}
            className="px-4 md:px-6 py-4 border-r even:border-r-0 md:even:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0"
            style={{ borderColor: '#CEC8BC' }}
          >
            <div className="font-mono text-[9px] tracking-widest mb-1.5" style={{ color: '#625E57' }}>
              {m.label}
            </div>
            <div
              className={`font-display font-black leading-none text-[1.3rem] md:text-[1.6rem] ${m.mono ? 'font-mono' : ''}`}
              style={{ color: '#1A1714' }}
            >
              {m.valor}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-10">
        {/* Produtos */}
        <div>
          <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
            PRODUTOS MAIS VENDIDOS
          </div>
          <div>
            {r.topProdutos.slice(0, 8).map((p, i) => (
              <BarH
                key={p.name}
                label={p.name}
                valor={p.count}
                max={maxProduto}
                sufixo={String(p.count)}
                accent={i === 0}
              />
            ))}
          </div>

          <div className="font-mono text-[10px] tracking-widest mt-10 mb-4" style={{ color: '#625E57' }}>
            FATURAMENTO POR CATEGORIA
          </div>
          <div>
            {r.categorias.map((c, i) => (
              <BarH
                key={c.id}
                label={CATEGORIES.find(x => x.id === c.id)?.label ?? c.id}
                valor={c.valor}
                max={maxCategoria}
                sufixo={`${c.pct}%`}
                accent={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="space-y-8">
          <div>
            <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#625E57' }}>
              HORÁRIOS DE PICO
            </div>
            <div className="flex items-end gap-1 h-16">
              {r.porHora.map(d => (
                <MiniBar key={d.hour} value={d.count} max={maxHourly} hour={d.hour} current={d.atual} />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>
                PICO ÀS {r.picoHora.toUpperCase()}
              </span>
              <span className="font-mono text-[9px]" style={{ color: '#736B5E' }}>
                {r.picoQtd} PEDIDOS
              </span>
            </div>
          </div>

          <Bloco titulo="FORMAS DE PAGAMENTO">
            {r.pagamentos.map(p => (
              <div key={p.metodo} className="flex items-center gap-3 mb-2.5">
                <div className="w-24 text-[12px] truncate" style={{ color: '#1A1714' }}>
                  {PAYMENT_METHOD_LABELS[p.metodo]}
                </div>
                <div className="flex-1 h-0.5 relative" style={{ background: '#D7D2C7' }}>
                  <div
                    className="absolute left-0 top-0 h-full transition-all duration-700"
                    style={{ width: `${p.pct}%`, background: '#B4AC9D' }}
                  />
                </div>
                <span className="font-mono text-[10px] w-8 text-right" style={{ color: '#625E57' }}>
                  {p.pct}%
                </span>
              </div>
            ))}
          </Bloco>

          <Bloco titulo="ESTADO DO SALÃO">
            {[
              { label: 'Ocupadas', qtd: r.mesasOcupadas, cor: '#DD3E22' },
              { label: 'Aguardando pagamento', qtd: r.mesasAguardandoPagamento, cor: '#8A5A0C' },
              { label: 'Reservadas', qtd: r.mesasReservadas, cor: '#625E57' },
              { label: 'Livres', qtd: r.mesasLivres, cor: '#736B5E' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between mb-2">
                <span className="text-[12px]" style={{ color: '#1A1714' }}>
                  {s.label}
                </span>
                <span className="font-mono text-[11px]" style={{ color: s.cor }}>
                  {String(s.qtd).padStart(2, '0')}
                </span>
              </div>
            ))}
          </Bloco>
        </div>
      </div>

      <div className="mt-8 font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
        DADOS DEMONSTRATIVOS — LONGÃO OS v0.1
      </div>
    </div>
  );
}
