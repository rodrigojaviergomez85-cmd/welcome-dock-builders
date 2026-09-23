import { useEffect, useRef, useState } from "react";
import { playClip, isPlaying } from "@/lib/audio";
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

  const advanceRef = useRef<() => void>(() => {});

  // Cuando habla un personaje, el turno avanza solo al terminar el clip
  // (si el niño tocó "Escuchar otra vez", espera a que termine esa repetición).
  useEffect(() => {
    if (turn.type !== "character") return;
    let active = true;
    void (async () => {
      await playClip(turn.clip);
      await new Promise((r) => setTimeout(r, 400));
      while (active && isPlaying()) await new Promise((r) => setTimeout(r, 250));
      if (active) advanceRef.current();
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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
            />
          ) : (
            <SpeechBubble en="¡Ahora practicamos!" />
          )}
        </div>
      </div>

      {turn.type === "character" ? (
        <span className="sr-only">Escuchá; sigue solo.</span>
      ) : (
        <RecordTurn
          key={`${conversationId}-${turn.id}`}
          missionId={missionId}
          turnId={`${conversationId}-${turn.id}`}
          {...(turn.mode ? { mode: turn.mode } : {})}
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
