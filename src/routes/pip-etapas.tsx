import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pip, PIP_COLORS } from "@/components/game/Pip";
import { PipFeedMoment } from "@/components/game/PipFeedMoment";
import { emptyState, type PipProgress } from "@/lib/progress";

export const Route = createFileRoute("/pip-etapas")({
  head: () => ({
    meta: [
      { title: "Etapas de Pip · Kids Platform" },
      { name: "description", content: "Las cinco etapas de Pip en los cinco colores." },
      { property: "og:title", content: "Etapas de Pip · Kids Platform" },
      { property: "og:description", content: "Las cinco etapas de Pip en los cinco colores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PipStagesPage,
});

function PipStagesPage() {
  const [moment, setMoment] = useState(false);
  const base: PipProgress = { ...emptyState().pip, stage: 1, feeds: 3 };
  return (
    <main className="min-h-screen bg-background p-6">
      <h1 className="font-display text-3xl">Etapas de Pip</h1>
      <div className="mt-4 grid grid-cols-5 items-end gap-4">
        {PIP_COLORS.map((color) =>
          [0, 1, 2, 3, 4].map((stage) => (
            <div key={`${color}-${stage}`} className="flex h-32 items-end justify-center">
              <Pip mood="normal" color={color} stage={stage} feeds={6} size={24 + stage * 24} />
            </div>
          )),
        )}
      </div>
      <button
        type="button"
        onClick={() => setMoment(true)}
        className="tap-target mt-6 rounded-full bg-primary px-8 font-display text-xl text-primary-foreground"
      >
        Simular momento Pip
      </button>
      {moment ? (
        <PipFeedMoment
          phrase="Good morning!"
          before={base}
          after={{ ...base, feeds: 4 }}
          feedsToEvolve={8}
          evolved={false}
          day="monday"
          rewardLabel=""
          voice={{ clip: "model-good-morning" }}
          onClose={() => setMoment(false)}
        />
      ) : null}
    </main>
  );
}
