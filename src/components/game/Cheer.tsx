import { CharacterFigure } from "./CharacterFigure";
import { playClip } from "@/lib/audio";
import type { CharacterId } from "@/content/characters";

export const CHEERS = [
  { id: "fantastic", en: "Fantastic!" },
  { id: "awesome", en: "Awesome!" },
  { id: "great-job", en: "Great job!" },
  { id: "wonderful", en: "Wonderful!" },
  { id: "super", en: "Super!" },
  { id: "you-did-it", en: "You did it!" },
] as const;

export const ALMOST = { id: "almost", en: "Almost! One more time!" } as const;

export type CheerLine = { id: string; en: string };

let lastCheer = -1;

/** Celebración al azar, nunca igual a la anterior. */
export function pickCheer(): CheerLine {
  let i = Math.floor(Math.random() * CHEERS.length);
  if (i === lastCheer)
    i = (i + 1 + Math.floor(Math.random() * (CHEERS.length - 1))) % CHEERS.length;
  lastCheer = i;
  return CHEERS[i]!;
}

/** Reproduce el clip del personaje y resuelve cuando termina (mínimo `minMs`). */
export async function playCheer(by: CharacterId, line: CheerLine, minMs = 900) {
  const wait = new Promise((r) => setTimeout(r, minMs));
  await Promise.all([playClip(`${by}-cheer-${line.id}`), wait]);
}

export function CheerBubble({ by, line }: { by: CharacterId; line: CheerLine }) {
  return (
    <div className="flex animate-pop items-end justify-center gap-2" role="status">
      <CharacterFigure id={by} size="sm" state="correct" />
      <span
        lang="en"
        className="mb-8 rounded-3xl bg-sun px-5 py-3 font-display text-3xl leading-tight text-foreground shadow-[var(--shadow-pop)] sm:text-4xl"
      >
        {line.en}
      </span>
    </div>
  );
}
