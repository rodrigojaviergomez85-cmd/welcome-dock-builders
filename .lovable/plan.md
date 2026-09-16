# Cómo sostener 21 meses sin que se vuelva repetitivo

El problema no es tener más frases: es que hoy cada misión se escribe a mano y usa siempre las mismas 5 pantallas. Con 21 meses (unas 420 misiones diarias) hace falta un motor: pocas piezas, muchas combinaciones, y una historia que avanza.

## La idea en una frase

Un mundo que crece por temporadas: cada mes es una isla nueva con su historia, sus personajes y su premio final. Dentro de cada isla, los días combinan mini-juegos distintos sobre el vocabulario de esa semana.

## Las cuatro capas que evitan la repetición

**1. Historia larga (21 meses)**
- 21 islas, una por mes. Cada isla tiene tema propio: el muelle, la selva, el mercado, la nave, el circo...
- Cada isla cierra con un evento especial (rescate, fiesta, competencia) y desbloquea la siguiente en el mapa.
- Personajes que viajan con el niño y se suman: hoy Luna, Leo, Boti y Mia; cada isla presenta uno nuevo.

**2. Biblioteca de mini-juegos (se reutiliza, se siente distinto)**
En vez de 5 pantallas fijas, un catálogo de formatos. Cada día el sistema elige 3 o 4 distintos:
- Escuchá y elegí (lo actual)
- Emparejar objeto con palabra
- Eco: repetir frases cortas (lo actual)
- Carrera contra reloj de palabras vistas
- Espía: encontrar el objeto escondido en la escena
- Ordenar la frase con piezas
- Conversación con un personaje
- Karaoke de canción del mes
- Memoria de pares
- "Simón dice" con acciones físicas

Regla del motor: un formato no puede repetirse dos días seguidos, y el vocabulario nuevo del día siempre entra primero por audio, nunca por texto.

**3. Vocabulario en espiral (aprender de verdad)**
Cada día: 3–5 expresiones nuevas + repaso automático de las que el niño falló o no practicó hace días. Así el contenido nunca se agota ni se olvida, y el repaso no se siente repetido porque llega dentro de un mini-juego distinto.

**4. Enganche tipo Roblox**
- Mascota/avatar que se personaliza con lo ganado (ropa, sombreros, colores).
- Monedas por misión, tienda para gastarlas.
- Racha diaria con premio creciente.
- Coleccionables: una figura por isla, álbum visible.
- Sorpresa semanal: un día especial impredecible (misión secreta, personaje visitante).

## Qué se construye ahora (primera entrega)

1. **Motor de misiones**: en lugar de escribir cada pantalla, una misión pasa a ser una lista de "bloques" con su vocabulario. Ya existe algo así; se amplía para soportar formatos nuevos.
2. **Tres mini-juegos nuevos** además de los actuales: emparejar, espía en la escena, ordenar la frase.
3. **Sistema de repaso espiral**: guardar qué palabras sabe cada niño y reinyectarlas solo.
4. **Economía**: monedas, racha y un primer set de premios para el avatar.
5. **Isla 1 completa**: los 20 días del mes 1 generados con el motor, sin repetir formato dos días seguidos.

Con eso, los meses siguientes se producen escribiendo solo vocabulario + historia, no pantallas nuevas.

## Detalles técnicos

- Ampliar `src/content/missions/types.ts` con los nuevos tipos de bloque; cada bloque nuevo tiene su componente en `src/components/game/blocks/`.
- Nuevo `src/content/vocabulary.ts`: catálogo único de expresiones con clip, traducción e isla; las misiones referencian IDs en vez de repetir textos.
- `src/lib/progress.ts` pasa a guardar dominio por expresión (aciertos, última práctica) además del avance actual; migración desde la clave existente sin perder datos.
- `src/lib/spaced-review.ts`: elige qué repasar cada día.
- `src/lib/economy.ts` + pantalla de tienda/avatar; monedas y racha en el progreso.
- Generación de audio: extender `scripts/generate-voice-clips.ts` para producir los clips por ID de vocabulario (voces infantiles y español, como hoy).
- Verificación móvil 394×702 al cerrar cada entrega.

## Lo que hace falta de tu lado

- **La currícula completa**: el documento original cita `Kids Super Intensive Curriculum (simple).xlsx` (hoja COMPLETE CURRICULUM, programa A1 → B1 de 36 meses), pero ese Excel no está subido al proyecto. Subilo y armo el mapa de las 21 islas con el vocabulario real por mes y semana, en vez de inventarlo.
- Mientras tanto puedo proponer el orden de las 21 islas y su tema con nivel A1 por temas, y ajustarlo cuando llegue el Excel.
