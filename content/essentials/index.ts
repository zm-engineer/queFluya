import type { EssentialSet } from './types'
import { INTERVIEW_SETS } from './interview'

// English irregular verbs — base, past, past participle — for Spanish speakers.
// Grouped by `level`; the practice screen filters by level. be/have/do show
// pronoun conjugations in their examples.
const irregularVerbsEn: EssentialSet = {
  slug: 'irregular-verbs-en',
  kind: 'irregular-verbs',
  language: 'EN',
  items: [
    { term: 'be', level: 'BEGINNER', forms: ['be', 'was/were', 'been'], translation: 'ser / estar', examples: [
      { text: 'I am happy.', highlight: 'am', translation: 'Estoy feliz.' },
      { text: 'She is a teacher.', highlight: 'is', translation: 'Ella es profesora.' },
      { text: 'We are friends.', highlight: 'are', translation: 'Somos amigos.' },
      { text: 'I was at home yesterday.', highlight: 'was', translation: 'Estaba en casa ayer.' },
    ] },
    { term: 'have', level: 'BEGINNER', forms: ['have', 'had', 'had'], translation: 'tener / haber', examples: [
      { text: 'I have a car.', highlight: 'have', translation: 'Tengo un coche.' },
      { text: 'She has two kids.', highlight: 'has', translation: 'Ella tiene dos hijos.' },
      { text: 'We had a great time.', highlight: 'had', translation: 'Lo pasamos muy bien.' },
    ] },
    { term: 'do', level: 'BEGINNER', forms: ['do', 'did', 'done'], translation: 'hacer', examples: [
      { text: 'I do my best.', highlight: 'do', translation: 'Hago lo mejor que puedo.' },
      { text: 'She does yoga.', highlight: 'does', translation: 'Ella hace yoga.' },
      { text: 'I did my homework.', highlight: 'did', translation: 'Hice mi tarea.' },
    ] },
    { term: 'go', level: 'BEGINNER', forms: ['go', 'went', 'gone'], translation: 'ir', examples: [
      { text: 'I go to work by bus.', highlight: 'go', translation: 'Voy al trabajo en autobús.' },
      { text: 'I went to the store yesterday.', highlight: 'went', translation: 'Fui a la tienda ayer.' },
    ] },
    { term: 'get', level: 'BEGINNER', forms: ['get', 'got', 'gotten'], translation: 'conseguir / obtener', examples: [
      { text: 'I get a lot of emails.', highlight: 'get', translation: 'Recibo muchos correos.' },
      { text: 'I got a new phone.', highlight: 'got', translation: 'Conseguí un teléfono nuevo.' },
    ] },
    { term: 'make', level: 'BEGINNER', forms: ['make', 'made', 'made'], translation: 'hacer / fabricar', examples: [
      { text: 'I make coffee every morning.', highlight: 'make', translation: 'Hago café cada mañana.' },
      { text: 'We made dinner together.', highlight: 'made', translation: 'Hicimos la cena juntos.' },
    ] },
    { term: 'say', level: 'BEGINNER', forms: ['say', 'said', 'said'], translation: 'decir', examples: [
      { text: "They say it's easy.", highlight: 'say', translation: 'Dicen que es fácil.' },
      { text: 'He said he was tired.', highlight: 'said', translation: 'Dijo que estaba cansado.' },
    ] },
    { term: 'see', level: 'BEGINNER', forms: ['see', 'saw', 'seen'], translation: 'ver', examples: [
      { text: 'I see you.', highlight: 'see', translation: 'Te veo.' },
      { text: 'We saw a great movie.', highlight: 'saw', translation: 'Vimos una gran película.' },
    ] },
    { term: 'come', level: 'BEGINNER', forms: ['come', 'came', 'come'], translation: 'venir', examples: [
      { text: 'I come here often.', highlight: 'come', translation: 'Vengo aquí a menudo.' },
      { text: 'He came home late.', highlight: 'came', translation: 'Llegó a casa tarde.' },
    ] },
    { term: 'take', level: 'BEGINNER', forms: ['take', 'took', 'taken'], translation: 'tomar / coger', examples: [
      { text: 'I take the bus to work.', highlight: 'take', translation: 'Tomo el autobús al trabajo.' },
      { text: 'They took the bus to work.', highlight: 'took', translation: 'Tomaron el autobús al trabajo.' },
    ] },
    { term: 'eat', level: 'BEGINNER', forms: ['eat', 'ate', 'eaten'], translation: 'comer', examples: [
      { text: 'I eat lunch at noon.', highlight: 'eat', translation: 'Como al mediodía.' },
      { text: 'We ate at a restaurant.', highlight: 'ate', translation: 'Comimos en un restaurante.' },
    ] },
    { term: 'drink', level: 'BEGINNER', forms: ['drink', 'drank', 'drunk'], translation: 'beber', examples: [
      { text: 'I drink coffee every morning.', highlight: 'drink', translation: 'Bebo café cada mañana.' },
      { text: 'He drank some water.', highlight: 'drank', translation: 'Bebió un poco de agua.' },
    ] },
    { term: 'sleep', level: 'BEGINNER', forms: ['sleep', 'slept', 'slept'], translation: 'dormir', examples: [
      { text: 'I sleep eight hours.', highlight: 'sleep', translation: 'Duermo ocho horas.' },
      { text: 'I slept well last night.', highlight: 'slept', translation: 'Dormí bien anoche.' },
    ] },
    { term: 'buy', level: 'BEGINNER', forms: ['buy', 'bought', 'bought'], translation: 'comprar', examples: [
      { text: 'I buy bread every day.', highlight: 'buy', translation: 'Compro pan todos los días.' },
      { text: 'They bought a house.', highlight: 'bought', translation: 'Compraron una casa.' },
    ] },
    { term: 'give', level: 'BEGINNER', forms: ['give', 'gave', 'given'], translation: 'dar', examples: [
      { text: 'I give her flowers.', highlight: 'give', translation: 'Le doy flores.' },
      { text: 'You gave me good advice.', highlight: 'gave', translation: 'Me diste un buen consejo.' },
    ] },
    { term: 'know', level: 'INTERMEDIATE', forms: ['know', 'knew', 'known'], translation: 'saber / conocer', examples: [
      { text: 'I know the answer.', highlight: 'know', translation: 'Sé la respuesta.' },
      { text: 'I have known her for years.', highlight: 'known', translation: 'La conozco desde hace años.' },
    ] },
    { term: 'find', level: 'INTERMEDIATE', forms: ['find', 'found', 'found'], translation: 'encontrar', examples: [
      { text: "I can't find my keys.", highlight: 'find', translation: 'No encuentro mis llaves.' },
      { text: 'I found my keys.', highlight: 'found', translation: 'Encontré mis llaves.' },
    ] },
    { term: 'think', level: 'INTERMEDIATE', forms: ['think', 'thought', 'thought'], translation: 'pensar', examples: [
      { text: "I think it's a good idea.", highlight: 'think', translation: 'Creo que es buena idea.' },
      { text: 'I thought about it.', highlight: 'thought', translation: 'Lo pensé.' },
    ] },
    { term: 'tell', level: 'INTERMEDIATE', forms: ['tell', 'told', 'told'], translation: 'decir / contar', examples: [
      { text: 'I always tell the truth.', highlight: 'tell', translation: 'Siempre digo la verdad.' },
      { text: 'She told me the truth.', highlight: 'told', translation: 'Me contó la verdad.' },
    ] },
    { term: 'feel', level: 'INTERMEDIATE', forms: ['feel', 'felt', 'felt'], translation: 'sentir', examples: [
      { text: 'I feel great today.', highlight: 'feel', translation: 'Me siento genial hoy.' },
      { text: 'I felt tired.', highlight: 'felt', translation: 'Me sentí cansado.' },
    ] },
    { term: 'put', level: 'INTERMEDIATE', forms: ['put', 'put', 'put'], translation: 'poner', examples: [
      { text: 'I put sugar in my coffee.', highlight: 'put', translation: 'Le pongo azúcar al café.' },
      { text: 'I put it on the table.', highlight: 'put', translation: 'Lo puse en la mesa.' },
    ] },
    { term: 'bring', level: 'INTERMEDIATE', forms: ['bring', 'brought', 'brought'], translation: 'traer', examples: [
      { text: 'I bring my lunch to work.', highlight: 'bring', translation: 'Llevo mi almuerzo al trabajo.' },
      { text: 'She brought a cake.', highlight: 'brought', translation: 'Trajo un pastel.' },
    ] },
    { term: 'keep', level: 'INTERMEDIATE', forms: ['keep', 'kept', 'kept'], translation: 'mantener / guardar', examples: [
      { text: 'I keep my promises.', highlight: 'keep', translation: 'Cumplo mis promesas.' },
      { text: 'I kept the receipt.', highlight: 'kept', translation: 'Guardé el recibo.' },
    ] },
    { term: 'write', level: 'INTERMEDIATE', forms: ['write', 'wrote', 'written'], translation: 'escribir', examples: [
      { text: 'I write in my journal.', highlight: 'write', translation: 'Escribo en mi diario.' },
      { text: 'She wrote a letter.', highlight: 'wrote', translation: 'Ella escribió una carta.' },
    ] },
    { term: 'hear', level: 'INTERMEDIATE', forms: ['hear', 'heard', 'heard'], translation: 'oír', examples: [
      { text: 'I can hear you.', highlight: 'hear', translation: 'Te oigo.' },
      { text: 'I heard a noise.', highlight: 'heard', translation: 'Oí un ruido.' },
    ] },
    { term: 'meet', level: 'INTERMEDIATE', forms: ['meet', 'met', 'met'], translation: 'conocer / encontrarse', examples: [
      { text: 'I meet my friends on Fridays.', highlight: 'meet', translation: 'Quedo con mis amigos los viernes.' },
      { text: 'We met last year.', highlight: 'met', translation: 'Nos conocimos el año pasado.' },
    ] },
    { term: 'run', level: 'INTERMEDIATE', forms: ['run', 'ran', 'run'], translation: 'correr', examples: [
      { text: 'I run every morning.', highlight: 'run', translation: 'Corro cada mañana.' },
      { text: 'I ran to catch the bus.', highlight: 'ran', translation: 'Corrí para tomar el autobús.' },
    ] },
    { term: 'pay', level: 'INTERMEDIATE', forms: ['pay', 'paid', 'paid'], translation: 'pagar', examples: [
      { text: 'I pay with my card.', highlight: 'pay', translation: 'Pago con tarjeta.' },
      { text: 'I paid the bill.', highlight: 'paid', translation: 'Pagué la cuenta.' },
    ] },
    { term: 'drive', level: 'INTERMEDIATE', forms: ['drive', 'drove', 'driven'], translation: 'conducir / manejar', examples: [
      { text: 'I drive to work.', highlight: 'drive', translation: 'Conduzco al trabajo.' },
      { text: 'He drove to the airport.', highlight: 'drove', translation: 'Condujo al aeropuerto.' },
    ] },
    { term: 'understand', level: 'INTERMEDIATE', forms: ['understand', 'understood', 'understood'], translation: 'entender', examples: [
      { text: 'I understand the lesson.', highlight: 'understand', translation: 'Entiendo la lección.' },
      { text: 'I understood everything.', highlight: 'understood', translation: 'Entendí todo.' },
    ] },
    { term: 'become', level: 'ADVANCED', forms: ['become', 'became', 'become'], translation: 'convertirse en', examples: [
      { text: 'Dreams become reality.', highlight: 'become', translation: 'Los sueños se hacen realidad.' },
      { text: 'She became a doctor.', highlight: 'became', translation: 'Se hizo médica.' },
    ] },
    { term: 'leave', level: 'ADVANCED', forms: ['leave', 'left', 'left'], translation: 'dejar / irse', examples: [
      { text: 'I leave at eight.', highlight: 'leave', translation: 'Salgo a las ocho.' },
      { text: 'I left early.', highlight: 'left', translation: 'Me fui temprano.' },
    ] },
    { term: 'begin', level: 'ADVANCED', forms: ['begin', 'began', 'begun'], translation: 'empezar', examples: [
      { text: 'Classes begin in September.', highlight: 'begin', translation: 'Las clases empiezan en septiembre.' },
      { text: 'The movie began late.', highlight: 'began', translation: 'La película empezó tarde.' },
    ] },
    { term: 'speak', level: 'ADVANCED', forms: ['speak', 'spoke', 'spoken'], translation: 'hablar', examples: [
      { text: 'I speak three languages.', highlight: 'speak', translation: 'Hablo tres idiomas.' },
      { text: 'She spoke to the manager.', highlight: 'spoke', translation: 'Habló con el gerente.' },
    ] },
    { term: 'read', level: 'ADVANCED', forms: ['read', 'read', 'read'], translation: 'leer', examples: [
      { text: 'I read before bed.', highlight: 'read', translation: 'Leo antes de dormir.' },
      { text: 'I read that book last week.', highlight: 'read', translation: 'Leí ese libro la semana pasada.' },
    ] },
    { term: 'lose', level: 'ADVANCED', forms: ['lose', 'lost', 'lost'], translation: 'perder', examples: [
      { text: 'I always lose my keys.', highlight: 'lose', translation: 'Siempre pierdo mis llaves.' },
      { text: 'I lost my wallet.', highlight: 'lost', translation: 'Perdí mi cartera.' },
    ] },
    { term: 'sell', level: 'ADVANCED', forms: ['sell', 'sold', 'sold'], translation: 'vender', examples: [
      { text: 'They sell fresh fruit.', highlight: 'sell', translation: 'Venden fruta fresca.' },
      { text: 'They sold their car.', highlight: 'sold', translation: 'Vendieron su coche.' },
    ] },
    { term: 'teach', level: 'ADVANCED', forms: ['teach', 'taught', 'taught'], translation: 'enseñar', examples: [
      { text: 'I teach English.', highlight: 'teach', translation: 'Enseño inglés.' },
      { text: 'She taught me to cook.', highlight: 'taught', translation: 'Me enseñó a cocinar.' },
    ] },
    { term: 'win', level: 'ADVANCED', forms: ['win', 'won', 'won'], translation: 'ganar', examples: [
      { text: 'We often win.', highlight: 'win', translation: 'Ganamos a menudo.' },
      { text: 'Our team won the game.', highlight: 'won', translation: 'Nuestro equipo ganó el partido.' },
    ] },
    { term: 'break', level: 'ADVANCED', forms: ['break', 'broke', 'broken'], translation: 'romper', examples: [
      { text: "Be careful, you'll break it.", highlight: 'break', translation: 'Ten cuidado, lo vas a romper.' },
      { text: 'I broke my phone.', highlight: 'broke', translation: 'Rompí mi teléfono.' },
    ] },
  ],
}

