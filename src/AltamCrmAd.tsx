import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { getTheme, ThemeName } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { ChaosInbox } from "./scenes/ChaosInbox";
import { Manifesto } from "./scenes/Manifesto";
import { BotSetup } from "./scenes/BotSetup";
import { Conversation } from "./scenes/Conversation";
import { Organized } from "./scenes/Organized";
import { CrmClosing } from "./scenes/CrmClosing";

// Anuncio del CRM de WhatsApp de Altam — ~66s (1990 frames).
// Escenas encadenadas con leve solape para crossfades suaves.
export const AltamCrmAd: React.FC<{ theme: ThemeName }> = ({ theme }) => {
  const t = getTheme(theme);
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />

      {/* 0–5s · El caos */}
      <Sequence from={0} durationInFrames={160}>
        <ChaosInbox theme={t} />
      </Sequence>

      {/* ~4.7–11.7s · Interludio: "Por eso creamos…" (relevo desde la Escena 1) */}
      <Sequence from={140} durationInFrames={210}>
        <Manifesto theme={t} />
      </Sequence>

      {/* 11.3–22s · Configuras el bot */}
      <Sequence from={340} durationInFrames={340}>
        <BotSetup theme={t} />
      </Sequence>

      {/* 22–46s · La conversación */}
      <Sequence from={670} durationInFrames={730}>
        <Conversation theme={t} />
      </Sequence>

      {/* 46–54s · Todo ordenado */}
      <Sequence from={1390} durationInFrames={250}>
        <Organized theme={t} />
      </Sequence>

      {/* 54–66s · Cierre */}
      <Sequence from={1630} durationInFrames={360}>
        <CrmClosing theme={t} />
      </Sequence>
    </AbsoluteFill>
  );
};
