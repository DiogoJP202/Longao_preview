import { useApp } from '../context';
import { CATEGORIES } from '../data';

export default function MenuAdmin() {
  const { menuItems, toggleMenuAvailability } = useApp();

  const available = menuItems.filter(i => i.available).length;
  const unavailable = menuItems.filter(i => !i.available).length;

  const categoryLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label || id;

  return (
    <div className="p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-baseline gap-4 mb-2">
          <h1 className="font-display font-black text-4xl tracking-tight" style={{ color: '#1A1714' }}>
            CARDÁPIO
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] tracking-widest" style={{ color: '#26663F' }}>
            {available} DISPONÍVEIS
          </span>
          <span className="font-mono text-[10px] tracking-widest" style={{ color: unavailable > 0 ? '#DD3E22' : '#736B5E' }}>
            {unavailable} ESGOTADOS
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div
        className="border px-5 py-3 mb-8 font-mono text-[11px] tracking-widest"
        style={{ borderColor: '#B4AC9D', color: '#625E57', background: '#EFECE6' }}
      >
        CLIQUE NO STATUS PARA ALTERNAR DISPONIBILIDADE — ATUALIZA O PDV E QR CODE AUTOMATICAMENTE
      </div>

      {/* Table */}
      <div className="border" style={{ borderColor: '#CEC8BC' }}>
        {/* Header row */}
        <div
          className="grid px-5 py-3 border-b font-mono text-[10px] tracking-widest"
          style={{
            gridTemplateColumns: '1fr 140px 80px 110px',
            borderColor: '#CEC8BC',
            color: '#625E57',
          }}
        >
          <span>PRODUTO</span>
          <span>CATEGORIA</span>
          <span className="text-right">PREÇO</span>
          <span className="text-right">STATUS</span>
        </div>

        {/* Items */}
        {menuItems.map(item => (
          <div
            key={item.id}
            className="grid px-5 py-3.5 border-b last:border-0 items-center transition-all"
            style={{
              gridTemplateColumns: '1fr 140px 80px 110px',
              borderColor: '#CEC8BC',
              opacity: item.available ? 1 : 0.5,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium" style={{ color: '#1A1714' }}>
                {item.name}
              </span>
              {item.isFilteredCoffee && (
                <span
                  className="font-mono text-[8px] tracking-widest px-1.5 py-0.5"
                  style={{ background: '#F9E6E0', color: '#8A5A0C' }}
                >
                  MÉTODO
                </span>
              )}
            </div>
            <span className="text-[12px]" style={{ color: '#625E57' }}>
              {categoryLabel(item.category)}
            </span>
            <span className="text-[13px] font-mono text-right" style={{ color: '#1A1714' }}>
              R$ {item.price.toFixed(2).replace('.', ',')}
            </span>
            <div className="flex justify-end">
              <button
                onClick={() => toggleMenuAvailability(item.id)}
                className="px-3 py-1 font-mono text-[10px] tracking-widest border transition-all duration-150"
                style={{
                  borderColor: item.available ? '#26663F' : '#DD3E22',
                  color: item.available ? '#26663F' : '#DD3E22',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = item.available ? '#E3EFE6' : '#F9E6E0';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {item.available ? 'DISPONÍVEL' : 'ESGOTADO'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add note */}
      <div className="mt-6 font-mono text-[10px] tracking-widest" style={{ color: '#736B5E' }}>
        ITENS ESGOTADOS NÃO APARECEM NO PDV NEM NO QR CODE DE AUTOATENDIMENTO
      </div>
    </div>
  );
}
