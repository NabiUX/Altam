# altam-videos

Animaciones estilo anuncio de **Apple** para [altam.io](https://altam.io),
hechas con [Remotion](https://www.remotion.dev/) (React + TypeScript) y
renderizadas a video **.mp4**.

## Requisitos

- Node 18+ (probado con Node 22)

## Comandos

```bash
npm install          # instalar dependencias (solo la primera vez)

npm run dev          # abrir Remotion Studio (preview con timeline)

npm run render:dark  # exportar out/altam-ad-dark.mp4  (modo oscuro)
npm run render:light # exportar out/altam-ad-light.mp4 (modo claro)
```

En **Remotion Studio** puedes cambiar entre las composiciones `AltamAd`
(oscuro) y `AltamAdLight` (claro) para ver ambos temas.

## Estructura

- `src/AltamAd.tsx` — la plantilla principal (encadena las 4 escenas).
- `src/scenes/` — cada escena por separado (apertura, módulos, unificación, cierre).
- `src/theme.ts` — colores de los temas claro y oscuro.

El diseño completo está en
[`docs/superpowers/specs/2026-08-06-altam-ad-design.md`](docs/superpowers/specs/2026-08-06-altam-ad-design.md).
