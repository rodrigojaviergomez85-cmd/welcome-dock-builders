import type { Mission } from "./types";

/**
 * Lunes — El reloj del sol.
 *
 * Alineado 1:1 con la currícula (COMPLETE CURRICULUM · MONTH 1 · Level 0 · Week 1 · Day 1):
 *   VOCABULARY  Good morning, Good afternoon, Good evening, Good night   → bloque "sun" + "radar"
 *   GRAMMAR     What is your name? My name is ______.                     → bloque "tag"
 *   PRACTICE    Role play: How are you? I am fine, thank you. / What is your name? My name is… → bloque "roleplay"
 *   AF          Tell me about yourself (greeting, name) · DPCQ            → bloque "dock" (presentación grabada)
 *
 * Reglas de diseño del día 1 (niños 8–12, primer día, desde cero):
 *   1. Cada bloque, una mecánica distinta (arrastrar · tocar · hablar-para-imprimir · conversar · presentarse).
 *   2. Cada bloque apunta a una fila de la currícula y se nota.
 *   3. Cero lectura obligatoria: la instrucción es voz (clip "es-…") + demo animada; el texto en español es apoyo, no requisito.
 *   4. El niño habla antes del minuto 3 y termina grabando la fluidez automática completa.
 *   5. El significado lo enseña la imagen (el cielo), no la traducción.
 *
 * Contenido separado del motor: este archivo solo describe la misión.
 */
