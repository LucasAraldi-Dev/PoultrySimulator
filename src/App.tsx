import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import StartPage from './pages/StartPage';
import GameLayout from './components/GameLayout';
import Dashboard from './pages/Dashboard';
import BarnsPage from './pages/BarnsPage';
import FacilitiesPage from './pages/FacilitiesPage';
import MarketPage from './pages/MarketPage';
import FinancePage from './pages/FinancePage';
import RHPage from './pages/RHPage';
import { ResearchPage } from './pages/ResearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Home from './pages/Home';
import { useGameLoop } from './hooks/useGameLoop';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/start" element={<StartPage />} />

        {/* Jogo liberado offline, salva localmente */}
        <Route path="/" element={<GameLayout />}>
          <Route index element={<Home />} />
            <Route path="painel" element={<Dashboard />} />
            <Route path="infra" element={<FacilitiesPage />} />
            <Route path="mercado" element={<MarketPage />} />
            <Route path="financas" element={<FinancePage />} />
            <Route path="rh" element={<RHPage />} />
            <Route path="pesquisa" element={<ResearchPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { isAuthenticated, fetchGameState, syncToServer } = useGameStore();
  useGameLoop(); // Inicia o loop de jogo contínuo

  // Ao iniciar a aplicação, se tiver token, tenta buscar os dados
  // Se falhar, ou não tiver, o jogo usa o estado inicial normal (Offline)
  useEffect(() => {
    if (isAuthenticated) {
      fetchGameState();
    }
  }, [isAuthenticated, fetchGameState]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("Conexão restabelecida. Sincronizando com o servidor...");
      syncToServer();
    };

    window.addEventListener('online', handleOnline);
    
    // Sincronização periódica a cada 30 segundos
    const syncInterval = setInterval(() => {
      if (isAuthenticated && navigator.onLine) {
        syncToServer();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(syncInterval);
    };
  }, [syncToServer, isAuthenticated]);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
