import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { Egg, Bird, Building2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { REGIONS } from '../store/constants';

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

export default function StartPage() {
  const navigate = useNavigate();
  const resetGame = useGameStore(state => state.resetGame);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState('');
  const [companyColor, setCompanyColor] = useState(COMPANY_COLORS[0].value);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selected, setSelected] = useState<'POSTURA' | 'CORTE' | null>(null);
  const [profileAnswers, setProfileAnswers] = useState<{
    cashflow?: 'STEADY' | 'BURST';
    risk?: 'LOW' | 'HIGH';
    routine?: 'CALM' | 'INTENSE';
  }>({});

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim().length > 2) {
      setStep(2);
    }
  };

  const handleStart = () => {
    if (selected && companyName && selectedRegion) {
      resetGame(selected, companyName, companyColor, selectedRegion);
      navigate('/painel');
    }
  };


  const currentColorObj = COMPANY_COLORS.find(c => c.value === companyColor) || COMPANY_COLORS[0];

  const profileQuestions = [
    {
      id: 'cashflow' as const,
      text: 'Antes de escolher seu primeiro galpão: você prefere uma renda mais constante ou um lucro maior por ciclo?',
      options: [
        { id: 'STEADY' as const, title: 'Renda constante', desc: 'Receber um pouco todo dia e ter previsibilidade.' },
        { id: 'BURST' as const, title: 'Lucro por ciclo', desc: 'Aguardar o lote fechar para ganhar mais de uma vez.' },
      ],
    },
    {
      id: 'risk' as const,
      text: 'Como você lida com risco e variação de preço (ração, mercado)?',
      options: [
        { id: 'LOW' as const, title: 'Prefiro segurança', desc: 'Quero menos sustos no caixa e decisões mais simples.' },
        { id: 'HIGH' as const, title: 'Topo mais risco', desc: 'Aceito volatilidade para buscar margem maior.' },
      ],
    },
    {
      id: 'routine' as const,
      text: 'Você curte um jogo mais “piloto automático” ou gosta de ficar otimizando lote e timing?',
      options: [
        { id: 'CALM' as const, title: 'Mais tranquilo', desc: 'Rotina constante e crescimento no ritmo.' },
        { id: 'INTENSE' as const, title: 'Mais estratégico', desc: 'Decisões de timing e otimização de ciclo.' },
      ],
    },
  ];

  const answeredCount = profileQuestions.reduce((acc, q) => (profileAnswers[q.id] ? acc + 1 : acc), 0);
  const isProfileComplete = answeredCount === profileQuestions.length;

  const { recommendedStart, recommendationText, recommendationPros, recommendationCons } = (() => {
    let postura = 0;
    let corte = 0;

    if (profileAnswers.cashflow === 'STEADY') postura += 2;
    if (profileAnswers.cashflow === 'BURST') corte += 2;
    if (profileAnswers.risk === 'LOW') postura += 1;
    if (profileAnswers.risk === 'HIGH') corte += 1;
    if (profileAnswers.routine === 'CALM') postura += 1;
    if (profileAnswers.routine === 'INTENSE') corte += 1;

    const pick: 'POSTURA' | 'CORTE' = postura >= corte ? 'POSTURA' : 'CORTE';

    if (!isProfileComplete) {
      return {
        recommendedStart: null as 'POSTURA' | 'CORTE' | null,
        recommendationText: null as string | null,
        recommendationPros: [] as string[],
        recommendationCons: [] as string[],
      };
    }

    if (pick === 'POSTURA') {
      return {
        recommendedStart: pick,
        recommendationText: 'Pelo seu perfil, Postura combina mais com você: fluxo de caixa diário, previsível e ótimo para aprender sem travar o dinheiro em ciclos longos.',
        recommendationPros: [
          'Renda contínua (ovos todo dia)',
          'Gestão mais previsível e estável',
          'Boa base para expandir depois para outras linhas',
        ],
        recommendationCons: [
          'Margem por ave tende a ser menor',
          'Mais sensível ao custo de ração no dia a dia',
        ],
      };
    }

    return {
      recommendedStart: pick,
      recommendationText: 'Pelo seu perfil, Corte combina mais com você: foco em ciclo, otimização e lucro concentrado no fim do lote, com potencial de margens maiores.',
      recommendationPros: [
        'Lucro mais alto por lote bem conduzido',
        'Jogo mais “estratégico” de timing e decisões',
        'Sinergia forte com abatedouro e processamento',
      ],
      recommendationCons: [
        'Caixa oscila (períodos sem venda)',
        'Mais exposição a variação de custo e mercado no ciclo',
      ],
    };
  })();

  useEffect(() => {
    if (!selected && recommendedStart) setSelected(recommendedStart);
  }, [recommendedStart, selected]);

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
                <div className="flex flex-wrap gap-3 justify-center">
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {Object.values(REGIONS).map(region => (
                  <div 
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedRegion === region.id 
                        ? 'bg-zinc-50 shadow-md' 
                        : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                    }`}
                    style={{ borderColor: selectedRegion === region.id ? currentColorObj.value : '' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-zinc-800 leading-tight truncate">
                          {region.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
                          {region.description}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-xs font-bold">
                        {region.state}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold mt-4">
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

              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl text-lg font-bold text-zinc-500 hover:bg-zinc-100 transition-colors w-full sm:w-auto"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!selectedRegion}
                  className="px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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
                <h2 className="text-2xl font-semibold text-zinc-800">Vamos montar seu perfil de jogo</h2>
                <p className="text-zinc-500 text-sm mt-2">Responda rapidinho e eu sugiro o melhor início para a <strong>{companyName}</strong>.</p>
              </div>

              <div className="max-w-2xl mx-auto mb-10">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 sm:p-6 shadow-sm">
                  <div className="space-y-4">
                    {profileQuestions.map((q, idx) => {
                      const answer = profileAnswers[q.id];
                      if (!answer) {
                        const canShow = profileQuestions.slice(0, idx).every(prev => !!profileAnswers[prev.id]);
                        if (!canShow) return null;

                        return (
                          <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                          >
                            <div className="max-w-[36rem] rounded-2xl bg-white border border-zinc-200 px-4 py-3 text-zinc-800 shadow-sm">
                              <p className="text-sm font-semibold">{q.text}</p>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              {q.options.map(option => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => setProfileAnswers(prev => ({ ...prev, [q.id]: option.id }))}
                                  className="text-left rounded-2xl border border-zinc-200 bg-white px-4 py-3 hover:bg-zinc-50 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="font-bold text-zinc-900">{option.title}</p>
                                      <p className="text-xs text-zinc-600 mt-1 leading-snug">{option.desc}</p>
                                    </div>
                                    <div
                                      className="w-3.5 h-3.5 rounded-full border-2 border-zinc-300 shrink-0 mt-1"
                                      style={{ borderColor: currentColorObj.value }}
                                    />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        );
                      }

                      const chosen = q.options.find(o => o.id === answer);
                      if (!chosen) return null;

                      return (
                        <div key={q.id} className="space-y-2">
                          <div className="max-w-[36rem] rounded-2xl bg-white border border-zinc-200 px-4 py-3 text-zinc-800 shadow-sm">
                            <p className="text-sm font-semibold">{q.text}</p>
                          </div>
                          <div className="flex justify-end">
                            <div
                              className="max-w-[36rem] rounded-2xl px-4 py-3 text-white shadow-sm"
                              style={{ backgroundColor: currentColorObj.value }}
                            >
                              <p className="text-sm font-bold">{chosen.title}</p>
                              <p className="text-xs text-white/80 mt-1 leading-snug">{chosen.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isProfileComplete && recommendedStart && recommendationText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-2"
                      >
                        <div className="max-w-[44rem] rounded-2xl bg-white border border-zinc-200 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-extrabold text-zinc-900">
                                Minha sugestão: {recommendedStart === 'POSTURA' ? 'Postura' : 'Corte'}
                              </p>
                              <p className="text-sm text-zinc-700 mt-1 leading-snug">{recommendationText}</p>
                            </div>
                            <span
                              className="shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full text-white"
                              style={{ backgroundColor: currentColorObj.value }}
                            >
                              Recomendado
                            </span>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 mt-4">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                              <p className="text-xs font-extrabold text-emerald-900 uppercase tracking-wide">Prós</p>
                              <ul className="mt-2 space-y-1 text-sm text-emerald-900">
                                {recommendationPros.map((p) => (
                                  <li key={p} className="flex items-start gap-2">
                                    <span className="mt-0.5">✓</span>
                                    <span>{p}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                              <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">Contras</p>
                              <ul className="mt-2 space-y-1 text-sm text-amber-900">
                                {recommendationCons.map((c) => (
                                  <li key={c} className="flex items-start gap-2">
                                    <span className="mt-0.5">•</span>
                                    <span>{c}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="text-xs font-bold text-zinc-500">
                      Progresso: {answeredCount}/{profileQuestions.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileAnswers({});
                          setSelected(null);
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-extrabold text-zinc-600 hover:bg-zinc-100 transition-colors"
                      >
                        Refazer
                      </button>
                    </div>
                  </div>
                </div>
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
                    <span className={`px-3 py-1 text-sm rounded-full font-bold ${recommendedStart === 'POSTURA' ? 'text-white' : 'bg-zinc-100 text-zinc-600'}`} style={recommendedStart === 'POSTURA' ? { backgroundColor: currentColorObj.value } : {}}>
                      {recommendedStart === 'POSTURA' ? 'Recomendado' : 'Fluxo Contínuo'}
                    </span>
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
                    <span className={`px-3 py-1 text-sm rounded-full font-bold ${recommendedStart === 'CORTE' ? 'text-white' : 'bg-zinc-100 text-zinc-600'}`} style={recommendedStart === 'CORTE' ? { backgroundColor: currentColorObj.value } : {}}>
                      {recommendedStart === 'CORTE' ? 'Recomendado' : 'Ciclo por Lotes'}
                    </span>
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
