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

/** Escuchar en inglés y tocar la opción correcta: banderas, números o letras. */
export type TapPickBlock = {
  kind: "tapPick";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  style: "flag" | "number" | "letter" | "word";
  time: TimeOfDay;
  promptEs: string;
  rounds: {
    id: string;
    /** Clip (o secuencia de clips) que se escucha. */
    clip: string | string[];
    en: string;
    es?: string;
    /** Id de vocabulario correcto. */
    answer: string;
    options: string[];
    /** Personaje que dice la frase, si aplica. */
    speaker?: CharacterId;
  }[];
};

/** El jugador elige un dato suyo (país o edad) y queda guardado en su perfil. */
export type PickProfileBlock = {
  kind: "pickProfile";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  time: TimeOfDay;
  field: "country" | "age";
  promptEs: string;
  /** Ids de vocabulario entre los que elegir. */
  options: string[];
  /** Frase que dice después de elegir, con {value}. */
  say: { targetEn: string; promptEs: string; modelClip: string | string[] };
};

/** Deletrear una palabra tocando letras en orden. */
export type SpellBlock = {
  kind: "spell";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  time: TimeOfDay;
  promptEs: string;
  /** "alias" deletrea el nombre del jugador. */
  word: "alias" | string;
  record?: { id: string; promptEs: string; targetEn: string; modelClip: string | string[] };
};

/** Presentación final: varias frases seguidas frente a los personajes. */
export type ShowcaseBlock = {
  kind: "showcase";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  time: TimeOfDay;
  audience: CharacterId[];
  intro: SpokenLine;
  steps: { id: string; promptEs: string; targetEn: string; modelClip: string | string[] }[];
  cheer: SpokenLine;
};

export type MissionBlock =
  | StoryBlock
  | ListenPickBlock
  | BagMatchBlock
  | DialogueBlock
  | FinaleBlock
  | TapPickBlock
  | PickProfileBlock
  | SpellBlock
  | ShowcaseBlock;

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
  /** Contador visible arriba: mochilas el lunes, estrellas los demás días. */
  counter?: { icon: "bag" | "star"; label: string };
  /** Frases que se repasan al terminar. */
  reviewPhrases?: string[];
  blocks: MissionBlock[];
};
