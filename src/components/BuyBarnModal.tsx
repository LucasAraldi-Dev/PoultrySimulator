import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { BARN_MODELS, EQUIPMENTS, VACCINES_AVAILABLE, CHICK_COST, LAYER_LINEAGES } from '../store/constants';
import { useGameStore } from '../store/useGameStore';
import { Barn, Batch } from '../store/types';
import { DollarSign, CheckCircle2, ChevronRight, Check } from 'lucide-react';

interface BuyBarnModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string | null;
}

export function BuyBarnModal({ isOpen, onClose, modelId }: BuyBarnModalProps) {
  const { money, barns, buyBarn } = useGameStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [animalCount, setAnimalCount] = useState<number>(0);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [selectedLineage, setSelectedLineage] = useState<string>('hisex_brown');

  useEffect(() => {
    if (isOpen && modelId) {
      setStep(1);
      setSelectedEquipments([]);
      const model = BARN_MODELS[modelId];
      setAnimalCount(model?.baseCapacity || 0);
      setSelectedVaccines([]);
      setSelectedLineage('hisex_brown');
    }
  }, [isOpen, modelId]);

  if (!modelId || !isOpen) return null;

  const model = BARN_MODELS[modelId];
  const isPostura = model.type ? model.type === 'POSTURA' : model.id.includes('postura');

  // Cálculos Step 1
  const availableEquipments = Object.values(EQUIPMENTS).filter(eq => {
    // Se quiser diferenciar equipamentos, podemos fazer isso aqui no futuro
    return true;
  });

  const equipmentCost = selectedEquipments.reduce((acc, eqId) => acc + (EQUIPMENTS[eqId]?.cost || 0), 0);
  const totalBarnCost = model.baseCost + equipmentCost;

  // Capacidade Dinâmica
  const capacityBonus = selectedEquipments.reduce((acc, eqId) => acc + (EQUIPMENTS[eqId]?.effect?.capacityIncrease || 0), 0);
  const maxCapacity = model.baseCapacity + capacityBonus;

  // Cálculos Step 2
  const baseAnimalCost = isPostura ? LAYER_LINEAGES[selectedLineage].costPerBird : CHICK_COST;
  const animalCost = animalCount * baseAnimalCost;
  const vaccinesCost = selectedVaccines.reduce((acc, vacId) => acc + (VACCINES_AVAILABLE[vacId]?.costPerBird || 0), 0) * animalCount;
  const totalBatchCost = animalCost + vaccinesCost;

  const totalFinalCost = totalBarnCost + totalBatchCost;
  const canAfford = money >= totalFinalCost;

  const handleNextStep = () => {
    if (animalCount > maxCapacity) {
      setAnimalCount(maxCapacity);
    }
    setStep(2);
  };

  const handleConfirm = () => {
    if (!canAfford) return;

    let batch: Batch | null = null;
    if (animalCount > 0) {
      batch = {
        id: `batch_${Date.now()}`,
        animalCount,
        ageDays: isPostura ? 120 : 1,
        currentWeight: isPostura ? 1.8 : 0.05,
        totalFeedConsumed: 0,
        mortalityCount: 0,
        activeDisease: null,
        vaccineProtectionDays: selectedVaccines.length > 0 ? 30 : 0,
        hygieneLevel: 100,
        vaccines: selectedVaccines,
        lineage: isPostura ? selectedLineage : undefined,
      };
    }

    const newBarn: Barn = {
      id: `barn_${Date.now()}`,
      name: `${model.name} ${barns.length + 1}`,
      type: isPostura ? 'POSTURA' : 'CORTE',
      size: model.size,
      level: 1,
      capacity: maxCapacity,
      equipment: selectedEquipments,
      dailyCost: model.baseDailyCost + selectedEquipments.reduce((acc, eq) => acc + (EQUIPMENTS[eq]?.effect?.dailyCostIncrease || 0), 0),
      isRented: false,
      sanitaryVoidDays: 0,
      siloBalance: 0,
      siloCapacity: 2000,
      dailyTasks: [],
      batch,
      selectedFeedId: isPostura ? 'feed_layers_start' : 'feed_broiler_pre',
    };

    buyBarn(newBarn, totalFinalCost);
    onClose();
  };

  const toggleEquipment = (eqId: string) => {
    setSelectedEquipments(prev => 
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  const toggleVaccine = (vacId: string) => {
    setSelectedVaccines(prev => 
      prev.includes(vacId) ? prev.filter(id => id !== vacId) : [...prev, vacId]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Comprar ${model.name}`}>
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">Etapa 1: Personalize seu galpão com equipamentos opcionais.</p>
          
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {availableEquipments.map(eq => {
              const isSelected = selectedEquipments.includes(eq.id);
              return (
                <div 
                  key={eq.id}
                  onClick={() => toggleEquipment(eq.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 hover:border-zinc-300'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-zinc-800">{eq.name}</h4>
                    <p className="text-xs text-zinc-500">{eq.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-sm text-emerald-600">+ R$ {eq.cost}</p>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-500 inline-block mt-1" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-zinc-50 p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-zinc-500">Subtotal Galpão</p>
              <p className="text-xl font-bold text-zinc-800">R$ {totalBarnCost.toFixed(2)}</p>
            </div>
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Próximo <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">Etapa 2: Defina o alojamento inicial do lote e vacinação.</p>
          
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-4">
            {isPostura && (
              <div>
                <label className="text-xs font-bold text-zinc-500 mb-2 block">Linhagem de Postura</label>
                <div className="space-y-2">
                  {Object.values(LAYER_LINEAGES).map(lineage => (
                    <div 
                      key={lineage.id}
                      onClick={() => setSelectedLineage(lineage.id)}
                      className={`p-2 border rounded-lg cursor-pointer transition-colors ${selectedLineage === lineage.id ? 'border-blue-500 bg-blue-50' : 'border-zinc-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-zinc-800">{lineage.name}</span>
                        <span className="text-sm text-emerald-600 font-bold">R$ {lineage.costPerBird.toFixed(2)} / ave</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{lineage.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">
                Quantidade de Aves (Max: {maxCapacity})
              </label>
              <div className="flex gap-4 items-center">
                <input 
                  type="range" 
                  min="0" 
                  max={maxCapacity} 
                  value={animalCount}
                  onChange={(e) => setAnimalCount(Number(e.target.value))}
                  className="flex-1"
                />
                <input 
                  type="number"
                  min="0"
                  max={maxCapacity}
                  value={animalCount}
                  onChange={(e) => setAnimalCount(Math.min(maxCapacity, Math.max(0, Number(e.target.value))))}
                  className="w-24 border rounded px-2 py-1 text-center font-bold"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">Custo base: R$ {baseAnimalCost.toFixed(2)} / ave</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-zinc-800 mb-2">Vacinas Opcionais</h4>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
              {Object.values(VACCINES_AVAILABLE).map(vac => {
                const isSelected = selectedVaccines.includes(vac.id);
                return (
                  <div 
                    key={vac.id}
                    onClick={() => toggleVaccine(vac.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'border-amber-500 bg-amber-50' : 'border-zinc-200 hover:border-zinc-300'}`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-zinc-800">{vac.name}</h4>
                      <p className="text-xs text-zinc-500">Previne: {vac.protectsAgainst.join(', ')}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-sm text-amber-600">+ R$ {vac.costPerBird} / ave</p>
                      {isSelected && <Check size={16} className="text-amber-500 inline-block mt-1" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-100 p-4 rounded-lg flex justify-between items-center border border-zinc-200">
            <div>
              <p className="text-xs font-bold text-zinc-500">Custo Total (Galpão + Lote)</p>
              <p className={`text-xl font-bold ${canAfford ? 'text-emerald-600' : 'text-red-600'}`}>
                R$ {totalFinalCost.toFixed(2)}
              </p>
              {!canAfford && <p className="text-xs text-red-500 font-bold">Saldo Insuficiente (R$ {money.toFixed(2)})</p>}
            </div>
            <button
              onClick={handleConfirm}
              disabled={!canAfford}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-colors ${canAfford ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'}`}
            >
              <DollarSign size={18} /> Comprar
            </button>
          </div>
          
          <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-bold hover:underline w-full text-center mt-2 block">
            Voltar para personalização
          </button>
        </div>
      )}
    </Modal>
  );
}
