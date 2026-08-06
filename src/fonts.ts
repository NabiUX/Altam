import { loadFont } from "@remotion/google-fonts/Inter";

// Inter es la tipografía más cercana a la SF Pro de Apple.
// Se carga automáticamente al renderizar, sin instalar nada a mano.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
});
