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

// Composición temporal: valida que Tailwind v4 aplica en los componentes del CRM.
// Se elimina en Task 3.
const TWCheck: React.FC = () => (
  <AbsoluteFill style={{ width: 1920, height: 1080 }}>
    <InboxScreen
      conversations={conversationList}
      activeConversation={activeConversation}
      contact={contact}
      messages={messages}
      showEscalation
      escalation={escalation}
      typing={null}
    />
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
