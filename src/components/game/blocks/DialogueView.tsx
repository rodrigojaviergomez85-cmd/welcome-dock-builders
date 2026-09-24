import { useState } from "react";
import { TurnsView } from "./TurnsView";
import type { DialogueBlock } from "@/content/missions/types";
import type { OralHandler } from "../MissionPlayer";

/** Estado guardado: conversación * 100 + turno. */
export const DIALOGUE_STEP = 100;

type Props = {
  missionId: string;
  block: DialogueBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onConversationChange: (value: number) => void;
  startIndex?: number;
  onFinish: () => void;
};

export function DialogueView({
  missionId,
  block,
  alias,
  onHelpUsed,
  onOral,
  onConversationChange,
  startIndex = 0,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(
    Math.min(Math.floor(startIndex / DIALOGUE_STEP), block.conversations.length - 1),
  );
  const [startTurn] = useState(() => ({ conv: index, turn: startIndex % DIALOGUE_STEP }));
  const conversation = block.conversations[index]!;

  return (
    <TurnsView
      key={conversation.id}
      missionId={missionId}
      conversationId={conversation.id}
      partner={conversation.with}
      turns={conversation.turns}
      alias={alias}
      support={conversation.support}
      startTurn={startTurn.conv === index ? startTurn.turn : 0}
      onTurnChange={(turn) => onConversationChange(index * DIALOGUE_STEP + turn)}
      onHelpUsed={onHelpUsed}
      onOral={onOral}
      onFinish={() => {
        if (index + 1 >= block.conversations.length) {
          onFinish();
          return;
        }
        const next = index + 1;
        setIndex(next);
        onConversationChange(next * DIALOGUE_STEP);
      }}
    />
  );
}
