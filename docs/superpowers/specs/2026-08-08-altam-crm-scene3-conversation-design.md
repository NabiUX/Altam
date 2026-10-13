# Diseño — Escena 3: La conversación (CRM oscuro)

**Fecha:** 2026-08-08
**Proyecto:** altam-videos
**Escena:** 3 de `AltamCrmAd` ("La conversación — el corazón")
**Estado:** Aprobado, listo para construir
**Referencia visual:** `public/chat CRM.jpeg` (pantalla real del CRM de Altam en modo oscuro)

## Objetivo

Recrear la **pantalla real del CRM de Altam en modo oscuro** (tipo WhatsApp en PC,
3 columnas) y **animar en vivo** una conversación de un cliente de *Finanzas desde
Cero* (el negocio configurado en la Escena 2). El bot atiende y maneja una
objeción; cuando el cliente decide comprar, el bot **escala a un asesor humano de
forma SILENCIOSA para el cliente** — el traspaso solo se ve en el CRM (banner +
"IA pausada" + vendedor asignado) y una asesora humana **continúa la venta sin
cortar**. Ese es el gancho: *el bot vende y un humano cierra sin que el cliente
note el cambio, y todo queda registrado.*

Estilo custom (hecho a mano, como la Escena 2 `BotSetup`), NO los componentes
claros del paquete `src/crm/`. Reusa `theme.ts`, `Background`, `smoothSpring`,
fuente Inter. Modo oscuro coherente con el resto del anuncio.

## Layout (3 columnas + barra superior + footer), según la referencia

- **Barra superior (oscura):** iconos a la izquierda, breadcrumb `WhatsApp › Inbox`,
  a la derecha indicador verde **En vivo**, campana, avatar circular.
- **Columna izquierda — Lista de conversaciones:** header "Conversaciones" con
  contador grande, buscador, filtros (Todas · Recientes · Etiquetas · Todos los
  números), y varias **tarjetas** (avatar/inicial, nombre, número, día, último
  mensaje, etiquetas de color: `IA`, vendedor, etiqueta de negocio). Una tarjeta
  **seleccionada** (resaltada, borde azul) = nuestro cliente. Mayormente estática
  (transmite "miles de chats"); puede tener micro-vida (un contador que sube).
- **Columna central — El chat (SE ANIMA):** cabecera con avatar+nombre+número del
  contacto e iconos; área de mensajes con burbujas (cliente a la izquierda en gris
  oscuro, negocio/bot a la derecha en azul/verde-agua); **banner naranja de escala**;
  barra inferior de escribir con placeholder e indicador **"Bot pausado"**.
- **Columna derecha — Información del Contacto:** avatar grande, nombre/teléfono,
  **Etiquetas**, **Vendedor**, bloque **Asistente IA** (activa → pasa a 🔴 **IA
  pausada** con "Reactivar"), **Estado de la Conversación** (Activa / Ventana 24h).
- **Footer:** *Potenciado con tecnología Altam.*

Colores: fondo/paneles oscuros del `theme` (azul profundo), acento azul `#4D82FF`,
verde WhatsApp puntual (checks, "En vivo", etiqueta), naranja para el banner de
escala, rojo tenue para "IA pausada"/"Expirada".

## Conversación animada (beats) — negocio: *Finanzas desde Cero*

Cliente: **Andrés Ramírez**. Asesora humana: **Ana Gómez**. (copy editable)

