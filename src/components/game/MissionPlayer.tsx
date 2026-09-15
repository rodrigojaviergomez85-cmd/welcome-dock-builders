import { useEffect, useState } from "react";
import { BACKGROUNDS } from "@/content/backgrounds";
import type { Mission, TimeOfDay } from "@/content/missions/types";
import { addReward, getMissionProgress, updateMission } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";
import { stopClip } from "@/lib/audio";
import { SceneShell } from "./SceneShell";
import { StoryView } from "./blocks/StoryView";
import { ListenPickView } from "./blocks/ListenPickView";
import { BagMatchView } from "./blocks/BagMatchView";
import { DialogueView } from "./blocks/DialogueView";
import { FinaleView } from "./blocks/FinaleView";
import { MissionComplete } from "./MissionComplete";

type Props = {
  mission: Mission;
  alias: string;
  avatarImage: string;
};

export function MissionPlayer({ mission, alias, avatarImage }: Props) {
  const { state, ready, update } = useProgress();
  const [blockIndex, setBlockIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [restored, setRestored] = useState(false);

  // Recuperar dónde quedó el alumno, una sola vez.
  useEffect(() => {
    if (!ready || restored) return;
    const progress = getMissionProgress(state, mission.id);
    setBlockIndex(Math.min(progress.blockIndex, mission.blocks.length - 1));
    setStepIndex(progress.stepIndex);
    setRestored(true);
    update((prev) => updateMission(prev, mission.id, (p) => ({ ...p, started: true })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, restored]);

  useEffect(() => () => stopClip(), []);

  const block = mission.blocks[blockIndex]!;
  const progress = getMissionProgress(state, mission.id);

  function persist(next: { blockIndex?: number; stepIndex?: number }) {
    update((prev) =>
      updateMission(prev, mission.id, (p) => ({
        ...p,
        blockIndex: next.blockIndex ?? p.blockIndex,
        stepIndex: next.stepIndex ?? p.stepIndex,
      })),
    );
  }

  function onHelpUsed() {
    update((prev) => updateMission(prev, mission.id, (p) => ({ ...p, helpsUsed: p.helpsUsed + 1 })));
  }

  function onComprehension(correct: boolean) {
    update((prev) =>
      updateMission(prev, mission.id, (p) => ({
        ...p,
        comprehension: {
          correct: p.comprehension.correct + (correct ? 1 : 0),
          attempts: p.comprehension.attempts + 1,
        },
      })),
    );
  }

  function onOral(status: "heard" | "practiced" | "pending") {
    update((prev) =>
      updateMission(prev, mission.id, (p) => {
        if (status === "pending") {
          return {
            ...p,
            oral: {
              ...p.oral,
              status: p.oral.status === "none" ? "pending-no-mic" : p.oral.status,
            },
          };
        }
        return {
          ...p,
          oral: {
            recordings: p.oral.recordings + 1,
            understood: p.oral.understood + (status === "heard" ? 1 : 0),
            status: status === "heard" || p.oral.status === "heard" ? "heard" : "practiced",
          },
        };
      }),
    );
  }

  function goToStep(index: number) {
    setStepIndex(index);
    persist({ stepIndex: index });
  }

  function nextBlock() {
    stopClip();
    if (blockIndex + 1 >= mission.blocks.length) {
      completeMission();
      return;
    }
    const next = blockIndex + 1;
    setBlockIndex(next);
    setStepIndex(0);
    persist({ blockIndex: next, stepIndex: 0 });
  }

  function completeMission() {
    update((prev) =>
      updateMission(prev, mission.id, (p) =>
        addReward(
          {
            ...p,
            completed: true,
            completions: p.completions + 1,
            blockIndex: 0,
            stepIndex: 0,
          },
          mission.reward.id,
        ),
      ),
    );
    setFinished(true);
  }

  function replay() {
    setFinished(false);
    setBlockIndex(0);
    setStepIndex(0);
    persist({ blockIndex: 0, stepIndex: 0 });
  }

  if (!ready || !restored) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-xl text-muted-foreground">Cargando la isla…</p>
      </div>
    );
  }

  if (finished) {
    return (
      <MissionComplete
        mission={mission}
        progress={progress}
        alias={alias}
        avatarImage={avatarImage}
        onReplay={replay}
      />
    );
  }

  let time: TimeOfDay = "morning";
  if (block.kind === "story") time = block.time;
  if (block.kind === "listenPick") time = block.rounds[Math.min(stepIndex, block.rounds.length - 1)]!.time;
  if (block.kind === "bagMatch") time = "afternoon";
  if (block.kind === "dialogue")
    time = block.conversations[Math.min(stepIndex, block.conversations.length - 1)]!.time;
  if (block.kind === "finale") time = block.time;

  return (
    <SceneShell
      background={BACKGROUNDS[time]}
      title={mission.title}
      helpEs={block.helpEs}
      onHelpUsed={onHelpUsed}
      steps={{ total: mission.blocks.length, current: blockIndex }}
    >
      {showingIntro ? (
        <BlockIntro blockId={block.id} onStart={() => setIntroFor(block.id)} />
      ) : null}

      {!showingIntro && block.kind === "story" ? (
        <StoryView
          block={block}
          alias={alias}
          onComprehension={onComprehension}
          onFinish={nextBlock}
        />
      ) : null}

      {!showingIntro && block.kind === "listenPick" ? (
        <ListenPickView
          block={block}
          startIndex={stepIndex}
          onComprehension={onComprehension}
          onRoundChange={goToStep}
          onFinish={nextBlock}
        />
      ) : null}

      {!showingIntro && block.kind === "bagMatch" ? (
        <BagMatchView
          block={block}
          alias={alias}
          avatarImage={avatarImage}
          startIndex={stepIndex}
          onComprehension={onComprehension}
          onItemChange={goToStep}
          onFinish={nextBlock}
        />
      ) : null}

      {!showingIntro && block.kind === "dialogue" ? (
        <DialogueView
          missionId={mission.id}
          block={block}
          alias={alias}
          startIndex={stepIndex}
          onHelpUsed={onHelpUsed}
          onOral={onOral}
          onConversationChange={goToStep}
          onFinish={nextBlock}
        />
      ) : null}

      {!showingIntro && block.kind === "finale" ? (
        <FinaleView
          missionId={mission.id}
          block={block}
          alias={alias}
          avatarImage={avatarImage}
          onHelpUsed={onHelpUsed}
          onOral={onOral}
          onFinish={nextBlock}
        />
      ) : null}
    </SceneShell>
  );
}
