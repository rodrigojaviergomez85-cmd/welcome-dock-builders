import { useId } from "react";
import { cn } from "@/lib/utils";

export type PipMood = "sleepy" | "happy" | "eat";

type Props = {
  mood: PipMood;
  color: string;
  className?: string;
};

export const PIP_COLORS = ["#FF8A3D", "#FF5FA2", "#2ECC8E", "#5AA9FF", "#B478FF"] as const;
export const DEFAULT_PIP_COLOR = PIP_COLORS[0];

/** SVG base de Pip, disponible también para usos fuera de React. */
export function pipSvg(mood: PipMood, color: string) {
  const mouth =
    mood === "sleepy"
      ? '<path d="M44 66q6 3 12 0" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : mood === "eat"
        ? '<ellipse cx="50" cy="66" rx="8" ry="7" fill="#1B2A49"/>'
        : '<path d="M40 63q10 10 20 0" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round"/>';

  const eyes =
    mood === "sleepy"
      ? '<path d="M32 50q6-4 12 0M56 50q6-4 12 0" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round"/>'
      : '<circle cx="38" cy="50" r="6" fill="#1B2A49"/><circle cx="62" cy="50" r="6" fill="#1B2A49"/><circle cx="40" cy="48" r="2" fill="#fff"/><circle cx="64" cy="48" r="2" fill="#fff"/>';

  return `<svg viewBox="0 0 100 100" aria-label="Pip">
    <ellipse fill="${color}" cx="30" cy="22" rx="9" ry="16" transform="rotate(-20 30 22)"/>
    <ellipse fill="${color}" cx="70" cy="22" rx="9" ry="16" transform="rotate(20 70 22)"/>
    <ellipse fill="${color}" cx="50" cy="56" rx="34" ry="32"/>
    <ellipse cx="50" cy="66" rx="20" ry="14" fill="rgba(255,255,255,.35)"/>
    <circle cx="28" cy="60" r="5" fill="rgba(255,95,162,.5)"/><circle cx="72" cy="60" r="5" fill="rgba(255,95,162,.5)"/>
    ${eyes}${mouth}</svg>`;
}

export function Pip({ mood, color, className }: Props) {
  const titleId = useId();
  const sleepy = mood === "sleepy";

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-labelledby={titleId}
      className={cn(
        "size-24 drop-shadow-lg motion-safe:animate-bob",
        mood === "eat" && "motion-safe:animate-pop",
        className,
      )}
    >
      <title id={titleId}>Pip</title>
      <ellipse fill={color} cx="30" cy="22" rx="9" ry="16" transform="rotate(-20 30 22)" />
      <ellipse fill={color} cx="70" cy="22" rx="9" ry="16" transform="rotate(20 70 22)" />
      <ellipse fill={color} cx="50" cy="56" rx="34" ry="32" />
      <ellipse cx="50" cy="66" rx="20" ry="14" fill="rgba(255,255,255,.35)" />
      <circle cx="28" cy="60" r="5" fill="rgba(255,95,162,.5)" />
      <circle cx="72" cy="60" r="5" fill="rgba(255,95,162,.5)" />
      {sleepy ? (
        <path
          d="M32 50q6-4 12 0M56 50q6-4 12 0"
          stroke="#1B2A49"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="38" cy="50" r="6" fill="#1B2A49" />
          <circle cx="62" cy="50" r="6" fill="#1B2A49" />
          <circle cx="40" cy="48" r="2" fill="#fff" />
          <circle cx="64" cy="48" r="2" fill="#fff" />
        </>
      )}
      {sleepy ? (
        <path
          d="M44 66q6 3 12 0"
          stroke="#1B2A49"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      ) : mood === "eat" ? (
        <ellipse cx="50" cy="66" rx="8" ry="7" fill="#1B2A49" />
      ) : (
        <path
          d="M40 63q10 10 20 0"
          stroke="#1B2A49"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}