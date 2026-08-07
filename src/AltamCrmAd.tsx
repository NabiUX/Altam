import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { getTheme, ThemeName } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { ChaosInbox } from "./scenes/ChaosInbox";
import { BotSetup } from "./scenes/BotSetup";
import { Conversation } from "./scenes/Conversation";
import { Organized } from "./scenes/Organized";
import { CrmClosing } from "./scenes/CrmClosing";

// Anuncio del CRM de WhatsApp de Altam — ~60s (1800 frames).
// 5 escenas encadenadas con leve solape para crossfades suaves.
export const AltamCrmAd: React.FC<{ theme: ThemeName }> = ({ theme }) => {
  const t = getTheme(theme);
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />

      {/* 0–5s · El caos */}
      <Sequence from={0} durationInFrames={160}>
        <ChaosInbox theme={t} />
      </Sequence>

      {/* 5–16s · Configuras el bot */}
      <Sequence from={150} durationInFrames={340}>
        <BotSetup theme={t} />
      </Sequence>

      {/* 16–40s · La conversación */}
      <Sequence from={480} durationInFrames={730}>
        <Conversation theme={t} />
      </Sequence>

      {/* 40–48s · Todo ordenado */}
      <Sequence from={1200} durationInFrames={250}>
        <Organized theme={t} />
      </Sequence>

      {/* 48–60s · Cierre */}
      <Sequence from={1440} durationInFrames={360}>
        <CrmClosing theme={t} />
      </Sequence>
    </AbsoluteFill>
  );
};
