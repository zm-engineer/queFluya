# queFluya — Visión y contexto

## Qué es queFluya

App web (luego móvil) de intercambio de idiomas **inglés ↔ español**. Objetivo: que la gente pierda el miedo a hablar desde el primer uso. Slogan: *"Menos teoría, más práctica, ¡que fluya!"*.

## Estructura del aprendizaje

**Niveles → temas cotidianos → 4 secciones por tema.** Estas 4 secciones son la promesa del producto:

1. **Frases + gramática.** Repetición en voz alta. Práctica con reconocimiento de voz, análisis word-level vs frase esperada, score. **Implementado** (sin gating de completar — botón libre).
2. **Video + repetición.** Ver a dos hablantes nativos en contexto, después repetir frases del video. **Pendiente** — decisión abierta entre AI avatars (HeyGen), DIY grabado, o personajes ilustrados con TTS.
3. **Grabación libre con IA.** Grabar libremente → Whisper transcribe → Claude corrige → ElevenLabs genera audio corregido con la **voz clonada del propio usuario**. **Función estrella, sin empezar.** Coste real por uso, requiere consentimiento GDPR.
4. **Conectar.** Tándem 1:1 (5 min EN + 5 min ES) con reservas y ayuda en vivo, y chat grupal hasta 5 personas (monolingüe). **Sin empezar — fase más grande.** Necesita WebRTC + LiveKit/Agora + Socket.io.

## Dónde estamos hoy

Funcionando end-to-end:
- Auth completo (registro, login, recuperación de contraseña, reset).
- Onboarding de perfil (username, idioma nativo, nivel).
- Dashboard con topics filtrados por idioma del usuario y emojis por slug.
- Páginas de tema con **lesson player una sección a la vez**: stepper con check/locked, completado persistido en DB entre sesiones.
- Decks dinámicos por sección: `VocabularyDeck` (flashcard con reveal + TTS por palabra), `PhraseDeck` (PracticeCard una a una, gate de practicar antes de avanzar), `DialogueViewer` (TTS por línea con highlight).
- Práctica gratis con Web Speech API: graba, transcribe, alinea palabras Wagner-Fischer, score, guarda intento.
- Sistema de diseño propio "playful + rounded" (ver abajo).
- 60+ tests (Vitest + Playwright) en lógica pura y flujos críticos.

## Lo que falta — orden recomendado

1. **Gate real de "completar sección"** basado en haber practicado todas las frases del PhraseDeck. Hoy es botón libre.
2. **Decidir sección 2 — Video.** AI avatars vs DIY vs ilustrado. Validar con 1-2 videos demo antes de escalar.
3. **C v2 — Sección 3 paga.** Whisper + Claude + ElevenLabs. Coste real, requiere planificación de límites y cacheo.
4. **Historial de grabaciones / página de perfil.** Las filas ya se guardan, falta UI que las lea.
5. **Gamificación real:** racha (hoy placeholder "🔥 0 días"), XP, badges.
6. **Sección 4 — Conectar.** Tándem + chat grupal. La más grande con diferencia.

## Stack tecnológico

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 (`@tailwindcss/postcss`)
- **DB + Auth + Storage:** Supabase (PostgreSQL)
- **ORM:** Prisma — schema canónico en `prisma/schema.prisma`
- **Tests:** Vitest (unitarios + componentes) + Playwright (e2e)
- **IA/voz:** OpenAI (Whisper para transcripción, GPT-4o-mini para correcciones de gramática, TTS para voces). ElevenLabs reservado para voice cloning (sección 3 ampliada)
- **Tiempo real (sección 4):** WebRTC + LiveKit/Agora, Socket.io
- **Hosting:** Vercel (todavía no desplegado, dev local)

## Sistema de diseño "playful"

Estética friendly, gamificada, motivacional. Inspirada en apps de aprendizaje modernas sin copiar a ninguna en particular.

