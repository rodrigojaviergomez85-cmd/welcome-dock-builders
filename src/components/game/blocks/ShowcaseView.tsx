import { useState } from "react";
import { ArrowRight, PartyPopper } from "lucide-react";
import type { ShowcaseBlock } from "@/content/missions/types";
import { CharacterFigure } from "../CharacterFigure";
import { AudioButton } from "../AudioButton";
import { RecordTurn } from "../RecordTurn";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText, resolveClip } from "@/lib/mission-vars";
import { gloss } from "@/content/glossary";
import { playFanfare } from "@/lib/feedback-sounds";

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
  const [stage, setStage] = useState<"intro" | "step" | "cheer">("intro");
  const [index, setIndex] = useState(Math.min(startIndex, block.steps.length - 1));
  const vars = missionVars(state.profile, alias, block.time);

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
          <AudioButton
            clipId={block.intro.clip}
            autoPlayKey={block.id}
            label="Escuchar"
            className="mt-4"
          />
        </div>
        <button
          type="button"
          onClick={() => setStage("step")}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          ¡Empiezo! <ArrowRight className="size-5" aria-hidden />
        </button>
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
          <AudioButton
            clipId={block.cheer.clip}
            autoPlayKey={`${block.id}-cheer`}
            label="Escuchar"
            className="mt-3"
          />
        </div>
        <button
          type="button"
          onClick={onFinish}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)]"
        >
          Seguir <ArrowRight className="size-5" aria-hidden />
        </button>
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
        promptEs={step.promptEs}
        targetEn={fillText(step.targetEn, vars)}
        alias={alias}
        modelClip={resolveClip(step.modelClip, vars)}
        meaning={
          template?.es
            ? {
                es: fillText(template.es.split("{age}").join(vars.ageEs), vars),
                esClip: template.esClip,
              }
            : undefined
        }
        support="full"
        onHelpUsed={onHelpUsed}
        onDone={(status) => {
          onOral(status);
          if (index + 1 >= block.steps.length) {
            playFanfare();
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
