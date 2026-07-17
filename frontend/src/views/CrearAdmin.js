/** Crear administrador de institucion — solo accesible por SUPERADMIN. */
import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import Router from "../modules/router";
import * as InstitutionService from "../services/institutionService";

let _adminRoleId = null;

const CrearAdmin = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-3xl mx-auto";

            content.innerHTML = `
                <div class="content-fade-in">
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">Crear Administrador</h1>

                    <form id="admin-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <div>
                                <label for="adm-username" class="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
                                <input id="adm-username" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Usuario para iniciar sesión" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-username-error"></p>
                            </div>

                            <div>
                                <label for="adm-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                <input id="adm-password" type="password" required minlength="6"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Mínimo 6 caracteres" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-password-error"></p>
                            </div>

                            <div>
                                <label for="adm-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                                <input id="adm-confirm-password" type="password" required minlength="6"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Repite la contraseña" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-confirm-password-error"></p>
                            </div>

                            <div>
                                <label for="adm-institution" class="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
                                <select id="adm-institution" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar institución...</option>
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-institution-error"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" onclick="window.history.back()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
                            <button type="submit" class="btn-primary px-6" id="adm-submit">Crear administrador</button>
                        </div>
                    </form>
                </div>
            `;

            // Obtener role_id de ADMINISTRADOR
            (async () => {
                try {
                    const roles = await http.getJSON('api/user-roles');
                    const adminRole = roles.find(r => r.name === 'ADMINISTRADOR');
                    if (adminRole) _adminRoleId = adminRole.id;
                } catch (err) {
                    console.error("Error loading roles:", err);
                }
            })();

            // Cargar instituciones
            (async () => {
                try {
                    const institutions = await InstitutionService.getInstitutions();
                    const select = content.querySelector("#adm-institution");
                    institutions.forEach(inst => {
                        const opt = document.createElement("option");
                        opt.value = inst.id;
                        opt.textContent = inst.institution_name;
                        select.appendChild(opt);
                    });
                } catch (err) {
                    console.error("Error loading institutions:", err);
                }
            })();

            const form = content.querySelector("#admin-form");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const usernameVal = content.querySelector("#adm-username").value.trim();
                const passwordVal = content.querySelector("#adm-password").value;
                const confirmVal = content.querySelector("#adm-confirm-password").value;
                const institutionVal = content.querySelector("#adm-institution").value;

                let valid = true;
                const showError = (id, msg) => {
                    const el = content.querySelector(id);
                    if (el) { el.classList.remove("hidden"); el.textContent = msg; }
                    valid = false;
                };
                const hideError = (id) => {
                    const el = content.querySelector(id);
                    if (el) el.classList.add("hidden");
                };

                hideError("#adm-username-error");
                hideError("#adm-password-error");
                hideError("#adm-confirm-password-error");
                hideError("#adm-institution-error");

                if (!usernameVal) showError("#adm-username-error", "El usuario es obligatorio");
                if (!passwordVal || passwordVal.length < 6) showError("#adm-password-error", "La contraseña debe tener al menos 6 caracteres");
                if (passwordVal !== confirmVal) showError("#adm-confirm-password-error", "Las contraseñas no coinciden");
                if (!institutionVal) showError("#adm-institution-error", "Selecciona una institución");

                if (!valid) return;

                const submitBtn = content.querySelector("#adm-submit");
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Creando...';

                try {
                    const res = await http.post('api/credentials', {
                        username: usernameVal,
                        password: passwordVal,
                        role_id: _adminRoleId || 2,
                        institution_id: parseInt(institutionVal)
                    });

                    const data = await res.json();
                    Toast.success("Administrador creado exitosamente");
                    Router.navigate("/instituciones");
                } catch (err) {
                    Toast.error(err.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Crear administrador";
                }
            });

            return content;
        });
    }
};

export default CrearAdmin;
