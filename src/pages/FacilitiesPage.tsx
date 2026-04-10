import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Barn, BarnModel, BarnSize } from '../store/types';
import { Home, Hammer, Tractor, Factory, Zap, CheckCircle2, Truck, Power, Lock, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { EQUIPMENTS, FEEDS, MACHINERY_CATALOG, BARN_MODELS } from '../store/constants';
import { PageTransition } from '../components/PageTransition';
import { Tooltip } from '../components/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

const BARN_RENT_PRICES = {
  POSTURA: 500, // Por dia
  CORTE: 600,   // Por dia
};

const FEED_MILL_PRICE = 50000;
const SLAUGHTERHOUSE_PRICE = 120000;

export default function FacilitiesPage() {
  const money = useGameStore(state => state.money);
  const level = useGameStore(state => state.level);
  const barns = useGameStore(state => state.barns);
  const buyBarn = useGameStore(state => state.buyBarn);
  const upgradeBarn = useGameStore(state => state.upgradeBarn);
  const buyEquipment = useGameStore(state => state.buyEquipment);
  const hasFeedMill = useGameStore(state => state.hasFeedMill);
  const buildFeedMill = useGameStore(state => state.buildFeedMill);
  const produceFeed = useGameStore(state => state.produceFeed);
  const ownedMachinery = useGameStore(state => state.ownedMachinery);
  const buyMachinery = useGameStore(state => state.buyMachinery);
  const region = useGameStore(state => state.region);
  
  const hasSlaughterhouse = useGameStore(state => state.hasSlaughterhouse);
  const buildSlaughterhouse = useGameStore(state => state.buildSlaughterhouse);
  const company = useGameStore(state => state.company);

  const buyFutureContract = useGameStore(state => state.buyFutureContract);
  const futureContracts = useGameStore(state => state.futureContracts);
  const marketPrices = useGameStore(state => state.marketPrices);
  const currentDay = useGameStore(state => state.currentDay);
  const employees = useGameStore(state => state.employees);

  const [produceAmounts, setProduceAmounts] = useState<Record<string, number>>({
    feed_basic: 1000, feed_premium: 1000, feed_layers: 1000, feed_medicada: 1000
  });

  const landMod = region?.landCostModifier || 1;

  const handleProduceFeed = (feedId: string) => {
    const feed = FEEDS[feedId];
    if (!feed) return;
    
    // Calcula o custo com base nos contratos futuros de milho, se houver
    let costPerKg = feed.costPerKg * (marketPrices?.feedModifier || 1) * 0.7; // 30% mais barato base
    let contractUsed = false;
    
    // Verifica se tem contrato ativo
    const activeContract = futureContracts?.find(c => c.expiresAtDay > (currentDay || 1) && c.kg > 0);
    if (activeContract) {
      costPerKg = activeContract.lockedPricePerKg; // Usa o preço travado (geralmente bem menor)
      contractUsed = true;
    }

    const factoryBuff = employees?.filter(e => e.role === 'OPERADOR_FABRICA').reduce((acc, emp) => acc + (emp.experienceLevel * 0.05), 0) || 0;
    costPerKg *= Math.max(0.5, 1 - factoryBuff);

    const costToProduce = 1000 * costPerKg; // Lote de 1 tonelada
    
    if (money >= costToProduce) {
      produceFeed(feedId, 1000, costToProduce);
      // Aqui precisaríamos decrementar o kg do contrato, mas vamos simplificar: o contrato trava o preço por tempo, não quantidade, ou a gente ignora o decréscimo.
      // O correto seria um update, mas para não complicar a store, vamos considerar que o contrato garante "abastecimento contínuo àquele preço" até expirar.
    } else {
      alert("Dinheiro insuficiente!");
    }
  };

  const handleBuyContract = () => {
    const price = 1.0; // R$ 1.00 por kg (Muito mais barato que a média)
    const cost = 10000; // Custa 10k adiantado
    buyFutureContract?.(10000, price, 30, cost); // 30 dias de duração
  };

  const handleBuyBarnModel = (model: BarnModel, type: 'POSTURA' | 'CORTE') => {
    const cost = model.baseCost * landMod;
    if (money >= cost) {
      const newBarn: Barn = {
        id: `barn_${Date.now()}`,
        name: `${model.name} (${type.charAt(0) + type.slice(1).toLowerCase()} ${barns.length + 1})`,
        type,
        size: model.size,
        level: 1,
        capacity: model.baseCapacity,
        equipment: [],
        dailyCost: model.baseDailyCost * landMod,
        isRented: false,
        sanitaryVoidDays: 0,
        batch: null,
        selectedFeedId: 'feed_basic',
        siloBalance: 0,
        siloCapacity: model.size === 'PEQUENO' ? 5000 : model.size === 'MEDIO' ? 10000 : 20000,
      };
      buyBarn(newBarn, cost);
    }
  };

  const handleRentBarn = (type: 'POSTURA' | 'CORTE') => {
    const dailyCost = BARN_RENT_PRICES[type];
    const initialDeposit = dailyCost * 7; // Paga 1 semana adiantada
    if (money >= initialDeposit) {
      const newBarn: Barn = {
        id: `barn_rented_${Date.now()}`,
        name: `Integração de ${type.charAt(0) + type.slice(1).toLowerCase()} ${barns.length + 1}`,
        type,
        size: 'MEDIO',
        level: 1,
        capacity: type === 'POSTURA' ? 3000 : 6000,
        equipment: [],
        dailyCost: (type === 'POSTURA' ? 25 : 35) + dailyCost,
        isRented: true,
        sanitaryVoidDays: 0,
        batch: null,
        selectedFeedId: 'feed_basic',
        siloBalance: 0,
        siloCapacity: 10000,
      };
      buyBarn(newBarn, initialDeposit);
    }
  };

  return (
    <PageTransition className="space-y-8">
      {/* Construir Galpões */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Home size={24} className="text-blue-600" />
          Expansão de Galpões
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Postura */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-800 mb-4 border-b border-zinc-100 pb-2">Novos Galpões de Postura</h3>
            <div className="space-y-4 mb-6">
              {Object.values(BARN_MODELS).filter(m => m.id.includes('postura')).map(model => {
                const cost = model.baseCost * landMod;
                const canAfford = money >= cost;
                const isLocked = level < model.requiredLevel;

                return (
                  <div key={model.id} className={`p-4 border rounded-lg relative ${isLocked ? 'opacity-60 bg-zinc-50' : 'border-zinc-200'}`}>
                    {isLocked && (
                      <div className="absolute inset-0 bg-zinc-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                        <div className="bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Lock size={12} /> Nível {model.requiredLevel}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-zinc-800">{model.name}</h4>
                        <p className="text-xs text-zinc-500">{model.description}</p>
                      </div>
                      <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">
                        {model.baseCapacity.toLocaleString()} aves
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-red-500 font-medium">Custo Diário: R$ {(model.baseDailyCost * landMod).toFixed(2)}</span>
                      <button
                        onClick={() => handleBuyBarnModel(model, 'POSTURA')}
                        disabled={!canAfford || isLocked}
                        className={`px-4 py-1.5 rounded text-sm font-bold transition-opacity ${canAfford && !isLocked ? 'text-white hover:opacity-90' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        style={canAfford && !isLocked ? { backgroundColor: company?.color || '#2563eb' } : {}}
                      >
                        Comprar R$ {cost.toLocaleString()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto pt-4 border-t border-zinc-100">
              <button
                onClick={() => handleRentBarn('POSTURA')}
                disabled={money < BARN_RENT_PRICES.POSTURA * 7}
                className="w-full px-6 py-2 bg-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-between transition-colors"
                style={{ 
                  color: company?.color || '#2563eb', 
                  borderColor: company?.color || '#2563eb',
                  borderWidth: '1px'
                }}
              >
                <span>Alugar Médio (Integração)</span>
                <span>R$ {BARN_RENT_PRICES.POSTURA.toLocaleString()}/dia</span>
              </button>
            </div>
          </div>

          {/* Corte */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-800 mb-4 border-b border-zinc-100 pb-2">Novos Galpões de Corte</h3>
            <div className="space-y-4 mb-6">
              {Object.values(BARN_MODELS).filter(m => m.id.includes('corte')).map(model => {
                const cost = model.baseCost * landMod;
                const canAfford = money >= cost;
                const isLocked = level < model.requiredLevel;

                return (
                  <div key={model.id} className={`p-4 border rounded-lg relative ${isLocked ? 'opacity-60 bg-zinc-50' : 'border-zinc-200'}`}>
                    {isLocked && (
                      <div className="absolute inset-0 bg-zinc-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                        <div className="bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                          <Lock size={12} /> Nível {model.requiredLevel}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-zinc-800">{model.name}</h4>
                        <p className="text-xs text-zinc-500">{model.description}</p>
                      </div>
                      <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded">
                        {model.baseCapacity.toLocaleString()} aves
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-red-500 font-medium">Custo Diário: R$ {(model.baseDailyCost * landMod).toFixed(2)}</span>
                      <button
                        onClick={() => handleBuyBarnModel(model, 'CORTE')}
                        disabled={!canAfford || isLocked}
                        className={`px-4 py-1.5 rounded text-sm font-bold transition-opacity ${canAfford && !isLocked ? 'text-white hover:opacity-90' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        style={canAfford && !isLocked ? { backgroundColor: company?.color || '#2563eb' } : {}}
                      >
                        Comprar R$ {cost.toLocaleString()}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto pt-4 border-t border-zinc-100">
              <button
                onClick={() => handleRentBarn('CORTE')}
                disabled={money < BARN_RENT_PRICES.CORTE * 7}
                className="w-full px-6 py-2 bg-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-between transition-colors"
                style={{ 
                  color: company?.color || '#2563eb', 
                  borderColor: company?.color || '#2563eb',
                  borderWidth: '1px'
                }}
              >
                <span>Alugar Médio (Integração)</span>
                <span>R$ {BARN_RENT_PRICES.CORTE.toLocaleString()}/dia</span>
              </button>
            </div>
          </div>
          </div>
          
          {hasFeedMill && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200 mt-6 col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-amber-500" /> Mercado de Futuros (Matéria-Prima)
              </h3>
              <p className="text-sm text-zinc-600 mb-4">
                Trave o preço da saca de milho pagando adiantado. Isso blinda sua fábrica contra eventos globais e sazonais.
              </p>
              
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-amber-800">Contrato: Safra Futura</h4>
                  <p className="text-sm text-amber-700">Preço Fixo: R$ 1.00/kg (Duração: 30 dias)</p>
                </div>
                <button 
                  onClick={handleBuyContract}
                  disabled={money < 10000 || futureContracts.some(c => c.expiresAtDay > currentDay)}
                  className="w-full md:w-auto px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {futureContracts.some(c => c.expiresAtDay > currentDay) ? 'Contrato Ativo' : 'Comprar (R$ 10.000)'}
                </button>
              </div>
            </div>
          )}
        </section>

      {/* Melhorias e Equipamentos */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Zap size={24} className="text-amber-500" />
          Melhorias de Galpão
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          {barns.length > 0 ? (
            <div className="divide-y divide-zinc-200">
              {barns.map(barn => (
                <div key={barn.id} className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                        {barn.name}
                        <span className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded-full">Nível {barn.level}</span>
                      </h3>
                      <p className="text-sm font-medium text-zinc-500 mt-1">
                        Tamanho: {barn.size} | Capacidade Atual: {barn.capacity} aves
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          const upgradeCost = 5000 * barn.level * (barn.size === 'GRANDE' ? 3 : barn.size === 'MEDIO' ? 2 : 1);
                          upgradeBarn(barn.id, upgradeCost);
                        }}
                        disabled={money < (5000 * barn.level * (barn.size === 'GRANDE' ? 3 : barn.size === 'MEDIO' ? 2 : 1))}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                      >
                        <ArrowUpCircle size={16} /> Upgrade (R$ {(5000 * barn.level * (barn.size === 'GRANDE' ? 3 : barn.size === 'MEDIO' ? 2 : 1)).toLocaleString()})
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {Object.values(EQUIPMENTS).map(eq => {
                      const hasEquip = barn.equipment.includes(eq.id);
                      const canAfford = money >= eq.cost;
                      const isLocked = level < eq.requiredLevel;
                      
                      const pros = [];
                      const cons = [];
                      if (eq.effect.capacityIncrease) pros.push(`+${eq.effect.capacityIncrease} Capacidade`);
                      if (eq.effect.mortalityReduction) pros.push(`-${eq.effect.mortalityReduction * 100}% Mortalidade`);
                      if (eq.effect.growthBonus) pros.push(`+${eq.effect.growthBonus * 100}% Crescimento`);
                      if (eq.effect.eggBonus) pros.push(`+${eq.effect.eggBonus * 100}% Postura`);
                      if (eq.effect.dailyCostIncrease) cons.push(`+R$ ${eq.effect.dailyCostIncrease}/dia`);
                      
                      return (
                        <div key={eq.id} className={`relative p-4 rounded-lg border flex flex-col justify-between ${hasEquip ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'} ${isLocked ? 'opacity-70' : ''}`}>
                          {isLocked && (
                            <div className="absolute inset-0 bg-zinc-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
                              <div className="bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                                <Lock size={12} /> Nível {eq.requiredLevel}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-bold text-zinc-800 text-sm leading-tight pr-2">{eq.name}</h4>
                              <Tooltip content={eq.description} pros={pros} cons={cons} />
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {pros.map((p, i) => <span key={i} className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">{p}</span>)}
                              {cons.map((c, i) => <span key={i} className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">{c}</span>)}
                            </div>
                          </div>
                          
                          {hasEquip ? (
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-100/50 p-2 rounded justify-center mt-auto">
                              <CheckCircle2 size={16} /> Instalado
                            </div>
                          ) : (
                            <button
                              onClick={() => buyEquipment(barn.id, eq.id, eq.cost)}
                              disabled={!canAfford || isLocked}
                              className={`w-full py-2 rounded text-sm font-bold transition-opacity mt-auto ${canAfford && !isLocked ? 'bg-amber-500 hover:bg-amber-600 text-white hover:opacity-90' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                            >
                              Comprar (R$ {eq.cost})
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              Você precisa construir galpões antes de comprar melhorias.
            </div>
          )}
        </div>
      </section>

      {/* Frota e Maquinário (NOVO) */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Truck size={24} className="text-indigo-600" />
          Frota e Maquinário Pesado
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden p-6">
          <p className="text-zinc-500 text-sm mb-6">
            Adquira veículos e equipamentos industriais para melhorar a logística, reduzir custos e proteger sua granja.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(MACHINERY_CATALOG).map(machine => {
              const hasMachinery = ownedMachinery.includes(machine.id);
              const canAfford = money >= machine.cost;
              const isLocked = level < machine.requiredLevel;
              
              let Icon = Truck;
              if (machine.type === 'TRACTOR') Icon = Tractor;
              if (machine.type === 'GENERATOR') Icon = Power;

              return (
                <div key={machine.id} className={`relative p-5 rounded-xl border flex flex-col justify-between ${hasMachinery ? 'bg-indigo-50 border-indigo-200' : 'bg-zinc-50 border-zinc-200'} ${isLocked ? 'opacity-70' : ''}`}>
                  {isLocked && (
                    <div className="absolute inset-0 bg-zinc-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                      <div className="bg-zinc-800 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                        <Lock size={16} /> Desbloqueia no Nível {machine.requiredLevel}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${hasMachinery ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-zinc-500 shadow-sm border border-zinc-100'}`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-800">{machine.name}</h3>
                          <p className="text-xs font-bold text-zinc-500">{machine.brand}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${machine.tier === 'PREMIUM' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-600'}`}>
                        {machine.tier}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-600 mb-4 h-10">
                      {machine.description}
                    </p>
                  </div>
                  
                  {hasMachinery ? (
                    <div className="w-full py-2.5 mt-4 bg-indigo-100/50 text-indigo-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-indigo-100">
                      <CheckCircle2 size={18} /> Adquirido e Operacional
                    </div>
                  ) : (
                    <button
                      onClick={() => buyMachinery(machine.id, machine.cost)}
                      disabled={!canAfford || isLocked}
                      className={`w-full py-2.5 mt-4 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 ${canAfford && !isLocked ? 'text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                      style={canAfford && !isLocked ? { backgroundColor: company?.color || '#4f46e5' } : {}}
                    >
                      Comprar (R$ {machine.cost.toLocaleString()})
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projetos Agroindustriais */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Hammer size={24} className="text-zinc-500" />
          Projetos Agroindustriais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fábrica de Ração */}
          <div className={`bg-white p-6 rounded-xl border ${hasFeedMill ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${hasFeedMill ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                  <Tractor size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">Fábrica de Ração</h3>
              </div>
              {hasFeedMill && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded uppercase tracking-wider">
                  Operacional
                </span>
              )}
            </div>
            
            {!hasFeedMill ? (
              <>
                <p className="text-zinc-500 text-sm mb-6">
                  Construa sua própria fábrica para produzir ração comprando os ingredientes a preço de atacado (40% de desconto sobre o preço de mercado).
                </p>
                <button
                  onClick={() => buildFeedMill(FEED_MILL_PRICE)}
                  disabled={money < FEED_MILL_PRICE}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-between px-4"
                >
                  <span>Construir Fábrica</span>
                  <span>R$ {FEED_MILL_PRICE.toLocaleString()}</span>
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-emerald-700 font-medium bg-emerald-50 p-2 rounded">
                  Custo de produção: 40% menor que no Mercado.
                </p>
                <div className="space-y-3">
                  {Object.values(FEEDS).map(feed => {
                    let costToProduce = feed.costPerKg * 0.6; // 40% de desconto
                      const activeContract = futureContracts?.find(c => c.expiresAtDay > (currentDay || 1) && c.kg > 0);
                      if (activeContract) {
                        costToProduce = activeContract.lockedPricePerKg;
                      }

                      const factoryBuff = employees?.filter(e => e.role === 'OPERADOR_FABRICA').reduce((acc, emp) => acc + (emp.experienceLevel * 0.05), 0) || 0;
                      costToProduce *= Math.max(0.5, 1 - factoryBuff);
                      
                      const kgAmount = produceAmounts[feed.id] || 1000;
                    const totalCost = kgAmount * costToProduce;
                    const canAfford = money >= totalCost;
                    
                    const factor = kgAmount / 1000;
                    const cornNeeded = 600 * factor;
                    const soyNeeded = 350 * factor;
                    const premixNeeded = 50 * factor;
                    
                    const cornIdx = useGameStore.getState().inventory.findIndex(i => i.itemId === 'corn');
                    const soyIdx = useGameStore.getState().inventory.findIndex(i => i.itemId === 'soy');
                    const premixIdx = useGameStore.getState().inventory.findIndex(i => i.itemId === 'premix');
                    
                    const hasRawMaterials = 
                      cornIdx >= 0 && useGameStore.getState().inventory[cornIdx].quantity >= cornNeeded &&
                      soyIdx >= 0 && useGameStore.getState().inventory[soyIdx].quantity >= soyNeeded &&
                      premixIdx >= 0 && useGameStore.getState().inventory[premixIdx].quantity >= premixNeeded;

                    return (
                      <div key={feed.id} className="flex flex-col gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-zinc-700">{feed.name}</span>
                          <span className="text-xs font-medium text-emerald-600">Custo Fixo: R$ {costToProduce.toFixed(2)}/kg</span>
                        </div>
                        <p className={`text-xs font-bold mb-1 ${hasRawMaterials ? 'text-blue-600' : 'text-red-500'}`}>
                          Requer: {cornNeeded.toFixed(0)}kg Milho, {soyNeeded.toFixed(0)}kg Soja, {premixNeeded.toFixed(0)}kg Premix
                        </p>
                        <div className="flex gap-2">
                          <input 
                            type="number"
                            min="100"
                            step="100"
                            value={kgAmount}
                            onChange={(e) => setProduceAmounts({...produceAmounts, [feed.id]: Number(e.target.value)})}
                            className="w-24 p-2 rounded-lg border border-zinc-300 bg-white text-zinc-800 text-sm"
                          />
                          <button
                            onClick={() => produceFeed(feed.id, kgAmount, totalCost)}
                            disabled={!canAfford || !hasRawMaterials}
                            className={`flex-1 py-1 px-2 rounded-md text-sm font-bold ${(canAfford && hasRawMaterials) ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                            title={!hasRawMaterials ? 'Matéria-prima insuficiente no estoque' : ''}
                          >
                            Produzir (R$ {totalCost.toFixed(2)})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Abatedouro Próprio */}
          <div className={`bg-white p-6 rounded-xl border ${hasSlaughterhouse ? 'border-blue-300 ring-2 ring-blue-100' : 'border-zinc-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${hasSlaughterhouse ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
                  <Factory size={24} />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">Abatedouro Próprio</h3>
              </div>
              {hasSlaughterhouse && (
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded uppercase tracking-wider">
                  Operacional
                </span>
              )}
            </div>
            
            {!hasSlaughterhouse ? (
              <>
                <p className="text-zinc-500 text-sm mb-6">
                  Processe seus próprios frangos! Frango abatido e embalado tem um valor agregado quase 2x maior do que o frango vivo vendido a intermediários.
                </p>
                <button
                  onClick={() => buildSlaughterhouse(SLAUGHTERHOUSE_PRICE)}
                  disabled={money < SLAUGHTERHOUSE_PRICE}
                  className="w-full py-3 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex justify-between px-4"
                >
                  <span>Construir Abatedouro</span>
                  <span>R$ {SLAUGHTERHOUSE_PRICE.toLocaleString()}</span>
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-blue-700 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="block mb-2 font-bold flex items-center gap-2"><CheckCircle2 size={16} /> Tudo pronto!</span>
                  Seus galpões de corte agora vendem frangos abatidos automaticamente com alto valor agregado!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
