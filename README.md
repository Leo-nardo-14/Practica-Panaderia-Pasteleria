# Miga & Sabor

Sitio web estático para una panadería y pastelería artesanal. Permite explorar el catálogo, gestionar un carrito persistente y preparar pedidos para enviarlos mediante WhatsApp.

## Tecnologías

- HTML5 semántico
- CSS3 responsive con variables de diseño y modo oscuro
- JavaScript vanilla
- Font Awesome y Google Fonts mediante CDN
- `localStorage` para persistencia local

No utiliza frameworks, backend, bundler ni paso de compilación.

## Estructura

```text
Panaderia-Pasteleria/
├── assets/
│   └── img/                # Imágenes locales
├── css/
│   └── style.css          # Estilos y sistema visual
├── js/
│   ├── productos.js       # Datos del catálogo
│   ├── carrito.js         # Carrito, persistencia y utilidades seguras
│   ├── catalogo.js        # Render, búsqueda, filtros y vista rápida
│   ├── checkout.js        # Modal, validaciones y envío a WhatsApp
│   └── main.js            # Interfaz general e inicialización
├── favicon.svg
├── index.html
├── robots.txt
└── sitemap.xml
```

Los scripts se cargan en el orden indicado porque comparten funciones globales y el proyecto debe seguir funcionando sin herramientas de compilación.

## Funcionalidades

- Catálogo dinámico con búsqueda, filtros, ordenamiento y tarjetas de ingredientes.
- Carrito con cantidades, precios, stock y persistencia en `localStorage`.
- Checkout accesible en modal y generación del pedido para WhatsApp.
- Menú responsive, modo oscuro, animaciones, toasts y contador del carrito.
- Secciones de historia, ubicación, horario dinámico y preguntas frecuentes.
- Branding SVG, favicon, metadatos SEO, `robots.txt` y sitemap.
- Content Security Policy y sanitización básica de entradas.

## Ejecución local

Sirve la carpeta con cualquier servidor estático. Por ejemplo:

```powershell
npx serve .
```

Luego abre en el navegador la dirección indicada por el servidor.
