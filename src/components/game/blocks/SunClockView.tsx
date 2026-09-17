import { useEffect, useRef, useState } from "react";
import { Hand, Sun } from "lucide-react";
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
};

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
}: Props) {
  const arcRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [visited, setVisited] = useState<number[]>([]);
  const [gold, setGold] = useState<number[]>([]);
  const [phase, setPhase] = useState<"explore" | "repeat" | "done">("explore");
  const [recordAt, setRecordAt] = useState<number | null>(null);
  const [dragT, setDragT] = useState<number | null>(null);
  const [showDemo, setShowDemo] = useState(true);
  const [spin, setSpin] = useState(false);

  const stops = block.stops;
  const count = stops.length;

  // Voz del guía en español + demo de la mano arrastrando el sol.
  useEffect(() => {
    void playClip(block.introClip);
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
        className="relative h-40 w-full touch-none select-none sm:h-48"
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
        >
          <path
            d="M 6 86 Q 50 -6 94 86"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 4"
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
              <Sun
                className={cn("size-7", isGold ? "text-[#FFD166]" : "text-muted-foreground/60")}
                aria-hidden
              />
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
            promptEs={stops[recordAt]!.repeat.promptEs}
            targetEn={stops[recordAt]!.repeat.targetEn}
            alias={alias}
            modelClip={stops[recordAt]!.repeat.modelClip}
            support="full"
            onHelpUsed={onHelpUsed}
            onDone={(status) => winSun(recordAt, status)}
          />
          <button
            type="button"
            onClick={() => winSun(recordAt, "pending")}
            className="tap-target rounded-full bg-card/90 px-5 font-display text-base text-card-foreground shadow-[var(--shadow-soft)]"
          >
            Lo dije
          </button>
        </div>
      ) : null}
    </div>
  );
}
