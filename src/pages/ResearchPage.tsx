import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Microscope, Zap, Cpu, HeartPulse, CheckCircle2, Lock, Clock, ArrowUpCircle, Unlock, Star } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { PageTransition } from '../components/PageTransition';
import { RESEARCH_TREE } from '../store/researches';

export function ResearchPage() {
  const money = useGameStore(state => state.money);
  const xp = useGameStore(state => state.xp);
  const playerLevel = useGameStore(state => state.level);

  const researches = useGameStore(state => state.researches);
  const activeResearchId = useGameStore(state => state.activeResearchId);
  const activeResearchDaysLeft = useGameStore(state => state.activeResearchDaysLeft);

  const fetchResearchesApi = useGameStore(state => state.fetchResearchesApi);
  const startResearchApi = useGameStore(state => state.startResearchApi);

  const [activeCategory, setActiveCategory] = useState<string>('GENETICS');

  useEffect(() => {
    fetchResearchesApi();
  }, [fetchResearchesApi]);

  const categories = [
    { id: 'GENETICS', name: 'Genética', icon: <Microscope size={18} /> },
    { id: 'NUTRITION', name: 'Nutrição', icon: <Zap size={18} /> },
    { id: 'INFRASTRUCTURE', name: 'Infraestrutura', icon: <Cpu size={18} /> },
    { id: 'HEALTH', name: 'Saúde', icon: <HeartPulse size={18} /> }
  ];

  const getIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.icon : <Microscope size={18} />;
  };

  return (
    <PageTransition className="space-y-6 pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <Microscope size={28} className="text-purple-600" />
          Pesquisa e Desenvolvimento (P&D)
        </h1>
        <p className="text-zinc-600">
          Invista Dinheiro, XP e tempo para evoluir bônus permanentes. Desbloqueie tecnologias cruciais para a eficiência da sua fazenda.
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-4 text-purple-800 flex-wrap">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase">Seu Nível</p>
          <p className="text-2xl font-black text-blue-600">{playerLevel}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase">XP Disponível</p>
          <p className="text-2xl font-black text-purple-600">{xp.toFixed(0)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase">Dinheiro</p>
          <p className="text-2xl font-black text-emerald-600">R$ {money.toFixed(2)}</p>
        </div>
        {activeResearchId && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg shadow-sm flex items-center gap-3 ml-auto">
            <Clock className="text-orange-500 animate-pulse" />
            <div>
              <p className="text-xs font-bold text-orange-600 uppercase">Pesquisando: {RESEARCH_TREE[activeResearchId]?.name}</p>
              <p className="text-sm font-bold text-orange-800">{activeResearchDaysLeft} dias restantes</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(researches || {}).map((research: any) => {
          const isMaxLevel = research.current_level >= research.max_level;
          const next = research.next_level_info;

          const canAfford = !isMaxLevel &&
            next &&
            money >= next.costMoney &&
            xp >= next.costXP &&
            playerLevel >= next.requiredPlayerLevel &&
            !activeResearchId;

          const isResearchingThis = activeResearchId === research.id;

          return (
            <motion.div
              key={research.id}
              whileHover={!isMaxLevel ? { scale: 1.02 } : {}}
              className={`relative overflow-hidden rounded-xl border p-6 flex flex-col justify-between h-full transition-all duration-300 ${
                isMaxLevel
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200'
                  : isResearchingThis
                  ? 'bg-orange-50 border-orange-300'
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              {isMaxLevel && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              )}
              
              <div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    {getIcon(research.category)}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                    Lvl {research.current_level} / {research.max_level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-800 mb-2 relative z-10">{research.name}</h3>
                <p className="text-sm text-zinc-600 mb-4 relative z-10">{research.description}</p>
                
                {research.current_level > 0 && (
                  <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                    <strong>Bônus Atual:</strong> +{(research.current_bonus * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              <div className="mt-auto relative z-10">
                {isResearchingThis ? (
                  <div className="w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 bg-orange-200 text-orange-800 border border-orange-300">
                    <Clock size={18} className="animate-spin" /> Em Andamento...
                  </div>
                ) : !isMaxLevel && next ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-xs bg-zinc-50 p-2 rounded border border-zinc-100 flex flex-col gap-1">
                      <div className="flex justify-between">
                        <span>Próximo Bônus:</span>
                        <span className="font-bold text-emerald-600">+{(next.next_bonus * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo:</span>
                        <span className="font-bold text-zinc-600">{next.time_days} dias</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nível Necessário:</span>
                        <span className={`font-bold ${playerLevel >= next.required_player_level ? 'text-zinc-600' : 'text-red-500'}`}>Lvl {next.required_player_level}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-600 px-1">
                      <span className="flex items-center gap-1 text-emerald-600">R$ {next.costMoney}</span>
                      <span className="flex items-center gap-1 text-purple-600">{next.costXP} XP</span>
                    </div>

                    <button
                      onClick={() => startResearchApi(research.id)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all duration-300 ${
                        canAfford
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle size={18} /> {canAfford ? 'Pesquisar' : 'Sem Recursos'}
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={18} /> Nível Máximo
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageTransition>
  );
}
