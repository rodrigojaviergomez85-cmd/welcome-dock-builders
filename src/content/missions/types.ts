import type { BagId, CharacterId } from "@/content/characters";

/**
 * CAMBIOS respecto a la versión anterior (marcados con "NUEVO"):
 *  - TimeOfDay gana "night" (la currícula del día 1 incluye Good night; necesita fondo dock-night.jpg).
 *  - Nuevos bloques: micCheck, sunClock, nameTag.
 *  - tapPick acepta style "sky" (opciones = cielos, no vocabulario).
 *  - showcase acepta time "auto" (hora real del dispositivo), {greeting} en targetEn, saveAs y teaser.
 *  - Mission gana `pip` (mascota transversal: come oraciones dichas en voz alta).
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"; // NUEVO: night

/** NUEVO: identificadores de cielo para el radar (tapPick style "sky"). */
export type SkyId = `sky-${TimeOfDay}`;

/** Un turno grabado por el alumno. Cualquier nombre vale en {alias}. */
export type RecordTurnSpec = {
  id: string;
  promptEs: string;
  targetEn: string;
  modelClip: string | string[];
  /** "quick" (por defecto): una pantalla. "guided": embudo con fragmentos. */
  mode?: "quick" | "guided";
};

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

export type DialogueTurn =
  | { type: "character"; speaker: CharacterId; clip: string; en: string }
  | ({ type: "record" } & RecordTurnSpec);

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
    turns: DialogueTurn[];
  }[];
};

export type FinaleBlock = {
  kind: "finale";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  with: CharacterId;
  time: TimeOfDay;
  turns: DialogueTurn[];
  goodNight: SpokenLine;
};

/** Escuchar en inglés y tocar la opción correcta: banderas, números, letras, palabras o cielos. */
export type TapPickBlock = {
  kind: "tapPick";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  /** NUEVO: "sky" → las opciones son SkyId y se dibujan como cielos (mañana/tarde/anochecer/noche). */
  style: "flag" | "number" | "letter" | "word" | "sky";
  time: TimeOfDay;
  promptEs: string;
  rounds: {
    id: string;
    /** Clip (o secuencia de clips) que se escucha. */
    clip: string | string[];
    en: string;
    es?: string;
    /** Id de vocabulario correcto (o SkyId cuando style = "sky"). */
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
  record?: RecordTurnSpec;
};

/** Presentación final: varias frases seguidas frente a los personajes. */
export type ShowcaseBlock = {
  kind: "showcase";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  /**
   * NUEVO: "auto" = el cielo se elige por la hora real del dispositivo
   * (05–11 morning · 12–17 afternoon · 18–20 evening · 21–04 night)
   * y las variables {greeting} / {greetingClip} se resuelven con esa hora:
   *   morning   → "Good morning!"   / "good-morning"
   *   afternoon → "Good afternoon!" / "good-afternoon"
   *   evening   → "Good evening!"   / "good-evening"
   *   night     → "Good night!"     / "good-night"
   */
  time: TimeOfDay | "auto";
  audience: CharacterId[];
  intro: SpokenLine;
  steps: RecordTurnSpec[];
  cheer: SpokenLine;
  /** NUEVO: guarda la grabación con este id como "presentación del día" (audio para el adulto y ticket para la clase). */
  saveAs?: string;
  /** NUEVO: gancho para el día siguiente, se reproduce al terminar. */
  teaser?: SpokenLine;
};

/* ───────────────────────── NUEVOS BLOQUES ───────────────────────── */

/**
 * NUEVO · micCheck: primer éxito del día en menos de un minuto.
 * Pip (la mascota) está dormido; el niño lo despierta diciendo la frase.
 * Sin micrófono: botón "Lo dije" y Pip se despierta igual (oral = pending).
 */
export type MicCheckBlock = {
  kind: "micCheck";
  id: string;
  estimatedMinutes: number;
  time: TimeOfDay;
  helpEs: string;
  /** Clip del guía en español que explica en voz (no se depende del texto). */
  introClip: string;
  record: RecordTurnSpec;
};

/**
 * NUEVO · sunClock: arrastrar el sol por el cielo. Cada parada cambia el fondo
 * (BACKGROUNDS[time]) y el guía saluda según la hora. Cuando el niño visitó las
 * cuatro paradas, se habilita "repetir": dice cada saludo y Pip come uno por uno.
 * Interacción: arrastrar el sol (pointer events) o tocar la parada directamente.
 */
export type SunClockBlock = {
  kind: "sunClock";
  id: string;
  estimatedMinutes: number;
  helpEs: string;
  introClip: string;
  guide: CharacterId;
  stops: {
    time: TimeOfDay;
    line: SpokenLine;
    repeat: RecordTurnSpec;
  }[];
  done: SpokenLine;
};

/**
 * NUEVO · nameTag: hablar para producir un objeto.
 * 1) El personaje se presenta y pregunta el nombre.  2) El niño graba "My name is {alias}."
 * 3) La máquina de Boti imprime la etiqueta con el alias (animación) y queda guardada en la mochila.
 * 4) Cambio de rol: el niño pregunta "What is your name?" y otro personaje responde.
 */
export type NameTagBlock = {
  kind: "nameTag";
  id: string;
  estimatedMinutes: number;
  time: TimeOfDay;
  helpEs: string;
  introClip: string;
  asker: CharacterId;
  ask: SpokenLine[];
  record: RecordTurnSpec;
  printed: SpokenLine;
  swap: {
    record: RecordTurnSpec;
    answer: SpokenLine;
  };
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
  | ShowcaseBlock
  | MicCheckBlock
  | SunClockBlock
  | NameTagBlock;

export type MissionStatus = "available" | "locked";

/**
 * NUEVO · Pip, la mascota que solo entiende inglés.
 * Es transversal a todas las misiones: cada turno grabado (heard o practiced) la alimenta.
 * Al llegar a feedsToEvolve dentro de la misión, evoluciona (nuevo accesorio) y se guarda en el perfil.
 */
export type PipConfig = {
  feedsToEvolve: number;
  rewardLabel: string;
};

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
  /** NUEVO */
  pip?: PipConfig;
  blocks: MissionBlock[];
};
