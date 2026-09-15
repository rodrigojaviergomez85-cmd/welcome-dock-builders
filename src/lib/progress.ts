/**
 * Progreso guardado en el dispositivo (sin cuentas todavía).
 * Se distingue explícitamente: misión completada, comprensión observada y práctica oral.
 */

export const PROGRESS_KEY = "kids-platform-progress-v1";

export type OralStatus = "none" | "heard" | "practiced" | "pending-no-mic";

/** Resultado de un turno hablado. "heard" = el juego entendió la frase. */
export type OralResult = "heard" | "practiced" | "pending";

export type MissionProgress = {
  started: boolean;
  completed: boolean;
  /** Bloque en el que quedó el alumno. */
  blockIndex: number;
  /** Paso dentro del bloque. */
  stepIndex: number;
  helpsUsed: number;
  comprehension: { correct: number; attempts: number };
  oral: { recordings: number; status: OralStatus };
  rewards: string[];
  /** Cuántas veces se terminó: repetir cuenta como práctica, no como misión nueva. */
  completions: number;
  updatedAt: string;
};

export type Profile = { avatarId: string; alias: string };

export type ProgressState = {
  version: 1;
  profile: Profile | null;
  micAllowed: boolean | null;
  missions: Record<string, MissionProgress>;
};

export const emptyMission = (): MissionProgress => ({
  started: false,
  completed: false,
  blockIndex: 0,
  stepIndex: 0,
  helpsUsed: 0,
  comprehension: { correct: 0, attempts: 0 },
  oral: { recordings: 0, status: "none" },
  rewards: [],
  completions: 0,
  updatedAt: new Date().toISOString(),
});

export const emptyState = (): ProgressState => ({
  version: 1,
  profile: null,
  micAllowed: null,
  missions: {},
});

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== 1) return emptyState();
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento lleno o bloqueado: el juego sigue funcionando en esta sesión */
  }
}

export function getMissionProgress(state: ProgressState, missionId: string): MissionProgress {
  return state.missions[missionId] ?? emptyMission();
}

export function updateMission(
  state: ProgressState,
  missionId: string,
  patch: (current: MissionProgress) => MissionProgress,
): ProgressState {
  const current = getMissionProgress(state, missionId);
  const next = { ...patch(current), updatedAt: new Date().toISOString() };
  return { ...state, missions: { ...state.missions, [missionId]: next } };
}

/** Las recompensas son únicas: repetir la misión no las duplica. */
export function addReward(progress: MissionProgress, rewardId: string): MissionProgress {
  if (progress.rewards.includes(rewardId)) return progress;
  return { ...progress, rewards: [...progress.rewards, rewardId] };
}
