import { Volume2 } from "lucide-react";
import type { PipLearned } from "@/lib/progress";
import { playPipVoice } from "@/lib/pip-voice";

/** Barriga de palabras: frases que Pip ya comió, cada una con la vocecita de Pip. */
export function PipBelly({ learned }: { learned: PipLearned[] }) {
  if (!learned.length) {
    return <p className="mt-3 text-muted-foreground">Hablá para darle su primera frase.</p>;
  }
  return (
    <ul className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto">
      {[...learned].reverse().map((item) => (
        <li key={item.phrase}>
          <button
            type="button"
            onClick={() =>
              void playPipVoice({
                clip: item.clip,
                ...(item.recordingKey ? { recordingKey: item.recordingKey } : {}),
              })
            }
            className="tap-target flex w-full items-center gap-3 rounded-xl bg-muted px-3 text-left font-display text-lg"
          >
            <Volume2 className="size-6 shrink-0 text-primary" aria-hidden />
            <span lang="en">{item.phrase}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
