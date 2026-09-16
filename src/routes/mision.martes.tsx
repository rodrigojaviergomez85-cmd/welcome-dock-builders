import { createFileRoute } from "@tanstack/react-router";
import { MissionPage } from "@/components/game/MissionPage";
import { tuesdayMission } from "@/content/missions";

const description =
  "Escuchá de dónde viene cada explorador, colocá su bandera y decí de qué país sos en inglés.";

export const Route = createFileRoute("/mision/martes")({
  head: () => ({
    meta: [
      { title: "Martes: El barco de banderas — Explorer Island" },
      { name: "description", content: description },
      { property: "og:title", content: "Martes: El barco de banderas — Explorer Island" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <MissionPage mission={tuesdayMission} previousId="monday" previousDayEs="Lunes" />
  ),
});
