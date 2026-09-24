import { useEffect, useState } from "react";
import { Pip } from "./Pip";
import { PipMoveScene } from "./PipMoveScene";
import { listRecordings } from "@/lib/recordings";
import { Sun, Ticket } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Backpack, Check, Mic, Ear, RotateCcw, Volume2 } from "lucide-react";
import type { Mission } from "@/content/missions/types";
import { pipSizeFor, type MissionProgress } from "@/lib/progress";
import { playFanfare } from "@/lib/feedback-sounds";
import { REVIEW_PHRASES, gloss } from "@/content/glossary";
import { playClip } from "@/lib/audio";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText } from "@/lib/mission-vars";
import { Coins, Flame } from "lucide-react";

type Props = {
  mission: Mission;
  progress: MissionProgress;
  alias: string;
  avatarImage: string;
  onReplay: () => void;
  /** Si Pip evolucionó en esta misión: etapa (casa) anterior. */
  homeFrom?: number;
};

export function MissionComplete({
  mission,
  progress,
  alias,
  avatarImage,
  onReplay,
  homeFrom,
}: Props) {
  const { state } = useProgress();
  const [movingDone, setMovingDone] = useState(homeFrom === undefined);
  const vars = missionVars(state.profile, alias);
  const phrases = mission.reviewPhrases ?? REVIEW_PHRASES;
  const [presentationUrl, setPresentationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mission.id !== "monday") return;
    let url: string | null = null;
    void listRecordings()
      .then((all) => {
        const rec = all.find((r) => r.key === "presentation-day1");
        if (rec && rec.blob.size > 0) {
          url = URL.createObjectURL(rec.blob);
          setPresentationUrl(url);
        }
      })
      .catch(() => undefined);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [mission.id]);

  useEffect(() => {
    playFanfare();
  }, []);

  const oralLabel =
    progress.oral.recordings > 0
      ? `Frases dichas: ${progress.oral.recordings}. El juego entendió ${progress.oral.understood}`
      : progress.oral.status === "pending-no-mic"
        ? "Práctica oral: pendiente (no se habló todavía)"
        : "Práctica oral: sin frases dichas todavía";

  if (!movingDone && homeFrom !== undefined) {
    return (
      <PipMoveScene
        from={homeFrom}
        to={state.pip.stage}
        pip={state.pip}
        onContinue={() => setMovingDone(true)}
      />
    );
  }

  if (mission.id === "monday") {
    const said = progress.oral.said ?? progress.oral.recordings;
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-5 p-6 text-center">
        <h1 className="font-display text-4xl">¡Misión completada!</h1>
        <Pip
          mood="happy"
          color={state.pip.color}
          stage={state.pip.stage}
          feeds={state.pip.feeds}
          accessories={state.pip.accessories}
          size={Math.min(224, pipSizeFor(state.pip))}
          className="animate-pop"
        />
        <div className="w-full rounded-2xl border-4 border-dashed border-accent bg-card px-5 py-4">
          <p lang="en" className="font-display text-3xl">
            {alias}
          </p>
          <p lang="en" className="text-sm text-muted-foreground">
            My name is {alias}.
          </p>
        </div>
        {presentationUrl ? (
          <div className="w-full rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="mb-2 font-display text-lg">Tu presentación de hoy</p>
            <audio
              controls
              src={presentationUrl}
              aria-label="Escuchar tu presentación de hoy"
              className="w-full"
            />
          </div>
        ) : null}
        <div className="w-full rounded-3xl bg-sun/40 p-5 shadow-[var(--shadow-soft)]">
          <p className="flex items-center justify-center gap-2 font-display text-xl">
            <Ticket className="size-6" aria-hidden /> Ticket para la clase
          </p>
          <div className="mt-3 flex justify-center gap-6 font-display text-2xl">
            <span className="flex items-center gap-1">
              <Sun className="size-7 fill-current text-accent" aria-hidden /> 4
            </span>
            <span className="flex items-center gap-1">
              <Mic className="size-7" aria-hidden /> {said}
            </span>
          </div>
          <p className="sr-only">4 soles ganados, {said} oraciones dichas.</p>
          <p lang="en" className="mt-4 rounded-2xl bg-card px-4 py-3 font-display text-2xl">
            Tomorrow: Where is Leo from?
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Hoy tu hijo aprendió los cuatro saludos y a decir su nombre. Preguntale:{" "}
          <span lang="en">What is your name?</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="tap-target inline-flex items-center rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
          >
            Volver al mapa
          </Link>
          <button
            type="button"
            onClick={onReplay}
            aria-label="Jugar otra vez"
            className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-6 font-display text-lg text-secondary-foreground"
          >
            <RotateCcw className="size-5" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <img src={avatarImage} alt={`Tu avatar, ${alias}`} className="h-32 w-auto animate-pop" />
      <h1 className="font-display text-4xl">¡Misión completada!</h1>
      <p className="text-muted-foreground">
        {mission.dayEs} · {mission.title}
      </p>

      <div className="w-full rounded-3xl bg-card p-6 text-left shadow-[var(--shadow-soft)]">
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-sun/40 px-4 py-3 font-display text-xl">
            <Coins className="size-6" aria-hidden /> {state.coins ?? 0} monedas
          </p>
          <p className="flex items-center justify-center gap-2 rounded-2xl bg-accent/20 px-4 py-3 font-display text-xl">
            <Flame className="size-6" aria-hidden /> Racha: {state.streak?.count ?? 1} día(s)
          </p>
        </div>
        {mission.id === "monday" ? (
          <p className="mb-4 flex items-center justify-center gap-2 rounded-2xl bg-success/15 px-4 py-3 font-display text-xl text-success">
            <Backpack className="size-6" aria-hidden /> 4 de 4 mochilas rescatadas
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Piezas del pase de la semana: {(state.passPieces ?? []).length} de 5
        </p>
        <p className="font-display text-xl">Tu pase de explorador</p>
        <div className="mt-3 rounded-2xl border-4 border-dashed border-accent px-5 py-4 text-center">
          <p lang="en" className="font-display text-2xl">
            My name is {alias}.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Etiqueta conseguida</p>
        </div>

        <ul className="mt-5 space-y-3 text-sm">
          <li className="flex items-start gap-2">
            <Check className="mt-0.5 size-5 text-success" aria-hidden />
            Misión completada {progress.completions} vez(ces). Repetir cuenta como práctica y no da
            recompensas nuevas.
          </li>
          <li className="flex items-start gap-2">
            <Ear className="mt-0.5 size-5 text-primary" aria-hidden />
            Comprensión observada: {progress.comprehension.correct} aciertos en{" "}
            {progress.comprehension.attempts} intentos. Ayudas usadas: {progress.helpsUsed}.
          </li>
          <li className="flex items-start gap-2">
            <Mic className="mt-0.5 size-5 text-accent" aria-hidden />
            {oralLabel}.
          </li>
        </ul>

        <p className="mt-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Esto no es una certificación de nivel. “Entendido” significa que el juego reconoció las
          palabras de la frase, con cualquier nombre; no es una nota de pronunciación.
        </p>
      </div>

      <div className="w-full rounded-3xl bg-card p-6 text-left shadow-[var(--shadow-soft)]">
        <p className="font-display text-xl">Las palabras de hoy</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tocá el altavoz para escucharlas otra vez en inglés o en español.
        </p>
        <ul className="mt-4 space-y-3">
          {phrases.map((phrase) => {
            const g = gloss(phrase);
            const text = fillText(phrase, vars);
            return (
              <li
                key={phrase}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-secondary/40 px-4 py-3"
              >
                <span>
                  <span lang="en" className="block font-display text-xl">
                    {text}
                  </span>
                  {g?.es ? (
                    <span className="block text-sm text-muted-foreground">
                      {fillText(g.es.split("{age}").join(vars.ageEs), vars)}
                    </span>
                  ) : null}
                </span>
                <span className="flex items-center gap-2">
                  {g?.slowClip ? (
                    <button
                      type="button"
                      onClick={() => void playClip(g.slowClip!)}
                      aria-label={`Escuchar en inglés: ${text}`}
                      className="tap-target inline-flex h-12 items-center gap-2 rounded-full bg-primary px-4 font-display text-primary-foreground"
                    >
                      <Volume2 className="size-5" aria-hidden /> EN
                    </button>
                  ) : null}
                  {g?.esClip ? (
                    <button
                      type="button"
                      onClick={() => void playClip(g.esClip!)}
                      aria-label={`Escuchar en español: ${g.es}`}
                      className="tap-target inline-flex h-12 items-center gap-2 rounded-full bg-sun/60 px-4 font-display text-foreground"
                    >
                      <Volume2 className="size-5" aria-hidden /> ES
                    </button>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="tap-target inline-flex items-center rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          Volver al mapa
        </Link>
        <button
          type="button"
          onClick={onReplay}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-6 font-display text-lg text-secondary-foreground"
        >
          <RotateCcw className="size-5" aria-hidden /> Jugar otra vez
        </button>
      </div>
    </div>
  );
}
