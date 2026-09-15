import { AudioButton } from "./AudioButton";
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
  showAudio?: boolean;
  className?: string;
};

/**
 * Muestra la frase en inglés y su significado, con una sola acción de audio.
 */
export function BilingualLine({
  en,
  alias,
  clip,
  autoPlayKey,
  es,
  showAudio = true,
  className,
}: Props) {
  const g = gloss(en, alias);
  const spanish = (es ?? g?.es)?.split("{alias}").join(alias ?? "…");

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

      {showAudio && clip ? (
        <div className="mt-3">
          <AudioButton
            clipId={clip}
            {...(autoPlayKey === undefined ? {} : { autoPlayKey })}
            label="Escuchar otra vez"
            size="sm"
          />
        </div>
      ) : null}
    </div>
  );
}
