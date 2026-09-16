# 21 meses sin que se vuelva repetitivo — sobre tu currícula real

Ya leí el Excel. Tiene exactamente lo que hace falta: **21 meses, 11 niveles (0 a 10), 4 semanas por mes, 5 días por semana = 420 días**, cada uno con su tema, vocabulario, gramática, práctica y meta de fluidez. También trae los `SUPER STAR EXAM` cada dos semanas y las metas semanales del resumen.

El problema entonces no es el contenido: es que hoy cada día se escribe a mano con las mismas 5 pantallas. La solución es un motor que tome esa tabla y genere días distintos.

## La estructura que ya trae tu currícula (y que el juego debe respetar)

- **Mes = isla.** 21 islas, una por mes, con su tema visual y su historia.
- **Nivel = región del mapa.** Level 0 es el muelle; cada nivel abre una zona nueva (11 zonas).
- **Semana = meta.** La `WEEKLY GOAL` del resumen ("Tell me about yourself", "What is your daily routine?") se vuelve el reto del viernes.
- **Día = misión.** Su `TOPIC`, `VOCABULARY`, `GRAMMAR` y `PRACTICE` alimentan los mini-juegos.
- **SUPER STAR EXAM** (aparece cada 2 semanas) se convierte en el **jefe de la isla**: un desafío especial con premio grande, no un examen.
- **AUTOMATIC FLUENCY** es la frase que el niño debe poder decir solo al final del día.

## Las cuatro capas que evitan la repetición

**1. Formatos de juego rotativos**
En vez de 5 pantallas fijas, un catálogo. Cada día el motor arma 3 o 4 según el tipo de contenido del día:
- Escuchá y elegí (existe)
- Eco: repetir frases cortas (existe)
- Emparejar objeto/imagen con palabra — ideal para Colors, Food, Fruits, Family
- Espía: encontrar el objeto escondido en la escena
- Ordenar la frase con piezas — ideal para los días de GRAMMAR
- Conversación con personaje (role play, como pide la columna PRACTICE)
- Carrera contra reloj de palabras ya vistas
- Karaoke / canción de la semana
- Memoria de pares
- Deletreo (los días de Alphabet lo piden explícitamente)

Regla: nunca el mismo formato dos días seguidos, y el vocabulario nuevo siempre entra por audio antes que por texto.

**2. Vocabulario en espiral**
Cada día: las palabras nuevas de la fila + repaso automático de lo que el niño falló o no practica hace días. Así el repaso nunca se siente repetido, porque llega dentro de otro mini-juego.

**3. Historia que avanza**
Cada isla tiene un problema propio y un personaje nuevo que se suma al equipo. El viernes cierra la historia con la meta semanal. Cada dos semanas, el jefe de isla.

**4. Enganche tipo Roblox**
- Avatar y mascota que se personalizan con lo ganado.
- Monedas por misión y tienda para gastarlas.
- Racha diaria con premio creciente.
- Coleccionables: una figura por isla, álbum visible.
- Día sorpresa semanal impredecible.

## Qué se construye ahora (primera entrega)

1. **Importar el Excel al proyecto**: convertir las 420 filas en datos que la app lee, con mes, nivel, semana, día, tema, vocabulario, gramática, práctica y frase de fluidez.
2. **Motor de misiones**: una misión pasa a ser "vocabulario del día + lista de formatos", en vez de pantallas escritas a mano.
3. **Tres mini-juegos nuevos**: emparejar, ordenar la frase, espía en la escena.
4. **Repaso en espiral**: guardar qué sabe cada niño y reinyectarlo.
5. **Economía y mapa de islas**: monedas, racha, primeras recompensas, y el mapa mostrando las 21 islas con solo la primera abierta.
6. **Mes 1 completo (Level 0)**: los 20 días generados con el motor, empezando por el lunes que ya funciona.

Con eso, los meses 2 a 21 se producen aportando audio y arte, no pantallas nuevas.

## Detalles técnicos

- Script de importación que lee `COMPLETE CURRICULUM` y `SUMMARY` y emite `src/content/curriculum/*.ts` (un archivo por mes) más `src/content/vocabulary.ts` con un ID por expresión.
- Ampliar `src/content/missions/types.ts` con los nuevos tipos de bloque; un componente por bloque en `src/components/game/blocks/`.
- `src/lib/mission-builder.ts`: dado un día de la currícula, elige formatos evitando repetir el del día anterior.
- `src/lib/progress.ts` guarda dominio por expresión (aciertos, última práctica) además del avance; migración desde `kids-platform-progress-v1` sin perder datos.
- `src/lib/spaced-review.ts` para el repaso en espiral; `src/lib/economy.ts` para monedas y racha.
- `scripts/generate-voice-clips.ts` se extiende para generar clips por ID de vocabulario, con las voces infantiles y el español ya configurados.
- Verificación móvil 394×702 al cerrar cada entrega.

## Lo que sigue necesitando trabajo humano

- **Audio**: el mes 1 ya tiene clips; los 20 meses restantes necesitan generación masiva (es automatizable con el script, pero hay costo y revisión de calidad).
- **Arte**: 21 islas y sus personajes. Se puede arrancar con arte generado y reemplazar después.
- **Historias**: una línea narrativa por isla; la puedo proponer yo a partir de los temas del Excel y vos la aprobás mes a mes.
