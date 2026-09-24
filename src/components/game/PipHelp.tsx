import { useEffect, useRef, useState, type ReactNode } from "react";
import { Hand, Mic, X } from "lucide-react";
import { Pip } from "./Pip";
import { AudioButton } from "./AudioButton";
import { gloss } from "@/content/glossary";
import { playClip, stopClip } from "@/lib/audio";
import { useProgress } from "@/lib/useProgress";
import { pipSizeFor } from "@/lib/progress";

export type RecordRole = "ask" | "answer" | "repeat";

const ROLE_LABEL: Record<RecordRole, string> = {
  ask: "Vos preguntás",
  answer: "Vos respondés",
  repeat: "Repetí",
};

const ROLE_CLIP: Record<RecordRole, string> = {
  ask: "es-help-ask",
  answer: "es-help-answer",
  repeat: "es-help-repeat",
};

const ROLE_TEXT: Record<RecordRole, string> = {
  ask: "Ahora preguntás vos. Tocá el botón rojo y decí la frase en inglés.",
  answer: "Ahora respondés vos. Tocá el botón rojo y decí la frase en inglés con tu nombre.",
  repeat: "Repetí la frase. Tocá el botón rojo y decila en inglés.",
};

const IDLE_MS = 8000;

type Props = {
  turnKey: string;
  role: RecordRole;
  targetEn: string;
  alias: string;
  modelClip: string | string[];
  meaning?: { es: string; esClip?: string | string[] | undefined } | undefined;
  onHelpUsed?: () => void;
  children: ReactNode;
};

/** Etiqueta de rol + botón "Ayuda" de Pip + oferta automática a los 8 s sin tocar nada. */
export function PipHelp({
  turnKey,
  role,
  targetEn,
  alias,
  modelClip,
  meaning,
  onHelpUsed,
  children,
}: Props) {
  const { state } = useProgress();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(-1);
  const [nudge, setNudge] = useState(false);
  const offeredRef = useRef(false);
  const runRef = useRef(0);

  const g = gloss(targetEn, alias);
  const es = (meaning?.es ?? g?.es ?? "").split("{alias}").join(alias);
  const esClip = meaning?.esClip ?? g?.esClip;
  const slowClip = g?.slowClip ?? modelClip;

  // Oferta automática: una sola vez por turno si pasan 8 s sin ningún toque.
  useEffect(() => {
    offeredRef.current = false;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      if (offeredRef.current) return;
      timer = window.setTimeout(() => {
        if (offeredRef.current) return;
        offeredRef.current = true;
        setNudge(true);
        void playClip("es-help-offer").then(() => setNudge(false));
      }, IDLE_MS);
    };
    arm();
    window.addEventListener("pointerdown", arm);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", arm);
    };
  }, [turnKey]);

  useEffect(() => () => void (runRef.current += 1), []);

  async function openHelp() {
    offeredRef.current = true;
    setNudge(false);
    setOpen(true);
    onHelpUsed?.();
    const run = ++runRef.current;
    const seq: (string | string[] | undefined)[] = [esClip, ROLE_CLIP[role], slowClip];
    for (let i = 0; i < seq.length; i++) {
      if (runRef.current !== run) return;
      setStep(i);
      const clip = seq[i];
      if (clip) await playClip(clip);
    }
    if (runRef.current === run) setStep(-1);
  }

  function closeHelp() {
    runRef.current += 1;
    stopClip();
    setStep(-1);
    setOpen(false);
  }

  const stepBox = (i: number) =>
    `rounded-2xl p-3 transition ${step === i ? "bg-sun/50 ring-4 ring-sun" : "bg-background/70"}`;

  return (
    <div
      className={`flex w-full max-w-xl flex-col items-center gap-2 ${step === 1 ? "help-point-mic" : ""}`}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span
          className={`rounded-full px-5 py-2 font-display text-xl shadow-[var(--shadow-soft)] ${
            role === "ask"
              ? "bg-accent text-accent-foreground"
              : role === "answer"
                ? "bg-primary text-primary-foreground"
                : "bg-sun text-foreground"
          }`}
        >
          {ROLE_LABEL[role]}
        </span>
        <button
          type="button"
          onClick={() => (open ? closeHelp() : void openHelp())}
          aria-label="Ayuda de Pip"
          className={`tap-target inline-flex items-center gap-1 rounded-full bg-card py-1 pl-1 pr-4 font-display text-lg text-card-foreground shadow-[var(--shadow-soft)] ${
            nudge ? "animate-nudge ring-4 ring-sun" : ""
          }`}
        >
          <Pip
            mood="happy"
            color={state.pip.color}
            stage={state.pip.stage}
            feeds={state.pip.feeds}
            accessories={state.pip.accessories}
            size={Math.min(52, 34 + (pipSizeFor(state.pip) - 64) * 0.12)}
            className="shrink-0"
          />
          Ayuda
        </button>
      </div>

      {open ? (
        <div className="w-full animate-pop rounded-3xl border-4 border-sun bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-xl">Pip te ayuda</p>
            <button
              type="button"
              onClick={closeHelp}
              aria-label="Cerrar ayuda"
              className="tap-target inline-flex items-center justify-center rounded-full bg-muted px-3"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="space-y-2">
            <div className={stepBox(0)}>
              <p className="text-sm text-muted-foreground">1 · Qué significa</p>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p lang="en" className="font-display text-xl">
                    {targetEn}
                  </p>
                  <p>{es}</p>
                </div>
                {esClip ? (
                  <AudioButton clipId={esClip} label="Escuchar" size="sm" className="shrink-0" />
                ) : null}
              </div>
            </div>
            <div className={stepBox(1)}>
              <p className="text-sm text-muted-foreground">2 · Qué hacer</p>
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2">
                  <span className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Mic className="size-5" aria-hidden />
                    <Hand
                      className={`absolute -bottom-3 -right-3 size-6 text-foreground ${step === 1 ? "animate-help-point" : ""}`}
                      aria-hidden
                    />
                  </span>
                  {ROLE_TEXT[role]}
                </p>
                <AudioButton
                  clipId={ROLE_CLIP[role]}
                  label="Escuchar"
                  size="sm"
                  className="shrink-0"
                />
              </div>
            </div>
            <div className={stepBox(2)}>
              <p className="text-sm text-muted-foreground">3 · Ejemplo lento</p>
              <div className="flex items-center justify-between gap-2">
                <p lang="en" className="font-display text-xl">
                  {targetEn}
                </p>
                <AudioButton clipId={slowClip} label="Escuchar" size="sm" className="shrink-0" />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}
