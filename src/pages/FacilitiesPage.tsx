import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';
import { Warehouse, Plus, Settings, DollarSign, Package, Check, ChevronRight, Droplet, ArrowUpCircle, CheckCircle2, Truck, UserCircle, Fuel, Wrench } from 'lucide-react';
import { BARN_MODELS, EQUIPMENTS, MACHINERY_CATALOG } from '../store/constants';
import { PageTransition } from '../components/PageTransition';
import { BuyBarnModal } from '../components/BuyBarnModal';

export default function FacilitiesPage() {
  const {
    money, level, barns, inventory, hasFeedMill, hasIncubator, hasSlaughterhouse,
    buildFeedMill, buildSlaughterhouse, buyBarn, upgradeBarn, upgradeSilo, buyEquipment,
    buyMachinery, ownedMachinery,
    ownedVehicles, buyVehicle, assignDriverToVehicle, refuelVehicle, maintainVehicle, employees
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'GALPOES' | 'FABRICAS' | 'VEICULOS'>('GALPOES');
  const [buyingModelId, setBuyingModelId] = useState<string | null>(null);

  const handleBuyBarnClick = (modelId: string) => {
    setBuyingModelId(modelId);
  };

  return (
    <PageTransition className="space-y-6 pb-20">
      <BuyBarnModal 
        isOpen={buyingModelId !== null} 
        onClose={() => setBuyingModelId(null)} 
        modelId={buyingModelId} 
      />
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
          Indústria
        </button>
        <button
          onClick={() => setActiveTab('VEICULOS')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-colors ${
            activeTab === 'VEICULOS' ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
          }`}
        >
          Veículos & Maquinários
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

            <div className="mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">🐔 Galpões de Frango de Corte</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(BARN_MODELS).filter(m => m.id.includes('corte')).map(model => (
                  <div key={model.id} className="bg-white border border-blue-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">{model.name}</h3>
                      <p className="text-xs text-zinc-500 mb-3 h-10">{model.description}</p>
                      <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-4 space-y-1">
                        <p className="flex justify-between"><span>Capacidade:</span> <strong>{model.baseCapacity} aves</strong></p>
                        <p className="flex justify-between"><span>Custo Diário:</span> <strong>R$ {model.baseDailyCost}</strong></p>
                        <p className="flex justify-between"><span>Requer Nível:</span> <strong>{model.requiredLevel}</strong></p>
                      </div>
                    </div>
                    <button
                          onClick={() => handleBuyBarnClick(model.id)}
                          disabled={money < model.baseCost || level < model.requiredLevel}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                        money >= model.baseCost && level >= model.requiredLevel
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      Construir (R$ {model.baseCost.toLocaleString()})
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-amber-800 mb-3 border-b border-amber-200 pb-2">🥚 Galpões de Postura (Ovos)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(BARN_MODELS).filter(m => m.id.includes('postura')).map(model => (
                  <div key={model.id} className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-lg text-amber-900">{model.name}</h3>
                      <p className="text-xs text-zinc-500 mb-3 h-10">{model.description}</p>
                      <div className="bg-amber-50 p-3 rounded-lg text-xs text-amber-800 mb-4 space-y-1">
                        <p className="flex justify-between"><span>Capacidade:</span> <strong>{model.baseCapacity} aves</strong></p>
                        <p className="flex justify-between"><span>Custo Diário:</span> <strong>R$ {model.baseDailyCost}</strong></p>
                        <p className="flex justify-between"><span>Requer Nível:</span> <strong>{model.requiredLevel}</strong></p>
                      </div>
                    </div>
                    <button
                          onClick={() => handleBuyBarnClick(model.id)}
                          disabled={money < model.baseCost || level < model.requiredLevel}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition-colors ${
                        money >= model.baseCost && level >= model.requiredLevel
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                      }`}
                    >
                      Construir (R$ {model.baseCost.toLocaleString()})
                    </button>
                  </div>
                ))}
              </div>
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

      {activeTab === 'VEICULOS' && (
        <div className="space-y-8">
          
          {/* Frota Atual */}
          <div>
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Truck size={24} className="text-blue-600" /> Sua Frota (Garagem)
            </h2>
            
            {ownedVehicles && ownedVehicles.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {ownedVehicles.map(vehicle => {
                  const catalogData = MACHINERY_CATALOG[vehicle.catalogId];
                  const assignedDriver = employees.find(e => e.id === vehicle.assignedDriverId);
                  const availableDrivers = employees.filter(e => e.role === 'MOTORISTA');
                  
                  const refuelCost = Math.floor((100 - vehicle.fuelLevel) * 5); // R$ 5 per %
                  const maintCost = Math.floor((100 - vehicle.condition) * 20); // R$ 20 per %
                  
                  // Verifica se o motorista tem nível para dirigir
                  let canDrive = true;
                  let driverWarning = '';
                  if (assignedDriver && catalogData.minDriverLevel) {
                    if (assignedDriver.experienceLevel < catalogData.minDriverLevel) {
                      canDrive = false;
                      driverWarning = `O motorista precisa ser Nível ${catalogData.minDriverLevel} para dirigir.`;
                    }
                  } else if (!assignedDriver) {
                    canDrive = false;
                    driverWarning = 'Sem motorista designado.';
                  }

                  return (
                    <div key={vehicle.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-black text-lg text-zinc-800">{vehicle.name}</h3>
                          <p className="text-xs font-bold text-zinc-500 uppercase">{catalogData.name} • {catalogData.brand}</p>
                          <p className="text-sm text-blue-600 font-bold mt-1">Capacidade: {catalogData.capacityKg?.toLocaleString()} kg</p>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                          <div className="flex items-center justify-end gap-2 text-sm font-bold">
                            <span className="text-zinc-500">Tanque:</span>
                            <span className={vehicle.fuelLevel > 30 ? 'text-emerald-600' : 'text-red-600'}>{Math.floor(vehicle.fuelLevel)}%</span>
                          </div>
                          <div className="flex items-center justify-end gap-2 text-sm font-bold">
                            <span className="text-zinc-500">Condição:</span>
                            <span className={vehicle.condition > 30 ? 'text-blue-600' : 'text-red-600'}>{Math.floor(vehicle.condition)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          onClick={() => refuelVehicle(vehicle.id, refuelCost)}
                          disabled={vehicle.fuelLevel >= 100 || money < refuelCost}
                          className="py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Fuel size={14} /> Abastecer (R$ {refuelCost})
                        </button>
                        <button
                          onClick={() => maintainVehicle(vehicle.id, maintCost)}
                          disabled={vehicle.condition >= 100 || money < maintCost}
                          className="py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          <Wrench size={14} /> Revisão (R$ {maintCost})
                        </button>
                      </div>

                      <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        <label className="text-xs font-bold text-zinc-500 uppercase mb-1 block flex items-center gap-1">
                          <UserCircle size={14} /> Motorista Designado
                        </label>
                        <select
                          value={vehicle.assignedDriverId || ''}
                          onChange={(e) => assignDriverToVehicle(vehicle.id, e.target.value || null)}
                          className="w-full p-2 text-sm border border-zinc-300 rounded bg-white font-bold text-zinc-800"
                        >
                          <option value="">-- Selecionar Motorista --</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} (Nvl {d.experienceLevel})</option>
                          ))}
                        </select>
                        {!canDrive && (
                          <p className="text-xs font-bold text-red-500 mt-2 bg-red-50 p-1.5 rounded">{driverWarning}</p>
                        )}
                        {canDrive && (
                          <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 p-1.5 rounded">Pronto para rodar.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-white rounded-xl border border-zinc-200 border-dashed">
                <p className="text-zinc-500 font-medium">Você não possui veículos na garagem.</p>
                <p className="text-sm text-zinc-400 mt-1">Compre caminhões na concessionária abaixo para reduzir custos de frete.</p>
              </div>
            )}
          </div>

          <div className="border-t border-zinc-200 my-4"></div>

          {/* Concessionária */}
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-xl font-bold text-zinc-800">Concessionária (Máquinas e Veículos)</h2>
            <p className="text-sm text-zinc-600">Adquira veículos e máquinas para otimizar os processos da granja. Veículos são únicos e exigem motoristas capacitados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(MACHINERY_CATALOG).map(machinery => {
              const isVehicle = machinery.type.startsWith('TRUCK');
              const isOwned = !isVehicle && ownedMachinery.includes(machinery.id);
              const canAfford = money >= machinery.cost && level >= machinery.requiredLevel;

              return (
                <div key={machinery.id} className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all ${isOwned ? 'border-emerald-300 ring-1 ring-emerald-100' : 'border-zinc-200'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-lg text-zinc-800 leading-tight">{machinery.name}</h3>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{machinery.brand}</p>
                      </div>
                      {isOwned && (
                        <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-black flex items-center gap-1">
                          <CheckCircle2 size={14} /> Na Frota
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 mb-4 h-16 line-clamp-3">{machinery.description}</p>
                    
                    <div className="bg-zinc-50 p-3 rounded-lg text-sm text-zinc-700 mb-4 space-y-2">
                      {machinery.capacityKg && (
                        <p className="flex justify-between border-b border-zinc-100 pb-1">
                          <span className="text-zinc-500">Capacidade:</span>
                          <span className="font-bold text-blue-600">{machinery.capacityKg.toLocaleString()} kg</span>
                        </p>
                      )}
                      {machinery.minDriverLevel && (
                        <p className="flex justify-between border-b border-zinc-100 pb-1">
                          <span className="text-zinc-500">Nível do Motorista:</span>
                          <span className="font-bold text-amber-600">{machinery.minDriverLevel}</span>
                        </p>
                      )}
                      <p className="flex justify-between">
                        <span className="text-zinc-500">Requer Nível:</span>
                        <span className={`font-bold ${level >= machinery.requiredLevel ? 'text-zinc-800' : 'text-red-500'}`}>{machinery.requiredLevel}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => isVehicle ? buyVehicle(machinery.id, machinery.cost) : buyMachinery(machinery.id, machinery.cost)}
                    disabled={isOwned || !canAfford}
                    className={`w-full py-3 rounded-lg font-black transition-colors flex justify-center items-center gap-2 ${
                      isOwned
                        ? 'bg-emerald-50 text-emerald-600 cursor-default'
                        : canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                          : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {isOwned ? 'Adquirido' : `Comprar (R$ ${machinery.cost.toLocaleString()})`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
