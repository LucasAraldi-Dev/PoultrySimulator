import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { FEEDS, CHICK_COST, EGG_PRICE, LAYER_COST, RAW_MATERIALS } from '../store/constants';
import { ShoppingCart, DollarSign, Package, Egg, Bird, Truck, Box, Store, FileText, Wheat } from 'lucide-react';
import { BarnType } from '../store/types';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketPage() {
  const money = useGameStore(state => state.money);
  const sellProductsApi = useGameStore(state => state.sellProductsApi);
  const buyItemApi = useGameStore(state => state.buyItemApi);
  const buyBatchApi = useGameStore(state => state.buyBatchApi);
  
  const barns = useGameStore(state => state.barns);
  const products = useGameStore(state => state.products);
  const marketPrices = useGameStore(state => state.marketPrices);
  const company = useGameStore(state => state.company);
  const level = useGameStore(state => state.level);
  const region = useGameStore(state => state.region);
  const ownedMachinery = useGameStore(state => state.ownedMachinery);
  const pendingDeliveries = useGameStore(state => state.pendingDeliveries);
  const currentDay = useGameStore(state => state.currentDay);

  const [activeTab, setActiveTab] = useState<'RACOES' | 'AVES' | 'VENDAS'>('RACOES');

  const [feedAmounts, setFeedAmounts] = useState<Record<string, number>>({
    feed_broiler_pre: 100, feed_basic: 100, feed_terminacao: 100, feed_premium: 100,
    feed_layers_start: 100, feed_layers: 100, feed_layers_premium: 100, feed_medicada: 100
  });
  const [deliveryPrefs, setDeliveryPrefs] = useState<Record<string, { scheduledInDays: number; useOwnTruck: boolean }>>({});

  const emptyBarns = barns.filter(b => !b.batch);

  const handleBuyFeed = (feedId: string) => {
    const feed = FEEDS[feedId];
    if (!feed) return;
    
    const currentCost = feed.costPerKg * marketPrices.feedModifier;
    const kg = feedAmounts[feedId] || 100;
    const pref = deliveryPrefs[feedId] || { scheduledInDays: 0, useOwnTruck: false };

    const totalCost = kg * currentCost;
    buyItemApi(feedId, kg, totalCost, pref.scheduledInDays, pref.useOwnTruck);
    setFeedAmounts({ ...feedAmounts, [feedId]: 100 });
  };

  const handleBuyRawMaterial = (matId: string) => {
    const mat = RAW_MATERIALS[matId];
    if (!mat) return;
    
    const currentCost = mat.costPerUnit * marketPrices.feedModifier;
    const qty = feedAmounts[matId] || 100;
    const pref = deliveryPrefs[matId] || { scheduledInDays: 0, useOwnTruck: false };

    const totalCost = qty * currentCost;
    buyItemApi(matId, qty, totalCost, pref.scheduledInDays, pref.useOwnTruck);
    setFeedAmounts({ ...feedAmounts, [matId]: 100 });
  };

  const handleBuyFlock = (barnId: string, type: BarnType, capacity: number, isRented: boolean) => {
    const cost = isRented ? 0 : (type === 'POSTURA' ? capacity * LAYER_COST : capacity * CHICK_COST);
    buyBatchApi(barnId, capacity, cost);
  };

  const dynamicContracts = useGameStore(state => state.dynamicContracts);
  const acceptContract = useGameStore(state => state.acceptContract);
  const fulfillContract = useGameStore(state => state.fulfillContract);

  return (
    <PageTransition className="space-y-6">
      
      {/* Abas Superiores */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-zinc-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('RACOES')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'RACOES' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
          }`}
        >
          <Wheat size={18} /> Comprar Insumos
        </button>
        <button
          onClick={() => setActiveTab('AVES')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'AVES' ? 'bg-blue-100 text-blue-800 shadow-sm' : 'bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
          }`}
        >
          <Bird size={18} /> Alojar Aves
        </button>
        <button
          onClick={() => setActiveTab('VENDAS')}
          className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'VENDAS' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
          }`}
        >
          <Store size={18} /> Vendas e Contratos
        </button>
      </div>

      {activeTab === 'VENDAS' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Contratos Dinâmicos */}
          {dynamicContracts && dynamicContracts.filter(c => c.status === 'AVAILABLE' || c.status === 'ACCEPTED').length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-blue-600" />
                Contratos Comerciais
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {dynamicContracts.filter(c => c.status === 'AVAILABLE' || c.status === 'ACCEPTED').map(contract => (
                  <div key={contract.id} className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-zinc-800">{contract.companyName}</h3>
                        <p className="text-sm text-zinc-500">Exige: {contract.requiredQuantity.toLocaleString()} {contract.requiredItem === 'meat' ? 'kg de Carne' : 'Ovos'}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full h-fit">
                        {contract.deadlineDays} dia(s) restante(s)
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg mb-4 border border-zinc-100">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Pagamento</p>
                        <p className="font-black text-emerald-600 text-lg">R$ {contract.rewardMoney.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">Multa por Atraso</p>
                        <p className="font-black text-red-600 text-lg">R$ {contract.penaltyMoney.toLocaleString()}</p>
                      </div>
                    </div>

                    {contract.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => acceptContract(contract.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                      >
                        Assinar Contrato
                      </button>
                    ) : (
                      <button
                        onClick={() => fulfillContract(contract.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
                      >
                        Entregar Produto
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Vendas Avulsas (Vender Ovos / Carne) */}
          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Store size={24} className="text-emerald-600" />
              Mercado Atacadista (Venda Avulsa)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ovos */}
              <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col justify-between">
                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 border-b border-orange-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-orange-500 text-white rounded-xl shadow-md">
                      <Egg size={24} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Cotação Atual</p>
                      <p className="text-xl font-black text-orange-700">R$ {marketPrices.egg.toFixed(2)}<span className="text-xs font-bold opacity-70"> / un</span></p>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-zinc-800">Ovos em Estoque</h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 flex justify-between items-center">
                    <span className="text-zinc-500 font-bold">Quantidade Disponível</span>
                    <span className="text-xl font-black text-zinc-800">{products.eggs.toLocaleString()} un</span>
                  </div>
                  <button
                    onClick={() => sellProductsApi('eggs', products.eggs, marketPrices.egg)}
                    disabled={products.eggs === 0}
                    className="w-full px-6 py-4 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: company?.color || '#10b981' }}
                  >
                    <DollarSign size={20} />
                    Vender Tudo (R$ {(products.eggs * marketPrices.egg).toFixed(2)})
                  </button>
                </div>
              </div>

              {/* Carne Processada */}
              <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col justify-between">
                <div className="p-6 bg-gradient-to-br from-red-50 to-red-100/50 border-b border-red-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-3 bg-red-600 text-white rounded-xl shadow-md">
                      <Package size={24} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Cotação Atual</p>
                      <p className="text-xl font-black text-red-700">R$ {marketPrices.processedMeat.toFixed(2)}<span className="text-xs font-bold opacity-70"> / kg</span></p>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-zinc-800">Carne Processada</h3>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 flex justify-between items-center">
                    <span className="text-zinc-500 font-bold">Quantidade Disponível</span>
                    <span className="text-xl font-black text-zinc-800">{(useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity || 0).toFixed(1)} kg</span>
                  </div>
                  <button
                    onClick={() => {
                      const qty = useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity || 0;
                      if (qty > 0) sellProductsApi('meat', qty, marketPrices.processedMeat);
                    }}
                    disabled={(useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity || 0) <= 0}
                    className="w-full px-6 py-4 bg-zinc-900 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-black hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <DollarSign size={20} />
                    Vender Estoque de Carne
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'AVES' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section>
            <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Bird size={24} className="text-blue-600" />
              Aves e Alojamento
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              {emptyBarns.length > 0 ? (
                <div className="divide-y divide-zinc-200">
                  <AnimatePresence>
                    {emptyBarns.map(barn => {
                      const totalCost = barn.isRented ? 0 : (barn.type === 'POSTURA' ? barn.capacity * LAYER_COST : barn.capacity * CHICK_COST);
                      const canAfford = money >= totalCost;
                      const isInSanitaryVoid = barn.sanitaryVoidDays > 0;
                      const isDisabled = !canAfford || isInSanitaryVoid;

                      return (
                        <motion.div 
                          key={barn.id} 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col md:flex-row relative hover:bg-zinc-50 transition-colors"
                        >
                          <div className="p-6 flex-1 flex flex-col justify-center">
                            <h3 className="text-lg font-black text-zinc-800 flex items-center gap-2">
                              {barn.name} 
                              {barn.isRented && <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Integração</span>}
                            </h3>
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm font-bold text-zinc-500 bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                                {barn.capacity.toLocaleString()} aves
                              </span>
                              <span className="text-sm font-bold text-zinc-500 bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                                Tipo: {barn.type}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 mt-3 font-medium">
                              {barn.isRented 
                                ? 'A Integradora fornece os pintinhos e a ração. Você entra com a estrutura, cama e manejo.' 
                                : `Custo de Alojamento: R$ ${totalCost.toFixed(2)}`}
                            </p>
                          </div>
                          <div className="p-6 flex items-center border-t md:border-t-0 md:border-l border-zinc-100 bg-zinc-50/50 min-w-[250px] justify-center">
                            <motion.button
                              whileTap={!isDisabled ? { scale: 0.95 } : {}}
                              onClick={() => handleBuyFlock(barn.id, barn.type, barn.capacity, barn.isRented)}
                              disabled={isDisabled}
                              className={`w-full px-6 py-4 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${!isDisabled ? 'text-white hover:shadow-md' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300'}`}
                              style={!isDisabled ? { backgroundColor: barn.isRented ? '#3b82f6' : (company?.color || '#10b981') } : {}}
                            >
                              {isInSanitaryVoid 
                                ? `Vazio Sanitário (${barn.sanitaryVoidDays}d)` 
                                : barn.isRented ? 'Solicitar Lote Integrado' : (canAfford ? 'Comprar e Alojar Lote' : 'Saldo Insuficiente')}
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center bg-zinc-50/50">
                  <Bird size={64} className="text-zinc-200 mb-4" />
                  <h3 className="text-xl font-black text-zinc-700">Todos os galpões estão ocupados.</h3>
                  <p className="text-zinc-500 mt-2 font-medium">Construa ou alugue novos galpões na aba Infraestrutura.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'RACOES' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Tabela Unificada de Rações e Insumos */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
                <Wheat size={24} className="text-amber-600" />
                Catálogo de Fornecedores
              </h2>
            </div>

            {pendingDeliveries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5 mb-6 flex items-center gap-6 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 shrink-0 border-r border-zinc-200 pr-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-800">Em Trânsito</h3>
                    <p className="text-xs text-zinc-500">{pendingDeliveries.length} pedido(s)</p>
                  </div>
                </div>
                {pendingDeliveries.slice().sort((a, b) => a.arrivesAtDay - b.arrivesAtDay).map(d => (
                  <div key={d.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 shrink-0 min-w-[200px]">
                    <p className="font-bold text-sm text-zinc-800 truncate">{FEEDS[d.itemId]?.name || RAW_MATERIALS[d.itemId]?.name || d.itemId}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1 mb-2">
                      {d.quantity.toFixed(0)} {RAW_MATERIALS[d.itemId]?.unit || 'kg'} • {d.mode === 'CAMINHAO' ? 'Próprio' : 'Fornecedor'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Chega dia {d.arrivesAtDay}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                    <tr>
                      <th className="p-4 pl-6 w-[35%]">Produto / Insumo</th>
                      <th className="p-4 w-[15%]">Preço Atual</th>
                      <th className="p-4 w-[25%]">Logística</th>
                      <th className="p-4 pr-6 w-[25%] text-right">Comprar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    
                    {/* Renderiza Rações */}
                    {Object.values(FEEDS).map(item => (
                      <MarketTableRow 
                        key={item.id}
                        item={item}
                        type="FEED"
                        marketPrices={marketPrices}
                        feedAmounts={feedAmounts}
                        setFeedAmounts={setFeedAmounts}
                        handleBuy={handleBuyFeed}
                        money={money}
                        region={region}
                        ownedMachinery={ownedMachinery}
                        deliveryPrefs={deliveryPrefs}
                        setDeliveryPrefs={setDeliveryPrefs}
                      />
                    ))}

                    {/* Renderiza Matérias Primas */}
                    {Object.values(RAW_MATERIALS).map(item => (
                      <MarketTableRow 
                        key={item.id}
                        item={item}
                        type="RAW"
                        marketPrices={marketPrices}
                        feedAmounts={feedAmounts}
                        setFeedAmounts={setFeedAmounts}
                        handleBuy={handleBuyRawMaterial}
                        money={money}
                        region={region}
                        ownedMachinery={ownedMachinery}
                        deliveryPrefs={deliveryPrefs}
                        setDeliveryPrefs={setDeliveryPrefs}
                      />
                    ))}

                  </tbody>
                </table>
              </div>
            </div>
          </section>

        </div>
      )}
    </PageTransition>
  );
}

// Componente para renderizar a linha da tabela de compra
function MarketTableRow({ item, type, marketPrices, feedAmounts, setFeedAmounts, handleBuy, money, region, ownedMachinery, deliveryPrefs, setDeliveryPrefs }: any) {
  const currentCost = (type === 'FEED' ? item.costPerKg : item.costPerUnit) * marketPrices.feedModifier;
  const unit = type === 'FEED' ? 'kg' : item.unit;
  
  const hasFeedTruck = ownedMachinery?.includes('prem_truck_feed') || ownedMachinery?.includes('gen_truck_feed');
  const pref = deliveryPrefs[item.id] || { scheduledInDays: 0, useOwnTruck: false };
  const mode = pref.useOwnTruck && hasFeedTruck ? 'CAMINHAO' : 'ENTREGA';
  const baseTransitDays = Math.min(6, Math.max(1, Math.ceil(((region?.freightCostPerKg || 0.05) * 20))));
  const transitDays = mode === 'CAMINHAO' ? 1 : baseTransitDays;
  const dispatchIn = Math.max(0, Math.floor(pref.scheduledInDays));
  const etaLabel = dispatchIn === 0 ? `${transitDays} dia(s)` : `${dispatchIn + transitDays} dia(s)`;

  // Define badges visuais
  let badgeColor = "bg-zinc-100 text-zinc-600";
  let badgeText = "Básico";
  if (item.id.includes('broiler') || item.id.includes('corte') || item.id.includes('terminacao')) { badgeColor = "bg-blue-100 text-blue-700"; badgeText = "Frango de Corte"; }
  if (item.id.includes('layers') || item.id.includes('postura')) { badgeColor = "bg-orange-100 text-orange-700"; badgeText = "Postura"; }
  if (item.id.includes('medicada')) { badgeColor = "bg-emerald-100 text-emerald-700"; badgeText = "Medicado"; }
  if (type === 'RAW') { badgeColor = "bg-zinc-800 text-white"; badgeText = "Matéria-Prima"; }

  const qtyValue = feedAmounts[item.id] || 100;
  const canAfford = money >= (qtyValue * currentCost);

  return (
    <tr className="hover:bg-zinc-50/80 transition-colors group">
      <td className="p-4 pl-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
          <div className="font-black text-sm text-zinc-900">{item.name}</div>
          <div className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed">{item.description}</div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-black text-zinc-800">R$ {currentCost.toFixed(2)}<span className="text-xs text-zinc-400 font-bold">/{unit}</span></span>
          <div className="flex gap-1">
            {marketPrices.feedModifier > 1.05 && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Alta</span>}
            {marketPrices.feedModifier < 0.95 && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">Baixa</span>}
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex flex-col gap-2 max-w-[200px]">
          <select 
            value={pref.scheduledInDays}
            onChange={(e) => setDeliveryPrefs({ ...deliveryPrefs, [item.id]: { ...pref, scheduledInDays: Number(e.target.value) } })}
            className="w-full border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold text-zinc-700 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none shadow-sm cursor-pointer transition-shadow"
          >
            <option value={0}>Imediato (Hoje)</option>
            <option value={1}>Agendar: +1 Dia</option>
            <option value={2}>Agendar: +2 Dias</option>
            <option value={3}>Agendar: +3 Dias</option>
          </select>
          
          <div className="flex rounded-lg border border-zinc-200 overflow-hidden bg-zinc-100 p-0.5 shadow-inner">
            <button 
              className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors ${mode === 'ENTREGA' ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'}`}
              onClick={() => setDeliveryPrefs({ ...deliveryPrefs, [item.id]: { ...pref, useOwnTruck: false } })}
            >
              Fornecedor
            </button>
            <button 
              className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition-colors ${mode === 'CAMINHAO' ? 'bg-white text-zinc-800 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'} ${!hasFeedTruck ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!hasFeedTruck}
              onClick={() => setDeliveryPrefs({ ...deliveryPrefs, [item.id]: { ...pref, useOwnTruck: true } })}
              title={!hasFeedTruck ? "Requer Caminhão de Ração" : ""}
            >
              Frota
            </button>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold ml-1">Previsão: <span className="text-zinc-600">{etaLabel}</span></span>
        </div>
      </td>
      <td className="p-4 pr-6">
        <div className="flex items-center justify-end gap-2">
          <div className="relative">
            <input 
              type="number" 
              min="1"
              value={qtyValue}
              onChange={(e) => setFeedAmounts({...feedAmounts, [item.id]: Number(e.target.value)})}
              className="w-24 pl-3 pr-8 py-2 rounded-xl border border-zinc-300 bg-white text-zinc-800 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm transition-shadow text-right"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 pointer-events-none">{unit}</span>
          </div>
          
          <button 
            onClick={() => handleBuy(item.id)}
            disabled={!canAfford}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm ${canAfford ? 'bg-amber-500 hover:bg-amber-600 text-white hover:shadow-md' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
          >
            <ShoppingCart size={16} /> Comprar
          </button>
        </div>
      </td>
    </tr>
  );
}