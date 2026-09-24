import { useCallback, useEffect, useState } from "react";
import { BACKGROUNDS } from "@/content/backgrounds";
import type { Mission, TimeOfDay } from "@/content/missions/types";
import {
  addReward,
  getMissionProgress,
  updateMission,
  type OralResult,
  PIP_DAYS,
  type PipProgress,
} from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";
import { stopClip } from "@/lib/audio";
import { SceneShell } from "./SceneShell";
import { StoryView } from "./blocks/StoryView";
import { ListenPickView } from "./blocks/ListenPickView";
import { BagMatchView } from "./blocks/BagMatchView";
import { DialogueView } from "./blocks/DialogueView";
import { FinaleView } from "./blocks/FinaleView";
import { TapPickView } from "./blocks/TapPickView";
import { PickProfileView } from "./blocks/PickProfileView";
import { SpellView } from "./blocks/SpellView";
import { ShowcaseView } from "./blocks/ShowcaseView";
import { MicCheckView } from "./blocks/MicCheckView";
import { SunClockView } from "./blocks/SunClockView";
import { NameTagView } from "./blocks/NameTagView";
import { resolveTime } from "@/lib/mission-vars";
import {
  addCoins,
  addPassPiece,
  registerPlayDay,
  COINS_PER_MISSION,
  COINS_PER_STEP,
} from "@/lib/economy";
import { MissionComplete } from "./MissionComplete";
import { BlockIntro } from "./BlockIntro";
import { BLOCK_INTROS } from "@/content/glossary";
import { DEFAULT_PIP_COLOR, type PipMood } from "./Pip";
import { PipFeedMoment } from "./PipFeedMoment";

type Props = {
  mission: Mission;
  alias: string;
  avatarImage: string;
};

export type OralHandler = (status: OralResult, phrase: string, after?: () => void) => void;

type FeedMoment = {
  phrase: string;
  before: PipProgress;
  after: PipProgress;
  evolved: boolean;
  continueAfter?: () => void;
};

