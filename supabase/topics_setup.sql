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

-- ─── Seed: English topics (for native Spanish speakers learning English) ────

insert into public.topics (slug, title, description, language, level, position, content)
values
  (
    'greetings-and-introductions',
    'Greetings and Introductions',
    'Learn how to greet people and introduce yourself in everyday situations.',
    'EN',
    'BEGINNER',
    1,
    $${
      "sections": [
        {
          "title": "Basic greetings",
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
          "title": "Introducing yourself",
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
        }
      ]
    }$$::jsonb
  ),
  (
    'ordering-at-a-restaurant',
    'Ordering at a Restaurant',
    'Order food and drinks, ask about the menu, and pay the bill.',
    'EN',
    'INTERMEDIATE',
    2,
    $${
      "sections": [
        {
          "title": "Getting a table",
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
          "title": "Ordering food",
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
    3,
    $${
      "sections": [
        {
          "title": "Talking about your experience",
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
    'saludos-y-presentaciones',
    'Saludos y presentaciones',
    'Aprende a saludar y presentarte en distintas situaciones del día a día.',
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
        }
      ]
    }$$::jsonb
  ),
  (
    'en-el-restaurante',
    'En el restaurante',
    'Pide comida y bebidas, pregunta por el menú y paga la cuenta.',
    'ES',
    'INTERMEDIATE',
    2,
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
