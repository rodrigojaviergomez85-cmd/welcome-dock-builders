import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pip } from "@/components/game/Pip";
import { PipFeedMoment } from "@/components/game/PipFeedMoment";
import { PipRuler } from "@/components/game/PipRuler";
import { pipSizeFor, type PipProgress } from "@/lib/progress";

const description = "Pantalla temporal para comprobar las cinco etapas y la vara de Pip.";

export const Route = createFileRoute("/pip-etapas")({
  head: () => ({
    meta: [
      { title: "Prueba de etapas de Pip — Explorer Island" },
      { name: "description", content: description },
      { property: "og:title", content: "Prueba de etapas de Pip — Explorer Island" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PipStagesPreview,
});

const base: PipProgress = {
  color: "#5AA9FF",
  feeds: 3,
  totalFeeds: 11,
  stage: 1,
  accessories: ["sun-tag"],
  marks: [{ day: "monday", feeds: 8 }],
};

function PipStagesPreview() {
  const [moment, setMoment] = useState<"grow" | "evolve" | null>(null);
  const before = moment === "evolve" ? { ...base, feeds: 7, stage: 1 } : { ...base, feeds: 2 };
  const after = moment === "evolve" ? { ...base, feeds: 8, stage: 2 } : base;

  return (
    <main className="min-h-screen bg-background p-6 text-center text-foreground">
      <h1 className="font-display text-4xl">Las cinco etapas de Pip</h1>
      <div className="mt-8 flex items-end justify-center gap-5 overflow-x-auto pb-6">
        {[0, 1, 2, 3, 4].map((stage) => {
          const labels = ["Huevo", "Bebé", "Niño", "Grande", "Gigante"];
          return (
            <div key={stage} className="flex shrink-0 flex-col items-center">
              <Pip mood="happy" color={base.color} stage={stage} feeds={stage === 0 ? 7 : 0} size={Math.min(250, pipSizeFor({ stage }))} />
              <p className="font-display text-xl">{labels[stage]}</p>
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-8 rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)]">
        <PipRuler marks={[{ day: "monday", feeds: 8 }, { day: "tuesday", feeds: 3 }]} currentDay="tuesday" feeds={3} height={300} />
        <div className="flex flex-col gap-3">
          <button type="button" onClick={() => setMoment("grow")} className="tap-target rounded-full bg-primary px-6 font-display text-primary-foreground">Ver rayita</button>
          <button type="button" onClick={() => setMoment("evolve")} className="tap-target rounded-full bg-accent px-6 font-display text-accent-foreground">Ver evolución</button>
        </div>
      </div>
      {moment ? (
        <PipFeedMoment phrase="Hello!" before={before} after={after} feedsToEvolve={8} evolved={moment === "evolve"} day="tuesday" rewardLabel="Pip aprende a preguntar" onClose={() => setMoment(null)} />
      ) : null}
    </main>
  );
}