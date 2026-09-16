/**
 * Monedas, racha y pase semanal. Todo se guarda en el dispositivo,
 * junto con el resto del progreso.
 */
import type { ProgressState } from "./progress";

export const COINS_PER_STEP = 3;
export const COINS_PER_MISSION = 20;

export function addCoins(state: ProgressState, amount: number): ProgressState {
  return { ...state, coins: (state.coins ?? 0) + amount };
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Suma un día a la racha la primera vez que se juega cada día. */
export function registerPlayDay(state: ProgressState): ProgressState {
  const streak = state.streak ?? { count: 0, lastDay: null };
  if (streak.lastDay === today()) return state;
  const count = streak.lastDay === yesterday() ? streak.count + 1 : 1;
  return { ...state, streak: { count, lastDay: today() } };
}

/** Cada misión terminada aporta una pieza al pase de la semana. */
export function addPassPiece(state: ProgressState, pieceId: string): ProgressState {
  const pieces = state.passPieces ?? [];
  if (pieces.includes(pieceId)) return state;
  return { ...state, passPieces: [...pieces, pieceId] };
}
