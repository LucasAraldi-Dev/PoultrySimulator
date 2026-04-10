import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { FEEDS, CHICK_COST, EGG_PRICE, LAYER_COST } from '../store/constants';
import { ShoppingCart, DollarSign, Package, Egg, Bird, Lock } from 'lucide-react';
import { BarnType } from '../store/types';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketPage() {
  const money = useGameStore(state => state.money);
  const buyFeed = useGameStore(state => state.buyFeed);
  const buyChicks = useGameStore(state => state.buyChicks);
  const sellEggs = useGameStore(state => state.sellEggs);
  
  const barns = useGameStore(state => state.barns);
  const products = useGameStore(state => state.products);
  const marketPrices = useGameStore(state => state.marketPrices);
  const company = useGameStore(state => state.company);
  const level = useGameStore(state => state.level);

  const [feedAmounts, setFeedAmounts] = useState<Record<string, number>>({
    feed_broiler_pre: 100, feed_basic: 100, feed_terminacao: 100, feed_premium: 100,
    feed_layers_start: 100, feed_layers: 100, feed_layers_premium: 100, feed_medicada: 100
  });

  const emptyBarns = barns.filter(b => !b.batch);

  const handleBuyFeed = (feedId: string) => {
    const kg = feedAmounts[feedId] || 0;
    if (kg <= 0) return;
    const cost = kg * (FEEDS[feedId].costPerKg * marketPrices.feedModifier);
    buyFeed(feedId, kg, cost);
  };

  const handleBuyFlock = (barnId: string, type: BarnType, capacity: number) => {
    // Para simplificar, compra lotando a capacidade
    const cost = type === 'POSTURA' ? capacity * LAYER_COST : capacity * CHICK_COST;
    buyChicks(barnId, capacity, cost);
  };

  return (
    <PageTransition className="space-y-8">
      {/* Vendas (Vender Ovos) */}
      <section>
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
          <DollarSign size={24} className="text-emerald-600" />
          Vendas
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-orange-100 text-orange-600 rounded-xl">
              <Egg size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-800">Ovos em Estoque</h3>
              <p className="text-zinc-500">Você possui {products.eggs.toLocaleString()} ovos.</p>
              <p className="text-sm text-emerald-600 font-medium">Preço de mercado: R$ {marketPrices.egg.toFixed(2)} / un</p>
            </div>
          </div>
          <button 
            onClick={() => sellEggs(products.eggs, marketPrices.egg)}
            disabled={products.eggs === 0}
            className="px-6 py-3 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ backgroundColor: company?.color || '#10b981' }}
          >
            Vender Tudo (R$ {(products.eggs * marketPrices.egg).toFixed(2)})
          </button>
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
                  const totalCost = barn.type === 'POSTURA' ? barn.capacity * LAYER_COST : barn.capacity * CHICK_COST;
                  const canAfford = money >= totalCost;
                  const isInSanitaryVoid = barn.sanitaryVoidDays > 0;
                  const isDisabled = !canAfford || isInSanitaryVoid;

                  return (
                    <motion.div 
                      key={barn.id} 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-6 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-zinc-800">{barn.name} {isInSanitaryVoid ? '(Em Vazio Sanitário)' : '(Vazio)'}</h3>
                        <p className="text-zinc-500">
                          Capacidade: {barn.capacity} aves | Tipo: {barn.type}
                        </p>
                        <p className="text-sm text-zinc-500 mt-1">
                          Custo do lote: <span className="font-medium text-zinc-700">R$ {totalCost.toFixed(2)}</span>
                        </p>
                      </div>
                      <motion.button
                        whileTap={!isDisabled ? { scale: 0.95 } : {}}
                        onClick={() => handleBuyFlock(barn.id, barn.type, barn.capacity)}
                        disabled={isDisabled}
                        className={`px-6 py-2 rounded-lg font-bold transition-opacity hover:opacity-90 ${!isDisabled ? 'text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        style={!isDisabled ? { backgroundColor: company?.color || '#2563eb' } : {}}
                      >
                        {isInSanitaryVoid 
                          ? `Vazio Sanitário (${barn.sanitaryVoidDays}d)` 
                          : canAfford ? 'Comprar e Alojar Lote' : 'Saldo Insuficiente'}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500">
              Todos os seus galpões já estão ocupados.
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
        
        {/* Ração para Corte */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-zinc-700 mb-4 border-b border-zinc-200 pb-2">Linha Frango de Corte</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(FEEDS).filter(f => f.id.includes('broiler') || f.id.includes('basic') || f.id.includes('terminacao') || f.id === 'feed_premium').map(feed => (
              <FeedCard key={feed.id} feed={feed} marketPrices={marketPrices} level={level} feedAmounts={feedAmounts} setFeedAmounts={setFeedAmounts} handleBuyFeed={handleBuyFeed} money={money} />
            ))}
          </div>
        </div>

        {/* Ração para Postura */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-zinc-700 mb-4 border-b border-zinc-200 pb-2">Linha Postura (Ovos)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(FEEDS).filter(f => f.id.includes('layers')).map(feed => (
              <FeedCard key={feed.id} feed={feed} marketPrices={marketPrices} level={level} feedAmounts={feedAmounts} setFeedAmounts={setFeedAmounts} handleBuyFeed={handleBuyFeed} money={money} />
            ))}
          </div>
        </div>

        {/* Rações Especiais */}
        <div>
          <h3 className="text-lg font-bold text-zinc-700 mb-4 border-b border-zinc-200 pb-2">Rações Especiais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(FEEDS).filter(f => f.id.includes('medicada')).map(feed => (
              <FeedCard key={feed.id} feed={feed} marketPrices={marketPrices} level={level} feedAmounts={feedAmounts} setFeedAmounts={setFeedAmounts} handleBuyFeed={handleBuyFeed} money={money} />
            ))}
          </div>
        </div>
      </section>

    </PageTransition>
  );
}

// Componente auxiliar para não repetir o código do card
function FeedCard({ feed, marketPrices, level, feedAmounts, setFeedAmounts, handleBuyFeed, money }: any) {
  const currentCost = feed.costPerKg * marketPrices.feedModifier;
  const isLocked = level < feed.requiredLevel;

  return (
    <div className={`relative bg-white p-6 rounded-xl shadow-sm border border-zinc-200 flex flex-col justify-between ${isLocked ? 'opacity-70' : ''}`}>
      {isLocked && (
        <div className="absolute inset-0 bg-zinc-100/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
          <div className="bg-zinc-800 text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <Lock size={16} /> Nível {feed.requiredLevel}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-zinc-800 mb-2">{feed.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          <p className="text-2xl font-bold text-emerald-600">R$ {currentCost.toFixed(2)}<span className="text-sm text-zinc-500 font-normal">/kg</span></p>
          {marketPrices.feedModifier > 1.1 && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">ALTA</span>}
          {marketPrices.feedModifier < 0.9 && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">BAIXA</span>}
        </div>
        
        <ul className="space-y-2 mb-6 text-sm text-zinc-600">
          <li className="flex justify-between">
            <span>Mortalidade:</span> 
            <span className={feed.bonus.mortalityModifier < 1 ? 'text-emerald-600 font-medium' : ''}>
              {((1 - feed.bonus.mortalityModifier) * 100).toFixed(0)}%
            </span>
          </li>
          <li className="flex justify-between">
            <span>Crescimento:</span> 
            <span className={feed.bonus.growthModifier > 1 ? 'text-emerald-600 font-medium' : ''}>
              +{((feed.bonus.growthModifier - 1) * 100).toFixed(0)}%
            </span>
          </li>
          <li className="flex justify-between">
            <span>Postura:</span> 
            <span className={feed.bonus.eggModifier > 1 ? 'text-emerald-600 font-medium' : ''}>
              +{((feed.bonus.eggModifier - 1) * 100).toFixed(0)}%
            </span>
          </li>
        </ul>
      </div>

      <div className="flex gap-2 mt-4">
        <input 
          type="number"
          min="1"
          value={feedAmounts[feed.id] || 100}
          onChange={(e) => setFeedAmounts({...feedAmounts, [feed.id]: Number(e.target.value)})}
          className="w-24 p-2 rounded-lg border border-zinc-300 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={() => handleBuyFeed(feed.id)}
          disabled={money < ((feedAmounts[feed.id] || 100) * currentCost) || isLocked}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={18} />
          Comprar
        </button>
      </div>
    </div>
  );
}
