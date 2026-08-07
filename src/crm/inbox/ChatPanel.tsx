// ChatPanel.tsx — Panel central: cabecera del chat + mensajes (fondo #e5ddd5) + composer.
//
// API pensada para Remotion: tú decides QUÉ se ve en cada frame.
//   - `messages`: los mensajes YA visibles (pásale un slice creciente por frame).
//   - `showEscalation`: muestra el banner de escalamiento cuando toque.
//   - `typing`: muestra "escribiendo…" ({ align }) o null.
import * as React from "react";
import { MoreVertical, Search, Paperclip, Smile, Mic } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { MessageBubble } from "./MessageBubble";
import { TemplateBubble } from "./TemplateBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EscalationChip } from "./EscalationChip";
import type { Conversation, Message } from "../mock/types";

interface ChatPanelProps {
  conversation: Conversation;
  messages: Message[];
  showEscalation?: boolean;
  escalation?: { text: string; seller?: string; time?: string };
  typing?: { align?: "left" | "right" } | null;
}

export function ChatPanel({
  conversation,
  messages,
  showEscalation,
  escalation,
  typing,
}: ChatPanelProps) {
  return (
    <div className="flex h-full flex-1 flex-col bg-[#efeae2]">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Avatar name={conversation.name} src={conversation.avatarUrl} size={40} />
          <div>
            <div className="text-sm font-semibold text-gray-900">{conversation.name}</div>
            <div className="text-xs text-gray-500">{conversation.phone}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Search className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
        </div>
      </div>

      {/* Mensajes */}
      <div
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-4"
        style={{ backgroundColor: "#e5ddd5" }}
      >
        {messages.map((m) =>
          m.template ? (
            <TemplateBubble key={m.id} message={m} />
          ) : (
            <MessageBubble key={m.id} message={m} />
          )
        )}

        {showEscalation && escalation && (
          <EscalationChip text={escalation.text} seller={escalation.seller} time={escalation.time} />
        )}

        {typing && <TypingIndicator align={typing.align} />}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-2.5">
        <Smile className="h-6 w-6 text-gray-400" />
        <Paperclip className="h-5 w-5 text-gray-400" />
        <div className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-400">
          Escribe un mensaje…
        </div>
        <Mic className="h-6 w-6 text-gray-400" />
      </div>
    </div>
  );
}
