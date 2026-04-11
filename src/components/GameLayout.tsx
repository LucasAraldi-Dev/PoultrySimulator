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
  Cloud
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatGameDate } from '../lib/utils';

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
  
  const dailyTasks = useGameStore(state => state.dailyTasks);
  const startTask = useGameStore(state => state.startTask);
  const completeTask = useGameStore(state => state.completeTask);

  const weather = useGameStore(state => state.currentWeather);
  const weatherDaysLeft = useGameStore(state => state.weatherDaysLeft);
  const emergencyLoanAvailable = useGameStore(state => state.emergencyLoanAvailable);
  const takeEmergencyLoan = useGameStore(state => state.takeEmergencyLoan);

  const getWeatherIcon = () => {
    switch (weather) {
      case 'SUNNY': return <Sun className="text-amber-500" size={24} />;
      case 'RAIN': return <AlertCircle className="text-blue-500" size={24} />; // Using alert temporarily for rain
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

  const [isAnimatingDay, setIsAnimatingDay] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [now, setNow] = useState(Date.now());
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
    setTimeout(async () => {
      if (isAuthenticated) {
        await syncAdvanceDay();
      } else {
        advanceDay(1);
      }
      setIsAnimatingDay(false);
    }, 1500);
  };

  const navItems = [
    { to: '/painel', icon: LayoutDashboard, label: 'Painel' },
    { to: '/infra', icon: Home, label: 'Infraestrutura' },
    { to: '/mercado', icon: ShoppingCart, label: 'Mercado' },
    { to: '/rh', icon: Users, label: 'RH/Consultoria' },
    { to: '/financas', icon: DollarSign, label: 'Finanças' },
    { to: '/pesquisa', icon: Microscope, label: 'Pesquisa' },
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-zinc-950"
          >
            {/* Stars background */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <motion.div
              initial={{ y: 200, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -200, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.8, ease: "backInOut" }}
              className="absolute"
            >
              <Moon size={120} className="text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.6)]" />
            </motion.div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.1, opacity: 0, y: -50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center flex flex-col items-center relative z-10"
            >
              <h2 className="text-5xl font-black mb-3 text-white tracking-tight drop-shadow-md">
                Dia {currentDay}
              </h2>
              <div className="h-1 w-24 bg-indigo-500 rounded-full mb-4"></div>
              <p className="text-lg text-indigo-200 font-medium tracking-wide">
                A noite cai na granja...
              </p>
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        {/* Top Header/Status Bar */}
        <header className="bg-white shadow-sm border-b border-zinc-200 px-4 md:px-6 py-4 flex flex-col items-stretch shrink-0 gap-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col gap-1 w-1/2">
              <h1 className="text-xl md:text-2xl font-bold text-zinc-800 capitalize truncate">
                {navItems.find(i => i.to === pathname)?.label || 'Jogo'}
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
              {!isAuthenticated && (
                <button 
                  onClick={() => navigate('/login')}
                  className="hidden md:flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-zinc-200 mr-2"
                >
                  <Cloud size={16} className="text-emerald-500" />
                  <span>Salvar na Nuvem</span>
                </button>
              )}
              {/* Weather Indicator */}
              <div className="hidden md:flex items-center gap-3 bg-zinc-100 px-4 py-2 rounded-xl shadow-inner relative group cursor-help">
                {getWeatherIcon()}
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Clima</p>
                  <p className="font-bold text-zinc-800 text-sm">{getWeatherLabel()}</p>
                </div>
                
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-zinc-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                  Previsão de durar mais {weatherDaysLeft} dia(s).
                  {weather === 'HEATWAVE' && ' Mortalidade aumenta sem ventilador!'}
                  {weather === 'COLD' && ' Pintinhos precisam do dobro de gás!'}
                  {weather === 'RAIN' && ' Maior chance de surtos de doenças!'}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold border border-emerald-100 text-sm md:text-base relative">
                  <AnimatePresence>
                    {moneyChanges.map((change) => (
                      <motion.div
                        key={change.id}
                        initial={{ opacity: 1, y: 0, x: change.x, scale: 0.5 }}
                        animate={{ opacity: 0, y: -50, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`absolute left-0 right-0 text-center pointer-events-none font-black text-lg drop-shadow-md z-50 ${change.val > 0 ? 'text-emerald-600' : 'text-red-600'}`}
                      >
                        {change.val > 0 ? '+' : '-'} R$ {Math.abs(change.val).toFixed(2)}
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
