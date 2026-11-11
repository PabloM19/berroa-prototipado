const form = document.querySelector('#contact-wizard');
const steps = [...form.querySelectorAll('[data-contact-step]')];
const indicators = [...form.querySelectorAll('.contact-steps li')];
const fields = form.elements;
const back = form.querySelector('[data-contact-back]');
const submit = form.querySelector('[data-contact-submit]');
const submitButton = submit.closest('button');
const submitIcon = form.querySelector('[data-contact-icon]');
const error = form.querySelector('#contact-form-error');
const completion = document.querySelector('[data-contact-completion]');
const topics = [...form.querySelectorAll('input[name="topic"]')];
const selectedTopic = new URLSearchParams(location.search).get('tema');
let step = 0;
let invalidField;

for (const topic of topics) {
  if (topic.value === selectedTopic) topic.checked = true;
}

function clearMessages() {
  invalidField?.removeAttribute('aria-invalid');
  invalidField?.removeAttribute('aria-describedby');
  invalidField = undefined;
  error.hidden = true;
}

function reject(field, message) {
  invalidField = field;
  error.textContent = message;
  error.hidden = false;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', error.id);
  field.focus();
  return false;
}

function validate() {
  if (step === 0) {
    if (!fields.topic.value) return reject(topics[0], 'Elige el tema de tu consulta.');
    if (!fields.message.value.trim()) return reject(fields.message, 'Escribe un mensaje para Berroa.');
  } else if (step === 1) {
    if (!fields.name.value.trim()) return reject(fields.name, 'Escribe tu nombre.');
    if (!fields.email.validity.valid) return reject(fields.email, 'Escribe un correo electrónico válido.');
  } else if (!fields.privacy.checked) {
    return reject(fields.privacy, 'Marca la casilla de privacidad para continuar.');
  }
  return true;
}

function getReview() {
  const topic = topics.find(input => input.checked).nextElementSibling.textContent;
  const name = fields.name.value.trim();
  const email = fields.email.value.trim();
  const phone = fields.phone.value.trim();
  const message = fields.message.value.trim();
  return {
    subject: topic,
    details: [name, email, phone].filter(Boolean).join(' · '),
    message,
  };
}

function showStep(index, moveFocus = true) {
  clearMessages();
  step = index;
  steps.forEach((panel, i) => { panel.hidden = i !== step; });
  indicators.forEach((indicator, i) => {
    if (i === step) indicator.setAttribute('aria-current', 'step');
    else indicator.removeAttribute('aria-current');
    indicator.classList.toggle('is-complete', i < step);
  });
  back.hidden = step === 0;
  submit.textContent = ['Continuar', 'Revisar mensaje', 'Enviar'][step];
  submitIcon.setAttribute('href', step === 2 ? '#i-paper-plane' : '#i-arrow');

  if (step === 2) {
    const review = getReview();
    form.querySelector('[data-review-topic]').textContent = review.subject;
    form.querySelector('[data-review-details]').textContent = review.details;
    form.querySelector('[data-review-message]').textContent = review.message;
  }
  if (moveFocus) steps[step].querySelector('[tabindex="-1"]').focus();
}

form.addEventListener('input', clearMessages);
back.addEventListener('click', () => showStep(step - 1));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (submitButton.disabled) return;
  clearMessages();
  if (!validate()) return;
  if (step < 2) {
    showStep(step + 1);
    return;
  }

  submitButton.disabled = true;
  back.disabled = true;
  submit.textContent = 'Enviando…';
  form.setAttribute('aria-busy', 'true');
  setTimeout(() => {
    form.reset();
    form.querySelectorAll('[data-review-topic], [data-review-details], [data-review-message]').forEach(field => { field.textContent = ''; });
    form.removeAttribute('aria-busy');
    form.hidden = true;
    completion.hidden = false;
    completion.focus();
  }, 520);
});

showStep(0, false);
form.hidden = false;
