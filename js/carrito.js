const CLAVE_CARRITO = 'miga-sabor-carrito';

function sanitizarTexto(valor) {
    return String(valor ?? '')
        .replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;');
}

function cargarCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));

        if (!guardado || typeof guardado !== 'object' || Array.isArray(guardado)) {
            return {};
        }

        return Object.entries(guardado).reduce((carritoValido, [nombre, detalle]) => {
            const producto = productos.find(item => item.nombre === nombre);

            if (!detalle || typeof detalle !== 'object' || Array.isArray(detalle)) {
                return carritoValido;
            }

            const cantidad = Number(detalle.cantidad);

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
