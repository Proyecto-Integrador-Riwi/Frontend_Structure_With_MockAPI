/** Configuracion de usuario — cambio de contrasena y selector de tema oscuro. */
import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

const STORAGE_THEME_KEY = "nexoedu-theme";

function getStoredTheme() {
    return localStorage.getItem(STORAGE_THEME_KEY) || "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_THEME_KEY, theme);
}

const Configuracion = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "max-w-2xl mx-auto px-6 py-10";

            const currentTheme = getStoredTheme();

            content.innerHTML = `
                <h1 class="text-2xl font-bold text-gray-800 mb-8">Configuración</h1>

                <section class="mb-8">
                    <div class="bg-white rounded-2xl shadow p-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Apariencia</h2>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-base font-semibold text-gray-700">Tema</p>
                                <p class="text-sm text-muted mt-0.5">Claro / Oscuro</p>
                            </div>
                            <button id="theme-toggle"
                                class="relative flex cursor-pointer w-18 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                style="background:${currentTheme === "dark" ? "var(--rol-primary, #001833)" : "#d1d5db"}"
                                aria-label="Cambiar tema">
                                <span id="theme-toggle-thumb" class="absolute  left-1.5 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-400"
                                    style="transform:translateX(${currentTheme === "dark" ? "28px" : "0"})">
                                    <svg id="theme-icon-sun" class="w-5 h-5 text-yellow-500 ${currentTheme === "dark" ? "hidden" : "block"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="5"></circle>
                                        <line x1="12" y1="1" x2="12" y2="3"></line>
                                        <line x1="12" y1="21" x2="12" y2="23"></line>
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                        <line x1="1" y1="12" x2="3" y2="12"></line>
                                        <line x1="21" y1="12" x2="23" y2="12"></line>
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                    </svg>
                                    <svg id="theme-icon-moon" class="hidden w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="bg-white rounded-2xl shadow p-6">
                        <h2 class="text-xl font-semibold text-gray-800 mb-4">Cambiar Contraseña</h2>
                        <form id="password-form" class="space-y-4" novalidate>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-current-password">Contraseña actual</label>
                                <input type="password" id="cfg-current-password" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-current-password-error" />
                                <p id="cfg-current-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-new-password">Nueva contraseña</label>
                                <input type="password" id="cfg-new-password" required minlength="6"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-new-password-error" />
                                <p id="cfg-new-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-confirm-password">Confirmar nueva contraseña</label>
                                <input type="password" id="cfg-confirm-password" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-confirm-password-error" />
                                <p id="cfg-confirm-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>

                            <div id="cfg-message" class="hidden text-sm rounded-lg p-3" role="alert"></div>

                            <div class="flex justify-end">
                                <button type="submit" id="cfg-save" class="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            `;

            content.querySelector("#theme-toggle").addEventListener("click", () => {
                const next = getStoredTheme() === "dark" ? "light" : "dark";
                applyTheme(next);
                const btn = content.querySelector("#theme-toggle");
                const thumb = content.querySelector("#theme-toggle-thumb");
                const sun = content.querySelector("#theme-icon-sun");
                const moon = content.querySelector("#theme-icon-moon");
                btn.style.background = next === "dark" ? "var(--rol-primary, #142334)" : "#d1d5db";
                thumb.style.transform = next === "dark" ? "translateX(28px)" : "translateX(0)";
                sun.classList.toggle("hidden", next === "dark");
                sun.classList.toggle("block", next !== "dark");
                moon.classList.toggle("hidden", next !== "dark");
                moon.classList.toggle("block", next === "dark");
            });

            const form = content.querySelector("#password-form");
            const msg = content.querySelector("#cfg-message");

            const clearErrors = () => {
                ["current-password", "new-password", "confirm-password"].forEach(f => {
                    const err = content.querySelector(`#cfg-${f}-error`);
                    if (err) { err.textContent = ""; err.classList.add("hidden"); }
                    const inp = content.querySelector(`#cfg-${f}`);
                    if (inp) inp.classList.remove("border-red-500");
                });
                msg.classList.add("hidden");
            };

            const showError = (id, text) => {
                const el = content.querySelector(id);
                if (el) {
                    el.textContent = text;
                    el.classList.remove("hidden");
                    const inp = el.previousElementSibling;
                    if (inp) inp.classList.add("border-red-500");
                }
            };

            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                clearErrors();

                const current = content.querySelector("#cfg-current-password").value;
                const newPass = content.querySelector("#cfg-new-password").value;
                const confirm = content.querySelector("#cfg-confirm-password").value;

                let valid = true;
                if (!current) { showError("#cfg-current-password-error", "La contraseña actual es obligatoria"); valid = false; }
                if (!newPass) { showError("#cfg-new-password-error", "La nueva contraseña es obligatoria"); valid = false; }
                else if (newPass.length < 6) { showError("#cfg-new-password-error", "Mínimo 6 caracteres"); valid = false; }
                if (newPass !== confirm) { showError("#cfg-confirm-password-error", "Las contraseñas no coinciden"); valid = false; }

                if (!valid) return;

                const saveBtn = content.querySelector("#cfg-save");
                saveBtn.disabled = true;
                saveBtn.innerHTML = '<span class="spinner"></span> Cambiando...';

                try {
                    const res = await http.post('api/auth/change-password', {
                        current_password: current,
                        new_password: newPass
                    });
                    const data = await res.json();
                    Toast.success(data.message || "Contraseña cambiada exitosamente");
                    content.querySelector("#cfg-current-password").value = "";
                    content.querySelector("#cfg-new-password").value = "";
                    content.querySelector("#cfg-confirm-password").value = "";
                } catch (err) {
                    msg.textContent = err.message || "Error al cambiar la contraseña";
                    msg.className = "text-sm rounded-lg p-3 bg-red-50 text-red-700";
                    msg.classList.remove("hidden");
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Cambiar Contraseña";
                }
            });

            return content;
        });
    }
};

applyTheme(getStoredTheme());

export default Configuracion;