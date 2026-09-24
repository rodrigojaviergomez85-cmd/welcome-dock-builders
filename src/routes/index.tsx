import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Flame, Lock, Play, ShieldCheck, Sparkles, Star } from "lucide-react";
import { islandMap } from "@/content/backgrounds";
import { missions } from "@/content/missions";
import { AVATARS } from "@/content/characters";
import { useProgress } from "@/lib/useProgress";
import { getMissionProgress } from "@/lib/progress";
import { PipHome, currentPipDay } from "@/components/game/PipHome";
import { today } from "@/lib/economy";

const description =
  "Juego de inglés para niños de 8 a 12 años. Semana 1 completa: saludos, países, números, alfabeto y tu presentación.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explorer Island — Semana 1 de inglés para niños" },
      { name: "description", content: description },
      { property: "og:title", content: "Explorer Island — Semana 1 de inglés para niños" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IslandMap,
});

const PATHS = {
  monday: "/mision/lunes",
  tuesday: "/mision/martes",
  wednesday: "/mision/miercoles",
  thursday: "/mision/jueves",
  friday: "/mision/viernes",
} as const;

function IslandMap() {
  const { state, ready } = useProgress();
  const profile = state.profile;
  const avatar = AVATARS.find((a) => a.id === profile?.avatarId) ?? AVATARS[0];
  const pieces = state.passPieces ?? [];
  const completed = missions
    .filter((mission) => getMissionProgress(state, mission.id).completed)
    .map((mission) => mission.id);
  const day = currentPipDay(completed);
  const next = missions.find((mission) => !completed.includes(mission.id)) ?? missions[0];
  const pipStage = Math.min(4, Math.max(0, state.pip.stage));
  const known = Math.max(state.pip.learned.length, state.pip.totalFeeds);
  const feedsToEvolve = next?.pip?.feedsToEvolve ?? 8;
  const missing = Math.max(1, feedsToEvolve - state.pip.feeds);

  return (
    <div className="min-h-screen">
      <header className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3 sm:p-4">
        <div className="min-w-0 md:flex md:items-baseline md:gap-2">
          <p className="hidden truncate text-xs text-muted-foreground sm:block sm:text-sm">
            English4Kids
          </p>
          <h1 className="truncate font-display text-xl sm:text-3xl">Explorer Island</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {ready && profile ? (
            <>
              <span className="inline-flex h-10 items-center gap-1 rounded-full bg-sun/50 px-2 font-display sm:px-3">
                <Coins className="size-5" aria-hidden /> {state.coins ?? 0}
              </span>
              <span className="inline-flex h-10 items-center gap-1 rounded-full bg-accent/20 px-2 font-display sm:px-3">
                <Flame className="size-5" aria-hidden /> {state.streak?.count ?? 0}
              </span>
              <Link
                to="/perfil"
                className="tap-target inline-flex h-10 max-w-36 items-center gap-2 rounded-full bg-card px-2 font-display shadow-[var(--shadow-soft)] sm:max-w-48 sm:px-3"
              >
                <img src={avatar.image} alt={avatar.alt} className="size-8 shrink-0" />
                <span className="hidden truncate sm:inline">{profile.alias}</span>
              </Link>
            </>
          ) : null}
          <Link
            to="/adulto"
            className="tap-target inline-flex h-10 items-center gap-2 rounded-full bg-secondary px-2 font-display text-secondary-foreground sm:px-3"
          >
            <ShieldCheck className="size-5" aria-hidden />{" "}
            <span className="hidden sm:inline">Adulto</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10">
        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,2fr)_minmax(15rem,1fr)]">
          <div className="min-w-0">
            <div className="relative isolate aspect-[3/2] overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]">
              <img
                src={islandMap}
                alt="Mapa ilustrado de Explorer Island con cinco zonas"
                width={1536}
                height={1024}
                className="size-full object-cover"
              />
              {ready && profile ? (
                <PipHome
                  pip={state.pip}
                  day={day}
                  feedsToEvolve={feedsToEvolve}
                  asleep={state.streak?.lastDay !== today()}
                  missionPath={next ? PATHS[next.id as keyof typeof PATHS] : null}
                />
              ) : null}
              {ready && !profile ? (
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background/80 to-transparent p-4 sm:p-6">
                  <Link
                    to="/perfil"
                    className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)]"
                  >
                    <Sparkles className="size-5" aria-hidden /> Elegir mi avatar para empezar
                  </Link>
                </div>
              ) : null}
            </div>
            {ready && profile ? (
              <p className="mt-3 text-center font-display text-base sm:text-lg">
                Pip sabe {known} {known === 1 ? "frase" : "frases"} ·{" "}
                {pipStage >= 4 ? "ya es gigante" : `le faltan ${missing} para crecer`}
              </p>
            ) : null}
          </div>
          <section aria-labelledby="week-title" className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 md:block">
              <h2 id="week-title" className="font-display text-xl md:sr-only">
                Los cinco días de la semana
              </h2>
              <p className="flex items-center gap-1 rounded-full bg-card px-3 py-2 text-xs shadow-[var(--shadow-soft)] md:justify-center md:text-sm">
                Pase de la semana:
                {missions.map((mission) => (
                  <Star
                    key={mission.id}
                    className={
                      pieces.includes(mission.id)
                        ? "size-4 text-success"
                        : "size-4 text-muted-foreground/40"
                    }
                    aria-hidden
                  />
                ))}
              </p>
            </div>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-1 md:gap-2">
              {missions.map((mission, index) => {
                const progress = getMissionProgress(state, mission.id);
                const previous = missions[index - 1];
                const unlocked =
                  !previous || getMissionProgress(state, previous.id).completed || progress.started;

                return (
                  <li
                    key={mission.id}
                    className={
                      unlocked
                        ? "rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)] md:p-3"
                        : "rounded-2xl border-2 border-dashed border-border bg-muted/60 p-4 md:p-3"
                    }
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          {mission.dayEs} · {unlocked ? "Zona abierta" : "Zona cerrada"}
                        </p>
                        <h3 className="truncate font-display text-lg sm:text-xl md:text-lg">
                          {mission.title}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground md:hidden">
                          {mission.objective}
                        </p>

                        {ready && unlocked ? (
                          <p className="mt-2 text-sm md:hidden">
                            {progress.completed
                              ? `Terminada ${progress.completions} vez(ces). Podés repetirla para practicar.`
                              : progress.started
                                ? "Empezada: podés continuar donde quedaste."
                                : "Sin empezar."}
                          </p>
                        ) : null}
                      </div>

                      {unlocked ? (
                        <Link
                          to={PATHS[mission.id as keyof typeof PATHS]}
                          className="tap-target inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 font-display text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none md:size-11 md:px-0"
                          aria-label={`${progress.started && !progress.completed ? "Continuar" : "Jugar"}: ${mission.title}`}
                        >
                          <Play className="size-5" aria-hidden />
                          <span className="md:hidden">
                            {progress.started && !progress.completed ? "Continuar" : "Jugar"}
                          </span>
                        </Link>
                      ) : (
                        <p
                          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-card text-muted-foreground"
                          aria-label="Se abre al terminar el día anterior"
                        >
                          <Lock className="size-4" aria-hidden />
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <p className="mt-6 rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-[var(--shadow-soft)] md:hidden">
          Versión de prueba: los dibujos y las voces son provisionales y se sustituirán por arte y
          grabaciones revisadas. El progreso y las grabaciones se guardan solo en este dispositivo.
        </p>
      </main>
    </div>
  );
}
