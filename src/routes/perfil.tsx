import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { AVATARS } from "@/content/characters";
import { BAGS } from "@/content/characters";
import { DEFAULT_PIP_COLOR, Pip, PIP_COLORS } from "@/components/game/Pip";
import { useProgress } from "@/lib/useProgress";
import { pipSizeFor } from "@/lib/progress";
import { getMissionProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Tu avatar de explorador — Explorer Island" },
      {
        name: "description",
        content:
          "Elegí un avatar y un nombre corto de explorador. No hace falta el nombre real ni ningún dato personal.",
      },
      { property: "og:title", content: "Tu avatar de explorador — Explorer Island" },
      {
        property: "og:description",
        content: "Elegí un avatar y un alias corto de explorador, sin datos personales reales.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { state, ready, update } = useProgress();
  const navigate = useNavigate();
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [alias, setAlias] = useState("");
  const [pipColor, setPipColor] = useState<string>(DEFAULT_PIP_COLOR);

  useEffect(() => {
    if (!ready || !state.profile) return;
    setAvatarId(state.profile.avatarId);
    setAlias(state.profile.alias);
    setPipColor(state.pip.color ?? state.profile.pipColor ?? DEFAULT_PIP_COLOR);
  }, [ready, state.pip.color, state.profile]);

  const cleanAlias = alias.trim().slice(0, 12);
  const valid = cleanAlias.length >= 2;
  const hasNameTag = getMissionProgress(state, "monday").rewards.includes("sun-tag");

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
        Elegí una carita y un nombre de personaje. Puede ser inventado: no se pide el nombre real,
        ni fecha de nacimiento, ni dirección, ni fotos.
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
            <div className="relative mx-auto w-fit">
              <img src={avatar.image} alt={avatar.alt} className="h-24 w-auto" />
              {hasNameTag && avatarId === avatar.id ? (
                <div className="absolute -bottom-2 -right-8">
                  <img
                    src={BAGS.green.image}
                    alt="Mochila con tu etiqueta"
                    className="h-14 w-auto"
                  />
                  <span className="absolute inset-x-1 top-6 truncate rounded bg-card px-1 text-center font-display text-[9px] text-card-foreground">
                    {cleanAlias}
                  </span>
                </div>
              ) : null}
            </div>
          </button>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="pip-color-title">
        <h2 id="pip-color-title" className="font-display text-2xl">
          Elegí a tu Pip
        </h2>
        <p className="mt-1 text-muted-foreground">Va a acompañarte cuando hablás en inglés.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Pip
            mood="happy"
            color={pipColor}
            stage={state.pip.stage}
            feeds={state.pip.feeds}
            accessories={state.pip.accessories}
            size={Math.min(180, pipSizeFor(state.pip))}
            className="mr-2"
          />
          {PIP_COLORS.map((color, index) => (
            <button
              key={color}
              type="button"
              onClick={() => setPipColor(color)}
              aria-label={`Color ${index + 1} para Pip`}
              aria-pressed={pipColor === color}
              className={cn(
                "tap-target rounded-full border-4 border-card shadow-[var(--shadow-soft)] transition-transform active:scale-90",
                pipColor === color && "ring-4 ring-primary ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: color }}
            >
              {pipColor === color ? (
                <Check className="mx-auto size-6 text-card" aria-hidden />
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <label className="mt-8 block font-display text-xl" htmlFor="alias">
        Tu nombre (2 a 12 letras)
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
          update((prev) => ({
            ...prev,
            profile: { ...prev.profile, avatarId, alias: cleanAlias, pipColor },
            pip: { ...prev.pip, color: pipColor },
          }));
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
