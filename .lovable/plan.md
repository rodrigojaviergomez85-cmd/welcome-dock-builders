# Semana 1 completa, con formatos de juego distintos cada día

Ya leí tu Excel. La semana 1 del mes 1 (Level 0) es exactamente esto:

| Día | Tema | Vocabulario | Frase clave | Meta acumulada |
|---|---|---|---|---|
| Lunes | Saludos | Good morning / afternoon / evening / night | What is your name? My name is ___ | saludo + nombre |
| Martes | Países | países más comunes | Where are you from? I am from ___ | + país |
| Miércoles | Números | 1 a 12 | How old are you? I am ___ | + edad |
| Jueves | Alfabeto | ABC | deletreo (spelling bee) | + letras |
| Viernes | Alfabeto | ABC | deletrear tu nombre | Tell me about yourself completo |

El viernes el niño puede decir solo: *Hello! My name is Rodrigo, R-O-D-R-I-G-O. I am from El Salvador and I am 10 years old.*

## La clave para que no se sienta repetitivo

Cada día usa **un formato de juego distinto**, aunque el objetivo se vaya acumulando. Así se repasa sin que parezca lo mismo:

- **Lunes — Rescate de mochilas** (ya construido): saludos según la hora del día.
- **Martes — El barco de banderas**: llegan niños de distintos países; el jugador escucha *I am from...* y lleva a cada uno a su bandera. Cierra diciendo de dónde es él.
- **Miércoles — Mercado de números**: contar cosas del muelle de 1 a 12, atrapar el número que se dice. Cierra diciendo su edad.
- **Jueves — Torre de letras**: las letras caen y hay que atraparlas por su sonido; mini duelo de deletreo con un personaje.
- **Viernes — El gran escenario**: reto final. El jugador se presenta completo y deletrea su nombre frente a los personajes de la semana. Es el "jefe" de la semana, con premio grande.

## Enganche, sin que deje de ser escuela

- Cada día da monedas y una pieza de un **pase semanal** (ya está en el concepto original).
- Racha de días: si vuelve mañana, el premio sube.
- El avatar gana algo visible cada día (gorro, mascota, color).
- Los personajes de cada día se suman al escenario del viernes, así se ve el progreso.
- Repaso automático: cada día arranca con 30 segundos de lo del día anterior, dentro del juego nuevo, no como examen.

## Qué se construye

1. **Datos de la semana** tomados del Excel: los cinco días con su tema, vocabulario, frase y meta acumulada.
2. **Motor de misiones reutilizable**: una misión = vocabulario + lista de formatos, en lugar de pantallas escritas a mano. El lunes actual se migra a este motor.
3. **Cuatro formatos nuevos**: banderas (emparejar), números (atrapar/contar), letras (sonido-letra y deletreo), escenario final (presentación hablada).
4. **Audio infantil** para el vocabulario nuevo de martes a viernes, con las mismas voces de niños y el español ya configurados.
5. **Recompensas**: monedas, racha, pase semanal y avatar que cambia.
6. **Mapa de la semana**: los cinco días visibles, el siguiente se abre al terminar el anterior.

Los meses 2 al 21 quedan como siguiente etapa: ya tenemos la tabla completa y el motor los soportará sin rehacer pantallas.

## Detalles técnicos

- Script que extrae `MONTH 1 / Week 1` del Excel a `src/content/curriculum/month1-week1.ts` y un `src/content/vocabulary.ts` con un ID por expresión (audio, inglés, español).
- Ampliar `src/content/missions/types.ts` con los bloques nuevos: `flagMatch`, `numberCatch`, `letterSound`, `spellName`, `showcase`; un componente por bloque en `src/components/game/blocks/`.
- `src/lib/mission-builder.ts` arma la misión del día a partir de la fila de currícula y evita repetir el formato del día anterior.
- `src/lib/progress.ts` suma dominio por expresión, monedas, racha y piezas del pase, con migración desde `kids-platform-progress-v1`.
- `src/lib/economy.ts` para monedas/racha; recompensas del avatar en el perfil existente.
- Rutas `/mision/martes`… reutilizan `MissionPlayer`; el mapa en `src/routes/index.tsx` pasa a mostrar los cinco días con desbloqueo progresivo.
- `scripts/generate-voice-clips.ts` se extiende para generar por ID de vocabulario (saludos, países, números 1–12, alfabeto).
- Se conserva lo ya logrado: validación flexible de voz, sonidos de acierto/error, andamiaje bilingüe y una sola acción principal por pantalla.
- Verificación móvil 394×702 recorriendo los cinco días.
