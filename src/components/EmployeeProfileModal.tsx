import React from 'react';
import { Modal } from './Modal';
import { useGameStore } from '../store/useGameStore';
import { EMPLOYEE_SKILLS_CATALOG } from '../store/constants';
import { Star, GraduationCap, UserMinus, ShieldAlert, CheckCircle2, XCircle, Lock, Unlock, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee: import('../store/types').Employee;
}

export function EmployeeProfileModal({ isOpen, onClose, employee }: Props) {
  const money = useGameStore(state => state.money);
  const trainEmployee = useGameStore(state => state.trainEmployee);
  const fireEmployee = useGameStore(state => state.fireEmployee);
  const resolveEmployeeRequest = useGameStore(state => state.resolveEmployeeRequest);
  const upgradeEmployeeSkill = useGameStore(state => state.upgradeEmployeeSkill);

  if (!employee) return null;

  const trainingCost = employee.experienceLevel * 200;

  const handleFire = () => {
    if (window.confirm('Deseja realmente demitir este funcionário?')) {
      fireEmployee(employee.id);
      onClose();
    }
  };

  const handleResolve = (accept: boolean) => {
    resolveEmployeeRequest(employee.id, accept);
    onClose();
  };

  const availableSkills = Object.values(EMPLOYEE_SKILLS_CATALOG).filter(skill => skill.role.includes(employee.role));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Perfil: ${employee.name}`}
      icon={<Star className="text-indigo-500" />}
    >
      <div className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-zinc-800">{employee.name}</h3>
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{employee.role.replace('_', ' ')}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 font-bold uppercase mb-1">Moral</div>
            <div className={`text-xl font-black ${employee.morale > 70 ? 'text-emerald-500' : employee.morale > 30 ? 'text-amber-500' : 'text-red-500'}`}>
              {employee.morale || 100}%
            </div>
          </div>
        </div>

        {/* Pending Request */}
        {employee.activeRequest && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold">
              <ShieldAlert size={20} />
              <h4>Solicitação Pendente (Expira em {employee.activeRequest.expiresInDays} dias)</h4>
            </div>
            <p className="text-sm text-amber-900 mb-4">{employee.activeRequest.description}</p>
            
            {employee.activeRequest.amount && (
              <div className="bg-white/50 p-2 rounded-lg text-sm font-bold text-amber-800 mb-4">
                {employee.activeRequest.type === 'SALARY_RAISE' ? (
                  <span>Aumento Solicitado: + R$ {employee.activeRequest.amount.toFixed(2)}/dia</span>
                ) : employee.activeRequest.type === 'BUY_FEED' ? (
                  <span>Solicitação: {employee.activeRequest.amount} kg de ração</span>
                ) : (
                  <span>Valor: R$ {employee.activeRequest.amount.toFixed(2)}</span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button 
                onClick={() => handleResolve(true)}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} /> Aceitar
              </button>
              <button 
                onClick={() => handleResolve(false)}
                className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={18} /> Recusar
              </button>
            </div>
          </div>
        )}

        {/* Skill Tree */}
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-zinc-800 text-lg">Árvore de Habilidades</h3>
            <div className="text-sm bg-indigo-500 text-white px-4 py-1.5 rounded-full font-black shadow-md flex items-center gap-2">
              <Star size={16} className="fill-white" />
              {employee.skillPoints || 0} PTS
            </div>
          </div>
          
          <div className="relative w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[500px] flex flex-col gap-6 relative">
              {/* Lines could be drawn with SVGs, but we'll use a CSS grid approach for simplicity and flexibility */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-8 relative z-10">
                {Array.from({ length: 4 }).map((_, rowIdx) => {
                  const rowSkills = availableSkills.filter(s => s.row === rowIdx);
                  if (rowSkills.length === 0) return null;
                  
                  return (
                    <React.Fragment key={`row-${rowIdx}`}>
                      {Array.from({ length: 3 }).map((_, colIdx) => {
                        const skill = rowSkills.find(s => s.col === colIdx);
                        if (!skill) return <div key={`empty-${rowIdx}-${colIdx}`} className="flex flex-col items-center justify-start opacity-0"></div>;
                        
                        const currentLvl = employee.skills?.[skill.id] || 0;
                        const isMax = currentLvl >= skill.max;
                        
                        // Check if it's locked
                        let isLocked = false;
                        let maxAllowedLvl = skill.max;
                        if (skill.requires) {
                          const parentLvl = employee.skills?.[skill.requires] || 0;
                          if (parentLvl === 0) isLocked = true;
                          // Can only level up to parent's level if it's a 1-10 skill, uniques (max 1) just need parent > 0
                          if (skill.max > 1) {
                            maxAllowedLvl = Math.min(skill.max, parentLvl);
                          }
                        }

                        const canUpgrade = !isLocked && currentLvl < maxAllowedLvl && (employee.skillPoints || 0) > 0;
                        const reasonCannotUpgrade = isLocked ? 'Requer Habilidade Anterior' : 
                                                    (currentLvl >= skill.max) ? 'Nível Máximo' : 
                                                    (currentLvl >= maxAllowedLvl) ? 'Habilidade Anterior Limita o Nível' : 
                                                    'Sem Pontos';

                        return (
                          <div key={skill.id} className="flex flex-col items-center relative">
                            {/* Visual connector line to parent (basic approximation) */}
                            {skill.requires && (
                              <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-indigo-200 -translate-x-1/2 -z-10"></div>
                            )}
                            
                            <div className={`w-full border-2 rounded-xl p-3 text-center transition-all relative ${
                              isLocked ? 'bg-zinc-100 border-zinc-200 opacity-60 grayscale' :
                              currentLvl > 0 ? 'bg-white border-indigo-400 shadow-md' :
                              'bg-white border-zinc-300'
                            }`}>
                              {isLocked && <div className="absolute -top-3 -right-3 bg-zinc-200 p-1.5 rounded-full"><Lock size={14} className="text-zinc-500" /></div>}
                              {!isLocked && currentLvl === 0 && <div className="absolute -top-3 -right-3 bg-indigo-100 p-1.5 rounded-full"><Unlock size={14} className="text-indigo-500" /></div>}
                              
                              <h4 className={`font-black text-sm mb-1 ${isLocked ? 'text-zinc-500' : 'text-zinc-800'}`}>{skill.name}</h4>
                              
                              <div className="flex justify-center items-center gap-1 mb-2">
                                {Array.from({ length: Math.min(5, skill.max) }).map((_, i) => (
                                  <div key={i} className={`w-2 h-2 rounded-full ${i < currentLvl ? 'bg-indigo-500' : 'bg-zinc-200'}`}></div>
                                ))}
                                {skill.max > 5 && <span className="text-[10px] font-bold text-zinc-400 ml-1">+{skill.max - 5}</span>}
                              </div>
                              
                              <p className="text-[10px] text-zinc-500 leading-tight mb-3 h-8 line-clamp-2">{skill.desc}</p>
                              
                              {currentLvl > 0 && (
                                <div className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-1 rounded mb-3 uppercase tracking-wider">
                                  {skill.effectLabel(currentLvl)}
                                </div>
                              )}

                              <button
                                onClick={() => upgradeEmployeeSkill(employee.id, skill.id)}
                                disabled={!canUpgrade}
                                title={reasonCannotUpgrade}
                                className={`w-full py-1.5 rounded-lg text-xs font-black transition-all ${
                                  canUpgrade ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm' : 
                                  isMax ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' :
                                  'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                                }`}
                              >
                                {isMax ? 'MÁXIMO' : canUpgrade ? '+ EVOLUIR' : 'BLOQUEADO'}
                              </button>
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
        </div>

        {/* Actions */}
        <div className="border-t border-zinc-200 pt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => trainEmployee(employee.id, trainingCost)}
            disabled={money < trainingCost || employee.experienceLevel >= 5}
            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-colors border border-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <GraduationCap size={18} />
            {employee.experienceLevel >= 5 ? 'Nível Max' : `Treinar Nvl ${employee.experienceLevel + 1}`}
            <span className="block text-xs font-normal opacity-80">(R$ {trainingCost})</span>
          </button>
          
          <button
            onClick={handleFire}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors border border-red-200 flex items-center justify-center gap-2"
          >
            <UserMinus size={18} />
            Demitir
          </button>
        </div>

      </div>
    </Modal>
  );
}
