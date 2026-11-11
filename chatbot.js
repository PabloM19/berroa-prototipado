const launcher = document.querySelector('.garden-chat-launcher');
const chat = document.querySelector('#garden-chat');
const log = chat.querySelector('.garden-chat-log');
const form = chat.querySelector('form');
const input = form.querySelector('textarea');
const send = form.querySelector('button');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const choose = {label: 'Encontrar una planta', action: 'choose'};
const visit = {label: 'Venir a Berroa', action: 'visit'};
const restartChoices = [choose, visit];
const plants = {
  monstera: {
    name: 'Monstera', image: '/assets/images/chat/monstera.webp', category: 'Plantas de interior',
    text: 'Una idea para un rincón luminoso, protegido del sol directo. Comprueba el secado del sustrato antes de regar.',
    href: '/plantas-de-interior/', label: 'Explorar plantas de interior',
  },
  aspidistra: {
    name: 'Aspidistra', image: '/assets/images/chat/aspidistra.webp', category: 'Plantas de interior',
    text: 'Una opción para valorar en un rincón con menos luz. Revisa la humedad antes de regar y evita el encharcamiento.',
    href: '/plantas-de-interior/', label: 'Explorar plantas de interior',
  },
  lavanda: {
    name: 'Lavanda', image: '/assets/images/chat/lavanda.webp', category: 'Plantas de exterior',
    text: 'Una idea aromática para un espacio soleado. El drenaje y las condiciones de tu terraza o jardín importan al elegirla.',
    href: '/plantas-de-exterior/', label: 'Explorar plantas de exterior',
  },
};

let step = 'start';
let busy = false;
let pendingReply;

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon icon-small');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function addLink(parent, label, href) {
  const link = element('a', 'chat-link', label);
  link.href = href;
  if (href.startsWith('https://')) {
    link.target = '_blank';
    link.rel = 'noopener';
  }
  link.append(icon('arrow'));
  parent.append(link);
}

function addMessage(text, sender = 'bot') {
  const message = element('div', `chat-message chat-message-${sender}`);
  const body = element('p', '', text);
  message.append(body);
  log.append(message);
  return message;
}

function addChoices(message, choices) {
  const group = element('div', 'chat-choices');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Opciones para continuar');
  for (const choice of choices) {
    const button = element('button', 'chat-choice', choice.label);
    button.type = 'button';
    button.dataset.chatAction = choice.action;
    button.append(icon('arrow'));
    group.append(button);
  }
  message.append(group);
}

function syncInput() {
  send.disabled = busy || !input.value.trim();
  input.style.height = 'auto';
  input.style.height = `${Math.min(84, input.scrollHeight)}px`;
}

function scrollConversation() {
  log.scrollTop = log.scrollHeight;
}

function welcome() {
  step = 'start';
  const message = addMessage('¡Hola! Soy el asistente de Berroa. ¿Buscamos una planta para tu rincón o te ayudo a venir al garden?');
  addChoices(message, restartChoices);
  scrollConversation();
}

function showPlant(key) {
  step = 'done';
  const plant = plants[key];
  const message = addMessage('Por lo que me cuentas, esta puede ser una buena idea para empezar. La elección final depende de las condiciones de tu espacio.');
  const card = element('article', 'chat-plant-card');
  const image = document.createElement('img');
  image.src = plant.image;
  image.alt = plant.name;
  image.width = 450;
  image.height = 330;
  const copy = element('div', 'chat-plant-copy');
  copy.append(element('span', 'chat-card-label', plant.category), element('h3', '', plant.name), element('p', '', plant.text));
  addLink(copy, plant.label, plant.href);
  card.append(image, copy);
  message.append(card);
  addChoices(message, [{label: 'Quiero consejo del garden', action: 'advice'}, visit]);
}

