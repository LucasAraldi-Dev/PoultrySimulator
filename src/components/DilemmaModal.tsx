import React from 'react';
import { Modal } from './Modal';
import { useGameStore } from '../store/useGameStore';
import { AlertTriangle, DollarSign } from 'lucide-react';

export function DilemmaModal() {
  const activeDilemma = useGameStore(state => state.activeDilemma);
  const resolveDilemma = useGameStore(state => state.resolveDilemma);

  if (!activeDilemma) return null;

  return (
    <Modal 
      isOpen={!!activeDilemma} 
      onClose={() => {}} // Não permite fechar sem escolher
      title={activeDilemma.title}
      icon={<AlertTriangle className="text-amber-500" />}
    >
      <div className="space-y-6">
        <p className="text-zinc-700 text-lg leading-relaxed">
          {activeDilemma.description}
        </p>

        <div className="space-y-3">
          {activeDilemma.options.map(option => (
            <button
              key={option.id}
              onClick={() => resolveDilemma(option.id)}
              className="w-full text-left p-4 border border-zinc-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-zinc-800">{option.text}</span>
                {option.costMoney && (
                  <span className="text-red-600 font-bold text-sm flex items-center">
                    <DollarSign size={14} /> -{option.costMoney}
                  </span>
                )}
                {option.rewardMoney && (
                  <span className="text-emerald-600 font-bold text-sm flex items-center">
                    <DollarSign size={14} /> +{option.rewardMoney}
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500">{option.effectDescription}</p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
