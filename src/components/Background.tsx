import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Theme } from "../theme";

// Fondo con degradado + un glow de acento que "respira" muy sutilmente.
export const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();

  // Movimiento lento y determinista (sin Math.random).
  const drift = Math.sin(frame / 70) * 4;
  const breathe = 0.85 + Math.sin(frame / 90) * 0.15;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${theme.bgFrom} 0%, ${theme.bgTo} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${50 + drift}% 32%, ${theme.accentGlow} 0%, transparent 55%)`,
          opacity: theme.glowOpacity * breathe,
        }}
      />
    </AbsoluteFill>
  );
};
