import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { LayoutDashboard, Home, ShoppingCart, Settings, DollarSign, Clock, Wallet, Play, CheckSquare, Loader2, AlertCircle, Calendar, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatGameDate } from '../lib/utils';

export default function GameLayout() {
  const { pathname } = useLocation();
  const company = useGameStore(state => state.company);
  const money = useGameStore(state => state.money);
  const currentDay = useGameStore(state => state.currentDay);
  const advanceDay = useGameStore(state => state.advanceDay);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  
  const dailyTasks = useGameStore(state => state.dailyTasks);
  const startTask = useGameStore(state => state.startTask);
  const completeTask = useGameStore(state => state.completeTask);

  const [isAnimatingDay, setIsAnimatingDay] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Force re-render for active timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Update tasks that have completed their timers
  useEffect(() => {
    dailyTasks.forEach(task => {
      if (task.startedAt && !task.completed) {
        const elapsed = now - task.startedAt;
        const required = task.durationMinutes * 60 * 1000;
        if (elapsed >= required) {
          completeTask(task.id);
        }
      }
    });
  }, [now, dailyTasks, completeTask]);

  // Calcula XP necessário para o próximo nível: 1000 * L^2
  const currentLevelXp = level === 1 ? 0 : 1000 * Math.pow(level - 1, 2);
  const nextLevelXp = 1000 * Math.pow(level, 2);
  const xpProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Fallback caso acesse direto pela URL sem company
  if (!company) {
    return <Outlet />;
  }

  const pendingTasks = dailyTasks.filter(t => !t.completed).length;

  const handleAdvanceDay = () => {
    if (pendingTasks > 0) {
      const confirmPass = window.confirm(`Atenção: Você tem ${pendingTasks} tarefas não concluídas. Ignorá-las resultará em penalidades na conversão, crescimento e mortalidade do lote! Deseja avançar o dia mesmo assim?`);
      if (!confirmPass) return;
    }
    
    setIsAnimatingDay(true);
    
    // Animação de 1.5s antes de realmente passar o dia
    setTimeout(() => {
      advanceDay(1);
      setIsAnimatingDay(false);
    }, 1500);
  };

  const navItems = [
    { to: '/painel', icon: LayoutDashboard, label: 'Painel' },
    { to: '/galpoes', icon: Home, label: 'Galpões' },
    { to: '/mercado', icon: ShoppingCart, label: 'Mercado' },
    { to: '/fabricas', icon: Settings, label: 'Fábricas' },
    { to: '/rh', icon: Users, label: 'RH/Consultoria' },
    { to: '/financas', icon: DollarSign, label: 'Finanças' },
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
              style={({ isActive }) => isActive ? { backgroundColor: window.innerWidth >= 768 ? company.color : 'rgba(255,255,255,0.1)' } : {}}
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
                {pathname === '/painel' ? 'Painel' : 
                 pathname === '/galpoes' ? 'Meus Galpões' : 
                 pathname === '/mercado' ? 'Mercado' : 
                 pathname === '/fabricas' ? 'Fábricas' : 
                 pathname === '/financas' ? 'Finanças' : 'Jogo'}
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
                  <Calendar size={18} />
                  {formatGameDate(currentDay)} <span className="text-xs font-normal opacity-80">(Dia {currentDay})</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tarefas e Botão de Passar Dia */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2 pt-4 border-t border-zinc-100">
            <div className="w-full md:w-auto flex-1 flex items-center justify-between md:justify-start gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className={pendingTasks === 0 ? "text-emerald-500" : "text-amber-500"} />
                <span className="text-sm font-bold text-zinc-700">Tarefas Diárias</span>
              </div>
              <button 
                onClick={() => setShowTasksModal(true)}
                className={`px-4 py-3 md:py-2 rounded-xl font-bold text-sm transition-colors border shadow-sm ${
                  pendingTasks === 0 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'
                }`}
              >
                {pendingTasks === 0 ? 'Tudo Certo! ✓' : `${pendingTasks} Pendente(s)`}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdvanceDay}
              disabled={isAnimatingDay}
              className={`w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 rounded-xl font-bold text-lg md:text-base transition-all shadow-md ${
                pendingTasks === 0 && !isAnimatingDay
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                  : 'bg-zinc-800 hover:bg-zinc-900 text-white shadow-none'
              }`}
            >
              <Play size={24} className="fill-current" />
              {pendingTasks > 0 ? 'Forçar Fim do Dia' : 'Passar o Dia'}
            </motion.button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Modal de Tarefas */}
      <AnimatePresence>
        {showTasksModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                  <CheckSquare className="text-indigo-600" /> Tarefas Reais
                </h2>
                <button onClick={() => setShowTasksModal(false)} className="text-zinc-500 hover:text-zinc-800 font-bold px-3 py-1 bg-zinc-200 rounded-lg">Fechar</button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-white space-y-4">
                <p className="text-sm text-zinc-500 mb-2">Conclua essas tarefas no tempo real para garantir que sua granja tenha a melhor performance. Ignorar tarefas pode causar doenças, atrasar o crescimento ou aumentar a mortalidade.</p>
                
                {dailyTasks.map(task => {
                  const isStarted = task.startedAt !== null;
                  const severity = task.severity || 'MEDIA';
                  const severityLabel = severity === 'ALTA' ? 'Crítica' : severity === 'BAIXA' ? 'Básica' : 'Importante';
                  const severityClasses = severity === 'ALTA'
                    ? 'bg-red-100 text-red-700'
                    : severity === 'BAIXA'
                      ? 'bg-zinc-100 text-zinc-600'
                      : 'bg-amber-100 text-amber-700';
                  let progress = 0;
                  let timeLeftStr = "";
                  
                  if (isStarted && !task.completed) {
                    const elapsed = now - task.startedAt!;
                    const required = task.durationMinutes * 60 * 1000;
                    progress = Math.min(100, (elapsed / required) * 100);
                    
                    const leftMs = Math.max(0, required - elapsed);
                    const m = Math.floor(leftMs / 60000);
                    const s = Math.floor((leftMs % 60000) / 1000);
                    timeLeftStr = `${m}:${s.toString().padStart(2, '0')}`;
                  }

                  return (
                    <div key={task.id} className={`border rounded-xl p-4 flex flex-col gap-3 transition-colors ${task.completed ? 'bg-emerald-50 border-emerald-200' : isStarted ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-zinc-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold ${task.completed ? 'text-emerald-800' : 'text-zinc-800'}`}>{task.name}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{task.description}</p>
                        </div>
                        {task.completed ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Concluído ✓</span>
                        ) : isStarted ? (
                          <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold font-mono flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> {timeLeftStr}
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <span className={`${severityClasses} px-2 py-1 rounded text-xs font-bold`}>{severityLabel}</span>
                            <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold">{task.durationMinutes} min</span>
                          </div>
                        )}
                      </div>
                      
                      {!task.completed && (
                        <div>
                          {isStarted ? (
                            <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                              <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                            </div>
                          ) : (
                            <button 
                              onClick={() => startTask(task.id)}
                              className="w-full mt-2 py-2 bg-zinc-800 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors"
                            >
                              Iniciar Tarefa
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
