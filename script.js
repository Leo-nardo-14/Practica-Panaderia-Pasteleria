let carrito = [];

function agregarAlPedido(producto) {
    carrito.push(producto);
    actualizarVista();
}

function actualizarVista() {
    const contenedor = document.getElementById('resumen-pedido');
    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu pedido está vacío.</p>";
    } else {
        contenedor.innerHTML = `<ul>${carrito.map(item => `<li>${item}</li>`).join('')}</ul>`;
    }
}

function enviarWhatsApp() {
    if (carrito.length === 0) {
        alert("Por favor, añade productos primero.");
        return;
    }
    
    const telefono = "51900000000"; // Reemplaza con tu número real
    const mensaje = encodeURIComponent(`¡Hola! Quisiera pedir el siguiente delivery:\n- ${carrito.join('\n- ')}`);
    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    
    window.open(url, '_blank');
}