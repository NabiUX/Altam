// types.ts — Tipos mínimos para las props de los componentes.
// Son presentacionales: describen la FORMA de los datos, no lógica.

export type MessageDirection = "OUTBOUND" | "INBOUND";
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
export type Sender = "customer" | "bot" | "seller" | "campaign";

export interface TemplateButton {
  type: "URL" | "PHONE_NUMBER" | "QUICK_REPLY";
  text: string;
}

export interface TemplatePayload {
  /** URL de la imagen del header (usa un placeholder; la diseñadora la reemplaza). */
  imageUrl: string;
  body: string;
  footer?: string;
  buttons: TemplateButton[];
}

export interface Message {
  id: string;
  direction: MessageDirection;
  /** Quién envía. Determina la etiqueta de remitente en las burbujas salientes. */
  sender: Sender;
  /** Nombre a mostrar del remitente (nombre del bot o del vendedor). */
  senderName?: string;
  /** Texto del mensaje. Omitir si es un template puro. */
  text?: string;
  /** Si el mensaje es un template de campaña, su contenido. */
  template?: TemplatePayload;
  /** Nombre de la campaña de origen (muestra el ícono Megaphone). */
  campaignName?: string;
  status?: MessageStatus;
  /** Hora ya formateada, ej. "14:32". */
  time: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatarUrl?: string;
  phone: string;
  lastPreview: string;
  lastTime: string;
  unread?: number;
  labels?: Label[];
  active?: boolean;
}

export interface Label {
  name: string;
  /** Color HEX de la etiqueta. */
  color: string;
}

export interface Contact {
  name: string;
  phone: string;
  avatarUrl?: string;
  labels: Label[];
  assignedSeller?: string;
  aiPaused: boolean;
  notes: string[];
}

// --- Bots ------------------------------------------------------------------

export type BotType =
  | "conversacional"
  | "clasificador"
  | "enrutador"
  | "calificador";

export interface BotTemplate {
  id: string;
  name: string;
  description: string;
  /** Nombre del ícono de lucide-react, ej. "ShoppingCart". */
  icon: string;
  /** Grupo de la sección en el diálogo. */
  group: "principal" | "especialistas" | "otros";
  /** Etiqueta de rol opcional (badge). */
  roleTag?: Label;
}

export interface BotConfig {
  name: string;
  type: BotType;
  description: string;
  systemPrompt: string;
  knowledgeBases: string[];
  maxAiTurns: number;
  autoEscalate: boolean;
  escalationSeller: string;
  triggerTags: Label[];
}
