# Que el juego enganche como Roblox: mascota, estrellas y juego libre

## El problema hoy

La misión del lunes es un camino lineal: se termina y ya no hay motivo para volver.
Roblox engancha porque siempre hay algo que crece, algo que coleccionar y algo rápido
que rejugar. Vamos a agregar eso **sin tocar la pedagogía** que ya funciona.

## La idea: "Pipo", tu mascota del muelle

Una mascota tropical (perezoso bebé) que vive en el muelle y **solo crece si el niño
habla inglés**. Ese es el truco: la mecánica adictiva está atada al objetivo de aprender.

### 1. Pipo, la mascota que crece

- Pipo tiene 5 etapas: huevo → bebé → pequeño → grande → explorador.
- Cada frase dicha en voz alta da **estrellas**. Las estrellas alimentan a Pipo.
- Si Pipo está feliz, anima al niño durante las misiones ("¡Vas muy bien!").
- Pipo aparece en el mapa, en la misión y en la pantalla final.

### 2. Estrellas por hablar (la moneda del juego)

- Frase entendida por el juego: 3 estrellas (con sonido de monedas y animación).
- Frase intentada aunque no se entienda: 1 estrella (nunca castigar el intento).
- Repetir la misión SÍ da estrellas nuevas (hoy dice "no da recompensas": eso mata
  la rejugabilidad; se mantiene la regla solo para recompensas únicas como la etiqueta).
- Contador de estrellas visible siempre arriba, al lado de las mochilas.

### 3. Cofre diario (motivo para volver mañana)

- Una vez por día, al entrar al mapa aparece un cofre del tesoro.
- Al abrirlo: animación + estrellas sorpresa (5 a 20 al azar) + racha de días.
- Racha visible: "Llevas 3 días seguidos". A los 7 días, premio especial.

### 4. Zona de juego libre con mini-juegos rejugables

Nueva zona en el mapa: **"La playa de juegos"**, siempre abierta, con mini-juegos
de 1-2 minutos que reusan el vocabulario del lunes. Cada partida da estrellas.

- **"Atrapa la palabra"**: caen palabras en inglés y español; tocá el par correcto
  (Hello! ↔ ¡Hola!). 60 segundos, puntaje propio.
- **"Eco del muelle"**: Pipo dice una frase; el niño la repite al micrófono.
  Cada frase entendida = estrellas. Dificultad sube con frases más largas.
- **"Memoria bilingüe"**: pares de cartas inglés/español con audio al voltear.

### 5. Conexiones con lo existente

- La misión del lunes sigue igual por dentro; al terminarla Pipo sube una etapa.
- Panel de adulto: muestra estrellas, racha y etapa de Pipo; el botón de reinicio
  también reinicia la mascota (privacidad intacta).
- Todo sigue guardado solo en el dispositivo (localStorage), sin cuentas.
- Se reusan las voces infantiles, los sonidos de acierto/error y la validación
  flexible que acepta cualquier nombre.

## Pantallas que cambian

- **Mapa (/)**: Pipo animado con su barra de hambre/etapa, contador de estrellas,
  cofre diario si toca, y tarjeta "Playa de juegos".
- **Nueva ruta `/playa`**: los tres mini-juegos.
- **Misión del lunes**: contador de estrellas arriba; estrellas al grabar;
  Pipo celebra al completar.
- **Panel de adulto**: resumen de estrellas, racha y etapa.

## Detalles técnicos

- `src/lib/pet.ts`: estado de Pipo (etapa, estrellas totales, última alimentación),
  persistido en la misma clave de localStorage (versión de esquema compatible con
  lo ya guardado; no se pierde progreso existente).
- `src/lib/streaks.ts`: cofre diario y racha por fecha local.
- Mini-juegos en `src/components/arcade/`; ruta `src/routes/playa.tsx`.
- Arte de Pipo generado (5 etapas + poses de celebración), estilo consistente
  con el arte actual del muelle.
- Sonidos de monedas/cofre con Web Audio (como los de acierto actuales).
- Sin backend nuevo: todo local, sin integraciones pendientes.

## Verificación

- Playwright móvil (394x702): abrir cofre, jugar cada mini-juego, ganar estrellas,
  ver a Pipo subir de etapa tras completar la misión, recargar y confirmar que
  todo persiste. Build y typecheck limpios.
