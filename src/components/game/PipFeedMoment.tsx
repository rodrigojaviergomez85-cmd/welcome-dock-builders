import { useEffect, useState } from "react";
import { Pip, type PipMood } from "./Pip";
import { playEvolution, playMunch, playTick } from "@/lib/feedback-sounds";
import { type PipDay, pipSizeFor, type PipProgress } from "@/lib/progress";
import { CharacterFigure } from "./CharacterFigure";
import { PipRuler } from "./PipRuler";
import { BACKGROUNDS } from "@/content/backgrounds";

type Props = {
  phrase: string;
  before: PipProgress;
  after: PipProgress;
  feedsToEvolve: number;
  evolved: boolean;
  day: PipDay;
  rewardLabel: string;
  onClose: () => void;
};

const SPARKS = Array.from({ length: 6 });
const CONFETTI = Array.from({ length: 12 });

export function PipFeedMoment({
  phrase,
  before,
  after,
  feedsToEvolve,
  evolved,
  day,
  rewardLabel,
  onClose,
}: Props) {
  const [phase, setPhase] = useState<"enter" | "cookie" | "eat" | "grow" | "evolve">("enter");
  const [mouth, setMouth] = useState<PipMood>("happy");
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase("cookie"), 400),
      window.setTimeout(() => {
        setPhase("eat");
        setMouth("eat");
        playMunch();
      }, 1000),
      window.setTimeout(() => setMouth("happy"), 1120),
      window.setTimeout(() => {
        setMouth("eat");
        playMunch();
      }, 1240),
      window.setTimeout(() => setMouth("happy"), 1360),
      window.setTimeout(() => {
        setPhase("grow");
        playTick();
      }, 1500),
      window.setTimeout(() => setCanSkip(true), 1000),
    ];
    if (evolved) {
      timers.push(
        window.setTimeout(() => {
          setPhase("evolve");
          playEvolution();
        }, 2200),
      );
    } else {
      timers.push(window.setTimeout(onClose, 2200));
    }
    return () => timers.forEach(window.clearTimeout);
  }, [evolved, onClose]);

  const shownPip = phase === "evolve" ? after : before;
  const logicalSize = Math.round(pipSizeFor(shownPip) * 1.08);
  const stageChanged = after.stage > before.stage;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-foreground/55 px-4 text-center"
      role="dialog"
      aria-label={evolved ? "Pip evolucionó" : "Pip creció"}
      onClick={() => {
        if (canSkip && !evolved) onClose();
      }}
    >
      {phase === "evolve" ? <div className="pip-evolution-flash" aria-hidden /> : null}
      {phase === "evolve"
        ? CONFETTI.map((_, index) => (
            <i
              key={index}
              className={`pip-moment-confetti pip-moment-confetti-${(index % 4) + 1}`}
            />
          ))
        : null}

      <img
        src={BACKGROUNDS.afternoon}
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover opacity-50"
        aria-hidden
      />
      <div className="relative flex h-[60vh] w-full max-w-5xl items-end justify-center gap-3 sm:gap-8">
        <div className="relative flex h-full min-w-0 flex-1 items-end justify-end">
          <CharacterFigure id="leo" className="[&_img]:h-[340px] [&_img]:max-h-[55vh]" />
        </div>
        <div
          className={`relative flex shrink-0 items-end justify-center ${
            phase === "enter"
              ? "animate-pip-enter"
              : phase === "eat"
                ? "animate-pip-chew"
                : phase === "grow"
                  ? "animate-pip-grow"
                  : phase === "evolve"
                    ? "animate-pip-evolve"
                    : ""
          }`}
          style={{ width: logicalSize, height: logicalSize }}
        >
          {phase === "evolve" && stageChanged ? (
            <Pip
              mood="happy"
              color="var(--color-muted-foreground)"
              stage={before.stage}
              feeds={before.feeds}
              size={pipSizeFor(before)}
              className="pip-before-silhouette absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 grayscale"
            />
          ) : null}
          <Pip
            mood={mouth}
            color={after.color}
            stage={shownPip.stage}
            feeds={shownPip.feeds}
            accessories={phase === "evolve" ? after.accessories : before.accessories}
            className="size-full max-h-full max-w-full"
          />
          {phase === "eat"
            ? SPARKS.map((_, index) => (
                <i key={index} className={`pip-spark pip-spark-${index + 1}`} aria-hidden />
              ))
            : null}
        </div>
        <div className="flex h-full min-w-0 flex-1 items-end justify-start">
          <PipRuler
            marks={after.marks}
            currentDay={day}
            feeds={after.feeds}
            total={feedsToEvolve}
            height="60vh"
            animate={phase === "grow"}
          />
        </div>
      </div>

      {phase === "cookie" ? (
        <div
          lang="en"
          className="pip-phrase-cookie max-w-[80vw] rounded-full bg-sun px-6 py-4 font-display text-2xl text-sun-foreground shadow-[var(--shadow-pop)]"
        >
          {phrase}
        </div>
      ) : null}

      {phase === "grow" || phase === "evolve" ? (
        <div className="animate-pop rounded-3xl bg-card/95 px-6 py-4 text-card-foreground shadow-[var(--shadow-soft)]">
          <p className="font-display text-3xl sm:text-4xl">
            {phase === "evolve" ? "¡Pip evolucionó!" : "¡Ñam! Una rayita más"}
          </p>
          {phase === "evolve" ? <p className="mt-1 text-lg">{rewardLabel}</p> : null}
          <p className="mt-1 font-display text-lg">
            {after.feeds} / {feedsToEvolve}
          </p>
          {phase === "evolve" ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onClose();
              }}
              className="tap-target mt-3 rounded-full bg-primary px-8 font-display text-xl text-primary-foreground shadow-[var(--shadow-pop)]"
            >
              ¡Genial!
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
