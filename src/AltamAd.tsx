import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { getTheme, ThemeName } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { Opening } from "./scenes/Opening";
import { Modules } from "./scenes/Modules";
import { Unify } from "./scenes/Unify";
import { Closing } from "./scenes/Closing";

export interface AltamAdProps {
  theme: ThemeName;
}

// Anuncio estilo Apple para altam.io — 15s.
// Escenas encadenadas con leve solape para crossfades suaves.
export const AltamAd: React.FC<AltamAdProps> = ({ theme }) => {
  const t = getTheme(theme);

  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />

      {/* 0–3s · Apertura: tagline palabra por palabra */}
      <Sequence from={0} durationInFrames={100}>
        <Opening theme={t} />
      </Sequence>

      {/* 3–9s · Módulos clave */}
      <Sequence from={90} durationInFrames={190}>
        <Modules theme={t} />
      </Sequence>

      {/* 9–12s · Unificación */}
      <Sequence from={270} durationInFrames={100}>
        <Unify theme={t} />
      </Sequence>

      {/* 12–15s · Cierre con logo */}
      <Sequence from={360} durationInFrames={90}>
        <Closing theme={t} />
      </Sequence>
    </AbsoluteFill>
  );
};
