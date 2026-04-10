import React from 'react';
import { motion } from 'framer-motion';
import { Microscope, Zap, Cpu, HeartPulse, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { RESEARCHES } from '../store/constants';
import { PageTransition } from '../components/PageTransition';

export function ResearchPage() {
  const money = useGameStore(state => state.money);
  const xp = useGameStore(state => state.xp);
  const unlockedResearches = useGameStore(state => state.unlockedResearches);
  const unlockResearch = useGameStore(state => state.unlockResearch);

  const getIcon = (category: string) => {
    switch (category) {
      case 'GENETICS': return <Microscope className="text-purple-500" />;
      case 'NUTRITION': return <Zap className="text-amber-500" />;
      case 'INFRASTRUCTURE': return <Cpu className="text-blue-500" />;
      case 'HEALTH': return <HeartPulse className="text-red-500" />;
      default: return <Microscope className="text-zinc-500" />;
    }
  };

  return (
    <PageTransition className="space-y-6 pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <Microscope size={28} className="text-purple-600" />
          Centro de Pesquisa & Desenvolvimento
        </h1>
        <p className="text-zinc-600">
          Invista Dinheiro e XP para desbloquear bônus permanentes para a sua granja.
        </p>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center gap-4 text-purple-800">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase">XP Disponível</p>
          <p className="text-2xl font-black text-purple-600">{xp.toFixed(0)}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-bold text-zinc-500 uppercase">Dinheiro</p>
          <p className="text-2xl font-black text-emerald-600">R$ {money.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(RESEARCHES).map((research) => {
          const isUnlocked = unlockedResearches.includes(research.id);
          const canAfford = money >= research.costMoney && xp >= research.costXP;

          return (
            <motion.div
              key={research.id}
              whileHover={!isUnlocked ? { scale: 1.02 } : {}}
              className={`relative overflow-hidden rounded-xl border p-6 flex flex-col justify-between h-full transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200' 
                  : 'bg-white border-zinc-200 shadow-sm'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              )}
              
              <div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    {getIcon(research.category)}
                  </div>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-200/50 px-2 py-1 rounded-full">
                      <CheckCircle2 size={14} /> Ativo
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-zinc-800 mb-2 relative z-10">{research.name}</h3>
                <p className="text-sm text-zinc-600 mb-6 relative z-10">{research.description}</p>
              </div>

              <div className="mt-auto relative z-10">
                {!isUnlocked ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between text-sm">
                      <span className={`font-bold ${money >= research.costMoney ? 'text-zinc-700' : 'text-red-500'}`}>R$ {research.costMoney.toFixed(0)}</span>
                      <span className={`font-bold ${xp >= research.costXP ? 'text-purple-600' : 'text-red-500'}`}>{research.costXP} XP</span>
                    </div>
                    <button
                      onClick={() => unlockResearch(research.id)}
                      disabled={!canAfford}
                      className={`w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors ${
                        canAfford 
                          ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-md hover:shadow-lg' 
                          : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Pesquisar' : <><Lock size={16} /> Recursos Insuficientes</>}
                    </button>
                  </div>
                ) : (
                  <div className="w-full py-3 rounded-lg font-bold flex justify-center items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={18} /> Tecnologia Dominada
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
