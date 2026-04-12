import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { 
  LayoutDashboard, 
  Home, 
  ShoppingCart, 
  Settings, 
  DollarSign, 
  Clock, 
  Wallet, 
  Play, 
  CheckSquare, 
  Loader2, 
  AlertCircle, 
  AlertTriangle,
  Calendar, 
  Users, 
  Microscope,
  Sun,
  Moon,
  Cloud,
  Coins,
  ChevronRight,
  Warehouse
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatGameDate } from '../lib/utils';

import { DilemmaModal } from './DilemmaModal';
import { BuyBarnModal } from './BuyBarnModal';
import { DailyTasksModal } from './DailyTasksModal';

export default function GameLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const company = useGameStore(state => state.company);
  const money = useGameStore(state => state.money);
  const currentDay = useGameStore(state => state.currentDay);
  const syncAdvanceDay = useGameStore(state => state.syncAdvanceDay);
  const advanceDay = useGameStore(state => state.advanceDay);
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  const level = useGameStore(state => state.level);
  const xp = useGameStore(state => state.xp);
  const gold = useGameStore(state => state.gold);
  
  const [isAnimatingDay, setIsAnimatingDay] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const weather = useGameStore(state => state.currentWeather);
  const weatherDaysLeft = useGameStore(state => state.weatherDaysLeft);
  const emergencyLoanAvailable = useGameStore(state => state.emergencyLoanAvailable);
  const takeEmergencyLoan = useGameStore(state => state.takeEmergencyLoan);
  const currentHour = useGameStore(state => state.currentHour);
  const advanceHour = useGameStore(state => state.advanceHour);
  const accelerateTask = useGameStore(state => state.accelerateTask);
  const completeTask = useGameStore(state => state.completeTask);
  const barns = useGameStore(state => state.barns);
  const gameSpeed = useGameStore(state => state.gameSpeed);
  const setGameSpeed = useGameStore(state => state.setGameSpeed);

  const pendingTasks = barns.reduce((acc, barn) => acc + barn.dailyTasks.filter(t => !t.completed).length, 0);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'SUNNY': return <Sun className="text-amber-500" size={24} />;
      case 'RAIN': return <AlertCircle className="text-blue-500" size={24} />;
      case 'HEATWAVE': return <Sun className="text-red-500" size={24} />;
      case 'COLD': return <AlertCircle className="text-cyan-500" size={24} />;
      default: return <Sun className="text-amber-500" size={24} />;
    }
  };

  const getWeatherLabel = () => {
    switch (weather) {
      case 'SUNNY': return 'Ensolarado';
      case 'RAIN': return 'Chuva Forte';
      case 'HEATWAVE': return 'Onda de Calor';
      case 'COLD': return 'Frente Fria';
      default: return 'Ensolarado';
    }
  };
  const currentLevelXp = level === 1 ? 0 : 1000 * Math.pow(level - 1, 2);
  const [moneyChanges, setMoneyChanges] = useState<{id: number, val: number, x: number, y: number}[]>([]);
  const prevMoney = useRef(money);

  useEffect(() => {
    if (prevMoney.current !== money) {
      const diff = money - prevMoney.current;
      if (Math.abs(diff) > 1) { // Ignore tiny changes
        const newChange = {
          id: Date.now() + Math.random(),
          val: diff,
          x: Math.random() * 60 - 30, // Random X offset
          y: Math.random() * 20 - 10,
        };
        setMoneyChanges(prev => [...prev, newChange]);
        setTimeout(() => {
          setMoneyChanges(prev => prev.filter(c => c.id !== newChange.id));
        }, 2000);
      }
      prevMoney.current = money;
    }
  }, [money]);

  useEffect(() => {
    barns.forEach(barn => {
      barn.dailyTasks.forEach(task => {
        if (task.startedAtHour !== undefined && !task.completed) {
          if (currentHour >= task.startedAtHour + task.durationMinutes) {
            completeTask(barn.id, task.id);
          }
        }
      });
    });
  }, [currentHour, barns, completeTask]);
  const nextLevelXp = 1000 * Math.pow(level, 2);
  const xpProgress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  // Fallback caso acesse direto pela URL sem company
  if (!company) {
    return <Outlet />;
  }

  const pendingTasksCount = barns.reduce((acc, barn) => acc + barn.dailyTasks.filter(t => !t.completed).length, 0);

  const handleAdvanceDay = () => {
    if (pendingTasksCount > 0) {
      const confirmPass = window.confirm(`Atenção: Você tem ${pendingTasksCount} tarefas não concluídas. Ignorá-las resultará em penalidades na conversão, crescimento e mortalidade do lote! Deseja avançar o dia mesmo assim?`);
      if (!confirmPass) return;
    }
    
    setIsAnimatingDay(true);
    
    // Animação de 3.5s antes de realmente passar o dia
    setTimeout(async () => {
      if (isAuthenticated) {
        await syncAdvanceDay();
      } else {
        advanceDay(1);
      }
    }, 1500); // Avança o estado após 1.5s (noite)

    setTimeout(() => {
      setIsAnimatingDay(false);
    }, 3500); // Termina animação após 3.5s (amanhecer)
  };

  const navItems = [
    { to: '/painel', icon: LayoutDashboard, label: 'Painel' },
    { to: '/galpoes', icon: Warehouse, label: 'Galpões' },
    { to: '/infra', icon: Home, label: 'Infraestrutura' },
    { to: '/mercado', icon: ShoppingCart, label: 'Mercado' },
    { to: '/rh', icon: Users, label: 'RH/Consultoria' },
    { to: '/financas', icon: DollarSign, label: 'Finanças' },
    { to: '/pesquisa', icon: Microscope, label: 'Pesquisa' },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col md:flex-row relative">
      <DilemmaModal />
      <DailyTasksModal isOpen={showTasksModal} onClose={() => setShowTasksModal(false)} />
      {/* Day Passing Animation Overlay */}
      <AnimatePresence>
        {isAnimatingDay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-zinc-950"
          >
            {/* Stars background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <motion.div
              initial={{ y: 300, opacity: 0, rotate: -45 }}
              animate={{ y: [300, -120, 300], opacity: [0, 1, 0], rotate: [-45, 0, 45] }}
              transition={{ duration: 2.2, ease: "easeInOut", times: [0, 0.5, 1] }}
              className="absolute"
            >
              <Moon size={140} className="text-indigo-300 drop-shadow-[0_0_20px_rgba(165,180,252,0.8)]" />
            </motion.div>

            <motion.div
              initial={{ y: 300, opacity: 0, rotate: -45 }}
              animate={{ y: [300, 300, -120], opacity: [0, 0, 1], rotate: [-45, -45, 0] }}
              transition={{ duration: 3.5, ease: "easeInOut", times: [0, 0.6, 1] }}
              className="absolute"
            >
              <Sun size={140} className="text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.9)]" />
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 80 }}
              animate={{ scale: [0.9, 1, 1], opacity: [0, 1, 1], y: [80, 80, 80] }}
              exit={{ scale: 1.1, opacity: 0, y: 150 }}
              transition={{ duration: 3, delay: 0.2 }}
              className="text-center flex flex-col items-center relative z-10 bg-zinc-950/60 p-8 rounded-3xl backdrop-blur-md mt-40"
            >
              <h2 className="text-5xl font-black mb-3 text-white tracking-tight drop-shadow-md">
                Dia {currentDay}
              </h2>
              <div className="h-1 w-24 bg-indigo-500 rounded-full mb-4"></div>
              <motion.p 
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 3.5, times: [0, 0.5, 1] }}
                className="text-lg font-medium tracking-wide"
              >
                <span className="text-indigo-200">A noite cai na granja...</span>
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Loan Modal */}
      <AnimatePresence>
        {emergencyLoanAvailable && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="bg-red-600 p-6 text-center text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <AlertTriangle size={48} className="mx-auto mb-3 animate-pulse text-red-200" />
                <h2 className="text-2xl font-black uppercase tracking-wider">Atenção: Saldo Negativo</h2>
                <p className="text-red-100 mt-2 font-medium">Sua granja está operando no vermelho e correndo risco de falência.</p>
              </div>
              
              <div className="p-6">
                <p className="text-zinc-600 mb-4">
                  O Banco do Brasil detectou o risco em suas finanças e preparou um <strong className="text-red-600">Empréstimo de Recuperação Emergencial</strong>. 
                </p>
                
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                    <span className="text-sm font-bold text-zinc-500">Valor do Crédito</span>
                    <span className="text-lg font-black text-emerald-600">R$ 50.000,00</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                    <span className="text-sm font-bold text-zinc-500">Juros Aplicados</span>
                    <span className="text-sm font-black text-red-500">20% Fixo</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                    <span className="text-sm font-bold text-zinc-500">Total a Pagar</span>
                    <span className="text-sm font-black text-red-600">R$ 60.000,00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-zinc-500">Carência (Prazo)</span>
                    <span className="text-sm font-black text-blue-600">60 Dias</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => takeEmergencyLoan(50000)}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2"
                  >
                    <DollarSign size={20} />
                    Aceitar Empréstimo
                  </button>
                  <p className="text-xs text-center text-zinc-400">
                    Ao aceitar, você concorda com as taxas abusivas para se salvar da falência. O valor integral será cobrado no dia {currentDay + 60}.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0 bg-zinc-50">
        {/* Top Header/Status Bar */}
        <header className="bg-white border-b border-zinc-200 px-4 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between shrink-0 gap-3 z-30 sticky top-0 shadow-sm">
          
          {/* Left: Page Title & Level */}
          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex flex-col">
              <h1 className="text-lg font-black text-zinc-900 tracking-tight capitalize">
                {navItems.find(i => i.to === pathname)?.label || 'Jogo'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                  Nvl {level}
                </span>
                <div className="w-20 h-1.5 bg-zinc-100 rounded-full overflow-hidden relative">
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

            {/* Mobile-only Resources */}
            <div className="flex lg:hidden items-center gap-2 bg-zinc-50 rounded-full px-3 py-1.5 border border-zinc-200">
              <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs">
                <Wallet size={14} /> {money > 1000 ? `${(money/1000).toFixed(1)}k` : money.toFixed(0)}
              </div>
              <div className="w-px h-3 bg-zinc-300" />
              <div className="flex items-center gap-1 text-amber-600 font-bold text-xs">
                <Coins size={14} /> {gold}
              </div>
            </div>
          </div>

          {/* Center: Desktop Resources */}
          <div className="hidden lg:flex items-center gap-4 bg-zinc-50 rounded-full px-5 py-1.5 border border-zinc-200 shadow-inner">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-sm relative">
              <Wallet size={16} /> R$ {money.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              <AnimatePresence>
                {moneyChanges.map(change => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 1, y: 0, x: change.x, scale: 1 }}
                    animate={{ opacity: 0, y: -40 + change.y, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`absolute left-4 pointer-events-none font-black text-sm z-50 drop-shadow-md ${change.val > 0 ? 'text-emerald-500' : 'text-red-500'}`}
                  >
                    {change.val > 0 ? '+' : ''}{change.val.toFixed(2)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="w-px h-4 bg-zinc-300" />
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-sm">
              <Coins size={16} /> {gold.toLocaleString()}
            </div>
            <div className="w-px h-4 bg-zinc-300" />
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
              <Calendar size={16} /> {formatGameDate(currentDay)} <span className="opacity-60 text-xs">({currentHour.toString().padStart(2, '0')}:00)</span>
            </div>
            <div className="w-px h-4 bg-zinc-300" />
            <div className="flex items-center gap-1.5 text-zinc-600 text-sm group relative cursor-help">
              {getWeatherIcon()}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                <span className="font-bold text-amber-400 block mb-1">{getWeatherLabel()}</span>
                Previsão de durar mais {weatherDaysLeft} dia(s).
                {weather === 'HEATWAVE' && ' Mortalidade aumenta sem ventilador!'}
                {weather === 'COLD' && ' Pintinhos precisam do dobro de gás!'}
                {weather === 'RAIN' && ' Maior chance de surtos de doenças!'}
              </div>
            </div>
          </div>

          {/* Right: Time Controls */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1.5 bg-zinc-100 rounded-full p-1 border border-zinc-200">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setGameSpeed(gameSpeed === 0 ? 1 : 0)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  gameSpeed === 0 ? 'bg-amber-200 text-amber-800' : 'bg-white text-zinc-700 shadow-sm'
                }`}
                title={gameSpeed === 0 ? "Retomar Jogo" : "Pausar Jogo"}
              >
                {gameSpeed === 0 ? <Play size={14} className="ml-0.5" /> : <div className="flex gap-0.5"><div className="w-1 h-3 bg-zinc-700 rounded-sm"></div><div className="w-1 h-3 bg-zinc-700 rounded-sm"></div></div>}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : gameSpeed === 2 ? 3 : 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm font-black text-xs transition-colors hover:bg-zinc-50"
                title="Velocidade do Jogo"
              >
                {gameSpeed}x
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden lg:flex items-center gap-1.5 bg-white hover:bg-zinc-50 text-zinc-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors border border-zinc-200"
                >
                  <Cloud size={14} className="text-emerald-500" />
                  Salvar
                </button>
              )}
              
              <button
                onClick={() => setShowTasksModal(true)}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all shadow-sm border ${
                  pendingTasksCount === 0 
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:bg-zinc-200' 
                    : 'bg-amber-100 border-amber-200 text-amber-700 hover:bg-amber-200'
                }`}
                title="Tarefas Diárias"
              >
                <CheckSquare size={14} />
                {pendingTasksCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {pendingTasksCount}
                  </span>
                )}
              </button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdvanceDay}
                disabled={isAnimatingDay}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs transition-all shadow-sm ${
                  pendingTasksCount === 0 && !isAnimatingDay
                    ? 'bg-zinc-900 hover:bg-black text-white' 
                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                }`}
              >
                {pendingTasksCount > 0 ? <AlertCircle size={14} /> : <ChevronRight size={14} />}
                {pendingTasksCount > 0 ? 'Pular Dia (Risco)' : 'Pular Dia'}
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Modal de Tarefas */}
      <AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
