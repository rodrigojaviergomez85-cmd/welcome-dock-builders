import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, RotateCcw, ArrowRight, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioButton } from "./AudioButton";
import { micSupported, startRecording } from "@/lib/recorder";
import { saveRecording } from "@/lib/recordings";
import { stopClip } from "@/lib/audio";

type Props = {
  missionId: string;
  turnId: string;
  promptEs: string;
  targetEn: string;
  modelClip: string;
  support: "full" | "reduced";
  onHelpUsed?: () => void;
  /** "practiced" = se grabó; "pending" = sin micrófono, la voz queda pendiente. */
  onDone: (status: "practiced" | "pending") => void;
};

export function RecordTurn({
  missionId,
  turnId,
  promptEs,
  targetEn,
  modelClip,
  support,
  onHelpUsed,
  onDone,
}: Props) {
  const [textVisible, setTextVisible] = useState(support === "full");
  const [state, setState] = useState<"idle" | "recording" | "saved" | "nomic">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const stopperRef = useRef<{ stop: () => Promise<Blob> } | null>(null);

  useEffect(() => {
    if (!micSupported()) setState("nomic");
  }, []);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function begin() {
    stopClip();
    try {
      stopperRef.current = await startRecording();
      setState("recording");
    } catch {
      setState("nomic");
    }
  }

  async function finish() {
    const stopper = stopperRef.current;
    if (!stopper) return;
    const blob = await stopper.stop();
    stopperRef.current = null;
    if (url) URL.revokeObjectURL(url);
    setUrl(URL.createObjectURL(blob));
    setState("saved");
    try {
      await saveRecording({
        key: `${missionId}:${turnId}`,
        missionId,
        turnId,
        targetEn,
        createdAt: new Date().toISOString(),
        blob,
      });
    } catch {
      /* si IndexedDB falla, la práctica sigue contando en esta sesión */
    }
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
      <p className="text-sm text-muted-foreground">{promptEs}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <AudioButton clipId={modelClip} label="Escuchar modelo" size="sm" />
        {!textVisible ? (
          <button
            type="button"
            onClick={() => {
              setTextVisible(true);
              onHelpUsed?.();
            }}
            className="tap-target rounded-full bg-secondary px-5 font-display text-secondary-foreground"
          >
            Ver el texto
          </button>
        ) : null}
      </div>

      {textVisible ? (
        <p lang="en" className="mt-4 font-display text-2xl leading-snug sm:text-3xl">
          {targetEn}
        </p>
      ) : (
        <p className="mt-4 font-display text-2xl text-muted-foreground">• • •</p>
      )}

      {state === "nomic" ? (
        <div className="mt-5 rounded-2xl bg-muted p-4">
          <p className="flex items-center gap-2 font-display text-lg">
            <MicOff className="size-5" aria-hidden /> Sin micrófono por ahora
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Podés seguir jugando. Tu voz queda pendiente y no se marca como practicada.
          </p>
          <button
            type="button"
            onClick={() => onDone("pending")}
            className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            Seguir <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {state === "idle" ? (
            <button
              type="button"
              onClick={begin}
              className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
            >
              <Mic className="size-6" aria-hidden /> Grabar
            </button>
          ) : null}

          {state === "recording" ? (
            <button
              type="button"
              onClick={finish}
              className="tap-target inline-flex animate-bob items-center gap-2 rounded-full bg-destructive px-6 font-display text-lg text-destructive-foreground shadow-[var(--shadow-pop)]"
            >
              <Square className="size-6" aria-hidden /> Listo
            </button>
          ) : null}

          {state === "saved" ? (
            <>
              <button
                type="button"
                onClick={() => {
                  stopClip();
                  if (url) void new Audio(url).play().catch(() => {});
                }}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-5 font-display text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
              >
                <Play className="size-5" aria-hidden /> Escucharme
              </button>
              <button
                type="button"
                onClick={() => setState("idle")}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-5 font-display text-secondary-foreground"
              >
                <RotateCcw className="size-5" aria-hidden /> Otra vez
              </button>
              <button
                type="button"
                onClick={() => onDone("practiced")}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
              >
                Seguir <ArrowRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      )}

      {state === "saved" ? (
        <p className={cn("mt-4 rounded-2xl bg-muted p-3 text-sm text-muted-foreground")}>
          Guardado como <strong>practicado</strong>. Todavía no hay revisión automática de
          pronunciación: nadie corrige este audio aún.
        </p>
      ) : null}
    </div>
  );
}
