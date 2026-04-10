import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import StartPage from './pages/StartPage';
import GameLayout from './components/GameLayout';
import Dashboard from './pages/Dashboard';
import BarnsPage from './pages/BarnsPage';
import MarketPage from './pages/MarketPage';
import FacilitiesPage from './pages/FacilitiesPage';
import FinancePage from './pages/FinancePage';
import RHPage from './pages/RHPage';
import { ResearchPage } from './pages/ResearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Componente para proteger as rotas do jogo
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<StartPage />} />

        {/* Rotas protegidas (apenas logados) */}
        <Route element={<PrivateRoute><GameLayout /></PrivateRoute>}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/galpoes" element={<BarnsPage />} />
          <Route path="/mercado" element={<MarketPage />} />
          <Route path="/fabricas" element={<FacilitiesPage />} />
          <Route path="/financas" element={<FinancePage />} />
          <Route path="/rh" element={<RHPage />} />
          <Route path="/research" element={<ResearchPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const { isAuthenticated, fetchGameState } = useGameStore();

  // Ao iniciar a aplicação, se tiver token, tenta buscar os dados
  useEffect(() => {
    if (isAuthenticated) {
      fetchGameState();
    }
  }, [isAuthenticated, fetchGameState]);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
