import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import StartPage from './pages/StartPage';
import GameLayout from './components/GameLayout';
import Dashboard from './pages/Dashboard';
import BarnsPage from './pages/BarnsPage';
import MarketPage from './pages/MarketPage';
import FacilitiesPage from './pages/FacilitiesPage';
import FinancePage from './pages/FinancePage';
import RHPage from './pages/RHPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<StartPage />} />

        <Route element={<GameLayout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/galpoes" element={<BarnsPage />} />
          <Route path="/mercado" element={<MarketPage />} />
          <Route path="/fabricas" element={<FacilitiesPage />} />
          <Route path="/financas" element={<FinancePage />} />
          <Route path="/rh" element={<RHPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
