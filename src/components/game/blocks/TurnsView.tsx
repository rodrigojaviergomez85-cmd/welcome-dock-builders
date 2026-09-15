import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CharacterFigure } from "../CharacterFigure";
import { SpeechBubble } from "../SpeechBubble";
import { BilingualLine } from "../BilingualLine";
import { RecordTurn } from "../RecordTurn";
import type { DialogueBlock } from "@/content/missions/types";
import type { CharacterId } from "@/content/characters";

export type Turn = DialogueBlock["conversations"][number]["turns"][number];

type Props = {
  missionId: string;
  conversationId: string;
  partner: CharacterId;
  turns: Turn[];
  alias: string;
  support: "full" | "reduced";
  onHelpUsed: () => void;
  onOral: (status: "heard" | "practiced" | "pending") => void;
  onFinish: () => void;
};

/** Diálogo por turnos: el personaje habla, el alumno responde y se graba. */
export function TurnsView({
  missionId,
  conversationId,
  partner,
  turns,
  alias,
  support,
  onHelpUsed,
  onOral,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(0);
  const turn = turns[index]!;

  function advance() {
    if (index + 1 >= turns.length) onFinish();
    else setIndex(index + 1);
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="flex w-full items-end justify-center gap-3">
        <CharacterFigure id={partner} size="lg" />
        <div className="flex flex-col items-start gap-3 pb-6">
          {turn.type === "character" ? (
            <BilingualLine
              en={turn.en}
              alias={alias}
              clip={turn.clip}
              autoPlayKey={`${conversationId}-${index}`}
            />
          ) : (
            <SpeechBubble en="¡Ahora practicamos!" />
          )}
        </div>
      </div>

      {turn.type === "character" ? (
        <button
          type="button"
          onClick={advance}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          Seguir <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : (
        <RecordTurn
          key={`${conversationId}-${turn.id}`}
          missionId={missionId}
          turnId={`${conversationId}-${turn.id}`}
          promptEs={turn.promptEs}
          targetEn={turn.targetEn.replace("{alias}", alias)}
          alias={alias}
          modelClip={turn.modelClip}
          support={support}
          onHelpUsed={onHelpUsed}
          onDone={(status) => {
            onOral(status);
            advance();
          }}
        />
      )}
    </div>
  );
}
