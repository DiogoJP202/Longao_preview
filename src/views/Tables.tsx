import { useEffect, useMemo, useState } from 'react';
import { Search, LayoutGrid, List, Users, Plus, Clock, Bookmark, Receipt, Link2 } from 'lucide-react';
import { useApp } from '../context';
import { AREAS, TABLE_STATUS_LABELS } from '../dataTables';
import type { AreaId, CafeTable, TableStatus } from '../types';
import { formatBRL, formatDuracao, restante } from '../tabMath';
import TableTab from './TableTab';

/** Um relógio compartilhado para todos os cronômetros da tela. */
function useTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
}

const STATUS_ACCENT: Record<TableStatus, string> = {
  free: '#B4AC9D',
  occupied: '#DD3E22',
  awaiting_payment: '#8A5A0C',
  reserved: '#625E57',
};

function StatusIcon({ status, size = 11 }: { status: TableStatus; size?: number }) {
  if (status === 'occupied') return <Clock size={size} strokeWidth={2} />;
  if (status === 'awaiting_payment') return <Receipt size={size} strokeWidth={2} />;
  if (status === 'reserved') return <Bookmark size={size} strokeWidth={2} />;
  return <Plus size={size} strokeWidth={2} />;
}

/** Marca da forma da mesa — o que dá ao mapa cara de planta e não de planilha. */
function ShapeMark({ table }: { table: CafeTable }) {
  const cor = '#B4AC9D';
  if (table.shape === 'round') return <span className="block w-3 h-3 rounded-full border" style={{ borderColor: cor }} />;
  if (table.shape === 'square') return <span className="block w-3 h-3 border" style={{ borderColor: cor }} />;
  if (table.shape === 'communal')
    return <span className="block w-6 h-2.5 border" style={{ borderColor: cor }} />;
  return (
    <span className="flex gap-0.5">
      <span className="block w-1 h-3 border" style={{ borderColor: cor }} />
      <span className="block w-1 h-3 border" style={{ borderColor: cor }} />
    </span>
  );
}

function TableCard({
  table,
  destacada,
  onOpen,
}: {
  table: CafeTable;
  destacada: boolean;
  onOpen: () => void;
}) {
  const acento = STATUS_ACCENT[table.status];
  const livre = table.status === 'free';
  const anexada = !!table.mergedInto;
  const t = table.tab;

  return (
    <button
      onClick={onOpen}
      className={`relative text-left border p-4 min-h-[124px] flex flex-col justify-between transition-all duration-150 ${
        table.shape === 'communal' ? 'sm:col-span-2' : ''
      }`}
      style={{
        borderColor: destacada ? '#DD3E22' : livre ? '#CEC8BC' : '#B4AC9D',
        borderLeft: `3px solid ${destacada ? '#DD3E22' : acento}`,
        background: livre ? 'transparent' : '#EFECE6',
        boxShadow: destacada ? '0 0 0 1px #DD3E22' : 'none',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-black text-xl leading-none tracking-tight" style={{ color: '#1A1714' }}>
            {table.label}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[10px] tracking-widest" style={{ color: acento }}>
            <StatusIcon status={table.status} />
            {TABLE_STATUS_LABELS[table.status].toUpperCase()}
          </div>
        </div>
        <ShapeMark table={table} />
      </div>

      {anexada && (
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
          <Link2 size={11} />
          JUNTADA
        </div>
      )}

      {t && !anexada && (
        <div>
          <div className="text-[13px] font-medium truncate" style={{ color: '#1A1714' }}>
            {t.customer}
          </div>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: '#625E57' }}>
              <Users size={10} />
              {t.people}
            </span>
            <span className="font-mono text-[11px]" style={{ color: '#625E57' }}>
              {formatDuracao(t.openedAt)}
            </span>
          </div>
          <div className="font-display font-black text-lg mt-1.5" style={{ color: '#1A1714' }}>
            {formatBRL(restante(t))}
          </div>
        </div>
      )}

      {livre && (
        <span className="font-mono text-[10px] tracking-widest" style={{ color: '#DD3E22' }}>
          ABRIR COMANDA →
        </span>
      )}

      {table.status === 'reserved' && (
        <span className="font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
          AGUARDANDO CHEGADA
        </span>
      )}

      {table.mergedWith && table.mergedWith.length > 0 && (
        <div
          className="absolute top-2 right-2 font-mono text-[8px] tracking-widest px-1.5 py-0.5"
          style={{ background: '#F9E6E0', color: '#DD3E22' }}
        >
          + {table.mergedWith.length}
        </div>
      )}
    </button>
  );
}

