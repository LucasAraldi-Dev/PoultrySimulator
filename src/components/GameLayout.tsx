import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { LayoutDashboard, Home, ShoppingCart, Settings, DollarSign, Clock, Wallet, Play, FastForward } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GameLayout() {
  const { pathname } = useLocation();
  const company = useGameStore(state => state.company);
  const money = useGameStore(state => state.money);
  const currentDay = useGameStore(state => state.currentDay);
  const advanceDay = useGameStore(state => state.advanceDay);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  const [showAdvanceMenu, setShowAdvanceMenu] = useState(false);

  // Calcula XP necessário para o próximo nível: 1000 * L^2
  const currentLevelXp = level === 1 ? 0 : 1000 * Math.pow(level - 1, 2);
  const nextLevelXp = 1000 * Math.pow(level, 2);
  const xpProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Fallback caso acesse direto pela URL sem company
  if (!company) {
    return <Outlet />;
  }

  const handleAdvance = (days: number) => {
    advanceDay(days);
    setShowAdvanceMenu(false);
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/barns', icon: Home, label: 'Meus Galpões' },
    { to: '/market', icon: ShoppingCart, label: 'Mercado' },
    { to: '/facilities', icon: Settings, label: 'Infraestrutura' },
    { to: '/finance', icon: DollarSign, label: 'Finanças' },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar de Navegação */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0">
        <div className="p-6 text-center border-b border-zinc-800" style={{ borderBottomColor: `${company.color}40` }}>
          <h2 className="text-xl font-bold truncate px-2" style={{ color: company.color }}>{company.name}</h2>
          <span className="text-xs text-zinc-400 uppercase tracking-widest mt-1 block">Beta</span>
        </div>
        
        <nav className="flex-1 py-4 flex flex-row md:flex-col gap-1 px-4 overflow-x-auto md:overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap
                ${isActive ? 'text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
              `}
              style={({ isActive }) => isActive ? { backgroundColor: company.color } : {}}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header/Status Bar */}
        <header className="bg-white shadow-sm border-b border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-auto min-w-[200px]">
            <h1 className="text-2xl font-bold text-zinc-800 capitalize">
              {pathname.substring(1) || 'Game'}
            </h1>
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: company.color }}>
                Nível {level}
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
          
          <div className="flex gap-4 items-center flex-wrap justify-end">
            <div className="relative">
              <div className="flex rounded-lg shadow-sm overflow-hidden border border-indigo-600">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAdvance(1)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors z-10 relative"
                >
                  <Play size={18} className="fill-current" />
                  Passar Dia
                </motion.button>
                <button
                  onClick={() => setShowAdvanceMenu(!showAdvanceMenu)}
                  className="px-2 py-2 bg-indigo-700 hover:bg-indigo-800 text-white border-l border-indigo-800 transition-colors"
                  title="Avançar mais dias"
                >
                  <FastForward size={18} className="fill-current" />
                </button>
              </div>

              {showAdvanceMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAdvanceMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-20">
                    <button 
                      onClick={() => handleAdvance(7)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 text-zinc-700 font-medium border-b border-zinc-100 flex justify-between items-center"
                    >
                      Avançar 1 Semana <span className="text-xs text-zinc-400">7d</span>
                    </button>
                    <button 
                      onClick={() => handleAdvance(30)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 text-zinc-700 font-medium flex justify-between items-center"
                    >
                      Avançar 1 Mês <span className="text-xs text-zinc-400">30d</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100">
              <Wallet size={20} />
              R$ {money.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold border border-blue-100">
              <Clock size={20} />
              Dia {currentDay}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
