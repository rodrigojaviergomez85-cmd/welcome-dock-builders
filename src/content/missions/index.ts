import type { Mission } from "./types";
import { mondayMission } from "./monday";
import { tuesdayMission } from "./tuesday";
import { wednesdayMission } from "./wednesday";
import { thursdayMission } from "./thursday";
import { fridayMission } from "./friday";

/** Semana 1 completa: un día, un formato de juego distinto. */
export const missions: Mission[] = [
  mondayMission,
  tuesdayMission,
  wednesdayMission,
  thursdayMission,
  fridayMission,
];

/** Ruta del mapa para cada misión. */
export const MISSION_PATHS: Record<string, string> = {
  monday: "/mision/lunes",
  tuesday: "/mision/martes",
  wednesday: "/mision/miercoles",
  thursday: "/mision/jueves",
  friday: "/mision/viernes",
};

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export { mondayMission, tuesdayMission, wednesdayMission, thursdayMission, fridayMission };
export type { Mission };
