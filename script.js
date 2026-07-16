const CLAVE_CARRITO = 'miga-sabor-carrito';

function cargarCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));

        if (!guardado || typeof guardado !== 'object' || Array.isArray(guardado)) {
            return {};
        }

        return Object.entries(guardado).reduce((carritoValido, [nombre, detalle]) => {
            const producto = productos.find(item => item.nombre === nombre);
            const cantidad = Number.parseInt(detalle?.cantidad, 10);

            const cantidadDisponible = producto ? Math.min(cantidad, producto.stock) : 0;

            if (producto && Number.isInteger(cantidadDisponible) && cantidadDisponible > 0) {
                carritoValido[nombre] = {
                    cantidad: cantidadDisponible,
                    precio: producto.precio
                };
            }

            return carritoValido;
        }, {});
    } catch {
        return {};
    }
}

function guardarCarrito() {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch {
        // El carrito continúa funcionando aunque el almacenamiento esté bloqueado.
    }
}

const carrito = cargarCarrito();

function agregarAlPedido(producto, precio, cantidad = 1) {
    const productoCatalogo = productos.find(item => item.nombre === producto);
    const cantidadActual = carrito[producto]?.cantidad || 0;
    const cantidadSolicitada = Math.max(1, Number.parseInt(cantidad, 10) || 1);
    const disponibles = productoCatalogo ? productoCatalogo.stock - cantidadActual : cantidadSolicitada;
    const cantidadAgregar = Math.min(cantidadSolicitada, disponibles);

    if (cantidadAgregar <= 0) {
        mostrarToast(`No hay más stock disponible de ${producto}.`);
        return;
    }

    if (carrito[producto]) {
        carrito[producto].cantidad += cantidadAgregar;
    } else {
        carrito[producto] = {
            cantidad: cantidadAgregar,
            precio
        };
    }

    guardarCarrito();
    actualizarVista();
    actualizarContadorCarrito();
    mostrarToast(`Producto agregado: ${producto}${cantidadAgregar > 1 ? ` × ${cantidadAgregar}` : ''}`);
}

function restarDelPedido(producto) {
    if (!carrito[producto]) {
        return;
    }

    carrito[producto].cantidad -= 1;

    if (carrito[producto].cantidad === 0) {
        delete carrito[producto];
    }

    guardarCarrito();
    actualizarVista();
    actualizarContadorCarrito();
}

function actualizarContadorCarrito() {
    const contador = document.getElementById('cart-count');
    const totalItems = Object.values(carrito).reduce(
        (total, detalle) => total + detalle.cantidad,
        0
    );

    contador.textContent = totalItems;
    contador.classList.toggle('is-visible', totalItems > 0);
}

