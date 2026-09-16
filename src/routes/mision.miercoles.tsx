import { createFileRoute } from "@tanstack/react-router";
import { MissionPage } from "@/components/game/MissionPage";
import { wednesdayMission } from "@/content/missions";

const description =
  "Ordená el mercado del muelle escuchando los números del 1 al 12 en inglés y decí cuántos años tenés.";

export const Route = createFileRoute("/mision/miercoles")({
  head: () => ({
    meta: [
      { title: "Miércoles: El mercado de números — Explorer Island" },
      { name: "description", content: description },
      { property: "og:title", content: "Miércoles: El mercado de números — Explorer Island" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <MissionPage mission={wednesdayMission} previousId="tuesday" previousDayEs="Martes" />
  ),
});
