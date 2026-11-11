import { renderPage, routes } from './render.mjs';
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url)).replace(/\/$/, '');
const port = Number(process.env.PORT || 8783);
const clients = new Set();
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname === '/__reload' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(': connected\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }
  try {
    const route = decodeURIComponent(url.pathname);
    const pageRoute = route.replace(/\/index\.html$/, '/').replace(/([^/])$/, '$1/');
    if (routes.includes(pageRoute)) {
      const page = await renderPage(pageRoute);
      res.writeHead(200, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : page);
      return;
    }
    if (!['/styles.css', '/home.css', '/category.css', '/offer.css', '/contact.css', '/blog.css', '/app.js', '/contact.js', '/blog.js'].includes(route) && !route.startsWith('/assets/')) {
      res.writeHead(404).end('Página no encontrada');
      return;
    }
    const file = path.resolve(root, '.' + route);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) { res.writeHead(404).end(); return; }
    const content = req.method === 'HEAD' ? undefined : await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Length': info.size });
    res.end(content);
  } catch { if (!res.headersSent) res.writeHead(404); res.end('Recurso no encontrado'); }
});
let timer;
const watcher = watch(root, { recursive: true }, (_, file) => {
  if (!file || file.startsWith('dist/') || file.startsWith('node_modules/') || file.startsWith('qa/')) return;
  clearTimeout(timer); timer = setTimeout(() => { for (const client of clients) client.write('event: change\ndata: reload\n\n'); }, 200);
});
const heartbeat = setInterval(() => { for (const client of clients) client.write(': heartbeat\n\n'); }, 15000);
server.listen(port, '127.0.0.1', () => console.log(`Berroa Garden · Local: http://127.0.0.1:${port}/`));
function shutdown() { clearInterval(heartbeat); watcher.close(); for (const client of clients) client.end(); server.close(() => process.exit(0)); }
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
