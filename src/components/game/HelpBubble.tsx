import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { usePhraseHelp } from "@/lib/help-context";
import { playClip } from "@/lib/audio";

type Props = {
  text: string;
  onUsed?: (() => void) | undefined;
};

/** Ayuda breve en español. Cada apertura se registra como ayuda usada. */
export function HelpBubble({ text, onUsed }: Props) {
  const [open, setOpen] = useState(false);
  const phrase = usePhraseHelp();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (!v) {
              onUsed?.();
              if (phrase?.esClip) void playClip(phrase.esClip);
            }
            return !v;
          });
        }}
        aria-expanded={open}
        aria-label="Ayuda"
        className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 font-display text-secondary-foreground shadow-[var(--shadow-soft)]"
      >
        <HelpCircle className="size-6" aria-hidden />
        <span className="hidden sm:inline">Ayuda</span>
      </button>
      {open ? (
        <p className="animate-pop absolute right-0 z-20 mt-2 w-64 rounded-2xl bg-card p-4 text-sm text-card-foreground shadow-[var(--shadow-soft)]">
          {phrase ? (
            <span className="mb-2 block">
              <span lang="en" className="block font-display text-lg">
                {phrase.en}
              </span>
              <span className="block font-display text-base text-primary">= {phrase.es}</span>
            </span>
          ) : null}
          {text}
        </p>
      ) : null}
    </div>
  );
}
