import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { getTheme, ThemeName } from "./theme";
import { fontFamily } from "./fonts";
import { Background } from "./components/Background";
import { FusedOpening } from "./scenes/FusedOpening";
import { Manifesto } from "./scenes/Manifesto";
import { BotSetup } from "./scenes/BotSetup";
import { Conversation } from "./scenes/Conversation";

// Anuncio del CRM de WhatsApp de Altam — ~45s (1350 frames).
// La Escena 3 (Conversation) incluye el cierre completo (bot que guiña + logo +
// CTA), así que las escenas Organized/CrmClosing ya no se usan.
// Escenas encadenadas con leve solape para crossfades suaves.
export const AltamCrmAd: React.FC<{ theme: ThemeName }> = ({ theme }) => {
  const t = getTheme(theme);
  return (
    <AbsoluteFill style={{ fontFamily, backgroundColor: t.bgTo }}>
      <Background theme={t} />

      {/* Música de fondo sobre todo el anuncio. Arranca en el frame 0: su intro
          (golpe + pausa) se funde con la lluvia de pops del caos y el DROP entra
          a ~2s justo cuando los pops se apagan → parece que los pops son la intro
          del tema. Volumen bajo (la pista es muy fuerte, −9.4 LUFS) para que los
          efectos resalten. Baja desde el guiño del bot final (~frame 760). */}
      <Audio
        src={staticFile("sounds/fondo.mp3")}
        startFrom={20}
        volume={(f) =>
          f < 8
            ? (f / 8) * 0.13
            : f > 746
              ? Math.max(0, (900 - f) / (900 - 746)) * 0.13
              : 0.13
        }
      />

      {/* Voz en off RE-ESPACIADA al video (texto_sync.mp3, horneada desde texto.mp3
          con ffmpeg): frases 1-2 comprimidas para caber en la Escena 1, "Configura"
          entra con la Escena 2, y de "Cada conversación" en adelante intacto. Arranca
          en frame 0, dura ~27.9s; el cierre queda en silencio sobre el logo. Música a
          0.13 (ducking). RE-HORNEAR si cambia el timing del arranque. */}
      <Audio src={staticFile("sounds/texto_sync.mp3")} volume={1.0} />


      {/* 0–~6.6s · Escena 1 FUSIONADA: caos estilo Escena 3 (chats que se
          organizan en la columna) + pregunta "¿Cuántas ventas…?" */}
      <Sequence from={0} durationInFrames={200}>
        <FusedOpening theme={t} />
      </Sequence>

      {/* Caja 3D del manifiesto SOBRE la columna; "Por eso creamos" entra CON el
          levantamiento de la columna (frame 62 = RISE_AT). */}
      <Sequence from={32} durationInFrames={170}>
        <Manifesto theme={t} />
      </Sequence>

      {/* ~5.8–12s · Configuras el bot (acelerada) */}
      <Sequence from={174} durationInFrames={186}>
        <BotSetup theme={t} />
      </Sequence>

      {/* ~11.7–50s · La conversación (caos vuelve → CRM se ordena → chat de
          Andrés → escala silenciosa → bot guiña → logo + CTA). Es el cierre. */}
      <Sequence from={336} durationInFrames={564}>
        <Conversation theme={t} />
      </Sequence>
    </AbsoluteFill>
  );
};
