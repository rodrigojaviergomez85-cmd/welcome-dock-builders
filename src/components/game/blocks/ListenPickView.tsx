import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AudioButton } from "../AudioButton";
import { CharacterFigure } from "../CharacterFigure";
import { BilingualLine } from "../BilingualLine";
import { TIME_LABEL_ES } from "@/content/backgrounds";
import { gloss } from "@/content/glossary";
import type { CharacterId } from "@/content/characters";
import type { ListenPickBlock } from "@/content/missions/types";
import { playSuccess, playTryAgain } from "@/lib/feedback-sounds";

type Props = {
  block: ListenPickBlock;
  onComprehension: (correct: boolean) => void;
  onRoundChange: (index: number) => void;
  startIndex?: number;
  onFinish: () => void;
};

export function ListenPickView({
  block,
  onComprehension,
  onRoundChange,
  startIndex = 0,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(Math.min(startIndex, block.rounds.length - 1));
  const [picked, setPicked] = useState<CharacterId | null>(null);
  const round = block.rounds[index]!;
  const solved = picked === round.answer;
  const meaning = gloss(round.en)?.es;

  function pick(id: CharacterId) {
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

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-card/95 px-6 py-5 shadow-[var(--shadow-soft)]">
        <span className="rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground">
          {TIME_LABEL_ES[round.time]} · Ronda {index + 1} de {block.rounds.length}
        </span>
        <p className="text-sm text-muted-foreground">¿Quién se presentó?</p>
        <AudioButton clipId={round.clip} autoPlayKey={round.id} label="Escuchar" />
        {solved ? <BilingualLine en={round.en} clip={round.clip} /> : null}
      </div>

      <div className="flex w-full flex-wrap items-end justify-center gap-2 sm:gap-6">
        {round.options.map((id) => (
          <CharacterFigure
            key={id}
            id={id}
            size="md"
            showName
            onClick={() => pick(id)}
            state={
              picked === id ? (id === round.answer ? "correct" : "wrong") : solved ? "dim" : "idle"
            }
          />
        ))}
      </div>

      {solved ? (
        <button
          type="button"
          onClick={next}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          Seguir <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : picked ? (
        <div className="max-w-md rounded-2xl bg-card/95 px-4 py-3 text-center text-sm text-muted-foreground">
          <p>
            Escuchaste: <span lang="en">“{round.en}”</span>
            {meaning ? ` — significa “${meaning}”.` : "."}
          </p>
          <p className="mt-1">Escuchá otra vez y probá de nuevo.</p>
        </div>
      ) : null}
    </div>
  );
}
