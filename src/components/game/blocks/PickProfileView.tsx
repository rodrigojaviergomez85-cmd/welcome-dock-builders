import { useState } from "react";
import { Check } from "lucide-react";
import type { PickProfileBlock } from "@/content/missions/types";
import { vocab } from "@/content/vocabulary";
import { playSuccess } from "@/lib/feedback-sounds";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText, resolveClip } from "@/lib/mission-vars";
import { RecordTurn } from "../RecordTurn";
import { cn } from "@/lib/utils";

type Props = {
  missionId: string;
  block: PickProfileBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: (status: "heard" | "practiced" | "pending") => void;
  onFinish: () => void;
};

/** El jugador elige su país o su edad; queda guardado y después lo dice en inglés. */
export function PickProfileView({ missionId, block, alias, onHelpUsed, onOral, onFinish }: Props) {
  const { state, update } = useProgress();
  const [chosen, setChosen] = useState<string | null>(null);

  function choose(id: string) {
    setChosen(id);
    playSuccess();
    update((prev) => {
      if (!prev.profile) return prev;
      const profile =
        block.field === "country"
          ? { ...prev.profile, countryId: id }
          : { ...prev.profile, age: Number(id.replace("n-", "")) };
      return { ...prev, profile };
    });
  }

  if (!chosen) {
    return (
      <div className="flex w-full max-w-3xl flex-col items-center gap-4">
        <div className="rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
          <p className="font-display text-2xl">{block.promptEs}</p>
        </div>
        <div
          className={cn(
            "grid w-full gap-3",
            block.field === "age" ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          {block.options.map((id) => {
            const item = vocab(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                className="tap-target flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl bg-card/95 p-3 text-card-foreground shadow-[var(--shadow-soft)] active:translate-y-1"
              >
                <span className="text-4xl font-display" aria-hidden>
                  {item.symbol}
                </span>
                <span className="text-sm text-muted-foreground">{item.es}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const vars = missionVars(state.profile, alias);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-3">
      <p className="flex items-center gap-2 rounded-full bg-success/20 px-4 py-2 font-display text-success">
        <Check className="size-5" aria-hidden /> {vocab(chosen).es}
      </p>
      <RecordTurn
        missionId={missionId}
        turnId={block.id}
        promptEs={block.say.promptEs}
        targetEn={fillText(block.say.targetEn, vars)}
        alias={alias}
        modelClip={resolveClip(block.say.modelClip, vars)}
        support="full"
        onHelpUsed={onHelpUsed}
        onDone={(status) => {
          onOral(status);
          onFinish();
        }}
      />
    </div>
  );
}
