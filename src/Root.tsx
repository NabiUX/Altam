import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { AltamAd } from "./AltamAd";
import { InboxScreen } from "./crm/inbox/InboxScreen";
import {
  conversationList,
  activeConversation,
  messages,
  escalation,
} from "./crm/mock/conversation";
import { contact } from "./crm/mock/contact";
import { Background } from "./components/Background";
import { ScreenFrame } from "./components/ScreenFrame";
import { getTheme } from "./theme";

// Composición temporal: valida Tailwind v4 + el panel luminoso ScreenFrame.
// Se elimina en Task 3.
const TWCheck: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: getTheme("dark").bgTo }}>
    <Background theme={getTheme("dark")} />
    <ScreenFrame theme={getTheme("dark")} progress={1}>
      <InboxScreen
        conversations={conversationList}
        activeConversation={activeConversation}
        contact={contact}
        messages={messages}
        showEscalation
        escalation={escalation}
        typing={null}
      />
    </ScreenFrame>
  </AbsoluteFill>
);

// Config común: 15 segundos, 30fps, Full HD horizontal.
const common = {
  component: AltamAd,
  durationInFrames: 450,
  fps: 30,
  width: 1920,
  height: 1080,
} as const;

// Dos composiciones que comparten la misma plantilla, una por tema.
// En Remotion Studio puedes cambiar entre ellas para ver claro vs oscuro.
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
      <Composition
        id="TWCheck"
        component={TWCheck}
        durationInFrames={30}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
