# TowerDefense

Juego de defensa de torres implementado como aplicación web estática (HTML + JavaScript).

## Estado del proyecto

El proyecto actualmente no usa framework ni backend obligatorio. La lógica está separada por módulos en `js/`.

## Requisitos

- Navegador moderno (Chrome/Firefox/Edge).
- Node.js 18+ (recomendado para validaciones de sintaxis).
- Python 3 (opcional, para servidor local rápido).

## Ejecución local

```bash
python3 -m http.server 8080
# abrir http://localhost:8080
```

Alternativa:

```bash
npx serve .
```

## Validación rápida

```bash
node --check js/constants.js
node --check js/state.js
node --check js/entities.js
node --check js/upgrades.js
node --check js/game.js
node --check js/ui.js
node --check js/main.js
node --check js/ads.js
```

## Estructura actual

- `index.html`: entrada principal de la aplicación.
- `js/constants.js`: configuración y constantes de gameplay.
- `js/state.js`: estado global del juego.
- `js/entities.js`: entidades del dominio (enemigos, torres, etc.).
- `js/upgrades.js`: lógica de mejoras.
- `js/game.js`: loop/reglas de juego.
- `js/ui.js`: lógica de interfaz.
- `js/main.js`: inicialización.
- `js/ads.js`: adaptador de anuncios recompensados (MVP simulado).

## Documentación para colaboradores

- `AGENTS.md`: guía operativa para agentes y colaboradores.
- `CONTRIBUTING.md`: flujo y criterios de contribución.
- `STYLEGUIDE.md`: convenciones de estilo y organización.

## Política documental (obligatoria)

Cada cambio de código debe revisar y, si aplica, actualizar estos archivos:

- `AGENTS.md`
- `README.md`
- `CONTRIBUTING.md`
- `STYLEGUIDE.md`

Si un archivo no cambia, debe indicarse en el PR como “revisado, sin cambios”.

## Contribución

Las contribuciones son bienvenidas mediante pull requests con descripción clara y pasos de validación.

## Monetización (MVP actual)

- Se incorporó un flujo de anuncio recompensado simulado (sin SDK real) para validar UX y balance.
- La recompensa se reclama entre oleadas y otorga créditos escalados por número de oleada.
- Incluye límite por partida y cooldown para evitar abuso.
