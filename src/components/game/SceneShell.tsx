import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Backpack, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpBubble } from "./HelpBubble";
import { Pip, type PipMood } from "./Pip";
import { pipSizeFor } from "@/lib/progress";
import { playSuccess } from "@/lib/feedback-sounds";

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
    totalFeeds: number;
    stage: number;
    accessories: string[];
    bounceKey?: number;
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
  const [pipCard, setPipCard] = useState(false);

  useEffect(() => {
    if (!pipCard) return;
    const timer = window.setTimeout(() => setPipCard(false), 2000);
    return () => window.clearTimeout(timer);
  }, [pipCard]);

  const pipLogicalSize = pip ? pipSizeFor(pip) : 64;
  const cornerSize = Math.min(120, 44 + Math.max(0, pipLogicalSize - 64) * 0.48);
  const feedFill = pip && pip.total > 0 ? Math.min(100, (pip.feeds / pip.total) * 100) : 0;

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
              <div className="relative flex items-center gap-2">
                <button
                  key={pip.bounceKey}
                  type="button"
                  onClick={() => {
                    setPipCard(true);
                    playSuccess();
                  }}
                  aria-label={`Pip ha comido ${pip.totalFeeds} frases. Ver su progreso.`}
                  className="shrink-0 rounded-full focus-visible:outline-4 focus-visible:outline-primary motion-safe:animate-pip-corner-grow"
                >
                  <Pip
                    mood={pip.mood}
                    color={pip.color}
                    accessories={pip.accessories}
                    size={cornerSize}
                    className="shrink-0"
                  />
                </button>
                <div
                  className="flex flex-col items-center"
                  aria-label={`${pip.feeds} de ${pip.total}`}
                >
                  <div className="relative size-9">
                    <Pip
                      mood="happy"
                      color="var(--color-muted-foreground)"
                      className="absolute inset-0 size-9 opacity-25"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ clipPath: `inset(${100 - feedFill}% 0 0 0)` }}
                    >
                      <Pip mood="happy" color={pip.color} className="size-9" />
                    </div>
                  </div>
                  <span className="font-display text-xs text-card-foreground">
                    {pip.feeds} / {pip.total}
                  </span>
                </div>
                {pipCard ? (
                  <div className="absolute left-0 top-full z-40 mt-2 w-64 animate-pop rounded-2xl bg-card p-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
                    <Pip
                      mood="happy"
                      color={pip.color}
                      accessories={pip.accessories}
                      size={Math.min(150, pipLogicalSize)}
                      className="mx-auto"
                    />
                    <p className="font-display text-lg">Pip ha comido {pip.totalFeeds} frases</p>
                    <p className="text-sm text-muted-foreground">
                      {pip.feeds >= pip.total
                        ? "¡Hoy ya creció!"
                        : `Le faltan ${Math.max(0, pip.total - pip.feeds)} para crecer`}
                    </p>
                  </div>
                ) : null}
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
