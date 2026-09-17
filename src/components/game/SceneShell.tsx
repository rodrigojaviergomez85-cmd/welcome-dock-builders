import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Backpack, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpBubble } from "./HelpBubble";
import { Pip, type PipMood } from "./Pip";

type Props = {
  background: string;
  title: string;
  helpEs: string;
  onHelpUsed?: () => void;
  counter: { icon: "bag" | "star"; total: number; current: number; label?: string };
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  pip?: {
    mood: PipMood;
    color: string;
    feeds: number;
    total: number;
    accessories: string[];
    evolving?: boolean;
  };
};

export function SceneShell({
  background,
  title,
  helpEs,
  onHelpUsed,
  counter,
  children,
  footer,
  className,
  pip,
}: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        key={background}
        src={background}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full animate-fade-in object-cover transition-opacity duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/5 to-background/70" />

      <div className="relative flex min-h-screen flex-col">
        {pip?.evolving ? (
          <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-hidden>
            {Array.from({ length: 16 }).map((_, index) => (
              <i key={index} className={`pip-confetti pip-confetti-${(index % 4) + 1}`} />
            ))}
          </div>
        ) : null}
        <header className="flex items-center justify-between gap-3 p-3 sm:p-5">
          <Link
            to="/"
            aria-label="Salir al mapa. Tu progreso queda guardado."
            className="tap-target inline-flex items-center gap-2 rounded-full bg-card/90 px-4 font-display text-card-foreground shadow-[var(--shadow-soft)]"
          >
            <X className="size-6" aria-hidden />
            <span className="hidden sm:inline">Salir</span>
          </Link>

          <div className="flex items-center gap-2 rounded-full bg-card/90 px-2 py-1 shadow-[var(--shadow-soft)] sm:px-4">
            {pip ? (
              <div
                className="flex items-center gap-1.5"
                aria-label={`Pip comió ${pip.feeds} de ${pip.total}`}
              >
                <Pip
                  mood={pip.mood}
                  color={pip.color}
                  accessories={pip.accessories}
                  className="size-11 shrink-0 sm:size-14"
                />
                <span className="flex gap-0.5">
                  {Array.from({ length: pip.total }).map((_, index) => (
                    <i
                      key={index}
                      className={cn(
                        "h-4 w-1.5 rounded-full sm:w-2",
                        index < pip.feeds ? "bg-success" : "bg-muted-foreground/30",
                      )}
                    />
                  ))}
                </span>
              </div>
            ) : null}
            <span className="hidden font-display text-card-foreground sm:inline">{title}</span>
            {counter.label ? (
              <span className="font-display text-sm text-card-foreground">{counter.label}</span>
            ) : null}
            <span
              className="flex items-center gap-0.5"
              aria-label={`${counter.current} de ${counter.total} completados`}
            >
              {Array.from({ length: counter.total }).map((_, index) => {
                const Icon = counter.icon === "bag" ? Backpack : Star;
                return (
                  <Icon
                    key={index}
                    className={cn(
                      "size-5",
                      index < counter.current ? "text-success" : "text-muted-foreground/45",
                    )}
                    aria-hidden
                  />
                );
              })}
            </span>
          </div>

          <HelpBubble text={helpEs} onUsed={onHelpUsed} />
        </header>

        <main
          className={cn(
            "flex flex-1 flex-col items-center justify-end gap-4 p-3 sm:p-6",
            className,
          )}
        >
          {children}
        </main>

        {footer ? <footer className="p-3 sm:p-6">{footer}</footer> : null}
      </div>
    </div>
  );
}
