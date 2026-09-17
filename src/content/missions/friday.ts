import type { Mission } from "./types";

/**
 * Viernes — Day 5 de la currícula: deletrear tu nombre y la presentación completa
 * "Tell me about yourself" (saludo, nombre, país, edad, deletreo).
 */
export const fridayMission: Mission = {
  id: "friday",
  order: 5,
  dayEs: "Viernes",
  title: "El gran escenario",
  status: "available",
  objective: "Tell me about yourself: saludo, nombre, deletreo, país y edad.",
  storyProblem:
    "Toda la isla se junta en el escenario del muelle. Es tu turno de presentarte en inglés y ganar el pase de explorador.",
  prerequisites: ["thursday"],
  models: ["Hello! My name is {alias}.", "I am from {country}.", "I am {age} years old."],
  reward: { id: "friday-pass", label: "Pase de explorador de la semana" },
  evidence: "Se presenta solo con nombre, deletreo, país y edad.",
  counter: { icon: "star", label: "Partes del show" },
  reviewPhrases: [
    "Hello! My name is {alias}.",
    "I am from {country}.",
    "I am {age} years old.",
    "Nice to meet you!",
  ],
  blocks: [
    {
      kind: "tapPick",
      id: "fri-warmup",
      estimatedMinutes: 4,
      helpEs: "Repaso rápido de letras antes del show.",
      style: "letter",
      time: "afternoon",
      promptEs: "¿Qué letra escuchaste?",
      rounds: [
        { id: "w1", clip: "w-l-e", en: "E", answer: "l-e", options: ["l-e", "l-i", "l-a", "l-u"] },
        { id: "w2", clip: "w-l-s", en: "S", answer: "l-s", options: ["l-f", "l-s", "l-x", "l-c"] },
        { id: "w3", clip: "w-l-o", en: "O", answer: "l-o", options: ["l-o", "l-u", "l-w", "l-q"] },
      ],
    },
    {
      kind: "spell",
      id: "fri-spell",
      estimatedMinutes: 5,
      helpEs: "Deletreá tu nombre antes de salir al escenario.",
      time: "afternoon",
      promptEs: "Deletreá tu nombre para el público.",
      word: "alias",
    },
    {
      kind: "showcase",
      id: "fri-show",
      estimatedMinutes: 8,
      helpEs: "Decí cada parte de tu presentación.",
      time: "evening",
      audience: ["luna", "leo", "boti", "mia"],
      intro: {
        speaker: "luna",
        clip: "p-tell-me",
        en: "Tell me about yourself!",
        es: "¡Contame de vos!",
      },
      steps: [
        {
          id: "f1",
          promptEs: "Saludá y decí tu nombre.",
          targetEn: "Hello! My name is {alias}.",
          modelClip: "model-hello-my-name-is",
        },
        {
          id: "f2",
          promptEs: "Decí de dónde sos.",
          targetEn: "I am from {country}.",
          modelClip: ["p-i-am-from", "{countryClip}"],
        },
        {
          id: "f3",
          promptEs: "Decí cuántos años tenés.",
          targetEn: "I am {age} years old.",
          modelClip: ["p-i-am", "{ageClip}", "p-years-old"],
        },
        {
          id: "f4",
          promptEs: "Despedite con mucho gusto.",
          targetEn: "Nice to meet you!",
          modelClip: "p-nice",
        },
      ],
      cheer: { speaker: "luna", clip: "luna-nice", en: "Nice to meet you!", es: "¡Mucho gusto!" },
    },
  ],
};