export const mondayMission: Mission = {
  id: "monday",
  order: 1,
  dayEs: "Lunes",
  title: "El reloj del sol",
  status: "available",
  objective:
    "Saludar según la hora (Good morning / afternoon / evening / night), preguntar y decir el nombre (What is your name? / My name is…), y presentarse: saludo + nombre.",
  storyProblem:
    "El reloj del sol de la isla se rompió y nadie sabe cómo saludar. Hay que arreglarlo, recibir a los exploradores según la hora y estrenar la etiqueta con tu nombre.",
  prerequisites: [],
  models: [
    "Good morning!",
    "Good afternoon!",
    "Good evening!",
    "Good night!",
    "What is your name?",
    "My name is {alias}.",
    "How are you?",
    "I am fine, thank you.",
    "Good afternoon! My name is {alias}.",
  ],
  reward: { id: "sun-tag", label: "Etiqueta con tu nombre y el sol arreglado" },
  evidence:
    "Reconoce los cuatro saludos por el cielo, dice su nombre para imprimir la etiqueta, sostiene el role play en ambos roles y graba su presentación completa (saludo + nombre).",
  counter: { icon: "star", label: "Soles" },
  reviewPhrases: [
    "Good morning!",
    "Good afternoon!",
    "Good evening!",
    "Good night!",
    "My name is {alias}.",
  ],
  /** Pip come 8 oraciones en la misión: 4 saludos + etiqueta + 2 turnos del role play + presentación. */
  pip: { feedsToEvolve: 8, rewardLabel: "Pip aprende a saludar" },
  blocks: [
    /* ───────────── 0. Arranque: adoptar a Pip y probar el micrófono (1 min) ───────────── */
    {
      kind: "micCheck",
      id: "hello",
      estimatedMinutes: 1,
      time: "morning",
      helpEs: "Pip solo entiende inglés. Tocá el micrófono y decile Hello.",
      introClip: "es-pip-intro",
      record: {
        id: "t0",
        role: "repeat",
        promptEs: "Decile Hello a Pip.",
        targetEn: "Hello!",
        modelClip: "model-hello",
      },
    },

    /* ───────────── 1. EXPLORAR: el reloj del sol (3 min) · VOCABULARY ───────────── */
    {
      kind: "sunClock",
      id: "sun",
      estimatedMinutes: 3,
      helpEs:
        "Arrastrá el sol por el cielo. Boti saluda según la hora. Después repetí cada saludo.",
      introClip: "es-sun-intro",
      guide: "boti",
      stops: [
        {
          time: "morning",
          line: {
            speaker: "boti",
            clip: "boti-good-morning",
            en: "Good morning!",
            es: "¡Buenos días!",
          },
          repeat: {
            id: "s1",
            role: "repeat",
            promptEs: "Repetí: Good morning!",
            targetEn: "Good morning!",
            modelClip: "model-good-morning",
          },
        },
        {
          time: "afternoon",
          line: {
            speaker: "boti",
            clip: "boti-good-afternoon",
            en: "Good afternoon!",
            es: "¡Buenas tardes!",
          },
          repeat: {
            id: "s2",
            role: "repeat",
            promptEs: "Repetí: Good afternoon!",
            targetEn: "Good afternoon!",
            modelClip: "model-good-afternoon",
          },
        },
        {
          time: "evening",
          line: {
            speaker: "boti",
            clip: "boti-good-evening",
            en: "Good evening!",
            es: "¡Buenas noches! (al llegar)",
          },
          repeat: {
            id: "s3",
            role: "repeat",
            promptEs: "Repetí: Good evening!",
            targetEn: "Good evening!",
            modelClip: "model-good-evening",
          },
        },
        {
          time: "night",
          line: {
            speaker: "boti",
            clip: "boti-good-night",
            en: "Good night!",
            es: "¡Buenas noches! (al irse a dormir)",
          },
          repeat: {
            id: "s4",
            role: "repeat",
            promptEs: "Repetí: Good night!",
            targetEn: "Good night!",
            modelClip: "model-good-night",
          },
        },
      ],
      /** Al terminar, el sol queda arreglado y Boti lo celebra. */
      done: {
        speaker: "boti",
        clip: "boti-sun-fixed",
        en: "The sun clock works! Thank you!",
        es: "¡El reloj del sol funciona! ¡Gracias!",
      },
    },

    /* ───────────── 2. RADAR: ¿a qué hora llega cada explorador? (3 min) · comprensión ───────────── */
    {
      kind: "tapPick",
      id: "radar",
      estimatedMinutes: 3,
      helpEs: "Escuchá cómo saluda el explorador y tocá el cielo correcto.",
      style: "sky",
      time: "afternoon",
      promptEs: "¿A qué hora llega?",
      rounds: [
        {
          id: "r1",
          speaker: "luna",
          clip: "luna-intro-morning",
          en: "Good morning! My name is Luna.",
          answer: "sky-morning",
          options: ["sky-morning", "sky-afternoon", "sky-evening", "sky-night"],
        },
        {
          id: "r2",
          speaker: "leo",
          clip: "leo-intro-evening",
          en: "Good evening! My name is Leo.",
          answer: "sky-evening",
          options: ["sky-morning", "sky-afternoon", "sky-evening", "sky-night"],
        },
        {
          id: "r3",
          speaker: "mia",
          clip: "mia-intro-afternoon",
          en: "Good afternoon! My name is Mia.",
          answer: "sky-afternoon",
          options: ["sky-morning", "sky-afternoon", "sky-evening", "sky-night"],
        },
        {
          id: "r4",
          speaker: "boti",
          clip: "boti-good-night-name",
          en: "Good night! My name is Boti.",
          answer: "sky-night",
          options: ["sky-morning", "sky-afternoon", "sky-evening", "sky-night"],
        },
      ],
    },

    /* ───────────── 3. LA MÁQUINA DE ETIQUETAS (4 min) · GRAMMAR ───────────── */
    {
      kind: "nameTag",
      id: "tag",
      estimatedMinutes: 4,
      time: "afternoon",
      helpEs: "Leo pregunta tu nombre. Decilo al micrófono y la máquina imprime tu etiqueta.",
      introClip: "es-tag-intro",
      asker: "leo",
      ask: [
        {
          speaker: "leo",
          clip: "leo-hello-name",
          en: "Hello! My name is Leo.",
          es: "¡Hola! Me llamo Leo.",
        },
        { speaker: "leo", clip: "leo-what-name", en: "What is your name?", es: "¿Cómo te llamás?" },
      ],
      record: {
        id: "t1",
        role: "answer",
        mode: "guided",
        promptEs: "Decí tu nombre.",
        targetEn: "My name is {alias}.",
        modelClip: "model-my-name-is",
      },
      /** La etiqueta impresa se guarda en la mochila del alumno (reward visible). */
      /** Sin {alias} en el audio: los clips son pregrabados y no pueden decir el nombre del niño. */
      printed: {
        speaker: "boti",
        clip: "boti-tag-ready",
        en: "Your tag is ready!",
        es: "¡Tu etiqueta está lista!",
      },
      /** Cambio de rol: ahora el niño pregunta y Mia responde. */
      swap: {
        record: {
          id: "t2",
          role: "ask",
          promptEs: "¡Mirá, llegó Mia! Preguntale cómo se llama diciendo:",
          promptClip: "es-ask-mia-name-v2",
          askSequenceClip: "es-ask-mia-name-full",
          confusedWith: "My name is {alias}.",
          targetEn: "What is your name?",
          modelClip: "model-what-name",
        },
        answer: {
          speaker: "mia",
          clip: "mia-my-name-is",
          en: "My name is Mia!",
          es: "¡Me llamo Mia!",
        },
      },
    },

    /* ───────────── 4. ROLE PLAY con Pip (3 min) · PRACTICE (diálogo exacto de la currícula) ───────────── */
    {
      kind: "dialogue",
      id: "roleplay",
      estimatedMinutes: 3,
      helpEs: "Primero respondés vos. Después Luna espera que vos le preguntes.",
      conversations: [
        {
          id: "c1",
          with: "luna",
          time: "evening",
          support: "full",
          turns: [
            {
              type: "character",
              speaker: "luna",
              clip: "luna-hello-how-are-you",
              en: "Hello! How are you?",
            },
            {
              type: "record",
              id: "t3",
              role: "answer",
              mode: "guided",
              promptEs: "Decí que estás bien.",
              targetEn: "I am fine, thank you.",
              modelClip: "model-i-am-fine-thank-you",
            },
            {
              type: "character",
              speaker: "luna",
              clip: "luna-what-name",
              en: "What is your name?",
            },
            {
              type: "record",
              id: "t4",
              role: "answer",
              promptEs: "Decí tu nombre.",
              targetEn: "My name is {alias}.",
              modelClip: "model-my-name-is",
            },
          ],
        },
        {
          id: "c2",
          with: "luna",
          time: "evening",
          support: "reduced",
          turns: [
            {
              type: "record",
              id: "t5",
              role: "ask",
              promptEs: "Luna está esperando. Saludala y preguntale cómo está diciendo:",
              promptClip: "es-ask-luna-how",
              confusedWith: "I am fine, thank you.",
              targetEn: "Hello! How are you?",
              modelClip: "model-hello-how-are-you",
            },
            {
              type: "character",
              speaker: "luna",
              clip: "luna-i-am-fine-thank-you",
              en: "I am fine, thank you.",
            },
            {
              type: "record",
              id: "t6",
              role: "ask",
              promptEs: "Ahora preguntale el nombre a Luna diciendo:",
              promptClip: "es-ask-luna-name",
              confusedWith: "My name is {alias}.",
              targetEn: "What is your name?",
              modelClip: "model-what-name",
            },
            { type: "character", speaker: "luna", clip: "luna-my-name-is", en: "My name is Luna." },
          ],
        },
      ],
    },

    /* ───────────── 5. PRESENTACIÓN EN EL MUELLE (3 min) · AF "Tell me about yourself" ───────────── */
    {
      kind: "showcase",
      id: "dock",
      estimatedMinutes: 3,
      helpEs:
        "Mirá el cielo: es la hora real. Saludá según la hora y decí tu nombre. Esta grabación es tu presentación de hoy.",
      /** "auto" = el cielo se pone según la hora real del dispositivo; el saludo objetivo cambia con él. */
      time: "auto",
      audience: ["luna", "leo", "mia", "boti"],
      intro: {
        speaker: "luna",
        clip: "luna-tell-me",
        en: "Tell me about yourself!",
        es: "¡Contame de vos!",
      },
      steps: [
        {
          id: "t7",
          role: "answer",
          promptEs: "Saludá según la hora y decí tu nombre.",
          /** {greeting} se resuelve con la hora real: Good morning / afternoon / evening / night. */
          targetEn: "{greeting} My name is {alias}.",
          modelClip: ["model-{greetingClip}", "model-my-name-is"],
        },
      ],
      cheer: {
        speaker: "luna",
        clip: "luna-cheer",
        en: "Yay! Welcome to Explorer Island!",
        es: "¡Bien! ¡Bienvenido a la Isla de los Exploradores!",
      },
      /** Esta grabación se marca como "presentación del día": es el audio para el padre y el ticket para la clase. */
      saveAs: "presentation-day1",
      /** Gancho para mañana (martes: países). */
      teaser: {
        speaker: "leo",
        clip: "leo-teaser-tuesday",
        en: "Tomorrow I will tell you where I am from!",
        es: "Mañana te cuento de dónde soy.",
      },
    },
  ],
};
