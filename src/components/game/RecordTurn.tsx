import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  ArrowRight,
  MicOff,
  Ear,
  Loader2,
  Volume2,
  Check,
} from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AudioButton } from "./AudioButton";
import { PipHelp, type RecordRole } from "./PipHelp";
import { Pip } from "./Pip";
import { micSupported, startRecording } from "@/lib/recorder";
import { startWavRecording, wavRecordingSupported, blobToBase64 } from "@/lib/wav-recorder";
import { saveRecording } from "@/lib/recordings";
import { playClip, stopClip } from "@/lib/audio";
import { setPhraseHelp } from "@/lib/help-context";
import { gloss } from "@/content/glossary";
import { transcribeAttempt } from "@/lib/speech.functions";
import { matchSpeech, type MatchResult } from "@/lib/speech-match";
import { useProgress } from "@/lib/useProgress";
import { pipSizeFor } from "@/lib/progress";
import { playSuccess, playTryAgain } from "@/lib/feedback-sounds";

type Props = {
  missionId: string;
  turnId: string;
  promptEs: string;
  targetEn: string;
  /** Alias del avatar: cualquier nombre se acepta, así que no hace falta acertarlo. */
  alias?: string;
  modelClip: string | string[];
  /** Guarda también la toma completa con una clave destacada para el panel adulto. */
  saveAs?: string;
  /** Significado en español ya armado (cuando la frase tiene país o edad). */
  meaning?: { es: string; esClip?: string | string[] | undefined } | undefined;
  support: "full" | "reduced";
  onHelpUsed?: () => void;
  /** "heard" = el juego lo entendió, "practiced" = habló, "pending" = queda pendiente. */
  onDone: (status: "heard" | "practiced" | "pending") => void;
  /** "quick" por defecto; "guided" usa el embudo con fragmentos. */
  mode?: "quick" | "guided" | undefined;
  /** Clip en español con el motivo (solo role "ask"). */
  promptClip?: string | undefined;
  /** Respuesta que el niño podría decir por error (solo role "ask"). */
  confusedWith?: string | undefined;
};

type State =
  | "intent"
  | "fragment-listen"
  | "fragment-echo"
  | "complete"
  | "recording"
  | "checking"
  | "result"
  | "nomic";

type PracticeFragment = { en: string; es: string; clip: string | string[] };

function practiceFragments(
  targetEn: string,
  alias: string,
  modelClip: string | string[],
): PracticeFragment[] {
  const sentences = (targetEn.match(/[^.!?]+[.!?]*/g) ?? [targetEn])
    .map((part) => part.trim())
    .filter(Boolean);
  const clips = Array.isArray(modelClip) ? modelClip : [modelClip];
  if (sentences.length <= 1) {
    return [
      {
        en: targetEn,
        es: gloss(targetEn, alias)?.es?.split("{alias}").join(alias) ?? "",
        clip: modelClip,
      },
    ];
  }
  return sentences.map((en, i) => {
    const g = gloss(en, alias);
    const clip = clips.length === sentences.length ? clips[i]! : (g?.slowClip ?? modelClip);
    return { en, es: g?.es?.split("{alias}").join(alias) ?? "", clip };
  });
}

const MIC_TIMEOUT_MS = 6000;

function startMicWithTimeout(): Promise<{ stop: () => Promise<Blob> }> {
  const start = wavRecordingSupported() ? startWavRecording() : startRecording();
  return Promise.race([
    start,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("mic-timeout")), MIC_TIMEOUT_MS),
    ),
  ]);
}

export function RecordTurn({ role, ...props }: Props & { role?: RecordRole | undefined }) {
  const inner =
    role === "ask" ? (
      <AskRecordTurn {...props} />
    ) : props.mode === "guided" ? (
      <GuidedRecordTurn {...props} />
    ) : (
      <QuickRecordTurn {...props} />
    );
  return (
    <PipHelp
      turnKey={`${props.missionId}-${props.turnId}`}
      role={role ?? "repeat"}
      targetEn={props.targetEn}
      alias={props.alias ?? ""}
      modelClip={props.modelClip}
      meaning={props.meaning}
      {...(props.onHelpUsed ? { onHelpUsed: props.onHelpUsed } : {})}
    >
      {inner}
    </PipHelp>
  );
}

