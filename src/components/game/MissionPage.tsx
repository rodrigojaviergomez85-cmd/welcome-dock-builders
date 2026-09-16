import { Link } from "@tanstack/react-router";
import { MissionPlayer } from "@/components/game/MissionPlayer";
import { AVATARS } from "@/content/characters";
import type { Mission } from "@/content/missions/types";
import { useProgress } from "@/lib/useProgress";
import { getMissionProgress } from "@/lib/progress";

type Props = { mission: Mission; previousId?: string; previousDayEs?: string };

/** Página de una misión: pide avatar, respeta el desbloqueo y abre el juego. */
export function MissionPage({ mission, previousId, previousDayEs }: Props) {
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
        <p className="text-muted-foreground">La misión usa tu nombre para presentarte en inglés.</p>
        <Link
          to="/perfil"
          className="tap-target inline-flex items-center rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          Elegir mi avatar
        </Link>
      </div>
    );
  }

  const previousDone = previousId ? getMissionProgress(state, previousId).completed : true;

  if (!previousDone) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-3xl">Todavía falta un día</h1>
        <p className="text-muted-foreground">
          Terminá la misión del {previousDayEs?.toLowerCase()} para abrir esta.
        </p>
        <Link
          to="/"
          className="tap-target inline-flex items-center rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
        >
          Volver al mapa
        </Link>
      </div>
    );
  }

  const avatar = AVATARS.find((a) => a.id === state.profile?.avatarId) ?? AVATARS[0];

  return (
    <MissionPlayer mission={mission} alias={state.profile.alias} avatarImage={avatar.image} />
  );
}
