import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { Egg, Bird, Building2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { REGIONS } from '../store/constants';

const COMPANY_COLORS = [
  { id: 'emerald', name: 'Verde Esmeralda', value: '#10b981', class: 'bg-emerald-500' },
  { id: 'blue', name: 'Azul Corporativo', value: '#2563eb', class: 'bg-blue-600' },
  { id: 'orange', name: 'Laranja Rústico', value: '#f97316', class: 'bg-orange-500' },
  { id: 'purple', name: 'Roxo Premium', value: '#8b5cf6', class: 'bg-purple-500' },
  { id: 'slate', name: 'Cinza Industrial', value: '#64748b', class: 'bg-slate-500' },
];

export default function StartPage() {
  const navigate = useNavigate();
  const resetGame = useGameStore(state => state.resetGame);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState('');
  const [companyColor, setCompanyColor] = useState(COMPANY_COLORS[0].value);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selected, setSelected] = useState<'POSTURA' | 'CORTE' | null>(null);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim().length > 2) {
      setStep(2);
    }
  };

  const handleStart = () => {
    if (selected && companyName && selectedRegion) {
      resetGame(selected, companyName, companyColor, selectedRegion);
      navigate('/dashboard');
    }
  };

  const currentColorObj = COMPANY_COLORS.find(c => c.value === companyColor) || COMPANY_COLORS[0];

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div 
          className="p-8 text-center text-white transition-colors duration-500"
          style={{ backgroundColor: currentColorObj.value }}
        >
          <h1 className="text-4xl font-bold mb-2">Poultry Simulator Beta</h1>
          <p className="text-white/80">O simulador de gerenciamento avícola definitivo</p>
        </div>
        
        <div className="p-8">
          
          {step === 1 && (
            <motion.form 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleNextStep1}
              className="max-w-md mx-auto space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                  <Building2 size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-800">Registre sua Empresa</h2>
                <p className="text-zinc-500 text-sm mt-2">Dê um nome para sua nova granja e escolha a cor que representará a sua marca.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Nome da Empresa</label>
                <input 
                  type="text" 
                  required
                  minLength={3}
                  maxLength={20}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Granja São Jorge"
                  className="w-full p-4 rounded-xl border-2 border-zinc-200 focus:border-zinc-400 focus:ring-0 outline-none text-lg transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-3">Cor da Marca</label>
                <div className="flex gap-3 justify-center">
                  {COMPANY_COLORS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setCompanyColor(color.value)}
                      className={`w-12 h-12 rounded-full ${color.class} transition-all transform ${companyColor === color.value ? 'scale-110 ring-4 ring-offset-2 ring-zinc-300' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={companyName.trim().length < 3}
                className="w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: currentColorObj.value }}
              >
                Continuar
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-zinc-100 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                  <MapPin size={32} />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-800">Onde será sua Sede?</h2>
                <p className="text-zinc-500 text-sm mt-2">A região afeta diretamente o custo da terra, o valor da ração e do frete.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {Object.values(REGIONS).map(region => (
                  <div 
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedRegion === region.id 
                        ? 'bg-zinc-50 shadow-md' 
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                    style={{ borderColor: selectedRegion === region.id ? currentColorObj.value : '' }}
                  >
                    <h3 className="text-lg font-bold text-zinc-800 flex justify-between">
                      {region.name} <span className="text-zinc-400">{region.state}</span>
                    </h3>
                    <p className="text-sm text-zinc-500 mt-2 mb-3 h-10">{region.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className={`p-2 rounded ${region.feedCostModifier < 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        Ração: {region.feedCostModifier < 1 ? '-' : '+'}{Math.abs((1 - region.feedCostModifier) * 100).toFixed(0)}%
                      </div>
                      <div className={`p-2 rounded ${region.productSaleModifier > 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        Vendas: {region.productSaleModifier > 1 ? '+' : '-'}{Math.abs((1 - region.productSaleModifier) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl text-lg font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedRegion}
                  className="px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: currentColorObj.value }}
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-zinc-800">Selecione o seu primeiro Galpão</h2>
                <p className="text-zinc-500 text-sm mt-2">Como a <strong>{companyName}</strong> vai iniciar as suas operações?</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Opção 1: Postura */}
                <div 
                  onClick={() => setSelected('POSTURA')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selected === 'POSTURA' 
                      ? 'bg-zinc-50 shadow-md' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                  style={{ borderColor: selected === 'POSTURA' ? currentColorObj.value : '' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                      <Egg size={32} />
                    </div>
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-sm rounded-full font-medium">Fluxo Contínuo</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">Galpão de Postura</h3>
                  <p className="text-zinc-600 mb-4">Comece com galinhas adultas já na fase de produção. Produza ovos diariamente para ter uma renda constante.</p>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    <li className="flex items-center">✓ 500 Galinhas Prontas</li>
                    <li className="flex items-center">✓ 500kg de Ração Básica</li>
                    <li className="flex items-center">✓ Renda diária garantida</li>
                  </ul>
                </div>

                {/* Opção 2: Corte */}
                <div 
                  onClick={() => setSelected('CORTE')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selected === 'CORTE' 
                      ? 'bg-zinc-50 shadow-md' 
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                  style={{ borderColor: selected === 'CORTE' ? currentColorObj.value : '' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                      <Bird size={32} />
                    </div>
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-sm rounded-full font-medium">Ciclo por Lotes</span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">Galpão de Corte</h3>
                  <p className="text-zinc-600 mb-4">Comece com pintinhos de 1 dia. Engorde o lote e venda-o para o abatedouro para obter um lucro massivo.</p>
                  <ul className="space-y-2 text-sm text-zinc-600">
                    <li className="flex items-center">✓ 1000 Pintinhos (1 dia)</li>
                    <li className="flex items-center">✓ 500kg de Ração Básica</li>
                    <li className="flex items-center">✓ Lucro alto no fim do ciclo</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl text-lg font-bold text-zinc-500 hover:bg-zinc-100 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleStart}
                  disabled={!selected}
                  className="px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: currentColorObj.value }}
                >
                  Iniciar Simulação
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
