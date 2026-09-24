import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Backpack, Star, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { HelpBubble } from "./HelpBubble";
import { Pip, type PipMood } from "./Pip";
import { pipSizeFor } from "@/lib/progress";
import type { PipDay, PipLearned, PipMark } from "@/lib/progress";
import { playPipVoice, stopPipVoice } from "@/lib/pip-voice";
import { playSuccess } from "@/lib/feedback-sounds";
import { PipRuler } from "./PipRuler";

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
    marks: PipMark[];
    learned?: PipLearned[];
    day: PipDay;
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
    if (!pipCard) stopPipVoice();
  }, [pipCard]);
  const learned = pip?.learned ?? [];

  const pipLogicalSize = pip ? pipSizeFor(pip) : 64;
  const cornerSize = Math.min(120, 44 + Math.max(0, pipLogicalSize - 64) * 0.48);

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
                    stage={pip.stage}
                    feeds={pip.feeds}
                    accessories={pip.accessories}
                    size={cornerSize}
                    className="shrink-0"
                  />
                </button>
                <div
                  className="flex flex-col items-center"
                  aria-label={`${pip.feeds} de ${pip.total}`}
                >
                  <PipRuler
                    marks={pip.marks}
                    currentDay={pip.day}
                    feeds={pip.feeds}
                    total={pip.total}
                    height={96}
                  />
                  <span className="font-display text-xs text-card-foreground">
                    {pip.feeds} / {pip.total}
                  </span>
                </div>
                {pipCard ? (
                  <div
                    role="dialog"
                    aria-label="Barriga de palabras de Pip"
                    className="absolute left-1/2 top-full z-40 mt-2 w-[min(92vw,26rem)] -translate-x-1/2 animate-pop rounded-2xl bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]"
                  >
                    <button
                      type="button"
                      onClick={() => setPipCard(false)}
                      aria-label="Cerrar"
                      className="tap-target absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground"
                    >
                      <X className="size-6" aria-hidden />
                    </button>
                    <div className="flex items-center gap-3 pr-12">
                      <PipRuler
                        marks={pip.marks}
                        currentDay={pip.day}
                        feeds={pip.feeds}
                        total={pip.total}
                        height={140}
                      />
                      <div className="text-left">
                        <Pip
                          mood="happy"
                          color={pip.color}
                          stage={pip.stage}
                          feeds={pip.feeds}
                          accessories={pip.accessories}
                          size={Math.min(96, pipLogicalSize)}
                        />
                        <p className="mt-1 font-display text-xl">
                          Pip sabe {learned.length} {learned.length === 1 ? "frase" : "frases"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Etapa {pip.stage + 1} de 5 · comió {pip.totalFeeds}
                        </p>
                      </div>
                    </div>
                    {learned.length ? (
                      <ul className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto">
                        {[...learned].reverse().map((item) => (
                          <li key={item.phrase}>
                            <button
                              type="button"
                              onClick={() =>
                                void playPipVoice({
                                  clip: item.clip,
                                  ...(item.recordingKey ? { recordingKey: item.recordingKey } : {}),
                                })
                              }
                              className="tap-target flex w-full items-center gap-3 rounded-xl bg-muted px-3 text-left font-display text-lg"
                            >
                              <Volume2 className="size-6 shrink-0 text-primary" aria-hidden />
                              <span lang="en">{item.phrase}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-muted-foreground">
                        Hablá para darle su primera frase.
                      </p>
                    )}
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
