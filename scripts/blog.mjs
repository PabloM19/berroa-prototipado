import { articles } from '../pages/articles.mjs';

const icon = name => `<svg class="icon icon-small" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHtml = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const url = article => `/blog/${article.slug}/`;
const topics = ['Decoración', 'Cuidados', 'Exterior'];

function photo(article, className = '', priority = false) {
  return `<img class="${className}" src="/assets/images/${article.image}-1100.webp" srcset="/assets/images/${article.image}-600.webp 600w, /assets/images/${article.image}-1100.webp 1100w" sizes="(max-width: 760px) calc(100vw - 40px), 55vw" alt="${escapeHtml(article.alt)}" width="1100" height="734" style="object-position:${article.position}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
}

function readingTime(article) {
  const text = article.sections.map(section => section.title + ' ' + section.html.replace(/<[^>]+>/g, ' ')).join(' ') + article.faqs.flat().join(' ');
  return Math.max(2, Math.ceil(text.trim().split(/\s+/).length / 200));
}

function breadcrumb(article) {
  return `<nav class="category-breadcrumb" aria-label="Ruta de navegación"><ol><li><a href="/">Inicio</a></li>${article ? `<li><a href="/blog/">Blog</a></li><li><span aria-current="page">${article.category}</span></li>` : '<li><span aria-current="page">Blog</span></li>'}</ol></nav>`;
}

function card(article, filterable = false) {
  return `<article class="journal-card" ${filterable ? `data-blog-card data-category="${article.category}"` : ''}>
    <a href="${url(article)}" class="journal-card-link">
      <div class="journal-card-photo">${photo(article)}<span class="journal-card-arrow">${icon('diagonal')}</span></div>
      <div class="journal-card-copy"><div class="journal-meta"><span>${article.category}</span><span>${readingTime(article)} min de lectura</span></div>
      <h3>${article.title}</h3><p>${article.excerpt}</p><span class="journal-read">Leer la guía ${icon('arrow')}</span></div>
    </a>
  </article>`;
}

function visitCta() {
  return `<section class="journal-visit"><div class="wrap journal-visit-inner"><div><p class="eyebrow">DEL BLOG A TU CASA</p><h2>Las buenas ideas<br><em>también se cultivan aquí.</em></h2><p>Plantas, materiales y alguien con quien compartir tus dudas.<br>Te esperamos en Berroa Garden, en Huarte.</p></div><a class="button button-light" href="/contacto/#ubicacion">Ven a conocernos ${icon('diagonal')}</a></div></section>`;
}

export function renderBlog() {
  const featured = articles[0];
  return `<section class="journal-masthead"><div class="wrap">${breadcrumb()}
    <div class="journal-opening"><div><h1>Ideas para vivir<br><em>un poco más verde.</em></h1></div><div class="journal-opening-copy"><p>Una planta nueva. Un rincón por descubrir. Ese consejo que te faltaba.</p><p>Inspiración y cuidados para disfrutar de lo natural, a tu manera.</p><a class="text-link" href="#lecturas">Encuentra tu próxima idea ${icon('arrow')}</a></div></div>
    <a class="journal-feature" href="${url(featured)}"><div class="journal-feature-photo">${photo(featured, '', true)}<span class="journal-feature-label">Una idea para casa</span></div><div class="journal-feature-copy"><div class="journal-meta"><span>${featured.category}</span><span>${readingTime(featured)} min de lectura</span></div><h2>${featured.title}</h2><p>${featured.excerpt}</p><span class="journal-feature-bottom"><span>Leer y dejarse inspirar</span><span class="journal-feature-arrow">${icon('arrow')}</span></span></div></a>
  </div></section>
  <section class="journal-library wrap" id="lecturas" aria-labelledby="library-title"><div class="journal-library-heading"><div><p class="eyebrow">SIGUE TU CURIOSIDAD</p><h2 id="library-title">¿Qué te apetece descubrir?</h2></div><form class="journal-search" role="search" aria-label="Buscar en el blog" action="/blog/#lecturas"><label class="sr-only" for="blog-search">Buscar una idea</label>${icon('search')}<input id="blog-search" name="q" type="search" placeholder="Busca una idea, una planta…" autocomplete="off"><button type="submit" aria-label="Buscar">${icon('arrow')}</button></form></div>
    <div class="journal-filter-bar"><div class="journal-filters" role="group" aria-label="Filtrar artículos por tema"><button type="button" data-blog-topic="" aria-pressed="true">Todas las ideas</button>${topics.map(topic => `<button type="button" data-blog-topic="${topic}" aria-pressed="false">${topic}</button>`).join('')}</div><p data-blog-count role="status" aria-live="polite">3 lecturas para ti</p></div>
    <div class="journal-grid">${articles.map(article => card(article, true)).join('')}</div>
    <div class="journal-empty" data-blog-empty hidden><h3>Por aquí todavía no ha brotado esa idea.</h3><p>Prueba con otra palabra o explora todas nuestras lecturas.</p><button class="button button-primary" type="button" data-blog-reset>Ver todas las ideas ${icon('arrow')}</button></div>
    <div class="journal-group-note"><img src="/assets/images/jardinarium-sello.png" width="54" height="54" alt="Jardinarium"><p>Formamos parte de Jardinarium.<br><span>Más inspiración y consejos en el blog del grupo.</span></p><a class="text-link" href="https://jardinarium.com/blog/" target="_blank" rel="noopener">Explorar Jardinarium ${icon('diagonal')}</a></div>
  </section>${visitCta()}`;
}

