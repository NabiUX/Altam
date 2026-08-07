// bots.ts — Mock data para la escena de configuración de BOTS.
//   - botTemplates: tarjetas del diálogo "Crear bot" (agrupadas por sección).
//   - exampleBot: config de ejemplo que llena el wizard.
import type { BotTemplate, BotConfig } from "./types";

// Plantillas mostradas en el diálogo "Crear bot".
// `icon` = nombre de un ícono de lucide-react.
export const botTemplates: BotTemplate[] = [
  {
    id: "generalista",
    name: "Asistente general",
    description: "Responde consultas generales y orienta al cliente.",
    icon: "MessageCircle",
    group: "principal",
    roleTag: { name: "Principal", color: "#3b82f6" },
  },
  {
    id: "ventas",
    name: "Especialista en ventas",
    description: "Resuelve dudas de productos, precios y cierra pedidos.",
    icon: "ShoppingCart",
    group: "especialistas",
    roleTag: { name: "Ventas", color: "#22c55e" },
  },
  {
    id: "soporte",
    name: "Soporte al cliente",
    description: "Atiende posventa, cambios y reclamos.",
    icon: "LifeBuoy",
    group: "especialistas",
    roleTag: { name: "Soporte", color: "#f59e0b" },
  },
  {
    id: "calificador",
    name: "Calificador de leads",
    description: "Hace preguntas para calificar y etiquetar contactos.",
    icon: "Target",
    group: "especialistas",
    roleTag: { name: "Calificador", color: "#8b5cf6" },
  },
  {
    id: "enrutador",
    name: "Enrutador de conversaciones",
    description: "Deriva cada chat al vendedor correcto según reglas.",
    icon: "UserCog",
    group: "otros",
  },
];

// Agrupación en orden de despliegue (títulos y subtítulos del diálogo real).
export const botGroups = [
  {
    key: "principal",
    title: "Bot principal",
    subtitle:
      "Empieza por aquí: responde consultas generales y orienta al cliente.",
  },
  {
    key: "especialistas",
    title: "Especialistas",
    subtitle: "Bots enfocados en una tarea concreta.",
  },
  { key: "otros", title: "Otros" },
];

// Config de ejemplo que "se llena" en el wizard (beats de animación en README).
export const exampleBot: BotConfig = {
  name: "Especialista en ventas",
  type: "conversacional",
  description: "Atiende consultas de productos y cierra pedidos de la boutique.",
  systemPrompt:
    "Eres el asistente de ventas de Boutique Aurora. Responde con tono cálido y cercano. " +
    "Informa precios, tallas y disponibilidad. Cuando el cliente quiera pagar, escala a un asesor humano.",
  knowledgeBases: ["Catálogo Octubre", "Políticas de envío"],
  maxAiTurns: 6,
  autoEscalate: true,
  escalationSeller: "Carlos Méndez",
  triggerTags: [
    { name: "Interesado", color: "#22c55e" },
    { name: "Campaña", color: "#8b5cf6" },
  ],
};
