import { useGameStore } from '../store/useGameStore';
import { motion } from 'framer-motion';
import { Home, Factory, Bird, Egg, Plus, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TileProps {
  type: 'hq' | 'feedMill' | 'incubator' | 'slaughterhouse' | 'barn_corte' | 'barn_postura' | 'empty' | 'buy';
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const IsometricTile = ({ type, label, onClick, active = true }: TileProps) => {
  let mainColor = 'bg-emerald-500';
  let sideColor = 'bg-emerald-600';
  let topColor = 'bg-emerald-400';
  let icon = null;
  let h = 'h-2'; // Default height
  let isBuilding = false;

  if (!active && type !== 'empty' && type !== 'buy') {
    mainColor = 'bg-zinc-300'; sideColor = 'bg-zinc-400'; topColor = 'bg-zinc-200';
    icon = <Lock size={16} className="text-zinc-500" />;
    h = 'h-4';
    isBuilding = true;
  } else {
    switch (type) {
      case 'hq':
        mainColor = 'bg-blue-500'; sideColor = 'bg-blue-600'; topColor = 'bg-blue-400';
        icon = <Home size={20} className="text-white drop-shadow-md" />;
        h = 'h-16';
        isBuilding = true;
        break;
      case 'feedMill':
        mainColor = 'bg-amber-500'; sideColor = 'bg-amber-600'; topColor = 'bg-amber-400';
        icon = <Factory size={20} className="text-white drop-shadow-md" />;
        h = 'h-20';
        isBuilding = true;
        break;
      case 'incubator':
        mainColor = 'bg-purple-500'; sideColor = 'bg-purple-600'; topColor = 'bg-purple-400';
        icon = <Egg size={20} className="text-white drop-shadow-md" />;
        h = 'h-12';
        isBuilding = true;
        break;
      case 'slaughterhouse':
        mainColor = 'bg-red-500'; sideColor = 'bg-red-600'; topColor = 'bg-red-400';
        icon = <Factory size={20} className="text-white drop-shadow-md" />;
        h = 'h-14';
        isBuilding = true;
        break;
      case 'barn_corte':
        mainColor = 'bg-orange-500'; sideColor = 'bg-orange-600'; topColor = 'bg-orange-400';
        icon = <Bird size={16} className="text-white drop-shadow-md" />;
        h = 'h-8';
        isBuilding = true;
        break;
      case 'barn_postura':
        mainColor = 'bg-yellow-500'; sideColor = 'bg-yellow-600'; topColor = 'bg-yellow-400';
        icon = <Egg size={16} className="text-white drop-shadow-md" />;
        h = 'h-8';
        isBuilding = true;
        break;
      case 'buy':
        mainColor = 'bg-emerald-200/50 border-2 border-dashed border-emerald-400'; 
        sideColor = 'transparent'; topColor = 'transparent';
        icon = <Plus size={24} className="text-emerald-600" />;
        break;
      case 'empty':
        mainColor = 'bg-emerald-500/20 border border-emerald-500/30';
        sideColor = 'transparent'; topColor = 'transparent';
        break;
    }
  }

  return (
    <div className="relative group">
      <motion.div
        whileHover={onClick || type === 'buy' ? { y: -8, scale: 1.05 } : { scale: 1.02 }}
        onClick={onClick}
        className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 ${onClick || type === 'buy' ? 'cursor-pointer' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Base Floor (The Tile) */}
        <div 
          className={`absolute inset-0 ${mainColor} rounded-sm transition-colors duration-300`} 
          style={{ transform: 'translateZ(0px)' }}
        >
          {type === 'buy' && (
             <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotateX(-60deg) rotateZ(45deg)' }}>
               {icon}
             </div>
          )}
        </div>
        
        {/* 3D Building Structure */}
        {isBuilding && (
          <div 
            className="absolute inset-x-2 bottom-2 shadow-2xl"
            style={{ 
              transform: 'translateZ(10px)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Front Wall */}
            <div className={`absolute bottom-0 w-full ${h} ${mainColor} origin-bottom border-b border-black/10`} style={{ transform: 'rotateX(90deg)' }} />
            
            {/* Right Wall */}
            <div className={`absolute bottom-0 right-0 w-full ${h} ${sideColor} origin-bottom border-l border-black/20`} style={{ transform: 'rotateY(-90deg) rotateZ(-90deg) translateX(100%)' }} />
            
            {/* Roof */}
            <div className={`absolute bottom-full w-full h-full ${topColor} flex items-center justify-center border border-white/20`} style={{ transform: `translateZ(${h.replace('h-', '')}px)` }}>
              {/* Rotate the icon back to face the camera properly */}
              <div style={{ transform: 'rotateX(-60deg) rotateZ(45deg)' }}>
                {icon}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Custom Tooltip that counter-rotates to look flat */}
      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-4 whitespace-nowrap z-50"
           style={{ transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-20px)' }}>
        <div className="bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded shadow-xl">
          {label}
        </div>
      </div>
    </div>
  );
};

export function FarmMap() {
  const barns = useGameStore(state => state.barns);
  const hasFeedMill = useGameStore(state => state.hasFeedMill);
  const hasIncubator = useGameStore(state => state.hasIncubator);
  const hasSlaughterhouse = useGameStore(state => state.hasSlaughterhouse);
  const navigate = useNavigate();

  const slots = [
    { type: 'hq', label: 'Sede da Fazenda', active: true },
    { type: 'feedMill', label: hasFeedMill ? 'Fábrica de Ração' : 'Fábrica de Ração (Bloqueada)', active: hasFeedMill, onClick: () => !hasFeedMill && navigate('/infra') },
    { type: 'incubator', label: hasIncubator ? 'Incubatório' : 'Incubatório (Bloqueado)', active: hasIncubator, onClick: () => !hasIncubator && navigate('/infra') },
    { type: 'slaughterhouse', label: hasSlaughterhouse ? 'Abatedouro' : 'Abatedouro (Bloqueado)', active: hasSlaughterhouse, onClick: () => !hasSlaughterhouse && navigate('/infra') },
  ];

  barns.forEach((barn, index) => {
    if (index < 12) {
      slots.push({
        type: barn.type === 'CORTE' ? 'barn_corte' : 'barn_postura',
        label: barn.name,
        active: true,
        onClick: () => navigate('/galpoes')
      });
    }
  });

  const remaining = 16 - slots.length;
  if (remaining > 0) {
    slots.push({ type: 'buy', label: 'Comprar Expansão (Novo Galpão)', active: true, onClick: () => navigate('/mercado') });
    for (let i = 1; i < remaining; i++) {
      slots.push({ type: 'empty', label: 'Terreno Vazio', active: true });
    }
  }

  return (
    <div className="bg-emerald-900/5 p-6 relative min-h-[400px] flex items-center justify-center perspective-[1000px]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+PC9zdmc+')] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-center py-20">
        
        {/* Isometric Grid Container */}
        <div 
          className="grid grid-cols-4 gap-2 sm:gap-6"
          style={{ 
            transform: 'rotateX(60deg) rotateZ(-45deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {slots.map((slot, idx) => (
            <IsometricTile 
              key={idx} 
              type={slot.type as any} 
              label={slot.label} 
              active={slot.active}
              onClick={slot.onClick}
            />
          ))}
        </div>

      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-emerald-800 shadow-md border border-emerald-200">
        🗺️ Planta da Fazenda
      </div>
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-medium text-emerald-700 shadow-md border border-emerald-200 flex items-center gap-4">
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Sede</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Corte</span>
        <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> Postura</span>
      </div>
    </div>
  );
}
