import { useState } from "react";
import { HelpCircle } from "lucide-react";

type Props = {
  text: string;
  onUsed?: (() => void) | undefined;
};

/** Ayuda breve en español. Cada apertura se registra como ayuda usada. */
export function HelpBubble({ text, onUsed }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => {
            if (!v) onUsed?.();
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
          {text}
        </p>
      ) : null}
    </div>
  );
}