1. **Cliente:** "Hola, vi su curso de finanzas personales 👀 ¿cómo funciona?"
2. **🤖 Bot:** "¡Hola! Son 8 módulos con clases + plantillas para organizar y hacer crecer tu dinero, a tu ritmo."
3. **Cliente (duda):** "Mmm no sé… ¿de verdad vale la pena? Ya intenté organizarme antes y nada 😕"
4. **🤖 Bot (rompe la objeción):** "Te entiendo 💯 Justo por eso es paso a paso: aplicas el módulo 1 y en la primera semana ya ves orden en tus gastos. Y tienes 7 días de garantía."
5. **Cliente (decide):** "Ok, me convenciste 🙌 quiero inscribirme"
6. **[ESCALA SILENCIOSA — el cliente NO ve nada]** En el CRM aparece: banner naranja *"⚠️ Bot escaló a un asesor: cliente listo para inscribirse"* + el panel derecho cambia a 🔴 **IA pausada** + **Ana Gómez** asignada como Vendedor + la barra inferior muestra **"Bot pausado"**.
7. **👩 Ana (humana, continúa la venta sin cortar):** "¡Perfecto! ¿Qué método de pago prefieres? 😊"

Los mensajes 1–5 y 7 son burbujas normales del chat (el cliente los ve como una
conversación continua). El beat 6 NO es un mensaje al cliente: es solo el registro
interno en el CRM (banner + panel derecho). El mensaje 7 lo escribe Ana pero desde
la perspectiva del cliente parece "el negocio" respondiendo normal.

## Cómo entra la escena (transición + auto-etiquetado) — AÑADIDO

La escena arranca conectando con la Escena 1:

1. **Callback al caos:** vuelven los mensajes flotantes de la Escena 1 (WhatsApp),
   aparecen los **primeros 5**.
2. **Entramos al CRM:** esos mensajes se ordenan → entramos a la **lista** (columna
   izquierda).
3. **Auto-etiquetado:** van llegando mensajes a la lista y se etiquetan solos con
   categorías:
   - 🟢 **Interesado** — quieren comprar directo.
   - 🔵 **Soporte** — ya compraron, tienen dudas.
   - 🟠 **Asesor / Atendido** — ya los atiende un asesor.
   - 💳 **Pago tarjeta** / 💵 **Pago efectivo**.
4. **Zoom final a la conversación de Andrés** (la detallada: bot + escala
   silenciosa), como cierre de la escena.

Ref del look 100%: `reference/looks/scene3-crm-look.png`.

## Animación / timing

- Aparición escalonada de burbujas: **fade + slide** (spring `smoothSpring`), con
  **indicador "escribiendo…"** breve antes de cada mensaje entrante.
- El **banner naranja** aparece justo después del mensaje 5 (decisión de compra).
- El **panel derecho** hace un pequeño **destello/highlight** al cambiar a "IA
  pausada" + asignar a Ana (para que el ojo lo note).
- La barra inferior cambia a **"Bot pausado"** en el mismo momento.
- Posible **leve zoom/acento** al banner de escala (es el momento clave), sin
  perder de vista las 3 columnas.
- Fondo con el glow que respira (reuso de `Background`).

## Arquitectura / archivos

- Reescribir `src/scenes/Conversation.tsx` (hoy usa `InboxScreen` claro) como una
  recreación **custom oscura**. Extraer subcomponentes para mantener archivos
  enfocados: `ConvTopBar`, `ConvList` (+ `ConvListItem`), `ConvChat` (+ `ChatBubble`,
  `EscalationBanner`, `TypingRow`, `ChatInputBar`), `ContactInfo`. Pueden vivir en
  `src/scenes/conversation/` para no inflar un solo archivo.
- Datos de la conversación (beats con `at`, texto, autor) en un módulo aparte
  (`conversation/messages.ts`) para animar por frame, estilo `USER_MSGS` de BotSetup.
- Reusar `theme.ts`, `Background`, `smoothSpring`, fuente Inter.

## Fuera de alcance (por ahora)

- Interactividad real / scroll de la lista.
- Métricas/embudo.
- Sonido (se define después, como en la Escena 2).

## Validación

- `remotion still` en frames clave: pantalla montada (estática), cada beat, el
  momento de la escala (banner + IA pausada), y el cierre con Ana.
- Verificar contra `public/chat CRM.jpeg` que el layout/estética coinciden.
