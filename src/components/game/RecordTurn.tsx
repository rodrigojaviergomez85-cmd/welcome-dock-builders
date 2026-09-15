import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, ArrowRight, MicOff, Ear, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AudioButton } from "./AudioButton";
import { micSupported, startRecording } from "@/lib/recorder";
import { startWavRecording, wavRecordingSupported, blobToBase64 } from "@/lib/wav-recorder";
import { saveRecording } from "@/lib/recordings";
import { stopClip, playClip } from "@/lib/audio";
import { BilingualLine } from "./BilingualLine";
import { BRIDGE, gloss } from "@/content/glossary";
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

type State = "learn-es" | "learn-en" | "idle" | "recording" | "checking" | "result" | "nomic";

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
  const [state, setState] = useState<State>("learn-es");
  const [spanishPlayed, setSpanishPlayed] = useState(false);
  const [englishModelPlayed, setEnglishModelPlayed] = useState(false);
  const [englishPlayed, setEnglishPlayed] = useState(false);
  const [micAvailable, setMicAvailable] = useState(true);
  const [url, setUrl] = useState<string | null>(null);
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [serviceNote, setServiceNote] = useState<string | null>(null);
  const stopperRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const transcribe = useServerFn(transcribeAttempt);

  const listenEnabled = progress.listenEnabled !== false;

  useEffect(() => {
    setMicAvailable(micSupported() || wavRecordingSupported());
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
  const g = gloss(targetEn, alias);

  if (state === "learn-es") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
        <p className="text-sm text-muted-foreground">{promptEs}</p>
        <div className="mt-3 rounded-2xl bg-sun/30 p-4">
          <p className="text-sm text-muted-foreground">Vos querés decir:</p>
          <p className="font-display text-2xl">
            {(g?.es ?? promptEs).split("{alias}").join(alias)}
          </p>
          {g?.esClip ? (
            <AudioButton
              clipId={g.esClip}
              label="Escuchar"
              onEnded={() => setSpanishPlayed(true)}
              className="mt-3"
            />
          ) : null}
        </div>
        {spanishPlayed ? (
          <button
            type="button"
            onClick={() => setState("learn-en")}
            className="tap-target mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            Seguir <ArrowRight className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  }

  if (state === "learn-en") {
    const slowClip = g?.slowClip ?? modelClip;
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
        <p className="font-display text-lg">En inglés se dice:</p>
        <BilingualLine
          en={targetEn}
          alias={alias}
          clip={modelClip}
          autoPlayKey={`${turnId}-en`}
          showAudio={false}
          className="mt-2 bg-secondary/40"
        />
        {!englishModelPlayed ? (
          <AudioButton
            clipId={modelClip}
            autoPlayKey={`${turnId}-en`}
            label="Escuchar otra vez"
            onEnded={() => setEnglishModelPlayed(true)}
            className="mt-5"
          />
        ) : !englishPlayed ? (
          <AudioButton
            clipId={slowClip}
            label="Escuchar despacio"
            onEnded={() => setEnglishPlayed(true)}
            className="mt-5"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              stopClip();
              void playClip(BRIDGE.repeat);
              setTextVisible(true);
              setState(micAvailable ? "idle" : "nomic");
            }}
            className="tap-target mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            <Mic className="size-6" aria-hidden /> Ahora decilo vos
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
      <p className="text-sm text-muted-foreground">{promptEs}</p>

      {textVisible ? (
        <BilingualLine en={targetEn} alias={alias} className="mt-4" showAudio={false} />
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
            <div className="flex flex-col items-start gap-3">
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
                className="px-2 py-2 text-sm text-muted-foreground underline underline-offset-4"
              >
                Seguir sin grabar
              </button>
            </div>
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
            <div className="flex flex-col items-start gap-3">
              {!heard ? (
              <button
                type="button"
                onClick={() => setState("idle")}
                className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)]"
              >
                <RotateCcw className="size-5" aria-hidden /> Otra vez
              </button>
              ) : null}
              <button
                type="button"
                onClick={() => onDone(heard ? "heard" : "practiced")}
                className={heard
                  ? "tap-target inline-flex items-center gap-2 rounded-full bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
                  : "px-2 py-2 text-sm text-muted-foreground underline underline-offset-4"}
              >
                Seguir <ArrowRight className="size-5" aria-hidden />
              </button>
            </div>
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
