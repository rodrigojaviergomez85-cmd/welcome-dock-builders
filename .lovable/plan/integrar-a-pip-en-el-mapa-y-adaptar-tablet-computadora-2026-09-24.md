# Integrar a Pip en el mapa y adaptar tablet/computadora

## Cambios
- Convertir `PipHome` en una capa interactiva dentro del mapa: casa, Pip y vara posicionados sobre el muelle, conservando sueño, despertar, barriga y galería de casas.
- Dejar debajo del mapa únicamente la línea con las frases aprendidas y lo que falta para crecer.
- Reorganizar la portada desde 768 px en dos columnas: mapa a dos tercios y, al lado, pase semanal más cinco días compactos; mantener el apilado actual en celular.
- Compactar la cabecera para que permanezca en una sola fila en tablet y computadora sin cortar alias ni contadores.

## Comprobación
- Revisar 400, 820 y 1280 px, incluyendo etapas 1 y 4 para confirmar la diferencia visible de tamaño.
- Confirmar que casa, Pip y vara permanecen sobre el muelle, sin cortes ni superposiciones.
- Ejecutar las revisiones de código y confirmar que la app prepara correctamente.

## Detalles técnicos
- Los tamaños usarán porcentajes relativos al contenedor del mapa y topes máximos; no se cambia progreso, audio ni lógica de misiones.
- Los paneles emergentes existentes se conservarán y se abrirán desde los elementos superpuestos.