// English phrasal verbs — a very English feature, so this set is EN-only.
const phrasalVerbsEn: EssentialSet = {
  slug: 'phrasal-verbs-en',
  kind: 'phrasal-verbs',
  language: 'EN',
  items: [
    { term: 'get up', level: 'BEGINNER', translation: 'levantarse', examples: [{ text: 'I get up at seven.', highlight: 'get up', translation: 'Me levanto a las siete.' }] },
    { term: 'wake up', level: 'BEGINNER', translation: 'despertarse', examples: [{ text: 'I wake up early.', highlight: 'wake up', translation: 'Me despierto temprano.' }] },
    { term: 'turn on', level: 'BEGINNER', translation: 'encender', examples: [{ text: 'Turn on the lights, please.', highlight: 'Turn on', translation: 'Enciende las luces, por favor.' }] },
    { term: 'turn off', level: 'BEGINNER', translation: 'apagar', examples: [{ text: 'Turn off your phone.', highlight: 'Turn off', translation: 'Apaga tu teléfono.' }] },
    { term: 'put on', level: 'BEGINNER', translation: 'ponerse (ropa)', examples: [{ text: 'Put on your jacket.', highlight: 'Put on', translation: 'Ponte la chaqueta.' }] },
    { term: 'take off', level: 'BEGINNER', translation: 'quitarse (ropa) / despegar', examples: [{ text: 'Take off your shoes.', highlight: 'Take off', translation: 'Quítate los zapatos.' }] },
    { term: 'come back', level: 'BEGINNER', translation: 'volver / regresar', examples: [{ text: 'Come back soon!', highlight: 'Come back', translation: '¡Vuelve pronto!' }] },
    { term: 'pick up', level: 'BEGINNER', translation: 'recoger / aprender', examples: [{ text: 'Can you pick up some milk?', highlight: 'pick up', translation: '¿Puedes comprar leche?' }] },
    { term: 'look for', level: 'BEGINNER', translation: 'buscar', examples: [{ text: "I'm looking for my keys.", highlight: 'looking for', translation: 'Estoy buscando mis llaves.' }] },
    { term: 'get on', level: 'BEGINNER', translation: 'subirse (a un transporte) / llevarse bien', examples: [{ text: 'Get on the bus quickly.', highlight: 'Get on', translation: 'Súbete al autobús rápido.' }] },
    { term: 'get off', level: 'INTERMEDIATE', translation: 'bajarse (de un transporte)', examples: [{ text: 'We get off at the next stop.', highlight: 'get off', translation: 'Nos bajamos en la próxima parada.' }] },
    { term: 'find out', level: 'INTERMEDIATE', translation: 'averiguar / enterarse', examples: [{ text: 'I need to find out the truth.', highlight: 'find out', translation: 'Necesito averiguar la verdad.' }] },
    { term: 'look after', level: 'INTERMEDIATE', translation: 'cuidar (de)', examples: [{ text: 'Can you look after the kids?', highlight: 'look after', translation: '¿Puedes cuidar a los niños?' }] },
    { term: 'give up', level: 'INTERMEDIATE', translation: 'rendirse / dejar (un hábito)', examples: [{ text: "Don't give up on your dreams.", highlight: 'give up', translation: 'No renuncies a tus sueños.' }] },
    { term: 'go on', level: 'INTERMEDIATE', translation: 'continuar / seguir', examples: [{ text: 'Please go on with your story.', highlight: 'go on', translation: 'Por favor, sigue con tu historia.' }] },
    { term: 'carry on', level: 'INTERMEDIATE', translation: 'continuar', examples: [{ text: "Carry on, you're doing great.", highlight: 'Carry on', translation: 'Sigue así, lo estás haciendo genial.' }] },
    { term: 'hang out', level: 'INTERMEDIATE', translation: 'pasar el rato', examples: [{ text: "Let's hang out this weekend.", highlight: 'hang out', translation: 'Quedemos este finde.' }] },
    { term: 'grow up', level: 'INTERMEDIATE', translation: 'crecer / criarse', examples: [{ text: 'I grew up in Madrid.', highlight: 'grew up', translation: 'Crecí en Madrid.' }] },
    { term: 'call back', level: 'INTERMEDIATE', translation: 'devolver la llamada', examples: [{ text: "I'll call back later.", highlight: 'call back', translation: 'Te devuelvo la llamada más tarde.' }] },
    { term: 'check in', level: 'INTERMEDIATE', translation: 'registrarse / facturar', examples: [{ text: 'We check in at 3 pm.', highlight: 'check in', translation: 'Hacemos el check-in a las 3.' }] },
    { term: 'look forward to', level: 'ADVANCED', translation: 'tener ganas de / esperar con ilusión', examples: [{ text: 'I look forward to the weekend.', highlight: 'look forward to', translation: 'Tengo ganas de que llegue el finde.' }] },
    { term: 'set up', level: 'ADVANCED', translation: 'montar / configurar', examples: [{ text: 'I set up the new printer.', highlight: 'set up', translation: 'Configuré la impresora nueva.' }] },
    { term: 'work out', level: 'ADVANCED', translation: 'resolver / hacer ejercicio', examples: [{ text: 'Everything worked out fine.', highlight: 'worked out', translation: 'Todo salió bien.' }] },
    { term: 'run out (of)', level: 'ADVANCED', translation: 'quedarse sin', examples: [{ text: 'We ran out of coffee.', highlight: 'ran out of', translation: 'Nos quedamos sin café.' }] },
    { term: 'break down', level: 'ADVANCED', translation: 'averiarse / desmoronarse', examples: [{ text: 'My car broke down.', highlight: 'broke down', translation: 'Mi coche se averió.' }] },
    { term: 'give back', level: 'ADVANCED', translation: 'devolver', examples: [{ text: 'Please give back my book.', highlight: 'give back', translation: 'Por favor, devuélveme mi libro.' }] },
    { term: 'throw away', level: 'ADVANCED', translation: 'tirar / desechar', examples: [{ text: "Don't throw away that box.", highlight: 'throw away', translation: 'No tires esa caja.' }] },
    { term: 'fill in / fill out', level: 'ADVANCED', translation: 'rellenar (un formulario)', examples: [{ text: 'Fill in this form, please.', highlight: 'Fill in', translation: 'Rellena este formulario, por favor.' }] },
  ],
}

