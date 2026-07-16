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
        const tema = localStorage.getItem('tema');
        return tema === 'oscuro' || tema === 'claro' ? tema : null;
    } catch {
        return null;
    }
}

function guardarTema(tema) {
    try {
        if (tema === 'oscuro' || tema === 'claro') {
            localStorage.setItem('tema', tema);
        }
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

document.getElementById('checkout-button').addEventListener('click', enviarWhatsApp);

renderizarCatalogo();
actualizarVista();
actualizarContadorCarrito();
