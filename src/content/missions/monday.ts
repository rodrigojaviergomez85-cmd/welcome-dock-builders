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
    "Llegaron varios exploradores y las etiquetas de sus mochilas se mezclaron. Hay que identificar a los personajes y conseguir la etiqueta propia.",
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
        promptEs: "Tocá tu respuesta. Podés escuchar el modelo antes.",
        modelClip: "model-my-name-is",
        options: [
          { en: "My name is {alias}.", correct: true },
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
        {
          id: "r4",
          time: "afternoon",
          clip: "luna-intro-afternoon",
          en: "Good afternoon! My name is Luna.",
          answer: "luna",
          options: ["boti", "luna", "leo"],
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
          clip: "leo-ask-first",
          en: "Hello! What is your name? My name is Leo.",
          order: "askFirst",
          options: ["luna", "leo", "boti"],
          reply: { en: "Hello! My name is {alias}.", modelClip: "model-hello-my-name-is" },
          thanks: { speaker: "leo", clip: "leo-nice", en: "Nice to meet you!" },
        },
        {
          id: "b2",
          bag: "blue",
          owner: "boti",
          clip: "boti-greet-then-name",
          en: "Good afternoon! I am Boti. My name is Boti.",
          order: "greetThenName",
          options: ["boti", "luna", "leo"],
          reply: { en: "Good afternoon! My name is {alias}.", modelClip: "model-good-afternoon" },
          thanks: { speaker: "boti", clip: "boti-i-am-fine", en: "I am fine." },
        },
        {
          id: "b3",
          bag: "green",
          owner: "luna",
          clip: "luna-intro-afternoon",
          en: "Good afternoon! My name is Luna.",
          order: "nameFirst",
          options: ["leo", "luna", "boti"],
          reply: { en: "Hello! My name is {alias}.", modelClip: "model-hello-my-name-is" },
          thanks: { speaker: "luna", clip: "luna-nice", en: "Nice to meet you!" },
        },
        {
          id: "b4",
          bag: "yellow",
          owner: "avatar",
          clip: "luna-this-is-your-bag",
          en: "This is your backpack!",
          order: "nameFirst",
          options: ["luna", "leo", "boti"],
        },
      ],
    },
    {
      kind: "dialogue",
      id: "talk",
      estimatedMinutes: 5,
      helpEs:
        "Escuchá, después grabá tu respuesta. Podés escucharte y volver a intentarlo las veces que quieras.",
      conversations: [
        {
          id: "c1",
          with: "leo",
          time: "morning",
          support: "full",
          turns: [
            { type: "character", speaker: "leo", clip: "leo-hello-name", en: "Hello! My name is Leo." },
            { type: "character", speaker: "leo", clip: "leo-what-name", en: "What is your name?" },
            {
              type: "record",
              id: "t1",
              promptEs: "Saludá y decí tu nombre.",
              targetEn: "Hello! My name is {alias}.",
              modelClip: "model-hello-my-name-is",
            },
            { type: "character", speaker: "leo", clip: "leo-nice", en: "Nice to meet you!" },
          ],
        },
        {
          id: "c2",
          with: "luna",
          time: "afternoon",
          support: "reduced",
          turns: [
            {
              type: "character",
              speaker: "luna",
              clip: "luna-intro-afternoon",
              en: "Good afternoon! My name is Luna.",
            },
            { type: "character", speaker: "luna", clip: "luna-how-are-you", en: "How are you?" },
            {
              type: "record",
              id: "t2",
              promptEs: "Saludá, decí tu nombre y cómo estás.",
              targetEn: "Hello! My name is {alias}. I am fine.",
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
      helpEs: "Una persona nueva te recibe. Respondé y recibí tu etiqueta.",
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
