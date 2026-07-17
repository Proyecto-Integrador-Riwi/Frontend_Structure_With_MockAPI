/** Tarjeta de estadistica con icono, valor y label. Usa IntersectionObserver para animar el conteo. */
function animateValue(el, rawValue, duration = 800) {
    const match = String(rawValue).match(/^([\d.]+)(.*)$/);
    if (!match) { el.textContent = rawValue; return; }

    const target = parseFloat(match[1]);
    const suffix = match[2];
    const isInteger = Number.isInteger(target);
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased * (isInteger ? 1 : 100)) / (isInteger ? 1 : 100);
        el.textContent = isInteger ? Math.floor(current) + suffix : current.toFixed(1) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

const StatsCard = {
    render(options = {}) {
        const {
            label = '',
            value = 0,
            icon = '',
            color = 'blue',
            description = ''
        } = options;

        const iconBgClasses = {
            blue: 'bg-primary-light',
            green: 'bg-success-light',
            yellow: 'bg-warm-light',
            red: 'bg-error-light',
            purple: 'bg-purple-50 text-purple-600',
            gray: 'bg-gray-50 text-gray-600'
        };

        const card = document.createElement('div');
        card.className = 'card card-hover p-6';

        card.innerHTML = `
            <div class="flex items-start justify-between">
                <div>
                    <p class="text-sm font-medium text-muted">${label}</p>
                    <p class="text-3xl font-bold text-gray-900 mt-2 count-value">${value}</p>
                    ${description ? `
                        <p class="text-sm text-gray-500 mt-1">${description}</p>
                    ` : ''}
                </div>
                ${icon ? `
                    <div class="p-3 rounded-lg ${iconBgClasses[color] || iconBgClasses.blue}">
                        ${icon}
                    </div>
                ` : ''}
            </div>
        `;

        const valueEl = card.querySelector('.count-value');
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateValue(valueEl, value);
                observer.disconnect();
            }
        }, { threshold: 0.3 });
        observer.observe(valueEl);

        return card;
    }
};

export default StatsCard;
