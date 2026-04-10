import { useGameStore } from '../store/useGameStore';
import { MAX_LAYER_AGE_DAYS, DISCARD_BIRD_PRICE, FEEDS } from '../store/constants';
import { Bird, Egg, Package, DollarSign, AlertCircle, Info, Activity, Trash2, Syringe, Sparkles, Droplet } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Modal } from '../components/Modal';

export default function BarnsPage() {
  const barns = useGameStore(state => state.barns);
  const sellBatch = useGameStore(state => state.sellBatch);
  const marketPrices = useGameStore(state => state.marketPrices);
  const hasSlaughterhouse = useGameStore(state => state.hasSlaughterhouse);
  const cleanBarn = useGameStore(state => state.cleanBarn);
  const vaccinateBatch = useGameStore(state => state.vaccinateBatch);
  const medicateBatch = useGameStore(state => state.medicateBatch);
  const selectFeed = useGameStore(state => state.selectFeed);
  const money = useGameStore(state => state.money);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBarnId, setSelectedBarnId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'SELL' | 'DISCARD'>('SELL');

  const handleOpenModal = (barnId: string, type: 'SELL' | 'DISCARD') => {
    setSelectedBarnId(barnId);
    setModalType(type);
    setModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedBarnId) {
      sellBatch(selectedBarnId);
    }
    setModalOpen(false);
  };

  return (
    <PageTransition className="space-y-6">
      {/* Alerta de Alimentação Manual no Silo */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-amber-800">
        <Info className="shrink-0" />
        <div>
          <p className="font-bold">Manejo de Ração (Silo)</p>
          <p className="text-sm mt-1">
            As aves se alimentam do <strong>Silo do Galpão</strong>. Se o silo esvaziar, as aves começam a morrer de fome! 
            Lembre-se de transferir a ração correta do Estoque Geral para o Silo de cada galpão.
          </p>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {barns.map(barn => {
          let gpd = 0;
          let ca = 0;
          
          if (barn.batch) {
            // GPD = Ganho de Peso Diário médio (kg)
            gpd = barn.batch.currentWeight / Math.max(1, barn.batch.ageDays);
            
            // CA = Conversão Alimentar (Ração Consumida / Peso Vivo Total)
            const totalWeight = barn.batch.currentWeight * barn.batch.animalCount;
            ca = totalWeight > 0 ? barn.batch.totalFeedConsumed / totalWeight : 0;
          }

          return (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3 }}
              key={barn.id} 
              className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden"
            >
            {/* Barn Header */}
            <div className="bg-zinc-50 border-b border-zinc-200 p-5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${barn.type === 'POSTURA' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
                  {barn.type === 'POSTURA' ? <Egg size={24} /> : <Bird size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-800">{barn.name}</h2>
                  <p className="text-sm font-medium text-zinc-500">
                    Tipo: <span className="text-zinc-700">{barn.type}</span> | Capacidade: {barn.capacity.toLocaleString()} aves
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-zinc-500">Custo Operacional Diário</p>
                <p className="text-lg font-bold text-red-500">R$ {barn.dailyCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Barn Content */}
            <div className="p-6">
              {barn.batch ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Stats Principais */}
                  <div className="col-span-1 lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Aves Vivas</p>
                      <p className="text-2xl font-bold text-zinc-800">{barn.batch.animalCount.toLocaleString()}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Idade</p>
                    <p className="text-2xl font-bold text-zinc-800">{barn.batch.ageDays} <span className="text-sm font-normal text-zinc-500">dias</span></p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Peso Médio</p>
                    <p className="text-2xl font-bold text-zinc-800">{barn.batch.currentWeight.toFixed(2)} <span className="text-sm font-normal text-zinc-500">kg</span></p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 relative overflow-hidden">
                    {barn.batch.activeDisease && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                        DOENTE
                      </div>
                    )}
                    <p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-1">Mortalidade</p>
                    <p className="text-2xl font-bold text-red-600">{barn.batch.mortalityCount.toLocaleString()}</p>
                  </div>
                  
                  {/* KPIs de Produção */}
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Package size={14} /> Consumo Total
                      </p>
                      <p className="text-xl font-bold text-zinc-800">{barn.batch.totalFeedConsumed.toFixed(1)} <span className="text-sm font-normal text-zinc-500">kg</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Activity size={14} /> GPD
                      </p>
                      <p className="text-xl font-bold text-zinc-800">{(gpd * 1000).toFixed(0)} <span className="text-sm font-normal text-zinc-500">g/dia</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Activity size={14} /> CA
                      </p>
                      <p className="text-xl font-bold text-zinc-800">{ca.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Sparkles size={14} /> Higiene
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-xl font-bold ${barn.batch.hygieneLevel > 70 ? 'text-emerald-600' : barn.batch.hygieneLevel > 40 ? 'text-amber-500' : 'text-red-500'}`}>
                          {barn.batch.hygieneLevel}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Controles de Lote */}
                  <div className="col-span-2 lg:col-span-4 bg-white p-4 rounded-lg border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 lg:col-span-2 flex flex-col justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Ração no Silo ({barn.siloBalance.toFixed(0)} kg / {barn.siloCapacity} kg)</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select 
                          value={barn.selectedFeedId || 'feed_basic'}
                          onChange={(e) => selectFeed(barn.id, e.target.value)}
                          className="flex-1 p-2 rounded border border-zinc-300 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          {Object.values(FEEDS).map(feed => (
                            <option key={feed.id} value={feed.id}>{feed.name}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            if (barn.isRented) {
                              // Integração pega ração de graça (já descontado no lucro final)
                              const amount = Number(prompt(`Integração: Quantos kg de ${FEEDS[barn.selectedFeedId || 'feed_basic']?.name} solicitar da integradora? (Máx: ${barn.siloCapacity - barn.siloBalance} kg)`));
                              if (!isNaN(amount) && amount > 0) {
                                useGameStore.getState().fillSilo(barn.id, amount);
                              }
                            } else {
                              const amount = Number(prompt(`Quantos kg de ${FEEDS[barn.selectedFeedId || 'feed_basic']?.name} transferir do estoque geral para o silo? (Máx: ${barn.siloCapacity - barn.siloBalance} kg)`));
                              if (!isNaN(amount) && amount > 0) {
                                useGameStore.getState().fillSilo(barn.id, amount);
                              }
                            }
                          }}
                          className={`w-full sm:w-auto px-3 py-2 rounded font-bold text-sm border ${barn.isRented ? 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300'}`}
                        >
                          Abastecer
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      <button 
                        onClick={() => cleanBarn(barn.id, 50)}
                        disabled={money < 50 || barn.batch!.hygieneLevel > 90}
                        className="w-full p-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Droplet size={16} /> Limpar (R$ 50)
                      </button>
                    </div>

                    <div className="flex flex-col justify-end">
                      <button 
                        onClick={() => vaccinateBatch(barn.id, 200)}
                        disabled={money < 200 || barn.batch!.vaccineProtectionDays > 0}
                        className="w-full p-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Syringe size={16} /> 
                        {barn.batch!.vaccineProtectionDays > 0 ? `Vacinado (${barn.batch!.vaccineProtectionDays}d)` : 'Vacinar (R$ 200)'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Status de Doença */}
                  {barn.batch.activeDisease && (
                    <div className="col-span-2 lg:col-span-4 bg-red-100 border border-red-200 p-3 rounded-lg text-sm text-red-800">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold flex items-center gap-2">
                          <AlertCircle size={16} /> 
                          Surto de {barn.batch.activeDisease.name}!
                        </p>
                        <button 
                          onClick={() => medicateBatch(barn.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 flex items-center gap-1"
                        >
                          <Syringe size={14} /> Usar Medicamento
                        </button>
                      </div>
                      <p>
                        O lote está doente. {barn.batch.activeDisease.mortalityModifier > 1 ? 'Mortalidade alta! ' : ''} 
                        Trate imediatamente ou use Ração Medicada para mitigar os danos até a cura natural em {barn.batch.activeDisease.durationDays - barn.batch.activeDisease.daysActive} dias.
                      </p>
                    </div>
                  )}
                </div>

                  {/* Actions: Sell (Corte) or Status (Postura) */}
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                        <DollarSign size={18} />
                        Destino do Lote
                      </h3>
                      {barn.type === 'CORTE' ? (
                        <p className="text-sm text-emerald-700 mb-4">
                          O lote atual pesa no total <strong>{((barn.batch.animalCount * barn.batch.currentWeight) / 1000).toFixed(2)} toneladas</strong>.
                          {barn.isRented ? (
                            <>
                              <br/><br/>
                              Este lote pertence à <strong>Integradora</strong>. Ao finalizar, você receberá por cabeça de acordo com a sua performance (Mortalidade e Conversão Alimentar).
                            </>
                          ) : hasSlaughterhouse ? (
                            <>Venda processada (Abatedouro Próprio) por <strong>R$ {marketPrices.processedMeat.toFixed(2)}/kg</strong>.</>
                          ) : (
                            <>Venda vivo para intermediários por <strong>R$ {marketPrices.meat.toFixed(2)}/kg</strong>.</>
                          )}
                        </p>
                      ) : (
                        <div className="mb-4">
                          <p className="text-sm text-emerald-700 mb-2">
                            Galinhas de postura começam a produzir ovos após 120 dias de idade. 
                            Você pode vender os ovos acumulados na página de Mercado.
                          </p>
                          <div className="bg-zinc-100 p-2 rounded-lg">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-zinc-500">Idade Produtiva:</span>
                              <span className={barn.batch.ageDays > MAX_LAYER_AGE_DAYS ? 'text-red-500' : 'text-zinc-700'}>
                                {barn.batch.ageDays} / {MAX_LAYER_AGE_DAYS} dias
                              </span>
                            </div>
                            <div className="w-full bg-zinc-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${barn.batch.ageDays > MAX_LAYER_AGE_DAYS ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(100, (barn.batch.ageDays / MAX_LAYER_AGE_DAYS) * 100)}%` }}
                              ></div>
                            </div>
                            {barn.batch.ageDays > MAX_LAYER_AGE_DAYS && (
                              <p className="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                                <AlertCircle size={12} /> Fim do ciclo produtivo! Descarte o lote.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {barn.type === 'CORTE' && (
                      <button 
                        onClick={() => handleOpenModal(barn.id, 'SELL')}
                        className={`w-full py-3 text-white rounded-md font-bold transition-all shadow-sm ${barn.isRented ? 'bg-blue-600 hover:bg-blue-700' : hasSlaughterhouse ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {barn.isRented ? 'Entregar Lote (Fim do Contrato)' : hasSlaughterhouse ? 'Abater Lote (Enviar Abatedouro)' : 'Vender Lote para Abate'}
                      </button>
                    )}
                    {barn.type === 'POSTURA' && barn.batch.ageDays > MAX_LAYER_AGE_DAYS && (
                      <button 
                        onClick={() => handleOpenModal(barn.id, 'DISCARD')}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} /> Descartar Lote Velho (R$ {DISCARD_BIRD_PRICE.toFixed(2)}/ave)
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
                  <AlertCircle size={40} className={`mx-auto mb-3 ${barn.sanitaryVoidDays > 0 ? 'text-amber-500' : 'text-zinc-400'}`} />
                  <h3 className={`text-lg font-bold ${barn.sanitaryVoidDays > 0 ? 'text-amber-700' : 'text-zinc-700'}`}>
                    {barn.sanitaryVoidDays > 0 ? 'Em Vazio Sanitário' : 'Galpão Vazio'}
                  </h3>
                  {barn.sanitaryVoidDays > 0 ? (
                    <>
                      <p className="text-amber-600 mb-4 font-medium">O galpão está passando por desinfecção obrigatória.</p>
                      <p className="text-sm font-bold bg-amber-100 text-amber-800 py-1 px-3 rounded-full inline-block">
                        Faltam {barn.sanitaryVoidDays} dias para liberar
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-zinc-500 mb-4">Este galpão não possui aves no momento.</p>
                      <p className="text-sm text-zinc-400">Vá até o Mercado para comprar um novo lote de aves.</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'SELL' ? 'Confirmar Venda' : 'Descartar Lote'}
        icon={modalType === 'SELL' ? <DollarSign /> : <Trash2 />}
      >
        <div className="space-y-4">
          <p className="text-zinc-600">
            {modalType === 'SELL' 
              ? 'Tem certeza que deseja finalizar este lote e enviá-mo para venda ou processamento?' 
              : 'Este lote já atingiu a idade máxima produtiva. Deseja vender as aves para o mercado de descarte?'}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 font-bold text-zinc-500 hover:bg-zinc-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmAction}
              className={`px-4 py-2 font-bold text-white rounded-lg shadow-md ${modalType === 'SELL' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {modalType === 'SELL' ? 'Confirmar' : 'Confirmar Descarte'}
            </button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
