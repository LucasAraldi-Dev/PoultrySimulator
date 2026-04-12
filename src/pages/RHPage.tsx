import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Users, UserPlus, GraduationCap, Briefcase, Stethoscope, TrendingUp, AlertTriangle, MessageSquare, Star } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { EmployeeProfileModal } from '../components/EmployeeProfileModal';

import { EMPLOYEE_SKILLS_CATALOG } from '../store/constants';

export default function RHPage() {
  const employees = useGameStore(state => state.employees);
  const money = useGameStore(state => state.money);
  const hireEmployee = useGameStore(state => state.hireEmployee);
  const fireEmployee = useGameStore(state => state.fireEmployee);
  const trainEmployee = useGameStore(state => state.trainEmployee);
  const assignEmployeeToBarn = useGameStore(state => state.assignEmployeeToBarn);
  const barns = useGameStore(state => state.barns);
  const hireVeterinarian = useGameStore(state => state.hireVeterinarian);
  const hireFinancialAdvisor = useGameStore(state => state.hireFinancialAdvisor);
  const financialBuffDays = useGameStore(state => state.financialBuffDays);
  
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  const handleHire = (role: 'TRATADOR' | 'OPERADOR_FABRICA') => {
    const name = prompt("Qual o nome do novo funcionário?");
    if (name) {
      hireEmployee(role, name);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header>
          <h2 className="text-2xl font-bold text-zinc-800">Equipe & Consultoria</h2>
          <p className="text-zinc-600">Contrate funcionários e especialistas para otimizar sua granja.</p>
        </header>

        {/* Consultores */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-emerald-600">
                <Stethoscope size={28} />
                <h3 className="text-xl font-bold">Veterinário Especialista</h3>
              </div>
              <p className="text-zinc-600 text-sm mb-4">
                O veterinário cura imediatamente todas as doenças ativas nos seus galpões. Fundamental em crises de alta mortalidade.
              </p>
              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2 mb-4">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>Custo Fixo por Visita: <strong>R$ 500,00</strong></span>
              </div>
            </div>
            <button 
              onClick={() => hireVeterinarian()}
              disabled={money < 500}
              className="w-full py-3 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors border border-emerald-300 disabled:opacity-50"
            >
              Chamar Veterinário
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-blue-600">
                <TrendingUp size={28} />
                <h3 className="text-xl font-bold">Consultor Financeiro</h3>
              </div>
              <p className="text-zinc-600 text-sm mb-4">
                Negocia melhores contratos de venda. Você ganha <strong>+10% de lucro</strong> em todas as vendas (ovos e carne) por 7 dias.
              </p>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-center">
                  <span>Custo por Contrato: <strong>R$ 1.000,00</strong></span>
                  {financialBuffDays > 0 && <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">Ativo: {financialBuffDays}d</span>}
                </div>
              </div>
            </div>
            <button 
              onClick={() => hireFinancialAdvisor()}
              disabled={money < 1000 || financialBuffDays > 0}
              className="w-full py-3 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg transition-colors border border-blue-300 disabled:opacity-50"
            >
              {financialBuffDays > 0 ? 'Consultoria Ativa' : 'Contratar Consultor'}
            </button>
          </div>
        </section>

        {/* Quadro de Funcionários */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
              <Users size={24} className="text-indigo-600" />
              Quadro de Funcionários
            </h2>
            <div className="flex gap-2">
              <button onClick={() => handleHire('TRATADOR')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                <UserPlus size={16} /> Tratador
              </button>
              <button onClick={() => handleHire('OPERADOR_FABRICA')} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700">
                <UserPlus size={16} /> Operador
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {employees.length === 0 ? (
              <div className="col-span-3 text-center py-10 bg-white rounded-xl border border-zinc-200 border-dashed">
                <Users size={48} className="mx-auto text-zinc-300 mb-3" />
                <p className="text-zinc-500 font-medium">Você não possui funcionários.</p>
                <p className="text-sm text-zinc-400 mt-1">Sua carga de trabalho diária está toda sobre você!</p>
              </div>
            ) : (
              employees.map(emp => {
                const trainingCost = emp.experienceLevel * 200;
                return (
                  <div key={emp.id} className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-zinc-800">{emp.name}</h4>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{emp.role.replace('_', ' ')}</span>
                      </div>
                      <span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded text-xs font-bold">Nvl {emp.experienceLevel}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Salário/Dia:</span>
                        <span className="font-bold text-red-600">- R$ {emp.salary.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-zinc-500">Moral:</span>
                        <span className={`font-bold ${emp.morale > 70 ? 'text-emerald-600' : emp.morale > 30 ? 'text-amber-500' : 'text-red-600'}`}>
                          {emp.morale || 100}%
                        </span>
                      </div>

                      {/* Exibir Bônus Ativos do Funcionário no Card */}
                      {emp.skills && Object.keys(emp.skills).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {Object.entries(emp.skills).map(([skillId, level]) => {
                            if (level <= 0) return null;
                            const skillDef = EMPLOYEE_SKILLS_CATALOG[skillId];
                            if (!skillDef) return null;
                            return (
                              <span key={skillId} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black uppercase" title={skillDef.name}>
                                {skillDef.effectLabel(level)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => trainEmployee(emp.id, trainingCost)}
                          disabled={money < trainingCost || emp.experienceLevel >= 5}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                        >
                          <GraduationCap size={14} /> 
                          {emp.experienceLevel >= 5 ? 'Max' : `Treinar (R$ ${trainingCost})`}
                        </button>
                        <button 
                          onClick={() => {
                            if(window.confirm('Deseja realmente demitir este funcionário?')) fireEmployee(emp.id);
                          }}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                        >
                          Demitir
                        </button>
                      </div>

                      {emp.role === 'TRATADOR' && barns.length > 0 && (
                        <div className="mt-2 flex flex-col gap-1">
                          <label className="text-xs text-zinc-500 font-bold uppercase">Delegar para Galpão:</label>
                          <select
                            value={emp.assignedBarnId || ''}
                            onChange={(e) => assignEmployeeToBarn(emp.id, e.target.value || null)}
                            className="p-1.5 rounded-lg border border-zinc-300 text-sm font-bold text-zinc-700 bg-white"
                          >
                            <option value="">Nenhum (Descanso)</option>
                            {barns.map(b => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
      
      {selectedEmp && (
        <EmployeeProfileModal
          isOpen={!!selectedEmp}
          onClose={() => setSelectedEmp(null)}
          employee={selectedEmp}
        />
      )}
    </PageTransition>
  );
}
