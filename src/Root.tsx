import React from "react";
import { AbsoluteFill, Composition, Sequence } from "remotion";
import { AltamAd } from "./AltamAd";
import { AltamCrmAd } from "./AltamCrmAd";
import { getTheme } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { BotSetup } from "./scenes/BotSetup";
import { Conversation } from "./scenes/Conversation";
import { FusedOpening } from "./scenes/FusedOpening";
import { Manifesto } from "./scenes/Manifesto";

// Composición aislada SOLO del opening fusionado (Escena 1 + manifiesto) — para
// previsualizar/iterar el opening sin montar el audio de las escenas siguientes.
const OpeningOnly: React.FC = () => {
  const t = getTheme("dark");
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />
      <Sequence from={0} durationInFrames={200}>
        <FusedOpening theme={t} />
      </Sequence>
      <Sequence from={32} durationInFrames={170}>
        <Manifesto theme={t} />
      </Sequence>
    </AbsoluteFill>
  );
};

// Composición aislada SOLO con la Escena 2 (bisección del bug): mismo entorno
// que AltamCrmAd (fondo + fuente) pero sin ninguna otra escena montada.
const BotSetupOnly: React.FC = () => {
  const t = getTheme("dark");
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />
      <BotSetup theme={t} />
    </AbsoluteFill>
  );
};

// Escena 3 aislada — mismo entorno (fondo compartido + fuente).
const ConversationOnly: React.FC = () => {
  const t = getTheme("dark");
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />
      <Conversation theme={t} />
    </AbsoluteFill>
  );
};

// Config común del anuncio de 15s: 30fps, Full HD horizontal.
const common = {
  component: AltamAd,
  durationInFrames: 450,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AltamAd"
        {...common}
        defaultProps={{ theme: "dark" as const }}
      />
      <Composition
        id="AltamAdLight"
        {...common}
        defaultProps={{ theme: "light" as const }}
      />
      {/* Anuncio del CRM (30s justos) · fondo OSCURO + CRM/cuadros CLAROS */}
      <Composition
        id="AltamCrmAd"
        component={AltamCrmAd}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ theme: "dark" as const }}
      />
      {/* Misma pieza · fondo CLARO + CRM/cuadros OSCUROS */}
      <Composition
        id="AltamCrmAdLight"
        component={AltamCrmAd}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ theme: "light" as const }}
      />
      {/* SOLO el opening fusionado, aislado — para iterar sin el audio de las
          escenas siguientes (que dispara el "Maximum update depth"). */}
      <Composition
        id="OpeningOnly"
        component={OpeningOnly}
        durationInFrames={200}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* SOLO Escena 2, aislada — para diagnosticar el bucle de render */}
      <Composition
        id="BotSetupOnly"
        component={BotSetupOnly}
        durationInFrames={195}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* SOLO Escena 3 (CRM oscuro), aislada — para iterar el layout */}
      <Composition
        id="ConversationOnly"
        component={ConversationOnly}
        durationInFrames={550}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
