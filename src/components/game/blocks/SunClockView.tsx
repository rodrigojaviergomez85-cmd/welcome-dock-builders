import { ArrowRight } from "lucide-react";
import type { SunClockBlock } from "@/content/missions/types";
import { TIME_LABEL_ES } from "@/content/backgrounds";

type Props = {
  block: SunClockBlock;
  onFinish: () => void;
};

/** Vista provisional: se reemplaza en una entrega siguiente. */
export function SunClockView({ block, onFinish }: Props) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl bg-card/95 px-5 py-6 text-center text-card-foreground shadow-[var(--shadow-soft)]">
      <p className="font-display text-2xl">El reloj del sol</p>
      <ul className="flex flex-col gap-1">
        {block.stops.map((stop) => (
          <li key={stop.time} lang="en" className="font-display text-lg">
            {stop.line.en}{" "}
            <span className="text-sm text-muted-foreground">({TIME_LABEL_ES[stop.time]})</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onFinish}
        className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
      >
        Continuar <ArrowRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
