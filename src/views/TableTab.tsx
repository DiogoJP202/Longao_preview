import { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Users,
  ArrowLeftRight,
  Link2,
  Receipt,
  Percent,
  Ban,
  UserCog,
  Check,
  ChevronRight,
  Split,
  History,
} from 'lucide-react';
import { useApp } from '../context';
import {
  AREAS,
  CANCEL_REASONS,
  DISCOUNT_REASONS,
  OPERADOR,
  PAYMENT_METHOD_LABELS,
  TABLE_STATUS_LABELS,
} from '../dataTables';
import type { CafeTable, Tab, TabPaymentMethod, DiscountKind } from '../types';
import {
  formatBRL,
  formatDuracao,
  formatHora,
  itensAtivos,
  pago,
  restante,
  subtotal,
  total,
  valorDoDesconto,
} from '../tabMath';

type Modal =
  | null
  | 'transferir'
  | 'juntar'
  | 'dividir'
  | 'pagamento'
  | 'cancelar'
  | 'desconto'
  | 'cliente'
  | 'encerrar';

// ─── Peças reaproveitadas ─────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col" style={{ background: '#E5E2DB' }}>
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      <button
        onClick={onClose}
        className="shrink-0 py-3 border-t font-mono text-[11px] tracking-widest"
        style={{ borderColor: '#CEC8BC', color: '#625E57' }}
      >
        CANCELAR
      </button>
    </div>
  );
}

function TituloModal({ tag, titulo }: { tag: string; titulo: string }) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] tracking-widest mb-1" style={{ color: '#625E57' }}>
        {tag}
      </div>
      <h3 className="font-display font-black text-2xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
        {titulo}
      </h3>
    </div>
  );
}