function QuickRecordTurn({
  missionId,
  turnId,
  targetEn,
  alias = "",
  modelClip,
  saveAs,
  meaning,
  onDone,
}: Props) {
  const { state: progress } = useProgress();
  const [state, setState] = useState<
    "idle" | "starting" | "recording" | "checking" | "result" | "nomic"
  >("idle");
  const [heard, setHeard] = useState(false);
  const [fails, setFails] = useState(0);
  const stopperRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const transcribe = useServerFn(transcribeAttempt);
  const listenEnabled = progress.listenEnabled !== false;
  const g = meaning ?? gloss(targetEn, alias);

  useEffect(() => {
    setPhraseHelp(
      g?.es ? { en: targetEn, es: g.es.split("{alias}").join(alias), esClip: g.esClip } : null,
    );
    return () => setPhraseHelp(null);
  }, [targetEn, alias, g?.es, g?.esClip]);

  useEffect(() => {
    if (!micSupported() && !wavRecordingSupported()) setState("nomic");
    void playClip(modelClip);
    return () => stopClip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnId]);

  const lastBlobRef = useRef<Blob | null>(null);
  function markSaved(status: "heard" | "practiced" | "pending") {
    if (!saveAs) return;
    void saveRecording({
      key: saveAs,
      missionId,
      turnId: saveAs,
      targetEn,
      createdAt: new Date().toISOString(),
      blob: lastBlobRef.current ?? new Blob([], { type: "audio/wav" }),
      status,
    }).catch(() => undefined);
  }

  async function begin() {
    stopClip();
    setState("starting");
    try {
      stopperRef.current = await startMicWithTimeout();
      setState("recording");
    } catch {
      setState("nomic");
    }
  }

  function showResult(ok: boolean, failCount: number) {
    setHeard(ok);
    setState("result");
    if (ok) playSuccess();
    else playTryAgain();
    setTimeout(() => {
      if (ok) {
        markSaved("heard");
        doneRef.current("heard");
      } else if (failCount >= 2) {
        markSaved("practiced");
        doneRef.current("practiced");
      } else setState("idle");
    }, 1200);
  }

  async function finish() {
    const stopper = stopperRef.current;
    if (!stopper) return;
    stopperRef.current = null;
    const blob = await stopper.stop();
    lastBlobRef.current = blob;
    try {
      const base = { missionId, targetEn, createdAt: new Date().toISOString(), blob };
      await saveRecording({ ...base, key: `${missionId}:${turnId}:complete`, turnId });
      if (saveAs)
        await saveRecording({ ...base, key: saveAs, turnId: saveAs, status: "practiced" });
    } catch {
      /* la práctica sigue contando */
    }
    if (!listenEnabled || blob.type !== "audio/wav") {
      playSuccess();
      setHeard(true);
      setState("result");
      setTimeout(() => doneRef.current("practiced"), 1200);
      return;
    }
    setState("checking");
    try {
      const result = await transcribe({ data: { audioBase64: await blobToBase64(blob) } });
      if (result.ok) {
        const ok = matchSpeech(result.text, targetEn, alias).kind === "heard";
        const next = ok ? fails : fails + 1;
        setFails(next);
        showResult(ok, next);
        return;
      }
      if (result.reason === "no-se-entendio" || result.reason === "audio-vacio") {
        const next = fails + 1;
        setFails(next);
        showResult(false, next);
        return;
      }
    } catch {
      /* servicio caído: cuenta como practicado */
    }
    playSuccess();
    setHeard(true);
    setState("result");
    setTimeout(() => doneRef.current("practiced"), 1200);
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-center text-card-foreground shadow-[var(--shadow-soft)]">
      <p lang="en" className="font-display text-3xl leading-tight sm:text-4xl">
        {targetEn}
      </p>
      <button
        type="button"
        onClick={() => void playClip(modelClip)}
        className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
      >
        <Volume2 className="size-4" aria-hidden /> Escuchar otra vez
      </button>

      <div className="mt-4 flex min-h-32 flex-col items-center justify-center gap-2">
        {state === "idle" || state === "starting" ? (
          <>
            <button
              type="button"
              disabled={state === "starting"}
              onClick={() => void begin()}
              aria-label="Tocá y hablá"
              data-mic=""
              className="tap-target flex size-24 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {state === "starting" ? (
                <Loader2 className="size-10 animate-spin" aria-hidden />
              ) : (
                <Mic className="size-11" aria-hidden />
              )}
            </button>
            <p className="font-display text-xl text-accent">
              {fails > 0 ? "Probemos otra vez" : "Tocá y hablá"}
            </p>
          </>
        ) : null}
        {state === "recording" ? (
          <button
            type="button"
            onClick={() => void finish()}
            aria-label="Listo, terminé de hablar"
            className="tap-target flex size-24 animate-mic-pulse items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-[var(--shadow-pop)]"
          >
            <Square className="size-10" aria-hidden />
          </button>
        ) : null}
        {state === "checking" ? (
          <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden /> Te estoy escuchando…
          </p>
        ) : null}
        {state === "result" ? (
          <p
            className={`animate-pop rounded-2xl px-5 py-3 font-display text-2xl ${heard ? "bg-success/15 text-success" : "bg-muted"}`}
          >
            <Ear className="mr-2 inline size-6" aria-hidden />
            {heard ? "¡Te escuché!" : "Probemos otra vez"}
          </p>
        ) : null}
        {state === "nomic" ? (
          <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
            <MicOff className="size-5" aria-hidden /> Decilo en voz alta y tocá “Lo dije”
          </p>
        ) : null}
      </div>

      {state !== "result" && state !== "checking" ? (
        <button
          type="button"
          onClick={() => {
            stopperRef.current = null;
            stopClip();
            if (!lastBlobRef.current) markSaved("pending");
            onDone("pending");
          }}
          className="tap-target mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          <Check className="size-5" aria-hidden /> Lo dije
        </button>
      ) : null}
    </div>
  );
}

