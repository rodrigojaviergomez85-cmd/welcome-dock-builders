import { useEffect, useRef, useState } from "react";
import { Hand, Mic, Moon, Star, Sun } from "lucide-react";
import dockMorning from "@/assets/dock-morning.jpg";
import dockAfternoon from "@/assets/dock-afternoon.jpg";
import dockEvening from "@/assets/dock-evening.jpg";
import dockNight from "@/assets/dock-night.jpg";
import type { SunClockBlock, TimeOfDay } from "@/content/missions/types";
import { TIME_LABEL_ES } from "@/content/backgrounds";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { playClip, stopClip } from "@/lib/audio";
import { playFanfare, playSuccess } from "@/lib/feedback-sounds";
import { cn } from "@/lib/utils";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: SunClockBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  /** Cambia el cielo de la escena. */
  onTimeChange: (time: TimeOfDay) => void;
  /** Cuántos soles dorados lleva ganados (para el contador de arriba). */
  onGoldChange: (count: number) => void;
  onFinish: () => void;
  /** Estado guardado: bits 0–3 paradas visitadas, bits 4–7 soles dorados. */
  startIndex?: number;
  onStepChange?: (value: number) => void;
};

function toBits(list: number[], shift: number) {
  return list.reduce((acc, i) => acc | (1 << (i + shift)), 0);
}
function fromBits(value: number, shift: number, count: number) {
  return Array.from({ length: count }, (_, i) => i).filter((i) => value & (1 << (i + shift)));
}

/** Mini escena de cada ventanita: recorte del muelle + tinte + astro en su altura. */
const WINDOW: Record<
  TimeOfDay,
  { img: string; tint: string; astro: "sun" | "moon"; top: string; color: string }
> = {
  morning: {
    img: dockMorning,
    tint: "bg-[#ff9ec4]/35",
    astro: "sun",
    top: "62%",
    color: "text-[#FFB347]",
  },
  afternoon: {
    img: dockAfternoon,
    tint: "bg-[#5ec8ff]/25",
    astro: "sun",
    top: "22%",
    color: "text-[#FFD166]",
  },
  evening: {
    img: dockEvening,
    tint: "bg-[#ff7a2f]/35",
    astro: "sun",
    top: "66%",
    color: "text-[#ff6b1a]",
  },
  night: {
    img: dockNight,
    tint: "bg-[#0b1840]/45",
    astro: "moon",
    top: "26%",
    color: "text-[#fff6c8]",
  },
};

