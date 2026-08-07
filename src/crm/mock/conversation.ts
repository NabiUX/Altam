// conversation.ts — El GUION del video (mock data).
//
// Negocio ficticio: "Boutique Aurora" (tienda de ropa, Quito - Ecuador).
// Cliente: María Torres. Flujo:
//   1. Se envía template de campaña (imagen + body + botones).
//   2. La persona responde.
//   3. Un bot responde y conversa (2 turnos).
//   4. El bot escala a un asesor humano.
//   5. El vendedor humano (Carlos) entra y escribe.
//
// La diseñadora anima la aparición mensaje por mensaje (ver "beats" en README.md).
// Reemplaza `imageUrl` por la imagen real de campaña.

import type { Conversation, Message } from "./types";

const BOT_NAME = "Aurora Bot";
const SELLER_NAME = "Carlos Méndez";

// Etiquetas de color (HEX) — se ven como badges.
export const LABELS = {
  campana: { name: "Campaña", color: "#8b5cf6" },
  interesado: { name: "Interesado", color: "#22c55e" },
  ventas: { name: "Ventas", color: "#3b82f6" },
};

// Conversación seleccionada (encabezado del chat + item resaltado en la lista).
export const activeConversation: Conversation = {
  id: "c-001",
  name: "María Torres",
  phone: "+593 99 123 4567",
  avatarUrl: "", // placeholder → se usa inicial "M"
  lastPreview: "Sí, me gustaría. ¿Cómo puedo pagar?",
  lastTime: "14:36",
  labels: [LABELS.campana, LABELS.interesado],
  active: true,
};

// Otras conversaciones para poblar la lista izquierda (contexto visual).
export const conversationList: Conversation[] = [
  activeConversation,
  {
    id: "c-002",
    name: "Juan Pérez",
    phone: "+593 98 765 4321",
    lastPreview: "Perfecto, muchas gracias 🙌",
    lastTime: "14:20",
    labels: [LABELS.ventas],
  },
  {
    id: "c-003",
    name: "Lucía Vega",
    phone: "+593 96 555 1212",
    lastPreview: "¿Tienen envío a Guayaquil?",
    lastTime: "13:58",
    unread: 2,
    labels: [LABELS.interesado],
  },
  {
    id: "c-004",
    name: "Andrés Salas",
    phone: "+593 99 888 7777",
    lastPreview: "Ok, lo pienso y te aviso",
    lastTime: "12:41",
  },
];

// Los mensajes en orden. `beat` = número de paso de animación (ver README).
export const messages: (Message & { beat: number })[] = [
  {
    beat: 1,
    id: "m-1",
    direction: "OUTBOUND",
    sender: "campaign",
    campaignName: "Nueva Colección · Octubre",
    time: "14:30",
    status: "READ",
    template: {
      imageUrl: "https://placehold.co/560x320/1e3a8a/ffffff?text=Nueva+Colecci%C3%B3n",
      body: "¡Hola María! 🎉 Llegó nuestra nueva colección de temporada con 30% de descuento por lanzamiento. ¿Quieres verla?",
      footer: "Boutique Aurora",
      buttons: [
        { type: "URL", text: "Ver catálogo" },
        { type: "QUICK_REPLY", text: "Hablar con un asesor" },
      ],
    },
  },
  {
    beat: 2,
    id: "m-2",
    direction: "INBOUND",
    sender: "customer",
    text: "Hola, me interesa 😍 ¿Tienen la chaqueta de mezclilla en talla M?",
    time: "14:33",
  },
  {
    beat: 3,
    id: "m-3",
    direction: "OUTBOUND",
    sender: "bot",
    senderName: BOT_NAME,
    text: "¡Hola María! 👋 Sí, tenemos la chaqueta de mezclilla en talla M disponible. Cuesta $45 e incluye envío gratis dentro de Quito. ¿Te gustaría reservarla?",
    time: "14:33",
    status: "READ",
  },
  {
    beat: 4,
    id: "m-4",
    direction: "INBOUND",
    sender: "customer",
    text: "Sí, me gustaría. ¿Cómo puedo pagar?",
    time: "14:36",
  },
  {
    beat: 5,
    id: "m-5",
    direction: "OUTBOUND",
    sender: "bot",
    senderName: BOT_NAME,
    text: "¡Genial! 🙌 Para coordinar el pago y el envío te paso con uno de nuestros asesores. Un momento por favor.",
    time: "14:36",
    status: "READ",
  },
  // beat 6 = banner de escalamiento (EscalationChip, no es un mensaje)
  {
    beat: 7,
    id: "m-6",
    direction: "OUTBOUND",
    sender: "seller",
    senderName: SELLER_NAME,
    text: "Hola María, soy Carlos 😊 Con gusto te ayudo con tu chaqueta de mezclilla talla M. Aceptamos transferencia bancaria o pago contra entrega. ¿Cuál prefieres?",
    time: "14:38",
    status: "DELIVERED",
  },
];

// Texto del banner de escalamiento (beat 6).
export const escalation = {
  beat: 6,
  text: "Conversación escalada a un asesor humano",
  seller: SELLER_NAME,
  time: "14:37",
};
