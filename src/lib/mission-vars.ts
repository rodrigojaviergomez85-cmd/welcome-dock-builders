/** Datos del jugador que se insertan en las frases de la misión. */
import { fill } from "@/content/glossary";
import { numberWord, vocab } from "@/content/vocabulary";
import type { Profile } from "./progress";
import type { TimeOfDay } from "@/content/missions/types";

/** Hora local del dispositivo: 05–11 morning · 12–17 afternoon · 18–20 evening · 21–04 night. */
export function autoTimeOfDay(now: Date = new Date()): TimeOfDay {
  const h = now.getHours();
  if (h >= 5 && h <= 11) return "morning";
  if (h >= 12 && h <= 17) return "afternoon";
  if (h >= 18 && h <= 20) return "evening";
  return "night";
}

/** Resuelve time: "auto" con la hora real. */
export function resolveTime(time: TimeOfDay | "auto"): TimeOfDay {
  return time === "auto" ? autoTimeOfDay() : time;
}

export const GREETING_EN: Record<TimeOfDay, string> = {
  morning: "Good morning!",
  afternoon: "Good afternoon!",
  evening: "Good evening!",
  night: "Good night!",
};

export const GREETING_CLIP: Record<TimeOfDay, string> = {
  morning: "good-morning",
  afternoon: "good-afternoon",
  evening: "good-evening",
  night: "good-night",
};

export type MissionVars = {
  alias: string;
  country: string;
  countryEs: string;
  countryClip: string;
  age: string;
  ageEs: string;
  ageClip: string;
  greeting: string;
  greetingClip: string;
};

export function missionVars(
  profile: Profile | null,
  alias: string,
  time: TimeOfDay | "auto" = "auto",
): MissionVars {
  const resolved = resolveTime(time);
  const countryId = profile?.countryId ?? "c-el-salvador";
  const country = vocab(countryId);
  const age = profile?.age ?? 10;
  return {
    alias,
    country: country.en,
    countryEs: country.es,
    countryClip: country.clip,
    age: numberWord(age),
    ageEs: String(age),
    ageClip: `w-n-${age}`,
    greeting: GREETING_EN[resolved],
    greetingClip: GREETING_CLIP[resolved],
  };
}

export function fillText(text: string, vars: MissionVars): string {
  return fill(text, { ...vars });
}

/** Cambia {countryClip} y {ageClip} por el clip real del país o la edad. */
export function resolveClip(clip: string | string[], vars: MissionVars): string | string[] {
  const one = (c: string) => fill(c, { ...vars });
  return Array.isArray(clip) ? clip.map(one) : one(clip);
}