function mostrarToast(mensaje) {
    const contenedor = document.getElementById('toast-container');
    const toast = document.createElement('div');

    toast.className = 'toast';
    toast.textContent = mensaje;
    contenedor.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('is-visible'));

    setTimeout(() => {
        toast.classList.remove('is-visible');
        toast.classList.add('is-leaving');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

function formatearPrecio(valor) {
    return `S/ ${valor.toFixed(2)}`;
}

function actualizarVista() {
    const contenedor = document.getElementById('resumen-pedido');
    const productos = Object.entries(carrito);

    if (productos.length === 0) {
        contenedor.innerHTML = "<p>Tu pedido está vacío.</p>";
    } else {
        const total = productos.reduce(
            (acumulado, [, detalle]) => acumulado + detalle.cantidad * detalle.precio,
            0
        );

        const items = productos.map(([producto, detalle]) => {
            const subtotal = detalle.cantidad * detalle.precio;

            return `
                <li>
                    ${producto} — ${detalle.cantidad} × ${formatearPrecio(detalle.precio)}
                    = <strong>${formatearPrecio(subtotal)}</strong>
                    <button type="button" onclick="restarDelPedido('${producto}')" aria-label="Restar una unidad de ${producto}">−</button>
                </li>
            `;
        }).join('');

        contenedor.innerHTML = `
            <ul>${items}</ul>
            <p><strong>Total: ${formatearPrecio(total)}</strong></p>
        `;
    }
}

function enviarWhatsApp() {
    const productos = Object.entries(carrito);

    if (productos.length === 0) {
        mostrarToast('Añade al menos un producto antes de continuar.');
        return;
    }

    abrirModalCheckout();
}

function crearResumenPedido(porcentajeDescuento = 0) {
    const items = Object.entries(carrito);
    const subtotal = items.reduce(
        (acumulado, [, detalle]) => acumulado + detalle.cantidad * detalle.precio,
        0
    );
    const descuento = subtotal * porcentajeDescuento;
    const total = subtotal - descuento;
    const detalle = items.map(([producto, datos]) => {
        const subtotal = datos.cantidad * datos.precio;
        return `- ${producto}: ${datos.cantidad} × ${formatearPrecio(datos.precio)} = ${formatearPrecio(subtotal)}`;
    }).join('\n');

    return { detalle, subtotal, descuento, total };
}

const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');

function cerrarMenu() {
    navMenu.classList.remove('menu-open');
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
}

menuToggle.addEventListener('click', () => {
    const menuAbierto = navMenu.classList.toggle('menu-open');
    menuToggle.classList.toggle('is-open', menuAbierto);
    menuToggle.setAttribute('aria-expanded', String(menuAbierto));
    menuToggle.setAttribute('aria-label', menuAbierto ? 'Cerrar menú' : 'Abrir menú');
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', cerrarMenu);
});

function obtenerTemaGuardado() {
    try {
        return localStorage.getItem('tema');
    } catch {
        return null;
    }
}

function guardarTema(tema) {
    try {
        localStorage.setItem('tema', tema);
    } catch {
        // La interfaz sigue funcionando aunque el almacenamiento no esté disponible.
    }
}

function aplicarTema(esOscuro) {
    const icono = themeToggle.querySelector('i');

    document.body.classList.toggle('dark-mode', esOscuro);
    themeToggle.setAttribute('aria-pressed', String(esOscuro));
    themeToggle.setAttribute('aria-label', esOscuro ? 'Activar modo claro' : 'Activar modo oscuro');
    icono.classList.toggle('fa-moon', !esOscuro);
    icono.classList.toggle('fa-sun', esOscuro);
}

const temaGuardado = obtenerTemaGuardado();
const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
aplicarTema(temaGuardado ? temaGuardado === 'oscuro' : prefiereOscuro);

themeToggle.addEventListener('click', () => {
    const activarOscuro = !document.body.classList.contains('dark-mode');
    aplicarTema(activarOscuro);
    guardarTema(activarOscuro ? 'oscuro' : 'claro');
});

const barraProgreso = document.getElementById('scroll-progress-bar');
const header = document.querySelector('header');

function actualizarProgresoScroll() {
    const documento = document.documentElement;
    const distanciaDisponible = documento.scrollHeight - documento.clientHeight;
    const progreso = distanciaDisponible > 0
        ? Math.min((documento.scrollTop / distanciaDisponible) * 100, 100)
        : 0;

    barraProgreso.style.width = `${progreso}%`;
    header.classList.toggle('is-scrolled', documento.scrollTop > 24);
}

window.addEventListener('scroll', actualizarProgresoScroll, { passive: true });
window.addEventListener('resize', actualizarProgresoScroll);
actualizarProgresoScroll();

const loadingScreen = document.getElementById('loading-screen');

function ocultarPantallaCarga() {
    setTimeout(() => {
        loadingScreen.classList.add('is-hidden');
        loadingScreen.setAttribute('aria-hidden', 'true');
        setTimeout(() => loadingScreen.remove(), 400);
    }, 750);
}

if (document.readyState === 'complete') {
    ocultarPantallaCarga();
} else {
    window.addEventListener('load', ocultarPantallaCarga, { once: true });
}

document.getElementById('current-year').textContent = new Date().getFullYear();

function establecerFlip(tarjeta, volteada) {
    const frente = tarjeta.querySelector('.card-front');
    const reverso = tarjeta.querySelector('.card-back');
    const disparador = tarjeta.querySelector('.card-flip-trigger');

    tarjeta.classList.toggle('is-flipped', volteada);
    disparador.setAttribute('aria-expanded', String(volteada));
    frente.setAttribute('aria-hidden', String(volteada));
    reverso.setAttribute('aria-hidden', String(!volteada));
    frente.inert = volteada;
    reverso.inert = !volteada;
}

function configurarFlipCards(tarjetas) {
    tarjetas.forEach(tarjeta => {
        const disparador = tarjeta.querySelector('.card-flip-trigger');
        const botonVolver = tarjeta.querySelector('.flip-back');

        establecerFlip(tarjeta, false);

        disparador.addEventListener('click', evento => {
            evento.stopPropagation();
            establecerFlip(tarjeta, true);
        });

        botonVolver.addEventListener('click', evento => {
            evento.stopPropagation();
            establecerFlip(tarjeta, false);
        });

        tarjeta.addEventListener('click', () => {
            if (tarjeta.classList.contains('is-flipped')) {
                establecerFlip(tarjeta, false);
            }
        });
    });
}

const elementosAnimados = document.querySelectorAll('.about-media, .about-content, .delivery-section, .map-container, .visit-info, .faq-item');
let observador;

if ('IntersectionObserver' in window) {
    observador = new IntersectionObserver((entradas, observer) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('is-visible');
                observer.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.15 });

    elementosAnimados.forEach(elemento => {
        elemento.classList.add('reveal');
        observador.observe(elemento);
    });
} else {
    elementosAnimados.forEach(elemento => elemento.classList.add('is-visible'));
}

function observarCards(tarjetas) {
    tarjetas.forEach(tarjeta => {
        if (observador) {
            tarjeta.classList.add('reveal');
            observador.observe(tarjeta);
        } else {
            tarjeta.classList.add('is-visible');
        }
    });
}

const catalogGrid = document.getElementById('catalog-grid');
const catalogEmpty = document.getElementById('catalog-empty');
const catalogSearch = document.getElementById('catalog-search');
const categoryFilters = document.getElementById('category-filters');
const catalogSort = document.getElementById('catalog-sort');
let categoriaActiva = 'Todos';
let busquedaActiva = '';
let ordenActivo = 'relevancia';

function escaparHTML(valor) {
    return String(valor).replace(/[&<>'"]/g, caracter => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    })[caracter]);
}

function normalizarTexto(valor) {
    return valor
        .toLocaleLowerCase('es')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function obtenerIconoCategoria(categoria) {
    return {
        Panes: 'fa-wheat-awn',
        Tortas: 'fa-cake-candles',
        Postres: 'fa-cookie-bite'
    }[categoria] || 'fa-bread-slice';
}

function crearCardProducto(producto) {
    const nombre = escaparHTML(producto.nombre);
    const descripcion = escaparHTML(producto.descripcion);
    const ingredientes = producto.ingredientes
        .map(ingrediente => `<li>${escaparHTML(ingrediente)}</li>`)
        .join('');
    const badgeDestacado = producto.destacado
        ? '<span class="product-badge">Más vendido</span>'
        : '';
    const badgeStock = producto.stock === 0
        ? '<span class="stock-badge is-out">Agotado</span>'
        : producto.stock < 5
            ? `<span class="stock-badge">¡Solo quedan ${producto.stock}!</span>`
            : '';
    const agotado = producto.stock === 0;

    return `
        <article class="card flip-card${agotado ? ' is-out-of-stock' : ''}" data-product-id="${escaparHTML(producto.id)}">
            <div class="card-inner">
                <div class="card-face card-front">
                    <div class="product-badges">${badgeDestacado}${badgeStock}</div>
                    <button class="card-flip-trigger" type="button" aria-label="Ver ingredientes de ${nombre}" aria-expanded="false">
                        <img class="card-image" src="${escaparHTML(producto.imagen)}" alt="${nombre}" loading="lazy">
                    </button>
                    <div class="card-content">
                        <span class="product-category">${escaparHTML(producto.categoria)}</span>
                        <h3>${nombre}</h3>
                        <p>${descripcion}</p>
                        <p class="product-price">${formatearPrecio(producto.precio)}</p>
                        <div class="card-purchase-controls">
                            <div class="quantity-selector" aria-label="Cantidad de ${nombre}">
                                <button type="button" data-quantity-action="minus" aria-label="Reducir cantidad" ${agotado ? 'disabled' : ''}>−</button>
                                <span data-quantity-value aria-live="polite">1</span>
                                <button type="button" data-quantity-action="plus" aria-label="Aumentar cantidad" ${agotado ? 'disabled' : ''}>+</button>
                            </div>
                            <button class="add-button" type="button" data-add-product="${escaparHTML(producto.id)}" ${agotado ? 'disabled' : ''}>${agotado ? 'Agotado' : 'Añadir'}</button>
                        </div>
                        <button class="quick-view-button" type="button" data-quick-view="${escaparHTML(producto.id)}">Ver más</button>
                    </div>
                </div>
                <div class="card-face card-back" aria-hidden="true">
                    <button class="flip-back" type="button" aria-label="Volver al producto ${nombre}">
                        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    </button>
                    <i class="fa-solid ${obtenerIconoCategoria(producto.categoria)} card-back-icon" aria-hidden="true"></i>
                    <h3>Ingredientes principales</h3>
                    <ul>${ingredientes}</ul>
                    <p class="flip-hint">Toca la tarjeta para volver</p>
                </div>
            </div>
        </article>
    `;
}

function renderizarCatalogo() {
    const textoBuscado = normalizarTexto(busquedaActiva);
    const resultados = productos.filter(producto => {
        const coincideCategoria = categoriaActiva === 'Todos' || producto.categoria === categoriaActiva;
        const contenido = normalizarTexto(`${producto.nombre} ${producto.descripcion}`);
        return coincideCategoria && contenido.includes(textoBuscado);
    });

    if (ordenActivo === 'precio-asc') {
        resultados.sort((a, b) => a.precio - b.precio);
    } else if (ordenActivo === 'precio-desc') {
        resultados.sort((a, b) => b.precio - a.precio);
    } else if (ordenActivo === 'nombre') {
        resultados.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }

    catalogGrid.innerHTML = resultados.map(crearCardProducto).join('');
    catalogEmpty.hidden = resultados.length > 0;

    const tarjetas = catalogGrid.querySelectorAll('.flip-card');
    configurarFlipCards(tarjetas);
    observarCards(tarjetas);

}

function debounce(funcion, espera = 300) {
    let temporizador;

    return (...argumentos) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcion(...argumentos), espera);
    };
}

catalogSearch.addEventListener('input', debounce(evento => {
    busquedaActiva = evento.target.value.trim();
    renderizarCatalogo();
}));

categoryFilters.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-category]');

    if (!boton) {
        return;
    }

    categoriaActiva = boton.dataset.category;
    categoryFilters.querySelectorAll('[data-category]').forEach(filtro => {
        const activo = filtro === boton;
        filtro.classList.toggle('is-active', activo);
        filtro.setAttribute('aria-pressed', String(activo));
    });
    renderizarCatalogo();
});

