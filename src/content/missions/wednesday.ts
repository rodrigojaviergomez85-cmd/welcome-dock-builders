import type { Mission } from "./types";

/**
 * Miércoles — Day 3 de la currícula: Numbers 1–12 y How old are you?
 * Formato del día: el mercado de números.
 */
export const wednesdayMission: Mission = {
  id: "wednesday",
  order: 3,
  dayEs: "Miércoles",
  title: "El mercado de números",
  status: "available",
  objective: "Números 1–12 y How old are you? / I am ___ years old.",
  storyProblem:
    "En el mercado del muelle se cayeron los precios y las cajas. Hay que escuchar los números en inglés para ordenarlo todo.",
  prerequisites: ["tuesday"],
  models: ["How old are you?", "I am {age} years old."],
  reward: { id: "wednesday-number", label: "Tu edad en el pase" },
  evidence: "Reconoce los números 1 a 12 en inglés y dice su edad.",
  counter: { icon: "star", label: "Cajas ordenadas" },
  reviewPhrases: [
    "Hello! My name is {alias}.",
    "I am from {country}.",
    "How old are you?",
    "I am {age} years old.",
  ],
  blocks: [
    {
      kind: "tapPick",
      id: "wed-numbers",
      estimatedMinutes: 6,
      helpEs: "Escuchá el número en inglés y tocalo.",
      style: "number",
      time: "morning",
      promptEs: "¿Qué número escuchaste?",
      rounds: [
        {
          id: "n1",
          clip: "w-n-3",
          en: "Three",
          es: "tres",
          answer: "n-3",
          options: ["n-2", "n-3", "n-7", "n-10"],
        },
        {
          id: "n2",
          clip: "w-n-8",
          en: "Eight",
          es: "ocho",
          answer: "n-8",
          options: ["n-8", "n-1", "n-11", "n-5"],
        },
        {
          id: "n3",
          clip: "w-n-12",
          en: "Twelve",
          es: "doce",
          answer: "n-12",
          options: ["n-2", "n-12", "n-9", "n-4"],
        },
        {
          id: "n4",
          clip: "w-n-6",
          en: "Six",
          es: "seis",
          answer: "n-6",
          options: ["n-7", "n-6", "n-3", "n-11"],
        },
        {
          id: "n5",
          clip: "w-n-10",
          en: "Ten",
          es: "diez",
          answer: "n-10",
          options: ["n-10", "n-9", "n-1", "n-12"],
        },
      ],
    },
    {
      kind: "pickProfile",
      id: "wed-age",
      estimatedMinutes: 5,
      helpEs: "Elegí tu edad y decila en inglés.",
      time: "afternoon",
      field: "age",
      promptEs: "¿Cuántos años tenés?",
      options: ["n-7", "n-8", "n-9", "n-10", "n-11", "n-12"],
      say: {
        targetEn: "I am {age} years old.",
        promptEs: "Decí cuántos años tenés.",
        modelClip: ["p-i-am", "{ageClip}", "p-years-old"],
      },
    },
    {
      kind: "showcase",
      id: "wed-show",
      estimatedMinutes: 5,
      helpEs: "Presentate: nombre, país y edad.",
      time: "afternoon",
      audience: ["boti", "mia"],
      intro: {
        speaker: "boti",
        clip: "p-how-old",
        en: "How old are you?",
        es: "¿Cuántos años tenés?",
      },
      steps: [
        {
          id: "s1",
          promptEs: "Saludá y decí tu nombre.",
          targetEn: "Hello! My name is {alias}.",
          modelClip: "model-hello-my-name-is",
        },
        {
          id: "s2",
          promptEs: "Decí de dónde sos.",
          targetEn: "I am from {country}.",
          modelClip: ["p-i-am-from", "{countryClip}"],
        },
        {
          id: "s3",
          promptEs: "Decí cuántos años tenés.",
          targetEn: "I am {age} years old.",
          modelClip: ["p-i-am", "{ageClip}", "p-years-old"],
        },
      ],
      cheer: { speaker: "mia", clip: "mia-nice", en: "Nice to meet you!", es: "¡Mucho gusto!" },
    },
  ],
};