function BotaoPrimario({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3.5 font-display font-bold text-lg tracking-widest transition-all duration-150"
      style={{
        background: disabled ? '#D7D2C7' : '#DD3E22',
        color: disabled ? '#736B5E' : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Contador({ valor, onChange, min = 1 }: { valor: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex items-center border w-fit" style={{ borderColor: '#CEC8BC' }}>
      <button
        onClick={() => onChange(Math.max(min, valor - 1))}
        className="px-4 py-3"
        style={{ color: '#625E57' }}
        aria-label="Diminuir"
      >
        <Minus size={14} />
      </button>
      <span className="font-display font-black text-2xl w-12 text-center" style={{ color: '#1A1714' }}>
        {valor}
      </span>
      <button
        onClick={() => onChange(valor + 1)}
        className="px-4 py-3"
        style={{ color: '#625E57' }}
        aria-label="Aumentar"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  borderColor: '#CEC8BC',
  color: '#1A1714',
};

function Opcoes({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { id: string; label: string }[];
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opcoes.map(o => {
        const ativo = valor === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="px-4 py-2.5 text-[13px] border transition-all duration-100"
            style={{
              borderColor: ativo ? '#DD3E22' : '#CEC8BC',
              background: ativo ? '#DD3E22' : 'transparent',
              color: ativo ? 'white' : '#1A1714',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MesaResumo({ t }: { t: CafeTable }) {
  return (
    <div className="border p-3" style={{ borderColor: '#CEC8BC', background: '#EFECE6' }}>
      <div className="font-display font-black text-lg" style={{ color: '#1A1714' }}>
        {t.label}
      </div>
      <div className="font-mono text-[10px] tracking-widest mt-0.5" style={{ color: '#625E57' }}>
        {TABLE_STATUS_LABELS[t.status].toUpperCase()}
      </div>
    </div>
  );
}

// ─── Abertura de comanda ──────────────────────────────────────────────────────

function AbrirComanda({ table, onClose }: { table: CafeTable; onClose: () => void }) {
  const { openTab } = useApp();
  const [nome, setNome] = useState('');
  const [pessoas, setPessoas] = useState(2);
  const [obs, setObs] = useState('');

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="ABRIR COMANDA" titulo={table.label} />

      <Campo label="NOME DO CLIENTE (OPCIONAL)">
        <input
          value={nome}
          onChange={e => setNome(e.target.value.toUpperCase())}
          placeholder="Ex.: FLAVIA"
          className="w-full px-4 py-3 text-[15px] outline-none border bg-transparent font-display font-bold tracking-wide"
          style={inputStyle}
        />
      </Campo>

      <Campo label="NÚMERO DE PESSOAS">
        <Contador valor={pessoas} onChange={setPessoas} />
      </Campo>

      <Campo label="OBSERVAÇÃO (OPCIONAL)">
        <input
          value={obs}
          onChange={e => setObs(e.target.value)}
          placeholder="Digite uma observação..."
          className="w-full px-4 py-3 text-[13px] outline-none border bg-transparent"
          style={inputStyle}
        />
      </Campo>

      <BotaoPrimario
        onClick={() => {
          openTab(table.id, { customer: nome, people: pessoas, note: obs || undefined });
          onClose();
        }}
      >
        ABRIR COMANDA
      </BotaoPrimario>
    </div>
  );
}

// ─── Modais de ação ───────────────────────────────────────────────────────────

function Transferir({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { tables, transferTable } = useApp();
  const [destino, setDestino] = useState<string | null>(null);
  const livres = tables.filter(t => t.status === 'free' && t.id !== table.id);
  const escolhida = tables.find(t => t.id === destino);

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="TRANSFERIR COMANDA" titulo="MOVER PARA OUTRA MESA" />

      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
          MESA ATUAL
        </div>
        <MesaResumo t={table} />
        <div className="text-center py-2 font-mono text-lg" style={{ color: '#DD3E22' }}>
          ↓
        </div>
        <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
          MOVER PARA
        </div>
        {livres.length === 0 ? (
          <div className="font-mono text-[11px] py-4" style={{ color: '#736B5E' }}>
            NENHUMA MESA LIVRE NO MOMENTO
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {livres.map(t => {
              const ativo = destino === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setDestino(t.id)}
                  className="border p-3 text-left transition-all duration-100"
                  style={{
                    borderColor: ativo ? '#DD3E22' : '#CEC8BC',
                    background: ativo ? '#F9E6E0' : 'transparent',
                  }}
                >
                  <div className="font-display font-black text-lg" style={{ color: '#1A1714' }}>
                    {t.label}
                  </div>
                  <div className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                    LIVRE · {AREAS.find(a => a.id === t.area)?.label.toUpperCase()}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {escolhida && (
        <div className="mb-4 text-[13px]" style={{ color: '#1A1714' }}>
          Transferir comanda para {escolhida.label}?
        </div>
      )}

      <BotaoPrimario
        disabled={!destino}
        onClick={() => {
          if (destino) transferTable(table.id, destino);
          onDone();
        }}
      >
        CONFIRMAR TRANSFERÊNCIA
      </BotaoPrimario>
    </div>
  );
}

function Juntar({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { tables, mergeTables } = useApp();
  const [alvo, setAlvo] = useState<string | null>(null);
  // Só faz sentido juntar mesas que não estão já dentro de outro grupo.
  const candidatas = tables.filter(t => t.id !== table.id && !t.mergedInto && !t.mergedWith?.length);

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="JUNTAR MESAS" titulo={`${table.label} + …`} />
      <div className="font-mono text-[10px] tracking-widest mb-3" style={{ color: '#625E57' }}>
        A COMANDA FICA NA {table.label}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-5">
        {candidatas.map(t => {
          const ativo = alvo === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setAlvo(t.id)}
              className="border p-3 text-left transition-all duration-100"
              style={{ borderColor: ativo ? '#DD3E22' : '#CEC8BC', background: ativo ? '#F9E6E0' : 'transparent' }}
            >
              <div className="font-display font-black text-lg" style={{ color: '#1A1714' }}>
                {t.label}
              </div>
              <div className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                {TABLE_STATUS_LABELS[t.status].toUpperCase()}
                {t.tab ? ` · ${formatBRL(total(t.tab))}` : ''}
              </div>
            </button>
          );
        })}
      </div>
      <BotaoPrimario
        disabled={!alvo}
        onClick={() => {
          if (alvo) mergeTables(table.id, alvo);
          onDone();
        }}
      >
        JUNTAR MESAS
      </BotaoPrimario>
    </div>
  );
}

function Pagamento({
  table,
  valorSugerido,
  onDone,
}: {
  table: CafeTable;
  valorSugerido: number;
  onDone: () => void;
}) {
  const { registerPayment } = useApp();
  const tab = table.tab!;
  const emAberto = restante(tab);
  const [metodo, setMetodo] = useState<TabPaymentMethod>('pix');
  const [valor, setValor] = useState(String(valorSugerido.toFixed(2)).replace('.', ','));

  const numero = Math.min(parseFloat(valor.replace(',', '.')) || 0, emAberto);
  const valido = numero > 0;

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="PAGAMENTO" titulo={table.label} />

      <Campo label="VALOR A RECEBER">
        <div className="flex items-center border px-4" style={{ borderColor: '#CEC8BC' }}>
          <span className="font-mono text-[13px]" style={{ color: '#625E57' }}>
            R$
          </span>
          <input
            value={valor}
            onChange={e => setValor(e.target.value.replace(/[^\d,.]/g, ''))}
            inputMode="decimal"
            className="w-full px-3 py-3 bg-transparent outline-none font-display font-black text-2xl"
            style={{ color: '#1A1714' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
          <span>EM ABERTO {formatBRL(emAberto)}</span>
          <button onClick={() => setValor(emAberto.toFixed(2).replace('.', ','))} style={{ color: '#DD3E22' }}>
            PAGAR TUDO
          </button>
        </div>
      </Campo>

      <Campo label="FORMA DE PAGAMENTO">
        <Opcoes
          opcoes={(Object.keys(PAYMENT_METHOD_LABELS) as TabPaymentMethod[]).map(m => ({
            id: m,
            label: PAYMENT_METHOD_LABELS[m],
          }))}
          valor={metodo}
          onChange={v => setMetodo(v as TabPaymentMethod)}
        />
      </Campo>

      <div className="border-t pt-4 mb-5 space-y-1.5" style={{ borderColor: '#CEC8BC' }}>
        <div className="flex justify-between text-[13px]" style={{ color: '#625E57' }}>
          <span>Pago agora</span>
          <span className="font-mono">{formatBRL(numero)}</span>
        </div>
        <div className="flex justify-between text-[13px]" style={{ color: '#1A1714' }}>
          <span>Restante</span>
          <span className="font-mono">{formatBRL(Math.max(0, emAberto - numero))}</span>
        </div>
      </div>

      <BotaoPrimario
        disabled={!valido}
        onClick={() => {
          registerPayment(table.id, metodo, numero);
          onDone();
        }}
      >
        REGISTRAR PAGAMENTO
      </BotaoPrimario>
    </div>
  );
}

function Dividir({ table, onPagar, onDone }: { table: CafeTable; onPagar: (v: number) => void; onDone: () => void }) {
  const tab = table.tab!;
  const emAberto = restante(tab);
  const [metodo, setMetodo] = useState<'pessoa' | 'valor' | 'item'>('pessoa');
  const [pessoas, setPessoas] = useState(tab.people || 2);
  const [valorTexto, setValorTexto] = useState('');
  const [marcados, setMarcados] = useState<string[]>([]);

  const porPessoa = pessoas > 0 ? emAberto / pessoas : 0;
  const valorDigitado = Math.min(parseFloat(valorTexto.replace(',', '.')) || 0, emAberto);

  // Divisão por item trabalha com unidades, para o cliente pagar só o que consumiu.
  const unidades = itensAtivos(tab).flatMap(i =>
    Array.from({ length: i.quantity }, (_, k) => ({
      chave: `${i.id}-${k}`,
      nome: i.name,
      preco: i.price,
      customizations: i.customizations,
    }))
  );
  const totalMarcado = unidades.filter(u => marcados.includes(u.chave)).reduce((s, u) => s + u.preco, 0);

  const valorAPagar = metodo === 'pessoa' ? porPessoa : metodo === 'valor' ? valorDigitado : totalMarcado;

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="DIVIDIR CONTA" titulo={formatBRL(emAberto)} />

      <Campo label="COMO DIVIDIR">
        <Opcoes
          opcoes={[
            { id: 'pessoa', label: 'Por pessoa' },
            { id: 'valor', label: 'Por valor' },
            { id: 'item', label: 'Por item' },
          ]}
          valor={metodo}
          onChange={v => setMetodo(v as typeof metodo)}
        />
      </Campo>

      {metodo === 'pessoa' && (
        <>
          <Campo label="NÚMERO DE PESSOAS">
            <Contador valor={pessoas} onChange={setPessoas} />
          </Campo>
          <div className="border p-5 mb-5 text-center" style={{ borderColor: '#CEC8BC', background: '#EFECE6' }}>
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
              CADA PESSOA PAGA
            </div>
            <div className="font-display font-black text-4xl" style={{ color: '#1A1714' }}>
              {formatBRL(porPessoa)}
            </div>
          </div>
        </>
      )}

      {metodo === 'valor' && (
        <Campo label="VALOR A PAGAR AGORA">
          <div className="flex items-center border px-4" style={{ borderColor: '#CEC8BC' }}>
            <span className="font-mono text-[13px]" style={{ color: '#625E57' }}>
              R$
            </span>
            <input
              value={valorTexto}
              onChange={e => setValorTexto(e.target.value.replace(/[^\d,.]/g, ''))}
              inputMode="decimal"
              placeholder="0,00"
              className="w-full px-3 py-3 bg-transparent outline-none font-display font-black text-2xl"
              style={{ color: '#1A1714' }}
            />
          </div>
          <div className="flex justify-between mt-3 text-[13px]">
            <span style={{ color: '#625E57' }}>Pago agora</span>
            <span className="font-mono" style={{ color: '#1A1714' }}>
              {formatBRL(valorDigitado)}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: '#625E57' }}>Restante</span>
            <span className="font-mono" style={{ color: '#1A1714' }}>
              {formatBRL(Math.max(0, emAberto - valorDigitado))}
            </span>
          </div>
        </Campo>
      )}

      {metodo === 'item' && (
        <Campo label="SELECIONE OS ITENS">
          <div className="border" style={{ borderColor: '#CEC8BC' }}>
            {unidades.map(u => {
              const marcado = marcados.includes(u.chave);
              return (
                <button
                  key={u.chave}
                  onClick={() =>
                    setMarcados(prev =>
                      prev.includes(u.chave) ? prev.filter(k => k !== u.chave) : [...prev, u.chave]
                    )
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 border-b last:border-0 text-left"
                  style={{ borderColor: '#CEC8BC' }}
                >
                  <span
                    className="w-4 h-4 shrink-0 border flex items-center justify-center"
                    style={{
                      borderColor: marcado ? '#DD3E22' : '#B4AC9D',
                      background: marcado ? '#DD3E22' : 'transparent',
                    }}
                  >
                    {marcado && <Check size={11} color="white" strokeWidth={3} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] truncate" style={{ color: '#1A1714' }}>
                      {u.nome}
                    </span>
                    {u.customizations.length > 0 && (
                      <span className="block font-mono text-[10px] truncate" style={{ color: '#625E57' }}>
                        {u.customizations.join(' / ')}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[12px]" style={{ color: '#625E57' }}>
                    {formatBRL(u.preco)}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[13px]">
            <span style={{ color: '#625E57' }}>Selecionado</span>
            <span className="font-display font-black text-xl" style={{ color: '#1A1714' }}>
              {formatBRL(totalMarcado)}
            </span>
          </div>
        </Campo>
      )}

      <BotaoPrimario
        disabled={valorAPagar <= 0}
        onClick={() => {
          onPagar(Math.min(valorAPagar, emAberto));
          onDone();
        }}
      >
        {metodo === 'item' ? 'PAGAR SELECIONADOS' : 'RECEBER ESTA PARTE'}
      </BotaoPrimario>
    </div>
  );
}

function CancelarItens({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { cancelTabItems } = useApp();
  const tab = table.tab!;
  const [marcados, setMarcados] = useState<string[]>([]);
  const [motivo, setMotivo] = useState(CANCEL_REASONS[0]);
  const [obs, setObs] = useState('');
  const ativos = itensAtivos(tab);

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="CANCELAR ITENS" titulo={table.label} />

      <Campo label="ITENS">
        <div className="border" style={{ borderColor: '#CEC8BC' }}>
          {ativos.map(i => {
            const marcado = marcados.includes(i.id);
            return (
              <button
                key={i.id}
                onClick={() =>
                  setMarcados(prev => (prev.includes(i.id) ? prev.filter(x => x !== i.id) : [...prev, i.id]))
                }
                className="w-full flex items-center gap-3 px-4 py-3 border-b last:border-0 text-left"
                style={{ borderColor: '#CEC8BC' }}
              >
                <span
                  className="w-4 h-4 shrink-0 border flex items-center justify-center"
                  style={{ borderColor: marcado ? '#DD3E22' : '#B4AC9D', background: marcado ? '#DD3E22' : 'transparent' }}
                >
                  {marcado && <Check size={11} color="white" strokeWidth={3} />}
                </span>
                <span className="flex-1 min-w-0 text-[13px] truncate" style={{ color: '#1A1714' }}>
                  {i.quantity} × {i.name}
                </span>
                <span className="font-mono text-[12px]" style={{ color: '#625E57' }}>
                  {formatBRL(i.price * i.quantity)}
                </span>
              </button>
            );
          })}
        </div>
      </Campo>

      <Campo label="MOTIVO DO CANCELAMENTO">
        <Opcoes opcoes={CANCEL_REASONS.map(r => ({ id: r, label: r }))} valor={motivo} onChange={setMotivo} />
      </Campo>

      <Campo label="OBSERVAÇÃO (OPCIONAL)">
        <input
          value={obs}
          onChange={e => setObs(e.target.value)}
          placeholder="Digite uma observação..."
          className="w-full px-4 py-3 text-[13px] outline-none border bg-transparent"
          style={inputStyle}
        />
      </Campo>

      <BotaoPrimario
        disabled={marcados.length === 0}
        onClick={() => {
          cancelTabItems(table.id, marcados, motivo, obs || undefined);
          onDone();
        }}
      >
        CONFIRMAR CANCELAMENTO
      </BotaoPrimario>
    </div>
  );
}

function Desconto({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { applyDiscount } = useApp();
  const tab = table.tab!;
  const [escopo, setEscopo] = useState<'conta' | 'item'>('conta');
  const [itemId, setItemId] = useState<string>(itensAtivos(tab)[0]?.id ?? '');
  const [tipo, setTipo] = useState<DiscountKind>('percent');
  const [valorTexto, setValorTexto] = useState('10');
  const [motivo, setMotivo] = useState(DISCOUNT_REASONS[0]);

  const numero = parseFloat(valorTexto.replace(',', '.')) || 0;
  const item = itensAtivos(tab).find(i => i.id === itemId);
  const base = escopo === 'item' && item ? item.price * item.quantity : subtotal(tab);
  const desconto = Math.min(tipo === 'percent' ? (base * numero) / 100 : numero, base);

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="DESCONTO" titulo={table.label} />

      <Campo label="APLICAR EM">
        <Opcoes
          opcoes={[
            { id: 'conta', label: 'Conta inteira' },
            { id: 'item', label: 'Item específico' },
          ]}
          valor={escopo}
          onChange={v => setEscopo(v as typeof escopo)}
        />
      </Campo>

      {escopo === 'item' && (
        <Campo label="ITEM">
          <Opcoes
            opcoes={itensAtivos(tab).map(i => ({ id: i.id, label: `${i.quantity} × ${i.name}` }))}
            valor={itemId}
            onChange={setItemId}
          />
        </Campo>
      )}

      <Campo label="TIPO DE DESCONTO">
        <div className="flex gap-2 items-stretch">
          <Opcoes
            opcoes={[
              { id: 'percent', label: '%' },
              { id: 'value', label: 'R$' },
            ]}
            valor={tipo}
            onChange={v => setTipo(v as DiscountKind)}
          />
          <input
            value={valorTexto}
            onChange={e => setValorTexto(e.target.value.replace(/[^\d,.]/g, ''))}
            inputMode="decimal"
            className="flex-1 min-w-0 px-4 border bg-transparent outline-none font-display font-black text-xl"
            style={inputStyle}
          />
        </div>
      </Campo>

      <div className="border p-4 mb-5 space-y-1.5" style={{ borderColor: '#CEC8BC', background: '#EFECE6' }}>
        <div className="flex justify-between text-[13px]" style={{ color: '#625E57' }}>
          <span>{escopo === 'item' ? 'Item' : 'Subtotal'}</span>
          <span className="font-mono">{formatBRL(base)}</span>
        </div>
        <div className="flex justify-between text-[13px]" style={{ color: '#DD3E22' }}>
          <span>Desconto</span>
          <span className="font-mono">− {formatBRL(desconto)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: '#CEC8BC' }}>
          <span className="font-mono text-[10px] tracking-widest self-end" style={{ color: '#625E57' }}>
            TOTAL DA CONTA
          </span>
          <span className="font-display font-black text-2xl" style={{ color: '#1A1714' }}>
            {formatBRL(subtotal(tab) - desconto)}
          </span>
        </div>
      </div>

      <Campo label="MOTIVO">
        <Opcoes opcoes={DISCOUNT_REASONS.map(r => ({ id: r, label: r }))} valor={motivo} onChange={setMotivo} />
      </Campo>

      <div className="font-mono text-[10px] tracking-widest mb-4" style={{ color: '#736B5E' }}>
        APLICADO POR: {OPERADOR.toUpperCase()}
      </div>

      <BotaoPrimario
        disabled={desconto <= 0}
        onClick={() => {
          applyDiscount(table.id, {
            kind: tipo,
            amount: numero,
            reason: motivo,
            by: OPERADOR,
            at: new Date(),
            itemId: escopo === 'item' ? itemId : undefined,
          });
          onDone();
        }}
      >
        APLICAR DESCONTO
      </BotaoPrimario>
    </div>
  );
}

function EditarCliente({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { updateTabCustomer } = useApp();
  const tab = table.tab!;
  const [nome, setNome] = useState(tab.customer);
  const [pessoas, setPessoas] = useState(tab.people);

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="EDITAR CLIENTE" titulo={table.label} />
      <Campo label="NOME DO CLIENTE">
        <input
          value={nome}
          onChange={e => setNome(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 text-[15px] outline-none border bg-transparent font-display font-bold tracking-wide"
          style={inputStyle}
        />
      </Campo>
      <Campo label="NÚMERO DE PESSOAS">
        <Contador valor={pessoas} onChange={setPessoas} />
      </Campo>
      <BotaoPrimario
        onClick={() => {
          updateTabCustomer(table.id, nome, pessoas);
          onDone();
        }}
      >
        SALVAR
      </BotaoPrimario>
    </div>
  );
}

function Encerrar({ table, onDone }: { table: CafeTable; onDone: () => void }) {
  const { closeTab } = useApp();
  const tab = table.tab!;
  const emAberto = restante(tab);
  const quitada = emAberto <= 0;

  return (
    <div className="p-5 sm:p-6">
      <TituloModal tag="ENCERRAR COMANDA" titulo={table.label} />

      {quitada ? (
        <div className="border p-6 mb-6 text-center" style={{ borderColor: '#26663F', background: '#E3EFE6' }}>
          <Check size={28} strokeWidth={2.5} style={{ color: '#26663F' }} className="mx-auto mb-3" />
          <div className="font-display font-black text-2xl tracking-widest" style={{ color: '#1A1714' }}>
            PAGAMENTO CONCLUÍDO
          </div>
          <div className="font-mono text-[11px] tracking-widest mt-1" style={{ color: '#26663F' }}>
            NADA EM ABERTO NESTA COMANDA
          </div>
        </div>
      ) : (
        <div className="border p-5 mb-6" style={{ borderColor: '#DD3E22', background: '#F9E6E0' }}>
          <div className="text-[14px] mb-1" style={{ color: '#1A1714' }}>
            Ainda há <strong>{formatBRL(emAberto)}</strong> em aberto nesta comanda.
          </div>
          <div className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
            ENCERRAR AGORA LIBERA A MESA SEM RECEBER O SALDO
          </div>
        </div>
      )}

      <BotaoPrimario
        onClick={() => {
          closeTab(table.id);
          onDone();
        }}
      >
        {quitada ? 'ENCERRAR COMANDA' : 'ENCERRAR MESMO ASSIM'}
      </BotaoPrimario>
    </div>
  );
}

// ─── Painel principal ─────────────────────────────────────────────────────────

function Acao({
  icone: Icone,
  label,
  onClick,
  destaque,
}: {
  icone: React.FC<{ size?: number; strokeWidth?: number }>;
  label: string;
  onClick: () => void;
  destaque?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-4 py-3 border text-left transition-all duration-150"
      style={{
        borderColor: destaque ? '#DD3E22' : '#CEC8BC',
        background: destaque ? '#DD3E22' : 'transparent',
        color: destaque ? 'white' : '#1A1714',
      }}
    >
      <Icone size={14} strokeWidth={1.8} />
      <span className="text-[13px] font-medium">{label}</span>
    </button>
  );
}

function GrupoDeAcoes({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#736B5E' }}>
        {titulo}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function Comanda({ table, tab }: { table: CafeTable; tab: Tab }) {
  const sub = subtotal(tab);
  const desc = valorDoDesconto(tab);
  const tot = total(tab);
  const jaPago = pago(tab);
  const falta = restante(tab);

  return (
    <>
      {/* Itens */}
      <div className="border-t" style={{ borderColor: '#CEC8BC' }}>
        {tab.items.length === 0 && (
          <div className="py-6 font-mono text-[11px] tracking-widest" style={{ color: '#736B5E' }}>
            NENHUM ITEM LANÇADO
          </div>
        )}
        {tab.items.map(i => {
          const cancelado = !!i.cancellation;
          return (
            <div key={i.id} className="flex items-start justify-between gap-3 py-3 border-b" style={{ borderColor: '#CEC8BC' }}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]" style={{ color: cancelado ? '#736B5E' : '#DD3E22' }}>
                    {i.quantity} ×
                  </span>
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{
                      color: cancelado ? '#736B5E' : '#1A1714',
                      textDecoration: cancelado ? 'line-through' : 'none',
                    }}
                  >
                    {i.name}
                  </span>
                </div>
                {i.customizations.length > 0 && (
                  <div className="ml-6 mt-0.5 font-mono text-[10px]" style={{ color: '#625E57' }}>
                    {i.customizations.join(' / ')}
                  </div>
                )}
                {cancelado && (
                  <div className="ml-6 mt-1 font-mono text-[9px] tracking-widest" style={{ color: '#DD3E22' }}>
                    CANCELADO — {i.cancellation!.reason.toUpperCase()}
                    {i.cancellation!.note ? ` · ${i.cancellation!.note}` : ''}
                  </div>
                )}
              </div>
              <span
                className="font-mono text-[12px] shrink-0"
                style={{
                  color: cancelado ? '#736B5E' : '#1A1714',
                  textDecoration: cancelado ? 'line-through' : 'none',
                }}
              >
                {formatBRL(i.price * i.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totais */}
      <div className="py-4 space-y-1.5">
        <div className="flex justify-between text-[13px]" style={{ color: '#625E57' }}>
          <span>Subtotal</span>
          <span className="font-mono">{formatBRL(sub)}</span>
        </div>
        {desc > 0 && (
          <div className="flex justify-between text-[13px]" style={{ color: '#DD3E22' }}>
            <span>
              Desconto {tab.discount?.kind === 'percent' ? `${tab.discount.amount}%` : ''} · {tab.discount?.reason}
            </span>
            <span className="font-mono">− {formatBRL(desc)}</span>
          </div>
        )}
        {jaPago > 0 && (
          <div className="flex justify-between text-[13px]" style={{ color: '#26663F' }}>
            <span>Pago</span>
            <span className="font-mono">− {formatBRL(jaPago)}</span>
          </div>
        )}
        <div className="flex items-end justify-between pt-2 border-t" style={{ borderColor: '#CEC8BC' }}>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
            {jaPago > 0 ? 'RESTANTE' : 'TOTAL'}
          </span>
          <span className="font-display font-black text-3xl leading-none" style={{ color: '#1A1714' }}>
            {formatBRL(jaPago > 0 ? falta : tot)}
          </span>
        </div>
      </div>

      {/* Pagamentos */}
      {tab.payments.length > 0 && (
        <div className="mb-4">
          <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: '#736B5E' }}>
            PAGAMENTOS
          </div>
          {tab.payments.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#CEC8BC' }}>
              <span className="font-mono text-[11px] tracking-widest" style={{ color: '#26663F' }}>
                {PAYMENT_METHOD_LABELS[p.method].toUpperCase()}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-[12px]" style={{ color: '#1A1714' }}>
                  {formatBRL(p.amount)}
                </span>
                <span className="font-mono text-[10px]" style={{ color: '#736B5E' }}>
                  {formatHora(p.at)}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {table.mergedWith && table.mergedWith.length > 0 && (
        <div className="border px-4 py-2.5 mb-4 font-mono text-[10px] tracking-widest" style={{ borderColor: '#B4AC9D', color: '#625E57' }}>
          COMANDA CONJUNTA — {table.mergedWith.length + 1} MESAS
        </div>
      )}
    </>
  );
}

function Historico({ tab }: { tab: Tab }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="mt-2 mb-4">
      <button
        onClick={() => setAberto(a => !a)}
        className="flex items-center gap-2 font-mono text-[9px] tracking-widest"
        style={{ color: '#736B5E' }}
      >
        <History size={11} />
        HISTÓRICO
        <ChevronRight
          size={11}
          style={{ transform: aberto ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}
        />
      </button>
      {aberto && (
        <div className="mt-3 border-l pl-4 space-y-2.5" style={{ borderColor: '#CEC8BC' }}>
          {[...tab.timeline].reverse().map(e => (
            <div key={e.id} className="flex gap-3">
              <span className="font-mono text-[10px] shrink-0" style={{ color: '#736B5E' }}>
                {formatHora(e.at)}
              </span>
              <span className="text-[12px]" style={{ color: '#625E57' }}>
                {e.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TableTab({ tableId, onClose }: { tableId: string; onClose: () => void }) {
  const { tables, setView, setPosTarget, requestPayment, unmergeTable } = useApp();
  const [modal, setModal] = useState<Modal>(null);
  const [valorSugerido, setValorSugerido] = useState(0);

  const table = tables.find(t => t.id === tableId);
  if (!table) return null;

  const tab = table.tab;
  const anfitria = table.mergedInto ? tables.find(t => t.id === table.mergedInto) : null;

  const abrirPagamento = (valor: number) => {
    setValorSugerido(valor);
    setModal('pagamento');
  };

  const painel = (
    <div className="p-5 sm:p-6">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 className="font-display font-black text-3xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
            {table.label}
          </h2>
          {tab && (
            <>
              <div className="font-display font-bold text-lg tracking-wide mt-1" style={{ color: '#DD3E22' }}>
                {tab.customer}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[10px] tracking-widest" style={{ color: '#625E57' }}>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {tab.people} {tab.people === 1 ? 'PESSOA' : 'PESSOAS'}
                </span>
                <span>ABERTA HÁ {formatDuracao(tab.openedAt)}</span>
              </div>
              {tab.note && (
                <div className="mt-2 text-[12px] italic" style={{ color: '#736B5E' }}>
                  {tab.note}
                </div>
              )}
            </>
          )}
          {!tab && !anfitria && (
            <div className="font-mono text-[11px] tracking-widest mt-2" style={{ color: '#625E57' }}>
              {TABLE_STATUS_LABELS[table.status].toUpperCase()} ·{' '}
              {AREAS.find(a => a.id === table.area)?.label.toUpperCase()} · {table.seats} LUGARES
            </div>
          )}
        </div>
        <button onClick={onClose} aria-label="Fechar" className="p-1 -mr-1 shrink-0" style={{ color: '#625E57' }}>
          <X size={20} />
        </button>
      </div>

      {/* Mesa anexada a outra */}
      {anfitria && (
        <div className="border p-5" style={{ borderColor: '#B4AC9D', background: '#EFECE6' }}>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest mb-2" style={{ color: '#625E57' }}>
            <Link2 size={12} />
            MESA JUNTADA
          </div>
          <div className="text-[13px] mb-4" style={{ color: '#1A1714' }}>
            Esta mesa faz parte da comanda da <strong>{anfitria.label}</strong>. Todo o consumo é lançado lá.
          </div>
          <button
            onClick={() => unmergeTable(anfitria.id, table.id)}
            className="w-full py-3 border font-mono text-[11px] tracking-widest"
            style={{ borderColor: '#CEC8BC', color: '#625E57' }}
          >
            SEPARAR MESA
          </button>
        </div>
      )}

      {/* Comanda aberta */}
      {tab && (
        <>
          <Comanda table={table} tab={tab} />
          <Historico tab={tab} />

          <GrupoDeAcoes titulo="COMANDA">
            <Acao
              destaque
              icone={Plus}
              label="Adicionar itens"
              onClick={() => {
                setPosTarget({ tableId: table.id, label: table.label });
                setView('pos');
              }}
            />
            <Acao
              icone={Receipt}
              label="Receber pagamento"
              onClick={() => abrirPagamento(restante(tab))}
            />
          </GrupoDeAcoes>

          <GrupoDeAcoes titulo="PAGAMENTO">
            <Acao icone={Split} label="Dividir conta" onClick={() => setModal('dividir')} />
            <Acao icone={Percent} label="Aplicar desconto" onClick={() => setModal('desconto')} />
          </GrupoDeAcoes>

          <GrupoDeAcoes titulo="MESA">
            <Acao icone={ArrowLeftRight} label="Transferir mesa" onClick={() => setModal('transferir')} />
            <Acao icone={Link2} label="Juntar mesas" onClick={() => setModal('juntar')} />
          </GrupoDeAcoes>

          <GrupoDeAcoes titulo="OUTROS">
            <Acao icone={Ban} label="Cancelar itens" onClick={() => setModal('cancelar')} />
            <Acao icone={UserCog} label="Editar cliente" onClick={() => setModal('cliente')} />
          </GrupoDeAcoes>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 pt-4 border-t" style={{ borderColor: '#CEC8BC' }}>
            {table.status !== 'awaiting_payment' && (
              <button
                onClick={() => requestPayment(table.id)}
                className="py-3 border font-mono text-[11px] tracking-widest"
                style={{ borderColor: '#8A5A0C', color: '#8A5A0C' }}
              >
                MARCAR CONTA PEDIDA
              </button>
            )}
            <button
              onClick={() => setModal('encerrar')}
              className="py-3 border font-mono text-[11px] tracking-widest"
              style={{ borderColor: '#CEC8BC', color: '#625E57' }}
            >
              ENCERRAR COMANDA
            </button>
          </div>
        </>
      )}

      {/* Mesa livre ou reservada */}
      {!tab && !anfitria && <AbrirComanda table={table} onClose={onClose} />}
    </div>
  );

  return (
    <>
      {/* Véu */}
      <button
        aria-label="Fechar painel"
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(26,23,20,0.45)' }}
      />

      {/* Painel */}
      <aside
        className="fixed inset-x-0 bottom-0 top-auto md:inset-y-0 md:left-auto md:right-0 z-50 w-full md:w-[420px] max-h-[92vh] md:max-h-none flex flex-col border-t md:border-t-0 md:border-l overflow-hidden"
        style={{ background: '#E5E2DB', borderColor: '#CEC8BC' }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto relative">
          {painel}

          {modal === 'transferir' && (
            <Overlay onClose={() => setModal(null)}>
              <Transferir
                table={table}
                onDone={() => {
                  setModal(null);
                  onClose();
                }}
              />
            </Overlay>
          )}
          {modal === 'juntar' && (
            <Overlay onClose={() => setModal(null)}>
              <Juntar table={table} onDone={() => setModal(null)} />
            </Overlay>
          )}
          {modal === 'dividir' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <Dividir table={table} onPagar={abrirPagamento} onDone={() => {}} />
            </Overlay>
          )}
          {modal === 'pagamento' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <Pagamento table={table} valorSugerido={valorSugerido} onDone={() => setModal(null)} />
            </Overlay>
          )}
          {modal === 'cancelar' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <CancelarItens table={table} onDone={() => setModal(null)} />
            </Overlay>
          )}
          {modal === 'desconto' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <Desconto table={table} onDone={() => setModal(null)} />
            </Overlay>
          )}
          {modal === 'cliente' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <EditarCliente table={table} onDone={() => setModal(null)} />
            </Overlay>
          )}
          {modal === 'encerrar' && tab && (
            <Overlay onClose={() => setModal(null)}>
              <Encerrar
                table={table}
                onDone={() => {
                  setModal(null);
                  onClose();
                }}
              />
            </Overlay>
          )}
        </div>
      </aside>
    </>
  );
}
