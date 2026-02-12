# STYLEGUIDE.md

Guía breve de estilo para mantener coherencia en TowerDefense.

## JavaScript

- Usar `const` por defecto; `let` solo cuando sea necesario reasignar.
- Evitar variables globales nuevas; centralizar estado en `js/state.js`.
- Preferir retornos tempranos para reducir anidación.
- Nombres de funciones y variables descriptivos.
- Evitar funciones excesivamente largas; extraer helpers cuando crezca la complejidad.

## Organización de módulos

- `js/constants.js`: valores de balance y configuración.
- `js/state.js`: estado compartido del juego.
- `js/entities.js`: entidades (torres, enemigos, proyectiles, etc.).
- `js/game.js`: loop principal y reglas de simulación.
- `js/ui.js`: renderizado e interacción de interfaz.
- `js/main.js`: bootstrap/inicialización.
- `js/ads.js`: capa adaptadora de monetización (evitar acoplar proveedor y lógica de juego).

## Cambios de gameplay

- Documentar parámetros modificados y su efecto esperado.
- Evitar ajustar múltiples sistemas a la vez sin justificación.
- Mantener cambios de balance en commits/PRs fáciles de auditar.

## Documentación obligatoria por cambio de código

- Toda modificación de código debe revisar consistencia con `AGENTS.md`, `README.md`, `CONTRIBUTING.md` y este archivo.
- Si se adopta un nuevo patrón técnico, debe añadirse a esta guía en el mismo PR.
- Comentar el “por qué”, no lo obvio del “qué”.
- No considerar una tarea terminada si la guía quedó desactualizada respecto al código.

## Monetización

- Implementar anuncios detrás de una capa adaptadora (`js/ads.js`) para facilitar cambios de proveedor.
- Evitar otorgar recompensas sin confirmar finalización del anuncio.
- Mantener reglas anti-abuso (cooldown y límite por partida) en constantes configurables.
