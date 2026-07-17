/** Estado vacio con icono y mensaje para listas sin resultados. */
const ILLUSTRATIONS = {
    'campaigns': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <rect x="10" y="20" width="60" height="44" rx="6" stroke="currentColor" stroke-width="2" fill="url(#empty-camp-bg)"/>
            <rect x="18" y="32" width="44" height="4" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="18" y="40" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.2"/>
            <rect x="18" y="47" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>
            <circle cx="60" cy="24" r="10" fill="currentColor" opacity="0.1"/>
            <path d="M57 24h6M60 21v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <defs><linearGradient id="empty-camp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
    'search': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="34" cy="34" r="18" stroke="currentColor" stroke-width="2.5" fill="url(#empty-search-bg)"/>
            <path d="M47 47l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="34" cy="34" r="6" fill="currentColor" opacity="0.1"/>
            <defs><linearGradient id="empty-search-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
    'enrollments': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <rect x="12" y="16" width="56" height="52" rx="6" stroke="currentColor" stroke-width="2" fill="url(#empty-enroll-bg)"/>
            <path d="M28 34l8 8 16-16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
            <rect x="16" y="10" width="48" height="8" rx="4" fill="currentColor" opacity="0.08"/>
            <defs><linearGradient id="empty-enroll-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
    'students': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="32" cy="28" r="10" stroke="currentColor" stroke-width="2" fill="url(#empty-stud-bg)"/>
            <path d="M18 56c0-8 6-14 14-14s14 6 14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="56" cy="32" r="7" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <path d="M48 52c0-5.6 4-10 8-10s8 4.4 8 10" stroke="currentColor" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
            <defs><linearGradient id="empty-stud-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
    'pinned': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <path d="M40 12v4M28 28l-6-6M52 28l6-6M40 28v32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
            <path d="M28 44c0 6.6 5.4 12 12 12s12-5.4 12-12" stroke="currentColor" stroke-width="2.5" fill="url(#empty-pin-bg)"/>
            <path d="M40 52v12M32 64h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
            <defs><linearGradient id="empty-pin-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
    'eye': `
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <path d="M12 40c0 0 12-18 28-18s28 18 28 18-12 18-28 18-28-18-28-18z" stroke="currentColor" stroke-width="2" fill="url(#empty-eye-bg)"/>
            <circle cx="40" cy="40" r="6" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.08"/>
            <defs><linearGradient id="empty-eye-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,
};

const EmptyState = {
    render(type = 'campaigns', message = 'No hay datos disponibles') {
        const wrapper = document.createElement('div');
        wrapper.className = 'empty-state';
        wrapper.innerHTML = `
            ${this.svg(type)}
            <p class="text-gray-400">${message}</p>
        `;
        return wrapper;
    },

    html(type = 'campaigns', message = 'No hay datos disponibles') {
        return `
            <div class="empty-state">
                ${this.svg(type)}
                <p class="text-gray-400">${message}</p>
            </div>
        `;
    },

    svg(type = 'campaigns') {
        return ILLUSTRATIONS[type] || ILLUSTRATIONS.campaigns;
    }
};

export default EmptyState;
