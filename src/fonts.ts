import { loadFont } from "@remotion/google-fonts/Inter";
import {
  loadFont as loadEmoji,
  fontFamily as emojiFamily,
} from "@remotion/google-fonts/NotoColorEmoji";

// Inter es la tipografía más cercana a la SF Pro de Apple.
// Se carga automáticamente al renderizar, sin instalar nada a mano.
const { fontFamily: interFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
});

// Noto Color Emoji: sin esta fuente los emojis (🙌 😍 🎉 …) salen como "tofu".
// Tailwind v4 ya la referencia al final de su stack `font-sans` (la usan los
// componentes del CRM); aquí además la anexamos al fallback de las escenas con
// estilos inline.
loadEmoji();

export const fontFamily = `${interFamily}, ${emojiFamily}`;
