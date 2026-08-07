// InboxScreen.tsx — Ensambla las 3 columnas: lista | chat | panel de contacto.
//
// Es un contenedor delgado: reenvía props al ChatPanel para que Remotion controle
// qué mensajes/typing/escalamiento se ven por frame.
import * as React from "react";
import { ConversationList } from "./ConversationList";
import { ChatPanel } from "./ChatPanel";
import { ContactPanel } from "./ContactPanel";
import type { Conversation, Contact, Message } from "../mock/types";

interface InboxScreenProps {
  conversations: Conversation[];
  activeConversation: Conversation;
  contact: Contact;
  messages: Message[];
  showEscalation?: boolean;
  escalation?: { text: string; seller?: string; time?: string };
  escalationAfterId?: string;
  typing?: { align?: "left" | "right" } | null;
}

export function InboxScreen({
  conversations,
  activeConversation,
  contact,
  messages,
  showEscalation,
  escalation,
  escalationAfterId,
  typing,
}: InboxScreenProps) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-white font-sans text-gray-900">
      <ConversationList conversations={conversations} />
      <ChatPanel
        conversation={activeConversation}
        messages={messages}
        showEscalation={showEscalation}
        escalation={escalation}
        escalationAfterId={escalationAfterId}
        typing={typing}
      />
      <ContactPanel contact={contact} />
    </div>
  );
}
