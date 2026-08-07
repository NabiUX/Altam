import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Theme } from "../theme";
import { smoothSpring } from "../components/anim";

// Isotipo real de Altam (public/LOGO.png) usado como máscara para pintarlo con
// el acento del tema (visible en claro y oscuro).
const LOGO = staticFile("LOGO.png");
const LOGO_RATIO = 1321 / 1068;
const LOGO_H = 176;

// Escena 5 (48–60s): cierre del anuncio del CRM con CTA de diagnóstico.
// Isotipo + wordmark "altam." + tagline + botón CTA + dominio.
export const CrmClosing: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mark = spring({ frame: frame - 2, fps, config: smoothSpring });
  const markBlur = interpolate(mark, [0, 1], [16, 0]);
  const markY = interpolate(mark, [0, 1], [26, 0]);
  const markScale = interpolate(mark, [0, 1], [0.92, 1]);

  const logo = spring({ frame: frame - 14, fps, config: smoothSpring });
  const logoBlur = interpolate(logo, [0, 1], [14, 0]);
  const logoY = interpolate(logo, [0, 1], [24, 0]);

  const tagline = spring({ frame: frame - 28, fps, config: smoothSpring });
  const cta = spring({ frame: frame - 42, fps, config: smoothSpring });
  const domain = spring({ frame: frame - 56, fps, config: smoothSpring });

  const markGlow =
    theme.name === "dark" ? ` drop-shadow(0 0 26px ${theme.accentGlow})` : "";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 30,
      }}
    >
      <div
        style={{
          width: LOGO_H * LOGO_RATIO,
          height: LOGO_H,
          backgroundColor: theme.accent,
          WebkitMaskImage: `url(${LOGO})`,
          maskImage: `url(${LOGO})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          opacity: mark,
          filter: `blur(${markBlur}px)${markGlow}`,
          transform: `translateY(${markY}px) scale(${markScale})`,
        }}
      />

      <div
        style={{
          fontSize: 116,
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
          fontSize: 34,
          fontWeight: 500,
          color: theme.textMuted,
          opacity: tagline,
          transform: `translateY(${interpolate(tagline, [0, 1], [14, 0])}px)`,
        }}
      >
        Control comercial real en WhatsApp
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "18px 44px",
          borderRadius: 999,
          background: theme.accent,
          color: "#fff",
          fontSize: 30,
          fontWeight: 700,
          opacity: cta,
          transform: `scale(${interpolate(cta, [0, 1], [0.9, 1])})`,
          boxShadow: `0 0 40px ${theme.accentGlow}`,
        }}
      >
        Diagnóstico de fugas en WhatsApp
      </div>

      <div
        style={{
          color: theme.textMuted,
          fontSize: 24,
          fontWeight: 600,
          letterSpacing: "0.02em",
          opacity: domain,
        }}
      >
        altam.io
      </div>
    </AbsoluteFill>
  );
};
