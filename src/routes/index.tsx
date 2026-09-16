import { createFileRoute, Link } from "@tanstack/react-router";
import { Coins, Flame, Lock, Play, ShieldCheck, Sparkles, Star } from "lucide-react";
import { islandMap } from "@/content/backgrounds";
import { missions } from "@/content/missions";
import { AVATARS } from "@/content/characters";
import { useProgress } from "@/lib/useProgress";
import { getMissionProgress } from "@/lib/progress";

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

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">English4Kids</p>
          <h1 className="font-display text-3xl sm:text-4xl">Explorer Island</h1>
        </div>
        <div className="flex items-center gap-2">
          {ready && profile ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-full bg-sun/50 px-3 py-2 font-display">
                <Coins className="size-5" aria-hidden /> {state.coins ?? 0}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-2 font-display">
                <Flame className="size-5" aria-hidden /> {state.streak?.count ?? 0}
              </span>
              <Link
                to="/perfil"
                className="tap-target inline-flex items-center gap-2 rounded-full bg-card px-4 font-display shadow-[var(--shadow-soft)]"
              >
                <img src={avatar.image} alt={avatar.alt} className="size-10" />
                {profile.alias}
              </Link>
            </>
          ) : null}
          <Link
            to="/adulto"
            className="tap-target inline-flex items-center gap-2 rounded-full bg-secondary px-4 font-display text-secondary-foreground"
          >
            <ShieldCheck className="size-5" aria-hidden /> Adulto
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16">
        <div className="relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-soft)]">
          <img
            src={islandMap}
            alt="Mapa ilustrado de Explorer Island con cinco zonas"
            width={1536}
            height={1024}
            className="w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            {ready && !profile ? (
              <Link
                to="/perfil"
                className="tap-target inline-flex items-center gap-2 rounded-full bg-accent px-6 font-display text-lg text-accent-foreground shadow-[var(--shadow-pop)]"
              >
                <Sparkles className="size-5" aria-hidden /> Elegir mi avatar para empezar
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">Los cinco días de la semana</h2>
          <p className="flex items-center gap-1 rounded-full bg-card px-4 py-2 text-sm shadow-[var(--shadow-soft)]">
            Pase de la semana:
            {missions.map((m) => (
              <Star
                key={m.id}
                className={pieces.includes(m.id) ? "size-5 text-success" : "size-5 text-muted-foreground/40"}
                aria-hidden
              />
            ))}
          </p>
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
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
                    ? "rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]"
                    : "rounded-3xl border-2 border-dashed border-border bg-muted/60 p-5"
                }
              >
                <p className="text-sm text-muted-foreground">
                  {mission.dayEs} · {unlocked ? "Zona abierta" : "Zona cerrada"}
                </p>
                <h3 className="font-display text-2xl">{mission.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{mission.objective}</p>

                {ready && unlocked ? (
                  <p className="mt-3 text-sm">
                    {progress.completed
                      ? `Terminada ${progress.completions} vez(ces). Podés repetirla para practicar.`
                      : progress.started
                        ? "Empezada: podés continuar donde quedaste."
                        : "Sin empezar."}
                  </p>
                ) : null}

                {unlocked ? (
                  <Link
                    to={PATHS[mission.id as keyof typeof PATHS]}
                    className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
                  >
                    <Play className="size-5" aria-hidden />
                    {progress.started && !progress.completed ? "Continuar" : "Jugar"}
                  </Link>
                ) : (
                  <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted-foreground">
                    <Lock className="size-4" aria-hidden /> Se abre al terminar el día anterior
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-8 rounded-3xl bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
          Versión de prueba: los dibujos y las voces son provisionales y se sustituirán por arte y
          grabaciones revisadas. El progreso y las grabaciones se guardan solo en este dispositivo.
        </p>
      </main>
    </div>
  );
}
