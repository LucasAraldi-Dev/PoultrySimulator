import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';

export const useGameLoop = () => {
  const advanceHour = useGameStore((state) => state.advanceHour);
  const currentDay = useGameStore((state) => state.currentDay);
  const gameSpeed = useGameStore((state) => state.gameSpeed);

  // Um tick normal vai avançar 1 hora
  // Base: 1 dia = 24 horas = 4 minutos reais (10s por hora) no speed 1
  const baseTickMs = 10000; 

  useEffect(() => {
    if (currentDay === 0 || gameSpeed === 0) return; // Jogo não iniciado ou pausado

    // Se speed for 1, o tick é 10000ms. Se speed for 2, é 5000ms. Se 3, é 2500ms.
    const currentTickRate = baseTickMs / gameSpeed;

    const interval = setInterval(() => {
      advanceHour();
    }, currentTickRate);

    return () => clearInterval(interval);
  }, [currentDay, gameSpeed, advanceHour]);
};
