const catalogGrid = document.getElementById('catalog-grid');
const catalogEmpty = document.getElementById('catalog-empty');
const catalogSearch = document.getElementById('catalog-search');
const categoryFilters = document.getElementById('category-filters');
const catalogSort = document.getElementById('catalog-sort');
let categoriaActiva = 'Todos';
let busquedaActiva = '';
let ordenActivo = 'relevancia';

function escaparHTML(valor) {
    return sanitizarTexto(valor);
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
