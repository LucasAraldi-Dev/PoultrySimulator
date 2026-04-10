import { Link } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';

export default function Home() {
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  const company = useGameStore(state => state.company);
  const hasHydrated = useGameStore(state => state.hasHydrated);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="text-zinc-600 font-semibold">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="p-8 text-center bg-zinc-900 text-white">
          <h1 className="text-3xl font-black tracking-tight">Poultry Manager</h1>
          <p className="text-white/70 mt-2">
            Faça login/cadastro para integrar ao backend ou comece offline.
          </p>
        </div>

        <div className="p-8 space-y-3">
          {company && (
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-700">
              <div className="font-black text-zinc-900">Empresa encontrada</div>
              <div className="text-sm mt-1">
                {company.name}
              </div>
            </div>
          )}

          {company ? (
            <>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block w-full text-center px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Entrar para sincronizar
                </Link>
              )}
              <Link
                to="/painel"
                className="block w-full text-center px-6 py-3 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
              >
                Continuar no painel
              </Link>
              <Link
                to="/start"
                className="block w-full text-center px-6 py-3 rounded-xl font-bold border-2 border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors"
              >
                Criar outra empresa (offline)
              </Link>
            </>
          ) : (
            <>
          <Link
            to="/login"
            className="block w-full text-center px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Entrar
          </Link>
          <Link
            to="/register"
            className="block w-full text-center px-6 py-3 rounded-xl font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
          >
            Criar conta
          </Link>
          <Link
            to="/start"
            className="block w-full text-center px-6 py-3 rounded-xl font-bold border-2 border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            Começar offline
          </Link>

          {isAuthenticated && (
            <div className="pt-3 text-center text-sm text-zinc-500">
              Você está logado, mas ainda não iniciou uma empresa. Use “Começar offline” para criar a empresa local ou ajuste o fluxo do backend para criar a empresa no cadastro.
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
