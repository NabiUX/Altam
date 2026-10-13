// Sistema de tema: una sola plantilla que soporta modo claro y oscuro.
// Cada escena lee sus colores desde aquí, así el switch es total.

export type ThemeName = "light" | "dark";

export interface Theme {
  name: ThemeName;
  // Fondo (degradado)
  bgFrom: string;
  bgTo: string;
  // Glow de acento en el fondo
  accentGlow: string;
  glowOpacity: number;
  // Texto
  text: string;
  textMuted: string;
  // Acento de marca (azul Altam)
  accent: string;
  accentSoft: string;
  // Tarjetas de módulos
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
}

// Azul de marca Altam.
const ALTAM_BLUE = "#2E6BFF";

// Color del texto sobre fondo CLARO (frases/títulos flotantes): azul de marca en
// vez de negro. Se usa en la versión de fondo claro de todas las escenas.
export const LIGHT_TEXT_ACCENT = "oklch(68.5% 0.169 237.323)";

// Devuelve el color del texto flotante según el tema del fondo: blanco/normal en
// oscuro, azul de marca en claro.
export const floatingTextColor = (t: Theme): string =>
  t.name === "light" ? LIGHT_TEXT_ACCENT : t.text;

// Sombra del texto flotante: en claro NO lleva sombra oscura (ensucia); en oscuro
// mantiene la sombra para separarlo del fondo.
export const floatingTextShadow = (t: Theme, shadow: string): string =>
  t.name === "light" ? "none" : shadow;

const light: Theme = {
  name: "light",
  bgFrom: "#FFFFFF",
  bgTo: "#EEF2FB",
  accentGlow: "rgba(46, 107, 255, 0.14)",
  glowOpacity: 0.9,
  text: "#0B1220",
  textMuted: "rgba(11, 18, 32, 0.55)",
  accent: ALTAM_BLUE,
  accentSoft: "rgba(46, 107, 255, 0.12)",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(11, 18, 32, 0.06)",
  cardShadow: "0 30px 60px rgba(20, 40, 90, 0.12)",
};

const dark: Theme = {
  name: "dark",
  bgFrom: "#1B2E5C",
  bgTo: "#0C1424",
  accentGlow: "rgba(77, 130, 255, 0.38)",
  glowOpacity: 1,
  text: "#FFFFFF",
  textMuted: "rgba(255, 255, 255, 0.62)",
  accent: "#4D82FF",
  accentSoft: "rgba(77, 130, 255, 0.16)",
  cardBg: "rgba(255, 255, 255, 0.05)",
  cardBorder: "rgba(255, 255, 255, 0.12)",
  cardShadow: "0 30px 70px rgba(0, 0, 0, 0.45)",
};

export const getTheme = (name: ThemeName): Theme =>
  name === "light" ? light : dark;