catalogSort.addEventListener('change', evento => {
    ordenActivo = evento.target.value;
    renderizarCatalogo();
});

catalogGrid.addEventListener('click', evento => {
    const tarjeta = evento.target.closest('.flip-card');
    const accionCantidad = evento.target.closest('[data-quantity-action]');
    const botonAgregar = evento.target.closest('[data-add-product]');
    const botonVistaRapida = evento.target.closest('[data-quick-view]');

    if (accionCantidad && tarjeta) {
        evento.stopPropagation();
        const producto = productos.find(item => item.id === tarjeta.dataset.productId);
        const valor = tarjeta.querySelector('[data-quantity-value]');
        const actual = Number.parseInt(valor.textContent, 10);
        valor.textContent = accionCantidad.dataset.quantityAction === 'plus'
            ? Math.min(actual + 1, producto.stock)
            : Math.max(actual - 1, 1);
        return;
    }

    if (botonAgregar && tarjeta) {
        evento.stopPropagation();
        const producto = productos.find(item => item.id === botonAgregar.dataset.addProduct);
        const cantidad = Number.parseInt(tarjeta.querySelector('[data-quantity-value]').textContent, 10);
        agregarAlPedido(producto.nombre, producto.precio, cantidad);
        tarjeta.querySelector('[data-quantity-value]').textContent = '1';
        return;
    }

    if (botonVistaRapida) {
        evento.stopPropagation();
        abrirVistaRapida(botonVistaRapida.dataset.quickView);
    }
});

