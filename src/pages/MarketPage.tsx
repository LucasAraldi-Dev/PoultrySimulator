import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { FEEDS, CHICK_COST, EGG_PRICE, LAYER_COST, RAW_MATERIALS } from '../store/constants';
import { ShoppingCart, DollarSign, Package, Egg, Bird, Truck, Box } from 'lucide-react';
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
    // Se for integração (isRented = true), não tem custo de alojamento do pintinho (integradora fornece)
    const cost = isRented ? 0 : (type === 'POSTURA' ? capacity * LAYER_COST : capacity * CHICK_COST);
    buyBatchApi(barnId, capacity, cost);
  };

  const dynamicContracts = useGameStore(state => state.dynamicContracts);
  const acceptContract = useGameStore(state => state.acceptContract);
  const fulfillContract = useGameStore(state => state.fulfillContract);

  return (
    <PageTransition className="space-y-8">
      {/* Contratos Dinâmicos */}
      {dynamicContracts && dynamicContracts.filter(c => c.status === 'AVAILABLE' || c.status === 'ACCEPTED').length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
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
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                    {contract.deadlineDays} dia(s) restante(s)
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-zinc-50 p-3 rounded-lg mb-4">
                  <div>
                    <p className="text-xs font-bold text-zinc-500">Pagamento</p>
                    <p className="font-bold text-emerald-600">R$ {contract.rewardMoney.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-500">Multa</p>
                    <p className="font-bold text-red-600">R$ {contract.penaltyMoney.toLocaleString()}</p>
                  </div>
                </div>

                {contract.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => acceptContract(contract.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Assinar Contrato
                  </button>
                ) : (
                  <button
                    onClick={() => fulfillContract(contract.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors"
                  >
                    Entregar Produto
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vendas (Vender Ovos) */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <DollarSign size={24} className="text-emerald-600" />
          Vendas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col justify-between group">
            <div className="h-32 bg-zinc-800 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <div className="p-2 bg-orange-500 text-white rounded-lg shadow-lg">
                  <Egg size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Ovos em Estoque</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-zinc-600 font-medium">Você possui <strong className="text-zinc-800">{products.eggs.toLocaleString()}</strong> ovos.</p>
                <p className="text-sm text-emerald-600 font-bold mt-1">Preço de mercado: R$ {marketPrices.egg.toFixed(2)} / un</p>
              </div>
              <button
                onClick={() => sellProductsApi('eggs', products.eggs, marketPrices.egg)}
                disabled={products.eggs === 0}
                className="w-full px-6 py-3 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                style={{ backgroundColor: company?.color || '#10b981' }}
              >
                Vender Tudo (R$ {(products.eggs * marketPrices.egg).toFixed(2)})
              </button>
            </div>
          </div>

          {/* Venda de Carne Processada */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col justify-between group">
            <div className="h-32 bg-zinc-800 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-3">
                <div className="p-2 bg-red-500 text-white rounded-lg shadow-lg">
                  <Package size={24} />
                </div>
                <h3 className="text-lg font-bold text-white">Carne Processada</h3>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <p className="text-zinc-600 font-medium">
                  <strong className="text-zinc-800">{useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity.toFixed(1) || '0.0'} kg</strong> em estoque.
                </p>
                <p className="text-sm text-emerald-600 font-bold mt-1">Preço de mercado: R$ {marketPrices.processedMeat.toFixed(2)} / kg</p>
              </div>
              <button
                onClick={() => {
                  const qty = useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity || 0;
                  if (qty > 0) {
                    sellProductsApi('meat', qty, marketPrices.processedMeat);
                  }
                }}
                disabled={(useGameStore.getState().inventory.find(i => i.itemId === 'processed_meat')?.quantity || 0) <= 0}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-red-700 hover:shadow-lg"
              >
                Vender Estoque de Carne
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comprar Aves (Povoar Galpões Vazios) */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Bird size={24} className="text-blue-600" />
          Aves e Alojamento
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
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
                      className="flex flex-col md:flex-row relative"
                    >
                      <div className="md:w-48 h-32 md:h-auto bg-zinc-800 shrink-0 relative">
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white hidden md:block" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                          {barn.name} 
                          {barn.isRented && <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full uppercase">Integração</span>}
                        </h3>
                        <p className="text-zinc-500 text-sm mt-1">
                          Capacidade: {barn.capacity} aves | Tipo: {barn.type}
                        </p>
                        <p className="text-sm text-zinc-600 mt-1 font-medium">
                          {barn.isRented 
                            ? 'A Integradora fornece os pintinhos e a ração de graça. Você entra com a estrutura, cama e manejo.' 
                            : `Custo do lote: R$ ${totalCost.toFixed(2)}`}
                        </p>
                      </div>
                      <div className="p-6 flex items-center border-t md:border-t-0 md:border-l border-zinc-100 bg-zinc-50/50">
                        <motion.button
                          whileTap={!isDisabled ? { scale: 0.95 } : {}}
                          onClick={() => handleBuyFlock(barn.id, barn.type, barn.capacity, barn.isRented)}
                          disabled={isDisabled}
                          className={`w-full md:w-auto px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap shadow-sm ${!isDisabled ? 'text-white hover:shadow-lg' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
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
            <div className="p-12 text-center flex flex-col items-center justify-center bg-zinc-50">
              <Bird size={48} className="text-zinc-300 mb-4" />
              <h3 className="text-lg font-bold text-zinc-700">Todos os seus galpões estão ocupados.</h3>
              <p className="text-zinc-500 mt-2">Construa ou alugue novos galpões na aba Infraestrutura.</p>
            </div>
          )}
        </div>
      </section>

      {/* Fornecedores de Ração */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <Package size={24} className="text-amber-600" />
          Fornecedores de Ração
        </h2>

        {pendingDeliveries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-zinc-800 mb-2 flex items-center gap-2">
              <Truck size={20} className="text-zinc-700" /> Pedidos em Transporte
            </h3>
            <div className="divide-y divide-zinc-100">
              {pendingDeliveries
                .slice()
                .sort((a, b) => a.arrivesAtDay - b.arrivesAtDay)
                .map(d => (
                  <div key={d.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-800 truncate">{FEEDS[d.itemId]?.name || RAW_MATERIALS[d.itemId]?.name || d.itemId}</p>
                      <p className="text-xs text-zinc-500">
                        {d.quantity.toFixed(0)} {RAW_MATERIALS[d.itemId]?.unit || 'kg'} • {d.mode === 'CAMINHAO' ? 'Retirada com caminhão' : 'Entrega do fornecedor'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-800">Chega no dia {d.arrivesAtDay}</p>
                      <p className="text-xs text-zinc-500">Faltam {Math.max(0, d.arrivesAtDay - currentDay)} dia(s)</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Ração para Corte */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">🐔 Linha Frango de Corte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(FEEDS).filter(f => f.id.includes('broiler') || f.id.includes('basic') || f.id.includes('terminacao') || f.id === 'feed_premium').map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
                marketPrices={marketPrices}
                level={level}
                feedAmounts={feedAmounts}
                setFeedAmounts={setFeedAmounts}
                handleBuyFeed={handleBuyFeed}
                money={money}
                region={region}
                ownedMachinery={ownedMachinery}
                deliveryPrefs={deliveryPrefs}
                setDeliveryPrefs={setDeliveryPrefs}
              />
            ))}
          </div>
        </div>

        {/* Ração para Postura */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-amber-800 mb-4 border-b border-amber-200 pb-2">🥚 Linha Postura (Ovos)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(FEEDS).filter(f => f.id.includes('layers')).map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
                marketPrices={marketPrices}
                level={level}
                feedAmounts={feedAmounts}
                setFeedAmounts={setFeedAmounts}
                handleBuyFeed={handleBuyFeed}
                money={money}
                region={region}
                ownedMachinery={ownedMachinery}
                deliveryPrefs={deliveryPrefs}
                setDeliveryPrefs={setDeliveryPrefs}
              />
            ))}
          </div>
        </div>

        {/* Rações Especiais */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">💊 Rações Especiais e Medicadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(FEEDS).filter(f => f.id.includes('medicada')).map(feed => (
              <FeedCard
                key={feed.id}
                feed={feed}
                marketPrices={marketPrices}
                level={level}
                feedAmounts={feedAmounts}
                setFeedAmounts={setFeedAmounts}
                handleBuyFeed={handleBuyFeed}
                money={money}
                region={region}
                ownedMachinery={ownedMachinery}
                deliveryPrefs={deliveryPrefs}
                setDeliveryPrefs={setDeliveryPrefs}
              />
            ))}
          </div>
        </div>

        {/* Matérias-Primas e Insumos */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-zinc-700 mb-4 border-b border-zinc-200 pb-2 flex items-center gap-2">
            <Box size={20} className="text-amber-700" />
            Insumos & Matérias-Primas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.values(RAW_MATERIALS).map(mat => (
              <RawMaterialCard
                key={mat.id}
                mat={mat}
                marketPrices={marketPrices}
                feedAmounts={feedAmounts}
                setFeedAmounts={setFeedAmounts}
                handleBuyRawMaterial={handleBuyRawMaterial}
                money={money}
                region={region}
                ownedMachinery={ownedMachinery}
                deliveryPrefs={deliveryPrefs}
                setDeliveryPrefs={setDeliveryPrefs}
              />
            ))}
          </div>
        </div>
      </section>

    </PageTransition>
  );
}

// Componente auxiliar para Insumos
function RawMaterialCard({ mat, marketPrices, feedAmounts, setFeedAmounts, handleBuyRawMaterial, money, region, ownedMachinery, deliveryPrefs, setDeliveryPrefs }: any) {
  const currentCost = mat.costPerUnit * marketPrices.feedModifier;
  
  const hasFeedTruck = ownedMachinery?.includes('prem_truck_feed') || ownedMachinery?.includes('gen_truck_feed');
  const pref = deliveryPrefs[mat.id] || { scheduledInDays: 0, useOwnTruck: false };
  const mode = pref.useOwnTruck && hasFeedTruck ? 'CAMINHAO' : 'ENTREGA';
  const baseTransitDays = Math.min(6, Math.max(1, Math.ceil(((region?.freightCostPerKg || 0.05) * 20))));
  const transitDays = mode === 'CAMINHAO' ? 1 : baseTransitDays;
  const dispatchIn = Math.max(0, Math.floor(pref.scheduledInDays));
  const etaLabel = dispatchIn === 0 ? `${transitDays} dia(s)` : `${dispatchIn + transitDays} dia(s)`;

  return (
    <div className={`relative bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-zinc-800">{mat.name}</h3>
          <p className="text-[10px] text-zinc-500 line-clamp-1">{mat.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">R$ {currentCost.toFixed(2)}<span className="text-[10px] text-zinc-500 font-normal">/{mat.unit}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5">
          <select
            value={pref.scheduledInDays}
            onChange={(e) => setDeliveryPrefs({ ...deliveryPrefs, [mat.id]: { ...pref, scheduledInDays: Number(e.target.value) } })}
            className="w-full bg-transparent text-xs font-bold text-zinc-700 focus:outline-none"
          >
            <option value={0}>Enviar hoje</option>
            <option value={1}>Em 1 dia</option>
            <option value={2}>Em 2 dias</option>
            <option value={3}>Em 3 dias</option>
          </select>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 flex items-center justify-between cursor-pointer" onClick={() => hasFeedTruck && setDeliveryPrefs({ ...deliveryPrefs, [mat.id]: { ...pref, useOwnTruck: !pref.useOwnTruck } })}>
          <span className="text-xs font-bold text-zinc-700">{mode === 'CAMINHAO' ? 'Buscar' : 'Entrega'}</span>
          <span className="text-[10px] text-zinc-500">{etaLabel}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input 
          type="number"
          min="1"
          value={feedAmounts[mat.id] || 100}
          onChange={(e) => setFeedAmounts({...feedAmounts, [mat.id]: Number(e.target.value)})}
          className="w-20 p-2 rounded border border-zinc-300 bg-zinc-50 text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          onClick={() => handleBuyRawMaterial(mat.id)}
          disabled={money < ((feedAmounts[mat.id] || 100) * currentCost)}
          className="flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-900 text-white rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} /> Comprar
        </button>
      </div>
    </div>
  );
}

// Componente auxiliar para não repetir o código do card
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

function FeedCard({ feed, marketPrices, feedAmounts, setFeedAmounts, handleBuyFeed, money, region, ownedMachinery, deliveryPrefs, setDeliveryPrefs }: any) {
  const currentCost = feed.costPerKg * marketPrices.feedModifier;
  const feedPriceHistory = useGameStore(state => state.feedPriceHistory);
  
  // Historico de preço local desse card
  const chartData = feedPriceHistory.map(h => ({
    price: feed.costPerKg * h.priceModifier
  }));

  const hasFeedTruck = ownedMachinery?.includes('prem_truck_feed') || ownedMachinery?.includes('gen_truck_feed');
  const pref = deliveryPrefs[feed.id] || { scheduledInDays: 0, useOwnTruck: false };
  const mode = pref.useOwnTruck && hasFeedTruck ? 'CAMINHAO' : 'ENTREGA';
  const baseTransitDays = Math.min(6, Math.max(1, Math.ceil(((region?.freightCostPerKg || 0.05) * 20))));
  const transitDays = mode === 'CAMINHAO' ? 1 : baseTransitDays;
  const dispatchIn = Math.max(0, Math.floor(pref.scheduledInDays));
  const etaLabel = dispatchIn === 0 ? `${transitDays} dia(s)` : `${dispatchIn + transitDays} dia(s)`;

  return (
    <div className={`relative bg-white p-4 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-zinc-800">{feed.name}</h3>
          <p className="text-xs text-zinc-500 line-clamp-1">
            {feed.bonus.growthModifier > 1 && `+${((feed.bonus.growthModifier - 1) * 100).toFixed(0)}% Crescimento `}
            {feed.bonus.eggModifier > 1 && `+${((feed.bonus.eggModifier - 1) * 100).toFixed(0)}% Postura `}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-emerald-600">R$ {currentCost.toFixed(2)}<span className="text-[10px] text-zinc-500 font-normal">/kg</span></p>
          <div className="flex gap-1 justify-end mt-1">
            {marketPrices.feedModifier > 1.1 && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">ALTA</span>}
            {marketPrices.feedModifier < 0.9 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">BAIXA</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5">
          <select
            value={pref.scheduledInDays}
            onChange={(e) => setDeliveryPrefs({ ...deliveryPrefs, [feed.id]: { ...pref, scheduledInDays: Number(e.target.value) } })}
            className="w-full bg-transparent text-xs font-bold text-zinc-700 focus:outline-none"
          >
            <option value={0}>Enviar hoje</option>
            <option value={1}>Em 1 dia</option>
            <option value={2}>Em 2 dias</option>
            <option value={3}>Em 3 dias</option>
          </select>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded px-2 py-1.5 flex items-center justify-between cursor-pointer" onClick={() => hasFeedTruck && setDeliveryPrefs({ ...deliveryPrefs, [feed.id]: { ...pref, useOwnTruck: !pref.useOwnTruck } })}>
          <span className="text-xs font-bold text-zinc-700">{mode === 'CAMINHAO' ? 'Buscar' : 'Entrega'}</span>
          <span className="text-[10px] text-zinc-500">{etaLabel}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input 
          type="number"
          min="1"
          value={feedAmounts[feed.id] || 100}
          onChange={(e) => setFeedAmounts({...feedAmounts, [feed.id]: Number(e.target.value)})}
          className="w-20 p-2 rounded border border-zinc-300 bg-zinc-50 text-zinc-800 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <button
          onClick={() => handleBuyFeed(feed.id)}
          disabled={money < ((feedAmounts[feed.id] || 100) * currentCost)}
          className="flex-1 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} /> Comprar
        </button>
      </div>
    </div>
  );
}
