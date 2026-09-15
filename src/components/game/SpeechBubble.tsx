import { cn } from "@/lib/utils";

type Props = {
  en: string;
  es?: string;
  hidden?: boolean;
  className?: string;
};

/** Burbuja de diálogo: inglés grande, ayuda en español pequeña. */
export function SpeechBubble({ en, es, hidden = false, className }: Props) {
  return (
    <div
      className={cn(
        "animate-pop relative max-w-xl rounded-3xl bg-card px-5 py-4 text-card-foreground shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {hidden ? (
        <p className="font-display text-xl text-muted-foreground sm:text-2xl">• • •</p>
      ) : (
        <p lang="en" className="font-display text-2xl leading-snug sm:text-3xl">
          {en}
        </p>
      )}
      {es ? <p className="mt-2 text-sm text-muted-foreground">{es}</p> : null}
    </div>
  );
}
