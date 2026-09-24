import type { Mission } from "./types";

/**
 * Jueves — Day 4 de la currícula: alfabeto y spelling bee.
 * Formato del día: la torre de letras.
 */
export const thursdayMission: Mission = {
  id: "thursday",
  order: 4,
  dayEs: "Jueves",
  title: "La torre de letras",
  status: "available",
  objective: "Alfabeto en inglés y deletreo (spelling bee).",
  storyProblem:
    "La torre del faro perdió sus letras y los nombres del muelle quedaron incompletos. Hay que escuchar letra por letra.",
  prerequisites: ["wednesday"],
  models: ["ABC", "My name is {alias}."],
  reward: { id: "thursday-letters", label: "Letras de tu nombre" },
  evidence: "Reconoce letras dichas en inglés y entiende un nombre deletreado.",
  counter: { icon: "star", label: "Letras recuperadas" },
  pip: { feedsToEvolve: 8, rewardLabel: "Pip aprende las letras" },
  reviewPhrases: ["Hello! My name is {alias}.", "I am from {country}.", "I am {age} years old."],
  blocks: [
    {
      kind: "tapPick",
      id: "thu-letters",
      estimatedMinutes: 6,
      helpEs: "Escuchá la letra en inglés y tocala.",
      style: "letter",
      time: "morning",
      promptEs: "¿Qué letra escuchaste?",
      rounds: [
        { id: "l1", clip: "w-l-a", en: "A", answer: "l-a", options: ["l-a", "l-e", "l-i", "l-o"] },
        { id: "l2", clip: "w-l-g", en: "G", answer: "l-g", options: ["l-j", "l-g", "l-b", "l-p"] },
        { id: "l3", clip: "w-l-m", en: "M", answer: "l-m", options: ["l-n", "l-s", "l-m", "l-f"] },
        { id: "l4", clip: "w-l-r", en: "R", answer: "l-r", options: ["l-r", "l-l", "l-w", "l-c"] },
        { id: "l5", clip: "w-l-u", en: "U", answer: "l-u", options: ["l-y", "l-u", "l-q", "l-d"] },
        { id: "l6", clip: "w-l-z", en: "Z", answer: "l-z", options: ["l-h", "l-k", "l-t", "l-z"] },
      ],
    },
    {
      kind: "tapPick",
      id: "thu-bee",
      estimatedMinutes: 5,
      helpEs: "Escuchá el nombre deletreado y tocá de quién es.",
      style: "word",
      time: "afternoon",
      promptEs: "¿Qué nombre deletrearon?",
      rounds: [
        {
          id: "b1",
          clip: "spell-luna",
          en: "L-U-N-A",
          answer: "Luna",
          options: ["Luna", "Leo", "Mia"],
        },
        {
          id: "b2",
          clip: "spell-leo",
          en: "L-E-O",
          answer: "Leo",
          options: ["Boti", "Leo", "Luna"],
        },
        {
          id: "b3",
          clip: "spell-boti",
          en: "B-O-T-I",
          answer: "Boti",
          options: ["Mia", "Luna", "Boti"],
        },
      ],
    },
    {
      kind: "spell",
      id: "thu-spell-mine",
      estimatedMinutes: 6,
      helpEs: "Tocá las letras de tu nombre, una por una.",
      time: "afternoon",
      promptEs: "Armá tu nombre letra por letra.",
      word: "alias",
      record: {
        id: "thu-say-name",
        promptEs: "Decí tu nombre en inglés.",
        targetEn: "My name is {alias}.",
        modelClip: "model-my-name-is",
      },
    },
  ],
};