function respond(action) {
  let message;
  switch (action) {
    case 'choose':
      step = 'location';
      message = addMessage('Empezamos por su futuro hogar. ¿Dónde te gustaría ponerla?');
      addChoices(message, [{label: 'Dentro de casa', action: 'inside'}, {label: 'Terraza o jardín', action: 'outside'}]);
      break;
    case 'inside':
      step = 'indoor-light';
      message = addMessage('Ahora, piensa en la luz de ese rincón. ¿Cómo es durante el día?');
      addChoices(message, [{label: 'Luminoso, sin sol directo', action: 'indirect'}, {label: 'Tiene menos luz', action: 'shade'}]);
      break;
    case 'outside':
      step = 'outdoor-light';
      message = addMessage('¡Al aire libre! ¿Recibe sol directo o está más protegido?');
      addChoices(message, [{label: 'Recibe sol directo', action: 'sun'}, {label: 'Está en semisombra', action: 'outdoor-shade'}]);
      break;
    case 'indirect': showPlant('monstera'); break;
    case 'shade': showPlant('aspidistra'); break;
    case 'sun': showPlant('lavanda'); break;
    case 'outdoor-shade':
      step = 'done';
      message = addMessage('Para una zona de semisombra, conviene elegir según las horas de sol, el frío y el viento. Cuéntanos cómo es tu espacio y te ayudamos a concretar.');
      addLink(message, 'Ideas para tu exterior', '/plantas-de-exterior/');
      addLink(message, 'Preguntar al garden', '/contacto/?tema=plantas#escribenos');
      addChoices(message, restartChoices);
      break;
    case 'visit':
      step = 'visit';
      message = addMessage('¡Nos vemos entre plantas! Estamos en C/ Intxaurdia, 14 · 31620 Huarte, Navarra.');
      const location = element('div', 'chat-location-card');
      location.append(icon('pin'), element('strong', '', 'Berroa Garden Center'), element('p', '', 'C/ Intxaurdia, 14\nHuarte, Navarra'));
      addLink(location, 'Cómo llegar', 'https://www.google.com/maps/dir/?api=1&destination=Berroa+Garden%2C+Calle+Intxaurdia+14%2C+Huarte%2C+Navarra');
      addLink(location, 'Llamar al 948 357 570', 'tel:+34948357570');
      message.append(location);
      addChoices(message, [{label: 'Consultar horario', action: 'hours'}, {label: 'Quiero escribir una consulta', action: 'advice'}, choose]);
      break;
    case 'hours':
      message = addMessage('Para confirmar el horario del día de tu visita, llama al 948 357 570. Así puedes comprobar también los festivos antes de venir.');
      addLink(message, 'Llamar a Berroa', 'tel:+34948357570');
      addChoices(message, restartChoices);
      break;
    case 'advice':
      step = 'done';
      message = addMessage('Cuéntanos tu idea o la duda que tienes. Si es sobre una planta, prepara una foto y dinos dónde está y cómo la cuidas.');
      addLink(message, 'Preparar mi consulta', '/contacto/?tema=plantas#escribenos');
      addChoices(message, restartChoices);
      break;
    default:
      message = addMessage('En esta demo puedo guiarte para elegir una planta o ayudarte a visitar Berroa. Prueba uno de estos dos recorridos.');
      addChoices(message, restartChoices);
  }
}

function reply(action, text) {
  if (busy) return;
  busy = true;
  log.querySelectorAll('.chat-choices').forEach(group => group.remove());
  addMessage(text, 'user');
  const typing = element('div', 'chat-typing');
  typing.setAttribute('role', 'status');
  typing.setAttribute('aria-label', 'Preparando la respuesta');
  for (let i = 0; i < 3; i++) typing.append(element('span', ''));
  log.append(typing);
  syncInput();
  scrollConversation();
  pendingReply = setTimeout(() => {
    typing.remove();
    respond(action);
    busy = false;
    syncInput();
    scrollConversation();
  }, reducedMotion.matches ? 120 : 520);
}

function actionFor(text) {
  const value = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/horario|abri|cerrad|festivo/.test(value)) return 'hours';
  if (/contact|direccion|telefono|donde|llegar|visita|venir/.test(value)) return 'visit';
  if (/consulta|ayuda|amarill|enferm|problema/.test(value)) return 'advice';
  if (/exterior|terraza|balcon|jardin/.test(value)) return 'outside';
  if (/poca luz|menos luz|sombra/.test(value)) return step === 'outdoor-light' ? 'outdoor-shade' : 'shade';
  if (/indirect|sin sol|luminos/.test(value)) return 'indirect';
  if (/sol/.test(value) && step === 'outdoor-light') return 'sun';
  if (/interior|casa|salon/.test(value)) return 'inside';
  if (/planta|elegir|buscar|recomiend/.test(value)) return 'choose';
  return 'fallback';
}

function closeChat() {
  chat.close();
  launcher.setAttribute('aria-expanded', 'false');
  launcher.focus({preventScroll: true});
}

launcher.addEventListener('click', () => {
  if (chat.open) { closeChat(); return; }
  chat.show();
  launcher.setAttribute('aria-expanded', 'true');
  chat.focus({preventScroll: true});
  scrollConversation();
});
chat.querySelector('[data-chat-close]').addEventListener('click', closeChat);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && chat.open) { event.preventDefault(); closeChat(); }
});
chat.querySelector('[data-chat-reset]').addEventListener('click', () => {
  clearTimeout(pendingReply);
  busy = false;
  log.replaceChildren();
  input.value = '';
  welcome();
  syncInput();
});
log.addEventListener('click', event => {
  const button = event.target.closest('button[data-chat-action]');
  if (button) reply(button.dataset.chatAction, button.firstChild.textContent);
});
input.addEventListener('input', syncInput);
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    form.requestSubmit();
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim().slice(0, 300);
  if (!text || busy) return;
  input.value = '';
  reply(actionFor(text), text);
});
welcome();
launcher.hidden = false;
