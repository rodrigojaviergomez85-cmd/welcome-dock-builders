import { useState } from "react";
import { ArrowRight, Hand } from "lucide-react";
import { AudioButton } from "../AudioButton";
import { SpeechBubble } from "../SpeechBubble";
import { CHARACTERS, BAGS } from "@/content/characters";
import type { BagMatchBlock } from "@/content/missions/types";
import { cn } from "@/lib/utils";

type Props = {
  block: BagMatchBlock;
  alias: string;
  avatarImage: string;
  onComprehension: (correct: boolean) => void;
  onItemChange: (index: number) => void;
  startIndex?: number;
  onFinish: () => void;
};

type Target = { key: string; name: string; image: string; alt: string; isAnswer: boolean };

export function BagMatchView({
  block,
  alias,
  avatarImage,
  onComprehension,
  onItemChange,
  startIndex = 0,
  onFinish,
}: Props) {
  const [index, setIndex] = useState(Math.min(startIndex, block.items.length - 1));
  const [phase, setPhase] = useState<"deliver" | "reply" | "done">("deliver");
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [bagPicked, setBagPicked] = useState(false);

  const item = block.items[index]!;
  const bag = BAGS[item.bag];

  const targets: Target[] =
    item.owner === "avatar"
      ? [
          {
            key: CHARACTERS[item.options[0]!].id,
            name: CHARACTERS[item.options[0]!].name,
            image: CHARACTERS[item.options[0]!].image,
            alt: CHARACTERS[item.options[0]!].alt,
            isAnswer: false,
          },
          { key: "avatar", name: alias, image: avatarImage, alt: `Tu avatar, ${alias}`, isAnswer: true },
          {
            key: CHARACTERS[item.options[1]!].id,
            name: CHARACTERS[item.options[1]!].name,
            image: CHARACTERS[item.options[1]!].image,
            alt: CHARACTERS[item.options[1]!].alt,
            isAnswer: false,
          },
        ]
      : item.options.map((id) => ({
          key: id,
          name: CHARACTERS[id].name,
          image: CHARACTERS[id].image,
          alt: CHARACTERS[id].alt,
          isAnswer: id === item.owner,
        }));

  function deliver(target: Target) {
    if (phase !== "deliver") return;
    onComprehension(target.isAnswer);
    if (!target.isAnswer) {
      setWrongKey(target.key);
      window.setTimeout(() => setWrongKey(null), 700);
      return;
    }
    setBagPicked(false);
    setPhase(item.reply ? "reply" : "done");
  }

  function next() {
    if (index + 1 >= block.items.length) {
      onFinish();
      return;
    }
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setPhase("deliver");
    setBagPicked(false);
    onItemChange(nextIndex);
  }

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-card/95 px-5 py-4 shadow-[var(--shadow-soft)]">
        <span className="rounded-full bg-secondary px-4 py-1 text-sm text-secondary-foreground">
          Mochila {index + 1} de {block.items.length}
        </span>
        <AudioButton clipId={item.clip} autoPlayKey={item.id} label="Escuchar al dueño" />
        {phase !== "deliver" ? (
          <p lang="en" className="animate-pop font-display text-xl">
            {item.en}
          </p>
        ) : null}
      </div>

      {phase === "deliver" ? (
        <>
          <button
            type="button"
            draggable
            onDragStart={(e) => {
              setBagPicked(true);
              e.dataTransfer.setData("text/plain", item.bag);
            }}
            onClick={() => setBagPicked((v) => !v)}
            aria-pressed={bagPicked}
            aria-label={`Mochila ${item.bag}. Tocá la mochila y después al dueño, o arrastrala.`}
            className={cn(
              "tap-target rounded-3xl p-2 transition-transform",
              bagPicked ? "animate-bob bg-sun/40 ring-4 ring-accent" : "bg-card/70",
            )}
          >
            <img src={bag.image} alt={bag.alt} loading="lazy" className="h-28 w-auto sm:h-36" />
          </button>
          <p className="flex items-center gap-2 rounded-2xl bg-card/90 px-4 py-2 text-sm text-muted-foreground">
            <Hand className="size-4" aria-hidden />
            {bagPicked ? "Ahora tocá a su dueño." : "Tocá la mochila o arrastrala hasta su dueño."}
          </p>
        </>
      ) : null}

      <div className="flex w-full flex-wrap items-end justify-center gap-2 sm:gap-6">
        {targets.map((target) => (
          <button
            key={target.key}
            type="button"
            onClick={() => deliver(target)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              deliver(target);
            }}
            disabled={phase !== "deliver"}
            aria-label={`Entregar la mochila a ${target.name}`}
            className={cn(
              "tap-target flex flex-col items-center gap-2 rounded-3xl p-2 transition-transform active:scale-95",
              wrongKey === target.key && "animate-nudge bg-destructive/10 ring-4 ring-destructive",
              phase !== "deliver" && !target.isAnswer && "opacity-40 saturate-50",
              phase !== "deliver" && target.isAnswer && "bg-success/20 ring-4 ring-success",
            )}
          >
            <img
              src={target.image}
              alt={target.alt}
              loading="lazy"
              className="h-32 w-auto object-contain sm:h-48"
            />
            <span className="rounded-full bg-card px-4 py-1 font-display text-lg text-card-foreground shadow-[var(--shadow-soft)]">
              {target.name}
            </span>
          </button>
        ))}
      </div>

      {phase === "reply" && item.reply ? (
        <div className="w-full max-w-xl rounded-3xl bg-card/95 p-5 shadow-[var(--shadow-soft)]">
          <p className="text-sm text-muted-foreground">Saludá y presentate.</p>
          <p lang="en" className="mt-2 font-display text-2xl">
            {item.reply.en.replace("{alias}", alias)}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <AudioButton clipId={item.reply.modelClip} label="Escuchar el modelo" size="sm" />
            <button
              type="button"
              onClick={() => setPhase("done")}
              className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
            >
              Ya lo dije <ArrowRight className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="flex flex-col items-center gap-3">
          {item.thanks ? (
            <>
              <SpeechBubble en={item.thanks.en} />
              <AudioButton clipId={item.thanks.clip} autoPlayKey={`${item.id}-thanks`} label="Escuchar" size="sm" />
            </>
          ) : null}
          <button
            type="button"
            onClick={next}
            className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
          >
            Seguir <ArrowRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
