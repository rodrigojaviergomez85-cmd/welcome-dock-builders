import { useEffect, useRef, useState } from "react";
import { Hand, Moon, Sun } from "lucide-react";
import type { SunClockBlock, TimeOfDay } from "@/content/missions/types";
import { TIME_LABEL_ES } from "@/content/backgrounds";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { playClip, stopClip } from "@/lib/audio";
import { playFanfare, playSuccess } from "@/lib/feedback-sounds";
import { cn } from "@/lib/utils";

type Props = {
  missionId: string;
  block: SunClockBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: (status: "heard" | "practiced" | "pending") => void;
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
  useEffect(() => {
    void playClip(phase === "repeat" ? "es-sun-repeat" : block.introClip);
    const timer = setTimeout(() => setShowDemo(false), 2000);
    return () => {
      clearTimeout(timer);
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function visit(index: number) {
    const stop = stops[index];
    if (!stop) return;
    setActive(index);
    setDragT(null);
    onTimeChange(stop.time);
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
    onOral(status);
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
  }

  /** Arrastre del sol: convierte la posición del dedo en un punto del arco. */
  function pointerT(event: React.PointerEvent) {
    const box = arcRef.current?.getBoundingClientRect();
    if (!box) return 0;
    return Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
  }

  function onPointerMove(event: React.PointerEvent) {
    if (dragT === null) return;
    setDragT(pointerT(event));
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
      {/* Arco del cielo con el sol arrastrable */}
      <div
        ref={arcRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setDragT(null)}
        className="fixed left-1/2 top-[11vh] z-10 h-[22vh] w-[min(92vw,42rem)] -translate-x-1/2 touch-none select-none"
      >
        {phase === "repeat" ? (
          <p className="absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-card/95 px-4 py-1 font-display text-base text-card-foreground shadow-[var(--shadow-soft)]">
            Tocá un cielo y repetí
          </p>
        ) : null}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <polyline
            points="6.0,86.0 8.2,79.9 10.4,73.8 12.6,67.8 14.8,61.9 17.0,56.2 19.2,50.6 21.4,45.2 23.6,40.2 25.8,35.3 28.0,30.8 30.2,26.7 32.4,22.9 34.6,19.5 36.8,16.5 39.0,13.9 41.2,11.8 43.4,10.2 45.6,9.0 47.8,8.2 50.0,8.0 52.2,8.2 54.4,9.0 56.6,10.2 58.8,11.8 61.0,13.9 63.2,16.5 65.4,19.5 67.6,22.9 69.8,26.7 72.0,30.8 74.2,35.3 76.4,40.2 78.6,45.2 80.8,50.6 83.0,56.2 85.2,61.9 87.4,67.8 89.6,73.8 91.8,79.9 94.0,86.0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            className="text-card/80"
          />
        </svg>

        {stops.map((stop, index) => {
          const point = arcPoint(index / (count - 1));
          const isGold = gold.includes(index);
          const isVisited = visited.includes(index);
          return (
            <button
              key={stop.time}
              type="button"
              onClick={() => tapStop(index)}
              aria-label={TIME_LABEL_ES[stop.time]}
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              className={cn(
                "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/95 p-2 shadow-[var(--shadow-soft)] transition-transform active:scale-95",
                isGold && "ring-4 ring-[#FFD166]",
                !isGold && isVisited && "ring-2 ring-success",
                phase === "repeat" && !isGold && "animate-pulse",
              )}
            >
              {stop.time === "night" ? (
                <Moon className="size-9 fill-current text-primary" aria-hidden />
              ) : (
                <Sun
                  className={cn(
                    stop.time === "evening"
                      ? "size-9 fill-current text-accent"
                      : "size-10 fill-current text-sun",
                  )}
                  aria-hidden
                />
              )}
            </button>
          );
        })}

        {/* El sol que se arrastra */}
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
          style={{ left: `${sunPos.x}%`, top: `${Math.max(4, sunPos.y - 16)}%` }}
          className={cn(
            "absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-[#FFD166] p-3 shadow-[var(--shadow-pop)] transition-[left,top] duration-300",
            dragT !== null && "scale-110 duration-0",
            spin && "animate-spin",
          )}
        >
          <Sun className="size-9 text-[#8a5a00]" aria-hidden />
          {showDemo ? (
            <Hand
              className="absolute -bottom-6 left-6 size-7 animate-bounce text-card"
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      <div className="h-[20vh]" aria-hidden />
      <p className="rounded-full bg-card/85 px-4 py-1 text-center text-xs text-muted-foreground">
        {block.helpEs}
      </p>

      {/* Boti saluda en la hora elegida */}
      {current && recordAt === null ? (
        <div className="flex w-full flex-col items-center gap-2">
          <CharacterFigure id={block.guide} size="md" />
          <div className="flex flex-col items-center gap-2 rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
            <span className="rounded-full bg-secondary px-3 py-0.5 text-xs text-secondary-foreground">
              {TIME_LABEL_ES[current.time]}
            </span>
            <p lang="en" className="font-display text-2xl">
              {current.line.en}
            </p>
            {current.line.es ? (
              <p className="text-sm text-muted-foreground">{current.line.es}</p>
            ) : null}
            <AudioButton clipId={current.line.clip} label="Escuchar" />
          </div>
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