/** Sol grande con carita y halo. */
function SunFace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="48" fill="#FFD166" opacity="0.35" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x="47"
          y="2"
          width="6"
          height="14"
          rx="3"
          fill="#FFB347"
          transform={`rotate(${i * 30} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="30" fill="#FFD166" stroke="#F4A300" strokeWidth="3" />
      <circle cx="40" cy="46" r="3.6" fill="#5a3a00" />
      <circle cx="60" cy="46" r="3.6" fill="#5a3a00" />
      <circle cx="34" cy="56" r="4" fill="#ff8a8a" opacity="0.6" />
      <circle cx="66" cy="56" r="4" fill="#ff8a8a" opacity="0.6" />
      <path
        d="M40 58 Q50 67 60 58"
        stroke="#5a3a00"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Posición de cada parada sobre el arco, en porcentaje de la caja del cielo. */
function arcPoint(t: number) {
  return { x: 6 + 88 * t, y: 86 - 78 * Math.sin(Math.PI * t) };
}

export function SunClockView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onTimeChange,
  onGoldChange,
  onFinish,
  startIndex = 0,
  onStepChange,
}: Props) {
  const arcRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>(() =>
    fromBits(startIndex, 0, block.stops.length),
  );
  const [gold, setGold] = useState<number[]>(() => fromBits(startIndex, 4, block.stops.length));
  const [phase, setPhase] = useState<"explore" | "repeat" | "done">(() =>
    fromBits(startIndex, 0, block.stops.length).length === block.stops.length
      ? "repeat"
      : "explore",
  );
  const [recordAt, setRecordAt] = useState<number | null>(null);
  const [dragT, setDragT] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(true);
  const [spin, setSpin] = useState(false);
  const [hop, setHop] = useState(0);

  const stops = block.stops;
  const count = stops.length;

  useEffect(() => {
    onStepChange?.(toBits(visited, 0) | toBits(gold, 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visited, gold]);

  useEffect(() => {
    if (gold.length > 0) onGoldChange(gold.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Voz del guía en español + demo de la mano arrastrando el sol.
  // Al retomar a mitad no se repite la introducción.
  useEffect(() => {
    const resuming = startIndex > 0;
    if (resuming) setShowDemo(false);
    if (resuming && phase === "explore") return;
    if (resuming && gold.length > 0) return;
    void playClip(phase === "repeat" ? "es-sun-repeat" : block.introClip);
    return () => {
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function visit(index: number) {
    const stop = stops[index];
    if (!stop) return;
    setActive(index);
    setDragT(null);
    setHop((value) => value + 1);
    onTimeChange(stop.time);
    stopClip();
    void playClip(stop.line.clip);
    if (!visited.includes(index)) {
      const next = [...visited, index];
      setVisited(next);
      playSuccess();
      if (next.length === count && phase === "explore") {
        setTimeout(() => {
          void playClip("es-sun-repeat");
          setPhase("repeat");
          setActive(null);
        }, 1400);
      }
    }
  }

  function tapStop(index: number) {
    if (phase === "repeat") {
      const stop = stops[index];
      if (!stop || gold.includes(index)) return;
      setActive(index);
      onTimeChange(stop.time);
      setRecordAt(index);
      return;
    }
    visit(index);
  }

  function winSun(index: number, status: "heard" | "practiced" | "pending") {
    const spoken = stops[index]?.repeat.targetEn ?? "";
    onOral(status, spoken, () => {
      setRecordAt(null);
      if (gold.includes(index)) return;
      const next = [...gold, index];
      setGold(next);
      onGoldChange(next.length);
      if (next.length === count) {
        setPhase("done");
        setSpin(true);
        playFanfare();
        void playClip(block.done.clip);
        setTimeout(onFinish, 3200);
      }
    });
  }

  /** Arrastre del sol: convierte la posición del dedo en un punto del arco. */
  function pointerT(event: React.PointerEvent) {
    const box = arcRef.current?.getBoundingClientRect();
    if (!box) return 0;
    return Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  }

  function onPointerMove(event: React.PointerEvent) {
    if (dragT === null) return;
    const t = pointerT(event);
    setDragT(t);
    // Crossfade en vivo del cielo mientras se arrastra.
    const near = stops[Math.round(t * (count - 1))];
    if (near) onTimeChange(near.time);
  }

  function onPointerUp(event: React.PointerEvent) {
    if (dragT === null) return;
    const t = pointerT(event);
    const index = Math.round(t * (count - 1));
    setDragT(null);
    tapStop(index);
  }

  const sunT = dragT ?? (active !== null ? active / (count - 1) : 0);
  const sunPos = arcPoint(sunT);
  const current = active !== null ? stops[active] : undefined;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      {/* Cielo con riel curvo y sol arrastrable */}
      <div
        ref={arcRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setDragT(null)}
        className="fixed left-1/2 top-[8.5rem] z-10 h-[max(9rem,20vh)] w-[min(86vw,40rem)] -translate-x-1/2 touch-none select-none"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <path
            d="M6 86 Q50 -70 94 86"
            fill="none"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="26"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M6 86 Q50 -70 94 86"
            fill="none"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="3"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {stops.map((stop, index) => {
          const point = arcPoint(index / (count - 1));
          const isGold = gold.includes(index);
          const isVisited = visited.includes(index);
          const w = WINDOW[stop.time];
          const Astro = w.astro === "moon" ? Moon : Sun;
          return (
            <button
              key={stop.time}
              type="button"
              onClick={() => tapStop(index)}
              aria-label={TIME_LABEL_ES[stop.time]}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              className={cn(
                "absolute z-20 size-16 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-4 border-card shadow-[var(--shadow-pop)] transition-transform active:scale-95 sm:size-[5.5rem]",
                isGold && "border-[#FFD166] ring-4 ring-[#FFD166]/60",
                !isGold && isVisited && "border-success",
                active === index && "scale-110",
                phase === "repeat" && !isGold && "animate-pulse",
              )}
            >
              <img
                src={w.img}
                alt=""
                className="absolute inset-0 size-full scale-150 object-cover object-top"
              />
              <span className={cn("absolute inset-0", w.tint)} />
              {stop.time === "night" ? (
                <>
                  <Star
                    className="absolute left-[22%] top-[18%] size-2.5 fill-current text-[#fff6c8]"
                    aria-hidden
                  />
                  <Star
                    className="absolute right-[20%] top-[44%] size-2 fill-current text-[#fff6c8]"
                    aria-hidden
                  />
                </>
              ) : null}
              <Astro
                className={cn(
                  "absolute left-1/2 size-7 -translate-x-1/2 -translate-y-1/2 fill-current sm:size-8",
                  w.color,
                )}
                style={{ top: w.top }}
                aria-hidden
              />
              {phase === "repeat" && !isGold ? (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-destructive p-1 text-destructive-foreground">
                  <Mic className="size-3.5" aria-hidden />
                </span>
              ) : null}
            </button>
          );
        })}

        {/* El sol que se arrastra (arranca en el horizonte izquierdo) */}
        <div
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragT(sunT);
            setShowDemo(false);
          }}
          role="slider"
          tabIndex={0}
          aria-label="Arrastrá el sol por el cielo"
          aria-valuemin={1}
          aria-valuemax={count}
          aria-valuenow={(active ?? 0) + 1}
          style={{ left: `${sunPos.x}%`, top: `${sunPos.y}%` }}
          className={cn(
            "absolute z-30 size-[4.5rem] -translate-x-1/2 -translate-y-[85%] cursor-grab transition-[left,top] duration-300 sm:size-24",
            dragT !== null && "scale-110 duration-0",
            showDemo && active === null && "animate-[sun-demo_2.4s_ease-in-out_infinite]",
            spin && "animate-spin",
          )}
        >
          <SunFace className="size-full drop-shadow-[0_0_18px_rgba(255,209,102,0.9)]" />
          {showDemo ? (
            <Hand
              className="absolute -bottom-3 left-1/2 size-9 fill-card text-foreground"
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      <div className="h-[calc(max(9rem,20vh)+3rem)]" aria-hidden />

      {phase === "repeat" && recordAt === null ? (
        <div className="flex items-end gap-2">
          <CharacterFigure id={block.guide} size="sm" />
          <p className="mb-6 rounded-3xl bg-card/95 px-5 py-3 font-display text-2xl text-card-foreground shadow-[var(--shadow-soft)]">
            Tocá un cielo y repetí
          </p>
        </div>
      ) : null}

      {/* Boti en el muelle: salta y saluda al llegar a cada parada */}
      {phase === "explore" && recordAt === null ? (
        <div className="flex items-end gap-2">
          <div key={hop} className={cn(hop > 0 && "animate-[boti-hop_0.7s_ease-out]")}>
            <CharacterFigure id={block.guide} size="md" />
          </div>
          {current ? (
            <div className="mb-10 flex flex-col items-center gap-1 rounded-3xl bg-card/95 px-6 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
              <span className="rounded-full bg-secondary px-3 py-0.5 text-xs text-secondary-foreground">
                {TIME_LABEL_ES[current.time]}
              </span>
              <p lang="en" className="font-display text-3xl sm:text-4xl">
                {current.line.en}
              </p>
              {current.line.es ? (
                <p className="text-sm text-muted-foreground">{current.line.es}</p>
              ) : null}
              <AudioButton clipId={current.line.clip} label="Escuchar" />
            </div>
          ) : (
            <p className="mb-10 rounded-full bg-card/90 px-4 py-2 text-sm text-card-foreground">
              {block.helpEs}
            </p>
          )}
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="animate-pop rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-2xl text-success">
            {block.done.en}
          </p>
          <p className="text-sm text-muted-foreground">{block.done.es}</p>
        </div>
      ) : null}

      {/* Fase 2: repetir el saludo de la parada tocada */}
      {recordAt !== null && stops[recordAt] ? (
        <div className="flex w-full flex-col items-center gap-2">
          <RecordTurn
            key={stops[recordAt]!.repeat.id}
            missionId={missionId}
            turnId={stops[recordAt]!.repeat.id}
            {...(stops[recordAt]!.repeat.mode ? { mode: stops[recordAt]!.repeat.mode } : {})}
            role={stops[recordAt]!.repeat.role}
            promptEs={stops[recordAt]!.repeat.promptEs}
            targetEn={stops[recordAt]!.repeat.targetEn}
            alias={alias}
            modelClip={stops[recordAt]!.repeat.modelClip}
            support="full"
            onHelpUsed={onHelpUsed}
            onDone={(status) => winSun(recordAt, status)}
          />
        </div>
      ) : null}
    </div>
  );
}
