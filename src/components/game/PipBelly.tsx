import type { PipLearned } from "@/lib/progress";

/** Barriga de palabras: frases que Pip ya comió. */
export function PipBelly({ learned }: { learned: PipLearned[] }) {
  if (!learned.length) {
    return <p className="mt-3 text-muted-foreground">Hablá para darle su primera frase.</p>;
  }
  return (
    <ul className="mt-3 max-h-[45vh] space-y-2 overflow-y-auto">
      {[...learned].reverse().map((item) => (
        <li
          key={item.phrase}
          lang="en"
          className="flex min-h-12 items-center rounded-xl bg-muted px-3 font-display text-lg"
        >
          {item.phrase}
        </li>
      ))}
    </ul>
  );
}
