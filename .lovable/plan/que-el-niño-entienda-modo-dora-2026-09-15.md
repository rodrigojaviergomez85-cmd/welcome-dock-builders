# Que el niño entienda: modo "Dora"

Hoy la misión está casi toda en inglés y la ayuda en español está escondida. Si el niño no entiende, adivina. La idea es que el juego enseñe como Dora: primero en español, después en inglés, y después "repetí conmigo".

## Cómo se va a ver

**1. Cada frase nueva se presenta en tres pasos**

```text
Luna dice:   "¿Cómo te llamás?"        (voz en español)
Luna dice:   "En inglés se dice:  What is your name?"   (voz en inglés, lenta)
Luna dice:   "¡Ahora vos!  Repeat:  What is your name?"  (el niño repite)
```

El niño toca "Escuchar otra vez" las veces que quiera y "Seguir" cuando está listo.

**2. El español siempre visible, no escondido**
- Debajo de cada frase en inglés aparece siempre su significado en español, en letra más chica.
- Botón "¿Qué significa?" con la voz en español en cada escena (historia, rondas de escucha, mochilas, conversaciones).

**3. Antes de cada ejercicio, una mini explicación en español**
- Antes de las rondas de escucha: "Vas a escuchar a alguien presentarse. Tocá quién habló."
- Antes de las mochilas: "Cada uno dice su nombre. Llevale la mochila a su dueño."
- Antes de las conversaciones: "Te van a saludar. Contestá con tu nombre."

**4. Cuando se equivoca, se explica en español**
En lugar de solo el sonido suave de "probá otra vez", Luna dice en español por qué: "Él dijo *My name is Leo* — eso significa *me llamo Leo*. Probá otra vez."

**5. "Repeat after me" como momento propio**
Antes de cada grabación aparece una pantalla corta: se escucha el modelo en inglés dos veces (una normal, una lenta), con el español al lado, y recién después el botón "Decirlo". Así el niño no graba una frase que nunca entendió.

**6. Palabras del día**
Al terminar la misión, una pantalla con las frases aprendidas: inglés, español y altavoz. Sirve para repasar.

## Voces nuevas que hay que generar

Se agregan clips provisionales (mismo proceso que ya usamos, voces de niño):
- Versión en español de cada frase clave (≈12 clips).
- Versión lenta en inglés de cada frase modelo (≈8 clips).
- Frases de puente: "En inglés se dice…", "Ahora vos, repeat!", "Muy bien", "Casi, probá otra vez".

## Detalles técnicos

- `SpokenLine` ya tiene campo `es`; se vuelve obligatorio para las frases clave y se le agrega `esClip` (audio en español) y `slowClip` (inglés lento).
- Nuevo componente `BilingualLine`: muestra inglés grande + español chico + dos altavoces (inglés / español), y opción lenta.
- Nuevo paso reutilizable `RepeatAfterMe`, que se inserta antes de cada `RecordTurn`.
- Nuevo bloque `intro` (instrucción en español con voz) al inicio de cada bloque de la misión.
- `ListenPickView` y `BagMatchView`: al fallar, se reproduce el clip en español de la frase correcta y se muestra la traducción.
- Nueva pantalla "Palabras del día" en `MissionComplete`, alimentada desde `mission.models` con su traducción.
- Se amplía `scripts/generate-voice-clips.ts` con los clips en español, lentos y de puente; mismo postprocesado de tono infantil.
- El progreso guardado no cambia de forma; solo se agrega el registro de cuántas veces usó "¿Qué significa?" (ya existe el contador de ayudas).

## Fuera de alcance por ahora

- Traducir martes a viernes (siguen bloqueados).
- Voces humanas definitivas: estos clips siguen siendo provisionales.
- Elegir idioma de la interfaz; la interfaz sigue en español.
