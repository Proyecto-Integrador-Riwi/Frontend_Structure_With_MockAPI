const MAX_TOASTS = 3;

const Toast = {
    show(message, type = "success", duration = 4000) {
        const existing = document.querySelector("#toast-container");
        let container = existing;
        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm";
            container.setAttribute("aria-live", "polite");
            container.setAttribute("aria-relevant", "additions");
            document.body.appendChild(container);
        }

        // Limit visible toasts
        while (container.children.length >= MAX_TOASTS) {
            container.firstChild.remove();
        }

        const toast = document.createElement("div");
        toast.setAttribute("role", "alert");
        const colors = {
            success: "bg-green-50 border-green-400 text-green-800",
            error: "bg-error-light border-red-400 text-error",
            info: "bg-primary-light border-blue-400 text-primary",
            warning: "bg-warm-light border-yellow-400 text-warm"
        };
        const icons = {
            success: `<svg class="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            error: `<svg class="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            info: `<svg class="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
            warning: `<svg class="w-5 h-5 text-warm flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`
        };

        toast.className = `flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg ${colors[type] || colors.info}`;
        toast.style.animation = "toastIn 0.3s ease-out";
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <p class="text-sm font-medium flex-1">${message}</p>
            <button class="close-toast flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Cerrar">
                <svg class="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        `;

        toast.querySelector(".close-toast").addEventListener("click", () => {
            toast.style.animation = "toastOut 0.3s ease-in forwards";
            setTimeout(() => toast.remove(), 300);
        });

        container.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = "toastOut 0.3s ease-in forwards";
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },
    success(msg, duration) { this.show(msg, "success", duration); },
    error(msg, duration) { this.show(msg, "error", duration); },
    info(msg, duration) { this.show(msg, "info", duration); },
    warning(msg, duration) { this.show(msg, "warning", duration); }
};

export default Toast;
