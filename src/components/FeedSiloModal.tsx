import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheat, Package, ArrowDown, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { FEEDS } from '../store/constants';
import { Barn } from '../store/types';

interface FeedSiloModalProps {
  isOpen: boolean;
  onClose: () => void;
  barn: Barn;
}

export function FeedSiloModal({ isOpen, onClose, barn }: FeedSiloModalProps) {
  const fillSilo = useGameStore(state => state.fillSilo);
  const inventory = useGameStore(state => state.inventory);
  const [amount, setAmount] = useState<number>(0);
  const [isFeeding, setIsFeeding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(0);
      setIsFeeding(false);
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!barn) return null;

  const currentFeed = FEEDS[barn.selectedFeedId || 'feed_basic'];
  const inventoryItem = inventory.find(i => i.itemId === barn.selectedFeedId);
  const availableAmount = inventoryItem ? inventoryItem.quantity : 0;
  
  const maxCapacity = barn.siloCapacity;
  const currentLevel = barn.siloBalance;
  const availableSpace = maxCapacity - currentLevel;
  
  const maxCanFeed = Math.min(availableAmount, availableSpace);

  const handleFeed = () => {
    if (amount <= 0 || amount > maxCanFeed) return;
    
    setIsFeeding(true);
    
    // Animation duration
    setTimeout(() => {
      fillSilo(barn.id, amount);
      setIsFeeding(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    }, 2500);
  };

  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage
    delay: Math.random() * 0.5,
    duration: 0.5 + Math.random() * 0.5,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={isFeeding ? () => {} : onClose}
      title={`Abastecer Silo - ${barn.name}`}
      icon={<Wheat className="text-amber-500" />}
    >
      <div className="space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Package size={24} className="text-amber-600 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Estoque Disponível</span>
            <span className="text-xl font-black text-amber-800">{availableAmount.toLocaleString()} kg</span>
            <span className="text-xs text-amber-600 font-medium mt-1">{currentFeed?.name || 'Ração'}</span>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
            <Wheat size={24} className="text-blue-600 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Espaço no Silo</span>
            <span className="text-xl font-black text-blue-800">{availableSpace.toLocaleString()} kg</span>
            <span className="text-xs text-blue-600 font-medium mt-1">Atual: {currentLevel.toLocaleString()} / {maxCapacity.toLocaleString()}</span>
          </div>
        </div>

        {/* Silo Visualizer & Animation */}
        <div className="relative h-64 bg-zinc-100 rounded-3xl border-4 border-zinc-300 overflow-hidden flex flex-col justify-end">
          {/* Silo Top Cover */}
          <div className="absolute top-0 inset-x-0 h-4 bg-zinc-300 z-20"></div>
          
          {/* Falling Feed Animation */}
          <AnimatePresence>
            {isFeeding && (
              <div className="absolute inset-0 z-10 overflow-hidden">
                {particles.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ y: -20, x: `${p.x}%`, opacity: 1 }}
                    animate={{ y: '100%', opacity: [1, 1, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: p.duration, 
                      delay: p.delay,
                      ease: "linear" 
                    }}
                    className="absolute top-0 w-2 h-3 bg-amber-400 rounded-full"
                    style={{ left: `${p.x}%` }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Silo Fill Level */}
          <motion.div 
            className="bg-amber-500 w-full relative z-0"
            initial={{ height: `${(currentLevel / maxCapacity) * 100}%` }}
            animate={{ 
              height: `${((currentLevel + (isFeeding ? amount : 0)) / maxCapacity) * 100}%` 
            }}
            transition={{ duration: isFeeding ? 2.5 : 0.3, ease: "easeInOut" }}
          >
            {/* Texture overlay for feed */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/sand.png')] mix-blend-overlay"></div>
            <div className="absolute top-0 inset-x-0 h-2 bg-amber-400/50"></div>
          </motion.div>

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm"
              >
                <div className="bg-white p-4 rounded-full shadow-2xl mb-4">
                  <CheckCircle2 size={48} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white drop-shadow-md">Abastecido!</h3>
                <p className="text-emerald-100 font-bold mt-1">+{amount.toLocaleString()} kg de ração</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold text-zinc-600">
            <span>Quantidade a abastecer:</span>
            <span className="text-amber-600">{amount.toLocaleString()} kg</span>
          </div>
          
          <input
            type="range"
            min="0"
            max={maxCanFeed}
            step="100"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            disabled={isFeeding || showSuccess || maxCanFeed === 0}
            className="w-full h-3 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setAmount(Math.min(maxCanFeed, Math.floor(maxCanFeed / 2)))}
              disabled={isFeeding || showSuccess || maxCanFeed === 0}
              className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              50%
            </button>
            <button
              onClick={() => setAmount(maxCanFeed)}
              disabled={isFeeding || showSuccess || maxCanFeed === 0}
              className="flex-1 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              MÁX
            </button>
          </div>
          
          {maxCanFeed === 0 && (
            <p className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-lg">
              {availableAmount === 0 
                ? "Você não tem ração no estoque! Compre no Mercado." 
                : "O silo já está cheio!"}
            </p>
          )}

          <button
            onClick={handleFeed}
            disabled={amount <= 0 || isFeeding || showSuccess}
            className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-300 disabled:text-zinc-500 text-white rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
          >
            {isFeeding ? (
              <>Enchendo Silo...</>
            ) : showSuccess ? (
              <>Concluído!</>
            ) : (
              <><ArrowDown size={24} /> Despejar Ração no Silo</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
