/**
 * Vocabulario de la Semana 1 (Mes 1, Nivel 0) tal como está en la currícula:
 * saludos, países, números 1–12 y alfabeto.
 *
 * Cada entrada apunta a un clip ya producido en /public/audio.
 * El juego nunca genera audio en tiempo real.
 */

export type VocabItem = {
  id: string;
  en: string;
  es: string;
  /** Clip en inglés con la palabra sola. */
  clip: string;
  /** Símbolo visible para que un niño reconozca sin leer inglés. */
  symbol?: string;
};

const COUNTRY_LIST: { id: string; en: string; es: string; symbol: string }[] = [
  { id: "c-el-salvador", en: "El Salvador", es: "El Salvador", symbol: "🇸🇻" },
  { id: "c-mexico", en: "Mexico", es: "México", symbol: "🇲🇽" },
  { id: "c-guatemala", en: "Guatemala", es: "Guatemala", symbol: "🇬🇹" },
  { id: "c-colombia", en: "Colombia", es: "Colombia", symbol: "🇨🇴" },
  { id: "c-peru", en: "Peru", es: "Perú", symbol: "🇵🇪" },
  { id: "c-argentina", en: "Argentina", es: "Argentina", symbol: "🇦🇷" },
  { id: "c-brazil", en: "Brazil", es: "Brasil", symbol: "🇧🇷" },
  { id: "c-united-states", en: "United States", es: "Estados Unidos", symbol: "🇺🇸" },
];

export const COUNTRIES: VocabItem[] = COUNTRY_LIST.map((c) => ({ ...c, clip: `w-${c.id}` }));

const NUMBER_WORDS = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const NUMBER_ES = [
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
  "diez",
  "once",
  "doce",
];

export const NUMBERS: VocabItem[] = NUMBER_WORDS.map((word, index) => ({
  id: `n-${index + 1}`,
  en: word.charAt(0).toUpperCase() + word.slice(1),
  es: NUMBER_ES[index]!,
  clip: `w-n-${index + 1}`,
  symbol: String(index + 1),
}));

export const ALPHABET: VocabItem[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => ({
  id: `l-${letter.toLowerCase()}`,
  en: letter,
  es: `la letra ${letter}`,
  clip: `w-l-${letter.toLowerCase()}`,
  symbol: letter,
}));

export const VOCAB: Record<string, VocabItem> = Object.fromEntries(
  [...COUNTRIES, ...NUMBERS, ...ALPHABET].map((item) => [item.id, item]),
);

export function vocab(id: string): VocabItem {
  return VOCAB[id] ?? { id, en: id, es: id, clip: id, symbol: id };
}

/** Clip de la letra, para deletrear cualquier nombre. */
export function letterClip(letter: string): string | null {
  const key = `l-${letter.toLowerCase()}`;
  return VOCAB[key] ? VOCAB[key]!.clip : null;
}

/** Número escrito en inglés, para "I am ten years old." */
export function numberWord(value: number): string {
  return NUMBER_WORDS[value - 1] ?? String(value);
}
