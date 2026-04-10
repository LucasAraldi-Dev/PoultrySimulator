import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useGameStore } from '../store/useGameStore';
import { Building2, User, Lock, Mail, ArrowRight, Palette } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPANY_COLORS = [
  { id: 'emerald', name: 'Verde Esmeralda', value: '#10b981', class: 'bg-emerald-500' },
  { id: 'blue', name: 'Azul Elétrico', value: '#2563eb', class: 'bg-blue-600' },
  { id: 'red', name: 'Vermelho Vivo', value: '#ef4444', class: 'bg-red-500' },
  { id: 'yellow', name: 'Amarelo Solar', value: '#eab308', class: 'bg-yellow-500' },
  { id: 'orange', name: 'Laranja Rústico', value: '#f97316', class: 'bg-orange-500' },
  { id: 'purple', name: 'Roxo Premium', value: '#8b5cf6', class: 'bg-purple-500' },
  { id: 'cyan', name: 'Ciano Neon', value: '#06b6d4', class: 'bg-cyan-500' },
  { id: 'slate', name: 'Cinza Industrial', value: '#64748b', class: 'bg-slate-500' },
];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyColor, setCompanyColor] = useState(COMPANY_COLORS[0].value);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useGameStore(state => state.setAuth);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register/', {
        username,
        email,
        password,
        company_name: companyName,
        company_color: companyColor
      });
      const { access, refresh } = response.data;
      setAuth(access, refresh);
      navigate('/');
    } catch (err: any) {
      setError('Erro ao criar conta. Verifique os dados ou se o usuário já existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden my-8"
      >
        <div className="p-8">
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tight">Criar sua Fazenda</h1>
            <p className="text-sm text-zinc-500">Salve seu progresso na nuvem com o Poultry<span className="text-emerald-500 font-bold">Manager</span></p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-bold">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Usuário</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="Login"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="********"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <hr className="border-zinc-100 my-4" />

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Nome da sua Fazenda / Empresa</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="Ex: Granja São João"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-2 flex items-center gap-1"><Palette size={14} /> Cor da Marca</label>
              <div className="flex flex-wrap gap-2">
                {COMPANY_COLORS.map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setCompanyColor(color.value)}
                    className={`w-8 h-8 rounded-full shadow-sm transition-all border-2 ${companyColor === color.value ? 'border-zinc-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Criando conta...' : 'Começar a Jogar'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-500">
            Já tem uma conta? <button onClick={() => navigate('/login')} className="text-emerald-600 font-bold hover:underline">Faça login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}