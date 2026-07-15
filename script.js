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
    actualizarContadorCarrito();
    mostrarToast(`Producto agregado: ${producto}`);
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

function actualizarProgresoScroll() {
    const documento = document.documentElement;
    const distanciaDisponible = documento.scrollHeight - documento.clientHeight;
    const progreso = distanciaDisponible > 0
        ? Math.min((documento.scrollTop / distanciaDisponible) * 100, 100)
        : 0;

    barraProgreso.style.width = `${progreso}%`;
}

window.addEventListener('scroll', actualizarProgresoScroll, { passive: true });
window.addEventListener('resize', actualizarProgresoScroll);
actualizarProgresoScroll();

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

document.querySelectorAll('.flip-card').forEach(tarjeta => {
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

const elementosAnimados = document.querySelectorAll('.about-media, .about-content, .card, .item-emblema, .delivery-section');

if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver((entradas, observer) => {
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
