import { useEffect, useId, useState } from "react";
import stage0 from "@/assets/pip-stage-0.png";
import stage1 from "@/assets/pip-stage-1.png";
import stage2 from "@/assets/pip-stage-2.png";
import stage3 from "@/assets/pip-stage-3.png";
import stage4 from "@/assets/pip-stage-4.png";
import { cn } from "@/lib/utils";

/* eslint-disable react-refresh/only-export-components -- el prompt requiere exportar pipSvg junto a Pip */

export type PipMood = "sleepy" | "happy" | "eat" | "normal";

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
    const cracks =
      feeds >= 6
        ? '<path d="M50 18l-7 10 8 7-7 10M61 25l-6 8 7 6" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        : feeds >= 3
          ? '<path d="M50 18l-7 10 8 7-7 10" stroke="#1B2A49" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
          : "";
    return `<svg viewBox="0 0 100 100" aria-label="Pip huevo"><ellipse fill="${color}" cx="50" cy="58" rx="31" ry="39"/><circle cx="40" cy="58" r="5" fill="#1B2A49"/><circle cx="60" cy="58" r="5" fill="#1B2A49"/><circle cx="42" cy="56" r="1.6" fill="#fff"/><circle cx="62" cy="56" r="1.6" fill="#fff"/>${cracks}</svg>`;
  }
  const ears =
    stage >= 2
      ? '<ellipse fill="' +
        color +
        '" cx="28" cy="15" rx="9" ry="24" transform="rotate(-16 28 15)"/><ellipse fill="' +
        color +
        '" cx="72" cy="15" rx="9" ry="24" transform="rotate(16 72 15)"/>'
      : '<ellipse fill="' +
        color +
        '" cx="30" cy="22" rx="9" ry="16" transform="rotate(-20 30 22)"/><ellipse fill="' +
        color +
        '" cx="70" cy="22" rx="9" ry="16" transform="rotate(20 70 22)"/>';
  const tail =
    stage >= 3
      ? `<path d="M77 62q25-3 14 15q-7 10-16 1" fill="none" stroke="${color}" stroke-width="11" stroke-linecap="round"/>`
      : "";
  const wings =
    stage >= 4
      ? `<path d="M20 50Q2 43 7 66q7 12 17 2M80 50q18-7 13 16q-7 12-17 2" fill="${color}" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`
      : "";
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

