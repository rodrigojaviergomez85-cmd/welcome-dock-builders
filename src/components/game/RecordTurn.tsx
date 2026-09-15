import { useEffect, useRef, useState } from "react";
import { Mic, Square, RotateCcw, ArrowRight, MicOff, Ear, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AudioButton } from "./AudioButton";
import { micSupported, startRecording } from "@/lib/recorder";
import { startWavRecording, wavRecordingSupported, blobToBase64 } from "@/lib/wav-recorder";
import { saveRecording } from "@/lib/recordings";
import { stopClip } from "@/lib/audio";
import { gloss } from "@/content/glossary";
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

type State = "intent" | "fragment-listen" | "fragment-echo" | "complete" | "recording" | "checking" | "result" | "nomic";

type PracticeFragment = { en: string; es: string; clip: string };

function practiceFragments(targetEn: string, alias: string): PracticeFragment[] {
  const fragments: PracticeFragment[] = [];
  if (/hello/i.test(targetEn)) fragments.push({ en: "Hello!", es: "¡Hola!", clip: "model-hello" });
  if (/good afternoon/i.test(targetEn)) {
    fragments.push({ en: "Good afternoon!", es: "¡Buenas tardes!", clip: "model-good-afternoon" });
  }
  if (/my name is/i.test(targetEn)) {
    fragments.push({ en: `My name is ${alias}.`, es: `Me llamo ${alias}.`, clip: "model-my-name-is" });
  }
  if (/i am fine/i.test(targetEn)) fragments.push({ en: "I am fine.", es: "Estoy bien.", clip: "model-i-am-fine" });
  return fragments.length > 0
    ? fragments
    : [{ en: targetEn, es: gloss(targetEn, alias)?.es ?? targetEn, clip: "model-hello" }];
}

export function RecordTurn({
  missionId,
  turnId,
  promptEs,
  targetEn,
  alias = "",
  modelClip,
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

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const fragments = practiceFragments(targetEn, alias);
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
        key: `${missionId}:${turnId}:${recordingFull ? "complete" : `part-${fragmentIndex}`}`,
        missionId,
        turnId,
        targetEn: practiceTarget,
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
  const g = gloss(targetEn, alias);
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
          <span className={`mt-1 block text-xs font-semibold ${index === step ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
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
        {spanishPlayed ? (
          <button
            type="button"
            onClick={() => setState("fragment-listen")}
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            Ya entendí <ArrowRight className="size-5" aria-hidden />
          </button>
        ) : null}
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
          <p lang="en" className="font-display text-3xl leading-tight">{fragment.en}</p>
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
        ) : (
          <button
            type="button"
            onClick={() => micAvailable ? void begin(false) : setState("nomic")}
            className="tap-target mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            <Mic className="size-6" aria-hidden /> Repetí esta parte
          </button>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">Parte {fragmentIndex + 1} de {fragments.length}</p>
      </div>
    );
  }

  if (state === "complete") {
    return (
      <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 text-center text-card-foreground shadow-[var(--shadow-soft)]">
        <Progress />
        <p className="font-display text-2xl text-primary">¡Ahora completa!</p>
        <div className="mt-3 rounded-2xl border-2 border-sun bg-background/80 p-5">
          <p lang="en" className="font-display text-3xl leading-tight">{targetEn}</p>
          <p className="mt-2 text-base text-muted-foreground">{g?.es?.split("{alias}").join(alias)}</p>
        </div>
        <button
          type="button"
          onClick={() => micAvailable ? void begin(true) : setState("nomic")}
          className="tap-target mx-auto mt-6 flex size-24 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          aria-label="Tocá y hablá"
        >
          <Mic className="size-11" aria-hidden />
        </button>
        <p className="mt-3 font-display text-xl text-accent">Tocá y hablá</p>
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
        <p lang="en" className="font-display text-2xl">{practiceTarget}</p>
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
            {recordingFull ? "Seguir" : "Siguiente parte"} <ArrowRight className="size-5" aria-hidden />
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
                className="tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)]"
              >
                <RotateCcw className="size-5" aria-hidden /> Otra vez
              </button>
              ) : null}
              <button
                type="button"
                onClick={continueAfterResult}
                className={heard
                  ? "tap-target flex w-full items-center justify-center gap-2 rounded-2xl bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
                  : "px-2 py-2 text-sm text-muted-foreground underline underline-offset-4"}
              >
                {recordingFull ? "Seguir" : fragmentIndex + 1 < fragments.length ? "Siguiente parte" : "Decirla completa"} <ArrowRight className="size-5" aria-hidden />
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
              ? recordingFull ? "¡Dijiste la frase! Cualquier nombre está bien." : "¡Muy bien! Ya practicamos esta parte."
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
