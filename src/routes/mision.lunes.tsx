import { createFileRoute, Link } from "@tanstack/react-router";
import { MissionPlayer } from "@/components/game/MissionPlayer";
import { mondayMission } from "@/content/missions";
import { AVATARS } from "@/content/characters";
import { useProgress } from "@/lib/useProgress";

export const Route = createFileRoute("/mision/lunes")({
  head: () => ({
    meta: [
      { title: "Lunes: El muelle de bienvenida — Explorer Island" },
      {
        name: "description",
        content:
          "Misión del lunes: saludar, entender What is your name? y presentarse con My name is… en el muelle de Explorer Island.",
      },
      { property: "og:title", content: "Lunes: El muelle de bienvenida — Explorer Island" },
      {
        property: "og:description",
        content: "Saludos y presentaciones en inglés para niños que empiezan Level 0.",
      },
    ],
  }),
  component: MondayMissionPage,
});

function MondayMissionPage() {
  const { state, ready } = useProgress();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-xl text-muted-foreground">Cargando la isla…</p>
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-3xl">Primero elegí tu avatar</h1>
        <p className="text-muted-foreground">
          La misión usa tu alias para presentarte en inglés.
        </p>
        <Link
          to="/perfil"
          className="tap-target inline-flex items-center rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          Elegir mi avatar
        </Link>
      </div>
    );
  }

  const avatar = AVATARS.find((a) => a.id === state.profile?.avatarId) ?? AVATARS[0];

  return (
    <MissionPlayer
      mission={mondayMission}
      alias={state.profile.alias}
      avatarImage={avatar.image}
    />
  );
}
