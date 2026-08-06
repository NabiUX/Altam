import { interpolate } from "remotion";

// Fade de entrada y salida basado en el frame local de una escena.
// Da el "aire" y las transiciones suaves del estilo Apple.
export const fadeInOut = (
  frame: number,
  duration: number,
  inFrames = 15,
  outFrames = 15,
): number =>
  interpolate(
    frame,
    [0, inFrames, duration - outFrames, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

// Config de spring suave (sin rebotes exagerados), tipo Apple.
export const smoothSpring = {
  damping: 200,
  stiffness: 100,
  mass: 1,
} as const;
