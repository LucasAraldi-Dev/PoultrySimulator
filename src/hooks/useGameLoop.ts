import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = (tickRateMs: number = 5000) => {
  const advanceDay = useGameStore((state) => state.advanceDay);
  const currentDay = useGameStore((state) => state.currentDay);

  useEffect(() => {
    if (currentDay === 0) return; // Jogo não iniciado

    const interval = setInterval(() => {
      advanceDay();
    }, tickRateMs);

    return () => clearInterval(interval);
  }, [currentDay, advanceDay, tickRateMs]);
};
