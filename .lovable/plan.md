# Que el niño diga la frase y reciba respuesta

Hoy el niño graba su voz y el juego solo la guarda como "practicada", sin escucharla. La idea es que el juego sí escuche: que entienda lo que dijo y le conteste, aceptando cualquier nombre.

## Cómo funcionaría

1. El niño toca "Grabar", dice por ejemplo "My name is Sofía" y toca "Listo".
2. El juego convierte la voz en texto y la compara con el modelo de la frase.
3. Respuesta inmediata y siempre amable:
   - Coincide (con cualquier nombre): "¡Te escuché! Dijiste: My name is Sofía" y sigue.
   - Se entendió algo pero falta una parte: muestra lo que escuchó, marca la palabra que falta y ofrece "Intentar otra vez" o "Seguir igual".
   - No se entendió nada (ruido, silencio, muy bajo): "No te escuché bien, probá otra vez" — nunca dice que estuvo mal.
4. "Seguir" nunca se bloquea: después de un intento el niño siempre puede avanzar.

## Qué se acepta como correcto

Se compara de forma flexible, pensada para niños que recién empiezan:

- "My name is ___" acepta cualquier nombre (real, inventado, en español o inglés) e incluso solo "I'm Sofía" o "Sofía".
- "How are you?" / "I am fine" aceptan variantes como "I'm fine", "fine, thank you".
- No importan mayúsculas, puntuación, ni palabras de relleno ("um", "eh").
- No se puntúa la pronunciación ni se pone nota: solo "te escuché" o "probemos otra vez". Es un juego de hablar, no un examen.

## Qué cambia en la pantalla de hablar

- Debajo del botón de grabar aparece lo que el juego escuchó, en letra grande.
- Un sello verde "¡Te escuché!" con sonido y animación cuando coincide.
- Contador honesto en el resumen final: frases dichas y entendidas, frases pendientes.
- Si no hay micrófono o el niño no quiere hablar, todo sigue igual que hoy.

## Privacidad (cambio importante)

Hasta ahora todo quedaba en el dispositivo. Para que el juego "escuche", el audio del intento se envía a un servicio de reconocimiento de voz y vuelve como texto.

- La grabación se sigue guardando solo en el dispositivo; lo que viaja es una copia temporal para transcribir, no se almacena.
- No se envía el nombre real del niño (el perfil ya usa un alias inventado).
- En el panel de adultos se agrega un interruptor "Permitir que el juego escuche y responda", explicado en español, con opción de apagarlo. Apagado, el juego vuelve al modo actual de solo grabar.

## Detalles técnicos

- Nueva función de servidor `checkSpeech` que recibe el audio, llama a la transcripción de Lovable AI (`google/gemini-3.5-transcribe`) y devuelve el texto.
- La comparación se hace en el cliente con reglas propias (normalizar, quitar relleno, plantillas con comodín para el nombre) — sin modelo de lenguaje, para que sea instantáneo, gratis y predecible.
- El audio se envía como WAV corto grabado con Web Audio, no como fragmentos de MediaRecorder.
- Se añade `accept` a los turnos grabables en `missions/types.ts`: plantilla objetivo más variantes aceptadas.
- `RecordTurn` gana estados: `checking`, `heard`, `partial`, `unclear`; el estado del progreso pasa de "practicado/pendiente" a "dicho y entendido / practicado / pendiente".
- Errores del servicio (sin conexión, límite alcanzado) degradan al comportamiento actual: se guarda como practicado y se avisa en español, sin bloquear.
