import type { EssentialSet } from './types'

// Web-developer job-interview practice (EN target, ES helper). Two sets under the
// `interview` kind: technical/HR VOCABULARY, and ready-to-say PHRASES. Written
// for a candidate with ~6 years of Laravel (PHP) and ~4 years of Vue.js. All
// items are INTERMEDIATE — the practice screen shows the whole list (no level
// tabs), and each word/phrase has its own 🔊.
//
// Personal to the author's profile; easy to hide later (drop it from
// ESSENTIAL_SETS) or generalise for other users.

// ── Vocabulary: technical + interview terms ───────────────────────────────────
const interviewVocabEn: EssentialSet = {
  slug: 'interview-vocab-en',
  kind: 'interview',
  language: 'EN',
  title: 'Entrevista: vocabulario',
  subtitle: 'Términos técnicos y de RR. HH. para tu entrevista.',
  items: [
    { term: 'background', level: 'INTERMEDIATE', translation: 'formación / trayectoria', examples: [{ text: 'My background is in backend development.', highlight: 'background', translation: 'Mi trayectoria es en desarrollo backend.' }] },
    { term: 'experience', level: 'INTERMEDIATE', translation: 'experiencia', examples: [{ text: 'I have six years of experience with Laravel.', highlight: 'experience', translation: 'Tengo seis años de experiencia con Laravel.' }] },
    { term: 'skill set', level: 'INTERMEDIATE', translation: 'conjunto de habilidades', examples: [{ text: 'My skill set covers both frontend and backend.', highlight: 'skill set', translation: 'Mis habilidades cubren tanto frontend como backend.' }] },
    { term: 'strength', level: 'INTERMEDIATE', translation: 'punto fuerte', examples: [{ text: 'My greatest strength is writing clean code.', highlight: 'strength', translation: 'Mi mayor punto fuerte es escribir código limpio.' }] },
    { term: 'weakness', level: 'INTERMEDIATE', translation: 'punto débil', examples: [{ text: 'One weakness I am working on is delegating more.', highlight: 'weakness', translation: 'Un punto débil que estoy mejorando es delegar más.' }] },
    { term: 'framework', level: 'INTERMEDIATE', translation: 'framework / marco de trabajo', examples: [{ text: 'Laravel is my main backend framework.', highlight: 'framework', translation: 'Laravel es mi principal framework de backend.' }] },
    { term: 'backend', level: 'INTERMEDIATE', translation: 'backend / lado del servidor', examples: [{ text: 'I mostly work on the backend.', highlight: 'backend', translation: 'Trabajo sobre todo en el backend.' }] },
    { term: 'frontend', level: 'INTERMEDIATE', translation: 'frontend / lado del cliente', examples: [{ text: 'I build the frontend with Vue.js.', highlight: 'frontend', translation: 'Construyo el frontend con Vue.js.' }] },
    { term: 'full-stack', level: 'INTERMEDIATE', translation: 'full-stack (front + back)', examples: [{ text: 'I am a full-stack developer.', highlight: 'full-stack', translation: 'Soy desarrolladora full-stack.' }] },
    { term: 'codebase', level: 'INTERMEDIATE', translation: 'base de código', examples: [{ text: 'I keep the codebase clean and well organised.', highlight: 'codebase', translation: 'Mantengo la base de código limpia y bien organizada.' }] },
    { term: 'deployment', level: 'INTERMEDIATE', translation: 'despliegue / puesta en producción', examples: [{ text: 'We automated the deployment process.', highlight: 'deployment', translation: 'Automatizamos el proceso de despliegue.' }] },
    { term: 'code review', level: 'INTERMEDIATE', translation: 'revisión de código', examples: [{ text: 'I give and receive code reviews every week.', highlight: 'code reviews', translation: 'Doy y recibo revisiones de código cada semana.' }] },
    { term: 'unit test', level: 'INTERMEDIATE', translation: 'prueba unitaria', examples: [{ text: 'I write unit tests for critical features.', highlight: 'unit tests', translation: 'Escribo pruebas unitarias para las funciones críticas.' }] },
    { term: 'debugging', level: 'INTERMEDIATE', translation: 'depuración / corregir errores', examples: [{ text: 'Debugging is one of my strongest skills.', highlight: 'Debugging', translation: 'La depuración es una de mis mejores habilidades.' }] },
    { term: 'to refactor', level: 'INTERMEDIATE', translation: 'refactorizar / reestructurar', examples: [{ text: 'I refactor code to make it easier to maintain.', highlight: 'refactor', translation: 'Refactorizo el código para que sea más fácil de mantener.' }] },
    { term: 'scalable', level: 'INTERMEDIATE', translation: 'escalable', examples: [{ text: 'I design scalable applications.', highlight: 'scalable', translation: 'Diseño aplicaciones escalables.' }] },
    { term: 'maintainable', level: 'INTERMEDIATE', translation: 'mantenible', examples: [{ text: 'Clean code is easier to maintain.', highlight: 'maintain', translation: 'El código limpio es más fácil de mantener.' }] },
    { term: 'database', level: 'INTERMEDIATE', translation: 'base de datos', examples: [{ text: 'I design the database schema.', highlight: 'database', translation: 'Diseño el esquema de la base de datos.' }] },
    { term: 'query', level: 'INTERMEDIATE', translation: 'consulta (a la base de datos)', examples: [{ text: 'I optimise slow database queries.', highlight: 'queries', translation: 'Optimizo las consultas lentas a la base de datos.' }] },
    { term: 'migration', level: 'INTERMEDIATE', translation: 'migración (de base de datos)', examples: [{ text: 'I use migrations to change the database.', highlight: 'migrations', translation: 'Uso migraciones para cambiar la base de datos.' }] },
    { term: 'API', level: 'INTERMEDIATE', translation: 'API / interfaz de programación', examples: [{ text: 'I build REST APIs with Laravel.', highlight: 'APIs', translation: 'Construyo APIs REST con Laravel.' }] },
    { term: 'endpoint', level: 'INTERMEDIATE', translation: 'endpoint / punto de acceso', examples: [{ text: 'Each endpoint returns JSON.', highlight: 'endpoint', translation: 'Cada endpoint devuelve JSON.' }] },
    { term: 'version control', level: 'INTERMEDIATE', translation: 'control de versiones', examples: [{ text: 'We use Git for version control.', highlight: 'version control', translation: 'Usamos Git para el control de versiones.' }] },
    { term: 'pull request', level: 'INTERMEDIATE', translation: 'solicitud de incorporación de cambios', examples: [{ text: 'I open a pull request for every feature.', highlight: 'pull request', translation: 'Abro un pull request por cada funcionalidad.' }] },
    { term: 'merge conflict', level: 'INTERMEDIATE', translation: 'conflicto de fusión', examples: [{ text: 'I resolved the merge conflict carefully.', highlight: 'merge conflict', translation: 'Resolví el conflicto de fusión con cuidado.' }] },
    { term: 'deadline', level: 'INTERMEDIATE', translation: 'fecha límite / plazo', examples: [{ text: 'I always meet my deadlines.', highlight: 'deadlines', translation: 'Siempre cumplo mis plazos.' }] },
    { term: 'requirement', level: 'INTERMEDIATE', translation: 'requisito', examples: [{ text: 'I gather the requirements before I start coding.', highlight: 'requirements', translation: 'Recojo los requisitos antes de empezar a programar.' }] },
    { term: 'stakeholder', level: 'INTERMEDIATE', translation: 'parte interesada / interlocutor', examples: [{ text: 'I communicate progress to stakeholders.', highlight: 'stakeholders', translation: 'Comunico el progreso a las partes interesadas.' }] },
    { term: 'sprint', level: 'INTERMEDIATE', translation: 'sprint (ciclo de trabajo)', examples: [{ text: 'We plan our work in two-week sprints.', highlight: 'sprints', translation: 'Planificamos el trabajo en sprints de dos semanas.' }] },
    { term: 'stand-up', level: 'INTERMEDIATE', translation: 'reunión diaria (de pie)', examples: [{ text: 'We have a daily stand-up every morning.', highlight: 'stand-up', translation: 'Tenemos una reunión diaria cada mañana.' }] },
    { term: 'agile', level: 'INTERMEDIATE', translation: 'ágil (metodología)', examples: [{ text: 'I am used to working in an agile team.', highlight: 'agile', translation: 'Estoy acostumbrada a trabajar en un equipo ágil.' }] },
    { term: 'team player', level: 'INTERMEDIATE', translation: 'buena para el trabajo en equipo', examples: [{ text: 'I am a reliable team player.', highlight: 'team player', translation: 'Soy una compañera de equipo fiable.' }] },
    { term: 'to troubleshoot', level: 'INTERMEDIATE', translation: 'diagnosticar y resolver problemas', examples: [{ text: 'I can troubleshoot production issues quickly.', highlight: 'troubleshoot', translation: 'Puedo diagnosticar problemas en producción rápidamente.' }] },
    { term: 'performance', level: 'INTERMEDIATE', translation: 'rendimiento', examples: [{ text: 'I improved the app performance a lot.', highlight: 'performance', translation: 'Mejoré mucho el rendimiento de la aplicación.' }] },
    { term: 'legacy code', level: 'INTERMEDIATE', translation: 'código heredado / antiguo', examples: [{ text: 'I am comfortable working with legacy code.', highlight: 'legacy code', translation: 'Me siento cómoda trabajando con código heredado.' }] },
    { term: 'responsive design', level: 'INTERMEDIATE', translation: 'diseño adaptable', examples: [{ text: 'I build responsive designs for mobile and desktop.', highlight: 'responsive designs', translation: 'Hago diseños adaptables para móvil y escritorio.' }] },
    { term: 'authentication', level: 'INTERMEDIATE', translation: 'autenticación', examples: [{ text: 'I implemented user authentication.', highlight: 'authentication', translation: 'Implementé la autenticación de usuarios.' }] },
    { term: 'to mentor', level: 'INTERMEDIATE', translation: 'guiar / ser mentora', examples: [{ text: 'I mentor junior developers on the team.', highlight: 'mentor', translation: 'Guío a los desarrolladores junior del equipo.' }] },
    { term: 'workflow', level: 'INTERMEDIATE', translation: 'flujo de trabajo', examples: [{ text: 'I improved the team workflow.', highlight: 'workflow', translation: 'Mejoré el flujo de trabajo del equipo.' }] },
    { term: 'feature', level: 'INTERMEDIATE', translation: 'funcionalidad', examples: [{ text: 'I shipped several new features last quarter.', highlight: 'features', translation: 'Lancé varias funcionalidades nuevas el último trimestre.' }] },
  ],
}

