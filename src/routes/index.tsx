import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Play, ShieldCheck, Sparkles } from "lucide-react";
import { islandMap } from "@/content/backgrounds";
import { mondayMission, upcomingMissions } from "@/content/missions";
import { AVATARS } from "@/content/characters";
import { useProgress } from "@/lib/useProgress";
import { getMissionProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Explorer Island — Kids Platform de English4Kids" },
      {
        name: "description",
        content:
          "Juego de inglés para niños de 8 a 12 años. Misión del lunes: el muelle de bienvenida, con saludos y presentaciones.",
      },
      { property: "og:title", content: "Explorer Island — Kids Platform de English4Kids" },
      {
        property: "og:description",
        content:
          "Juego de inglés para niños de 8 a 12 años. Misión del lunes: el muelle de bienvenida, con saludos y presentaciones.",
      },
    ],
  }),
  component: IslandMap,
});

function IslandMap() {
  const { state, ready } = useProgress();
  const profile = state.profile;
  const monday = getMissionProgress(state, mondayMission.id);
  const avatar = AVATARS.find((a) => a.id === profile?.avatarId) ?? AVATARS[0];

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-sm text-muted-foreground">English4Kids</p>
          <h1 className="font-display text-3xl sm:text-4xl">Explorer Island</h1>
        </div>
        <div className="flex items-center gap-2">
          {ready && profile ? (
            <Link
              to="/perfil"
              className="tap-target inline-flex items-center gap-2 rounded-full bg-card px-4 font-display shadow-[var(--shadow-soft)]"
            >
              <img src={avatar.image} alt={avatar.alt} className="size-10" />
              {profile.alias}
            </Link>
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

        <h2 className="mt-8 font-display text-2xl">Las cinco zonas de la semana</h2>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <li className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-muted-foreground">{mondayMission.dayEs} · Zona abierta</p>
            <h3 className="font-display text-2xl">{mondayMission.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{mondayMission.objective}</p>

            {ready ? (
              <p className="mt-3 text-sm">
                {monday.completed
                  ? `Terminada ${monday.completions} vez(ces). Podés repetirla para practicar.`
                  : monday.started
                    ? "Empezada: podés continuar donde quedaste."
                    : "Sin empezar."}
              </p>
            ) : null}

            <Link
              to="/mision/lunes"
              className="tap-target mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
            >
              <Play className="size-5" aria-hidden />
              {monday.started && !monday.completed ? "Continuar" : "Jugar"}
            </Link>
          </li>

          {upcomingMissions.map((mission) => (
            <li
              key={mission.id}
              className="rounded-3xl border-2 border-dashed border-border bg-muted/60 p-5"
            >
              <p className="text-sm text-muted-foreground">{mission.dayEs} · Próxima entrega</p>
              <h3 className="font-display text-2xl text-muted-foreground">{mission.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{mission.objective}</p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-muted-foreground">
                <Lock className="size-4" aria-hidden /> Todavía no está construida
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-3xl bg-card p-5 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
          Versión de prueba: los dibujos y las voces son provisionales y se sustituirán por arte y
          grabaciones revisadas. El progreso y las grabaciones se guardan solo en este dispositivo.
        </p>
      </main>
    </div>
  );
}
