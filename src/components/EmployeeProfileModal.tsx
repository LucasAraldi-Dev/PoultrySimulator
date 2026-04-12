import React from 'react';
import { Modal } from './Modal';
import { useGameStore } from '../store/useGameStore';
import { EMPLOYEE_SKILLS_CATALOG } from '../store/constants';
import { Star, GraduationCap, UserMinus, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

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
        <div>
          <div className="flex justify-between items-end mb-3">
            <h3 className="font-bold text-zinc-800">Árvore de Habilidades</h3>
            <div className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-bold">
              Pontos Disponíveis: {employee.skillPoints || 0}
            </div>
          </div>
          
          <div className="space-y-3">
            {availableSkills.map((skill) => {
              const currentLvl = employee.skills?.[skill.id] || 0;
              const isMax = currentLvl >= skill.max;
              
              return (
                <div key={skill.id} className="border border-zinc-200 rounded-lg p-3 flex justify-between items-center bg-white">
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-800 text-sm">{skill.name} <span className="text-indigo-600 text-xs ml-1">(Nvl {currentLvl}/{skill.max})</span></h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{skill.desc}</p>
                    {currentLvl > 0 && (
                      <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        {skill.effectLabel(currentLvl)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => upgradeEmployeeSkill(employee.id, skill.id)}
                    disabled={isMax || (employee.skillPoints || 0) <= 0}
                    className={`ml-4 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      isMax ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' :
                      (employee.skillPoints || 0) > 0 ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm' : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {isMax ? 'MÁX' : 'Evoluir'}
                  </button>
                </div>
              );
            })}
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
