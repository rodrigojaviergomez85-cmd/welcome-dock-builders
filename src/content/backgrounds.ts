import morning from "@/assets/dock-morning.jpg";
import afternoon from "@/assets/dock-afternoon.jpg";
import evening from "@/assets/dock-evening.jpg";
import islandMap from "@/assets/island-map.jpg";
import type { TimeOfDay } from "./missions/types";

export const BACKGROUNDS: Record<TimeOfDay, string> = {
  morning,
  afternoon,
  evening,
};

export const TIME_LABEL_ES: Record<TimeOfDay, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  evening: "Anochecer",
};

export { islandMap };