const quickViewOverlay = document.getElementById('quick-view-modal');
const quickViewClose = document.getElementById('quick-view-close');
const quickViewContent = document.getElementById('quick-view-content');
let focoVistaRapida;

function actualizarBloqueoScroll() {
    document.body.classList.toggle('modal-open', !quickViewOverlay.hidden || !modalOverlay.hidden);
}

function abrirVistaRapida(idProducto) {
    const producto = productos.find(item => item.id === idProducto);

    if (!producto) return;

    focoVistaRapida = document.activeElement;
    const agotado = producto.stock === 0;
    quickViewContent.innerHTML = `
        <div class="quick-view-layout" data-quick-product="${escaparHTML(producto.id)}">
            <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}">
            <div class="quick-view-details">
                <span class="product-category">${escaparHTML(producto.categoria)}</span>
                <h2 id="quick-view-title">${escaparHTML(producto.nombre)}</h2>
                <p>${escaparHTML(producto.descripcion)}</p>
                <h3>Ingredientes</h3>
                <ul>${producto.ingredientes.map(item => `<li>${escaparHTML(item)}</li>`).join('')}</ul>
                <p class="product-price">${formatearPrecio(producto.precio)}</p>
                <p class="quick-stock">${agotado ? 'Agotado' : `Stock disponible: ${producto.stock}`}</p>
                <div class="quick-purchase-controls">
                    <div class="quantity-selector">
                        <button type="button" data-quick-quantity="minus" aria-label="Reducir cantidad" ${agotado ? 'disabled' : ''}>−</button>
                        <span data-quick-value>1</span>
                        <button type="button" data-quick-quantity="plus" aria-label="Aumentar cantidad" ${agotado ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="add-button" type="button" data-quick-add ${agotado ? 'disabled' : ''}>${agotado ? 'Agotado' : 'Añadir al pedido'}</button>
                </div>
            </div>
        </div>`;
    quickViewOverlay.hidden = false;
    actualizarBloqueoScroll();
    setTimeout(() => quickViewClose.focus(), 0);
}

