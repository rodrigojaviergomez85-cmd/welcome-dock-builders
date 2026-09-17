import { ArrowRight } from "lucide-react";
import type { NameTagBlock } from "@/content/missions/types";

type Props = {
  block: NameTagBlock;
  alias: string;
  onFinish: () => void;
};

/** Vista provisional: se reemplaza en una entrega siguiente. */
export function NameTagView({ block, alias, onFinish }: Props) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 rounded-3xl bg-card/95 px-5 py-6 text-center text-card-foreground shadow-[var(--shadow-soft)]">
      <p className="font-display text-2xl">La etiqueta con tu nombre</p>
      <p lang="en" className="font-display text-xl">
        {block.record.targetEn.split("{alias}").join(alias)}
      </p>
      <p className="text-muted-foreground">{block.record.promptEs}</p>
      <button
        type="button"
        onClick={onFinish}
        className="tap-target inline-flex items-center gap-2 rounded-full bg-primary px-6 font-display text-lg text-primary-foreground shadow-[var(--shadow-pop)] active:translate-y-1 active:shadow-none"
      >
        Continuar <ArrowRight className="size-5" aria-hidden />
      </button>
    </div>
  );
}
