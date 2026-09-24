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
import { PIP_DAYS, type PipDay, type PipProgress } from "@/lib/progress";
import { stopPipVoice } from "@/lib/pip-voice";
import { playSuccess } from "@/lib/feedback-sounds";

/* eslint-disable react-refresh/only-export-components -- PIP_HOMES se reutiliza en el cierre de misión */
export const PIP_HOMES = [home0, home1, home2, home3, home4] as const;
/** Centro del jardín de Pip en island-map.jpg (% del mapa). Ajustar aquí si cambia el mapa. */
const GARDEN = { x: 49.5, y: 49, bottom: 58 };
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
  const homeWidths = [16, 17.5, 19, 20.5, 22];
  const pipWidths = [7, 9.5, 12.5, 15, 18];

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
    <section aria-label="La casa de Pip" className="pointer-events-none absolute inset-0 z-10">
      <button
        type="button"
        onClick={() => setPanel("homes")}
        aria-label={`Casa de Pip: ${HOME_NAMES[stage]}. Ver todas las casas.`}
        className="pointer-events-auto absolute max-w-[300px] -translate-x-1/2 rounded-lg focus-visible:outline-4 focus-visible:outline-primary"
        style={{
          width: `${homeWidths[stage]}%`,
          left: `${GARDEN.x - 4}%`,
          bottom: `${100 - GARDEN.bottom}%`,
        }}
      >
        <img
          src={PIP_HOMES[stage]}
          alt=""
          width={512}
          height={512}
          className="size-full select-none object-contain object-bottom drop-shadow-lg"
          draggable={false}
        />
      </button>
      <button
        type="button"
        onClick={onPip}
        aria-label={
          sleeping ? "Pip está dormido. Tocalo para despertarlo." : "Ver las frases de Pip"
        }
        className="pointer-events-auto absolute max-w-[220px] rounded-full focus-visible:outline-4 focus-visible:outline-primary"
        style={{
          width: `${pipWidths[stage]}%`,
          left: `${GARDEN.x + 6 - pipWidths[stage] / 2}%`,
          bottom: `${100 - GARDEN.bottom + 1}%`,
        }}
      >
        <Pip
          mood={sleeping ? "sleepy" : "happy"}
          color={pip.color}
          stage={stage}
          feeds={pip.feeds}
          accessories={pip.accessories}
          className="size-full"
        />
      </button>
      <div
        className="absolute w-[4%] max-w-[52px] [&>div>svg]:w-full"
        style={{ left: "36.5%", bottom: "43%" }}
      >
        <PipRuler
          marks={pip.marks}
          currentDay={day}
          feeds={pip.feeds}
          total={feedsToEvolve}
          height="auto"
        />
      </div>

      {panel ? (
        <div
          role="dialog"
          aria-label={panel === "belly" ? "Barriga de palabras de Pip" : "Las casas de Pip"}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
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