function cerrarVistaRapida() {
    quickViewOverlay.hidden = true;
    actualizarBloqueoScroll();
    if (focoVistaRapida instanceof HTMLElement) focoVistaRapida.focus();
}

quickViewContent.addEventListener('click', evento => {
    const contenedor = evento.target.closest('[data-quick-product]');
    if (!contenedor) return;
    const producto = productos.find(item => item.id === contenedor.dataset.quickProduct);
    const valor = contenedor.querySelector('[data-quick-value]');

    if (evento.target.closest('[data-quick-quantity]')) {
        const accion = evento.target.closest('[data-quick-quantity]').dataset.quickQuantity;
        const actual = Number.parseInt(valor.textContent, 10);
        valor.textContent = accion === 'plus' ? Math.min(actual + 1, producto.stock) : Math.max(actual - 1, 1);
    } else if (evento.target.closest('[data-quick-add]')) {
        agregarAlPedido(producto.nombre, producto.precio, Number.parseInt(valor.textContent, 10));
        cerrarVistaRapida();
    }
});

quickViewClose.addEventListener('click', cerrarVistaRapida);
quickViewOverlay.addEventListener('click', evento => {
    if (evento.target === quickViewOverlay) cerrarVistaRapida();
});

const modalOverlay = document.getElementById('checkout-modal');
const modalClose = document.getElementById('modal-close');
const checkoutContent = document.getElementById('checkout-content');
const checkoutSuccess = document.getElementById('checkout-success');
const successClose = document.getElementById('success-close');
const checkoutForm = document.getElementById('checkout-form');
const customerName = document.getElementById('customer-name');
const deliveryAddress = document.getElementById('delivery-address');
const paymentMethod = document.getElementById('payment-method');
const deliveryWindow = document.getElementById('delivery-window');
const couponCode = document.getElementById('coupon-code');
const couponMessage = document.getElementById('coupon-message');
const checkoutSummary = document.getElementById('checkout-summary');
const recommendations = document.getElementById('checkout-recommendations');
const CUPONES = { MIGA10: 0.10, SABOR15: 0.15 };
const CLAVE_CLIENTE = 'miga-sabor-cliente';
let porcentajeDescuento = 0;
let cuponAplicado = '';
let focoAnterior;

