/**
 * Glosario bilingüe: para cada frase en inglés que se usa en el juego,
 * su significado en español, el clip con la voz en español y (cuando existe)
 * la versión lenta en inglés.
 *
 * Los clips son archivos ya producidos en /public/audio: el juego nunca genera audio.
 */

export type Gloss = {
  /** Significado en español. */
  es: string;
  /** Clip con la voz en español. */
  esClip?: string;
  /** Clip en inglés dicho muy lento, palabra por palabra. */
  slowClip?: string;
};

/** La clave es la frase en inglés tal cual aparece en el contenido ({alias} incluido). */
export const GLOSSARY: Record<string, Gloss> = {
  "Hello!": { es: "¡Hola!", esClip: "es-hello" },
  "Hello! My name is Luna. Welcome to Explorer Island!": {
    es: "¡Hola! Me llamo Luna. ¡Bienvenido a la Isla de los Exploradores!",
    esClip: "es-luna-welcome",
  },
  "What is your name?": {
    es: "¿Cómo te llamás?",
    esClip: "es-what-name",
    slowClip: "slow-what-name",
  },
  "Hello! What is your name?": {
    es: "¡Hola! ¿Cómo te llamás?",
    esClip: "es-hello-what-name",
  },
  "Hello! What is your name? My name is Leo.": {
    es: "¡Hola! ¿Cómo te llamás? Yo me llamo Leo.",
    esClip: "es-leo-ask-first",
  },
  "Hello! My name is Leo.": { es: "¡Hola! Me llamo Leo.", esClip: "es-hello-name-leo" },
  "Good morning! My name is Luna.": {
    es: "¡Buenos días! Me llamo Luna.",
    esClip: "es-morning-luna",
  },
  "Good afternoon! My name is Luna.": {
    es: "¡Buenas tardes! Me llamo Luna.",
    esClip: "es-afternoon-luna",
  },
  "Good afternoon! My name is Leo.": {
    es: "¡Buenas tardes! Me llamo Leo.",
    esClip: "es-afternoon-leo",
  },
  "Good evening! My name is Boti.": {
    es: "¡Buenas noches! Me llamo Boti. Good evening se dice al llegar de noche.",
    esClip: "es-evening-boti",
  },
  "Good afternoon! I am Boti. My name is Boti.": {
    es: "¡Buenas tardes! Soy Boti. Me llamo Boti.",
    esClip: "es-boti-greet",
  },
  "This is your backpack!": { es: "¡Esta es tu mochila!", esClip: "es-your-backpack" },
  "Nice to meet you!": { es: "¡Mucho gusto!", esClip: "es-nice" },
  "I am fine.": { es: "Estoy bien.", esClip: "es-i-am-fine", slowClip: "slow-i-am-fine" },
  "How are you?": { es: "¿Cómo estás?", esClip: "es-how-are-you", slowClip: "slow-how-are-you" },
  "Good night!": {
    es: "¡Buenas noches! Se dice al irse a dormir.",
    esClip: "es-good-night",
  },
  "Good morning!": { es: "¡Buenos días!", esClip: "es-good-morning", slowClip: "slow-good-morning" },
  "Good afternoon!": {
    es: "¡Buenas tardes!",
    esClip: "es-good-afternoon",
    slowClip: "slow-good-afternoon",
  },
  "Good evening!": { es: "¡Buenas noches! Se dice al llegar de noche.", esClip: "es-good-evening" },
  "My name is {alias}.": {
    es: "Me llamo …",
    esClip: "es-my-name-is",
    slowClip: "slow-my-name-is",
  },
  "Hello! My name is {alias}.": {
    es: "¡Hola! Me llamo …",
    esClip: "es-hello-my-name-is",
    slowClip: "slow-hello-my-name-is",
  },
  "Hello! My name is {alias}. I am fine.": {
    es: "¡Hola! Me llamo … Estoy bien.",
    esClip: "es-hello-name-fine",
    slowClip: "slow-hello-name-fine",
  },
  "Good afternoon! My name is {alias}.": {
    es: "¡Buenas tardes! Me llamo …",
    esClip: "es-good-afternoon-name",
    slowClip: "slow-good-afternoon-name",
  },
  "Your turn!": { es: "¡Te toca!", esClip: "es-your-turn" },
};

/** Clips puente que usa el modo "primero en español". */
export const BRIDGE = {
  inEnglish: "bridge-en-ingles",
  repeat: "bridge-repeat",
  wellDone: "bridge-muy-bien",
};

/** Instrucción en español al empezar cada parte de la misión. */
export const BLOCK_INTROS: Record<string, { es: string; clip: string }> = {
  story: {
    es: "Llegaste al muelle. Luna te va a saludar en inglés. Escuchá y después elegí tu respuesta.",
    clip: "intro-story",
  },
  listen: {
    es: "Vas a escuchar a alguien presentarse en inglés. Tocá quién habló.",
    clip: "intro-listen",
  },
  bags: {
    es: "Cada explorador dice su nombre en inglés. Llevale la mochila a su dueño.",
    clip: "intro-bags",
  },
  talk: {
    es: "Te van a saludar en inglés. Vos vas a contestar con tu nombre. Primero escuchás, después lo decís.",
    clip: "intro-talk",
  },
  finale: {
    es: "Alguien nuevo te espera. Respondé en inglés y ganá tu etiqueta.",
    clip: "intro-finale",
  },
};

/**
 * Busca el significado de una frase. Si el alias del avatar está dentro del texto,
 * se vuelve a poner {alias} para encontrar la entrada del glosario.
 */
export function gloss(en: string, alias?: string): Gloss | undefined {
  const direct = GLOSSARY[en];
  if (direct) return direct;
  if (alias && alias.length > 0) {
    const key = en.split(alias).join("{alias}");
    return GLOSSARY[key];
  }
  return undefined;
}

/** Frases del día que se repasan al terminar la misión. */
export const REVIEW_PHRASES = [
  "Hello!",
  "Good morning!",
  "Good afternoon!",
  "Good evening!",
  "What is your name?",
  "My name is {alias}.",
  "How are you?",
  "I am fine.",
  "Nice to meet you!",
];
