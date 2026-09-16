/**
 * Semana 1 del Mes 1 (Nivel 0), copiada de la currícula original
 * (hoja "COMPLETE CURRICULUM", filas de MONTH 1 / Week 1).
 *
 * Esta tabla es la fuente pedagógica: las misiones del juego deben cubrirla.
 */

export type CurriculumDay = {
  day: number;
  dayEs: string;
  topic: string;
  vocabulary: string;
  grammar: string;
  practice: string;
  /** Meta acumulativa de fluidez automática. */
  fluency: string;
  missionId: string;
};

export const WEEK_1: CurriculumDay[] = [
  {
    day: 1,
    dayEs: "Lunes",
    topic: "Greetings",
    vocabulary: "Good morning, Good afternoon, Good evening, Good night",
    grammar: "What is your name? My name is ______.",
    practice: "Role play: How are you? I am fine, thank you.",
    fluency: "Tell me about yourself (saludo, nombre)",
    missionId: "monday",
  },
  {
    day: 2,
    dayEs: "Martes",
    topic: "Countries / Where are you from?",
    vocabulary: "Países más comunes",
    grammar: "Where are you from? I am from ______.",
    practice: "Escuchar de dónde es cada explorador",
    fluency: "Tell me about yourself (saludo, nombre, país)",
    missionId: "tuesday",
  },
  {
    day: 3,
    dayEs: "Miércoles",
    topic: "Numbers",
    vocabulary: "Numbers from 1 to 12",
    grammar: "How old are you? I am ______ years old.",
    practice: "Contar y reconocer números",
    fluency: "Tell me about yourself (saludo, nombre, país, edad)",
    missionId: "wednesday",
  },
  {
    day: 4,
    dayEs: "Jueves",
    topic: "Alphabet",
    vocabulary: "ABC",
    grammar: "Spelling bee",
    practice: "Reconocer letras y nombres deletreados",
    fluency: "Tell me about yourself (saludo, nombre, país, edad)",
    missionId: "thursday",
  },
  {
    day: 5,
    dayEs: "Viernes",
    topic: "Alphabet",
    vocabulary: "ABC",
    grammar: "Spell your name",
    practice: "Presentación completa",
    fluency: "Tell me about yourself (saludo, nombre, país, edad, deletreo)",
    missionId: "friday",
  },
];

export function curriculumFor(missionId: string): CurriculumDay | undefined {
  return WEEK_1.find((d) => d.missionId === missionId);
}
