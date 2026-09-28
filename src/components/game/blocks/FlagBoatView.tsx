import { FlagIcon } from "../FlagIcon";
import { useEffect, useRef, useState } from "react";
import boat from "@/assets/boat.png";
import type { FlagBoatBlock } from "@/content/missions/types";
import { vocab } from "@/content/vocabulary";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { playClip, playThenPause, stopClip } from "@/lib/audio";
import { playFanfare, playSuccess } from "@/lib/feedback-sounds";
import { cn } from "@/lib/utils";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: FlagBoatBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onComprehension: (correct: boolean) => void;
  onFinish: () => void;
  /** Estado guardado: explorador × 2 (+1 si ya tocó la bandera correcta). */
  startIndex?: number;
  onStepChange?: (value: number) => void;
};

/**
 * El barco de banderas: bajan los exploradores en orden fijo. Cada uno dice de dónde es,
 * el niño toca la bandera correcta y repite la frase. No se puede adelantar.
 */
export function FlagBoatView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onComprehension,
  onFinish,
  startIndex = 0,
  onStepChange,
}: Props) {
  const count = block.explorers.length;
  const [value, setValue] = useState(Math.min(startIndex, count * 2));
  const index = Math.floor(value / 2);
  const picked = value % 2 === 1;
  const explorer = block.explorers[Math.min(index, count - 1)]!;
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;
  const mountedRef = useRef(true);

  function commit(next: number) {
    setValue(next);
    onStepChange?.(next);
  }

  useEffect(() => {
    mountedRef.current = true;
    if (startIndex >= count * 2) {
      finishRef.current();
      return;
    }
    if (startIndex === 0) void playClip(block.introClip);
    return () => {
      mountedRef.current = false;
      stopClip();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cada explorador nuevo dice su frase (después de lo que esté sonando).
  useEffect(() => {
    if (done || picked || index >= count) return;
    let active = true;
    setListening(true);
    void (async () => {
      await playThenPause(explorer.line.clip, 200);
      if (active) setListening(false);
    })();
    return () => {
      active = false;
    };
  }, [index, picked, done, count, explorer.line.clip]);

  function tapFlag(id: string) {
    if (picked || done) return;
    if (id === explorer.country) {
      stopClip();
      playSuccess();
      onComprehension(true);
      commit(index * 2 + 1);
      return;
    }
    onComprehension(false);
    setWrong(id);
    window.setTimeout(() => setWrong(null), 400);
    stopClip();
    void playClip(explorer.line.clip);
  }

  function finishAll() {
    setDone(true);
    playFanfare();
    void (async () => {
      await playThenPause(block.done.clip, 600);
      if (mountedRef.current) finishRef.current();
    })();
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      {/* Barco y exploradores en el muelle */}
      <div className="relative flex w-full items-end justify-center gap-2">
        <img
          src={boat}
          alt="Barco en el muelle"
          width={1024}
          height={768}
          className="h-28 w-auto animate-[boat-arrive_1.2s_ease-out_both] sm:h-40"
        />
        <div className="flex items-end gap-1">
          {block.explorers.map((ex, i) => {
            const landed = done || i < index || (i === index && index < count);
            if (!landed) return null;
            const current = !done && i === index;
            return (
              <div key={ex.speaker} className="relative flex flex-col items-center">
                {(i < index || done || (current && picked)) && (
                  <span className="absolute -top-8 z-10 animate-[flag-raise_0.5s_ease-out_both]">
                    <FlagIcon id={ex.country} wave className="w-10 sm:w-12" />
                  </span>
                )}
                <div className={cn(current ? "animate-pop" : "scale-75 opacity-90")}>
                  <CharacterFigure id={ex.speaker} size={current ? "md" : "sm"} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {done ? (
        <div className="animate-pop rounded-3xl bg-card/95 px-6 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-3xl text-success">
            {block.done.en}
          </p>
          <p className="text-sm text-muted-foreground">{block.done.es}</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-card/95 px-5 py-3 text-center text-card-foreground shadow-[var(--shadow-soft)]">
            <p lang="en" className="font-display text-2xl sm:text-3xl">
              {explorer.line.en}
            </p>
            <AudioButton clipId={explorer.line.clip} label="Escuchar otra vez" className="mt-2" />
          </div>

          {!picked ? (
            <div className="grid w-full max-w-xl grid-cols-4 gap-2 sm:gap-3">
              {block.flags.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => tapFlag(id)}
                  aria-label={`Bandera de ${vocab(id).es}`}
                  className={cn(
                    "tap-target flex aspect-square items-center justify-center rounded-3xl bg-card/95 p-3 shadow-[var(--shadow-soft)] transition-transform active:scale-95",
                    wrong === id && "animate-nudge ring-4 ring-destructive/50",
                    listening && "opacity-80",
                  )}
                >
                  <FlagIcon id={id} wave className="w-full" />
                </button>
              ))}
            </div>
          ) : (
            <RecordTurn
              key={explorer.repeat.id}
              missionId={missionId}
              turnId={explorer.repeat.id}
              {...(explorer.repeat.mode ? { mode: explorer.repeat.mode } : {})}
              role={explorer.repeat.role}
              promptEs={explorer.repeat.promptEs}
              targetEn={explorer.repeat.targetEn}
              alias={alias}
              modelClip={explorer.repeat.modelClip}
              cheerBy={explorer.speaker}
              support="full"
              onHelpUsed={onHelpUsed}
              onDone={(status) => {
                const next = (index + 1) * 2;
                // Se guarda antes del festejo: nunca se vuelve a pedir.
                onStepChange?.(next);
                onOral(status, explorer.repeat.targetEn, () => {
                  if (index + 1 >= count) {
                    setValue(next);
                    finishAll();
                  } else setValue(next);
                });
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
