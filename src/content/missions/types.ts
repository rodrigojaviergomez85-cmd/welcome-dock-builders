import type { BagId, CharacterId } from "@/content/characters";

export type TimeOfDay = "morning" | "afternoon" | "evening";

/** Una línea hablada por un personaje. El clip ya está producido: nunca se genera en el juego. */
export type SpokenLine = {
  speaker: CharacterId;
  /** Nombre del archivo en /audio, sin extensión. */
  clip: string;
  en: string;
  /** Ayuda breve en español, opcional. */
  es?: string;
};

export type StoryBlock = {
  kind: "story";
  id: string;
  estimatedMinutes: number;
  time: TimeOfDay;
  helpEs: string;
  lines: SpokenLine[];
  /** Respuesta del alumno por selección, con modelo completo. */
  choice: {
    promptEs: string;
    /** El texto usa {alias} para el alias del avatar. */
    options: { en: string; correct: boolean }[];
    modelClip: string;
  };
};

export type ListenPickBlock = {
  kind: "listenPick";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  rounds: {
    id: string;
    time: TimeOfDay;
    clip: string;
    en: string;
    answer: CharacterId;
    options: CharacterId[];
  }[];
};

export type BagMatchBlock = {
  kind: "bagMatch";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  items: {
    id: string;
    bag: BagId;
    /** "avatar" significa que la mochila es del propio alumno. */
    owner: CharacterId | "avatar";
    clip: string;
    en: string;
    /** Cómo habla el personaje: cambia el orden para que escuchar sea necesario. */
    order: "nameFirst" | "askFirst" | "greetThenName";
    /** Respuesta del alumno al entregar la mochila. */
    reply?: { en: string; modelClip: string };
    /** Respuesta del personaje después de recibir su mochila. */
    thanks?: SpokenLine;
    options: CharacterId[];
  }[];
};

export type DialogueBlock = {
  kind: "dialogue";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  conversations: {
    id: string;
    with: CharacterId;
    time: TimeOfDay;
    support: "full" | "reduced";
    turns: (
      | { type: "character"; speaker: CharacterId; clip: string; en: string }
      | {
          type: "record";
          id: string;
          promptEs: string;
          targetEn: string;
          modelClip: string;
        }
    )[];
  }[];
};

export type FinaleBlock = {
  kind: "finale";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  with: CharacterId;
  time: TimeOfDay;
  turns: DialogueBlock["conversations"][number]["turns"];
  goodNight: SpokenLine;
};

export type MissionBlock =
  | StoryBlock
  | ListenPickBlock
  | BagMatchBlock
  | DialogueBlock
  | FinaleBlock;

export type MissionStatus = "available" | "locked";

export type Mission = {
  id: string;
  order: number;
  dayEs: string;
  title: string;
  status: MissionStatus;
  /** Objetivo pedagógico, en español, para adultos y coaches. */
  objective: string;
  /** Qué pasa en la historia. */
  storyProblem: string;
  prerequisites: string[];
  models: string[];
  /** Qué queda visible al terminar. */
  reward: { id: string; label: string };
  /** Qué evidencia de aprendizaje se puede observar. */
  evidence: string;
  blocks: MissionBlock[];
};
