import { renderPage, routes } from './render.mjs';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const dist = new URL('dist/', root);
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ['styles.css', 'home.css', 'category.css', 'offer.css', 'contact.css', 'blog.css', 'app.js', 'contact.js', 'blog.js', 'assets']) {
  await cp(new URL(file, root), new URL(file, dist), { recursive: true });
}
for (const route of routes) {
  const folder = new URL(`.${route}`, dist);
  await mkdir(folder, { recursive: true });
  await writeFile(new URL('index.html', folder), await renderPage(route));
}
console.log(`Build estático preparado en dist/ (${routes.length} páginas)`);
