const imageRoot = '/assets/images/';

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function icon(name, small = false) {
  return `<svg class="icon${small ? ' icon-small' : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}

export function renderCategory(category, kind) {
  const e = escapeHtml;
  const isInterior = kind === 'interior';
  const image = e(category.image);
  const smallerImage = image.replace('-1100.webp', '-600.webp');
  const [articleImage, articleAlt, articleTitle, articleText, articleUrl] = category.article;
  const [sourceTitle, sourceUrl] = category.source;
  return `
    <section class="category-masthead" aria-labelledby="category-title">
      <div class="wrap category-opening">
        <div class="category-opening-copy">
          <nav class="category-breadcrumb" aria-label="Ruta de navegación">
            <ol>
              <li><a href="/">Inicio</a></li>
              <li><span aria-current="page">${e(category.label)}</span></li>
            </ol>
          </nav>
          <h1 id="category-title">Plantas <em>de ${kind}</em></h1>
          <p>${e(category.intro)}</p>
          <div class="category-opening-actions">
            <a class="button button-primary" href="#ideas">Ver ideas ${icon('arrow', true)}</a>
            <a class="text-link" href="#como-elegir">Cómo elegir</a>
          </div>
        </div>
        <picture class="category-opening-image">
          <source media="(max-width: 720px)" srcset="${imageRoot}${smallerImage}">
          <img src="${imageRoot}${image}" width="1100" height="${isInterior ? 732 : 617}" alt="${e(category.alt)}" fetchpriority="high">
        </picture>
      </div>
    </section>

    <section class="wrap category-section category-tips" id="como-elegir" aria-labelledby="category-tips-title">
      <h2 id="category-tips-title" data-reveal="rise">${e(category.tipsTitle)}</h2>
      <ul class="category-tips-grid">
        ${category.tips.map(([symbol, title, text], i) => `
          <li data-reveal="rise" data-reveal-delay="${i * 60}">
            <h3>${icon(symbol, true)} ${e(title)}</h3>
            <p>${e(text)}</p>
          </li>`).join('')}
      </ul>
    </section>

    <section class="category-ideas" id="ideas" aria-labelledby="category-ideas-title">
      <div class="wrap category-section">
        <h2 id="category-ideas-title" data-reveal="rise">${e(category.galleryTitle)}</h2>
        <div class="category-ideas-grid">
          ${category.ideas.map(([file, alt, title, text], i) => `
            <article class="category-idea" data-reveal="tile" data-reveal-delay="${i * 65}">
              <img src="${imageRoot}${e(file)}" alt="${e(alt)}" loading="lazy" width="640" height="440">
              <div><h3>${e(title)}</h3><p>${e(text)}</p></div>
            </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="wrap category-section category-questions" aria-labelledby="category-questions-title">
      <div>
        <h2 id="category-questions-title" data-reveal="rise">Preguntas frecuentes</h2>
        <a class="category-source" href="${e(sourceUrl)}" target="_blank" rel="noopener">${e(sourceTitle)} ${icon('diagonal', true)}</a>
      </div>
      <div class="category-accordion">
        ${category.questions.map(([question, answer]) => `
          <details>
            <summary>${e(question)}<span aria-hidden="true"></span></summary>
            <p>${e(answer)}</p>
          </details>`).join('')}
      </div>
    </section>

    <section class="wrap category-end" aria-label="Asesoramiento e inspiración">
      <div class="category-advice" data-reveal="tile">
        <h2>Te ayudamos a elegir</h2>
        <p>${e(category.advice)}</p>
        <a class="button button-primary" href="/contacto/#ubicacion">Ven a conocernos ${icon('arrow', true)}</a>
      </div>
      <a class="category-reading" href="${e(articleUrl)}" data-reveal="tile" data-reveal-delay="95">
        <img src="${imageRoot}${e(articleImage)}" alt="${e(articleAlt)}" width="180" height="230" loading="lazy">
        <div>
          <span class="eyebrow">EN EL BLOG DE BERROA</span>
          <h2>${e(articleTitle)}</h2>
          <p>${e(articleText)}</p>
          <span class="category-reading-link">Leer el artículo ${icon('diagonal', true)}</span>
        </div>
      </a>
    </section>
  `;
}
