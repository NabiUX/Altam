import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
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
import { BEAT_AT, visibleMessages, typingAt } from "./conversationBeats";

// Escena 3 (16–40s): la bandeja real con los 7 beats.
// El banner de escalamiento va DESPUÉS del mensaje del bot que avisa (m-5, beat 5).
// El panel derecho pasa a "IA pausada + Carlos asignado" en el beat 6.
export const Conversation: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame, fps, config: smoothSpring });

  const visible = visibleMessages(messages, frame);
  const talign = typingAt(frame);
  const showEscalation = frame >= BEAT_AT[6];
  const contactNow = showEscalation
    ? contact
    : { ...contact, aiPaused: false, assignedSeller: undefined };

  return (
    <ScreenFrame theme={theme} progress={progress}>
      <InboxScreen
        conversations={conversationList}
        activeConversation={activeConversation}
        contact={contactNow}
        messages={visible}
        typing={talign ? { align: talign } : null}
        showEscalation={showEscalation}
        escalation={escalation}
        escalationAfterId="m-5"
      />
    </ScreenFrame>
  );
};
