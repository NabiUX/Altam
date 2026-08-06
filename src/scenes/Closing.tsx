import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";

// Cierre: wordmark de Altam + tagline + dominio.
// Nota: es un logo tipográfico. Puedes reemplazarlo por el SVG real
// dejándolo en /public y cargándolo con <Img>.
export const Closing: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = spring({ frame: frame - 4, fps, config: smoothSpring });
  const logoBlur = interpolate(logo, [0, 1], [14, 0]);
  const logoY = interpolate(logo, [0, 1], [24, 0]);

  const tagline = spring({ frame: frame - 20, fps, config: smoothSpring });
  const domain = spring({ frame: frame - 34, fps, config: smoothSpring });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 34,
      }}
    >
      <div
        style={{
          fontSize: 128,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: theme.text,
          opacity: logo,
          filter: `blur(${logoBlur}px)`,
          transform: `translateY(${logoY}px)`,
        }}
      >
        altam<span style={{ color: theme.accent }}>.</span>
      </div>

      <div
        style={{
          fontSize: 32,
          fontWeight: 500,
          color: theme.textMuted,
          opacity: tagline,
          transform: `translateY(${interpolate(tagline, [0, 1], [14, 0])}px)`,
        }}
      >
        Tu negocio, digital y automático con IA
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "16px 40px",
          borderRadius: 999,
          border: `1.5px solid ${theme.accent}`,
          color: theme.accent,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.01em",
          opacity: domain,
          transform: `scale(${interpolate(domain, [0, 1], [0.9, 1])})`,
        }}
      >
        altam.io
      </div>
    </AbsoluteFill>
  );
};
