// ConversationList.tsx — Panel izquierdo: buscador + filtros + lista de chats.
import * as React from "react";
import { Search, Filter } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import type { Conversation } from "../mock/types";

function ConversationItem({ c }: { c: Conversation }) {
  return (
    <div
      className={`flex cursor-pointer gap-3 border-b border-gray-100 px-3 py-3 ${
        c.active ? "bg-theme-50" : "hover:bg-gray-50"
      }`}
    >
      <Avatar name={c.name} src={c.avatarUrl} size={44} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{c.name}</span>
          <span className="shrink-0 text-[11px] text-gray-400">{c.lastTime}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-gray-500">{c.lastPreview}</span>
          {c.unread ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-500 px-1 text-[10px] font-semibold text-white">
              {c.unread}
            </span>
          ) : null}
        </div>
        {c.labels && c.labels.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {c.labels.map((l) => (
              <span
                key={l.name}
                className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                style={{ backgroundColor: `${l.color}1a`, color: l.color }}
              >
                {l.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConversationList({ conversations }: { conversations: Conversation[] }) {
  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Encabezado */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-base font-semibold text-gray-900">Bandeja de entrada</h2>
        <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100">
          <Filter className="h-4 w-4" />
        </button>
      </div>
      {/* Buscador */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-400">Buscar conversación…</span>
        </div>
      </div>
      {/* Filtros rápidos */}
      <div className="flex gap-2 px-3 pb-2">
        <span className="rounded-full bg-theme-600 px-3 py-1 text-xs font-medium text-white">
          Todas
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          No leídas
        </span>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          Asignadas
        </span>
      </div>
      {/* Lista */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((c) => (
          <ConversationItem key={c.id} c={c} />
        ))}
      </div>
    </div>
  );
}
