# Berroa Garden · Prototipo de rediseño

Prototipo navegable con cabecera y pie compartidos, páginas de plantas de interior y exterior, productos y servicios, contacto y blog con tres entradas.

## Desarrollo local

Requiere Node.js 20 o posterior. No tiene dependencias externas de npm.

```sh
npm run dev
```

Abrir http://127.0.0.1:8783/. El servidor recarga las páginas al cambiar HTML, CSS y JavaScript del navegador. Tras modificar los módulos de renderizado en `scripts/` o `pages/articles.mjs`, reiniciar el servidor.

## Build estático

```sh
npm run build
```

Genera las nueve páginas y los recursos en `dist/`. Para alojamiento estático, utilizar `npm run build` como comando de compilación y `dist` como directorio de salida. El servidor de desarrollo sirve únicamente para trabajar en local.

## Páginas

- `/`
- `/plantas-de-interior/`
- `/plantas-de-exterior/`
- `/productos-y-servicios/`
- `/contacto/`
- `/blog/`
- `/blog/cestas-naturales-decoracion-plantas/`
- `/blog/sombra-jardin-terraza/`
- `/blog/hormigas-insectos-jardin/`

## Contenido de la demostración

El formulario de contacto simula el envío. No envía correos ni guarda los datos personales introducidos. Los enlaces de teléfono, correo y Google Maps sí abren sus destinos correspondientes.

Las entradas de blog son borradores editoriales del rediseño. Las fotografías y los recursos de marca proceden de la recopilación de Berroa Garden y Jardinarium. `assets/sources.json` conserva la procedencia de los recursos. Las fuentes de consulta se muestran también al final de cada entrada. La publicación final requiere revisar el contenido, los permisos de reutilización, los datos comerciales y las páginas legales.
