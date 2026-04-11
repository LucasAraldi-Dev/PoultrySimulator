import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';
import { Warehouse, Plus, Settings, DollarSign, Package, Check, ChevronRight, Droplet, ArrowUpCircle, CheckCircle2 } from 'lucide-react';
import { BARN_MODELS, EQUIPMENTS } from '../store/constants';
import { PageTransition } from '../components/PageTransition';

export default function FacilitiesPage() {
  const { 
    money, level, barns, inventory, hasFeedMill, hasIncubator, hasSlaughterhouse,
    buildFeedMill, buildSlaughterhouse, buyBarn, upgradeBarn, upgradeSilo, buyEquipment
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'GALPOES' | 'FABRICAS'>('GALPOES');

  const handleBuyBarn = (modelId: string) => {
    const model = BARN_MODELS[modelId];
    if (money >= model.baseCost) {
      buyBarn({
        id: `barn_${Date.now()}`,
        name: `${model.name} ${barns.length + 1}`,
        type: model.id.includes('postura') ? 'POSTURA' : 'CORTE',
        size: model.size,
        level: 1,
        capacity: model.baseCapacity,
        equipment: [],
        dailyCost: model.baseDailyCost,
        isRented: false,
        sanitaryVoidDays: 0,
        siloBalance: 0,
        siloCapacity: 2000,
        batch: null,
        selectedFeedId: model.id.includes('postura') ? 'feed_layers_start' : 'feed_broiler_pre',
      }, model.baseCost);
    }
  };

  return (
    <PageTransition className="space-y-6 pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
          <Warehouse size={28} className="text-blue-600" />
          Infraestrutura
        </h1>
        <p className="text-zinc-600">
          Gerencie, construa e aprimore Galpões, Silos e Fábricas para expandir seu império.
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-100 rounded-lg">
        <button
          onClick={() => setActiveTab('GALPOES')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors ${
            activeTab === 'GALPOES' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Galpões & Silos
        </button>
        <button
          onClick={() => setActiveTab('FABRICAS')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors ${
            activeTab === 'FABRICAS' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Complexo Industrial
        </button>
      </div>

      {activeTab === 'GALPOES' && (
        <div className="space-y-8">
          {/* Lista de Galpões Atuais e Upgrades */}
          <div>
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Settings size={20} /> Seus Galpões
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {barns.map(barn => {
                const siloUpgradeCost = barn.siloCapacity * 2; // R$ 2 por kg extra
                const barnUpgradeCost = barn.capacity * 10;

                return (
                  <div key={barn.id} className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-zinc-800">{barn.name}</h3>
                        <p className="text-sm text-zinc-500">Lvl {barn.level} • {barn.type} • Cap: {barn.capacity} aves</p>
                      </div>
                      <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {barn.size}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Upgrade Galpão */}
                      <div className="bg-zinc-50 border rounded-lg p-3">
                        <p className="text-xs font-bold text-zinc-500 mb-2">Estrutura (Lvl {barn.level})</p>
                        <button
                          onClick={() => upgradeBarn(barn.id, barnUpgradeCost)}
                          disabled={money < barnUpgradeCost}
                          className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                            money >= barnUpgradeCost ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUpCircle size={14} /> Melhorar (R$ {barnUpgradeCost.toLocaleString()})
                        </button>
                      </div>

                      {/* Upgrade Silo */}
                      <div className="bg-zinc-50 border rounded-lg p-3">
                        <p className="text-xs font-bold text-zinc-500 mb-2">Silo ({barn.siloCapacity} kg)</p>
                        <button
                          onClick={() => upgradeSilo(barn.id, siloUpgradeCost)}
                          disabled={money < siloUpgradeCost}
                          className={`w-full py-2 rounded text-xs font-bold flex items-center justify-center gap-1 ${
                            money >= siloUpgradeCost ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          }`}
                        >
                          <Package size={14} /> Expandir +2T (R$ {siloUpgradeCost.toLocaleString()})
                        </button>
                      </div>
                    </div>

                    {/* Equipamentos */}
                    <div className="border-t pt-4">
                      <p className="text-xs font-bold text-zinc-500 mb-3">Equipamentos Disponíveis</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.values(EQUIPMENTS).map(eq => {
                          const hasEq = barn.equipment.includes(eq.id);
                          const canBuy = money >= eq.cost && level >= eq.requiredLevel && !hasEq;
                          
                          return (
                            <button
                              key={eq.id}
                              onClick={() => buyEquipment(barn.id, eq.id, eq.cost)}
                              disabled={!canBuy}
                              title={eq.description}
                              className={`p-2 rounded border text-left text-xs transition-colors ${
                                hasEq 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                  : canBuy 
                                  ? 'bg-white border-zinc-200 hover:border-blue-300 text-zinc-700' 
                                  : 'bg-zinc-50 border-zinc-100 text-zinc-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="font-bold truncate">{eq.name}</div>
                              <div className="flex justify-between items-center mt-1">
                                {hasEq ? (
                                  <span className="flex items-center gap-1 text-emerald-600"><Check size={12}/> Instalado</span>
                                ) : (
                                  <>
                                    <span>R$ {eq.cost}</span>
                                    {level < eq.requiredLevel && <span className="text-red-400">Lvl {eq.requiredLevel}</span>}
                                  </>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Construir Novos Galpões */}
          <div>
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Plus size={20} /> Construir Novo Galpão
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(BARN_MODELS).map(model => (
                <div key={model.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-800">{model.name}</h3>
                    <p className="text-xs text-zinc-500 mb-2">{model.description}</p>
                    <div className="bg-zinc-50 p-2 rounded text-xs text-zinc-600 mb-4">
                      <p>Capacidade: {model.baseCapacity} aves</p>
                      <p>Custo Diário: R$ {model.baseDailyCost}</p>
                      <p>Requer Nível: {model.requiredLevel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyBarn(model.id)}
                    disabled={money < model.baseCost || level < model.requiredLevel}
                    className={`w-full py-2 rounded-lg font-bold text-sm ${
                      money >= model.baseCost && level >= model.requiredLevel
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    R$ {model.baseCost.toLocaleString()}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'FABRICAS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`border rounded-xl p-6 relative overflow-hidden ${hasFeedMill ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-2">Fábrica de Ração</h3>
            <p className="text-sm text-zinc-600 mb-4">Produza sua própria ração comprando milho e soja no mercado, reduzindo drasticamente os custos operacionais.</p>
            
            {hasFeedMill ? (
              <div className="text-emerald-700 font-bold flex items-center gap-2">
                <CheckCircle2 /> Fábrica Operante
              </div>
            ) : (
              <button
                onClick={() => buildFeedMill(150000)}
                disabled={money < 150000}
                className={`w-full py-3 rounded-lg font-bold ${money >= 150000 ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-400'}`}
              >
                Construir (R$ 150.000)
              </button>
            )}
          </div>

          <div className={`border rounded-xl p-6 relative overflow-hidden ${hasSlaughterhouse ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
            <h3 className="text-xl font-bold mb-2">Abatedouro Frigorífico</h3>
            <p className="text-sm text-zinc-600 mb-4">Abata seus próprios frangos e venda carne processada, dobrando a margem de lucro por lote.</p>
            
            {hasSlaughterhouse ? (
              <div className="text-emerald-700 font-bold flex items-center gap-2">
                <CheckCircle2 /> Abatedouro Operante
              </div>
            ) : (
              <button
                onClick={() => buildSlaughterhouse(300000)}
                disabled={money < 300000}
                className={`w-full py-3 rounded-lg font-bold ${money >= 300000 ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-400'}`}
              >
                Construir (R$ 300.000)
              </button>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
