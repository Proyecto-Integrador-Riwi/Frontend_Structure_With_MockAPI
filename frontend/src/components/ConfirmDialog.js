/** Dialogo modal de confirmacion reutilizable. */
const ConfirmDialog = {
    _lastFocused: null,

    show({ title = "Confirmar", message = "¿Estás seguro?", confirmText = "Aceptar", cancelText = "Cancelar", onConfirm, onCancel, destructive = false } = {}) {
        const existing = document.querySelector("#confirm-overlay");
        if (existing) existing.remove();

        this._lastFocused = document.activeElement;

        const overlay = document.createElement("div");
        overlay.id = "confirm-overlay";
        overlay.className = "fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4";
        overlay.style.animation = "fadeIn 0.2s ease-out";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-labelledby", "confirm-title");
        overlay.setAttribute("aria-describedby", "confirm-message");

        overlay.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4 sm:mx-auto" style="animation: fadeInUp 0.25s ease-out">
                <h3 id="confirm-title" class="text-lg font-bold text-gray-800 mb-2">${title}</h3>
                <p id="confirm-message" class="text-gray-600 text-sm mb-6">${message}</p>
                <div class="flex justify-end gap-3">
                    <button id="confirm-cancel" class="btn-secondary text-sm">${cancelText}</button>
                    <button id="confirm-ok" class="${destructive ? 'px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors' : 'btn-primary text-sm'}">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const okBtn = overlay.querySelector("#confirm-ok");
        const cancelBtn = overlay.querySelector("#confirm-cancel");

        okBtn.focus();

        const close = () => {
            overlay.remove();
            if (this._lastFocused && document.body.contains(this._lastFocused)) {
                this._lastFocused.focus();
            }
            this._lastFocused = null;
        };

        cancelBtn.addEventListener("click", () => { close(); if (onCancel) onCancel(); });
        okBtn.addEventListener("click", () => { close(); if (onConfirm) onConfirm(); });

        // Focus trap
        const focusable = [cancelBtn, okBtn];
        overlay.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { e.preventDefault(); close(); if (onCancel) onCancel(); }
            if (e.key === "Tab") {
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }
};

export default ConfirmDialog;
