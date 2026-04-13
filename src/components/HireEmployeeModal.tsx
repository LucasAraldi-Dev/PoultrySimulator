import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGameStore } from '../store/useGameStore';
import { UserPlus, Briefcase, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: 'TRATADOR' | 'OPERADOR_FABRICA' | 'MOTORISTA';
}

export function HireEmployeeModal({ isOpen, onClose, role }: Props) {
  const hireEmployee = useGameStore(state => state.hireEmployee);
  const assignEmployeeToBarn = useGameStore(state => state.assignEmployeeToBarn);
  const barns = useGameStore(state => state.barns);
  const employees = useGameStore(state => state.employees);
  
  const [name, setName] = useState('');
  const [assignedBarn, setAssignedBarn] = useState<string>('');

  if (!isOpen) return null;

  const roleInfo = {
    'TRATADOR': {
      title: 'Tratador',
      desc: 'Responsável por executar as tarefas diárias nos galpões, garantindo a sanidade e crescimento do lote. Ganha bônus exclusivos focados no bem-estar animal.',
      salary: 180,
    },
    'OPERADOR_FABRICA': {
      title: 'Operador de Fábrica',
      desc: 'Gerencia o moinho e peletizadora da fábrica de ração. Suas habilidades aumentam o rendimento da ração produzida e reduzem manutenções.',
      salary: 250,
    },
    'MOTORISTA': {
      title: 'Motorista',
      desc: 'Dirige os veículos da fazenda para buscar insumos ou vender animais. Suas habilidades reduzem os custos de frete e evitam contusões na carga viva.',
      salary: 220,
    }
  };

  const info = roleInfo[role];

  const handleHire = () => {
    const finalName = name.trim() || `${info.title} \${employees.length + 1}`;
    hireEmployee(role, finalName);
    
    // Find the newly created employee to assign if needed
    // In a real scenario, we'd return the ID from hireEmployee, but we can just find the latest one
    setTimeout(() => {
      const state = useGameStore.getState();
      const newEmp = state.employees[state.employees.length - 1];
      if (newEmp && assignedBarn && role === 'TRATADOR') {
        assignEmployeeToBarn(newEmp.id, assignedBarn);
      }
      onClose();
    }, 50);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contratar: \${info.title}`}
      icon={<UserPlus className="text-indigo-500" />}
    >
      <div className="space-y-5">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <p className="text-indigo-800 text-sm leading-relaxed">{info.desc}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Salário Base:</span>
            <span className="font-black text-indigo-700 bg-white px-2 py-0.5 rounded shadow-sm">R$ {info.salary.toFixed(2)}/dia</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-1">Nome do Funcionário (Opcional)</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={`Ex: \${info.title} \${employees.length + 1}`}
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800 font-medium transition-all"
          />
        </div>

        {role === 'TRATADOR' && barns.length > 0 && (
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-1">Designação Inicial (Opcional)</label>
            <select
              value={assignedBarn}
              onChange={e => setAssignedBarn(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-800 font-medium transition-all"
            >
              <option value="">Deixar em Descanso (Sem designação)</option>
              {barns.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleHire}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-lg mt-4"
        >
          Assinar Contrato <ChevronRight size={20} />
        </button>
      </div>
    </Modal>
  );
}
