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

function Sidebar() {
  const { view, setView } = useApp();

  return (
    <aside
      className="flex flex-col shrink-0 w-[200px] h-full border-r"
      style={{ background: '#DCD7CC', borderColor: '#CEC8BC' }}
    >
      {/* Wordmark */}
      <div className="px-5 pt-7 pb-5 border-b" style={{ borderColor: '#CEC8BC' }}>
        <div className="font-display font-black text-3xl tracking-tight leading-none" style={{ color: '#1A1714' }}>
          LONGÃO
        </div>
        <div className="mt-1.5 font-mono text-[9px] tracking-widest" style={{ color: '#625E57' }}>
          CAFÉ / CORRIDA / VILA BUARQUE
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV.map(({ id, label, Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              onClick={() => setView(id)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-all duration-150"
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
      <div className="px-5 py-4 border-t" style={{ borderColor: '#CEC8BC' }}>
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
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 text-[11px] font-mono tracking-widest font-medium transition-all duration-150 border"
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
        DEMO LONGÃO
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-0 h-14 border-t"
      style={{ background: '#DD3E22', borderColor: '#B83018' }}
    >
      <button
        onClick={prevDemoStep}
        disabled={demoStep === 0}
        className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono tracking-widest transition-opacity"
        style={{ color: demoStep === 0 ? 'rgba(255,255,255,0.3)' : 'white' }}
      >
        <ChevronLeft size={14} />
        ANTERIOR
      </button>

      <div className="text-center">
        <div className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(255,255,255,0.6)' }}>
          PASSO {String(demoStep + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <div className="font-display font-bold text-base tracking-wide leading-tight text-white">
          {step.title}
        </div>
        <div className="text-[11px] text-white/70">{step.desc}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={nextDemoStep}
          disabled={demoStep === total - 1}
          className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono tracking-widest transition-opacity"
          style={{ color: demoStep === total - 1 ? 'rgba(255,255,255,0.3)' : 'white' }}
        >
          PRÓXIMO
          <ChevronRight size={14} />
        </button>
        <button
          onClick={stopDemo}
          className="p-1.5 transition-opacity hover:opacity-70"
          style={{ color: 'white' }}
          title="Fechar demo"
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
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 font-display font-bold text-lg tracking-widest animate-bounce"
      style={{ background: '#DD3E22', color: 'white' }}
    >
      {toast}
    </div>
  );
}

function Shell() {
  const { view, demoMode } = useApp();

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
        <DemoBar />
        <Toast />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: '#E5E2DB' }}>
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
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
