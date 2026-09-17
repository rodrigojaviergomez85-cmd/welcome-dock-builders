import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Backpack, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpBubble } from "./HelpBubble";

type Props = {
  background: string;
  title: string;
  helpEs: string;
  onHelpUsed?: () => void;
  counter: { icon: "bag" | "star"; total: number; current: number };
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
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
}: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <img
        src={background}
        alt=""
        aria-hidden
        className="absolute inset-0 size-full object-cover"
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

          <div className="flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 shadow-[var(--shadow-soft)]">
            <span className="hidden font-display text-card-foreground sm:inline">{title}</span>
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