// Spanish irregular verbs for English speakers. ser/estar/tener show pronoun
// variety in their examples.
const irregularVerbsEs: EssentialSet = {
  slug: 'irregular-verbs-es',
  kind: 'irregular-verbs',
  language: 'ES',
  items: [
    { term: 'ser', level: 'BEGINNER', forms: ['soy', 'fui', 'sido'], translation: 'to be', examples: [
      { text: 'Soy de España.', highlight: 'Soy', translation: "I'm from Spain." },
      { text: 'Ella es profesora.', highlight: 'es', translation: 'She is a teacher.' },
      { text: 'Somos amigos.', highlight: 'Somos', translation: 'We are friends.' },
    ] },
    { term: 'estar', level: 'BEGINNER', forms: ['estoy', 'estuve', 'estado'], translation: 'to be (state/location)', examples: [
      { text: 'Estoy cansado.', highlight: 'Estoy', translation: "I'm tired." },
      { text: 'Ella está en casa.', highlight: 'está', translation: 'She is at home.' },
      { text: 'Estamos listos.', highlight: 'Estamos', translation: 'We are ready.' },
    ] },
    { term: 'tener', level: 'BEGINNER', forms: ['tengo', 'tuve', 'tenido'], translation: 'to have', examples: [
      { text: 'Tengo dos hermanos.', highlight: 'Tengo', translation: 'I have two brothers.' },
      { text: 'Ella tiene un perro.', highlight: 'tiene', translation: 'She has a dog.' },
      { text: 'Tuve un buen día.', highlight: 'Tuve', translation: 'I had a good day.' },
    ] },
    { term: 'hacer', level: 'BEGINNER', forms: ['hago', 'hice', 'hecho'], translation: 'to do / to make', examples: [
      { text: 'Hago ejercicio cada día.', highlight: 'Hago', translation: 'I exercise every day.' },
      { text: 'Hice la cena anoche.', highlight: 'Hice', translation: 'I made dinner last night.' },
    ] },
    { term: 'ir', level: 'BEGINNER', forms: ['voy', 'fui', 'ido'], translation: 'to go', examples: [
      { text: 'Voy al trabajo en autobús.', highlight: 'Voy', translation: 'I go to work by bus.' },
      { text: 'Fui al mercado ayer.', highlight: 'Fui', translation: 'I went to the market yesterday.' },
    ] },
    { term: 'poder', level: 'BEGINNER', forms: ['puedo', 'pude', 'podido'], translation: 'can / to be able to', examples: [
      { text: 'No puedo ir hoy.', highlight: 'puedo', translation: "I can't go today." },
      { text: 'No pude venir ayer.', highlight: 'pude', translation: "I couldn't come yesterday." },
    ] },
    { term: 'decir', level: 'BEGINNER', forms: ['digo', 'dije', 'dicho'], translation: 'to say / to tell', examples: [
      { text: 'Siempre digo la verdad.', highlight: 'digo', translation: 'I always tell the truth.' },
      { text: '¿Qué dijiste?', highlight: 'dijiste', translation: 'What did you say?' },
    ] },
    { term: 'ver', level: 'BEGINNER', forms: ['veo', 'vi', 'visto'], translation: 'to see', examples: [
      { text: 'Te veo mañana.', highlight: 'veo', translation: "I'll see you tomorrow." },
      { text: 'Vi una película muy buena.', highlight: 'Vi', translation: 'I saw a very good movie.' },
    ] },
    { term: 'dar', level: 'INTERMEDIATE', forms: ['doy', 'di', 'dado'], translation: 'to give', examples: [
      { text: 'Te doy las gracias.', highlight: 'doy', translation: 'I thank you.' },
      { text: 'Me dieron un regalo.', highlight: 'dieron', translation: 'They gave me a gift.' },
    ] },
    { term: 'saber', level: 'INTERMEDIATE', forms: ['sé', 'supe', 'sabido'], translation: 'to know (facts)', examples: [
      { text: 'No sé la respuesta.', highlight: 'sé', translation: "I don't know the answer." },
      { text: 'Supe la verdad ayer.', highlight: 'Supe', translation: 'I found out the truth yesterday.' },
    ] },
    { term: 'querer', level: 'INTERMEDIATE', forms: ['quiero', 'quise', 'querido'], translation: 'to want / to love', examples: [
      { text: 'Quiero un café.', highlight: 'Quiero', translation: 'I want a coffee.' },
      { text: 'Quise ayudar.', highlight: 'Quise', translation: 'I wanted to help.' },
    ] },
    { term: 'venir', level: 'INTERMEDIATE', forms: ['vengo', 'vine', 'venido'], translation: 'to come', examples: [
      { text: 'Vengo aquí a menudo.', highlight: 'Vengo', translation: 'I come here often.' },
      { text: 'Vine en autobús.', highlight: 'Vine', translation: 'I came by bus.' },
    ] },
    { term: 'poner', level: 'INTERMEDIATE', forms: ['pongo', 'puse', 'puesto'], translation: 'to put', examples: [
      { text: 'Pongo la mesa.', highlight: 'Pongo', translation: 'I set the table.' },
      { text: 'Puse las llaves en la mesa.', highlight: 'Puse', translation: 'I put the keys on the table.' },
    ] },
    { term: 'salir', level: 'INTERMEDIATE', forms: ['salgo', 'salí', 'salido'], translation: 'to leave / to go out', examples: [
      { text: 'Salgo a las ocho.', highlight: 'Salgo', translation: 'I leave at eight.' },
      { text: 'Salí temprano del trabajo.', highlight: 'Salí', translation: 'I left work early.' },
    ] },
    { term: 'conocer', level: 'INTERMEDIATE', forms: ['conozco', 'conocí', 'conocido'], translation: 'to know (people/places)', examples: [
      { text: 'Conozco a tu hermana.', highlight: 'Conozco', translation: 'I know your sister.' },
      { text: 'Conocí a María ayer.', highlight: 'Conocí', translation: 'I met María yesterday.' },
    ] },
    { term: 'pedir', level: 'INTERMEDIATE', forms: ['pido', 'pedí', 'pedido'], translation: 'to ask for / to order', examples: [
      { text: 'Pido un café.', highlight: 'Pido', translation: 'I order a coffee.' },
      { text: 'Pedí la cuenta.', highlight: 'Pedí', translation: 'I asked for the bill.' },
    ] },
    { term: 'traer', level: 'ADVANCED', forms: ['traigo', 'traje', 'traído'], translation: 'to bring', examples: [
      { text: 'Traigo el almuerzo.', highlight: 'Traigo', translation: 'I bring lunch.' },
      { text: 'Traje un regalo.', highlight: 'Traje', translation: 'I brought a gift.' },
    ] },
    { term: 'dormir', level: 'ADVANCED', forms: ['duermo', 'dormí', 'dormido'], translation: 'to sleep', examples: [
      { text: 'Duermo ocho horas.', highlight: 'Duermo', translation: 'I sleep eight hours.' },
      { text: 'Dormí muy bien.', highlight: 'Dormí', translation: 'I slept very well.' },
    ] },
    { term: 'sentir', level: 'ADVANCED', forms: ['siento', 'sentí', 'sentido'], translation: 'to feel', examples: [
      { text: 'Siento mucho frío.', highlight: 'Siento', translation: 'I feel very cold.' },
      { text: 'Sentí una emoción.', highlight: 'Sentí', translation: 'I felt an emotion.' },
    ] },
    { term: 'volver', level: 'ADVANCED', forms: ['vuelvo', 'volví', 'vuelto'], translation: 'to return', examples: [
      { text: 'Vuelvo a casa a las seis.', highlight: 'Vuelvo', translation: 'I return home at six.' },
      { text: 'Volví a casa tarde.', highlight: 'Volví', translation: 'I returned home late.' },
    ] },
    { term: 'empezar', level: 'ADVANCED', forms: ['empiezo', 'empecé', 'empezado'], translation: 'to start', examples: [
      { text: 'Empiezo a trabajar a las nueve.', highlight: 'Empiezo', translation: 'I start work at nine.' },
      { text: 'Empecé un curso nuevo.', highlight: 'Empecé', translation: 'I started a new course.' },
    ] },
    { term: 'oír', level: 'ADVANCED', forms: ['oigo', 'oí', 'oído'], translation: 'to hear', examples: [
      { text: 'No te oigo bien.', highlight: 'oigo', translation: "I can't hear you well." },
      { text: 'Oí un ruido.', highlight: 'Oí', translation: 'I heard a noise.' },
    ] },
  ],
}

// Tenses live in ./tenses.ts (a different, explanatory shape) — not here.
export const ESSENTIAL_SETS: EssentialSet[] = [
  irregularVerbsEn,
  phrasalVerbsEn,
  irregularVerbsEs,
  ...INTERVIEW_SETS,
]
