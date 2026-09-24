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
  addLearned,
} from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/useProgress";
import { playClip, stopClip } from "@/lib/audio";
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
import { DEFAULT_PIP_COLOR, Pip, type PipMood } from "./Pip";
import { DIALOGUE_STEP } from "./blocks/DialogueView";
import { PipFeedMoment } from "./PipFeedMoment";
import { takeLastTake, type PipVoiceSource } from "@/lib/pip-voice";

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
  voice: PipVoiceSource | null;
  continueAfter?: () => void;
};

export function MissionPlayer({ mission, alias, avatarImage }: Props) {
  const { state, ready, update } = useProgress();
  const [blockIndex, setBlockIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [restored, setRestored] = useState(false);
  /** Etapa de Pip al empezar a jugar, para mostrar la mudanza si evoluciona. */
  const [stageAtStart, setStageAtStart] = useState<number | null>(null);
  /** Id del bloque cuya explicación en español ya se vio. */
  const [introFor, setIntroFor] = useState<string | null>(null);
  /** Hora del cielo mientras se juega el reloj del sol, y soles dorados ganados. */
  const [sunTime, setSunTime] = useState<TimeOfDay | null>(null);
  const [skyTime, setSkyTime] = useState<TimeOfDay | null>(null);
  const [sunGold, setSunGold] = useState(0);
  const [pipMood] = useState<PipMood>("happy");
  const [feedMoment, setFeedMoment] = useState<FeedMoment | null>(null);
  const [pipBounceKey, setPipBounceKey] = useState(0);
  const [resumed, setResumed] = useState(false);

  // Recuperar dónde quedó el alumno, una sola vez.
  useEffect(() => {
    if (!ready || restored) return;
    const progress = getMissionProgress(state, mission.id);
    setBlockIndex(Math.min(progress.blockIndex, mission.blocks.length - 1));
    setStepIndex(progress.stepIndex);
    if (!progress.completed && (progress.blockIndex > 0 || progress.stepIndex > 0)) {
      setResumed(true);
      // A mitad de un bloque, su explicación ya se vio.
      const current = mission.blocks[Math.min(progress.blockIndex, mission.blocks.length - 1)];
      if (current && progress.stepIndex > 0) setIntroFor(current.id);
    }
    setRestored(true);
    setStageAtStart(state.pip.stage);
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
    const shouldFeed = true;
    const take = takeLastTake();
    if (shouldFeed) {
      const before = state.pip;
      const learned = addLearned(before.learned, {
        phrase,
        clip: take?.clip ?? "",
        at: new Date().toISOString(),
        ...(take?.blob && take.recordingKey ? { recordingKey: take.recordingKey } : {}),
      });
      const nextFeeds = target > 0 ? Math.min(before.feeds + 1, target) : before.feeds + 1;
      const earnsReward =
        target > 0 && nextFeeds >= target && !before.accessories.includes(mission.reward.id);
      const after: PipProgress = {
        ...before,
        feeds: nextFeeds,
        totalFeeds: before.totalFeeds + 1,
        stage: earnsReward ? Math.min(4, before.stage + 1) : before.stage,
        accessories: earnsReward ? [...before.accessories, mission.reward.id] : before.accessories,
        learned,
      };
      update((prev) => ({ ...prev, pip: after }));
      setFeedMoment({
        phrase,
        before,
        after,
        evolved: earnsReward,
        voice: take,
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

  if (resumed) {
    return (
      <ResumeScreen
        mission={mission}
        blockIndex={blockIndex}
        pipColor={state.pip.color ?? DEFAULT_PIP_COLOR}
        pipStage={state.pip.stage}
        pipAccessories={state.pip.accessories}
        onContinue={() => {
          stopClip();
          setResumed(false);
        }}
        onRestart={() => {
          stopClip();
          setIntroFor(null);
          setSunTime(null);
          setSunGold(0);
          replay();
          setResumed(false);
        }}
      />
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
        {...(stageAtStart !== null && state.pip.stage > stageAtStart
          ? { homeFrom: stageAtStart }
          : {})}
      />
    );
  }

  let time: TimeOfDay = "morning";
  if (block.kind === "story") time = block.time;
  if (block.kind === "listenPick")
    time = block.rounds[Math.min(stepIndex, block.rounds.length - 1)]!.time;
  if (block.kind === "bagMatch") time = "afternoon";
  if (block.kind === "dialogue")
    time =
      block.conversations[
        Math.min(Math.floor(stepIndex / DIALOGUE_STEP), block.conversations.length - 1)
      ]!.time;
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
          learned: state.pip.learned,
          day: PIP_DAYS.find((candidate) => candidate === mission.id) ?? "monday",
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
            startIndex={stepIndex}
            onStepChange={goToStep}
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
          voice={feedMoment.voice}
          day={PIP_DAYS.find((candidate) => candidate === mission.id) ?? "monday"}
          rewardLabel={mission.pip?.rewardLabel ?? mission.reward.label}
          onClose={closeFeedMoment}
        />
      ) : null}
    </>
  );
}

const BLOCK_LABEL: Record<string, string> = {
  micCheck: "Pip",
  sunClock: "Reloj del sol",
  tapPick: "Cielos",
  nameTag: "Etiqueta",
  dialogue: "Charla",
  showcase: "Presentación",
};

function ResumeScreen({
  mission,
  blockIndex,
  pipColor,
  pipStage,
  pipAccessories,
  onContinue,
  onRestart,
}: {
  mission: Mission;
  blockIndex: number;
  pipColor: string;
  pipStage: number;
  pipAccessories: string[];
  onContinue: () => void;
  onRestart: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    void playClip("es-welcome-back");
    return () => stopClip();
  }, []);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background p-6 text-center">
      <div className="animate-[boti-hop_1.2s_ease-in-out_infinite]">
        <Pip
          mood="happy"
          color={pipColor}
          stage={pipStage}
          accessories={pipAccessories}
          size={180}
        />
      </div>
      <h1 className="font-display text-3xl sm:text-4xl">¡Volviste! Seguimos donde quedaste</h1>
      <ol
        className="flex w-full max-w-xl flex-wrap justify-center gap-2"
        aria-label="Partes de la misión"
      >
        {mission.blocks.map((b, i) => (
          <li
            key={b.id}
            aria-current={i === blockIndex ? "step" : undefined}
            className={cn(
              "rounded-full px-3 py-1 text-sm",
              i < blockIndex && "bg-success text-success-foreground",
              i === blockIndex &&
                "bg-primary font-display text-base text-primary-foreground ring-4 ring-primary/40",
              i > blockIndex && "bg-muted text-muted-foreground",
            )}
          >
            {BLOCK_LABEL[b.kind] ?? `Parte ${i + 1}`}
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onContinue}
        className="tap-target rounded-full bg-primary px-12 py-4 font-display text-2xl text-primary-foreground shadow-[var(--shadow-pop)]"
      >
        Continuar
      </button>
      {confirming ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
          <p className="text-sm">¿Seguro? Vas a empezar la misión desde el principio.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-destructive px-4 py-2 text-sm text-destructive-foreground"
            >
              Sí, de nuevo
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-full bg-muted px-4 py-2 text-sm"
            >
              No
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm text-muted-foreground underline"
        >
          Empezar de nuevo
        </button>
      )}
    </div>
  );
}
