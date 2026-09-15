import type { Mission } from "./types";
import { mondayMission } from "./monday";

/**
 * Martes a viernes están declarados como próximas entregas.
 * No tienen escenas todavía y la interfaz los muestra bloqueados: no se simula que funcionen.
 */
export type UpcomingMission = {
  id: string;
  order: number;
  dayEs: string;
  title: string;
  objective: string;
  status: "locked";
};

export const upcomingMissions: UpcomingMission[] = [
  {
    id: "tuesday",
    order: 2,
    dayEs: "Martes",
    title: "La oficina de pasaportes",
    objective: "Where are you from? / I am from…",
    status: "locked",
  },
  {
    id: "wednesday",
    order: 3,
    dayEs: "Miércoles",
    title: "Las credenciales mezcladas",
    objective: "Números 1–12 y How old are you?",
    status: "locked",
  },
  {
    id: "thursday",
    order: 4,
    dayEs: "Jueves",
    title: "El taller de letras",
    objective: "Alfabeto y deletreo del nombre",
    status: "locked",
  },
  {
    id: "friday",
    order: 5,
    dayEs: "Viernes",
    title: "El pase de explorador",
    objective: "Integrar nombre, país, edad y deletreo",
    status: "locked",
  },
];

export const missions: Mission[] = [mondayMission];

export function getMission(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export { mondayMission };
export type { Mission };
