import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GraduationCap, ArrowUpCircle, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Employee } from '../store/types';

interface EmployeeSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

export function EmployeeSkillModal({ isOpen, onClose, employee: initialEmployee }: EmployeeSkillModalProps) {
  const money = useGameStore(state => state.money);
  const employees = useGameStore(state => state.employees);
  const trainEmployee = useGameStore(state => state.trainEmployee);

  const employee = employees.find(e => e.id === initialEmployee?.id) || initialEmployee;

  if (!employee) return null;

  const maxLevel = 5;
  const currentLevel = employee.experienceLevel;
  const isMaxLevel = currentLevel >= maxLevel;
  
  // Nvl 1->2: 25k, 2->3: 50k, 3->4: 100k, 4->5: 200k
  const getTrainingCost = (level: number) => {
    switch (level) {
      case 1: return 25000;
      case 2: return 50000;
      case 3: return 100000;
      case 4: return 200000;
      default: return 0;
    }
  };

  const getSalaryForLevel = (level: number) => {
    switch (level) {
      case 1: return 400;
      case 2: return 600;
      case 3: return 900;
      case 4: return 1350;
      case 5: return 2000;
      default: return 400;
    }
  };

  const trainingCost = getTrainingCost(currentLevel);
  const canAfford = money >= trainingCost;

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'TRATADOR':
        return 'O Tratador (Gerente de Galpão) assume o controle de um galpão específico, automatizando tarefas diárias, acelerando a cura de doenças e até vendendo e comprando novos lotes de forma independente no end-game.';
      case 'MOTORISTA':
        return 'O Motorista reduz significativamente o custo de frete na compra de insumos e na venda de produtos.';
      case 'OPERADOR_FABRICA':
        return 'O Operador de Fábrica melhora a eficiência geral da granja (Bônus passivo).';
      default:
        return 'Especialista da granja.';
    }
  };

  const getLevelBonus = (level: number, role: string) => {
    switch (role) {
      case 'TRATADOR':
        switch(level) {
          case 1: return 'Faz as tarefas diárias do galpão automaticamente e reduz mortalidade.';
          case 2: return 'Abastece o silo do galpão automaticamente (puxando do estoque geral).';
          case 3: return 'Técnico Agrícola: Acelera em 20% a cura de doenças ativas no lote.';
          case 4: return 'Avisa você no painel quando o lote de corte atingir o peso/lucro ideal para abate.';
          case 5: return 'Ciclo Infinito: Vende lotes ideais e compra novos automaticamente quando o galpão limpa.';
          default: return '';
        }
      case 'MOTORISTA':
        return `Reduz custos de frete em ${level * 5}%`;
      case 'OPERADOR_FABRICA':
        return `Bônus de Produtividade Nível ${level}`;
      default:
        return `Bônus Genérico Nível ${level}`;
    }
  };

  const handleTrain = () => {
    if (canAfford && !isMaxLevel) {
      trainEmployee(employee.id, trainingCost);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <GraduationCap size={28} className="text-indigo-200" />
                  <h2 className="text-2xl font-bold">Árvore de Habilidades</h2>
                </div>
                <p className="text-indigo-100 flex items-center gap-2">
                  <span className="font-bold">{employee.name}</span> 
                  <span>•</span>
                  <span className="uppercase tracking-wider text-xs font-bold bg-indigo-500/50 px-2 py-1 rounded">
                    {employee.role.replace('_', ' ')}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto bg-zinc-50 flex-1">
              <p className="text-zinc-600 mb-6 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                {getRoleDescription(employee.role)}
              </p>

              <div className="space-y-4">
                {Array.from({ length: maxLevel }).map((_, i) => {
                  const level = i + 1;
                  const isCurrent = level === currentLevel;
                  const isUnlocked = level <= currentLevel;
                  const isNext = level === currentLevel + 1;

                  return (
                    <div 
                      key={level}
                      className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50 border-indigo-400 shadow-md' 
                          : isUnlocked
                          ? 'bg-white border-emerald-200 opacity-75'
                          : isNext
                          ? 'bg-white border-orange-200 shadow-sm'
                          : 'bg-zinc-50 border-zinc-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                          isCurrent ? 'bg-indigo-600 text-white' : 
                          isUnlocked ? 'bg-emerald-500 text-white' :
                          isNext ? 'bg-orange-100 text-orange-600' :
                          'bg-zinc-200 text-zinc-500'
                        }`}>
                          {level}
                        </div>
                        <div>
                          <h4 className={`font-bold ${isCurrent ? 'text-indigo-900' : isUnlocked ? 'text-emerald-800' : 'text-zinc-700'}`}>
                            Nível {level} <span className="text-xs text-zinc-500 ml-2 font-normal">(Salário R$ {getSalaryForLevel(level)}/dia)</span>
                          </h4>
                          <p className="text-sm text-zinc-600 mt-1">{getLevelBonus(level, employee.role)}</p>
                        </div>
                      </div>
                      
                      <div>
                        {isUnlocked ? (
                          <CheckCircle2 className={isCurrent ? 'text-indigo-500' : 'text-emerald-500'} size={24} />
                        ) : isNext ? (
                          <div className="text-right">
                            <span className="text-xs font-bold text-orange-600 uppercase block mb-1">Próximo Nível</span>
                            <span className={`text-sm font-bold ${canAfford ? 'text-zinc-700' : 'text-red-500'}`}>
                              Custo: R$ {trainingCost.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <Lock className="text-zinc-300" size={24} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-zinc-200 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-500 uppercase">Seu Dinheiro</span>
                <span className={`text-xl font-black ${money >= trainingCost ? 'text-emerald-600' : 'text-red-500'}`}>
                  R$ {money.toFixed(2)}
                </span>
              </div>

              {!isMaxLevel ? (
                <button
                  onClick={handleTrain}
                  disabled={!canAfford}
                  className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    canAfford 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5' 
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? (
                    <><ArrowUpCircle size={20} /> Evoluir Nível (R$ {trainingCost.toFixed(2)})</>
                  ) : (
                    <><Lock size={20} /> Dinheiro Insuficiente</>
                  )}
                </button>
              ) : (
                <div className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 bg-emerald-100 text-emerald-800">
                  <CheckCircle2 size={20} /> Nível Máximo Atingido
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
