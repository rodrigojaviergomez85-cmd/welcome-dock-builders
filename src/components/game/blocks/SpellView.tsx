import { useMemo, useState } from "react";
import { ArrowRight, Delete } from "lucide-react";
import type { SpellBlock } from "@/content/missions/types";
import { letterClip } from "@/content/vocabulary";
import { playClip, playSequence } from "@/lib/audio";
import { playSuccess, playTryAgain } from "@/lib/feedback-sounds";
import { useProgress } from "@/lib/useProgress";
import { missionVars, fillText, resolveClip } from "@/lib/mission-vars";
import { RecordTurn } from "../RecordTurn";
import { cn } from "@/lib/utils";
import type { OralHandler } from "../MissionPlayer";

type Props = {
  missionId: string;
  block: SpellBlock;
  alias: string;
  onHelpUsed: () => void;
  onOral: OralHandler;
  onFinish: () => void;
};

function shuffle<T>(items: T[], seed: number): T[] {
  const out = [...items];
  let value = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    value = (value * 1103515245 + 12345) % 2147483648;
    const j = value % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Deletrear una palabra tocando sus letras en orden; cada letra suena en inglés. */
export function SpellView({ missionId, block, alias, onHelpUsed, onOral, onFinish }: Props) {
  const { state } = useProgress();
  const word = (block.word === "alias" ? alias : block.word)
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 12);
  const [typed, setTyped] = useState<string[]>([]);
  const [recording, setRecording] = useState(false);

  const keys = useMemo(() => shuffle(word.split(""), word.length + 7), [word]);
  const done = typed.join("") === word && word.length > 0;

  function tap(letter: string, keyIndex: number) {
    if (done) return;
    const expected = word[typed.length];
    const clip = letterClip(letter);
    if (clip) void playClip(clip);
    if (letter === expected) {
      const next = [...typed, letter];
      setTyped(next);
      if (next.join("") === word) {
        playSuccess();
        void playSequence(
          word
            .split("")
            .map((l) => letterClip(l) ?? "")
            .filter(Boolean),
        );
      }
    } else {
      playTryAgain();
    }
    void keyIndex;
  }

  if (word.length === 0) {
    return (
      <button
        type="button"
        onClick={onFinish}
        className="tap-target rounded-full bg-primary px-6 font-display text-lg text-primary-foreground"
      >
        Seguir
      </button>
    );
  }

  if (recording && block.record) {
    const vars = missionVars(state.profile, alias);
    return (
      <RecordTurn
        missionId={missionId}
        turnId={block.record.id}
        {...(block.record.mode ? { mode: block.record.mode } : {})}
        promptEs={block.record.promptEs}
        targetEn={fillText(block.record.targetEn, vars)}
        alias={alias}
        modelClip={resolveClip(block.record.modelClip, vars)}
        support="full"
        onHelpUsed={onHelpUsed}
        onDone={(status) => {
          onOral(status, fillText(block.record?.targetEn ?? "", vars), onFinish);
        }}
      />
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-4">
      <div className="rounded-3xl bg-card/95 px-5 py-4 text-center text-card-foreground shadow-[var(--shadow-soft)]">
        <p className="font-display text-xl">{block.promptEs}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {word.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl border-4 font-display text-2xl",
                typed[index]
                  ? "border-success bg-success/15 text-success"
                  : "border-dashed border-muted-foreground/40 text-muted-foreground/50",
              )}
            >
              {typed[index] ?? "?"}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {keys.map((letter, index) => (
          <button
            key={`${letter}-${index}`}
            type="button"
            onClick={() => tap(letter, index)}
            className="tap-target flex size-16 items-center justify-center rounded-2xl bg-card/95 font-display text-2xl text-card-foreground shadow-[var(--shadow-soft)] active:translate-y-1"
          >
            {letter}
          </button>
        ))}
        {typed.length > 0 && !done ? (
          <button
            type="button"
            onClick={() => setTyped(typed.slice(0, -1))}
            aria-label="Borrar la última letra"
            className="tap-target flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground"
          >
            <Delete className="size-6" aria-hidden />
          </button>
        ) : null}
      </div>

      {done ? (
        <button
          type="button"
          onClick={() => (block.record ? setRecording(true) : onFinish())}
          className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
        >
          ¡Listo! <ArrowRight className="size-5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
