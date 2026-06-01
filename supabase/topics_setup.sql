-- RLS + seed data for the `topics` table.
--
-- Apply once after `npx prisma db push` creates the table:
--   psql $DATABASE_URL -f supabase/topics_setup.sql
-- or paste in the Supabase SQL Editor.
--
-- Idempotent: dropping/recreating the policy and using ON CONFLICT on the
-- seed inserts lets you re-run this safely.

-- ─── Row Level Security ─────────────────────────────────────────────────────

alter table public.topics enable row level security;

drop policy if exists "Authenticated users can read topics" on public.topics;

create policy "Authenticated users can read topics"
on public.topics
for select
to authenticated
using (true);

-- ─── Remove pre-split combined topics ──────────────────────────────────────
-- Old topics that bundled multiple study units into one entry. The new
-- per-topic structure splits them apart (greetings vs introductions, etc.).
delete from public.topics
where slug in (
  'greetings-and-introductions',
  'saludos-y-presentaciones',
  'ordering-at-a-restaurant',
  'en-el-restaurante'
);

-- ─── Seed: English topics (for native Spanish speakers learning English) ────

insert into public.topics (slug, title, description, language, level, position, content)
values
  (
    'greetings',
    'Greetings',
    'Learn how to greet people in everyday English situations.',
    'EN',
    'BEGINNER',
    1,
    $${
      "sections": [
        {
          "title": "Saludos básicos",
          "intro": "These are the most common ways to greet someone in English. Pay attention to how casual or formal each one feels.",
          "vocabulary": [
            { "term": "Hi", "translation": "Hola (informal)" },
            { "term": "Hello", "translation": "Hola (neutro)" },
            { "term": "Good morning", "translation": "Buenos días" },
            { "term": "Good afternoon", "translation": "Buenas tardes" },
            { "term": "Good evening", "translation": "Buenas noches (al llegar)" }
          ],
          "dialogue": [
            { "speaker": "A", "text": "Hi, how are you?" },
            { "speaker": "B", "text": "I'm good, thanks. And you?" },
            { "speaker": "A", "text": "Pretty good." }
          ],
          "practicePhrases": [
            "Hi, how are you?",
            "Good morning, nice to see you.",
            "I'm doing well, thank you."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a dos hablantes nativos saludándose y repetir las frases.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba un saludo natural usando lo que aprendiste. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Saluda a alguien y pregúntale cómo está. Usa los saludos que aprendiste."
        },
        {
          "title": "Conectar",
          "intro": "Practica el saludo con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'introductions',
    'Introductions',
    'Introduce yourself in English: name, origin, a little about you.',
    'EN',
    'BEGINNER',
    2,
    $${
      "sections": [
        {
          "title": "Presentándote",
          "intro": "Once you've said hello, the next step is usually to share your name and a little about yourself.",
          "vocabulary": [
            { "term": "My name is...", "translation": "Me llamo..." },
            { "term": "I'm from...", "translation": "Soy de..." },
            { "term": "Nice to meet you", "translation": "Encantado/a de conocerte" },
            { "term": "What about you?", "translation": "¿Y tú?" }
          ],
          "dialogue": [
            { "speaker": "A", "text": "Hi, my name is Sarah." },
            { "speaker": "B", "text": "Nice to meet you, Sarah. I'm Diego." },
            { "speaker": "A", "text": "Where are you from?" },
            { "speaker": "B", "text": "I'm from Madrid. What about you?" }
          ],
          "practicePhrases": [
            "Hi, my name is [your name].",
            "I'm from [your city].",
            "Nice to meet you."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a dos personas presentándose y repetir las frases.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Preséntate libremente. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Preséntate a un extraño en 30 segundos. Di tu nombre, de dónde eres y algo breve sobre ti."
        },
        {
          "title": "Conectar",
          "intro": "Preséntate a otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'getting-a-table',
    'Getting a Table',
    'Walk into a restaurant, mention your reservation (or lack of it), and get seated.',
    'EN',
    'INTERMEDIATE',
    3,
    $${
      "sections": [
        {
          "title": "Conseguir una mesa",
          "intro": "These phrases will help you walk into a restaurant and get seated.",
          "vocabulary": [
            { "term": "A table for two, please", "translation": "Una mesa para dos, por favor" },
            { "term": "Do you have a reservation?", "translation": "¿Tienen reserva?" },
            { "term": "Inside or outside?", "translation": "¿Adentro o afuera?" }
          ],
          "dialogue": [
            { "speaker": "Host", "text": "Hi there! Do you have a reservation?" },
            { "speaker": "Guest", "text": "No, we don't. Do you have a table for two?" },
            { "speaker": "Host", "text": "Sure, follow me. Inside or outside?" },
            { "speaker": "Guest", "text": "Outside, please." }
          ],
          "practicePhrases": [
            "A table for two, please.",
            "We don't have a reservation.",
            "Outside, please."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a un cliente y un host en una entrada típica de restaurante.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba cómo entrarías a un restaurante. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Entras a un restaurante con un amigo. Saluda al host, di si tienes reserva, pide una mesa y elige dónde sentarte."
        },
        {
          "title": "Conectar",
          "intro": "Practica la escena con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'ordering-food',
    'Ordering Food',
    'Ask for the menu, order politely, and pay the bill in English.',
    'EN',
    'INTERMEDIATE',
    4,
    $${
      "sections": [
        {
          "title": "Pedir comida",
          "intro": "How to ask for what you want — politely.",
          "vocabulary": [
            { "term": "I'll have...", "translation": "Tomaré..." },
            { "term": "Could I get...?", "translation": "¿Podría pedir...?" },
            { "term": "What do you recommend?", "translation": "¿Qué recomienda?" },
            { "term": "The bill, please", "translation": "La cuenta, por favor" }
          ],
          "dialogue": [
            { "speaker": "Server", "text": "Are you ready to order?" },
            { "speaker": "Guest", "text": "Yes. What do you recommend?" },
            { "speaker": "Server", "text": "The grilled salmon is excellent." },
            { "speaker": "Guest", "text": "Great, I'll have that. And a glass of water, please." }
          ],
          "practicePhrases": [
            "Could I get the menu, please?",
            "I'll have the [dish name].",
            "The bill, please."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a un cliente y un camarero durante un pedido típico.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba cómo pedirías tu plato. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "El camarero llega a tu mesa. Pídele recomendaciones, ordena un plato y una bebida, y al final pide la cuenta."
        },
        {
          "title": "Conectar",
          "intro": "Practica la escena con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'job-interview-basics',
    'Job Interview Basics',
    'Talk about your experience, answer common questions, and ask smart ones.',
    'EN',
    'ADVANCED',
    5,
    $${
      "sections": [
        {
          "title": "Hablar de tu experiencia",
          "intro": "Interviewers will ask you to walk them through your background. Keep it concise and relevant.",
          "vocabulary": [
            { "term": "I've been working as...", "translation": "He estado trabajando como..." },
            { "term": "I led a team of...", "translation": "Lideré un equipo de..." },
            { "term": "I'm responsible for...", "translation": "Soy responsable de..." },
            { "term": "I specialise in...", "translation": "Me especializo en..." }
          ],
          "dialogue": [
            { "speaker": "Interviewer", "text": "Tell me a bit about yourself." },
            { "speaker": "You", "text": "Sure. I've been working as a backend engineer for five years, mostly with Node.js and Postgres. At my current company, I lead a team of three." },
            { "speaker": "Interviewer", "text": "What kind of projects?" },
            { "speaker": "You", "text": "Mostly real-time systems — chat, notifications, that kind of thing." }
          ],
          "practicePhrases": [
            "I've been working as a [role] for [number] years.",
            "I specialise in [field].",
            "I'm currently responsible for [task]."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver una entrevista corta con dos hablantes nativos.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba tu respuesta a 'Tell me about yourself'. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "El entrevistador te dice: 'Tell me a bit about yourself.' Cuenta tu rol, años de experiencia, especialidad y un proyecto reciente."
        },
        {
          "title": "Conectar",
          "intro": "Simula la entrevista con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  language = excluded.language,
  level = excluded.level,
  position = excluded.position,
  content = excluded.content,
  updated_at = now();

-- ─── Seed: Spanish topics (for English speakers learning Spanish) ──────────

insert into public.topics (slug, title, description, language, level, position, content)
values
  (
    'saludos',
    'Saludos',
    'Aprende a saludar en distintas situaciones del día a día en español.',
    'ES',
    'BEGINNER',
    1,
    $${
      "sections": [
        {
          "title": "Saludos básicos",
          "intro": "Estos son los saludos más comunes en español. Fíjate en cuán formal o informal suena cada uno.",
          "vocabulary": [
            { "term": "Hola", "translation": "Hi" },
            { "term": "Buenos días", "translation": "Good morning" },
            { "term": "Buenas tardes", "translation": "Good afternoon" },
            { "term": "¿Cómo estás?", "translation": "How are you? (informal)" },
            { "term": "¿Cómo está usted?", "translation": "How are you? (formal)" }
          ],
          "dialogue": [
            { "speaker": "A", "text": "¡Hola! ¿Cómo estás?" },
            { "speaker": "B", "text": "Bien, gracias. ¿Y tú?" },
            { "speaker": "A", "text": "Muy bien también." }
          ],
          "practicePhrases": [
            "Hola, ¿cómo estás?",
            "Buenos días.",
            "Estoy bien, gracias."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a dos hablantes nativos saludándose y repetir las frases.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba un saludo natural usando lo que aprendiste. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Saluda a alguien y pregúntale cómo está. Usa los saludos que aprendiste."
        },
        {
          "title": "Conectar",
          "intro": "Practica el saludo con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'presentaciones',
    'Presentaciones',
    'Aprende a presentarte en español: nombre, origen y un poco sobre ti.',
    'ES',
    'BEGINNER',
    2,
    $${
      "sections": [
        {
          "title": "Presentarse",
          "intro": "Cómo decir tu nombre, de dónde eres y a qué te dedicas.",
          "vocabulary": [
            { "term": "Me llamo...", "translation": "My name is..." },
            { "term": "Soy de...", "translation": "I'm from..." },
            { "term": "Mucho gusto", "translation": "Nice to meet you" },
            { "term": "¿Y tú?", "translation": "And you?" }
          ],
          "dialogue": [
            { "speaker": "A", "text": "Hola, me llamo Sara." },
            { "speaker": "B", "text": "Mucho gusto, Sara. Yo soy Diego." },
            { "speaker": "A", "text": "¿De dónde eres?" },
            { "speaker": "B", "text": "Soy de Madrid. ¿Y tú?" }
          ],
          "practicePhrases": [
            "Hola, me llamo [tu nombre].",
            "Soy de [tu ciudad].",
            "Mucho gusto."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a dos personas presentándose y repetir las frases.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Preséntate libremente. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Preséntate a un extraño en 30 segundos. Di tu nombre, de dónde eres y algo breve sobre ti."
        },
        {
          "title": "Conectar",
          "intro": "Preséntate a otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'conseguir-mesa',
    'Conseguir una mesa',
    'Entrar en un restaurante en español: reserva, mesa, dónde sentarte.',
    'ES',
    'INTERMEDIATE',
    3,
    $${
      "sections": [
        {
          "title": "Conseguir una mesa",
          "intro": "Lo que necesitas para entrar y sentarte.",
          "vocabulary": [
            { "term": "Una mesa para dos, por favor", "translation": "A table for two, please" },
            { "term": "¿Tienen reserva?", "translation": "Do you have a reservation?" },
            { "term": "Adentro o en la terraza", "translation": "Inside or on the terrace" }
          ],
          "dialogue": [
            { "speaker": "Anfitrión", "text": "¡Hola! ¿Tienen reserva?" },
            { "speaker": "Cliente", "text": "No, no tenemos. ¿Hay mesa para dos?" },
            { "speaker": "Anfitrión", "text": "Sí, claro. ¿Adentro o en la terraza?" },
            { "speaker": "Cliente", "text": "En la terraza, por favor." }
          ],
          "practicePhrases": [
            "Una mesa para dos, por favor.",
            "No tenemos reserva.",
            "En la terraza, por favor."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a un cliente y un anfitrión en la entrada de un restaurante.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba cómo entrarías a un restaurante. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "Entras a un restaurante con un amigo. Saluda al anfitrión, di si tienes reserva, pide una mesa y elige dónde sentarte."
        },
        {
          "title": "Conectar",
          "intro": "Practica la escena con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  ),
  (
    'pedir-comida',
    'Pedir comida',
    'Pide en español: menú, plato, bebida y la cuenta.',
    'ES',
    'INTERMEDIATE',
    4,
    $${
      "sections": [
        {
          "title": "Pedir la comida",
          "intro": "Cómo pedir educadamente.",
          "vocabulary": [
            { "term": "Voy a pedir...", "translation": "I'll have..." },
            { "term": "¿Qué me recomienda?", "translation": "What do you recommend?" },
            { "term": "La cuenta, por favor", "translation": "The bill, please" }
          ],
          "dialogue": [
            { "speaker": "Camarero", "text": "¿Listos para pedir?" },
            { "speaker": "Cliente", "text": "Sí. ¿Qué me recomienda?" },
            { "speaker": "Camarero", "text": "El salmón a la parrilla está muy bueno." },
            { "speaker": "Cliente", "text": "Perfecto, voy a pedirlo. Y un vaso de agua, por favor." }
          ],
          "practicePhrases": [
            "¿Me trae el menú, por favor?",
            "Voy a pedir el [plato].",
            "La cuenta, por favor."
          ]
        },
        {
          "title": "Video y shadowing",
          "intro": "Ver a un cliente y un camarero durante un pedido típico.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "video"
        },
        {
          "title": "Pon en práctica",
          "intro": "Graba cómo pedirías tu plato. La IA te dará feedback.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "freeRecordingPrompt": "El camarero llega a tu mesa. Pídele recomendaciones, ordena un plato y una bebida, y al final pide la cuenta."
        },
        {
          "title": "Conectar",
          "intro": "Practica la escena con otro usuario en vivo.",
          "vocabulary": [],
          "dialogue": [],
          "practicePhrases": [],
          "comingSoon": "tandem"
        }
      ]
    }$$::jsonb
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  language = excluded.language,
  level = excluded.level,
  position = excluded.position,
  content = excluded.content,
  updated_at = now();
