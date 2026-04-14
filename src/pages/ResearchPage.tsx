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

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
              activeCategory === cat.id
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      <div className="relative w-full min-h-[800px] bg-zinc-50 rounded-2xl border border-zinc-200 p-8 overflow-hidden">
        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {Object.values(researches || {}).filter((r: any) => r.category === activeCategory).map((r: any) => {
            const def = RESEARCH_TREE[r.id];
            if (!def || !def.requires) return null;
            const reqDef = RESEARCH_TREE[def.requires];
            if (!reqDef) return null;

            const getX = (col: number) => `${(col * 33.33) + 16.66}%`;
            const getY = (row: number) => `${(row * 33.33) + 16.66}%`;

            const reqRes = researches[reqDef.id];
            const isReqUnlocked = reqRes && reqRes.current_level > 0;
            const strokeColor = isReqUnlocked ? '#a855f7' : '#d4d4d8';

            return (
              <line
                key={`line-${r.id}`}
                x1={getX(reqDef.col)}
                y1={getY(reqDef.row)}
                x2={getX(def.col)}
                y2={getY(def.row)}
                stroke={strokeColor}
                strokeWidth="4"
                strokeDasharray={isReqUnlocked ? "0" : "8,8"}
              />
            );
          })}
        </svg>

        <div className="grid grid-cols-3 grid-rows-3 gap-8 w-full h-full relative z-10 place-items-center">
          {Object.values(researches || {}).filter((r: any) => r.category === activeCategory).map((research: any) => {
            const def = RESEARCH_TREE[research.id];
            if (!def) return null;
            const reqDef = def.requires ? RESEARCH_TREE[def.requires] : null;
            const reqRes = reqDef ? researches[reqDef.id] : null;
            const isLocked = reqRes ? reqRes.current_level === 0 : false;

            const isMaxLevel = research.current_level >= research.max_level;
            const next = research.next_level_info;

            const canAfford = !isMaxLevel &&
              !isLocked &&
              next &&
              money >= next.cost_money &&
              xp >= next.cost_xp &&
              playerLevel >= next.required_player_level &&
              !activeResearchId;

            const isResearchingThis = activeResearchId === research.id;

            return (
              <motion.div
                key={research.id}
                style={{
                  gridColumnStart: def.col + 1,
                  gridRowStart: def.row + 1,
                }}
                whileHover={!isMaxLevel && !isLocked ? { scale: 1.02 } : {}}
                className={`relative overflow-hidden rounded-xl border p-5 flex flex-col justify-between w-full h-full min-h-[220px] transition-all duration-300 ${
                  isLocked
                    ? 'bg-zinc-100 border-zinc-200 opacity-70 grayscale-[0.5]'
                    : isMaxLevel
                    ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200'
                    : isResearchingThis
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-white border-purple-200 shadow-sm'
                }`}
              >
                {isMaxLevel && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className={`p-2 rounded-lg border ${isLocked ? 'bg-zinc-200 border-zinc-300' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                      {isLocked ? <Lock size={18} className="text-zinc-500" /> : getIcon(research.category)}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isLocked ? 'bg-zinc-200 text-zinc-500' : 'text-purple-700 bg-purple-100'}`}>
                      Lvl {research.current_level} / {research.max_level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-800 mb-1 relative z-10 leading-tight">{research.name}</h3>
                  <p className="text-xs text-zinc-600 mb-3 relative z-10 leading-snug">{research.description}</p>
                  
                  {research.current_level > 0 && (
                    <div className="mb-3 p-1.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                      <strong>Bônus Atual:</strong> {def.effectLabel(research.current_level)}
                    </div>
                  )}
                </div>

                <div className="mt-auto relative z-10">
                  {isLocked ? (
                    <div className="w-full py-2 text-xs rounded-lg font-bold flex justify-center items-center gap-1 bg-zinc-200 text-zinc-500">
                      <Lock size={14} /> Requer {reqDef?.name}
                    </div>
                  ) : isResearchingThis ? (
                    <div className="w-full py-2 text-xs rounded-lg font-bold flex justify-center items-center gap-1 bg-orange-200 text-orange-800 border border-orange-300">
                      <Clock size={14} className="animate-spin" /> Em Andamento...
                    </div>
                  ) : !isMaxLevel && next ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] bg-zinc-50 p-1.5 rounded border border-zinc-100 flex flex-col gap-0.5">
                        <div className="flex justify-between">
                          <span>Próximo Bônus:</span>
                          <span className="font-bold text-emerald-600">{def.effectLabel(research.current_level + 1)}</span>
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
                      
                      <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 px-1">
                        <span className={`flex items-center gap-1 ${money >= next.cost_money ? 'text-emerald-600' : 'text-red-500'}`}>R$ {next.cost_money}</span>
                        <span className={`flex items-center gap-1 ${xp >= next.cost_xp ? 'text-purple-600' : 'text-red-500'}`}>{next.cost_xp} XP</span>
                      </div>

                      <button
                        onClick={() => startResearchApi(research.id)}
                        disabled={!canAfford}
                        className={`w-full py-2 text-xs rounded-lg font-bold flex justify-center items-center gap-1 transition-all duration-300 ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        <ArrowUpCircle size={14} /> {canAfford ? 'Pesquisar' : 'Sem Recursos'}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-2 text-xs rounded-lg font-bold flex justify-center items-center gap-1 bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={14} /> Nível Máximo
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
