const search = document.querySelector('#blog-search');
if (search) {
  const form = search.closest('form');
  const filters = [...document.querySelectorAll('[data-blog-topic]')];
  const cards = [...document.querySelectorAll('[data-blog-card]')];
  const count = document.querySelector('[data-blog-count]');
  const empty = document.querySelector('[data-blog-empty]');
  const params = new URLSearchParams(location.search);
  let topic = params.get('tema') || '';
  if (!filters.some(button => button.dataset.blogTopic === topic)) topic = '';
  search.value = params.get('q') || '';
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  function filterArticles() {
    const words = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const card of cards) {
      const text = normalize(card.textContent);
      card.hidden = Boolean(topic && card.dataset.category !== topic) || !words.every(word => text.includes(word));
      if (!card.hidden) visible++;
    }
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.blogTopic === topic)));
    count.textContent = `${visible} ${visible === 1 ? 'lectura' : 'lecturas'} para ti`;
    empty.hidden = visible > 0;
    const next = new URL(location.href);
    if (topic) next.searchParams.set('tema', topic);
    else next.searchParams.delete('tema');
    if (search.value.trim()) next.searchParams.set('q', search.value.trim());
    else next.searchParams.delete('q');
    history.replaceState(null, '', next);
  }
  search.addEventListener('input', filterArticles);
  form.addEventListener('submit', event => { event.preventDefault(); filterArticles(); });
  filters.forEach(button => button.addEventListener('click', () => { topic = button.dataset.blogTopic; filterArticles(); }));
  document.querySelector('[data-blog-reset]').addEventListener('click', () => { topic = ''; search.value = ''; filterArticles(); search.focus(); });
  filterArticles();
}

const tocLinks = [...document.querySelectorAll('.reading-toc > a')];
if (tocLinks.length) {
  const sections = tocLinks.map(link => document.querySelector(link.getAttribute('href')));
  function updateReadingPosition() {
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 160) active = section;
    }
    for (const link of tocLinks) {
      if (link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  }
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { updateReadingPosition(); scheduled = false; });
  }, { passive: true });
  updateReadingPosition();
}
