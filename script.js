const carrito = {};

function agregarAlPedido(producto, precio) {
    if (carrito[producto]) {
        carrito[producto].cantidad += 1;
    } else {
        carrito[producto] = {
            cantidad: 1,
            precio
        };
    }

    actualizarVista();
}

function restarDelPedido(producto) {
    if (!carrito[producto]) {
        return;
    }

    carrito[producto].cantidad -= 1;

    if (carrito[producto].cantidad === 0) {
        delete carrito[producto];
    }

    actualizarVista();
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
        alert("Por favor, añade productos primero.");
        return;
    }

    const telefono = "51900000000"; // Reemplaza con tu número real
    const total = productos.reduce(
        (acumulado, [, detalle]) => acumulado + detalle.cantidad * detalle.precio,
        0
    );
    const detallePedido = productos.map(([producto, detalle]) => {
        const subtotal = detalle.cantidad * detalle.precio;
        return `- ${producto}: ${detalle.cantidad} × ${formatearPrecio(detalle.precio)} = ${formatearPrecio(subtotal)}`;
    }).join('\n');
    const mensaje = encodeURIComponent(
        `¡Hola! Quisiera pedir el siguiente delivery:\n${detallePedido}\n\nTotal: ${formatearPrecio(total)}`
    );
    const url = `https://wa.me/${telefono}?text=${mensaje}`;

    window.open(url, '_blank');
}
