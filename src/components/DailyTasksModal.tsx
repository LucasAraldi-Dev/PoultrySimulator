import React from 'react';
import { Modal } from './Modal';
import { useGameStore } from '../store/useGameStore';
import { CheckSquare, Clock, Play, AlertCircle, Coins, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyTasksModal({ isOpen, onClose }: DailyTasksModalProps) {
  const barns = useGameStore(state => state.barns);
  const startTask = useGameStore(state => state.startTask);
  const accelerateTask = useGameStore(state => state.accelerateTask);
  const gold = useGameStore(state => state.gold);
  const now = Date.now();

  const totalPending = barns.reduce((acc, barn) => acc + barn.dailyTasks.filter(t => !t.completed).length, 0);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Tarefas Diárias da Granja"
      icon={<CheckSquare className="text-blue-500" />}
    >
      <div className="space-y-6">
        <p className="text-sm text-zinc-600 leading-relaxed">
          Realize o manejo diário em todos os seus galpões para garantir a saúde e produtividade do lote. 
          Ignorar tarefas aumenta a mortalidade e reduz a qualidade dos seus produtos.
        </p>

        {totalPending === 0 ? (
          <div className="text-center py-8 bg-emerald-50 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="text-xl font-black text-emerald-800">Tudo Feito!</h3>
            <p className="text-emerald-600 mt-1 font-medium">Sua granja está em perfeitas condições hoje.</p>
          </div>
        ) : (
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {barns.filter(b => b.dailyTasks.some(t => !t.completed)).map(barn => (
              <div key={barn.id} className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200">
                  <h3 className="font-bold text-zinc-800 text-sm">{barn.name}</h3>
                </div>
                <div className="p-4 space-y-3">
                  {barn.dailyTasks.filter(t => !t.completed).map(task => {
                    const isRunning = task.startedAt !== undefined;
                    let progress = 0;
                    let timeLeft = 0;
                    let isDone = false;

                    if (isRunning && task.startedAt) {
                      const elapsed = now - task.startedAt;
                      const total = task.durationMinutes * 60 * 1000;
                      progress = Math.min(100, (elapsed / total) * 100);
                      timeLeft = Math.max(0, Math.ceil((total - elapsed) / 1000));
                      if (progress >= 100) isDone = true;
                    }

                    return (
                      <div key={task.id} className="flex flex-col gap-2 p-3 bg-white border border-zinc-200 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-zinc-800 text-sm">{task.name}</p>
                            <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                              <Clock size={12} /> {task.durationMinutes}h do jogo
                            </p>
                          </div>
                          
                          {!isRunning ? (
                            <button
                              onClick={() => startTask(barn.id, task.id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                            >
                              <Play size={14} /> Iniciar
                            </button>
                          ) : isDone ? (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 size={14} /> Concluindo...
                            </span>
                          ) : (
                            <button
                              onClick={() => accelerateTask(barn.id, task.id)}
                              disabled={gold < 10}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-bold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Acelerar com 10 de Ouro"
                            >
                              <Coins size={14} /> Acelerar (10)
                            </button>
                          )}
                        </div>

                        {isRunning && !isDone && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Em andamento</span>
                              <span>{Math.ceil(timeLeft / 60)} min restantes</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                              <motion.div 
                                className="bg-blue-500 h-full"
                                initial={{ width: `${progress}%` }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
