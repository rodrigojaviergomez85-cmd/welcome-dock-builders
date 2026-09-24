import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Pip } from "./Pip";
import { PIP_HOMES } from "./PipHome";
import { playEvolution, playFanfare } from "@/lib/feedback-sounds";
import type { PipProgress } from "@/lib/progress";

type Props = { from: number; to: number; pip: PipProgress; onContinue: () => void };

const CONFETTI = Array.from({ length: 12 });

/** Mudanza de Pip: la casa vieja se va, llega la nueva con destello y Pip entra (3 s). */
export function PipMoveScene({ from, to, pip, onContinue }: Props) {
  const [phase, setPhase] = useState<"old" | "new" | "enter" | "done">("old");

  useEffect(() => {
    const timers = [
      window.setTimeout(() => {
        setPhase("new");
        playEvolution();
      }, 900),
      window.setTimeout(() => setPhase("enter"), 1800),
      window.setTimeout(() => {
        setPhase("done");
        playFanfare();
      }, 3000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const showNew = phase !== "old";
  return (
    <div
      role="dialog"
      aria-label="Pip se muda a su casa nueva"
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden bg-background p-6 text-center"
    >
      {phase === "new" ? <div className="pip-evolution-flash" aria-hidden /> : null}
      {showNew
        ? CONFETTI.map((_, index) => (
            <i
              key={index}
              className={`pip-moment-confetti pip-moment-confetti-${(index % 4) + 1}`}
            />
          ))
        : null}
      <h1 className="font-display text-4xl">¡Pip tiene casa nueva!</h1>
      <div className="relative aspect-square w-[min(80vw,420px)]">
        <img
          src={PIP_HOMES[Math.min(4, from)]}
          alt=""
          className={`absolute inset-0 size-full transition-opacity duration-700 ${showNew ? "opacity-0" : "opacity-100"}`}
        />
        <img
          src={PIP_HOMES[Math.min(4, to)]}
          alt="La casa nueva de Pip"
          className={`absolute inset-0 size-full transition-all duration-700 ${showNew ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}
        />
        <div
          className={`absolute bottom-[4%] transition-all duration-1000 ease-in-out ${
            phase === "enter" || phase === "done"
              ? "left-1/2 -translate-x-1/2 scale-75 opacity-70"
              : "left-[-30%] opacity-100"
          }`}
        >
          <Pip
            mood="happy"
            color={pip.color}
            stage={pip.stage}
            feeds={pip.feeds}
            accessories={pip.accessories}
            size={120}
          />
        </div>
      </div>
      {phase === "done" ? (
        <div className="flex animate-pop flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="tap-target inline-flex items-center rounded-full bg-primary px-8 font-display text-xl text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            Ver mi casa
          </Link>
          <button
            type="button"
            onClick={onContinue}
            className="tap-target rounded-full bg-secondary px-6 font-display text-lg text-secondary-foreground"
          >
            Ver mi resumen
          </button>
        </div>
      ) : null}
    </div>
  );
}
