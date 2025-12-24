function mostrarPromo() {
    const promo = document.getElementById('promo-text');
    promo.classList.toggle('hidden');
    
    if(!promo.classList.contains('hidden')) {
        console.log("El cliente vio la promoción");
    }
}