import { Languages, Turtle } from "lucide-react";
import { AudioButton } from "./AudioButton";
import { playClip } from "@/lib/audio";
import { gloss } from "@/content/glossary";
import { cn } from "@/lib/utils";

type Props = {
  /** Frase en inglés, ya con el alias reemplazado si corresponde. */
  en: string;
  alias?: string;
  /** Clip en inglés del personaje. */
  clip?: string;
  autoPlayKey?: string | number;
  /** Texto en español forzado (si no, se busca en el glosario). */
  es?: string | undefined;
  onHelpUsed?: (() => void) | undefined;
  className?: string;
};

/**
 * Muestra la frase en inglés grande y SIEMPRE su significado en español debajo,
 * con altavoces para escucharla en inglés, en español y lenta.
 */
export function BilingualLine({
  en,
  alias,
  clip,
  autoPlayKey,
  es,
  onHelpUsed,
  className,
}: Props) {
  const g = gloss(en, alias);
  const spanish = es ?? g?.es;

  return (
    <div
      className={cn(
        "animate-pop relative w-full max-w-xl rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <p lang="en" className="font-display text-2xl leading-snug sm:text-3xl">
        {en}
      </p>
      {spanish ? <p className="mt-2 text-base text-muted-foreground">{spanish}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {clip ? (
          <AudioButton
            clipId={clip}
            {...(autoPlayKey === undefined ? {} : { autoPlayKey })}
            label="Escuchar"
            size="sm"
          />
        ) : null}
        {g?.slowClip ? (
          <button
            type="button"
            onClick={() => void playClip(g.slowClip!)}
            className="tap-target inline-flex h-12 items-center gap-2 rounded-full bg-secondary px-4 font-display text-secondary-foreground"
          >
            <Turtle className="size-5" aria-hidden /> Lento
          </button>
        ) : null}
        {g?.esClip ? (
          <button
            type="button"
            onClick={() => {
              onHelpUsed?.();
              void playClip(g.esClip!);
            }}
            className="tap-target inline-flex h-12 items-center gap-2 rounded-full bg-sun/60 px-4 font-display text-foreground"
          >
            <Languages className="size-5" aria-hidden /> ¿Qué significa?
          </button>
        ) : null}
      </div>
    </div>
  );
}