function cargarDatosCliente() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CLIENTE));
        return datos && typeof datos === 'object' ? datos : {};
    } catch {
        return {};
    }
}

function guardarDatosCliente(datos) {
    try {
        localStorage.setItem(CLAVE_CLIENTE, JSON.stringify(datos));
    } catch {
        // El checkout continúa aunque el almacenamiento no esté disponible.
    }
}

function renderizarResumenCheckout() {
    const { subtotal, descuento, total } = crearResumenPedido(porcentajeDescuento);
    checkoutSummary.innerHTML = `
        <div><span>Subtotal</span><strong>${formatearPrecio(subtotal)}</strong></div>
        ${descuento > 0 ? `<div class="discount-line"><span>Descuento (${cuponAplicado})</span><strong>− ${formatearPrecio(descuento)}</strong></div>` : ''}
        <div class="checkout-total"><span>Total</span><strong>${formatearPrecio(total)}</strong></div>`;
}

function renderizarRecomendaciones() {
    const sugeridos = productos
        .filter(producto => !carrito[producto.nombre] && producto.stock > 0)
        .slice(0, 3);
    recommendations.innerHTML = sugeridos.map(producto => `
        <article class="recommendation-card">
            <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}" loading="lazy">
            <div><strong>${escaparHTML(producto.nombre)}</strong><span>${formatearPrecio(producto.precio)}</span></div>
            <button type="button" data-recommendation="${escaparHTML(producto.id)}" aria-label="Añadir ${escaparHTML(producto.nombre)}">+</button>
        </article>`).join('') || '<p>Ya elegiste nuestras principales recomendaciones.</p>';
}

function limpiarError(campo, idError) {
    campo.removeAttribute('aria-invalid');
    document.getElementById(idError).textContent = '';
}

function mostrarErrorCampo(campo, idError, mensaje) {
    campo.setAttribute('aria-invalid', 'true');
    document.getElementById(idError).textContent = mensaje;
}

function abrirModalCheckout() {
    const datos = cargarDatosCliente();
    focoAnterior = document.activeElement;
    checkoutForm.reset();
    customerName.value = datos.nombre || '';
    deliveryAddress.value = datos.direccion || '';
    paymentMethod.value = datos.pago || 'Efectivo';
    porcentajeDescuento = 0;
    cuponAplicado = '';
    couponCode.value = '';
    couponMessage.textContent = '';
    checkoutContent.hidden = false;
    checkoutSuccess.hidden = true;
    renderizarResumenCheckout();
    renderizarRecomendaciones();
    modalOverlay.hidden = false;
    actualizarBloqueoScroll();
    setTimeout(() => customerName.focus(), 0);
}

