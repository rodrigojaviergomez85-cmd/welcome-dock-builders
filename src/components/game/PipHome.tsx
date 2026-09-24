import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, X } from "lucide-react";
import home0 from "@/assets/pip-home-0.png";
import home1 from "@/assets/pip-home-1.png";
import home2 from "@/assets/pip-home-2.png";
import home3 from "@/assets/pip-home-3.png";
import home4 from "@/assets/pip-home-4.png";
import { Pip } from "./Pip";
import { PipRuler } from "./PipRuler";
import { PipBelly } from "./PipBelly";
import { PIP_DAYS, pipSizeFor, type PipDay, type PipProgress } from "@/lib/progress";
import { stopPipVoice } from "@/lib/pip-voice";
import { playSuccess } from "@/lib/feedback-sounds";

/* eslint-disable react-refresh/only-export-components -- PIP_HOMES se reutiliza en el cierre de misión */
export const PIP_HOMES = [home0, home1, home2, home3, home4] as const;
const HOME_NAMES = ["Nido", "Caja", "Casita", "Casa del árbol", "Faro"];

type Props = {
  pip: PipProgress;
  day: PipDay;
  feedsToEvolve: number;
  asleep: boolean;
  /** Ruta de la misión del día, para despertar a Pip. */
  missionPath: string | null;
};

export function PipHome({ pip, day, feedsToEvolve, asleep, missionPath }: Props) {
  const navigate = useNavigate();
  const [panel, setPanel] = useState<"belly" | "homes" | null>(null);
  const [awake, setAwake] = useState(false);
  const stage = Math.min(4, Math.max(0, pip.stage));
  const sleeping = asleep && !awake;
  const missing = Math.max(0, feedsToEvolve - pip.feeds);
  // Pip a su tamaño de etapa, acotado para que quepa en 400 px.
  const pipSize = Math.min(pipSizeFor(pip), 110);

  function onPip() {
    if (sleeping) {
      setAwake(true);
      playSuccess();
      if (missionPath) window.setTimeout(() => void navigate({ to: missionPath }), 700);
      return;
    }
    setPanel("belly");
  }

  function close() {
    stopPipVoice();
    setPanel(null);
  }

  return (
    <section
      aria-label="La casa de Pip"
      className="relative mt-8 overflow-hidden rounded-[2rem] bg-card p-4 shadow-[var(--shadow-soft)] sm:p-6"
    >
      <h2 className="font-display text-2xl">La casa de Pip</h2>
      <div className="mt-2 flex items-end justify-center gap-2 sm:gap-6">
        <div className="flex min-w-0 flex-1 items-end justify-center gap-1">
          <button
            type="button"
            onClick={() => setPanel("homes")}
            aria-label={`Casa de Pip: ${HOME_NAMES[stage]}. Ver todas las casas.`}
            className="block min-w-0 flex-1 max-w-[18rem] rounded-2xl focus-visible:outline-4 focus-visible:outline-primary"
          >
            <img
              src={PIP_HOMES[stage]}
              alt=""
              width={512}
              height={512}
              className="h-auto w-full select-none"
              draggable={false}
            />
          </button>
          <button
            type="button"
            onClick={onPip}
            aria-label={
              sleeping ? "Pip está dormido. Tocalo para despertarlo." : "Ver las frases de Pip"
            }
            className="mb-1 shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-primary"
          >
            <Pip
              mood={sleeping ? "sleepy" : "happy"}
              color={pip.color}
              stage={stage}
              feeds={pip.feeds}
              accessories={pip.accessories}
              size={pipSize}
            />
          </button>
        </div>
        <PipRuler
          marks={pip.marks}
          currentDay={day}
          feeds={pip.feeds}
          total={feedsToEvolve}
          height={200}
        />
      </div>
      <p className="mt-3 text-center font-display text-lg">
        Pip sabe {pip.learned.length} {pip.learned.length === 1 ? "frase" : "frases"} ·{" "}
        {stage >= 4 ? "ya es gigante" : `le faltan ${missing} para crecer`}
      </p>
      {sleeping ? (
        <p className="text-center text-sm text-muted-foreground">
          Pip está dormido. Tocalo para jugar.
        </p>
      ) : null}

      {panel ? (
        <div
          role="dialog"
          aria-label={panel === "belly" ? "Barriga de palabras de Pip" : "Las casas de Pip"}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-2xl animate-pop rounded-3xl bg-card p-5 text-card-foreground shadow-[var(--shadow-soft)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar"
              className="tap-target absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-muted"
            >
              <X className="size-6" aria-hidden />
            </button>
            {panel === "belly" ? (
              <>
                <p className="pr-12 font-display text-2xl">
                  Pip sabe {pip.learned.length} {pip.learned.length === 1 ? "frase" : "frases"}
                </p>
                <PipBelly learned={pip.learned} />
              </>
            ) : (
              <>
                <p className="pr-12 font-display text-2xl">Las casas de Pip</p>
                <ul className="mt-4 grid grid-cols-5 items-end gap-2">
                  {PIP_HOMES.map((src, index) => {
                    const locked = index > stage;
                    return (
                      <li key={src} className="flex flex-col items-center text-center">
                        <div className="relative w-full">
                          <img
                            src={src}
                            alt=""
                            className={locked ? "w-full opacity-40 grayscale" : "w-full"}
                          />
                          {locked ? (
                            <Lock
                              className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-foreground"
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <span className="mt-1 font-display text-xs sm:text-sm">
                          {HOME_NAMES[index]}
                        </span>
                        {locked ? (
                          <span className="text-[0.65rem] leading-tight text-muted-foreground sm:text-xs">
                            Se abre cuando Pip crezca
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function currentPipDay(completedIds: string[]): PipDay {
  return PIP_DAYS.find((day) => !completedIds.includes(day)) ?? "friday";
}
