import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import Router from "../modules/router";
import * as InstitutionService from "../services/institutionService";

const InstitucionForm = {
    async render(params = {}) {
        const { id } = params;

        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-3xl mx-auto";

            const isEdit = Boolean(id);
            const title = isEdit ? "Editar Institución" : "Nueva Institución";

            content.innerHTML = `
                <div class="content-fade-in">
                    <a data-link href="/instituciones" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a instituciones
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">${title}</h1>

                    <form id="inst-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <div>
                                <label for="inst-name" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la institución *</label>
                                <input id="inst-name" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre oficial de la institución" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-name-error"></p>
                            </div>

                            <div>
                                <label for="inst-director" class="block text-sm font-medium text-gray-700 mb-1">Director *</label>
                                <input id="inst-director" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre del director" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-director-error"></p>
                            </div>

                            <div>
                                <label for="inst-dane" class="block text-sm font-medium text-gray-700 mb-1">Código DANE *</label>
                                <input id="inst-dane" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Código DANE de la institución" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-dane-error"></p>
                            </div>

                            <div>
                                <label for="inst-address" class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input id="inst-address" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Dirección física" />
                            </div>

                            <div>
                                <label for="inst-neighborhood" class="block text-sm font-medium text-gray-700 mb-1">Barrio *</label>
                                <select id="inst-neighborhood" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar barrio...</option>
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-neighborhood-error"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/instituciones" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="inst-submit">
                                ${isEdit ? "Guardar cambios" : "Crear institución"}
                            </button>
                        </div>
                    </form>
                </div>
            `;

            // Cargar barrios
            (async () => {
                try {
                    const neighborhoods = await http.get('api/neighborhoods').then(r => r.json());
                    const select = content.querySelector("#inst-neighborhood");
                    neighborhoods.forEach(n => {
                        const opt = document.createElement("option");
                        opt.value = n.id;
                        opt.textContent = n.name;
                        select.appendChild(opt);
                    });
                } catch (err) {
                    console.error("Error loading neighborhoods:", err);
                }
            })();

            if (isEdit) {
                (async () => {
                    try {
                        const inst = await InstitutionService.getInstitutionById(id);
                        content.querySelector("#inst-name").value = inst.institution_name || "";
                        content.querySelector("#inst-director").value = inst.director || "";
                        content.querySelector("#inst-dane").value = inst.dane_code || "";
                        content.querySelector("#inst-address").value = inst.address || "";
                        // Barrio will be selected after load
                        setTimeout(() => {
                            content.querySelector("#inst-neighborhood").value = inst.neighborhood_id || "";
                        }, 500);
                    } catch (err) {
                        Toast.error("Error al cargar institución: " + err.message);
                    }
                })();
            }

            const form = content.querySelector("#inst-form");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const nameVal = content.querySelector("#inst-name").value.trim();
                const directorVal = content.querySelector("#inst-director").value.trim();
                const daneVal = content.querySelector("#inst-dane").value.trim();
                const neighborhoodVal = content.querySelector("#inst-neighborhood").value;
                const addressVal = content.querySelector("#inst-address").value.trim();

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

                hideError("#inst-name-error");
                hideError("#inst-director-error");
                hideError("#inst-dane-error");
                hideError("#inst-neighborhood-error");

                if (!nameVal) showError("#inst-name-error", "El nombre es obligatorio");
                if (!directorVal) showError("#inst-director-error", "El director es obligatorio");
                if (!daneVal) showError("#inst-dane-error", "El código DANE es obligatorio");
                if (!neighborhoodVal) showError("#inst-neighborhood-error", "Selecciona un barrio");

                if (!valid) return;

                const submitBtn = content.querySelector("#inst-submit");
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Guardando...';

                const data = {
                    institution_name: nameVal,
                    director: directorVal,
                    dane_code: daneVal,
                    address: addressVal,
                    neighborhood_id: neighborhoodVal
                };

                try {
                    if (isEdit) {
                        await InstitutionService.updateInstitution(id, data);
                        Toast.success("Institución actualizada exitosamente");
                        Router.navigate("/instituciones");
                    } else {
                        await InstitutionService.createInstitution(data);
                        Toast.success("Institución creada exitosamente");
                        Router.navigate("/instituciones");
                    }
                } catch (err) {
                    Toast.error(err.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = isEdit ? "Guardar cambios" : "Crear institución";
                }
            });

            return content;
        });
    }
};

export default InstitucionForm;
