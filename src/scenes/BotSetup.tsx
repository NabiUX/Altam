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
import { ScreenFrame } from "../components/ScreenFrame";
import { BotCreateDialog } from "../crm/bots/BotCreateDialog";
import { BotWizard } from "../crm/bots/BotWizard";
import { botTemplates, botGroups, exampleBot } from "../crm/mock/bots";

// Escena 2 (5–16s): diálogo "Crear bot" → resalta "Especialista en ventas"
// → wizard recorre 5 pasos. Frase de cierre superpuesta.
// Sub-tiempos (frames locales): 0–95 diálogo (resalta "ventas" desde f≈45);
// 95–320 wizard (paso 1..5, ~45 frames c/u); frase desde f≈250.
export const BotSetup: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });

  const showWizard = frame >= 95;
  const step = Math.min(5, Math.floor((frame - 95) / 45) + 1);
  const highlightId = frame >= 45 ? "ventas" : undefined;

  const line = interpolate(frame, [250, 285], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Al entrar la frase, el panel se atenúa y encoge para que el texto blanco
  // quede legible sobre el fondo oscuro (consistente con ChaosInbox).
  const panelDim = interpolate(frame, [245, 285], [1, 0.22], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelScale = interpolate(frame, [245, 285], [1, 0.94], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{ opacity: panelDim, transform: `scale(${panelScale})` }}
      >
        <ScreenFrame theme={theme} progress={progress}>
          {showWizard ? (
            <div className="h-full w-full bg-gray-50">
              <BotWizard config={exampleBot} step={step} />
            </div>
          ) : (
            <BotCreateDialog
              templates={botTemplates}
              groups={botGroups}
              highlightId={highlightId}
            />
          )}
        </ScreenFrame>
      </AbsoluteFill>
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: theme.text,
            textAlign: "center",
            lineHeight: 1.1,
            opacity: line,
            filter: `blur(${interpolate(line, [0, 1], [12, 0])}px)`,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          Un bot que vende
          <br />
          como tú le enseñes.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
