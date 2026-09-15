import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AudioButton } from "../AudioButton";
import { CharacterFigure } from "../CharacterFigure";
import { SpeechBubble } from "../SpeechBubble";
import type { StoryBlock } from "@/content/missions/types";

type Props = {
  block: StoryBlock;
  alias: string;
  onComprehension: (correct: boolean) => void;
  onFinish: () => void;
};

export function StoryView({ block, alias, onComprehension, onFinish }: Props) {
  const [lineIndex, setLineIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const line = block.lines[lineIndex]!;
  const choosing = lineIndex >= block.lines.length;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex w-full items-end justify-center gap-3">
        <CharacterFigure id={choosing ? "luna" : line.speaker} size="lg" />
        <div className="flex flex-col items-start gap-3 pb-6">
          {choosing ? (
            <SpeechBubble en={block.lines[block.lines.length - 1]!.en} es={block.choice.promptEs} />
          ) : (
            <>
              <SpeechBubble en={line.en} es={line.es} />
              <AudioButton clipId={line.clip} autoPlayKey={line.clip} label="Escuchar" />
            </>
          )}
        </div>
      </div>

      {choosing ? (
        <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 shadow-[var(--shadow-soft)]">
          <AudioButton clipId={block.choice.modelClip} label="Escuchar el modelo" size="sm" />
          <div className="mt-4 grid gap-3">
            {block.choice.options.map((option, i) => {
              const text = option.en.replace("{alias}", alias);
              const isChosen = chosen === i;
              return (
                <button
                  key={option.en}
                  type="button"
                  onClick={() => {
                    if (chosen !== null && block.choice.options[chosen]!.correct) return;
                    setChosen(i);
                    onComprehension(option.correct);
                  }}
                  lang="en"
                  className={`tap-target rounded-2xl px-5 py-4 text-left font-display text-xl shadow-[var(--shadow-soft)] transition-transform active:scale-95 ${
                    isChosen && option.correct
                      ? "bg-success text-success-foreground"
                      : isChosen
                        ? "animate-nudge bg-destructive/15 text-foreground"
                        : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {text}
                </button>
              );
            })}
          </div>
          {chosen !== null && block.choice.options[chosen]!.correct ? (
            <button
              type="button"
              onClick={onFinish}
              className="tap-target mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
            >
              Seguir <ArrowRight className="size-5" aria-hidden />
            </button>
          ) : null}
          {chosen !== null && !block.choice.options[chosen]!.correct ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Probá otra vez. Podés escuchar el modelo las veces que quieras.
            </p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setLineIndex((i) => i + 1)}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          Seguir <ArrowRight className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}
