import { readFile } from 'node:fs/promises';
import { renderCategory } from './category.mjs';
import { articles, renderBlog, renderArticle } from './blog.mjs';

const pages = new URL('../pages/', import.meta.url);
const offerRoute = '/productos-y-servicios/';
const contactRoute = '/contacto/';
const staticPages = {
  '/': {
    source: 'home.html',
    title: 'Berroa Garden · Tu lado más verde, en Huarte',
    description: 'Plantas, flores y asesoramiento para tu casa y tu jardín. Ven a conocernos a Berroa Garden, en Huarte, Navarra.',
    bodyClass: 'home-page',
    styles: ['/home.css'],
  },
  [offerRoute]: {
    source: 'offer.html',
    title: 'Productos y servicios · Berroa Garden',
    description: 'Descubre las plantas, la floristería, la decoración y los servicios de Berroa Garden en Huarte, Navarra.',
    bodyClass: 'offer-page',
    styles: ['/category.css', '/offer.css'],
  },
  [contactRoute]: {
    source: 'contact.html',
    title: 'Contacto · Berroa Garden',
    description: 'Escríbenos, llama o ven a Berroa Garden en Huarte. Encuentra nuestra dirección y prepara tu consulta paso a paso.',
    bodyClass: 'contact-page',
    styles: ['/category.css', '/contact.css'],
    scripts: ['/contact.js'],
  },
};
const categoryKinds = { '/plantas-de-interior/': 'interior', '/plantas-de-exterior/': 'exterior' };
const articleRoutes = Object.fromEntries(articles.map(article => [`/blog/${article.slug}/`, article]));
export const routes = [...Object.keys(staticPages), ...Object.keys(categoryKinds), '/blog/', ...Object.keys(articleRoutes)];

export async function renderPage(route) {
  const kind = categoryKinds[route];
  const article = articleRoutes[route];
  const isBlog = route === '/blog/' || Boolean(article);
  const staticPage = isBlog ? {
    title: article ? `${article.title} · Blog de Berroa Garden` : 'Ideas para vivir más verde · Blog de Berroa Garden',
    description: article?.excerpt ?? 'Ideas de decoración, cuidados de plantas y espacios al aire libre. Descubre el blog de Berroa Garden, en Huarte, Navarra.',
    bodyClass: article ? 'article-page' : 'blog-page',
    styles: ['/category.css', '/blog.css'],
    scripts: ['/blog.js'],
  } : staticPages[route];
  const [layout, page, chatbot] = await Promise.all([
    readFile(new URL('layout.html', pages), 'utf8'),
    isBlog ? Promise.resolve(article ? renderArticle(article) : renderBlog()) : readFile(new URL(staticPage?.source ?? 'categories.json', pages), 'utf8'),
    readFile(new URL('chatbot.html', pages), 'utf8'),
  ]);
  const category = kind ? JSON.parse(page)[kind] : null;
  const metadata = staticPage ?? {
    title: `${category.label} · Berroa Garden`,
    description: category.description,
    bodyClass: `category-page category-${kind}`,
    styles: ['/category.css'],
  };

  const values = {
    ...metadata,
    chatbot,
    pageStyles: metadata.styles.map(href => `<link rel="stylesheet" href="${href}">`).join(''),
    pageScripts: (metadata.scripts ?? []).map(src => `<script src="${src}" defer></script>`).join(''),
    homePrefix: route === '/' ? '' : '/',
    offerCurrent: route === offerRoute ? ' aria-current="page"' : '',
    contactCurrent: route === contactRoute ? ' aria-current="page"' : '',
    blogCurrent: isBlog ? ' aria-current="page"' : '',
    interiorCurrent: kind === 'interior' ? ' aria-current="page"' : '',
    exteriorCurrent: kind === 'exterior' ? ' aria-current="page"' : '',
    content: category ? renderCategory(category, kind) : page,
  };

  return layout.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key]);
}
