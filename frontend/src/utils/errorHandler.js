/** Creador de vista de error con mensaje y boton de reintento. */
export function createErrorView(message = "Error al cargar datos") {
    const div = document.createElement("div");
    div.className = "flex flex-col items-center justify-center py-20 text-center content-fade-in";
    div.innerHTML = `
        <svg class="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-gray-500 mb-4">${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
    `;
    return div;
}
