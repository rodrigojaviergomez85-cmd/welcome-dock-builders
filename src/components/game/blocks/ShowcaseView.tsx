import { useEffect, useRef, useState } from "react";
import { PartyPopper } from "lucide-react";
import type { ShowcaseBlock } from "@/content/missions/types";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText, resolveClip } from "@/lib/mission-vars";
import { gloss } from "@/content/glossary";
import { playFanfare } from "@/lib/feedback-sounds";
import { playClip, stopClip } from "@/lib/audio";

type Props = {
  missionId: string;
  block: ShowcaseBlock;
  alias: string;
  startIndex?: number;
  onHelpUsed: () => void;
  onOral: (status: "heard" | "practiced" | "pending") => void;
  onStepChange: (index: number) => void;
  onFinish: () => void;
};

/** El jugador se presenta frente al público de la isla, una frase por vez. */
export function ShowcaseView({
  missionId,
  block,
  alias,
  startIndex = 0,
  onHelpUsed,
  onOral,
  onStepChange,
  onFinish,
}: Props) {
  const { state } = useProgress();
  const unmountedRef = useRef(false);
  const finishRef = useRef(onFinish);
  const finishedRef = useRef(false);
  finishRef.current = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };
  const [stage, setStage] = useState<"intro" | "step" | "cheer" | "teaser">("intro");
  const [index, setIndex] = useState(Math.min(startIndex, block.steps.length - 1));
  const vars = missionVars(state.profile, alias, block.time);
  const [showSkip, setShowSkip] = useState(false);

  // "Seguir" de respaldo a los 3 s en intro y teaser, por si el audio tarda.
  useEffect(() => {
    setShowSkip(false);
    if (stage !== "intro" && stage !== "teaser") return;
    const t = window.setTimeout(() => setShowSkip(true), 3000);
    return () => window.clearTimeout(t);
  }, [stage]);

  const skipButton = showSkip ? (
    <button
      type="button"
      onClick={() => {
        stopClip();
        if (stage === "intro") setStage("step");
        else finishRef.current();
      }}
      className="tap-target animate-pop rounded-full bg-primary px-8 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)]"
    >
      Seguir
    </button>
  ) : null;

  useEffect(() => {
    let active = true;
    void (async () => {
      await playClip("es-dock-intro");
      if (!active) return;
      await playClip(block.intro.clip);
      if (active) setStage("step");
    })();
    return () => {
      active = false;
      stopClip();
    };
  }, [block.intro.clip]);

  useEffect(() => {
    if (stage !== "cheer") return;
    // No se cancela al pasar a "teaser": solo al salir del bloque (ver unmountedRef).
    void (async () => {
      playFanfare();
      await playClip(block.cheer.clip);
      if (unmountedRef.current) return;
      if (block.teaser) {
        setStage("teaser");
        await playClip(block.teaser.clip);
      }
      if (!unmountedRef.current) finishRef.current();
    })();
  }, [block.cheer.clip, block.teaser, stage]);

  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const audience = (
    <div className="flex items-end justify-center gap-1">
      {block.audience.map((id) => (
        <CharacterFigure key={id} id={id} size="md" />
      ))}
    </div>
  );

  if (stage === "intro") {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        {audience}
        <div className="rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-2xl">
            {block.intro.en}
          </p>
          <p className="mt-1 text-muted-foreground">{block.intro.es}</p>
          <AudioButton clipId={block.intro.clip} label="Escuchar" className="mt-4" />
        </div>
        {skipButton}
      </div>
    );
  }

  if (stage === "teaser" && block.teaser) {
    return (
      <div className="flex w-full max-w-2xl animate-pop flex-col items-center gap-4">
        <CharacterFigure id={block.teaser.speaker} size="lg" />
        <div className="rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p lang="en" className="font-display text-2xl">
            {block.teaser.en}
          </p>
          <p className="mt-1 text-muted-foreground">{block.teaser.es}</p>
        </div>
        {skipButton}
      </div>
    );
  }

  if (stage === "cheer") {
    return (
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        {audience}
        <div className="animate-pop rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p className="flex items-center justify-center gap-2 font-display text-2xl text-success">
            <PartyPopper className="size-6" aria-hidden /> ¡Te aplauden!
          </p>
          <p lang="en" className="mt-2 font-display text-xl">
            {block.cheer.en}
          </p>
          <p className="text-muted-foreground">{block.cheer.es}</p>
          <AudioButton clipId={block.cheer.clip} label="Escuchar" className="mt-3" />
        </div>
      </div>
    );
  }

  const step = block.steps[index]!;
  const template = gloss(step.targetEn);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-3">
      <p className="rounded-full bg-card/90 px-4 py-1 text-sm text-muted-foreground">
        Parte {index + 1} de {block.steps.length}
      </p>
      <RecordTurn
        key={step.id}
        missionId={missionId}
        turnId={step.id}
        {...(step.mode ? { mode: step.mode } : {})}
        role={step.role}
        promptEs={step.promptEs}
        targetEn={fillText(step.targetEn, vars)}
        alias={alias}
        modelClip={resolveClip(step.modelClip, vars)}
        {...(block.saveAs ? { saveAs: block.saveAs } : {})}
        meaning={
          template?.es
            ? {
                es: fillText(template.es.split("{age}").join(vars.ageEs), vars),
                esClip: template.esClip ? [`es-${vars.greetingClip}`, template.esClip] : undefined,
              }
            : undefined
        }
        support="full"
        onHelpUsed={onHelpUsed}
        onDone={(status) => {
          onOral(status);
          if (index + 1 >= block.steps.length) {
            setStage("cheer");
            return;
          }
          const next = index + 1;
          setIndex(next);
          onStepChange(next);
        }}
      />
    </div>
  );
}