// ── Phrases: ready to say out loud ────────────────────────────────────────────
// Term = the phrase you practise saying; examples = alternative ways to say it.
const interviewPhrasesEn: EssentialSet = {
  slug: 'interview-phrases-en',
  kind: 'interview',
  language: 'EN',
  title: 'Entrevista: frases',
  subtitle: 'Frases listas para decir en tu entrevista.',
  items: [
    // Introducing yourself
    { term: 'I am a full-stack web developer.', level: 'INTERMEDIATE', translation: 'Soy desarrolladora web full-stack.', examples: [
      { text: 'I work across both the frontend and the backend.', translation: 'Trabajo tanto en el frontend como en el backend.' },
      { text: 'My main languages are PHP and JavaScript.', translation: 'Mis lenguajes principales son PHP y JavaScript.' },
    ] },
    { term: 'I have six years of experience with Laravel.', level: 'INTERMEDIATE', translation: 'Tengo seis años de experiencia con Laravel.', examples: [
      { text: 'I also have four years of experience with Vue.js.', translation: 'También tengo cuatro años de experiencia con Vue.js.' },
      { text: 'I have been building web applications for six years.', translation: 'Llevo seis años construyendo aplicaciones web.' },
    ] },
    { term: 'Thank you for inviting me to this interview.', level: 'INTERMEDIATE', translation: 'Gracias por invitarme a esta entrevista.', examples: [
      { text: 'It is a pleasure to be here.', translation: 'Es un placer estar aquí.' },
    ] },
    // Experience
    { term: 'In my last role, I led the backend development.', level: 'INTERMEDIATE', translation: 'En mi último puesto, dirigí el desarrollo del backend.', examples: [
      { text: 'I was responsible for the API and the database.', translation: 'Era responsable de la API y de la base de datos.' },
      { text: 'I worked closely with the frontend team.', translation: 'Trabajé estrechamente con el equipo de frontend.' },
    ] },
    { term: 'I have built and maintained large web applications.', level: 'INTERMEDIATE', translation: 'He construido y mantenido aplicaciones web grandes.', examples: [
      { text: 'Some of them served thousands of users.', translation: 'Algunas atendían a miles de usuarios.' },
    ] },
    { term: 'I am comfortable working with legacy code.', level: 'INTERMEDIATE', translation: 'Me siento cómoda trabajando con código heredado.', examples: [
      { text: 'I refactor it step by step to make it safer.', translation: 'Lo refactorizo paso a paso para hacerlo más seguro.' },
    ] },
    // Strengths
    { term: 'My biggest strength is writing clean, maintainable code.', level: 'INTERMEDIATE', translation: 'Mi mayor punto fuerte es escribir código limpio y mantenible.', examples: [
      { text: 'I care a lot about code quality.', translation: 'Me importa mucho la calidad del código.' },
      { text: 'I pay close attention to detail.', translation: 'Presto mucha atención a los detalles.' },
    ] },
    { term: 'I am good at solving complex problems.', level: 'INTERMEDIATE', translation: 'Se me da bien resolver problemas complejos.', examples: [
      { text: 'I break big problems into smaller steps.', translation: 'Divido los problemas grandes en pasos más pequeños.' },
    ] },
    { term: 'I am a fast learner and I adapt quickly.', level: 'INTERMEDIATE', translation: 'Aprendo rápido y me adapto con facilidad.', examples: [
      { text: 'I enjoy learning new technologies.', translation: 'Disfruto aprendiendo tecnologías nuevas.' },
    ] },
    // Weakness (safe)
    { term: 'Sometimes I focus too much on details.', level: 'INTERMEDIATE', translation: 'A veces me centro demasiado en los detalles.', examples: [
      { text: 'I am learning to prioritise what matters most.', translation: 'Estoy aprendiendo a priorizar lo más importante.' },
    ] },
    // Teamwork
    { term: 'I work well in a team.', level: 'INTERMEDIATE', translation: 'Trabajo bien en equipo.', examples: [
      { text: 'I communicate clearly with designers and product managers.', translation: 'Me comunico con claridad con diseñadores y product managers.' },
      { text: 'I enjoy mentoring junior developers.', translation: 'Disfruto guiando a desarrolladores junior.' },
    ] },
    { term: 'I like to help my teammates when they are stuck.', level: 'INTERMEDIATE', translation: 'Me gusta ayudar a mis compañeros cuando se atascan.', examples: [
      { text: 'I believe good communication saves a lot of time.', translation: 'Creo que una buena comunicación ahorra mucho tiempo.' },
    ] },
    // Problem-solving
    { term: 'When I face a bug, I look for the root cause first.', level: 'INTERMEDIATE', translation: 'Cuando me encuentro un error, primero busco la causa raíz.', examples: [
      { text: 'I do not just fix the symptom.', translation: 'No arreglo solo el síntoma.' },
      { text: 'I write a test so the bug does not come back.', translation: 'Escribo una prueba para que el error no vuelva.' },
    ] },
    // Why you / motivation
    { term: 'I am passionate about building great user experiences.', level: 'INTERMEDIATE', translation: 'Me apasiona crear buenas experiencias de usuario.', examples: [
      { text: 'I care about both the code and the end user.', translation: 'Me importan tanto el código como el usuario final.' },
    ] },
    { term: 'I am really interested in this position.', level: 'INTERMEDIATE', translation: 'Estoy muy interesada en este puesto.', examples: [
      { text: 'The role matches my experience very well.', translation: 'El puesto encaja muy bien con mi experiencia.' },
    ] },
    // Questions to ask the interviewer
    { term: 'What does a typical day look like on this team?', level: 'INTERMEDIATE', translation: '¿Cómo es un día típico en este equipo?', examples: [
      { text: 'I would love to understand the daily workflow.', translation: 'Me encantaría entender el flujo de trabajo diario.' },
    ] },
    { term: 'What tech stack does the team use?', level: 'INTERMEDIATE', translation: '¿Qué stack tecnológico usa el equipo?', examples: [
      { text: 'Do you use Laravel and Vue on this project?', translation: '¿Usáis Laravel y Vue en este proyecto?' },
    ] },
    { term: 'How does the team handle code reviews?', level: 'INTERMEDIATE', translation: '¿Cómo gestiona el equipo las revisiones de código?', examples: [
      { text: 'I really value feedback on my work.', translation: 'Valoro mucho recibir feedback sobre mi trabajo.' },
    ] },
    { term: 'What are the biggest challenges the team is facing?', level: 'INTERMEDIATE', translation: '¿Cuáles son los mayores retos a los que se enfrenta el equipo?', examples: [
      { text: 'I would like to know where I can add the most value.', translation: 'Me gustaría saber dónde puedo aportar más valor.' },
    ] },
    // Logistics
    { term: 'I am available to start in two weeks.', level: 'INTERMEDIATE', translation: 'Puedo empezar en dos semanas.', examples: [
      { text: 'I am open to remote or hybrid work.', translation: 'Estoy abierta a trabajo remoto o híbrido.' },
    ] },
    { term: 'My salary expectation is flexible and based on the role.', level: 'INTERMEDIATE', translation: 'Mi expectativa salarial es flexible y depende del puesto.', examples: [
      { text: 'I am looking for a role that matches my experience.', translation: 'Busco un puesto acorde a mi experiencia.' },
    ] },
    // Buying time / clarifying
    { term: 'That is a great question. Let me think for a moment.', level: 'INTERMEDIATE', translation: 'Es una buena pregunta. Déjame pensar un momento.', examples: [
      { text: 'Could you rephrase the question, please?', translation: '¿Podrías reformular la pregunta, por favor?' },
    ] },
    { term: 'Could you give me a bit more detail?', level: 'INTERMEDIATE', translation: '¿Podrías darme un poco más de detalle?', examples: [
      { text: 'I want to make sure I understand you correctly.', translation: 'Quiero asegurarme de entenderte bien.' },
    ] },
    // Closing
    { term: 'Thank you for your time today.', level: 'INTERMEDIATE', translation: 'Gracias por tu tiempo hoy.', examples: [
      { text: 'I really enjoyed our conversation.', translation: 'Disfruté mucho nuestra conversación.' },
      { text: 'I look forward to hearing from you.', translation: 'Espero tener noticias vuestras.' },
    ] },
  ],
}

