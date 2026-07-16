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

        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
            return {};
        }

        const nombre = typeof datos.nombre === 'string' ? sanitizarTexto(datos.nombre.slice(0, 120)) : '';
        const direccion = typeof datos.direccion === 'string' ? sanitizarTexto(datos.direccion.slice(0, 240)) : '';
        const metodosPermitidos = ['Efectivo', 'Yape', 'Plin'];
        const pago = metodosPermitidos.includes(datos.pago) ? datos.pago : 'Efectivo';

        return { nombre, direccion, pago };
    } catch {
        return {};
    }
}

function guardarDatosCliente(datos) {
    try {
        if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
            return;
        }

        const datosSeguros = {
            nombre: sanitizarTexto(datos.nombre).slice(0, 120),
            direccion: sanitizarTexto(datos.direccion).slice(0, 240),
            pago: ['Efectivo', 'Yape', 'Plin'].includes(datos.pago) ? datos.pago : 'Efectivo'
        };

        localStorage.setItem(CLAVE_CLIENTE, JSON.stringify(datosSeguros));
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
    const nombreSinSanitizar = customerName.value.trim();
    const direccionSinSanitizar = deliveryAddress.value.trim();
    const nombre = sanitizarTexto(nombreSinSanitizar);
    const direccion = sanitizarTexto(direccionSinSanitizar);
    const pago = paymentMethod.value;
    const horario = deliveryWindow.value;
    const notas = sanitizarTexto(document.getElementById('order-notes').value.trim());
    let formularioValido = true;
    if (!nombreSinSanitizar) { mostrarErrorCampo(customerName, 'name-error', 'Ingresa tu nombre para continuar.'); formularioValido = false; }
    if (!direccionSinSanitizar) { mostrarErrorCampo(deliveryAddress, 'address-error', 'Ingresa la dirección de entrega.'); formularioValido = false; }
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
