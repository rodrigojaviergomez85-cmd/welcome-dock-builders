import { useId } from "react";
import { cn } from "@/lib/utils";

/* eslint-disable react-refresh/only-export-components -- el prompt requiere exportar pipSvg junto a Pip */

export type PipMood = "sleepy" | "happy" | "eat";

type Props = {
  mood: PipMood;
  color: string;
  stage?: number;
  feeds?: number;
  accessories?: string[];
  className?: string;
  size?: number;
};

export const PIP_COLORS = ["#FF8A3D", "#FF5FA2", "#2ECC8E", "#5AA9FF", "#B478FF"] as const;
export const DEFAULT_PIP_COLOR = PIP_COLORS[0];

/** SVG base de Pip, disponible también para usos fuera de React. */
export function pipSvg(mood: PipMood, color: string, stage = 0, feeds = 0) {
  if (stage <= 0) {
    const cracks = feeds >= 6
      ? '<path d="M50 18l-7 10 8 7-7 10M61 25l-6 8 7 6" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
      : feeds >= 3
        ? '<path d="M50 18l-7 10 8 7-7 10" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        : '';
    return `<svg viewBox="0 0 100 100" aria-label="Pip huevo"><ellipse fill="${color}" cx="50" cy="58" rx="31" ry="39"/><circle cx="40" cy="58" r="5" fill="#1B2A49"/><circle cx="60" cy="58" r="5" fill="#1B2A49"/><circle cx="42" cy="56" r="1.6" fill="#fff"/><circle cx="62" cy="56" r="1.6" fill="#fff"/>${cracks}</svg>`;
  }
  const ears = stage >= 2 ? '<ellipse fill="' + color + '" cx="28" cy="15" rx="9" ry="24" transform="rotate(-16 28 15)"/><ellipse fill="' + color + '" cx="72" cy="15" rx="9" ry="24" transform="rotate(16 72 15)"/>' : '<ellipse fill="' + color + '" cx="30" cy="22" rx="9" ry="16" transform="rotate(-20 30 22)"/><ellipse fill="' + color + '" cx="70" cy="22" rx="9" ry="16" transform="rotate(20 70 22)"/>';
  const tail = stage >= 3 ? `<path d="M77 62q25-3 14 15q-7 10-16 1" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"/>` : '';
  const wings = stage >= 4 ? `<path d="M20 50Q2 43 7 66q7 12 17 2M80 50q18-7 13 16q-7 12-17 2" fill="${color}" stroke="rgba(255,255,255,.4)" stroke-width="2"/>` : '';
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
    ${tail}${wings}${ears}
    <ellipse fill="${color}" cx="50" cy="56" rx="34" ry="32"/>
    <ellipse cx="50" cy="66" rx="20" ry="14" fill="rgba(255,255,255,.35)"/>
    <circle cx="28" cy="60" r="5" fill="rgba(255,95,162,.5)"/><circle cx="72" cy="60" r="5" fill="rgba(255,95,162,.5)"/>
    ${eyes}${mouth}</svg>`;
}

export function Pip({ mood, color, stage = 0, feeds = 0, accessories = [], className, size }: Props) {
  const titleId = useId();
  const sleepy = mood === "sleepy";
  const egg = stage <= 0;
  const longEars = stage >= 2;

  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-labelledby={titleId}
      {...(size ? { width: size, height: size } : {})}
      style={size ? { width: size, height: size } : undefined}
      className={cn(
        "size-24 drop-shadow-lg motion-safe:animate-bob",
        mood === "eat" && "motion-safe:animate-pop",
        className,
      )}
    >
      <title id={titleId}>Pip</title>
      {accessories.includes("sun-tag") && !egg ? (
        <g aria-label="Gorra de explorador">
          <path d="M24 30Q50 5 76 30L70 38H30Z" fill="var(--color-sun)" />
          <path d="M20 36Q50 28 82 37Q70 43 38 41Z" fill="var(--color-sun-foreground)" />
          <circle cx="50" cy="25" r="4" fill="var(--color-accent)" />
        </g>
      ) : null}
      {egg ? (
        <>
          <ellipse fill={color} cx="50" cy="58" rx="31" ry="39" />
          <circle cx="40" cy="58" r="5" fill="#1B2A49" />
          <circle cx="60" cy="58" r="5" fill="#1B2A49" />
          <circle cx="42" cy="56" r="1.6" fill="#fff" />
          <circle cx="62" cy="56" r="1.6" fill="#fff" />
          {feeds >= 3 ? <path d="M50 18l-7 10 8 7-7 10" stroke="#1B2A49" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {feeds >= 6 ? <path d="M61 25l-6 8 7 6" stroke="#1B2A49" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </>
      ) : (
        <>
      {stage >= 3 ? <path d="M77 62q25-3 14 15q-7 10-16 1" fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" /> : null}
      {stage >= 4 ? <path d="M20 50Q2 43 7 66q7 12 17 2M80 50q18-7 13 16q-7 12-17 2" fill={color} stroke="rgba(255,255,255,.4)" strokeWidth="2" /> : null}
      <ellipse fill={color} cx="30" cy={longEars ? 15 : 22} rx="9" ry={longEars ? 24 : 16} transform={`rotate(-${longEars ? 16 : 20} 30 ${longEars ? 15 : 22})`} />
      <ellipse fill={color} cx="70" cy={longEars ? 15 : 22} rx="9" ry={longEars ? 24 : 16} transform={`rotate(${longEars ? 16 : 20} 70 ${longEars ? 15 : 22})`} />
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
        </>
      )}
    </svg>
  );
}
