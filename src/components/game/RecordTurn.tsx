import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, RotateCcw, ArrowRight, MicOff, Ear, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AudioButton } from "./AudioButton";
import { micSupported, startRecording } from "@/lib/recorder";
import { startWavRecording, wavRecordingSupported, blobToBase64 } from "@/lib/wav-recorder";
import { saveRecording } from "@/lib/recordings";
import { stopClip } from "@/lib/audio";
import { transcribeAttempt } from "@/lib/speech.functions";
import { matchSpeech, type MatchResult } from "@/lib/speech-match";
import { useProgress } from "@/lib/useProgress";
import { playSuccess, playTryAgain } from "@/lib/feedback-sounds";

type Props = {
  missionId: string;
  turnId: string;
  promptEs: string;
  targetEn: string;
  /** Alias del avatar: cualquier nombre se acepta, así que no hace falta acertarlo. */
  alias?: string;
  modelClip: string;
  support: "full" | "reduced";
  onHelpUsed?: () => void;
  /** "heard" = el juego lo entendió, "practiced" = habló, "pending" = queda pendiente. */
  onDone: (status: "heard" | "practiced" | "pending") => void;
};

type State = "idle" | "recording" | "checking" | "result" | "nomic";

export function RecordTurn({
  missionId,
  turnId,
  promptEs,
  targetEn,
  alias = "",
  modelClip,
  support,
  onHelpUsed,
  onDone,
}: Props) {
  const { state: progress } = useProgress();
  const [textVisible, setTextVisible] = useState(support === "full");
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [serviceNote, setServiceNote] = useState<string | null>(null);
  const stopperRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const transcribe = useServerFn(transcribeAttempt);

  const listenEnabled = progress.listenEnabled !== false;

  useEffect(() => {
    if (!micSupported() && !wavRecordingSupported()) setState("nomic");
  }, []);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function begin() {
    stopClip();
    setMatch(null);
    setServiceNote(null);
    try {
      stopperRef.current = wavRecordingSupported()
        ? await startWavRecording()
        : await startRecording();
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
      /* si la base local falla, la práctica sigue contando en esta sesión */
    }

    if (!listenEnabled || blob.type !== "audio/wav") {
      setState("result");
      return;
    }

    setState("checking");
    let finalMatch: MatchResult | null = null;
    try {
      const audioBase64 = await blobToBase64(blob);
      const result = await transcribe({ data: { audioBase64 } });
      if (result.ok) {
        finalMatch = matchSpeech(result.text, targetEn, alias);
      } else if (result.reason === "no-se-entendio" || result.reason === "audio-vacio") {
        finalMatch = { kind: "unclear", heardText: "" };
      } else {
        setServiceNote("No pude escucharte esta vez, pero tu voz quedó grabada.");
      }
    } catch {
      setServiceNote("No pude escucharte esta vez, pero tu voz quedó grabada.");
    }
    setMatch(finalMatch);
    if (finalMatch) {
      if (finalMatch.kind === "heard") playSuccess();
      else playTryAgain();
    }
    setState("result");
  }

  const heard = match?.kind === "heard";

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
            <>
              <button
                type="button"
                onClick={begin}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
              >
                <Mic className="size-6" aria-hidden /> Decirlo
              </button>
              <button
                type="button"
                onClick={() => onDone("pending")}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-5 font-display text-secondary-foreground"
              >
                Seguir sin grabar
              </button>
            </>
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

          {state === "checking" ? (
            <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
              <Loader2 className="size-6 animate-spin" aria-hidden /> Te estoy escuchando…
            </p>
          ) : null}

          {state === "result" ? (
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
                onClick={() => onDone(heard ? "heard" : "practiced")}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
              >
                Seguir <ArrowRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
      )}

      {state === "result" && match ? (
        <div
          className={`mt-4 animate-pop rounded-2xl p-4 ${
            heard ? "bg-success/15" : "bg-muted"
          }`}
        >
          <p className="flex items-center gap-2 font-display text-xl">
            <Ear className="size-6" aria-hidden />
            {heard
              ? "¡Te escuché!"
              : match.kind === "partial"
                ? "Te escuché casi todo"
                : "No te escuché bien"}
          </p>
          {match.heardText ? (
            <p lang="en" className="mt-2 font-display text-2xl">
              “{match.heardText}”
            </p>
          ) : null}
          <p className="mt-2 text-sm text-muted-foreground">
            {heard
              ? "Dijiste la frase. Cualquier nombre está bien."
              : match.kind === "partial"
                ? `Probá de nuevo incluyendo: ${match.missing.join(" ")}`
                : "Probá otra vez, más cerca del micrófono y en voz alta."}
          </p>
        </div>
      ) : null}

      {state === "result" && !match ? (
        <p className="mt-4 rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
          {serviceNote ??
            "Guardado como practicado. El juego no escuchó este intento porque la escucha está apagada en el panel de adultos."}
        </p>
      ) : null}
    </div>
  );
}