function Resumo({ tables }: { tables: CafeTable[] }) {
  const ocupadas = tables.filter(t => t.status === 'occupied').length;
  const pagamento = tables.filter(t => t.status === 'awaiting_payment').length;
  const livres = tables.filter(t => t.status === 'free').length;
  const reservadas = tables.filter(t => t.status === 'reserved').length;
  const comandas = tables.filter(t => t.tab).length;
  const emAberto = tables.reduce((s, t) => s + (t.tab ? restante(t.tab) : 0), 0);

  const blocos = [
    { label: 'MESAS OCUPADAS', valor: `${ocupadas} / ${tables.length}` },
    { label: 'COMANDAS ABERTAS', valor: String(comandas).padStart(2, '0') },
    { label: 'AGUARDANDO PAGAMENTO', valor: String(pagamento).padStart(2, '0') },
    { label: 'TOTAL EM ABERTO', valor: formatBRL(emAberto) },
  ];

  return (
    <>
      <div className="border-t border-b grid grid-cols-2 md:flex mb-4" style={{ borderColor: '#CEC8BC' }}>
        {blocos.map(b => (
          <div
            key={b.label}
            className="px-4 md:px-8 py-4 border-r even:border-r-0 md:even:border-r md:last:border-r-0 [&:nth-child(-n+2)]:border-b md:[&:nth-child(-n+2)]:border-b-0 md:first:pl-0"
            style={{ borderColor: '#CEC8BC' }}
          >
            <div className="font-mono text-[9px] tracking-widest mb-1.5" style={{ color: '#625E57' }}>
              {b.label}
            </div>
            <div className="font-display font-black leading-none text-[1.6rem] md:text-[2.2rem]" style={{ color: '#1A1714' }}>
              {b.valor}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-8 font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
        <span style={{ color: '#736B5E' }}>AGORA NO LONGÃO</span>
        <span>{tables.length} MESAS</span>
        <span style={{ color: '#DD3E22' }}>{ocupadas} OCUPADAS</span>
        <span>{livres} LIVRES</span>
        <span style={{ color: '#8A5A0C' }}>{pagamento} PAGAMENTO</span>
        <span>{reservadas} RESERVADA{reservadas === 1 ? '' : 'S'}</span>
      </div>
    </>
  );
}

function ListaDeMesas({ tables, onOpen }: { tables: CafeTable[]; onOpen: (id: string) => void }) {
  return (
    <div className="border" style={{ borderColor: '#CEC8BC' }}>
      <div
        className="hidden md:grid px-5 py-3 border-b font-mono text-[10px] tracking-widest"
        style={{ gridTemplateColumns: '110px 1fr 90px 90px 120px 130px', borderColor: '#CEC8BC', color: '#625E57' }}
      >
        <span>MESA</span>
        <span>CLIENTE</span>
        <span>TEMPO</span>
        <span>PESSOAS</span>
        <span className="md:text-right">TOTAL</span>
        <span className="md:text-right">STATUS</span>
      </div>

      {tables.map(t => (
        <button
          key={t.id}
          onClick={() => onOpen(t.id)}
          className="w-full text-left flex flex-col gap-2 md:gap-0 md:grid px-4 md:px-5 py-3.5 border-b last:border-0 md:items-center transition-colors"
          style={{ gridTemplateColumns: '110px 1fr 90px 90px 120px 130px', borderColor: '#CEC8BC' }}
        >
          <span className="font-display font-black text-lg" style={{ color: '#1A1714' }}>
            {t.label}
          </span>
          <div className="flex items-center justify-between gap-3 md:contents">
            <span className="text-[13px] truncate" style={{ color: t.tab ? '#1A1714' : '#736B5E' }}>
              {t.tab ? t.tab.customer : '—'}
            </span>
            <span className="font-mono text-[12px]" style={{ color: '#625E57' }}>
              {t.tab ? formatDuracao(t.tab.openedAt) : '—'}
            </span>
            <span className="font-mono text-[12px]" style={{ color: '#625E57' }}>
              {t.tab ? t.tab.people : '—'}
            </span>
            <span className="font-mono text-[13px] md:text-right" style={{ color: '#1A1714' }}>
              {t.tab ? formatBRL(restante(t.tab)) : '—'}
            </span>
            <span
              className="flex items-center gap-1.5 md:justify-end font-mono text-[10px] tracking-widest"
              style={{ color: STATUS_ACCENT[t.status] }}
            >
              <StatusIcon status={t.status} />
              {TABLE_STATUS_LABELS[t.status].toUpperCase()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Tables() {
  useTick();
  const { tables } = useApp();
  const [area, setArea] = useState<'all' | AreaId>('all');
  const [modo, setModo] = useState<'mapa' | 'lista'>('mapa');
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const termo = busca.trim().toLowerCase();

  const combina = useMemo(
    () => (t: CafeTable) =>
      !termo ||
      t.label.toLowerCase().includes(termo) ||
      (t.tab?.customer.toLowerCase().includes(termo) ?? false),
    [termo]
  );

  const visiveis = tables.filter(t => (area === 'all' || t.area === area) && (!termo || combina(t)));
  const areasVisiveis = AREAS.filter(a => area === 'all' || a.id === area);

  const filtros: { id: 'all' | AreaId; label: string }[] = [
    { id: 'all', label: 'Todas' },
    ...AREAS.map(a => ({ id: a.id, label: a.label })),
  ];

  return (
    <div className="p-5 sm:p-8 md:p-10 max-w-6xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1
          className="font-display font-black tracking-tight text-[2.2rem] sm:text-[2.8rem] leading-none"
          style={{ color: '#1A1714' }}
        >
          MESAS E COMANDAS
        </h1>
        <div className="font-mono text-[10px] tracking-widest mt-2" style={{ color: '#625E57' }}>
          VISÃO GERAL DO SALÃO
        </div>
      </div>

      <Resumo tables={tables} />

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex border" style={{ borderColor: '#CEC8BC' }}>
          {filtros.map(f => {
            const ativo = area === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setArea(f.id)}
                className="px-3 sm:px-4 py-2 font-mono text-[10px] tracking-widest transition-all border-r last:border-r-0"
                style={{
                  borderColor: '#CEC8BC',
                  background: ativo ? '#DD3E22' : 'transparent',
                  color: ativo ? 'white' : '#625E57',
                }}
              >
                {f.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 border px-3 py-2 flex-1 min-w-[180px]" style={{ borderColor: '#CEC8BC' }}>
          <Search size={13} style={{ color: '#736B5E' }} />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar mesa ou cliente..."
            className="bg-transparent outline-none text-[13px] w-full"
            style={{ color: '#1A1714' }}
          />
        </div>

        <div className="flex border" style={{ borderColor: '#CEC8BC' }}>
          {([['mapa', LayoutGrid], ['lista', List]] as const).map(([id, Icon]) => {
            const ativo = modo === id;
            return (
              <button
                key={id}
                onClick={() => setModo(id)}
                className="flex items-center gap-1.5 px-3 py-2 font-mono text-[10px] tracking-widest transition-all border-r last:border-r-0"
                style={{
                  borderColor: '#CEC8BC',
                  background: ativo ? '#D7D2C7' : 'transparent',
                  color: ativo ? '#1A1714' : '#625E57',
                }}
              >
                <Icon size={12} />
                {id.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {visiveis.length === 0 && (
        <div className="py-12 text-center font-mono text-[11px] tracking-widest" style={{ color: '#736B5E' }}>
          NENHUMA MESA ENCONTRADA PARA “{busca.toUpperCase()}”
        </div>
      )}

      {/* Mapa por setor */}
      {modo === 'mapa' &&
        areasVisiveis.map(a => {
          const doSetor = visiveis.filter(t => t.area === a.id);
          if (doSetor.length === 0) return null;
          const ocupadasNoSetor = doSetor.filter(t => t.tab).length;
          return (
            <section key={a.id} className="mb-10">
              <div className="flex items-baseline justify-between gap-3 border-b pb-2 mb-4" style={{ borderColor: '#CEC8BC' }}>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: '#DD3E22' }}>
                    {a.setor}
                  </span>
                  <span className="font-display font-bold text-lg tracking-widest" style={{ color: '#1A1714' }}>
                    {a.label.toUpperCase()}
                  </span>
                </div>
                <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                  {ocupadasNoSetor} / {doSetor.length} EM USO
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {doSetor.map(t => (
                  <TableCard
                    key={t.id}
                    table={t}
                    destacada={!!termo && combina(t)}
                    onOpen={() => setSelecionada(t.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

      {/* Lista */}
      {modo === 'lista' && visiveis.length > 0 && (
        <ListaDeMesas tables={visiveis} onOpen={id => setSelecionada(id)} />
      )}

      {/* Legenda */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-8 pt-4 border-t" style={{ borderColor: '#CEC8BC' }}>
        {(Object.keys(TABLE_STATUS_LABELS) as TableStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest" style={{ color: STATUS_ACCENT[s] }}>
            <StatusIcon status={s} size={10} />
            {TABLE_STATUS_LABELS[s].toUpperCase()}
          </span>
        ))}
      </div>

      {selecionada && <TableTab tableId={selecionada} onClose={() => setSelecionada(null)} />}
    </div>
  );
}
