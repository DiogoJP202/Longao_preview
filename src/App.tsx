import { useState } from 'react';
import { AppProvider, useApp, DEMO_STEPS } from './context';
import type { AppView } from './types';
import Overview from './views/Overview';
import POS from './views/POS';
import Production from './views/Production';
import Pickup from './views/Pickup';
import Mobile from './views/Mobile';
import MenuAdmin from './views/MenuAdmin';
import Reports from './views/Reports';
import {
  LayoutGrid,
  Plus,
  Layers,
  Monitor,
  Smartphone,
  BookOpen,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Menu,
} from 'lucide-react';

const NAV: { id: AppView; label: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'overview', label: 'Visão geral', Icon: LayoutGrid },
  { id: 'pos', label: 'Novo pedido', Icon: Plus },
  { id: 'production', label: 'Produção', Icon: Layers },
  { id: 'pickup', label: 'Retirada', Icon: Monitor },
  { id: 'mobile', label: 'QR Code', Icon: Smartphone },
  { id: 'menu', label: 'Cardápio', Icon: BookOpen },
  { id: 'reports', label: 'Relatórios', Icon: BarChart2 },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { view, setView } = useApp();

  return (
    <>
      {/* Véu de toque para fechar a gaveta — só existe no mobile */}
      {open && (
        <button
          aria-label="Fechar menu"
          onClick={onClose}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(26,23,20,0.45)' }}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col shrink-0 w-[220px] md:w-[200px] h-full border-r transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{ background: '#DCD7CC', borderColor: '#CEC8BC' }}
      >
        {/* Wordmark */}
        <div className="px-5 pt-7 pb-5 border-b flex items-start justify-between" style={{ borderColor: '#CEC8BC' }}>
          <div>
            <div className="font-display font-black text-3xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
              LONGÃO
            </div>
            <div className="mt-1.5 font-mono text-[9px] tracking-widest" style={{ color: '#625E57' }}>
              CAFÉ / CORRIDA / VILA BUARQUE
            </div>
          </div>
          <button onClick={onClose} aria-label="Fechar menu" className="md:hidden -mr-1 p-1" style={{ color: '#625E57' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setView(id);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-5 py-3 md:py-2.5 text-left transition-all duration-150"
                style={{
                  background: active ? '#D7D2C7' : 'transparent',
                  color: active ? '#1A1714' : '#625E57',
                  borderLeft: `2px solid ${active ? '#DD3E22' : 'transparent'}`,
                }}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[13px] font-medium tracking-wide">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: '#CEC8BC' }}>
          <button
            className="flex items-center gap-3 transition-colors"
            style={{ color: '#625E57' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#1A1714')}
            onMouseLeave={e => (e.currentTarget.style.color = '#625E57')}
          >
            <Settings size={14} strokeWidth={1.5} />
            <span className="text-[13px]">Configurações</span>
          </button>
          <div className="mt-3 font-mono text-[9px] tracking-widest" style={{ color: '#736B5E' }}>
            LONGÃO OS v0.1
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onOpen }: { onOpen: () => void }) {
  const { view } = useApp();
  const label = NAV.find(n => n.id === view)?.label ?? '';

  return (
    <div
      className="md:hidden flex items-center gap-3 px-4 h-14 border-b shrink-0"
      style={{ background: '#DCD7CC', borderColor: '#CEC8BC' }}
    >
      <button onClick={onOpen} aria-label="Abrir menu" className="-ml-1 p-1" style={{ color: '#1A1714' }}>
        <Menu size={20} />
      </button>
      <div className="font-display font-black text-2xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
        LONGÃO
      </div>
      <span className="font-mono text-[9px] tracking-widest truncate" style={{ color: '#625E57' }}>
        {label.toUpperCase()}
      </span>
    </div>
  );
}

function DemoBar() {
  const { demoMode, demoStep, nextDemoStep, prevDemoStep, stopDemo, startDemo } = useApp();
  const step = DEMO_STEPS[demoStep];
  const total = DEMO_STEPS.length;

  if (!demoMode) {
    return (
      <button
        onClick={startDemo}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-50 flex items-center gap-2 px-3 py-2 text-[11px] font-mono tracking-widest font-medium transition-all duration-150 border"
        style={{
          background: '#DCD7CC',
          color: '#625E57',
          borderColor: '#CEC8BC',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.color = '#1A1714';
          (e.currentTarget as HTMLElement).style.borderColor = '#DD3E22';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.color = '#625E57';
          (e.currentTarget as HTMLElement).style.borderColor = '#CEC8BC';
        }}
      >
        <Play size={10} />
        <span className="hidden sm:inline">DEMO LONGÃO</span>
        <span className="sm:hidden">DEMO</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-2 px-3 md:px-6 py-0 h-16 md:h-14 border-t"
      style={{ background: '#DD3E22', borderColor: '#B83018' }}
    >
      <button
        onClick={prevDemoStep}
        disabled={demoStep === 0}
        aria-label="Passo anterior"
        className="flex items-center gap-2 px-2 md:px-4 py-2 text-[11px] font-mono tracking-widest transition-opacity shrink-0"
        style={{ color: demoStep === 0 ? 'rgba(255,255,255,0.3)' : 'white' }}
      >
        <ChevronLeft size={16} />
        <span className="hidden md:inline">ANTERIOR</span>
      </button>

      <div className="text-center min-w-0 flex-1">
        <div className="font-mono text-[9px] md:text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
          PASSO {String(demoStep + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <div className="font-display font-bold text-sm md:text-base tracking-wide leading-tight text-white truncate">
          {step.title}
        </div>
        <div className="text-[10px] md:text-[11px] text-white/70 truncate">{step.desc}</div>
      </div>

      <div className="flex items-center gap-1 md:gap-3 shrink-0">
        <button
          onClick={nextDemoStep}
          disabled={demoStep === total - 1}
          aria-label="Próximo passo"
          className="flex items-center gap-2 px-2 md:px-4 py-2 text-[11px] font-mono tracking-widest transition-opacity"
          style={{ color: demoStep === total - 1 ? 'rgba(255,255,255,0.3)' : 'white' }}
        >
          <span className="hidden md:inline">PRÓXIMO</span>
          <ChevronRight size={16} />
        </button>
        <button
          onClick={stopDemo}
          className="p-1.5 transition-opacity hover:opacity-70"
          style={{ color: 'white' }}
          title="Fechar demo"
          aria-label="Fechar demo"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 md:px-6 py-3 font-display font-bold text-base md:text-lg tracking-widest animate-bounce whitespace-nowrap"
      style={{ background: '#DD3E22', color: 'white' }}
    >
      {toast}
    </div>
  );
}

function Shell() {
  const { view, demoMode, setView } = useApp();
  const [navOpen, setNavOpen] = useState(false);

  const VIEW_MAP: Record<AppView, React.ReactNode> = {
    overview: <Overview />,
    pos: <POS />,
    production: <Production />,
    pickup: <Pickup />,
    mobile: <Mobile />,
    menu: <MenuAdmin />,
    reports: <Reports />,
  };

  if (view === 'pickup') {
    // A Retirada é a única tela que segue escura: é uma TV vista de longe no
    // salão, onde fundo escuro com números claros lê melhor à distância.
    return (
      <div className="h-full" style={{ background: '#080807' }}>
        <Pickup />
        {/* A Retirada não tem menu — é um painel de salão. Sem esta saída
            discreta ela vira um beco sem saída durante a apresentação. */}
        <button
          onClick={() => setView('overview')}
          className="fixed top-3 left-3 md:top-4 md:left-4 z-50 flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-widest border transition-colors"
          style={{ background: 'rgba(8,8,7,0.8)', color: '#6A6660', borderColor: '#242120' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#EDEAE2';
            (e.currentTarget as HTMLElement).style.borderColor = '#DD3E22';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#6A6660';
            (e.currentTarget as HTMLElement).style.borderColor = '#242120';
          }}
        >
          <ChevronLeft size={12} />
          VOLTAR
        </button>
        <DemoBar />
        <Toast />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden" style={{ background: '#E5E2DB' }}>
      <TopBar onOpen={() => setNavOpen(true)} />
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <main className={`flex-1 min-h-0 overflow-auto relative ${demoMode ? 'pb-16 md:pb-14' : ''}`}>
        {VIEW_MAP[view]}
      </main>
      <DemoBar />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
