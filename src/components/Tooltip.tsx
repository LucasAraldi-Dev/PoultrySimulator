import { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  pros?: string[];
  cons?: string[];
}

export function Tooltip({ content, pros = [], cons = [] }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center justify-center cursor-help ml-2"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // For mobile
    >
      <Info size={16} className="text-zinc-400 hover:text-indigo-500 transition-colors" />
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 text-white text-sm rounded-xl shadow-xl z-50 pointer-events-none"
          >
            <div className="font-medium mb-1">{content}</div>
            
            {pros.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">Prós</span>
                {pros.map((p, i) => (
                  <div key={i} className="text-emerald-200 text-xs flex items-start gap-1">
                    <span className="text-emerald-400">+</span> {p}
                  </div>
                ))}
              </div>
            )}
            
            {cons.length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-red-400 text-xs font-bold uppercase tracking-wider block">Contras</span>
                {cons.map((c, i) => (
                  <div key={i} className="text-red-200 text-xs flex items-start gap-1">
                    <span className="text-red-400">-</span> {c}
                  </div>
                ))}
              </div>
            )}

            {/* Seta do balão */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}