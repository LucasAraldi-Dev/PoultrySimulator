import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getGameDate(currentDay: number): Date {
  const date = new Date(2026, 0, 1); // 1 de Janeiro de 2026
  date.setDate(date.getDate() + currentDay - 1);
  return date;
}

export function formatGameDate(currentDay: number): string {
  const date = getGameDate(currentDay);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getGameMonth(currentDay: number): number {
  return getGameDate(currentDay).getMonth();
}