function cerrarModalCheckout() {
    modalOverlay.hidden = true;
    actualizarBloqueoScroll();
    limpiarError(customerName, 'name-error');
    limpiarError(deliveryAddress, 'address-error');
    if (focoAnterior instanceof HTMLElement) focoAnterior.focus();
}

document.getElementById('apply-coupon').addEventListener('click', () => {
    const codigo = couponCode.value.trim().toUpperCase();
    if (CUPONES[codigo]) {
        porcentajeDescuento = CUPONES[codigo];
        cuponAplicado = codigo;
        couponMessage.textContent = `Cupón aplicado: ${porcentajeDescuento * 100}% de descuento.`;
        couponMessage.className = 'field-message is-success';
    } else {
        porcentajeDescuento = 0;
        cuponAplicado = '';
        couponMessage.textContent = 'El código ingresado no es válido.';
        couponMessage.className = 'field-message is-error';
    }
    renderizarResumenCheckout();
});

recommendations.addEventListener('click', evento => {
    const boton = evento.target.closest('[data-recommendation]');
    if (!boton) return;
    const producto = productos.find(item => item.id === boton.dataset.recommendation);
    agregarAlPedido(producto.nombre, producto.precio);
    renderizarResumenCheckout();
    renderizarRecomendaciones();
});

modalClose.addEventListener('click', cerrarModalCheckout);
successClose.addEventListener('click', cerrarModalCheckout);
modalOverlay.addEventListener('click', evento => {
    if (evento.target === modalOverlay) cerrarModalCheckout();
});

document.addEventListener('keydown', evento => {
    const overlayActivo = !quickViewOverlay.hidden ? quickViewOverlay : !modalOverlay.hidden ? modalOverlay : null;
    if (!overlayActivo) return;
    if (evento.key === 'Escape') {
        overlayActivo === quickViewOverlay ? cerrarVistaRapida() : cerrarModalCheckout();
        return;
    }
    if (evento.key === 'Tab') {
        const elementos = [...overlayActivo.querySelectorAll('button, input, select, textarea')]
            .filter(elemento => !elemento.disabled && !elemento.closest('[hidden]'));
        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];
        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault(); ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault(); primero.focus();
        }
    }
});

customerName.addEventListener('input', () => limpiarError(customerName, 'name-error'));
deliveryAddress.addEventListener('input', () => limpiarError(deliveryAddress, 'address-error'));

checkoutForm.addEventListener('submit', evento => {
    evento.preventDefault();
    const nombre = customerName.value.trim();
    const direccion = deliveryAddress.value.trim();
    const pago = paymentMethod.value;
    const horario = deliveryWindow.value;
    const notas = document.getElementById('order-notes').value.trim();
    let formularioValido = true;
    if (!nombre) { mostrarErrorCampo(customerName, 'name-error', 'Ingresa tu nombre para continuar.'); formularioValido = false; }
    if (!direccion) { mostrarErrorCampo(deliveryAddress, 'address-error', 'Ingresa la dirección de entrega.'); formularioValido = false; }
    if (!formularioValido) { checkoutForm.querySelector('[aria-invalid="true"]').focus(); return; }

    const { detalle, subtotal, descuento, total } = crearResumenPedido(porcentajeDescuento);
    const telefono = '51900000000'; // Reemplaza con tu número real.
    const lineaDescuento = descuento > 0 ? `\nDescuento ${cuponAplicado}: -${formatearPrecio(descuento)}` : '';
    const notasPedido = notas ? `\nNotas: ${notas}` : '';
    const mensaje = encodeURIComponent(
        `¡Hola! Quisiera pedir el siguiente delivery:\n\nNombre: ${nombre}\nDirección: ${direccion}\nPago: ${pago}\nHorario: ${horario}${notasPedido}\n\n` +
        `${detalle}\n\nSubtotal: ${formatearPrecio(subtotal)}${lineaDescuento}\nTotal final: ${formatearPrecio(total)}`
    );

    guardarDatosCliente({ nombre, direccion, pago });
    checkoutContent.hidden = true;
    checkoutSuccess.hidden = false;
    setTimeout(() => successClose.focus(), 0);
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank', 'noopener');
});