function GuidedRecordTurn({
  missionId,
  turnId,
  promptEs,
  targetEn,
  alias = "",
  modelClip,
  saveAs,
  meaning,
  onDone,
}: Props) {
  const { state: progress } = useProgress();
  const [state, setState] = useState<State>("intent");
  const [spanishPlayed, setSpanishPlayed] = useState(false);
  const [fragmentIndex, setFragmentIndex] = useState(0);
  const [recordingFull, setRecordingFull] = useState(false);
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

  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  const fragments = practiceFragments(targetEn, alias, modelClip);
  const fragment = fragments[fragmentIndex] ?? {
    en: targetEn,
    es: gloss(targetEn, alias)?.es ?? targetEn,
    clip: modelClip,
  };
  const practiceTarget = recordingFull ? targetEn : fragment.en;

  async function begin(full = false) {
    stopClip();
    setRecordingFull(full);
    setMatch(null);
    setServiceNote(null);
    try {
      stopperRef.current = await startMicWithTimeout();
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
        key: `${missionId}:${turnId}:${recordingFull ? "complete" : `part-${fragmentIndex}`}`,
        missionId,
        turnId,
        targetEn: practiceTarget,
        createdAt: new Date().toISOString(),
        blob,
      });
      if (recordingFull && saveAs) {
        await saveRecording({
          key: saveAs,
          missionId,
          turnId: saveAs,
          targetEn: practiceTarget,
          createdAt: new Date().toISOString(),
          blob,
        });
      }
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
        finalMatch = matchSpeech(result.text, practiceTarget, alias);
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
  const g = meaning ?? gloss(targetEn, alias);
  const step = state === "intent" ? 0 : recordingFull || state === "complete" ? 2 : 1;

  function continueAfterResult() {
    if (recordingFull) {
      onDone(heard ? "heard" : "practiced");
      return;
    }
    if (fragmentIndex + 1 < fragments.length) {
      setFragmentIndex((current) => current + 1);
      setMatch(null);
      setState("fragment-listen");
      return;
    }
    setState("complete");
  }

  function continueWithoutMic() {
    if (recordingFull) {
      onDone("pending");
      return;
    }
    if (fragmentIndex + 1 < fragments.length) {
      setFragmentIndex((current) => current + 1);
      setState("fragment-listen");
      return;
    }
    setState("complete");
  }

  const progressLabels = ["Escuchá", "Practicá", "Decilo"];
  const Progress = () => (
    <div className="mb-4 grid grid-cols-3 gap-2" aria-label={`Paso ${step + 1} de 3`}>
      {progressLabels.map((label, index) => (
        <div key={label} className="text-center">
          <div className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />
          <span
            className={`mt-1 block text-xs font-semibold ${index === step ? "text-primary" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        </div>
      ))}
      {state !== "result" && state !== "checking" ? saidIt : null}
    </div>
  );

  const saidIt = (
    <button
      type="button"
      onClick={() => {
        stopperRef.current = null;
        stopClip();
        onDone("pending");
      }}
      className="tap-target mx-auto mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
    >
      <Check className="size-5" aria-hidden /> Lo dije
    </button>
  );

  if (state === "intent") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
        <Progress />
        <div className="rounded-2xl bg-sun/30 p-4 text-center">
          <p className="font-display text-xl text-primary">Primero entendé la idea</p>
          <p className="mt-2 font-display text-2xl leading-snug">
            {(g?.es ?? promptEs).split("{alias}").join(alias)}
          </p>
          {g?.esClip ? (
            <AudioButton
              clipId={g.esClip}
              label="Escuchar"
              onEnded={() => setSpanishPlayed(true)}
              className="mt-4"
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setState("fragment-listen")}
          className={`tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none ${spanishPlayed ? "animate-pop" : ""}`}
        >
          Ya entendí <ArrowRight className="size-5" aria-hidden />
        </button>
        {saidIt}
      </div>
    );
  }

  if (state === "fragment-listen" || state === "fragment-echo") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
        <Progress />
        <p className="text-center font-display text-xl text-primary">
          {state === "fragment-listen" ? "Escuchá esta parte" : "Ahora repetí"}
        </p>
        <div className="mt-3 rounded-2xl border-2 border-sun bg-background/80 p-5 text-center">
          <p lang="en" className="font-display text-3xl leading-tight">
            {fragment.en}
          </p>
          <p className="mt-2 text-lg text-muted-foreground">{fragment.es}</p>
        </div>
        {state === "fragment-listen" ? (
          <AudioButton
            clipId={fragment.clip}
            autoPlayKey={`${turnId}-${fragmentIndex}`}
            label="Escuchar"
            onEnded={() => setState("fragment-echo")}
            className="mt-5 w-full justify-center rounded-2xl"
          />
        ) : null}
        {
          <button
            type="button"
            onClick={() => (micAvailable ? void begin(false) : setState("nomic"))}
            data-mic=""
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            <Mic className="size-6" aria-hidden /> Repetí esta parte
          </button>
        }
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Parte {fragmentIndex + 1} de {fragments.length}
        </p>
        {saidIt}
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-center text-card-foreground shadow-[var(--shadow-soft)]">
        <Progress />
        <p className="font-display text-2xl text-primary">¡Ahora completa!</p>
        <div className="mt-3 rounded-2xl border-2 border-sun bg-background/80 p-5">
          <p lang="en" className="font-display text-3xl leading-tight">
            {targetEn}
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            {g?.es?.split("{alias}").join(alias)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => (micAvailable ? void begin(true) : setState("nomic"))}
          data-mic=""
          className="tap-target mx-auto mt-6 flex size-24 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          aria-label="Tocá y hablá"
        >
          <Mic className="size-11" aria-hidden />
        </button>
        <p className="mt-3 font-display text-xl text-accent">Tocá y hablá</p>
        {saidIt}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-card-foreground shadow-[var(--shadow-soft)]">
      <Progress />
      <p className="text-center font-display text-xl text-primary">
        {recordingFull ? "Decí la frase completa" : "Repetí esta parte"}
      </p>
      <div className="mt-3 rounded-2xl bg-secondary/40 p-4 text-center">
        <p lang="en" className="font-display text-2xl">
          {practiceTarget}
        </p>
      </div>

      {state === "nomic" ? (
        <div className="mt-5 rounded-2xl bg-muted p-4">
          <p className="flex items-center gap-2 font-display text-lg">
            <MicOff className="size-5" aria-hidden /> Sin micrófono por ahora
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Podés seguir aprendiendo aunque hoy no puedas grabar tu voz.
          </p>
          <button
            type="button"
            onClick={continueWithoutMic}
            className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            {recordingFull ? "Seguir" : "Siguiente parte"}{" "}
            <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3">
          {state === "recording" ? (
            <button
              type="button"
              onClick={finish}
              className="tap-target inline-flex animate-mic-pulse items-center gap-2 rounded-full bg-destructive px-6 font-display text-lg text-destructive-foreground shadow-[var(--shadow-pop)]"
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
            <div className="flex w-full flex-col items-center gap-3">
              {!heard ? (
                <button
                  type="button"
                  onClick={() => setState(recordingFull ? "complete" : "fragment-echo")}
                  data-mic=""
                  className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)]"
                >
                  <RotateCcw className="size-5" aria-hidden /> Otra vez
                </button>
              ) : null}
              <button
                type="button"
                onClick={continueAfterResult}
                className={
                  heard
                    ? "tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
                    : "px-2 py-2 text-sm text-muted-foreground underline underline-offset-4"
                }
              >
                {recordingFull
                  ? "Seguir"
                  : fragmentIndex + 1 < fragments.length
                    ? "Siguiente parte"
                    : "Decirla completa"}{" "}
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      )}

      {state === "result" && match ? (
        <div className={`mt-4 animate-pop rounded-2xl p-4 ${heard ? "bg-success/15" : "bg-muted"}`}>
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
              ? recordingFull
                ? "¡Dijiste la frase! Cualquier nombre está bien."
                : "¡Muy bien! Ya practicamos esta parte."
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
      {state !== "result" && state !== "checking" ? saidIt : null}
    </div>
  );
}

/**
 * Turno "Vos preguntás": explica el motivo, modela la pregunta y pide repetirla.
 * La instrucción y la frase quedan visibles desde el inicio.
 * Si el niño dice la respuesta en vez de la pregunta, Pip lo corrige con cariño.
 */
function AskRecordTurn({
  missionId,
  turnId,
  promptEs,
  targetEn,
  alias = "",
  modelClip,
  saveAs,
  promptClip,
  confusedWith,
  onDone,
}: Props) {
  const { state: progress } = useProgress();
  const [state, setState] = useState<
    "idle" | "starting" | "recording" | "checking" | "result" | "nomic"
  >("idle");
  const [heard, setHeard] = useState(false);
  const [confused, setConfused] = useState(false);
  const failsRef = useRef(0);
  const attemptsRef = useRef(0);
  const stopperRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const transcribe = useServerFn(transcribeAttempt);
  const listenEnabled = progress.listenEnabled !== false;
  const confusedTarget = confusedWith?.split("{alias}").join(alias);

  function playAskSequence(includePrompt = true) {
    const model = Array.isArray(modelClip) ? modelClip : [modelClip];
    const clips = includePrompt && promptClip ? [promptClip, ...model] : model;
    return playClip([...clips, "es-ask-repeat"]);
  }

  useEffect(() => {
    if (!micSupported() && !wavRecordingSupported()) setState("nomic");
    void playAskSequence();
    return () => {
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turnId]);

  function markSaved(status: "heard" | "practiced" | "pending") {
    if (!saveAs) return;
    void saveRecording({
      key: saveAs,
      missionId,
      turnId: saveAs,
      targetEn,
      createdAt: new Date().toISOString(),
      blob: lastBlobRef.current ?? new Blob([], { type: "audio/wav" }),
      status,
    }).catch(() => undefined);
  }

  async function begin() {
    stopClip();
    setConfused(false);
    setState("starting");
    try {
      stopperRef.current = await startMicWithTimeout();
      setState("recording");
    } catch {
      setState("nomic");
    }
  }

  function succeed(status: "heard" | "practiced") {
    playSuccess();
    setHeard(true);
    setState("result");
    setTimeout(() => {
      markSaved(status);
      doneRef.current(status);
    }, 1200);
  }

  async function fail() {
    failsRef.current += 1;
    setHeard(false);
    setState("checking");
    await playAskSequence(false);
    setState("result");
    playTryAgain();
    setTimeout(() => {
      if (failsRef.current >= 2) {
        markSaved("practiced");
        doneRef.current("practiced");
      } else setState("idle");
    }, 1200);
  }

  async function finish() {
    const stopper = stopperRef.current;
    if (!stopper) return;
    stopperRef.current = null;
    const blob = await stopper.stop();
    lastBlobRef.current = blob;
    attemptsRef.current += 1;
    try {
      await saveRecording({
        key: `${missionId}:${turnId}:complete`,
        missionId,
        turnId,
        targetEn,
        createdAt: new Date().toISOString(),
        blob,
      });
    } catch {
      /* la práctica sigue contando */
    }
    if (!listenEnabled || blob.type !== "audio/wav") return succeed("practiced");
    setState("checking");
    try {
      const result = await transcribe({ data: { audioBase64: await blobToBase64(blob) } });
      if (result.ok) {
        if (matchSpeech(result.text, targetEn, alias).kind === "heard") return succeed("heard");
        if (
          confusedTarget &&
          matchSpeech(result.text, confusedTarget, alias).kind === "heard" &&
          attemptsRef.current < 4
        ) {
          // Dijo la respuesta: cuenta como intento, no como fallo.
          setConfused(true);
          setState("idle");
          void playClip([
            "es-ask-confused",
            ...(Array.isArray(modelClip) ? modelClip : [modelClip]),
          ]);
          return;
        }
        return void fail();
      }
      if (result.reason === "no-se-entendio" || result.reason === "audio-vacio") {
        return void fail();
      }
    } catch {
      /* servicio caído: cuenta como practicado */
    }
    succeed("practiced");
  }

  return (
    <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-center text-card-foreground shadow-[var(--shadow-soft)]">
      <p className="font-display text-2xl leading-snug sm:text-3xl">{promptEs}</p>
      <p lang="en" className="mt-3 font-display text-3xl leading-tight text-accent sm:text-4xl">
        {targetEn}
      </p>
      <p className="mt-2 text-base font-semibold text-muted-foreground">Ahora repetilo vos</p>
      <button
        type="button"
        onClick={() => void playAskSequence()}
        className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
      >
        <Volume2 className="size-4" aria-hidden /> Escuchar otra vez
      </button>

      {confused ? (
        <div className="mx-auto mt-3 flex max-w-md animate-pop items-center gap-3 rounded-2xl border-2 border-sun bg-sun/15 p-3 text-left">
          <Pip
            mood="happy"
            color={progress.pip.color}
            stage={progress.pip.stage}
            feeds={progress.pip.feeds}
            accessories={progress.pip.accessories}
            size={Math.min(60, 44 + (pipSizeFor(progress.pip) - 64) * 0.1)}
            className="shrink-0"
          />
          <p className="font-display text-lg leading-snug">
            ¡Esa es la respuesta! Ahora te toca preguntar a vos. Escuchá.
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex min-h-32 flex-col items-center justify-center gap-2">
        {state === "idle" || state === "starting" ? (
          <>
            <button
              type="button"
              disabled={state === "starting"}
              onClick={() => void begin()}
              aria-label="Tocá y hablá"
              data-mic=""
              className="tap-target flex size-24 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {state === "starting" ? (
                <Loader2 className="size-10 animate-spin" aria-hidden />
              ) : (
                <Mic className="size-11" aria-hidden />
              )}
            </button>
            <p className="font-display text-xl text-accent">
              {failsRef.current > 0 ? "Probemos otra vez" : "Tocá y preguntá"}
            </p>
          </>
        ) : null}
        {state === "recording" ? (
          <button
            type="button"
            onClick={() => void finish()}
            aria-label="Listo, terminé de hablar"
            className="tap-target flex size-24 animate-mic-pulse items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-[var(--shadow-pop)]"
          >
            <Square className="size-10" aria-hidden />
          </button>
        ) : null}
        {state === "checking" ? (
          <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden /> Te estoy escuchando…
          </p>
        ) : null}
        {state === "result" ? (
          <p
            className={`animate-pop rounded-2xl px-5 py-3 font-display text-2xl ${heard ? "bg-success/15 text-success" : "bg-muted"}`}
          >
            <Ear className="mr-2 inline size-6" aria-hidden />
            {heard ? "¡Te escuché!" : "Probemos otra vez"}
          </p>
        ) : null}
        {state === "nomic" ? (
          <p className="flex items-center gap-2 font-display text-lg text-muted-foreground">
            <MicOff className="size-5" aria-hidden /> Decilo en voz alta y tocá “Lo dije”
          </p>
        ) : null}
      </div>

      {state !== "result" && state !== "checking" ? (
        <button
          type="button"
          onClick={() => {
            stopperRef.current = null;
            stopClip();
            if (!lastBlobRef.current) markSaved("pending");
            onDone("pending");
          }}
          className="tap-target mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          <Check className="size-5" aria-hidden /> Lo dije
        </button>
      ) : null}
    </div>
  );
}
