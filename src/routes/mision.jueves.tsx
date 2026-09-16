import { createFileRoute } from "@tanstack/react-router";
import { MissionPage } from "@/components/game/MissionPage";
import { thursdayMission } from "@/content/missions";

const description =
  "Recuperá las letras del faro escuchando el alfabeto en inglés y armá tu nombre letra por letra.";

export const Route = createFileRoute("/mision/jueves")({
  head: () => ({
    meta: [
      { title: "Jueves: La torre de letras — Explorer Island" },
      { name: "description", content: description },
      { property: "og:title", content: "Jueves: La torre de letras — Explorer Island" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <MissionPage mission={thursdayMission} previousId="wednesday" previousDayEs="Miércoles" />
  ),
});
