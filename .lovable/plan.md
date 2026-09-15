# Kids Platform — Lunes: "El muelle de bienvenida"

Primera misión jugable de Explorer Island para niños de 8–12 años (Level 0). Solo el lunes se construye completo; martes a viernes quedan visibles como próximas entregas, claramente bloqueadas y sin simular que funcionan.

## Decisiones tomadas

- Progreso guardado en el dispositivo del niño (sin cuentas todavía).
- Voces de Luna, Leo y Boti: audio generado provisional, marcado como no definitivo.
- Ilustraciones provisionales generadas (isla, personajes, mochilas, avatares).

## Lo que el niño vivirá

1. **Elegir avatar y alias** — cuatro avatares y un alias corto inventado; nada de datos personales reales.
2. **Mapa de la isla** — cinco zonas; solo el muelle está abierto, las otras cuatro se ven como "Próximamente".
3. **Escena de historia (≈2 min)** — Luna saluda: "Hello! My name is Luna." y pregunta "What is your name?", con modelo completo disponible.
4. **Escuchar y descubrir (≈4 min)** — cuatro rondas: suena una presentación y el niño toca al personaje correcto. Escenas de mañana, tarde y anochecer para "Good morning / afternoon / evening".
5. **Misión de las mochilas (≈6 min)** — tres mochilas se devuelven escuchando a su dueño; el orden de la conversación cambia (a veces preguntan primero). La última mochila es la del niño. Se puede arrastrar o tocar origen y destino.
6. **Conversar y grabarse (≈5 min)** — dos conversaciones por turnos: saludo + nombre, luego saludo + "How are you?" + nombre. El niño graba, escucha su propia voz y repite. Segunda ronda con menos apoyo.
7. **Cierre (≈3 min)** — un personaje nuevo pregunta "Hello! What is your name?", el niño responde y recibe su etiqueta. Despedida con "Good night" mostrado como irse a dormir.

Los tiempos son guía de contenido: nada bloquea el avance por cronómetro. Siempre hay pausa, salir, repetir audio y ayuda breve en español.

## Honestidad sobre la evaluación

- Una grabación terminada se marca solo como "practicado". Nunca se muestra "pronunciación correcta".
- No existe todavía revisión automática de voz; la pantalla de progreso lo dice con claridad.
- Sin micrófono (o sin permiso) la historia y la comprensión continúan; la voz queda "pendiente".
- El pase y las recompensas nunca se presentan como certificación de nivel.

## Progreso guardado

Se guarda en el dispositivo: escena actual, ayudas usadas, aciertos de comprensión, estado de práctica oral y partes del pase. Cerrar y volver retoma donde quedó. Repetir la misión cuenta como práctica y no duplica recompensas ni cuenta como misión nueva. Las grabaciones se quedan en el dispositivo y se pueden borrar desde un panel del adulto.

## Panel del adulto

Pantalla sencilla con: permiso de micrófono, qué se guardó, borrar grabaciones, reiniciar progreso y una nota clara de que aún no hay envío de voz a ningún servidor.

## Detalle técnico

- Contenido de misiones separado del motor: un archivo de datos por día (`src/content/missions/monday.ts`) con id, orden, objetivo, prerrequisitos, escenas, clips, acciones, modelos, variantes aceptadas, ayudas, recompensa y evidencia. Martes–viernes solo con metadatos y estado `locked`.
- Motor reutilizable: `MissionPlayer` más componentes `StoryScene`, `ListenAndPick`, `DragMatch` (con alternativa tocar/tocar), `TurnDialogue`, `RecordTurn`, `AudioButton`, `HelpBubble`, `MissionComplete`.
- Rutas: `/` (isla y mapa), `/mision/lunes`, `/perfil` (avatar y alias), `/adulto`. Cada ruta con su propio título y descripción.
- Progreso en `localStorage` con versión de esquema; grabaciones en IndexedDB como blobs, nunca subidas.
- Grabación con `MediaRecorder`, reproducción local; degradación clara si el navegador o el permiso falla.
- Audio provisional: clips de voz generados una sola vez en la construcción y guardados como archivos del proyecto, nunca generados durante el juego.
- Ilustraciones provisionales generadas en estilo ilustrado 2D coherente.
- Diseño mobile/tablet primero, objetivos táctiles grandes, animaciones cortas ligadas a las acciones del niño.

## Inventario de recursos provisionales (se entrega al final)

- Lista exacta de clips por frase y personaje, con el texto en inglés, para regrabar con voz humana revisada.
- Lista de ilustraciones por escena y personaje, para el ilustrador.

## Lo que quedará pendiente para probar con niños

- Voces y arte definitivos revisados.
- Cuentas de adulto, niño y coach con permisos reales y guardado en servidor (requiere activar el backend).
- Evaluación automática de voz, con llamadas solo desde servidor, cuotas por alumno y registro de costo.
- Borrado automático a los 30 días, que debe existir de verdad antes de prometerlo en pantalla.
- Prueba en los dispositivos reales del piloto.

## Verificación antes de entregar

Completar la misión de principio a fin; cerrar y recuperar el progreso; repetir sin duplicar recompensas; continuar sin micrófono dejando la voz pendiente; comprobar audio y grabación en tamaño móvil y tablet.