// ── Concept answers: Laravel & Vue (latest versions) ─────────────────────────
// Term = a concise headline answer you can say out loud; examples = the detail
// you would add. For explaining technical concepts in the interview.
const interviewConceptsEn: EssentialSet = {
  slug: 'interview-concepts-en',
  kind: 'interview',
  language: 'EN',
  title: 'Entrevista: conceptos técnicos',
  subtitle: 'Explica conceptos de Laravel y Vue (últimas versiones).',
  items: [
    // ── Laravel ──
    { term: 'Eloquent is Laravel’s ORM for working with the database.', level: 'INTERMEDIATE', translation: 'Eloquent es el ORM de Laravel para trabajar con la base de datos.', examples: [
      { text: 'Each database table has a model that represents it.', translation: 'Cada tabla de la base de datos tiene un modelo que la representa.' },
      { text: 'It makes relationships between tables easy to define.', translation: 'Facilita definir relaciones entre tablas.' },
    ] },
    { term: 'I use eager loading to avoid the N+1 query problem.', level: 'INTERMEDIATE', translation: 'Uso eager loading para evitar el problema de las N+1 consultas.', examples: [
      { text: 'Instead of one query per record, I load the relations in advance.', translation: 'En vez de una consulta por registro, cargo las relaciones por adelantado.' },
      { text: 'It improves performance a lot on large lists.', translation: 'Mejora mucho el rendimiento en listas grandes.' },
    ] },
    { term: 'Migrations are version control for the database schema.', level: 'INTERMEDIATE', translation: 'Las migraciones son el control de versiones del esquema de la base de datos.', examples: [
      { text: 'The whole team can build the same schema from code.', translation: 'Todo el equipo puede construir el mismo esquema desde el código.' },
    ] },
    { term: 'Middleware filters an HTTP request before it reaches the controller.', level: 'INTERMEDIATE', translation: 'El middleware filtra una petición HTTP antes de que llegue al controlador.', examples: [
      { text: 'For example, I use it to check authentication.', translation: 'Por ejemplo, lo uso para comprobar la autenticación.' },
    ] },
    { term: 'The service container manages dependency injection.', level: 'INTERMEDIATE', translation: 'El service container gestiona la inyección de dependencias.', examples: [
      { text: 'Laravel resolves and injects the classes I need automatically.', translation: 'Laravel resuelve e inyecta las clases que necesito automáticamente.' },
    ] },
    { term: 'Facades give a simple static-like interface to services.', level: 'INTERMEDIATE', translation: 'Las facades dan una interfaz sencilla, tipo estática, a los servicios.', examples: [
      { text: 'Under the hood they still resolve from the container.', translation: 'Por debajo siguen resolviéndose desde el container.' },
    ] },
    { term: 'I move slow tasks to queues so they run in the background.', level: 'INTERMEDIATE', translation: 'Muevo las tareas lentas a colas para que se ejecuten en segundo plano.', examples: [
      { text: 'Sending emails is a typical queued job.', translation: 'Enviar correos es un trabajo típico en cola.' },
    ] },
    { term: 'Events and listeners help me decouple parts of the app.', level: 'INTERMEDIATE', translation: 'Los eventos y listeners me ayudan a desacoplar partes de la app.', examples: [
      { text: 'One action can trigger several independent listeners.', translation: 'Una acción puede disparar varios listeners independientes.' },
    ] },
    { term: 'Route model binding injects the model straight into the controller.', level: 'INTERMEDIATE', translation: 'El route model binding inyecta el modelo directamente en el controlador.', examples: [
      { text: 'Laravel fetches the record from the route parameter for me.', translation: 'Laravel obtiene el registro a partir del parámetro de la ruta por mí.' },
    ] },
    { term: 'I validate input with form request classes.', level: 'INTERMEDIATE', translation: 'Valido la entrada con clases de form request.', examples: [
      { text: 'It keeps validation rules out of the controller.', translation: 'Mantiene las reglas de validación fuera del controlador.' },
    ] },
    { term: 'API resources transform models into a clean JSON response.', level: 'INTERMEDIATE', translation: 'Los API resources transforman los modelos en una respuesta JSON limpia.', examples: [
      { text: 'I control exactly which fields the API returns.', translation: 'Controlo exactamente qué campos devuelve la API.' },
    ] },
    { term: 'I use Sanctum for API token authentication.', level: 'INTERMEDIATE', translation: 'Uso Sanctum para la autenticación por tokens de la API.', examples: [
      { text: 'It works well for SPAs and mobile apps.', translation: 'Funciona bien para SPAs y apps móviles.' },
    ] },
    { term: 'Laravel 11 introduced a slimmer application structure.', level: 'INTERMEDIATE', translation: 'Laravel 11 introdujo una estructura de aplicación más ligera.', examples: [
      { text: 'Configuration now lives mostly in bootstrap/app.php.', translation: 'La configuración vive ahora sobre todo en bootstrap/app.php.' },
      { text: 'There are fewer boilerplate files than in older versions.', translation: 'Hay menos archivos repetitivos que en versiones anteriores.' },
    ] },
    { term: 'Laravel 12 ships with modern starter kits.', level: 'INTERMEDIATE', translation: 'Laravel 12 viene con starter kits modernos.', examples: [
      { text: 'They include React, Vue and Livewire options out of the box.', translation: 'Incluyen opciones de React, Vue y Livewire de serie.' },
    ] },
    { term: 'I write tests with Pest and PHPUnit.', level: 'INTERMEDIATE', translation: 'Escribo tests con Pest y PHPUnit.', examples: [
      { text: 'I test the critical business logic and the API endpoints.', translation: 'Pruebo la lógica de negocio crítica y los endpoints de la API.' },
    ] },
    // ── Vue ──
    { term: 'Vue 3 uses the Composition API to organise logic by feature.', level: 'INTERMEDIATE', translation: 'Vue 3 usa la Composition API para organizar la lógica por funcionalidad.', examples: [
      { text: 'It replaces the older Options API for complex components.', translation: 'Sustituye a la antigua Options API en componentes complejos.' },
      { text: 'Related code stays together instead of being split by option.', translation: 'El código relacionado queda junto en vez de separarse por opción.' },
    ] },
    { term: 'I use script setup for cleaner single-file components.', level: 'INTERMEDIATE', translation: 'Uso script setup para componentes de un solo archivo más limpios.', examples: [
      { text: 'It removes a lot of boilerplate from the Composition API.', translation: 'Elimina mucho código repetitivo de la Composition API.' },
    ] },
    { term: 'ref wraps a single value and reactive wraps an object.', level: 'INTERMEDIATE', translation: 'ref envuelve un valor individual y reactive envuelve un objeto.', examples: [
      { text: 'I read and write a ref through its .value property.', translation: 'Leo y escribo un ref a través de su propiedad .value.' },
    ] },
    { term: 'Computed properties cache a value derived from state.', level: 'INTERMEDIATE', translation: 'Las computed properties cachean un valor derivado del estado.', examples: [
      { text: 'They only recalculate when their dependencies change.', translation: 'Solo se recalculan cuando cambian sus dependencias.' },
    ] },
    { term: 'watch runs code when a reactive value changes.', level: 'INTERMEDIATE', translation: 'watch ejecuta código cuando cambia un valor reactivo.', examples: [
      { text: 'watchEffect tracks its dependencies automatically.', translation: 'watchEffect rastrea sus dependencias automáticamente.' },
    ] },
    { term: 'I define props with defineProps and events with defineEmits.', level: 'INTERMEDIATE', translation: 'Defino props con defineProps y eventos con defineEmits.', examples: [
      { text: 'They are compiler macros, so I do not import them.', translation: 'Son macros del compilador, así que no los importo.' },
    ] },
    { term: 'In Vue 3.4, defineModel makes two-way binding much simpler.', level: 'INTERMEDIATE', translation: 'En Vue 3.4, defineModel simplifica mucho el enlace bidireccional.', examples: [
      { text: 'It replaces the old prop-plus-emit pattern for v-model.', translation: 'Sustituye el antiguo patrón de prop más emit para v-model.' },
    ] },
    { term: 'Composables are reusable functions that share reactive logic.', level: 'INTERMEDIATE', translation: 'Los composables son funciones reutilizables que comparten lógica reactiva.', examples: [
      { text: 'For example, a useFetch composable I reuse across components.', translation: 'Por ejemplo, un composable useFetch que reutilizo en varios componentes.' },
    ] },
    { term: 'Pinia is the official state management library for Vue 3.', level: 'INTERMEDIATE', translation: 'Pinia es la librería oficial de gestión de estado para Vue 3.', examples: [
      { text: 'It replaced Vuex and works great with the Composition API.', translation: 'Sustituyó a Vuex y funciona muy bien con la Composition API.' },
    ] },
    { term: 'provide and inject share data without prop drilling.', level: 'INTERMEDIATE', translation: 'provide e inject comparten datos sin pasar props por muchos niveles.', examples: [
      { text: 'A parent provides a value and any descendant can inject it.', translation: 'Un padre provee un valor y cualquier descendiente puede inyectarlo.' },
    ] },
    { term: 'Vue 3’s reactivity is built on JavaScript proxies.', level: 'INTERMEDIATE', translation: 'La reactividad de Vue 3 se basa en los proxies de JavaScript.', examples: [
      { text: 'That is why it tracks changes more reliably than Vue 2.', translation: 'Por eso rastrea los cambios de forma más fiable que Vue 2.' },
    ] },
    { term: 'Teleport renders content in a different part of the DOM.', level: 'INTERMEDIATE', translation: 'Teleport renderiza contenido en otra parte del DOM.', examples: [
      { text: 'It is very useful for modals and tooltips.', translation: 'Es muy útil para modales y tooltips.' },
    ] },
    { term: 'onMounted runs after the component is added to the DOM.', level: 'INTERMEDIATE', translation: 'onMounted se ejecuta después de que el componente se añade al DOM.', examples: [
      { text: 'I use it to fetch data or set up a library.', translation: 'Lo uso para pedir datos o inicializar una librería.' },
    ] },
  ],
}

export const INTERVIEW_SETS: EssentialSet[] = [
  interviewVocabEn,
  interviewPhrasesEn,
  interviewConceptsEn,
]
