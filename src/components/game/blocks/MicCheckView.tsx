import { useEffect, useState } from "react";
import type { MicCheckBlock } from "@/content/missions/types";
import { AudioButton } from "../AudioButton";
import { Pip, type PipMood } from "../Pip";
import { RecordTurn } from "../RecordTurn";
import { playClip, stopClip } from "@/lib/audio";
import { playSnore } from "@/lib/feedback-sounds";
import { useProgress } from "@/lib/useProgress";
import { pipSizeFor } from "@/lib/progress";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: MicCheckBlock;
  alias: string;
  pipColor: string;
  pipAccessories: string[];
  onHelpUsed: () => void;
  onOral: OralHandler;
  onFinish: () => void;
};

export function MicCheckView({
  missionId,
  block,
  alias,
  pipColor,
  pipAccessories,
  onHelpUsed,
  onOral,
  onFinish,
}: Props) {
  const { state: progress } = useProgress();
  const [mood, setMood] = useState<PipMood>("sleepy");
  const [done, setDone] = useState(false);

  useEffect(() => {
    playSnore();
    void playClip(block.introClip);
    return () => stopClip();
  }, [block.introClip]);

  function wake(status: "heard" | "practiced" | "pending") {
    if (done) return;
    setDone(true);
    setMood(status === "pending" ? "happy" : "eat");
    onOral(status, block.record.targetEn, onFinish);
    window.setTimeout(() => setMood("happy"), 800);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <Pip
        mood={mood}
        color={pipColor}
        stage={progress.pip.stage}
        feeds={progress.pip.feeds}
        accessories={pipAccessories}
        size={Math.min(224, pipSizeFor(progress.pip))}
        {...(done ? { className: "animate-pop" } : {})}
      />
      <div className="flex items-center gap-2 rounded-3xl bg-card/95 px-5 py-3 shadow-[var(--shadow-soft)]">
        <p lang="en" className="font-display text-3xl text-card-foreground">
          Hello!
        </p>
        <AudioButton clipId={block.record.modelClip} label="Escuchar Hello" size="sm" />
      </div>
      {!done ? (
        <>
          <RecordTurn
            missionId={missionId}
            turnId={block.record.id}
            {...(block.record.mode ? { mode: block.record.mode } : {})}
            role={block.record.role}
            promptEs={block.record.promptEs}
            targetEn={block.record.targetEn}
            alias={alias}
            modelClip={block.record.modelClip}
            support="full"
            onHelpUsed={onHelpUsed}
            onDone={wake}
          />
        </>
      ) : (
        <p className="animate-pop rounded-full bg-success px-6 py-3 font-display text-xl text-success-foreground shadow-[var(--shadow-soft)]">
          ¡Pip despertó!
        </p>
      )}
    </div>
  );
}
