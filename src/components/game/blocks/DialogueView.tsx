import { useState } from "react";
import { TurnsView } from "./TurnsView";
import type { DialogueBlock } from "@/content/missions/types";

type Props = {
  missionId: string;
  block: DialogueBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: (status: "practiced" | "pending") => void;
  onConversationChange: (index: number) => void;
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
  const [index, setIndex] = useState(Math.min(startIndex, block.conversations.length - 1));
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
      onHelpUsed={onHelpUsed}
      onOral={onOral}
      onFinish={() => {
        if (index + 1 >= block.conversations.length) {
          onFinish();
          return;
        }
        const next = index + 1;
        setIndex(next);
        onConversationChange(next);
      }}
    />
  );
}
