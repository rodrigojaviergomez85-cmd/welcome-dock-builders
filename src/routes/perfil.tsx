import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { AVATARS } from "@/content/characters";
import { useProgress } from "@/lib/useProgress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tu avatar de explorador — Explorer Island" },
      {
        name: "description",
        content:
          "Elegí un avatar y un alias corto de explorador. No hace falta el nombre real ni ningún dato personal.",
      },
      { property: "og:title", content: "Tu avatar de explorador — Explorer Island" },
      {
        property: "og:description",
        content: "Elegí un avatar y un alias corto de explorador, sin datos personales reales.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { state, ready, update } = useProgress();
  const navigate = useNavigate();
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [alias, setAlias] = useState("");

  useEffect(() => {
    if (!ready || !state.profile) return;
    setAvatarId(state.profile.avatarId);
    setAlias(state.profile.alias);
  }, [ready, state.profile]);

  const cleanAlias = alias.trim().slice(0, 12);
  const valid = cleanAlias.length >= 2;

  return (
    <div className="mx-auto max-w-3xl p-4 pb-16">
      <Link
        to="/"
        className="tap-target inline-flex items-center gap-2 rounded-full bg-card px-4 font-display shadow-[var(--shadow-soft)]"
      >
        <ArrowLeft className="size-5" aria-hidden /> Mapa
      </Link>

      <h1 className="mt-6 font-display text-3xl">Tu avatar de explorador</h1>
      <p className="mt-2 text-muted-foreground">
        Elegí una carita y un nombre de personaje. Puede ser inventado: no se pide el nombre real, ni
        fecha de nacimiento, ni dirección, ni fotos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => setAvatarId(avatar.id)}
            aria-pressed={avatarId === avatar.id}
            className={cn(
              "tap-target rounded-3xl bg-card p-3 shadow-[var(--shadow-soft)] transition-transform active:scale-95",
              avatarId === avatar.id && "ring-4 ring-primary",
            )}
          >
            <img src={avatar.image} alt={avatar.alt} className="mx-auto h-24 w-auto" />
          </button>
        ))}
      </div>

      <label className="mt-8 block font-display text-xl" htmlFor="alias">
        Tu alias (2 a 12 letras)
      </label>
      <input
        id="alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        maxLength={12}
        placeholder="Alex"
        autoComplete="off"
        className="mt-2 w-full rounded-2xl border-2 border-input bg-card px-5 py-4 font-display text-2xl outline-none focus-visible:border-primary"
      />

      <button
        type="button"
        disabled={!valid}
        onClick={() => {
          update((prev) => ({ ...prev, profile: { avatarId, alias: cleanAlias } }));
          void navigate({ to: "/" });
        }}
        className={cn(
          "tap-target mt-6 inline-flex items-center gap-2 rounded-full px-6 font-display text-lg shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none",
          valid
            ? "bg-primary text-primary-foreground"
            : "cursor-not-allowed bg-muted text-muted-foreground shadow-none",
        )}
      >
        <Check className="size-5" aria-hidden /> Guardar y volver al mapa
      </button>
    </div>
  );
}
