/** Datos del jugador que se insertan en las frases de la misión. */
import { fill } from "@/content/glossary";
import { numberWord, vocab } from "@/content/vocabulary";
import type { Profile } from "./progress";

export type MissionVars = {
  alias: string;
  country: string;
  countryEs: string;
  countryClip: string;
  age: string;
  ageEs: string;
  ageClip: string;
};

export function missionVars(profile: Profile | null, alias: string): MissionVars {
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