export function MissionPlayer({ mission, alias, avatarImage }: Props) {
  const { state, ready, update } = useProgress();
  const [blockIndex, setBlockIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [restored, setRestored] = useState(false);
  /** Id del bloque cuya explicación en español ya se vio. */
  const [introFor, setIntroFor] = useState<string | null>(null);
  /** Hora del cielo mientras se juega el reloj del sol, y soles dorados ganados. */
  const [sunTime, setSunTime] = useState<TimeOfDay | null>(null);
  const [skyTime, setSkyTime] = useState<TimeOfDay | null>(null);
  const [sunGold, setSunGold] = useState(0);
  const [pipMood] = useState<PipMood>("happy");
  const [feedMoment, setFeedMoment] = useState<FeedMoment | null>(null);
  const [pipBounceKey, setPipBounceKey] = useState(0);

  // Recuperar dónde quedó el alumno, una sola vez.
  useEffect(() => {
    if (!ready || restored) return;
    const progress = getMissionProgress(state, mission.id);
    setBlockIndex(Math.min(progress.blockIndex, mission.blocks.length - 1));
    setStepIndex(progress.stepIndex);
    setRestored(true);
    update((prev) =>
      registerPlayDay({
        ...updateMission(prev, mission.id, (p) => ({ ...p, started: true })),
        pip: progress.completed && progress.blockIndex === 0 ? { ...prev.pip, feeds: 0 } : prev.pip,
      }),
    );
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
    update((prev) =>
      updateMission(prev, mission.id, (p) => ({ ...p, helpsUsed: p.helpsUsed + 1 })),
    );
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

  function onOral(status: OralResult, phrase: string, continueAfter?: () => void) {
    const target = mission.pip?.feedsToEvolve ?? 0;
    const shouldFeed = status !== "pending";
    if (shouldFeed) {
      const before = state.pip;
      const nextFeeds = target > 0 ? Math.min(before.feeds + 1, target) : before.feeds + 1;
      const earnsReward =
        target > 0 && nextFeeds >= target && !before.accessories.includes(mission.reward.id);
      const after: PipProgress = {
        ...before,
        feeds: nextFeeds,
        totalFeeds: before.totalFeeds + 1,
        stage: earnsReward ? Math.min(4, before.stage + 1) : before.stage,
        accessories: earnsReward ? [...before.accessories, mission.reward.id] : before.accessories,
      };
      update((prev) => ({ ...prev, pip: after }));
      setFeedMoment({
        phrase,
        before,
        after,
        evolved: earnsReward,
        ...(continueAfter ? { continueAfter } : {}),
      });
    }
    update((prev) =>
      updateMission(prev, mission.id, (p) => {
        if (status === "pending") {
          return {
            ...p,
            oral: {
              ...p.oral,
              said: (p.oral.said ?? 0) + 1,
              status: p.oral.status === "none" ? "pending-no-mic" : p.oral.status,
            },
          };
        }
        return {
          ...p,
          oral: {
            said: (p.oral.said ?? 0) + 1,
            recordings: p.oral.recordings + 1,
            understood: p.oral.understood + (status === "heard" ? 1 : 0),
            status: status === "heard" || p.oral.status === "heard" ? "heard" : "practiced",
          },
        };
      }),
    );
    if (!shouldFeed) continueAfter?.();
  }

  const closeFeedMoment = useCallback(() => {
    setFeedMoment((current) => {
      window.setTimeout(() => current?.continueAfter?.(), 0);
      return null;
    });
    setPipBounceKey((value) => value + 1);
  }, []);

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
    update((prev) => addCoins(prev, COINS_PER_STEP));
    setBlockIndex(next);
    setStepIndex(0);
    persist({ blockIndex: next, stepIndex: 0 });
  }

  function completeMission() {
    update((prev) => {
      const day = PIP_DAYS.find((candidate) => candidate === mission.id);
      const marks = day
        ? [...prev.pip.marks.filter((mark) => mark.day !== day), { day, feeds: prev.pip.feeds }]
        : prev.pip.marks;
      return {
        ...addPassPiece(addCoins(prev, COINS_PER_MISSION), mission.id),
        pip: { ...prev.pip, marks },
      };
    });
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
    update((prev) => ({ ...prev, pip: { ...prev.pip, feeds: 0 } }));
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
  if (block.kind === "listenPick")
    time = block.rounds[Math.min(stepIndex, block.rounds.length - 1)]!.time;
  if (block.kind === "bagMatch") time = "afternoon";
  if (block.kind === "dialogue")
    time = block.conversations[Math.min(stepIndex, block.conversations.length - 1)]!.time;
  if (block.kind === "finale") time = block.time;
  if (
    block.kind === "tapPick" ||
    block.kind === "pickProfile" ||
    block.kind === "spell" ||
    block.kind === "micCheck" ||
    block.kind === "nameTag"
  )
    time = block.time;
  if (block.kind === "showcase") time = resolveTime(block.time);
  if (block.kind === "sunClock") time = sunTime ?? block.stops[0]?.time ?? "morning";
  if (block.kind === "tapPick" && block.style === "sky") time = skyTime ?? block.time;

  const sunBlock = block.kind === "sunClock" ? block : null;
  const showingIntro = BLOCK_INTROS[block.id] !== undefined && introFor !== block.id;
  const bagsIndex = mission.blocks.findIndex((candidate) => candidate.kind === "bagMatch");
  const counter = sunBlock
    ? { icon: "star" as const, total: sunBlock.stops.length, current: sunGold, label: "Soles" }
    : bagsIndex >= 0
      ? {
          icon: "bag" as const,
          total: 4,
          current:
            blockIndex < bagsIndex ? 0 : blockIndex === bagsIndex ? Math.min(stepIndex, 3) : 3,
        }
      : { icon: "star" as const, total: mission.blocks.length, current: blockIndex };

  return (
    <>
      <SceneShell
        background={BACKGROUNDS[time]}
        title={mission.title}
        helpEs={block.helpEs}
        onHelpUsed={onHelpUsed}
        counter={counter}
        pip={{
          mood: block.kind === "micCheck" ? "sleepy" : pipMood,
          color: state.pip.color ?? DEFAULT_PIP_COLOR,
          feeds: state.pip.feeds,
          total: mission.pip?.feedsToEvolve ?? 0,
          totalFeeds: state.pip.totalFeeds,
          stage: state.pip.stage,
          accessories: state.pip.accessories,
          marks: state.pip.marks,
          day={PIP_DAYS.find((candidate) => candidate === mission.id) ?? "monday"}
          bounceKey: pipBounceKey,
        }}
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

        {!showingIntro && block.kind === "tapPick" ? (
          <TapPickView
            block={block}
            startIndex={stepIndex}
            onComprehension={onComprehension}
            onRoundChange={goToStep}
            onSkyChange={setSkyTime}
            onFinish={nextBlock}
          />
        ) : null}

        {!showingIntro && block.kind === "pickProfile" ? (
          <PickProfileView
            missionId={mission.id}
            block={block}
            alias={alias}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            onFinish={nextBlock}
          />
        ) : null}

        {!showingIntro && block.kind === "spell" ? (
          <SpellView
            missionId={mission.id}
            block={block}
            alias={alias}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            onFinish={nextBlock}
          />
        ) : null}

        {!showingIntro && block.kind === "showcase" ? (
          <ShowcaseView
            missionId={mission.id}
            block={block}
            alias={alias}
            startIndex={stepIndex}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            onStepChange={goToStep}
            onFinish={nextBlock}
          />
        ) : null}

        {!showingIntro && block.kind === "micCheck" ? (
          <MicCheckView
            missionId={mission.id}
            block={block}
            alias={alias}
            pipColor={state.pip.color}
            pipAccessories={state.pip.accessories}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            onFinish={nextBlock}
          />
        ) : null}

        {!showingIntro && block.kind === "sunClock" ? (
          <SunClockView
            missionId={mission.id}
            block={block}
            alias={alias}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            startIndex={stepIndex}
            onStepChange={goToStep}
            onTimeChange={setSunTime}
            onGoldChange={setSunGold}
            onFinish={() => {
              setSunTime(null);
              setSunGold(0);
              nextBlock();
            }}
          />
        ) : null}

        {!showingIntro && block.kind === "nameTag" ? (
          <NameTagView
            missionId={mission.id}
            block={block}
            alias={alias}
            onHelpUsed={onHelpUsed}
            onOral={onOral}
            onReward={() =>
              update((prev) =>
                updateMission(prev, mission.id, (missionProgress) =>
                  addReward(missionProgress, mission.reward.id),
                ),
              )
            }
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
      {feedMoment ? (
        <PipFeedMoment
          phrase={feedMoment.phrase}
          before={feedMoment.before}
          after={feedMoment.after}
          feedsToEvolve={mission.pip?.feedsToEvolve ?? 0}
          evolved={feedMoment.evolved}
          day={PIP_DAYS.find((candidate) => candidate === mission.id) ?? "monday"}
          rewardLabel={mission.pip?.rewardLabel ?? mission.reward.label}
          onClose={closeFeedMoment}
        />
      ) : null}
    </>
  );
}
