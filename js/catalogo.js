const catalogGrid = document.getElementById('catalog-grid');

function escaparHTML(valor) {
    return sanitizarTexto(valor);
}

function crearCardProducto(producto) {
    const nombre = escaparHTML(producto.nombre);
    const descripcion = escaparHTML(producto.descripcion);
    const ingredientes = producto.ingredientes
        .map(ingrediente => `<li>${escaparHTML(ingrediente)}</li>`)
        .join('');
    const agotado = producto.stock === 0;

    return `
        <article class="card flip-card${agotado ? ' is-out-of-stock' : ''}" data-product-id="${escaparHTML(producto.id)}">
            <div class="card-inner">
                <div class="card-face card-front">
                    <button class="card-flip-trigger" type="button" aria-label="Ver ingredientes de ${nombre}" aria-expanded="false">
                        <img class="card-image" src="${escaparHTML(producto.imagen)}" alt="${nombre}" loading="lazy">
                    </button>
                    <div class="card-content">
                        <h3>${nombre}</h3>
                        <p class="product-price">${formatearPrecio(producto.precio)}</p>
                        <button class="add-button" type="button" data-add-product="${escaparHTML(producto.id)}" aria-label="Añadir ${nombre} al carrito" ${agotado ? 'disabled' : ''}>
                            <span aria-hidden="true">${agotado ? '×' : '+'}</span>
                        </button>
                    </div>
                </div>
                <div class="card-face card-back" aria-hidden="true">
                    <button class="flip-back" type="button" aria-label="Volver al producto ${nombre}">
                        <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    </button>
                    <h3>${nombre}</h3>
                    <p class="card-back-description">${descripcion}</p>
                    <h4>Ingredientes principales</h4>
                    <ul>${ingredientes}</ul>
                    <p class="flip-hint">Toca la tarjeta para volver</p>
                </div>
            </div>
        </article>
    `;
}

function renderizarCatalogo() {
    catalogGrid.innerHTML = productos.map(crearCardProducto).join('');

    const tarjetas = catalogGrid.querySelectorAll('.flip-card');
    configurarFlipCards(tarjetas);
    observarCards(tarjetas);

}

catalogGrid.addEventListener('click', evento => {
    const tarjeta = evento.target.closest('.flip-card');
    const botonAgregar = evento.target.closest('[data-add-product]');

    if (botonAgregar && tarjeta) {
        evento.stopPropagation();
        const producto = productos.find(item => item.id === botonAgregar.dataset.addProduct);
        agregarAlPedido(producto.nombre, producto.precio, 1);
        return;
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
