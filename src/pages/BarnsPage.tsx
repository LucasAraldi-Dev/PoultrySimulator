import { useGameStore } from '../store/useGameStore';
import { MAX_LAYER_AGE_DAYS, DISCARD_BIRD_PRICE, FEEDS } from '../store/constants';
import { Bird, Egg, Package, DollarSign, AlertCircle, Info, Activity, Trash2, Syringe, Sparkles, Droplet, Wind, Wheat, TrendingUp } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Modal } from '../components/Modal';
import { FeedSiloModal } from '../components/FeedSiloModal';

import { FileText } from 'lucide-react';

export default function BarnsPage() {
  const barns = useGameStore(state => state.barns);
  const sellBatch = useGameStore(state => state.sellBatch);
  const marketPrices = useGameStore(state => state.marketPrices);
  const hasSlaughterhouse = useGameStore(state => state.hasSlaughterhouse);
  const ownedVehicles = useGameStore(state => state.ownedVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const cleanBarn = useGameStore(state => state.cleanBarn);
  const vaccinateBatch = useGameStore(state => state.vaccinateBatch);
  const medicateBatch = useGameStore(state => state.medicateBatch);
  const selectFeed = useGameStore(state => state.selectFeed);
  const money = useGameStore(state => state.money);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBarnId, setSelectedBarnId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'SELL' | 'DISCARD'>('SELL');
  
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [feedBarnData, setFeedBarnData] = useState<any | null>(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyBarnData, setHistoryBarnData] = useState<any | null>(null);

  const handleOpenHistoryModal = (barn: any) => {
    setHistoryBarnData(barn);
    setHistoryModalOpen(true);
  };

  const handleOpenModal = (barnId: string, type: 'SELL' | 'DISCARD') => {
    setSelectedBarnId(barnId);
    setModalType(type);
    setModalOpen(true);
  };
  
  const handleOpenFeedModal = (barn: any) => {
    setFeedBarnData(barn);
    setFeedModalOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedBarnId) {
      sellBatch(selectedBarnId);
    }
    setModalOpen(false);
  };

  return (
    <PageTransition className="space-y-6 pb-24 md:pb-6">
      {/* Alerta de Alimentação Manual no Silo */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-4 text-amber-800 shadow-sm items-start">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
          <Info size={24} />
        </div>
        <div>
          <p className="font-black text-lg">Manejo de Ração (Silo)</p>
          <p className="text-sm mt-1 text-amber-700/80 font-medium">
            As aves se alimentam do <strong>Silo do Galpão</strong>. Se o silo esvaziar, as aves começam a morrer de fome! 
            Transfira a ração correta do Estoque Geral para o Silo de cada galpão.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {barns.map(barn => {
            let gpd = 0;
            let ca = 0;
            
            if (barn.batch) {
              gpd = barn.batch.currentWeight / Math.max(1, barn.batch.ageDays);
              const totalWeight = barn.batch.currentWeight * barn.batch.animalCount;
              ca = totalWeight > 0 ? barn.batch.totalFeedConsumed / totalWeight : 0;
            }

            const siloPercentage = Math.min(100, (barn.siloBalance / barn.siloCapacity) * 100);

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3 }}
                key={barn.id} 
                className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col"
              >
                {/* Barn Header */}
                <div className="bg-zinc-900 text-white p-5 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-2xl ${barn.type === 'POSTURA' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                      {barn.type === 'POSTURA' ? <Egg size={24} /> : <Bird size={24} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{barn.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/10 px-2 py-0.5 rounded-md">
                          {barn.type}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/10 px-2 py-0.5 rounded-md">
                          {barn.capacity.toLocaleString()} aves
                        </span>
                        <button
                          onClick={() => handleOpenHistoryModal(barn)}
                          className="p-1 bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white rounded-md transition-colors ml-1 flex items-center justify-center"
                          title="Ver Diário do Galpão"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Custo Diário</p>
                    <p className="text-lg font-black text-red-400">- R$ {barn.dailyCost.toFixed(2)}</p>
                  </div>
                </div>

                {/* Barn Content */}
                <div className="p-5 flex-1 flex flex-col gap-5">
                  {barn.batch ? (
                    <>
                      {/* Silo Status - Destaque */}
                      <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200">
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <Wheat size={18} className="text-amber-600" />
                            <span className="text-sm font-black text-zinc-800">Silo de Ração</span>
                          </div>
                          <span className="text-xs font-bold text-zinc-500">{barn.siloBalance.toFixed(0)} / {barn.siloCapacity} kg</span>
                        </div>
                        
                        <div className="w-full bg-zinc-200 rounded-full h-2 mb-4 overflow-hidden">
                          <motion.div 
                            className={`h-full ${siloPercentage < 20 ? 'bg-red-500' : siloPercentage < 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${siloPercentage}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <select 
                            value={barn.selectedFeedId || 'feed_basic'}
                            onChange={(e) => selectFeed(barn.id, e.target.value)}
                            className="flex-1 p-2.5 rounded-xl border border-zinc-300 text-sm font-bold text-zinc-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-white"
                          >
                            {Object.values(FEEDS).map(feed => (
                              <option key={feed.id} value={feed.id}>{feed.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              const maxAmount = barn.siloCapacity - barn.siloBalance;
                              if (barn.isRented) {
                                const amount = Number(prompt(`Integração: Quantos kg de ${FEEDS[barn.selectedFeedId || 'feed_basic']?.name} solicitar da integradora? (Máx: ${maxAmount} kg)`));
                                if (!isNaN(amount) && amount > 0) useGameStore.getState().fillSilo(barn.id, amount);
                              } else {
                                handleOpenFeedModal(barn);
                              }
                            }}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${barn.isRented ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-900 hover:bg-black text-white'}`}
                          >
                            Abastecer
                          </button>
                        </div>
                      </div>

                      {/* Métricas do Lote */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Aves Vivas</span>
                          <span className="text-xl font-black text-zinc-800">{barn.batch.animalCount.toLocaleString()}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Idade</span>
                          <span className="text-xl font-black text-zinc-800">{barn.batch.ageDays} <span className="text-xs text-zinc-400">d</span></span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Peso Médio</span>
                          <span className="text-xl font-black text-zinc-800">{barn.batch.currentWeight.toFixed(2)} <span className="text-xs text-zinc-400">kg</span></span>
                        </div>
                        <div className="bg-red-50 p-3 rounded-2xl border border-red-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                          {barn.batch.activeDisease && (
                            <div className="absolute inset-x-0 top-0 bg-red-600 h-1" />
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Mortes</span>
                          <span className="text-xl font-black text-red-700">{barn.batch.mortalityCount.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Saúde & Limpeza */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => cleanBarn(barn.id, 50)}
                          disabled={money < 50 || barn.batch!.hygieneLevel > 90}
                          className="flex-1 p-3 bg-white border border-zinc-200 hover:border-blue-300 hover:bg-blue-50 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-zinc-700">
                            <Sparkles size={16} className={barn.batch!.hygieneLevel > 70 ? 'text-emerald-500' : 'text-amber-500'} /> 
                            Higiene: {barn.batch!.hygieneLevel}%
                          </div>
                          <span className="text-[10px] text-blue-600 uppercase tracking-widest mt-1">Limpar (R$ 50)</span>
                        </button>

                        <button 
                          onClick={() => vaccinateBatch(barn.id, 200)}
                          disabled={money < 200 || barn.batch!.vaccineProtectionDays > 0}
                          className="flex-1 p-3 bg-white border border-zinc-200 hover:border-emerald-300 hover:bg-emerald-50 rounded-2xl text-sm font-bold flex flex-col items-center justify-center gap-1 disabled:opacity-50 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-2 text-zinc-700">
                            <Syringe size={16} className={barn.batch!.vaccineProtectionDays > 0 ? 'text-emerald-500' : 'text-zinc-400'} /> 
                            {barn.batch!.vaccineProtectionDays > 0 ? `Protegido (${barn.batch!.vaccineProtectionDays}d)` : 'Sem Vacina'}
                          </div>
                          <span className="text-[10px] text-emerald-600 uppercase tracking-widest mt-1">Vacinar (R$ 200)</span>
                        </button>
                      </div>

                      {/* Status de Doença */}
                      {barn.batch.activeDisease && (
                        <div className="bg-red-600 text-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
                          <div>
                            <p className="font-black flex items-center gap-2 text-lg">
                              <AlertCircle size={20} /> 
                              Surto: {barn.batch.activeDisease.name}
                            </p>
                            <p className="text-xs text-red-200 mt-1 font-medium">
                              Cura natural em {barn.batch.activeDisease.durationDays - barn.batch.activeDisease.daysActive} dias. Risco alto de perdas.
                            </p>
                          </div>
                          <button 
                            onClick={() => medicateBatch(barn.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-white text-red-600 rounded-xl text-sm font-black hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
                          >
                            Medicar Lote
                          </button>
                        </div>
                      )}

                      {/* Ações de Venda / Descarte */}
                      <div className="mt-auto pt-2">
                        {barn.type === 'CORTE' ? (
                          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                            <div className="flex justify-between items-end mb-4">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Peso Total do Lote</p>
                                <p className="text-2xl font-black text-emerald-800">{((barn.batch.animalCount * barn.batch.currentWeight) / 1000).toFixed(2)} ton</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Cotação Atual</p>
                                <p className="text-lg font-black text-emerald-700">R$ {hasSlaughterhouse ? marketPrices.processedMeat.toFixed(2) : marketPrices.meat.toFixed(2)}/kg</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleOpenModal(barn.id, 'SELL')}
                              className={`w-full py-3.5 text-white rounded-xl font-black transition-all shadow-md ${barn.isRented ? 'bg-blue-600 hover:bg-blue-700' : hasSlaughterhouse ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                              {barn.isRented ? 'Finalizar Integração (Receber Pagamento)' : hasSlaughterhouse ? 'Enviar ao Abatedouro' : 'Vender Lote (Atacado)'}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <div className="mb-4">
                              <div className="flex justify-between text-xs font-black mb-2 uppercase tracking-wider text-orange-800">
                                <span>Idade Produtiva</span>
                                <span className={barn.batch.ageDays > MAX_LAYER_AGE_DAYS ? 'text-red-600' : 'text-orange-600'}>
                                  {barn.batch.ageDays} / {MAX_LAYER_AGE_DAYS} dias
                                </span>
                              </div>
                              <div className="w-full bg-orange-200/50 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full ${barn.batch.ageDays > MAX_LAYER_AGE_DAYS ? 'bg-red-500' : 'bg-orange-500'}`} 
                                  style={{ width: `${Math.min(100, (barn.batch.ageDays / MAX_LAYER_AGE_DAYS) * 100)}%` }}
                                />
                              </div>
                              {barn.batch.ageDays > MAX_LAYER_AGE_DAYS && (
                                <p className="text-xs text-red-600 mt-2 font-bold flex items-center gap-1">
                                  <AlertCircle size={14} /> Lote esgotado! Descarte as aves.
                                </p>
                              )}
                            </div>
                            {barn.batch.ageDays > MAX_LAYER_AGE_DAYS && (
                              <button 
                                onClick={() => handleOpenModal(barn.id, 'DISCARD')}
                                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                <Trash2 size={18} /> Descartar Lote (R$ {DISCARD_BIRD_PRICE.toFixed(2)}/ave)
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${barn.sanitaryVoidDays > 0 ? 'bg-amber-100 text-amber-500' : 'bg-zinc-100 text-zinc-300'}`}>
                        {barn.sanitaryVoidDays > 0 ? <Wind size={40} /> : <Bird size={40} />}
                      </div>
                      <h3 className={`text-xl font-black ${barn.sanitaryVoidDays > 0 ? 'text-amber-800' : 'text-zinc-400'}`}>
                        {barn.sanitaryVoidDays > 0 ? 'Vazio Sanitário' : 'Galpão Vazio'}
                      </h3>
                      {barn.sanitaryVoidDays > 0 ? (
                        <>
                          <p className="text-amber-600/80 mt-2 text-sm font-medium max-w-xs">Aguardando período obrigatório de desinfecção para novo lote.</p>
                          <p className="mt-4 text-sm font-black bg-amber-100 text-amber-800 py-1.5 px-4 rounded-full">
                            Liberado em {barn.sanitaryVoidDays} dia(s)
                          </p>
                        </>
                      ) : (
                        <p className="text-zinc-400 mt-2 text-sm font-medium">Compre um novo lote no Mercado.</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'SELL' ? 'Confirmar Venda' : 'Descartar Lote'}
        icon={modalType === 'SELL' ? <DollarSign className="text-emerald-500" /> : <Trash2 className="text-red-500" />}
      >
        <div className="space-y-4">
          <p className="text-zinc-600 font-medium">
            {modalType === 'SELL' 
              ? 'Tem certeza que deseja finalizar este lote e enviá-lo para venda ou processamento?' 
              : 'Este lote já atingiu a idade máxima produtiva. Deseja vender as aves para o mercado de descarte?'}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <button 
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirmAction}
              className={`px-5 py-2.5 font-bold text-white rounded-xl shadow-md transition-transform hover:scale-105 ${modalType === 'SELL' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
            >
              {modalType === 'SELL' ? 'Confirmar Venda' : 'Confirmar Descarte'}
            </button>
          </div>
        </div>
      </Modal>

      {feedBarnData && (
        <FeedSiloModal
          isOpen={feedModalOpen}
          onClose={() => setFeedModalOpen(false)}
          barn={feedBarnData}
        />
      )}

      {historyBarnData && (
        <Modal
          isOpen={historyModalOpen}
          onClose={() => setHistoryModalOpen(false)}
          title={`Diário do Galpão - ${historyBarnData.name}`}
          icon={<FileText className="text-zinc-500" />}
        >
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {historyBarnData.history && historyBarnData.history.length > 0 ? (
              [...historyBarnData.history].reverse().map((log: any, idx) => (
                <div key={idx} className={`p-3 rounded-lg border text-sm flex gap-3 items-start ${
                  log.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' :
                  log.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                  log.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}>
                  <div className="text-xs font-black uppercase tracking-wider opacity-70 shrink-0 whitespace-nowrap mt-0.5">
                    D{log.day} {log.hour}h
                  </div>
                  <div className="font-medium leading-relaxed">
                    {log.message}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 py-10 font-medium">Nenhum evento registrado ainda.</p>
            )}
          </div>
        </Modal>
      )}
    </PageTransition>
  );
}
