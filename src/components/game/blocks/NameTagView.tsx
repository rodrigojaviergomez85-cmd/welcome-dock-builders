import { useEffect, useState } from "react";
import type { NameTagBlock } from "@/content/missions/types";
import { AudioButton } from "../AudioButton";
import { CharacterFigure } from "../CharacterFigure";
import { RecordTurn } from "../RecordTurn";
import { playClip, stopClip } from "@/lib/audio";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: NameTagBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onReward: () => void;
  onFinish: () => void;
  /** 1 = la etiqueta ya se imprimió. */
  startIndex?: number;
  onStepChange?: (value: number) => void;
};

type Step = "ask" | "name" | "printed" | "swap" | "answer";

export function NameTagView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onReward,
  onFinish,
  startIndex = 0,
  onStepChange,
}: Props) {
  const alreadyPrinted = startIndex >= 1;
  const [step, setStep] = useState<Step>(alreadyPrinted ? (block.swap ? "swap" : "printed") : "ask");
  const swap = block.swap;
  const askClips = block.ask.map((line) => line.clip);

  useEffect(() => {
    if (alreadyPrinted) {
      // La etiqueta ya estaba impresa: no se vuelve a pedir.
      if (!swap) window.setTimeout(onFinish, 600);
      return;
    }
    let active = true;
    void (async () => {
      await playClip(block.introClip);
      if (!active) return;
      await playClip(askClips);
      if (active) setStep("name");
    })();
    return () => {
      active = false;
      stopClip();
    };
    // La secuencia se reproduce una sola vez al entrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function printTag(status: "heard" | "practiced" | "pending") {
    onOral(status, block.record.targetEn.split("{alias}").join(alias), () => {
      onReward();
      onStepChange?.(1);
      setStep("printed");
      void playClip(block.printed.clip);
      window.setTimeout(() => (swap ? setStep("swap") : onFinish()), 1900);
    });
  }

  function answer(status: "heard" | "practiced" | "pending") {
    if (!swap) return;
    onOral(status, swap.record.targetEn, () => {
      setStep("answer");
      void playClip(swap.answer.clip);
      window.setTimeout(onFinish, 2200);
    });
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <div className="flex w-full items-end justify-between gap-3 px-2">
        <CharacterFigure id={block.asker} size="md" showName />
        <div className="relative flex h-44 w-44 shrink-0 flex-col items-center rounded-2xl border-4 border-primary bg-secondary p-3 shadow-[var(--shadow-soft)] sm:h-52 sm:w-56">
          <span className="font-display text-lg text-secondary-foreground">Boti Tags</span>
          <div className="mt-4 h-3 w-28 rounded-full bg-foreground/70" />
          <div
            className={`mt-1 flex h-16 w-32 items-center justify-center rounded-lg border-2 border-dashed border-primary bg-card px-2 shadow-[var(--shadow-soft)] ${step === "printed" || step === "swap" || step === "answer" ? "animate-tag-print" : "opacity-55"}`}
          >
            <span className="max-w-full truncate font-display text-2xl text-card-foreground">
              {step === "printed" || step === "swap" || step === "answer" ? alias : "······"}
            </span>
          </div>
        </div>
      </div>

      {step === "ask" ? (
        <div className="rounded-3xl bg-card/95 p-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-2xl">
            {block.ask.map((line) => line.en).join(" ")}
          </p>
          <AudioButton clipId={askClips} label="Escuchar a Leo" className="mt-3" />
        </div>
      ) : null}

      {step === "name" ? (
        <>
          <RecordTurn
            missionId={missionId}
            turnId={block.record.id}
            {...(block.record.mode ? { mode: block.record.mode } : {})}
            role={block.record.role}
            promptEs={block.record.promptEs}
            targetEn={block.record.targetEn.split("{alias}").join(alias)}
            alias={alias}
            modelClip={block.record.modelClip}
            cheerBy="leo"
            support="full"
            onHelpUsed={onHelpUsed}
            onDone={printTag}
          />
        </>
      ) : null}

      {step === "printed" ? (
        <div className="animate-pop rounded-3xl bg-success px-6 py-4 text-center text-success-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-2xl">
            {block.printed.en}
          </p>
          <p>{block.printed.es}</p>
        </div>
      ) : null}

      {step === "swap" && swap ? (
        <>
          <div className="flex items-end gap-2">
            <CharacterFigure id={swap.answer.speaker} size="md" />
            <span className="mb-6 rounded-3xl bg-card px-5 py-2 font-display text-3xl text-card-foreground shadow-[var(--shadow-soft)]">
              …
            </span>
          </div>
          <RecordTurn
            missionId={missionId}
            turnId={swap.record.id}
            {...(swap.record.mode ? { mode: swap.record.mode } : {})}
            role={swap.record.role}
            promptEs={swap.record.promptEs}
            targetEn={swap.record.targetEn}
            alias={alias}
            modelClip={swap.record.modelClip}
            promptClip={swap.record.promptClip}
            askSequenceClip={swap.record.askSequenceClip}
            confusedWith={swap.record.confusedWith}
            cheerBy={swap.answer.speaker}
            support="reduced"
            onHelpUsed={onHelpUsed}
            onDone={answer}
          />
        </>
      ) : null}

      {step === "answer" && swap ? (
        <div className="flex animate-pop flex-col items-center gap-2">
          <CharacterFigure id={swap.answer.speaker} size="md" showName />
          <div className="rounded-3xl bg-card/95 px-6 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
            <p lang="en" className="font-display text-2xl">
              {swap.answer.en}
            </p>
            <p className="text-muted-foreground">{swap.answer.es}</p>
            <AudioButton clipId={swap.answer.clip} label="Escuchar a Mia" className="mt-3" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
