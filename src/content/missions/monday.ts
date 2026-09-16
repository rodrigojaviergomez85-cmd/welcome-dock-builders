import type { Mission } from "./types";

/**
 * Lunes — El muelle de bienvenida.
 * Contenido separado del motor: este archivo solo describe la misión.
 */
export const mondayMission: Mission = {
  id: "monday",
  order: 1,
  dayEs: "Lunes",
  title: "El muelle de bienvenida",
  status: "available",
  objective: "Comprender y usar un saludo y su propio nombre. What is your name? / My name is…",
  storyProblem:
    "Cuatro mochilas perdieron sus etiquetas. Hay que reconocer las voces, devolver tres mochilas y decir el nombre para rescatar la última.",
  prerequisites: [],
  models: [
    "Good morning!",
    "Good afternoon!",
    "Good evening!",
    "Hello! My name is Leo.",
    "What is your name?",
    "My name is Alex.",
    "How are you?",
    "I am fine.",
  ],
  reward: { id: "tag", label: "Etiqueta de la mochila" },
  evidence:
    "Elige por comprensión al personaje que se presentó y graba un saludo breve con su nombre.",
  blocks: [
    {
      kind: "story",
      id: "story",
      estimatedMinutes: 2,
      time: "morning",
      helpEs: "Tocá el altavoz para escuchar otra vez.",
      lines: [
        {
          speaker: "luna",
          clip: "luna-welcome",
          en: "Hello! My name is Luna. Welcome to Explorer Island!",
          es: "Hola, me llamo Luna. ¡Bienvenido a la Isla de los Exploradores!",
        },
        {
          speaker: "luna",
          clip: "luna-what-name",
          en: "What is your name?",
          es: "¿Cómo te llamás?",
        },
      ],
      choice: {
        promptEs: "Luna dijo Hello. ¿Cómo le respondés?",
        modelClip: "model-hello",
        options: [
          { en: "Hello!", correct: true },
          { en: "Good night!", correct: false },
          { en: "I am fine.", correct: false },
        ],
      },
    },
    {
      kind: "listenPick",
      id: "listen",
      estimatedMinutes: 4,
      helpEs: "Escuchá con atención y tocá al personaje que se presentó.",
      rounds: [
        {
          id: "r1",
          time: "morning",
          clip: "luna-intro-morning",
          en: "Good morning! My name is Luna.",
          answer: "luna",
          options: ["luna", "leo", "boti"],
        },
        {
          id: "r2",
          time: "afternoon",
          clip: "leo-intro-afternoon",
          en: "Good afternoon! My name is Leo.",
          answer: "leo",
          options: ["boti", "leo", "luna"],
        },
        {
          id: "r3",
          time: "evening",
          clip: "boti-intro-evening",
          en: "Good evening! My name is Boti.",
          answer: "boti",
          options: ["leo", "boti", "luna"],
        },
      ],
    },
    {
      kind: "bagMatch",
      id: "bags",
      estimatedMinutes: 6,
      helpEs:
        "Escuchá al dueño y llevá la mochila hasta él. Podés arrastrarla o tocar la mochila y después al personaje.",
      items: [
        {
          id: "b1",
          bag: "red",
          owner: "leo",
          clip: "leo-how-are-you",
          en: "How are you?",
          order: "askFirst",
          options: ["luna", "leo", "boti"],
          thanks: { speaker: "leo", clip: "leo-nice", en: "Nice to meet you!" },
        },
        {
          id: "b2",
          bag: "blue",
          owner: "boti",
          clip: "boti-i-am-fine",
          en: "I am fine.",
          order: "greetThenName",
          options: ["boti", "luna", "leo"],
          thanks: { speaker: "boti", clip: "boti-how-are-you", en: "How are you?" },
        },
        {
          id: "b3",
          bag: "green",
          owner: "luna",
          clip: "luna-nice",
          en: "Nice to meet you!",
          order: "nameFirst",
          options: ["leo", "luna", "boti"],
          thanks: { speaker: "luna", clip: "luna-how-are-you", en: "How are you?" },
        },
      ],
    },
    {
      kind: "dialogue",
      id: "talk",
      estimatedMinutes: 5,
      helpEs:
        "Luna quiere saber cómo estás. Escuchá, practicá y respondé en inglés.",
      conversations: [
        {
          id: "c1",
          with: "luna",
          time: "afternoon",
          support: "full",
          turns: [
            { type: "character", speaker: "luna", clip: "luna-how-are-you", en: "How are you?" },
            {
              type: "record",
              id: "t1",
              promptEs: "Respondé que estás bien.",
              targetEn: "I am fine.",
              modelClip: "model-i-am-fine",
            },
            { type: "character", speaker: "luna", clip: "luna-nice", en: "Nice to meet you!" },
          ],
        },
      ],
    },
    {
      kind: "finale",
      id: "finale",
      estimatedMinutes: 3,
      helpEs: "La última mochila es tuya. Decí tu nombre para completar su etiqueta.",
      with: "mia",
      time: "evening",
      turns: [
        { type: "character", speaker: "mia", clip: "mia-hello-what-name", en: "Hello! What is your name?" },
        {
          type: "record",
          id: "t3",
          promptEs: "Respondé con tu nombre.",
          targetEn: "Hello! My name is {alias}.",
          modelClip: "model-hello-my-name-is",
        },
        { type: "character", speaker: "mia", clip: "mia-nice", en: "Nice to meet you!" },
      ],
      goodNight: {
        speaker: "mia",
        clip: "mia-good-night",
        en: "Good night!",
        es: "Good night se dice al irse a dormir, no al llegar.",
      },
    },
  ],
};
