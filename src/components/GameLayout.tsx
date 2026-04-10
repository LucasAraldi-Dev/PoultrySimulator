import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { LayoutDashboard, Home, ShoppingCart, Settings, DollarSign, Clock, Wallet, Play, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameLayout() {
  const { pathname } = useLocation();
  const company = useGameStore(state => state.company);
  const money = useGameStore(state => state.money);
  const currentDay = useGameStore(state => state.currentDay);
  const advanceDay = useGameStore(state => state.advanceDay);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  const tasksCompleted = useGameStore(state => state.tasksCompleted);
  const completeDailyTasks = useGameStore(state => state.completeDailyTasks);

  const [isAnimatingDay, setIsAnimatingDay] = useState(false);

  // Calcula XP necessário para o próximo nível: 1000 * L^2
  const currentLevelXp = level === 1 ? 0 : 1000 * Math.pow(level - 1, 2);
  const nextLevelXp = 1000 * Math.pow(level, 2);
  const xpProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Fallback caso acesse direto pela URL sem company
  if (!company) {
    return <Outlet />;
  }

  const handleAdvanceDay = () => {
    if (!tasksCompleted) {
      alert("Conclua as tarefas diárias antes de passar o dia!");
      return;
    }
    
    setIsAnimatingDay(true);
    
    // Animação de 1.5s antes de realmente passar o dia
    setTimeout(() => {
      advanceDay(1);
      setIsAnimatingDay(false);
    }, 1500);
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
    { to: '/barns', icon: Home, label: 'Galpões' },
    { to: '/market', icon: ShoppingCart, label: 'Mercado' },
    { to: '/facilities', icon: Settings, label: 'Fábricas' },
    { to: '/finance', icon: DollarSign, label: 'Finanças' },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row relative">
      {/* Day Passing Animation Overlay */}
      <AnimatePresence>
        {isAnimatingDay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 text-white"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center flex flex-col items-center"
            >
              <Clock size={64} className="mb-4 animate-spin-slow text-indigo-400" style={{ animationDuration: '3s' }} />
              <h2 className="text-4xl font-bold mb-2">Fim do Dia {currentDay}</h2>
              <p className="text-xl text-zinc-400">Processando vendas, consumo de ração e crescimento...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar de Navegação (Bottom bar no mobile) */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0 order-last md:order-first z-40 pb-safe md:pb-0 sticky bottom-0 md:relative">
        <div className="hidden md:block p-6 text-center border-b border-zinc-800" style={{ borderBottomColor: `${company.color}40` }}>
          <h2 className="text-xl font-bold truncate px-2" style={{ color: company.color }}>{company.name}</h2>
          <span className="text-xs text-zinc-400 uppercase tracking-widest mt-1 block">Beta</span>
        </div>

        <nav className="flex-1 py-2 md:py-4 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-4 overflow-x-auto md:overflow-y-auto no-scrollbar">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-2 md:py-4 rounded-xl transition-colors whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start
                ${isActive ? 'text-white bg-white/10 md:bg-transparent' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
              `}
              style={({ isActive }) => isActive ? { md: { backgroundColor: company.color } } : {}}
            >
              <item.icon size={24} className="md:w-6 md:h-6 w-7 h-7" />
              <span className="text-[10px] md:text-base font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        {/* Top Header/Status Bar */}
        <header className="bg-white shadow-sm border-b border-zinc-200 px-4 md:px-6 py-4 flex flex-col items-stretch shrink-0 gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1 w-1/2">
              <h1 className="text-xl md:text-2xl font-bold text-zinc-800 capitalize truncate">
                {pathname.substring(1) || 'Game'}
              </h1>
              <div className="flex items-center gap-2 w-full max-w-[200px]">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: company.color }}>
                  Nvl {level}
                </span>
                <div className="flex-1 h-2.5 bg-zinc-200 rounded-full overflow-hidden relative" title={`${Math.floor(xp)} / ${nextLevelXp} XP`}>
                  <motion.div
                    className="absolute top-0 left-0 h-full rounded-full"
                    style={{ backgroundColor: company.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(0, xpProgress))}%` }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-center justify-end w-1/2">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 text-sm md:text-base">
                  <Wallet size={18} />
                  R$ {money.toFixed(2)}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100 text-sm md:text-base mt-2">
                  <Clock size={18} />
                  Dia {currentDay}
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarefas e Botão de Passar Dia */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 pt-4 border-t border-zinc-100">
            <div className="w-full md:w-auto flex-1 flex items-center justify-between md:justify-start gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className={tasksCompleted ? "text-emerald-500" : "text-amber-500"} />
                <span className="text-sm font-bold text-zinc-700">Tarefas Diárias</span>
              </div>
              {!tasksCompleted ? (
                <button 
                  onClick={completeDailyTasks}
                  className="px-4 py-3 md:py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-bold text-sm transition-colors border border-amber-200 shadow-sm"
                >
                  Verificar Granja & Mercado
                </button>
              ) : (
                <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-200">
                  Tudo Certo! ✓
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdvanceDay}
              disabled={!tasksCompleted || isAnimatingDay}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 rounded-xl font-bold text-lg md:text-base transition-all shadow-md ${
                tasksCompleted && !isAnimatingDay
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                  : 'bg-zinc-300 text-zinc-500 cursor-not-allowed shadow-none'
              }`}
            >
              <Play size={24} className="fill-current" />
              Passar o Dia
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