- **Tipografía:** Nunito en todos los pesos. Headings en `font-black` (900). El alias `font-serif` apunta a Nunito también para compatibilidad con código legacy.
- **Fondo de página:** `bg-stone-50` simple.
- **Tarjetas:** `bg-white border-2 border-stone-100 rounded-3xl` con padding generoso (`p-6` / `p-8`).
- **Acento principal:** emerald-500 brillante. Hover/pressed pasan por emerald-400 / emerald-700.
- **Botones primarios:** componente `<Button variant="primary">` — `border-b-4 border-emerald-700` con `active:translate-y-1 active:border-b-0` → sensación 3D pressable.
- **Botón de peligro:** `<Button variant="danger">` con inline-style hex (`#dc2626`) porque Tailwind v4 dev falla a generar `bg-red-*` en ramas condicionales. Documentado en memoria.
- **Inputs:** componente `<Input>` — `rounded-2xl`, `border-2`, ring emerald al focus.
- **Iconografía:** emojis grandes mientras no haya assets propios (📖 vocabulario, 💬 diálogo, 🎤 práctica, 🔥 racha, 🌱🌿🌳 niveles).
- **Espaciado:** generoso. Bordes redondeados grandes.
- **Primitivos compartidos:** `components/ui/`. Decks de lección: `components/topic/`.

## Modelo de datos

Schema canónico: `prisma/schema.prisma`. Resumen:

- **`Profile`** — 1-1 con `auth.users` de Supabase. Username único, idioma nativo, idioma objetivo, nivel.
- **`Topic`** — slug, título, descripción, idioma practicado, nivel, JSON `content` con array de secciones.
- **`TopicProgress`** — una fila por `(profile, topic_slug, section)`. `section` es 1-indexed. `completed_at` nullable indica si terminó.
- **`Recording`** — cada intento de práctica. Guarda transcripción + score. `original_url` nullable (audio reservado para C v2).

IDs son `uuid`. RLS activado en todas las tablas con datos de usuario; políticas idempotentes en `supabase/*_setup.sql`.

## Sobre el desarrollador

Viene de **Vue y Laravel**, está **aprendiendo React/Next.js**. Al generar o modificar código:

- Explica el "porqué" de las decisiones, no solo el "qué".
- Cuando sea útil, compara conceptos con sus equivalentes en Vue/Laravel (ej: Server Components ≈ Blade renderizado en server; `useEffect` ≈ `mounted()` o watchers; Route Handlers ≈ controllers de Laravel; middleware Next ≈ middleware Laravel).
- Prefiere entender antes que avanzar rápido. Paso a paso, verificando cada paso.
- Marca claramente qué comandos debe ejecutar él vs qué archivos vas a tocar tú.

## Convenciones de código

- **TypeScript estricto.** Tipar todo; evitar `any`.
- **App Router:** Server Components por defecto; `"use client"` solo cuando haya interactividad (estado, eventos, hooks de navegador, decks dinámicos).
- **Supabase:** `lib/supabase/server.ts` en Server Components / Route Handlers / middleware; `lib/supabase/client.ts` solo en componentes cliente. Nunca exponer `DATABASE_URL` ni service keys al navegador.
- **TDD donde aporta:** lógica pura sí (`lib/practice/diff.ts`, `lib/topic-progress.ts`, `lib/topics.ts`). UI visual no — el coste/beneficio no compensa.
- **Commits:** convencional (`feat:`, `fix:`, `chore:`, `refactor:`, con `(scope)` cuando ayuda). Branches `feature/<nombre>`, merge a `develop` con `--no-ff`. `develop` → `main` cuando hay release.
- **RLS de Supabase:** cada tabla nueva con datos por usuario requiere `supabase/<tabla>_setup.sql` con políticas idempotentes (`drop policy if exists` antes de `create policy`).
- **Secretos:** nunca en código ni commits. `.env.local` está en `.gitignore`.

## Notas y precauciones

- **Coste de IA:** Whisper/Claude/ElevenLabs son por uso. La clonación de voz es la más cara. Diseñar límites y cacheo cuando lleguemos a sección 3.
- **Privacidad de voz:** la clonación requiere consentimiento explícito + almacenamiento seguro (GDPR).
- **Empezar simple, escalar cuando duela.** Nada de microservicios, colas ni optimizaciones prematuras.
- **MVP disciplinado:** una sección excelente vale más que cuatro mediocres. Flujo end-to-end antes que pulido.

## Cómo trabajar conmigo

Antes de cambios grandes, explica el plan brevemente y espera mi OK. Para cada tarea: di qué archivos vas a tocar, hazlo, y al terminar resume qué cambió y cómo lo pruebo. Si algo requiere que yo ejecute comandos o configure algo externo (Supabase, claves, .env), indícalo claramente. **Sé honesto con estimaciones** — si algo te va a costar 4 sesiones, dilo, no lo escondas. Mejor saber el costo real que llevarte una sorpresa.
