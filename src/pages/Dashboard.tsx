import { useGameStore } from '../store/useGameStore';
import { FEEDS, EGG_PRICE, MEAT_PRICE_PER_KG, MEAT_PROCESSED_PRICE_PER_KG } from '../store/constants';
import { DollarSign, TrendingUp, TrendingDown, Home, AlertTriangle, Package, Egg, Bird, ShoppingCart, ArrowRight } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const money = useGameStore(state => state.money);
  const totalProfit = useGameStore(state => state.totalProfit);
  const totalExpenses = useGameStore(state => state.totalExpenses);
  const barns = useGameStore(state => state.barns);
  const inventory = useGameStore(state => state.inventory);
  const products = useGameStore(state => state.products);
  const activeEvent = useGameStore(state => state.activeEvent);
  const marketPrices = useGameStore(state => state.marketPrices);
  const sellEggs = useGameStore(state => state.sellEggs);
  const buyFeed = useGameStore(state => state.buyFeed);
  const activeMissions = useGameStore(state => state.activeMissions);
  const deliverMission = useGameStore(state => state.deliverMission);

  const balance = totalProfit - totalExpenses;
  const isProfitable = balance >= 0;

  // Calcula total de aves e alertas
  let totalAnimals = 0;
  let totalCapacity = 0;
  const alerts: string[] = [];

  barns.forEach(barn => {
    totalCapacity += barn.capacity;
    if (barn.batch) {
      totalAnimals += barn.batch.animalCount;
      
      // Alerta de mortalidade alta
      const mortalityRate = barn.batch.mortalityCount / (barn.batch.animalCount + barn.batch.mortalityCount);
      if (mortalityRate > 0.05) {
        alerts.push(`Mortalidade alta no ${barn.name} (${(mortalityRate * 100).toFixed(1)}%)`);
      }
    } else {
      if (barn.sanitaryVoidDays > 0) {
        alerts.push(`O ${barn.name} está em vazio sanitário (${barn.sanitaryVoidDays} dias restantes).`);
      } else {
        alerts.push(`O ${barn.name} está vazio. Compre um lote!`);
      }
    }
  });

  // Alerta de estoque de ração baixo
  const totalFeed = inventory.reduce((acc, item) => acc + item.quantity, 0);
  if (totalFeed < 200) {
    alerts.push('Estoque de ração crítico. Vá ao Mercado!');
  }

  if (activeEvent) {
    alerts.push(`EVENTO (${activeEvent.name}): ${activeEvent.description}`);
  }

  const handleQuickBuyFeed = () => {
    const cost = 100 * (FEEDS['feed_basic'].costPerKg * marketPrices.feedModifier);
    buyFeed('feed_basic', 100, cost);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Alerta de Evento Global */}
      {activeEvent && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-4"
        >
          <AlertTriangle size={32} className="shrink-0 animate-pulse" />
          <div>
            <h3 className="font-bold text-lg uppercase tracking-wide">Evento Crítico: {activeEvent.name}</h3>
            <p className="text-red-100">{activeEvent.description}</p>
          </div>
        </motion.div>
      )}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Saldo */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className={`flex items-center text-sm font-medium ${isProfitable ? 'text-emerald-600' : 'text-red-600'}`}>
              {isProfitable ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              Balanço Geral
            </span>
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Caixa Atual</h3>
          <p className="text-2xl font-bold text-zinc-800">R$ {money.toFixed(2)}</p>
        </motion.div>

        {/* Card Animais */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
              <Bird size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Aves Alojadas</h3>
          <p className="text-2xl font-bold text-zinc-800">{totalAnimals.toLocaleString()} <span className="text-sm font-normal text-zinc-500">/ {totalCapacity.toLocaleString()}</span></p>
        </motion.div>

        {/* Card Galpões */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Home size={24} />
            </div>
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Galpões Ativos</h3>
          <p className="text-2xl font-bold text-zinc-800">{barns.length}</p>
        </motion.div>

        {/* Card Produtos */}
        <motion.div variants={itemVariants} className="bg-white p-5 rounded-xl shadow-sm border border-zinc-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Egg size={24} />
            </div>
            <button 
              onClick={() => sellEggs(products.eggs, marketPrices.egg)}
              disabled={products.eggs === 0}
              className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1 rounded-full font-bold transition-colors disabled:opacity-50"
            >
              Vender Tudo
            </button>
          </div>
          <h3 className="text-zinc-500 text-sm font-medium">Ovos em Estoque</h3>
          <p className="text-2xl font-bold text-zinc-800">{products.eggs.toLocaleString()}</p>
        </motion.div>
      </motion.div>

      {/* Grid Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Principal: Galpões e Ração */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Preços de Mercado (Ticker) */}
          <div className="bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 p-4 text-white overflow-hidden relative">
            <h3 className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
              <TrendingUp size={14} /> 
              Cotações do Mercado Hoje
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-zinc-400 text-sm">Ovo (un)</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">R$ {marketPrices.egg.toFixed(2)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${marketPrices.egg > EGG_PRICE ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {marketPrices.egg > EGG_PRICE ? '+' : ''}{((marketPrices.egg / EGG_PRICE - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Frango Vivo (kg)</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">R$ {marketPrices.meat.toFixed(2)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${marketPrices.meat > MEAT_PRICE_PER_KG ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {marketPrices.meat > MEAT_PRICE_PER_KG ? '+' : ''}{((marketPrices.meat / MEAT_PRICE_PER_KG - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Frango Abatido (kg)</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-blue-400">R$ {marketPrices.processedMeat.toFixed(2)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${marketPrices.processedMeat > MEAT_PROCESSED_PRICE_PER_KG ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {marketPrices.processedMeat > MEAT_PROCESSED_PRICE_PER_KG ? '+' : ''}{((marketPrices.processedMeat / MEAT_PROCESSED_PRICE_PER_KG - 1) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Índice Ração</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold">x {marketPrices.feedModifier.toFixed(2)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${marketPrices.feedModifier < 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {marketPrices.feedModifier < 1 ? 'BAIXA' : 'ALTA'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo dos Galpões */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                <Home size={20} className="text-zinc-500" />
                Status dos Galpões
              </h2>
              <Link to="/galpoes" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Ver todos <ArrowRight size={16} />
              </Link>
            </div>
            
            {barns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {barns.slice(0, 4).map(barn => (
                  <div key={barn.id} className="p-4 rounded-lg border border-zinc-100 bg-zinc-50 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-zinc-800 flex items-center gap-2">
                        {barn.type === 'POSTURA' ? <Egg size={14} className="text-amber-500"/> : <Bird size={14} className="text-orange-500"/>}
                        {barn.name}
                      </h4>
                      {barn.batch ? (
                        <p className="text-sm text-zinc-500 mt-1">
                          {barn.batch.animalCount.toLocaleString()} aves • {barn.batch.ageDays} dias
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-400 mt-1 italic">Galpão Vazio</p>
                      )}
                    </div>
                    {barn.batch?.activeDisease && (
                      <AlertTriangle size={18} className="text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Nenhum galpão construído.</p>
            )}
          </div>

          {/* Estoque de Ração */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                <Package size={20} className="text-zinc-500" />
                Estoque de Ração
              </h2>
              <button 
                onClick={handleQuickBuyFeed}
                disabled={money < 100 * (FEEDS['feed_basic'].costPerKg * marketPrices.feedModifier)}
                className="text-sm font-bold text-white bg-zinc-800 hover:bg-black px-3 py-1.5 rounded flex items-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={14} />
                +100kg Básica
              </button>
            </div>
            {inventory.length > 0 ? (
              <div className="space-y-3">
                {inventory.map(item => {
                  const feedData = FEEDS[item.itemId];
                  return (
                    <div key={item.itemId} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <h4 className="font-semibold text-zinc-800 text-sm">{feedData?.name || item.itemId}</h4>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-zinc-800">{item.quantity.toFixed(1)}</span>
                        <span className="text-zinc-500 text-sm ml-1">kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                <p className="text-red-600 font-bold flex items-center justify-center gap-2">
                  <AlertTriangle size={18} /> Sem ração no estoque!
                </p>
                <p className="text-red-500 text-sm mt-1">Suas aves vão morrer de fome.</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral: Alertas e Dicas */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              Alertas da Granja
            </h2>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border text-sm flex gap-3 items-start ${alert.includes('EVENTO') ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span className="font-medium">{alert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-emerald-600 font-bold">Tudo sob controle!</p>
                <p className="text-emerald-500 text-sm mt-1">Nenhum alerta crítico no momento.</p>
              </div>
            )}
          </div>

          {/* Missões / Contratos Ativos */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-200">
            <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-500" />
              Contratos & Missões
            </h2>
            
            {activeMissions.filter(m => !m.completed).length > 0 ? (
              <div className="space-y-4">
                {activeMissions.filter(m => !m.completed).map(mission => {
                  const progress = (products.eggs / mission.targetAmount) * 100;
                  const canComplete = products.eggs >= mission.targetAmount;
                  
                  return (
                    <div key={mission.id} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-zinc-800">{mission.title}</h4>
                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          Faltam {mission.deadlineDays - mission.daysPassed}d
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 mb-3">{mission.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-xs font-medium text-zinc-500 mb-1">
                          <span>{products.eggs.toLocaleString()} ovos</span>
                          <span>Meta: {mission.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${canComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${Math.min(100, progress)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-100/50">
                        <div className="text-xs font-bold text-emerald-600">
                          Prêmio: R$ {mission.rewardMoney.toLocaleString()}
                        </div>
                        <button
                          onClick={() => deliverMission(mission.id)}
                          disabled={!canComplete}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${canComplete ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        >
                          Entregar Carga
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
                <p className="text-zinc-500 text-sm">Nenhum contrato ativo. O mercado fará novas ofertas em breve.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
