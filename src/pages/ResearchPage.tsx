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

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat.id 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-purple-50'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Visual Tree */}
      <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px] flex flex-col gap-10 relative">
          
          <div className="grid grid-cols-3 gap-x-8 gap-y-12 relative z-10">
            {Array.from({ length: 3 }).map((_, rowIdx) => {
              const catResearches = Object.values(RESEARCH_TREE).filter(r => r.category === activeCategory && r.row === rowIdx);
              if (catResearches.length === 0) return null;

              return (
                <React.Fragment key={`row-${rowIdx}`}>
                  {Array.from({ length: 3 }).map((_, colIdx) => {
                    const resDef = Object.values(RESEARCH_TREE).find(r => r.category === activeCategory && r.row === rowIdx && r.col === colIdx);
                    
                    if (!resDef) return <div key={`empty-${rowIdx}-${colIdx}`} className="opacity-0"></div>;

                    const stateRes = researches[resDef.id];
                    const currentLvl = stateRes?.current_level || 0;
                    const isMax = currentLvl >= resDef.max_level;
                    const next = stateRes?.next_level_info;

                    // Check Locks
                    let isLocked = false;
                    let maxAllowedLvl = resDef.max_level;
                    if (resDef.requires) {
                      const parentLvl = researches[resDef.requires]?.current_level || 0;
                      if (parentLvl === 0) isLocked = true;
                      if (resDef.max_level > 1) {
                        maxAllowedLvl = Math.min(resDef.max_level, parentLvl);
                      }
                    }

                    const isResearchingThis = activeResearchId === resDef.id;
                    const canAfford = !isLocked && !isMax && !activeResearchId && next &&
                      money >= next.cost_money &&
                      xp >= next.cost_xp &&
                      playerLevel >= next.required_player_level &&
                      currentLvl < maxAllowedLvl;

                    const isMaxAllowed = currentLvl >= maxAllowedLvl && !isMax;

                    return (
                      <div key={resDef.id} className="flex flex-col items-center relative">
                        {/* Connector Line */}
                        {resDef.requires && (
                          <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-purple-200 -translate-x-1/2 -z-10"></div>
                        )}

                        <div className={`w-full p-5 border-2 rounded-2xl transition-all relative ${
                          isResearchingThis ? 'bg-orange-50 border-orange-400 shadow-lg scale-105 z-20' :
                          isLocked ? 'bg-zinc-100 border-zinc-200 opacity-70 grayscale' :
                          currentLvl > 0 ? 'bg-white border-purple-400 shadow-md' :
                          'bg-white border-zinc-300'
                        }`}>
                          
                          {isLocked && <div className="absolute -top-3 -right-3 bg-zinc-200 p-2 rounded-full shadow-sm"><Lock size={16} className="text-zinc-500" /></div>}
                          {!isLocked && currentLvl === 0 && <div className="absolute -top-3 -right-3 bg-purple-100 p-2 rounded-full shadow-sm"><Unlock size={16} className="text-purple-600" /></div>}
                          {isMax && <div className="absolute -top-3 -right-3 bg-emerald-100 p-2 rounded-full shadow-sm"><CheckCircle2 size={16} className="text-emerald-600" /></div>}

                          <h3 className={`font-black text-lg leading-tight mb-1 ${isLocked ? 'text-zinc-500' : 'text-zinc-800'}`}>
                            {resDef.name}
                          </h3>
                          
                          <div className="flex justify-between items-center mb-3 border-b border-zinc-100 pb-2">
                            <span className="text-xs font-bold text-zinc-500 uppercase">Nível {currentLvl}/{resDef.max_level}</span>
                            {currentLvl > 0 && (
                              <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">
                                {resDef.effectLabel(currentLvl)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-600 mb-4 h-10 line-clamp-2">{resDef.description}</p>

                          {isResearchingThis ? (
                            <div className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 bg-orange-200 text-orange-800 border border-orange-300 text-sm">
                              <Clock size={16} className="animate-spin" /> Em Andamento
                            </div>
                          ) : isMax ? (
                            <div className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200 text-sm">
                              <Star size={16} className="fill-emerald-800" /> Pesquisa Máxima
                            </div>
                          ) : isLocked ? (
                            <div className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center bg-zinc-200 text-zinc-500 text-xs text-center">
                              Requer Pesquisa Anterior
                            </div>
                          ) : isMaxAllowed ? (
                            <div className="w-full py-2.5 rounded-lg font-bold flex justify-center items-center bg-amber-100 text-amber-800 text-xs text-center leading-tight px-2">
                              Evolua a pesquisa anterior para liberar o próximo nível.
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="grid grid-cols-2 gap-1 text-[10px] font-bold bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                                <div className="text-zinc-500">Custo: <span className={money >= next.cost_money ? 'text-zinc-800' : 'text-red-500'}>R$ {next.cost_money.toLocaleString()}</span></div>
                                <div className="text-zinc-500 text-right">XP: <span className={xp >= next.cost_xp ? 'text-purple-600' : 'text-red-500'}>{next.cost_xp}</span></div>
                                <div className="text-zinc-500">Tempo: <span className="text-zinc-800">{next.time_days}d</span></div>
                                <div className="text-zinc-500 text-right">Nível: <span className={playerLevel >= next.required_player_level ? 'text-zinc-800' : 'text-red-500'}>Lvl {next.required_player_level}</span></div>
                              </div>
                              <button
                                onClick={() => startResearchApi(resDef.id)}
                                disabled={!canAfford || activeResearchId !== null}
                                className={`w-full py-2.5 rounded-lg text-sm font-black transition-colors flex justify-center items-center gap-1 ${
                                  canAfford && !activeResearchId
                                    ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md'
                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                }`}
                              >
                                <ArrowUpCircle size={16} /> Pesquisar (+{resDef.effectLabel(1).replace(/[^0-9.]/g, '')}%)
                              </button>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
