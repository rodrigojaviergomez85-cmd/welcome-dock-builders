import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { PickProfileBlock } from "@/content/missions/types";
import { BAGS } from "@/content/characters";
import { vocab } from "@/content/vocabulary";
import { playSuccess } from "@/lib/feedback-sounds";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText, resolveClip } from "@/lib/mission-vars";
import { playClip, playThenPause, stopClip } from "@/lib/audio";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { cn } from "@/lib/utils";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: PickProfileBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onFinish: () => void;
  onReward?: () => void;
  /** 0 elegir · 1 responder · 2 sticker listo (cambio de rol) · 3 todo hecho. */
  startIndex?: number;
  onStepChange?: (value: number) => void;
};

type Step = "pick" | "ask" | "say" | "sticker" | "swap" | "answer";

/** El jugador elige su país o su edad; queda guardado y después lo dice en inglés. */
export function PickProfileView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onFinish,
  onReward,
  startIndex = 0,
  onStepChange,
}: Props) {
  const { state, update } = useProgress();
  const initial: Step =
    startIndex >= 2 ? (block.swap ? "swap" : "sticker") : startIndex === 1 ? "say" : "pick";
  const [step, setStep] = useState<Step>(initial);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const mountedRef = useRef(true);
  const resumedAt = useRef(startIndex).current;

  useEffect(() => {
    mountedRef.current = true;
    if (startIndex >= 3 || (startIndex >= 2 && !block.swap)) {
      finishRef.current();
      return;
    }
    if (startIndex === 0 && block.introClip) void playClip(block.introClip);
    return () => {
      mountedRef.current = false;
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Leo pregunta y recién al terminar se abre el micrófono.
  useEffect(() => {
    if (step !== "ask" || !block.ask) return;
    let active = true;
    void (async () => {
      await playThenPause(block.ask!.clip, 300);
      if (active) setStep("say");
    })();
    return () => {
      active = false;
    };
  }, [step, block.ask]);

  // Sticker: la bandera se pega en la mochila y después cambia el rol.
  useEffect(() => {
    if (step !== "sticker") return;
    const t = window.setTimeout(() => {
      if (block.swap) setStep("swap");
      else finishRef.current();
    }, 1600);
    return () => window.clearTimeout(t);
  }, [step, block.swap]);

  function choose(id: string) {
    playSuccess();
    stopClip();
    update((prev) => {
      if (!prev.profile) return prev;
      const profile =
        block.field === "country"
          ? { ...prev.profile, countryId: id }
          : { ...prev.profile, age: Number(id.replace("n-", "")) };
      return { ...prev, profile };
    });
    onStepChange?.(1);
    setStep(block.ask ? "ask" : "say");
  }

  const vars = missionVars(state.profile, alias);
  const chosenId = block.field === "country" ? state.profile?.countryId : undefined;
  const flag = chosenId ? vocab(chosenId).symbol : null;
  const asker = block.asker ?? block.ask?.speaker;

  if (step === "pick") {
    return (
      <div className="flex w-full max-w-3xl flex-col items-center gap-4">
        <div className="rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p className="font-display text-2xl">{block.promptEs}</p>
        </div>
        <div
          className={cn(
            "grid w-full gap-3",
            block.field === "age" ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {block.options.map((id) => {
            const item = vocab(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                className="tap-target flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl bg-card/95 p-3 text-card-foreground shadow-[var(--shadow-soft)] active:translate-y-1"
              >
                <span className="font-display text-5xl" aria-hidden>
                  {item.symbol}
                </span>
                <span className="text-sm text-muted-foreground">{item.es}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const backpack = block.sticker ? (
    <div className="relative">
      <img src={BAGS.green.image} alt="Tu mochila" className="h-24 w-auto sm:h-28" />
      <span className="absolute inset-x-2 top-9 truncate rounded bg-card px-1 text-center font-display text-[10px] text-card-foreground">
        {alias}
      </span>
      {step !== "ask" && step !== "say" && flag ? (
        <span
          className={cn(
            "absolute -right-2 bottom-2 rounded-lg bg-card px-1 text-3xl shadow-[var(--shadow-soft)]",
            step === "sticker" && resumedAt < 2 && "animate-[sticker-slap_0.8s_ease-out_both]",
          )}
          aria-label="Tu bandera en la mochila"
        >
          {flag}
        </span>
      ) : null}
    </div>
  ) : null;

  const swap = block.swap;
  const swapTarget = swap ? fillText(swap.record.targetEn, vars) : "";

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <div className="flex w-full items-end justify-center gap-4">
        {step === "swap" || step === "answer" ? (
          swap ? (
            <CharacterFigure id={swap.answer.speaker} size="md" showName />
          ) : null
        ) : asker ? (
          <CharacterFigure id={asker} size="md" showName />
        ) : null}
        {backpack}
      </div>

      {chosenId && (step === "ask" || step === "say") ? (
        <p className="flex items-center gap-2 rounded-full bg-success/20 px-4 py-2 font-display text-success">
          <Check className="size-5" aria-hidden /> {vocab(chosenId).es}
        </p>
      ) : null}

      {step === "ask" && block.ask ? (
        <div className="animate-pop rounded-3xl bg-card/95 px-5 py-3 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-3xl">
            {block.ask.en}
          </p>
          <AudioButton clipId={block.ask.clip} label="Escuchar" className="mt-2" />
        </div>
      ) : null}

      {step === "say" ? (
        <RecordTurn
          key={block.say.id ?? block.id}
          missionId={missionId}
          turnId={block.say.id ?? block.id}
          {...(block.say.mode ? { mode: block.say.mode } : {})}
          role={block.say.role}
          promptEs={block.say.promptEs}
          targetEn={fillText(block.say.targetEn, vars)}
          alias={alias}
          modelClip={resolveClip(block.say.modelClip, vars)}
          {...(asker ? { cheerBy: asker } : {})}
          support="full"
          onHelpUsed={onHelpUsed}
          onDone={(status) => {
            onStepChange?.(2);
            onOral(status, fillText(block.say.targetEn, vars), () => {
              onReward?.();
              if (block.sticker) setStep("sticker");
              else if (swap) setStep("swap");
              else finishRef.current();
            });
          }}
        />
      ) : null}

      {step === "sticker" ? (
        <p className="animate-pop rounded-full bg-success px-5 py-2 font-display text-xl text-success-foreground">
          ¡Tu bandera en la mochila!
        </p>
      ) : null}

      {step === "swap" && swap ? (
        <RecordTurn
          key={swap.record.id}
          missionId={missionId}
          turnId={swap.record.id}
          {...(swap.record.mode ? { mode: swap.record.mode } : {})}
          role={swap.record.role}
          promptEs={swap.record.promptEs}
          targetEn={swapTarget}
          alias={alias}
          modelClip={resolveClip(swap.record.modelClip, vars)}
          promptClip={swap.record.promptClip}
          askSequenceClip={swap.record.askSequenceClip}
          confusedWith={swap.record.confusedWith ? fillText(swap.record.confusedWith, vars) : undefined}
          cheerBy={swap.answer.speaker}
          support="reduced"
          onHelpUsed={onHelpUsed}
          onDone={(status) => {
            onStepChange?.(3);
            onOral(status, swapTarget, () => setStep("answer"));
          }}
        />
      ) : null}

      {step === "answer" && swap ? (
        <AnswerLine
          line={swap.answer}
          onDone={() => {
            if (mountedRef.current) finishRef.current();
          }}
        />
      ) : null}
    </div>
  );
}

/** El personaje responde; el bloque termina cuando su clip termina. */
function AnswerLine({
  line,
  onDone,
}: {
  line: NonNullable<PickProfileBlock["swap"]>["answer"];
  onDone: () => void;
}) {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    void (async () => {
      await playThenPause(line.clip, 600);
      doneRef.current();
    })();
  }, [line.clip]);
  return (
    <div className="animate-pop rounded-3xl bg-card/95 px-5 py-3 text-center text-card-foreground shadow-[var(--shadow-soft)]">
      <p lang="en" className="font-display text-3xl">
        {line.en}
      </p>
      {line.es ? <p className="text-sm text-muted-foreground">{line.es}</p> : null}
    </div>
  );
}
