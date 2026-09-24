import type { PipDay, PipMark } from "@/lib/progress";
import { cn } from "@/lib/utils";

type Props = {
  marks: PipMark[];
  currentDay: PipDay;
  feeds: number;
  total?: number;
  height?: number | string;
  animate?: boolean;
  className?: string;
};

const DAYS: PipDay[] = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const LABELS: Record<PipDay, string> = {
  monday: "lun",
  tuesday: "mar",
  wednesday: "mié",
  thursday: "jue",
  friday: "vie",
};

export function PipRuler({
  marks,
  currentDay,
  feeds,
  total = 8,
  height = 360,
  animate = false,
  className,
}: Props) {
  const saved = new Map(marks.map((mark) => [mark.day, Math.min(total, mark.feeds)]));
  const currentIndex = Math.max(0, DAYS.indexOf(currentDay));
  const completedBefore = DAYS.slice(0, currentIndex).reduce(
    (sum, day) => sum + (saved.get(day) ?? 0),
    0,
  );
  const todayFeeds = Math.min(total, Math.max(0, feeds));
  const activeHeight = completedBefore + todayFeeds;
  const tickCount = DAYS.length * total;

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      aria-label={`Vara de Pip: ${feeds} de ${total} frases hoy`}
    >
      <svg
        viewBox="0 0 120 420"
        style={{ height }}
        className="w-auto max-w-full drop-shadow-lg"
        role="img"
      >
        <title>Vara semanal de crecimiento de Pip</title>
        <rect
          x="34"
          y="8"
          width="64"
          height="404"
          rx="10"
          fill="var(--color-wood)"
          stroke="var(--color-wood-dark)"
          strokeWidth="5"
        />
        <path
          d="M47 18v380M71 18v380M88 18v380"
          stroke="var(--color-wood-light)"
          strokeWidth="3"
          opacity=".45"
        />
        {Array.from({ length: tickCount + 1 }).map((_, index) => {
          const y = 398 - index * 9.4;
          const painted = index > 0 && index <= activeHeight;
          const dayEnd = index > 0 && index % total === 0;
          return (
            <g key={index}>
              <line
                x1={dayEnd ? 43 : 56}
                x2="94"
                y1={y}
                y2={y}
                stroke={painted ? "var(--color-accent)" : "var(--color-wood-dark)"}
                strokeWidth={painted ? 5 : dayEnd ? 4 : 2.5}
                strokeLinecap="round"
              />
              {dayEnd ? (
                <text
                  x="7"
                  y={y + 5}
                  fill="var(--color-card-foreground)"
                  fontSize="13"
                  fontWeight="700"
                >
                  {LABELS[DAYS[index / total - 1] ?? "monday"]}
                </text>
              ) : null}
            </g>
          );
        })}
        <g
          className={animate ? "pip-ruler-marker-rise" : undefined}
          style={{ transformOrigin: `100px ${398 - activeHeight * 9.4}px` }}
        >
          <path
            d={`M102 ${398 - activeHeight * 9.4}l12-7v14z`}
            fill="var(--color-sun)"
            stroke="var(--color-sun-foreground)"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}
