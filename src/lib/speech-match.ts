/**
 * Compara lo que dijo el niño con la frase modelo.
 * Reglas propias, sin modelo de lenguaje: instantáneo, gratis y predecible.
 * Nunca puntúa la pronunciación: solo dice "te escuché" o "probemos otra vez".
 */

export type MatchResult =
  | { kind: "heard"; heardText: string }
  | { kind: "partial"; heardText: string; missing: string[] }
  | { kind: "unclear"; heardText: string };

const FILLERS = new Set(["um", "uh", "eh", "em", "ah", "mm", "hmm", "er", "este"]);

const CONTRACTIONS: [RegExp, string][] = [
  [/\bi'm\b/g, "i am"],
  [/\bim\b/g, "i am"],
  [/\bname's\b/g, "name is"],
  [/\bwhat's\b/g, "what is"],
  [/\byou're\b/g, "you are"],
  [/\bit's\b/g, "it is"],
  [/\bdon't\b/g, "do not"],
  [/\bhi\b/g, "hello"],
  [/\bhey\b/g, "hello"],
];

export function normalize(text: string): string {
  let out = text.toLowerCase();
  out = out.replace(/[^a-záéíóúñü'\s]/gi, " ");
  for (const [pattern, replacement] of CONTRACTIONS) out = out.replace(pattern, replacement);
  const words = out
    .split(/\s+/)
    .map((w) => w.replace(/'/g, ""))
    .filter((w) => w.length > 0 && !FILLERS.has(w));
  return words.join(" ");
}

/** Palabras del modelo que se piden, quitando el nombre (cualquier nombre vale). */
function requiredWords(targetEn: string, alias: string): string[] {
  const aliasWords = new Set(normalize(alias).split(" ").filter(Boolean));
  return normalize(targetEn)
    .split(" ")
    .filter((w) => w.length > 0 && !aliasWords.has(w));
}

/** Palabras "de nombre": si el niño dijo "I am Sofía" también cuenta como "my name is". */
function saidNameAnotherWay(said: string[]): boolean {
  const text = said.join(" ");
  const iAm = text.match(/\bi am\s+([a-záéíóúñü]+)/);
  if (iAm && !["fine", "good", "ok", "okay", "happy", "sad"].includes(iAm[1]!)) return true;
  return /\bname\b/.test(text);
}

const NAME_PHRASE = new Set(["my", "name", "is"]);

export function matchSpeech(transcript: string, targetEn: string, alias: string): MatchResult {
  const heardText = transcript.trim();
  const said = normalize(transcript).split(" ").filter(Boolean);
  if (said.length === 0) return { kind: "unclear", heardText };

  const required = requiredWords(targetEn, alias);
  if (required.length === 0) return { kind: "heard", heardText };

  const pool = [...said];
  const missing: string[] = [];
  const nameShortcut = saidNameAnotherWay(said);

  for (const word of required) {
    const at = pool.indexOf(word);
    if (at >= 0) {
      pool.splice(at, 1);
      continue;
    }
    if (nameShortcut && NAME_PHRASE.has(word)) continue;
    missing.push(word);
  }

  const matched = required.length - missing.length;
  const coverage = matched / required.length;

  if (coverage >= 0.6) return { kind: "heard", heardText };
  if (matched > 0) return { kind: "partial", heardText, missing };
  return { kind: "unclear", heardText };
}