export function renderArticle(article) {
  const questionsId = 'preguntas-frecuentes';
  return `<article class="journal-article">
    <header class="reading-masthead"><div class="wrap">${breadcrumb(article)}
      <div class="reading-opening">
        <div class="reading-opening-copy">
          <div class="reading-labels"><a href="/blog/?tema=${encodeURIComponent(article.category)}#lecturas">${article.category}</a><span>${readingTime(article)} min de lectura</span></div>
          <h1>${article.title}</h1><p class="reading-intro">${article.excerpt}</p>
          <a class="text-link reading-skip" href="#guia">Leer la guía <span>${icon('arrow')}</span></a>
        </div>
        <figure class="reading-cover">${photo(article, '', true)}<figcaption>Fotografía · Jardinarium</figcaption></figure>
      </div>
    </div></header>
    <div class="wrap reading-layout" id="guia"><div class="reading-body">
      <div class="reading-takeaway"><p class="eyebrow">QUÉDATE CON ESTA IDEA</p><p>${article.takeaway}</p></div>
      ${article.sections.map((section, index) => `<section id="${section.id}" class="reading-section"><h2>${section.title}</h2>${section.html}</section>${index === 1 ? `<aside class="reading-inline-cta" aria-label="Encuentra tu siguiente paso"><p class="eyebrow">LO HACEMOS CONTIGO</p><h2>${article.cta.title}</h2><p>${article.cta.text}</p><a class="button button-primary" href="${article.cta.href}">${article.cta.label} ${icon('arrow')}</a></aside>` : ''}`).join('')}
      <section class="reading-faq" id="${questionsId}" aria-labelledby="faq-title"><p class="eyebrow">POR SI TE LO ESTABAS PREGUNTANDO</p><h2 id="faq-title">Resolvemos esas pequeñas dudas.</h2><div class="journal-faq-list">${article.faqs.map(([question, answer], index) => `<details${index === 0 ? ' open' : ''}><summary>${question}<span aria-hidden="true"></span></summary><div><p>${answer}</p></div></details>`).join('')}</div></section>
      <details class="reading-sources" id="fuentes"><summary>Para seguir profundizando ${icon('chevron')}</summary><div><p>Lecturas de referencia y procedencia de las fotografías.</p><ul>${article.sources.map(([label, href]) => `<li><a href="${href}" target="_blank" rel="noopener">${label} ${icon('diagonal')}</a></li>`).join('')}</ul></div></details>
      <a class="text-link reading-back" href="/blog/">${icon('arrow')} Volver a todas las ideas</a>
    </div>
    <aside class="reading-sidebar" aria-label="Índice y enlaces útiles"><div class="reading-sticky"><nav class="reading-toc" aria-label="En esta guía"><p class="eyebrow">EN ESTA GUÍA</p>${article.sections.map(section => `<a href="#${section.id}">${section.title}</a>`).join('')}<a href="#${questionsId}">Preguntas frecuentes</a></nav><div class="reading-help"><p class="eyebrow">DE CERCA, MEJOR</p><h2>¿Lo vemos<br><em>entre plantas?</em></h2><p>Una duda, una foto de tu rincón o una idea a medias. Tráetela a Berroa.</p><a class="button button-primary" href="/contacto/">Hablemos ${icon('arrow')}</a><a class="reading-help-location" href="/contacto/#ubicacion">${icon('pin')} Huarte, Navarra</a></div><a class="reading-category-link" href="/blog/?tema=${encodeURIComponent(article.category)}#lecturas">Más ideas de ${article.category.toLowerCase()} ${icon('arrow')}</a></div></aside></div>
  </article>
  <section class="journal-related wrap" aria-labelledby="related-title"><div class="journal-related-heading"><div><p class="eyebrow">TIRA DEL HILO</p><h2 id="related-title">Una idea lleva a otra.</h2></div><a class="text-link" href="/blog/">Todo el blog ${icon('arrow')}</a></div><div class="journal-related-grid">${articles.filter(item => item !== article).map(item => card(item)).join('')}</div></section>${visitCta()}`;
}

export { articles };
