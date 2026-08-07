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
import { InboxScreen } from "../crm/inbox/InboxScreen";
import {
  conversationList,
  activeConversation,
  messages,
  escalation,
} from "../crm/mock/conversation";
import { contact } from "../crm/mock/contact";

// Escena 4 (40–48s): la bandeja completa (todo ya ordenado) con un acercamiento
// al panel derecho de contacto y la frase "Cada chat, ordenado y sin fugas.".
export const Organized: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });
  // Beat 1 (0–80): acercamiento al panel de contacto y se mantiene.
  const zoom = interpolate(frame, [0, 80], [1, 1.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panX = interpolate(frame, [0, 80], [0, -190], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Beat 2 (110–150): entra la frase; el panel se atenúa para que el texto blanco lea.
  const line = interpolate(frame, [110, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panelDim = interpolate(frame, [105, 150], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `translateX(${panX}px) scale(${zoom})`,
          opacity: panelDim,
        }}
      >
        <ScreenFrame theme={theme} progress={progress}>
          <InboxScreen
            conversations={conversationList}
            activeConversation={activeConversation}
            contact={contact}
            messages={messages}
            typing={null}
            showEscalation
            escalation={escalation}
            escalationAfterId="m-5"
          />
        </ScreenFrame>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: theme.text,
            textAlign: "center",
            opacity: line,
            filter: `blur(${interpolate(line, [0, 1], [12, 0])}px)`,
            textShadow: "0 6px 40px rgba(0,0,0,0.6)",
          }}
        >
          Cada chat, ordenado y sin fugas.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
