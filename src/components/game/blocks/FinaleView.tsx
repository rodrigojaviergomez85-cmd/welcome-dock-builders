import { useState } from "react";
import { ArrowRight, Backpack, Moon } from "lucide-react";
import { CharacterFigure } from "../CharacterFigure";
import { BilingualLine } from "../BilingualLine";
import { TurnsView } from "./TurnsView";
import type { FinaleBlock } from "@/content/missions/types";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: FinaleBlock;
  alias: string;
  avatarImage: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onFinish: () => void;
};

export function FinaleView({
  missionId,
  block,
  alias,
  avatarImage,
  onHelpUsed,
  onOral,
  onFinish,
}: Props) {
  const [phase, setPhase] = useState<"talk" | "tag" | "night">("talk");

  if (phase === "talk") {
    return (
      <TurnsView
        missionId={missionId}
        conversationId="finale"
        partner={block.with}
        turns={block.turns}
        alias={alias}
        support="reduced"
        onHelpUsed={onHelpUsed}
        onOral={onOral}
        onFinish={() => setPhase("tag")}
      />
    );
  }

  if (phase === "tag") {
    return (
      <div className="flex w-full max-w-2xl animate-pop flex-col items-center gap-4 rounded-3xl bg-card/95 p-6 text-center shadow-[var(--shadow-soft)]">
        <p className="flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 font-display text-success">
          <Backpack className="size-5" aria-hidden /> ¡4 de 4 mochilas rescatadas!
        </p>
        <img src={avatarImage} alt={`Tu avatar, ${alias}`} className="h-28 w-auto" />
        <div className="rounded-2xl border-4 border-dashed border-accent px-6 py-4">
          <p className="text-sm text-muted-foreground">Completaste la etiqueta de tu mochila</p>
          <p lang="en" className="font-display text-3xl">
            My name is {alias}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPhase("night")}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          Seguir <ArrowRight className="size-5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex items-end justify-center gap-3">
        <CharacterFigure id={block.goodNight.speaker} size="lg" />
        <div className="flex flex-col items-start gap-3 pb-6">
          <BilingualLine
            en={block.goodNight.en}
            clip={block.goodNight.clip}
            autoPlayKey="goodnight"
            es={block.goodNight.es}
            showAudio={false}
          />
        </div>
      </div>
      <p className="flex items-center gap-2 rounded-2xl bg-card/95 px-4 py-2 text-sm text-muted-foreground">
        <Moon className="size-4" aria-hidden /> Todos se van a dormir.
      </p>
      <button
        type="button"
        onClick={onFinish}
        className="tap-target inline-flex items-center gap-2 rounded-full bg-success px-6 font-display text-lg text-success-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
      >
        Terminar la misión <ArrowRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
