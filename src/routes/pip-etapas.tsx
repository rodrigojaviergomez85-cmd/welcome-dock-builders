import { createFileRoute } from "@tanstack/react-router";
import { PipFeedMoment } from "@/components/game/PipFeedMoment";
import type { PipProgress } from "@/lib/progress";

export const Route = createFileRoute("/pip-etapas")({
  head: () => ({
    meta: [
      { title: "Prueba temporal de Pip" },
      { name: "description", content: "Prueba temporal de evolución de Pip." },
      { property: "og:title", content: "Prueba temporal de Pip" },
      { property: "og:description", content: "Prueba temporal de evolución de Pip." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Preview,
});

const before: PipProgress = {
  color: "#5AA9FF",
  feeds: 7,
  totalFeeds: 15,
  stage: 1,
  accessories: ["sun-tag"],
  marks: [{ day: "monday", feeds: 8 }],
};
const after: PipProgress = {
  ...before,
  feeds: 8,
  totalFeeds: 16,
  stage: 2,
  marks: [
    { day: "monday", feeds: 8 },
    { day: "tuesday", feeds: 8 },
  ],
};

function Preview() {
  return (
    <PipFeedMoment
      phrase="Hello!"
      before={before}
      after={after}
      feedsToEvolve={8}
      evolved
      day="tuesday"
      rewardLabel="Pip aprende a preguntar"
      onClose={() => undefined}
    />
  );
}
