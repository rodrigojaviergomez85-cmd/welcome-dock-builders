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
  oral: { recordings: number; understood: number; status: OralStatus; said?: number };
  rewards: string[];
  /** Cuántas veces se terminó: repetir cuenta como práctica, no como misión nueva. */
  completions: number;
  updatedAt: string;
};

export type Profile = {
  avatarId: string;
  alias: string;
  /** Color elegido para Pip al crear el perfil. */
  pipColor?: string;
  /** Id del país elegido en la misión del martes. */
  countryId?: string;
  /** Edad elegida en la misión del miércoles. */
  age?: number;
};

export type ProgressState = {
  version: 1;
  profile: Profile | null;
  pip: {
    color: string;
    feeds: number;
    /** Frases comidas durante toda la vida de Pip. Nunca se reinicia. */
    totalFeeds: number;
    stage: number;
    accessories: string[];
  };
  micAllowed: boolean | null;
  /** Si el juego puede escuchar y responder (transcribir el intento). */
  listenEnabled: boolean;
  missions: Record<string, MissionProgress>;
  /** Monedas ganadas al hablar y acertar. */
  coins: number;
  /** Días seguidos jugados. */
  streak: { count: number; lastDay: string | null };
  /** Piezas del pase de la semana, una por misión terminada. */
  passPieces: string[];
};

export const emptyMission = (): MissionProgress => ({
  started: false,
  completed: false,
  blockIndex: 0,
  stepIndex: 0,
  helpsUsed: 0,
  comprehension: { correct: 0, attempts: 0 },
  oral: { recordings: 0, understood: 0, status: "none" },
  rewards: [],
  completions: 0,
  updatedAt: new Date().toISOString(),
});

export const emptyState = (): ProgressState => ({
  version: 1,
  profile: null,
  pip: { color: "#FF8A3D", feeds: 0, totalFeeds: 0, stage: 0, accessories: [] },
  micAllowed: null,
  listenEnabled: true,
  missions: {},
  coins: 0,
  streak: { count: 0, lastDay: null },
  passPieces: [],
});

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as ProgressState;
    if (parsed.version !== 1) return emptyState();
    const fallback = emptyState();
    const legacyColor = parsed.profile?.pipColor;
    return {
      ...fallback,
      ...parsed,
      pip: {
        ...fallback.pip,
        ...parsed.pip,
        color: parsed.pip?.color ?? legacyColor ?? fallback.pip.color,
        totalFeeds: parsed.pip?.totalFeeds ?? parsed.pip?.feeds ?? 0,
        accessories: parsed.pip?.accessories ?? [],
      },
    };
  } catch {
    return emptyState();
  }
}

export type PipProgress = ProgressState["pip"];

/** Tamaño lógico de Pip: crece con cada frase y pega un salto al evolucionar. */
export function pipSizeFor(pip: Pick<PipProgress, "totalFeeds" | "stage">): number {
  return 64 + Math.min(Math.max(pip.totalFeeds, 0), 40) * 4 + Math.max(pip.stage, 0) * 16;
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
  const saved = state.missions[missionId];
  if (!saved) return emptyMission();
  // Progresos guardados antes de que el juego escuchara no traen "understood".
  return { ...emptyMission(), ...saved, oral: { ...emptyMission().oral, ...saved.oral } };
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
