import { useEffect, useState } from "react";
import { Pip, type PipMood } from "./Pip";
import { playEvolution, playGrow, playMunch } from "@/lib/feedback-sounds";
import { pipSizeFor, type PipProgress } from "@/lib/progress";

type Props = {
  phrase: string;
  before: PipProgress;
  after: PipProgress;
  feedsToEvolve: number;
  evolved: boolean;
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
        playGrow();
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

  const logicalSize = pipSizeFor(phase === "evolve" ? after : before);
  const viewportSize = `min(60vh, ${Math.max(280, logicalSize * 2.5)}px)`;
  const fill = feedsToEvolve > 0 ? Math.min(100, (after.feeds / feedsToEvolve) * 100) : 100;

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

      <div
        className={`relative flex items-center justify-center ${
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
        style={{ width: viewportSize, height: viewportSize }}
      >
        <Pip
          mood={mouth}
          color={after.color}
          accessories={phase === "evolve" ? after.accessories : before.accessories}
          className="size-full max-h-full max-w-full"
        />
        {phase === "eat"
          ? SPARKS.map((_, index) => (
              <i key={index} className={`pip-spark pip-spark-${index + 1}`} aria-hidden />
            ))
          : null}
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
            {phase === "evolve" ? "¡Pip evolucionó!" : "¡Pip creció!"}
          </p>
          {phase === "evolve" ? <p className="mt-1 text-lg">{rewardLabel}</p> : null}
          <div className="mx-auto mt-3 h-3 w-48 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full animate-pip-meter rounded-full bg-success"
              style={{ width: `${fill}%` }}
            />
          </div>
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
