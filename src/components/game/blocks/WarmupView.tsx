import { useEffect, useRef, useState } from "react";
import type { WarmupBlock } from "@/content/missions/types";
import { CharacterFigure } from "../CharacterFigure";
import { Pip } from "../Pip";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { useProgress } from "@/lib/useProgress";
import { pipSizeFor } from "@/lib/progress";
import { fillText, missionVars, resolveClip } from "@/lib/mission-vars";
import { playClip, playThenPause, stopClip } from "@/lib/audio";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: WarmupBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onFinish: () => void;
  /** Paso guardado (turno siguiente por grabar). */
  startIndex?: number;
  onStepChange?: (value: number) => void;
};

/** Calentamiento: Pip despierto en el muelle, repaso corto de lo de ayer. */
export function WarmupView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onFinish,
  startIndex = 0,
  onStepChange,
}: Props) {
  const { state } = useProgress();
  const vars = missionVars(state.profile, alias, block.time);
  const [index, setIndex] = useState(Math.min(startIndex, block.steps.length - 1));
  const step = block.steps[index]!;
  const [recording, setRecording] = useState(!step.line);
  const finishRef = useRef(onFinish);
  finishRef.current = onFinish;

  // Intro del guía solo al entrar por primera vez.
  useEffect(() => {
    if (startIndex >= block.steps.length) {
      // Todo ya dicho (cerró durante el festejo): no se vuelve a pedir.
      finishRef.current();
      return;
    }
    if (startIndex === 0) void playClip(block.introClip);
    return () => stopClip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si el paso tiene una línea del personaje, se oye completa y recién después se graba.
  useEffect(() => {
    if (!step.line) {
      setRecording(true);
      return;
    }
    setRecording(false);
    let active = true;
    void (async () => {
      await playThenPause(step.line!.clip, 300);
      if (active) setRecording(true);
    })();
    return () => {
      active = false;
    };
  }, [index, step.line]);

  const target = fillText(step.record.targetEn, vars);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <div className="flex items-end justify-center gap-3">
        <Pip
          mood="happy"
          color={state.pip.color}
          stage={state.pip.stage}
          feeds={state.pip.feeds}
          accessories={state.pip.accessories}
          size={Math.min(140, pipSizeFor(state.pip))}
        />
        {step.line ? (
          <div className="flex items-end gap-2 animate-pop">
            <CharacterFigure id={step.line.speaker} size="md" />
            <div className="mb-8 rounded-3xl bg-card/95 px-5 py-3 text-center text-card-foreground shadow-[var(--shadow-soft)]">
              <p lang="en" className="font-display text-3xl">
                {step.line.en}
              </p>
              {step.line.es ? <p className="text-sm text-muted-foreground">{step.line.es}</p> : null}
              <AudioButton clipId={step.line.clip} label="Escuchar" className="mt-2" />
            </div>
          </div>
        ) : null}
      </div>

      {recording ? (
        <RecordTurn
          key={step.record.id}
          missionId={missionId}
          turnId={step.record.id}
          {...(step.record.mode ? { mode: step.record.mode } : {})}
          role={step.record.role}
          promptEs={step.record.promptEs}
          targetEn={target}
          alias={alias}
          modelClip={resolveClip(step.record.modelClip, vars)}
          cheerBy={step.line?.speaker ?? "luna"}
          support="full"
          onHelpUsed={onHelpUsed}
          onDone={(status) => {
            const next = index + 1;
            // Se guarda ya: si cierra durante el festejo, no se vuelve a pedir.
            onStepChange?.(next);
            onOral(status, target, () => {
              if (next >= block.steps.length) finishRef.current();
              else setIndex(next);
            });
          }}
        />
      ) : null}
    </div>
  );
}
