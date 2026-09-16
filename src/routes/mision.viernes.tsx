import { createFileRoute } from "@tanstack/react-router";
import { MissionPage } from "@/components/game/MissionPage";
import { fridayMission } from "@/content/missions";

const description =
  "El show del muelle: presentate en inglés con tu nombre, tu país y tu edad, y ganá el pase de explorador.";

export const Route = createFileRoute("/mision/viernes")({
  head: () => ({
    meta: [
      { title: "Viernes: El gran escenario — Explorer Island" },
      { name: "description", content: description },
      { property: "og:title", content: "Viernes: El gran escenario — Explorer Island" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <MissionPage mission={fridayMission} previousId="thursday" previousDayEs="Jueves" />
  ),
});