const HORARIO_ATENCION = {
    0: { abre: 8 * 60, cierra: 14 * 60 },
    1: { abre: 7 * 60, cierra: 20 * 60 },
    2: { abre: 7 * 60, cierra: 20 * 60 },
    3: { abre: 7 * 60, cierra: 20 * 60 },
    4: { abre: 7 * 60, cierra: 20 * 60 },
    5: { abre: 7 * 60, cierra: 20 * 60 },
    6: { abre: 7 * 60, cierra: 20 * 60 }
};

function formatearHora(minutos) {
    const horas24 = Math.floor(minutos / 60);
    const minutosHora = minutos % 60;
    const periodo = horas24 >= 12 ? 'pm' : 'am';
    const horas12 = horas24 % 12 || 12;
    return `${horas12}:${String(minutosHora).padStart(2, '0')}${periodo}`;
}

function obtenerProximaApertura(fecha) {
    const diaActual = fecha.getDay();
    const minutosActuales = fecha.getHours() * 60 + fecha.getMinutes();
    const horarioHoy = HORARIO_ATENCION[diaActual];

    if (minutosActuales < horarioHoy.abre) {
        return { textoDia: '', hora: horarioHoy.abre };
    }

    for (let desplazamiento = 1; desplazamiento <= 7; desplazamiento += 1) {
        const siguienteDia = (diaActual + desplazamiento) % 7;
        const horario = HORARIO_ATENCION[siguienteDia];
        if (horario) {
            return {
                textoDia: desplazamiento === 1 ? 'mañana ' : '',
                hora: horario.abre
            };
        }
    }

    return { textoDia: '', hora: horarioHoy.abre };
}

function actualizarEstadoHorario(fecha = new Date()) {
    const horario = HORARIO_ATENCION[fecha.getDay()];
    const minutosActuales = fecha.getHours() * 60 + fecha.getMinutes();
    const abierto = minutosActuales >= horario.abre && minutosActuales < horario.cierra;
    const proximaApertura = abierto ? null : obtenerProximaApertura(fecha);

    document.querySelectorAll('.business-status').forEach(indicador => {
        indicador.classList.toggle('is-open', abierto);
        indicador.classList.toggle('is-closed', !abierto);
        indicador.querySelector('[data-business-status]').textContent = abierto
            ? 'Abierto ahora'
            : `Cerrado, abrimos ${proximaApertura.textoDia}a las ${formatearHora(proximaApertura.hora)}`;
        indicador.querySelector('[data-business-detail]').textContent = abierto
            ? `Atendemos hasta las ${formatearHora(horario.cierra)}`
            : 'Puedes dejar tu pedido por WhatsApp.';
    });
}

actualizarEstadoHorario();
setInterval(actualizarEstadoHorario, 60 * 1000);

document.querySelectorAll('.faq-item button').forEach(boton => {
    boton.addEventListener('click', () => {
        const debeAbrir = boton.getAttribute('aria-expanded') !== 'true';

        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('is-open');
            item.querySelector('button').setAttribute('aria-expanded', 'false');
        });

        if (debeAbrir) {
            boton.closest('.faq-item').classList.add('is-open');
            boton.setAttribute('aria-expanded', 'true');
        }
    });
});

renderizarCatalogo();
actualizarVista();
actualizarContadorCarrito();
