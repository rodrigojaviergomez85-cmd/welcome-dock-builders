import { cn } from "@/lib/utils";
import { CHARACTERS, type CharacterId } from "@/content/characters";

type Props = {
  id: CharacterId;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  state?: "idle" | "correct" | "wrong" | "dim";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

const SIZES = {
  sm: "h-24 sm:h-28",
  md: "h-36 sm:h-48",
  lg: "h-48 sm:h-72",
};

export function CharacterFigure({
  id,
  size = "md",
  showName = false,
  state = "idle",
  onClick,
  className,
  ariaLabel,
}: Props) {
  const character = CHARACTERS[id];
  const content = (
    <>
      <img
        src={character.image}
        alt={character.alt}
        loading="lazy"
        className={cn(
          "w-auto object-contain drop-shadow-[0_12px_18px_oklch(0.3_0.05_250/0.25)]",
          SIZES[size],
          state === "correct" && "animate-bob",
          state === "wrong" && "animate-nudge",
          state === "dim" && "opacity-40 saturate-50",
        )}
      />
      {showName ? (
        <span className="rounded-full bg-card px-4 py-1 font-display text-lg text-card-foreground shadow-[var(--shadow-soft)]">
          {character.name}
        </span>
      ) : null}
    </>
  );

  if (!onClick) {
    return <div className={cn("flex flex-col items-center gap-2", className)}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? `Elegir a ${character.name}`}
      className={cn(
        "tap-target flex flex-col items-center gap-2 rounded-3xl p-2 transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-ring active:scale-95",
        state === "correct" && "bg-success/20 ring-4 ring-success",
        state === "wrong" && "bg-destructive/10 ring-4 ring-destructive",
        className,
      )}
    >
      {content}
    </button>
  );
}