function PipSvgFallback({
  mood,
  color,
  stage = 0,
  feeds = 0,
  accessories = [],
  className,
  size,
}: Props) {
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
          {feeds >= 3 ? (
            <path
              d="M50 18l-7 10 8 7-7 10"
              stroke="#1B2A49"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {feeds >= 6 ? (
            <path
              d="M61 25l-6 8 7 6"
              stroke="#1B2A49"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </>
      ) : (
        <>
          {stage >= 3 ? (
            <path
              d="M77 62q25-3 14 15q-7 10-16 1"
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
            />
          ) : null}
          {stage >= 4 ? (
            <path
              d="M20 50Q2 43 7 66q7 12 17 2M80 50q18-7 13 16q-7 12-17 2"
              fill={color}
              stroke="rgba(255,255,255,.4)"
              strokeWidth="2"
            />
          ) : null}
          <ellipse
            fill={color}
            cx="30"
            cy={longEars ? 15 : 22}
            rx="9"
            ry={longEars ? 24 : 16}
            transform={`rotate(-${longEars ? 16 : 20} 30 ${longEars ? 15 : 22})`}
          />
          <ellipse
            fill={color}
            cx="70"
            cy={longEars ? 15 : 22}
            rx="9"
            ry={longEars ? 24 : 16}
            transform={`rotate(${longEars ? 16 : 20} 70 ${longEars ? 15 : 22})`}
          />
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

/** Ilustraciones por etapa (0 huevo … 4 gigante). */
export const PIP_STAGE_IMAGES = [stage0, stage1, stage2, stage3, stage4] as const;

/** Posición de los ojos por etapa (fracción del cuadro) para parpadeo y ojos dormidos. */
const EYES: { y: number; x: [number, number]; r: number }[] = [
  { y: 0.4, x: [0.38, 0.63], r: 0.07 },
  { y: 0.43, x: [0.29, 0.52], r: 0.07 },
  { y: 0.53, x: [0.32, 0.48], r: 0.05 },
  { y: 0.46, x: [0.21, 0.37], r: 0.045 },
  { y: 0.39, x: [0.29, 0.41], r: 0.035 },
];
/** Cachetes (para feliz y comiendo), cerca de los ojos. */
const BASE_HUE = 28;

function hexToHsl(hex: string): { h: number; s: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + 360) % 360;
  const l = (max + min) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h, s };
}

/** Filtro CSS que lleva el naranja base al color elegido por el niño. */
export function pipColorFilter(color: string): string | undefined {
  const hsl = hexToHsl(color);
  if (!hsl) return color.startsWith("var(") ? "grayscale(1)" : undefined;
  const rotate = Math.round(hsl.h - BASE_HUE);
  if (Math.abs(rotate) < 4) return undefined;
  const sat = hsl.s < 0.75 ? 0.9 : 1.1;
  return `hue-rotate(${rotate}deg) saturate(${sat})`;
}

export function Pip({
  mood,
  color,
  stage = 0,
  feeds = 0,
  accessories = [],
  className,
  size,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [blink, setBlink] = useState(false);
  const idx = Math.min(4, Math.max(0, stage));
  const eyes = EYES[idx]!;
  const sleepy = mood === "sleepy";

  useEffect(() => {
    if (sleepy) return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setBlink(true);
          window.setTimeout(() => setBlink(false), 140);
          schedule();
        },
        3000 + Math.random() * 3000,
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, [sleepy]);

  if (failed) {
    return (
      <PipSvgFallback
        mood={mood}
        color={color}
        stage={stage}
        feeds={feeds}
        accessories={accessories}
        {...(className ? { className } : {})}
        {...(size ? { size } : {})}
      />
    );
  }

  const lid = "#C8621E";
  const cheeks = mood === "eat" || mood === "happy";
  return (
    <div
      role="img"
      aria-label={idx === 0 ? "Pip huevo" : "Pip"}
      style={size ? { width: size, height: size } : undefined}
      className={cn(
        "relative size-24 drop-shadow-lg",
        mood === "eat"
          ? "motion-safe:animate-pip-munch"
          : mood === "happy"
            ? "motion-safe:animate-pip-happy"
            : sleepy
              ? "scale-95"
              : "motion-safe:animate-pip-breathe",
        className,
      )}
    >
      <img
        src={PIP_STAGE_IMAGES[idx]}
        alt=""
        draggable={false}
        onError={() => setFailed(true)}
        className="pointer-events-none size-full select-none object-contain object-bottom"
        style={{ filter: pipColorFilter(color) }}
      />
      <svg
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden
      >
        {idx === 0 && feeds >= 3 ? (
          <path
            d="M48 62l-6 8 7 6-6 9"
            stroke="#6B2E0E"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {idx === 0 && feeds >= 6 ? (
          <path
            d="M62 70l-5 7 6 5"
            stroke="#6B2E0E"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {cheeks && idx > 0 ? (
          <>
            <circle
              cx={eyes.x[0] * 100 - 4}
              cy={eyes.y * 100 + 9}
              r={mood === "eat" ? 5 : 3.5}
              fill="rgba(255,95,162,.45)"
            />
            <circle
              cx={eyes.x[1] * 100 + 4}
              cy={eyes.y * 100 + 9}
              r={mood === "eat" ? 5 : 3.5}
              fill="rgba(255,95,162,.45)"
            />
          </>
        ) : null}
        {blink || sleepy
          ? eyes.x.map((x) => (
              <g key={x}>
                <circle
                  cx={x * 100}
                  cy={eyes.y * 100}
                  r={eyes.r * 100 + 1}
                  fill={lid}
                  style={{ filter: pipColorFilter(color) }}
                />
                <path
                  d={`M${x * 100 - eyes.r * 100} ${eyes.y * 100}q${eyes.r * 100} ${eyes.r * 60} ${eyes.r * 200} 0`}
                  stroke="#3A1A08"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ))
          : null}
        {accessories.includes("sun-tag") && idx > 0 ? (
          <g
            aria-label="Gorra de explorador"
            transform={`translate(${(eyes.x[0] + eyes.x[1]) * 50 - 50} ${eyes.y * 100 - 44}) scale(0.6) translate(33 10)`}
          >
            <path d="M24 30Q50 5 76 30L70 38H30Z" fill="var(--color-sun)" />
            <path d="M20 36Q50 28 82 37Q70 43 38 41Z" fill="var(--color-sun-foreground)" />
            <circle cx="50" cy="25" r="4" fill="var(--color-accent)" />
          </g>
        ) : null}
      </svg>
      {sleepy ? (
        <span
          className="pip-zzz absolute -top-2 right-0 font-display text-sm text-muted-foreground"
          aria-hidden
        >
          z z z
        </span>
      ) : null}
    </div>
  );
}
