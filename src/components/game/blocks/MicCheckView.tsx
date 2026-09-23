import { useEffect, useState } from "react";
import type { MicCheckBlock } from "@/content/missions/types";
import { AudioButton } from "../AudioButton";
import { Pip, type PipMood } from "../Pip";
import { RecordTurn } from "../RecordTurn";
import { playClip, stopClip } from "@/lib/audio";
import { playSnore } from "@/lib/feedback-sounds";

type Props = {
  missionId: string;
  block: MicCheckBlock;
  alias: string;
  pipColor: string;
  pipAccessories: string[];
  onHelpUsed: () => void;
  onOral: (status: "heard" | "practiced" | "pending") => void;
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
    onOral(status);
    window.setTimeout(() => setMood("happy"), 800);
    window.setTimeout(onFinish, 1400);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <Pip
        mood={mood}
        color={pipColor}
        accessories={pipAccessories}
        className={done ? "size-36 animate-pop" : "size-36"}
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
            promptEs={block.record.promptEs}
            targetEn={block.record.targetEn}
            alias={alias}
            modelClip={block.record.modelClip}
            support="full"
            onHelpUsed={onHelpUsed}
            onDone={wake}
          />
          <button
            type="button"
            onClick={() => wake("pending")}
            className="tap-target w-full max-w-xl rounded-2xl bg-card/95 px-6 font-display text-xl text-card-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            Lo dije
          </button>
        </>
      ) : (
        <p className="animate-pop rounded-full bg-success px-6 py-3 font-display text-xl text-success-foreground shadow-[var(--shadow-soft)]">
          ¡Pip despertó!
        </p>
      )}
    </div>
  );
}
