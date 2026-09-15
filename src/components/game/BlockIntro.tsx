import { ArrowRight } from "lucide-react";
import { AudioButton } from "./AudioButton";
import { CharacterFigure } from "./CharacterFigure";
import { BLOCK_INTROS } from "@/content/glossary";

type Props = {
  blockId: string;
  onStart: () => void;
};

/** Explicación corta en español, con voz, antes de cada parte de la misión. */
export function BlockIntro({ blockId, onStart }: Props) {
  const intro = BLOCK_INTROS[blockId];
  if (!intro) {
    onStart();
    return null;
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-3">
        <CharacterFigure id="luna" size="lg" />
        <div className="animate-pop max-w-md rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-[var(--shadow-soft)]">
          <p className="font-display text-xl leading-snug sm:text-2xl">{intro.es}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <AudioButton clipId={intro.clip} autoPlayKey={intro.clip} label="Escuchar" size="sm" />
        <button
          type="button"
          onClick={onStart}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          Empezar <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    </div>
  );
}
