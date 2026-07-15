const TYPE_ICONS = {
    'academico': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
    'cultural': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/></svg>`,
    'deportivo': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    'tecnologia': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
    'salud': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
    'medio_ambiente': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    'artes': `<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`,
};

const TYPE_BADGE_COLORS = {
    'academico': 'badge-blue',
    'cultural': 'badge-yellow',
    'deportivo': 'badge-green',
    'tecnologia': 'badge-blue',
    'salud': 'badge-red',
    'medio_ambiente': 'badge-green',
    'artes': 'badge-yellow',
};

const CampaignCard = {
    render(campaign, options = {}) {
        const {
            showEnrollButton = false,
            onEnroll = () => {}
        } = options;

        const now = new Date();
        const start = new Date(campaign.start_date);
        const end = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31');

        let status = 'Próxima';
        let statusColor = 'badge-yellow';

        if (now >= start && now <= end) {
            status = 'Activa';
            statusColor = 'badge-green';
        } else if (now > end) {
            status = 'Finalizada';
            statusColor = 'badge-gray';
        }

        const formatDate = (date) => {
            return new Intl.DateTimeFormat('es-CO', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }).format(date);
        };

        const typeKey = (campaign.type || '').toLowerCase().replace(/\s+/g, '_');
        const typeIcon = TYPE_ICONS[typeKey] || TYPE_ICONS['academico'];
        const typeBadgeClass = TYPE_BADGE_COLORS[typeKey] || 'badge-blue';

        const card = document.createElement('div');
        card.className = 'card card-hover flex flex-col h-full';

        card.innerHTML = `
            <div class="relative h-40 gradient-barranquilla overflow-hidden">
                ${campaign.url_multimedia ? `
                    <img 
                        src="${campaign.url_multimedia}" 
                        alt="${campaign.title}"
                        class="w-full h-full object-cover"
                    />
                ` : `
                    <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                `}

                <div class="absolute top-3 right-3">
                    <span class="badge ${statusColor}">
                        ${status}
                    </span>
                </div>

                ${campaign.sponsor ? `
                    <div class="absolute bottom-3 left-3">
                        <span class="px-2 py-1 rounded text-xs font-medium bg-white/90 text-gray-700">
                            ${campaign.sponsor}
                        </span>
                    </div>
                ` : ''}
            </div>

            <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    ${campaign.title}
                </h3>

                <div class="mb-2">
                    <span class="badge ${typeBadgeClass} inline-flex items-center">
                        ${typeIcon}
                        ${campaign.type || 'General'}
                    </span>
                </div>

                <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    ${campaign.description || 'Sin descripción'}
                </p>

                <div class="flex items-center text-sm text-gray-500 mb-4">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>${formatDate(start)} - ${campaign.end_date ? formatDate(end) : 'Sin fin'}</span>
                </div>

                <div class="flex items-center text-sm text-gray-500 mb-4">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>${campaign.enrollment_count || 0} inscritos</span>
                </div>

                ${showEnrollButton && status === 'Activa' ? `
                    <button 
                        class="btn-primary w-full text-center"
                        data-campaign-id="${campaign.id}"
                    >
                        Inscribirse
                    </button>
                ` : ''}
            </div>
        `;

        if (showEnrollButton) {
            const enrollBtn = card.querySelector('[data-campaign-id]');
            if (enrollBtn) {
                enrollBtn.addEventListener('click', () => {
                    onEnroll(campaign.id);
                });
            }
        }

        return card;
    }
};

export default CampaignCard;
