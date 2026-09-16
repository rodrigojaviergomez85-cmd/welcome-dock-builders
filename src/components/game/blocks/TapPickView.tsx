import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { AudioButton } from "../AudioButton";
import { CharacterFigure } from "../CharacterFigure";
import type { TapPickBlock } from "@/content/missions/types";
import { vocab } from "@/content/vocabulary";
import { playSuccess, playTryAgain } from "@/lib/feedback-sounds";
import { cn } from "@/lib/utils";

type Props = {
  block: TapPickBlock;
  startIndex?: number;
  onComprehension: (correct: boolean) => void;
  onRoundChange: (index: number) => void;
  onFinish: () => void;
};

/** Escuchar en inglés y tocar la opción correcta: banderas, números, letras o nombres. */
export function TapPickView({
  block,
  startIndex = 0,
  onComprehension,
  onRoundChange,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(Math.min(startIndex, block.rounds.length - 1));
  const [picked, setPicked] = useState<string | null>(null);
  const round = block.rounds[index]!;
  const solved = picked === round.answer;

  function pick(id: string) {
    if (solved) return;
    setPicked(id);
    if (id === round.answer) playSuccess();
    else playTryAgain();
    onComprehension(id === round.answer);
  }

  function next() {
    if (index + 1 >= block.rounds.length) {
      onFinish();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setPicked(null);
    onRoundChange(nextIndex);
  }

  const bigSymbol = block.style === "number" || block.style === "letter";

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex w-full flex-col items-center gap-3 rounded-3xl bg-card/95 px-5 py-4 text-card-foreground shadow-[var(--shadow-soft)]">
        <span className="rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground">
          {index + 1} de {block.rounds.length}
        </span>
        <p className="font-display text-xl">{block.promptEs}</p>
        <div className="flex items-end gap-2">
          {round.speaker ? <CharacterFigure id={round.speaker} size="md" /> : null}
          <AudioButton clipId={round.clip} autoPlayKey={`${block.id}-${round.id}`} label="Escuchar" />
        </div>
        {solved ? (
          <div className="animate-pop rounded-2xl bg-success/15 px-4 py-3 text-center">
            <p lang="en" className="font-display text-2xl">
              {round.en}
            </p>
            {round.es ? <p className="text-sm text-muted-foreground">{round.es}</p> : null}
          </div>
        ) : null}
      </div>

      <div
        className={cn(
          "grid w-full gap-3",
          bigSymbol ? "grid-cols-4" : "grid-cols-2",
        )}
      >
        {round.options.map((id) => {
          const item = vocab(id);
          const isAnswer = id === round.answer;
          const isPicked = picked === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => pick(id)}
              disabled={solved}
              className={cn(
                "tap-target flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl bg-card/95 p-3 text-card-foreground shadow-[var(--shadow-soft)] transition-transform active:translate-y-1",
                isPicked && isAnswer && "ring-4 ring-success",
                isPicked && !isAnswer && "opacity-70 ring-4 ring-destructive",
                solved && !isAnswer && "opacity-40",
              )}
            >
              <span className={bigSymbol ? "font-display text-4xl" : "text-4xl"} aria-hidden>
                {block.style === "word" ? "🧒" : (item.symbol ?? "")}
              </span>
              <span lang="en" className="font-display text-base leading-tight">
                {item.en}
              </span>
              {isPicked && isAnswer ? (
                <Check className="size-5 text-success" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>

      {solved ? (
        <button
          type="button"
          onClick={next}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          {index + 1 < block.rounds.length ? "Seguir" : "Terminar"}{" "}
          <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : picked ? (
        <p className="max-w-md rounded-2xl bg-card/95 px-4 py-3 text-center text-sm text-muted-foreground">
          Casi. Escuchá otra vez y probá de nuevo.
        </p>
      ) : null}
    </div>
  );
}
