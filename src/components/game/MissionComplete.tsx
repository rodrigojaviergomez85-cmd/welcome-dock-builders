import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Mic, Ear, RotateCcw, Volume2 } from "lucide-react";
import type { Mission } from "@/content/missions/types";
import type { MissionProgress } from "@/lib/progress";
import { playFanfare } from "@/lib/feedback-sounds";
import { REVIEW_PHRASES, gloss } from "@/content/glossary";
import { playClip } from "@/lib/audio";

type Props = {
  mission: Mission;
  progress: MissionProgress;
  alias: string;
  avatarImage: string;
  onReplay: () => void;
};

export function MissionComplete({ mission, progress, alias, avatarImage, onReplay }: Props) {
  useEffect(() => {
    playFanfare();
  }, []);

  const oralLabel =
    progress.oral.recordings > 0
      ? `Frases dichas: ${progress.oral.recordings}. El juego entendió ${progress.oral.understood}`
      : progress.oral.status === "pending-no-mic"
        ? "Práctica oral: pendiente (no se habló todavía)"
        : "Práctica oral: sin frases dichas todavía";

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <img src={avatarImage} alt={`Tu avatar, ${alias}`} className="h-32 w-auto animate-pop" />
      <h1 className="font-display text-4xl">¡Misión terminada!</h1>
      <p className="text-muted-foreground">
        {mission.dayEs} · {mission.title}
      </p>

      <div className="w-full rounded-3xl bg-card p-6 text-left shadow-[var(--shadow-soft)]">
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
          {REVIEW_PHRASES.map((phrase) => {
            const g = gloss(phrase);
            const text = phrase.replace("{alias}", alias);
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
                      {g.es.split("{alias}").join(alias)}
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
