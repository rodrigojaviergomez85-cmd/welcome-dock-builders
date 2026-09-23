import { useSyncExternalStore } from "react";

/** Significado de la frase que se está practicando, para el botón "?" de la barra. */
export type PhraseHelp = { en: string; es: string; esClip?: string | undefined } | null;

let current: PhraseHelp = null;
const listeners = new Set<() => void>();

export function setPhraseHelp(help: PhraseHelp) {
  current = help;
  listeners.forEach((l) => l());
}

export function usePhraseHelp(): PhraseHelp {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => null,
  );
}
