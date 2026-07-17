/** Formulario de actualización de datos personales del estudiante. Accesible solo tras inscribirse en una campaña. */
import Auth from "../modules/auth";
import Router from "../modules/router";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import * as StudentService from "../services/studentService";

const PerfilEdit = {
    render() {
        return Layout.render(() => {
            const user = Auth.getUser();
            const content = document.createElement("div");
            content.className = "max-w-2xl mx-auto px-6 py-10";

            content.innerHTML = `
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Actualizar Datos</h2>
                <div class="bg-white rounded-2xl shadow p-6">
                    <div class="space-y-4">
                        ${Array.from({ length: 5 }, () =>
                            `<div class="space-y-1">
                                <div class="shimmer w-20 h-3 rounded"></div>
                                <div class="shimmer w-full h-9 rounded-lg"></div>
                            </div>`
                        ).join("")}
                    </div>
                </div>
            `;

            (async () => {
                let personData = null;
                if (user?.person_id) {
                    try {
                        personData = await StudentService.getStudentById(user.person_id);
                    } catch (e) {
                        console.error("Error loading profile:", e);
                    }
                }

                if (!personData) {
                    content.innerHTML = `
                        <div class="text-center py-12 text-gray-500">No se pudieron cargar los datos.</div>
                    `;
                    return;
                }

                const p = personData;

                content.innerHTML = `
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Actualizar Datos</h2>

                    <div class="bg-white rounded-2xl shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>

                        <form id="edit-profile-form" class="space-y-4" novalidate>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-first_name">Nombre</label>
                                    <input type="text" id="edit-first_name" value="${p.first_name || ""}" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="edit-first_name-error" />
                                    <p id="edit-first_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-last_name">Apellido</label>
                                    <input type="text" id="edit-last_name" value="${p.last_name || ""}" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="edit-last_name-error" />
                                    <p id="edit-last_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-email">Email</label>
                                <input type="email" id="edit-email" value="${p.email || ""}" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-email-error" />
                                <p id="edit-email-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-phone">Teléfono</label>
                                <input type="text" id="edit-phone" value="${p.phone || ""}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-phone-error" />
                                <p id="edit-phone-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-address">Dirección</label>
                                <input type="text" id="edit-address" value="${p.address || ""}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-address-error" />
                                <p id="edit-address-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>

                            <div id="edit-message" class="hidden text-sm rounded-lg p-3" role="alert"></div>

                            <div class="flex justify-end gap-3">
                                <a data-link href="/perfil" class="btn-secondary text-sm inline-flex items-center px-4 py-2">Cancelar</a>
                                <button type="submit" id="edit-save" class="btn-primary text-sm">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                `;

                const form = content.querySelector("#edit-profile-form");
                const msg = content.querySelector("#edit-message");

                const fields = ["first_name", "last_name", "email", "phone", "address"];
                const fieldLabels = { first_name: "Nombre", last_name: "Apellido", email: "Email", phone: "Teléfono", address: "Dirección" };

                const clearErrors = () => {
                    fields.forEach(f => {
                        const err = content.querySelector(`#edit-${f}-error`);
                        if (err) { err.textContent = ""; err.classList.add("hidden"); }
                        const inp = content.querySelector(`#edit-${f}`);
                        if (inp) inp.classList.remove("border-red-500");
                    });
                    msg.classList.add("hidden");
                };

                fields.forEach(f => {
                    const inp = content.querySelector(`#edit-${f}`);
                    inp?.addEventListener("input", () => {
                        const err = content.querySelector(`#edit-${f}-error`);
                        if (err && !err.classList.contains("hidden")) {
                            err.textContent = "";
                            err.classList.add("hidden");
                            inp.classList.remove("border-red-500");
                        }
                    });
                });

                form.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    clearErrors();

                    let valid = true;
                    fields.forEach(f => {
                        const inp = content.querySelector(`#edit-${f}`);
                        const err = content.querySelector(`#edit-${f}-error`);
                        if (f === "first_name" || f === "last_name" || f === "email") {
                            if (!inp.value.trim()) {
                                err.textContent = `${fieldLabels[f]} es obligatorio`;
                                err.classList.remove("hidden");
                                inp.classList.add("border-red-500");
                                valid = false;
                            }
                        }
                        if (f === "email" && inp.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) {
                            err.textContent = "Email no válido";
                            err.classList.remove("hidden");
                            inp.classList.add("border-red-500");
                            valid = false;
                        }
                    });

                    if (!valid) return;

                    const saveBtn = content.querySelector("#edit-save");
                    saveBtn.disabled = true;
                    saveBtn.innerHTML = '<span class="spinner"></span> Guardando...';

                    try {
                        const data = {};
                        fields.forEach(f => data[f] = content.querySelector(`#edit-${f}`).value);

                        await StudentService.updateStudent(user.person_id, data);
                        Toast.success("Datos actualizados correctamente");
                        Router.navigate("/perfil");
                    } catch (err) {
                        msg.textContent = err.message || "Error al guardar";
                        msg.className = "text-sm rounded-lg p-3 bg-red-50 text-red-700";
                        msg.classList.remove("hidden");
                        saveBtn.disabled = false;
                        saveBtn.textContent = "Guardar Cambios";
                    }
                });
            })();

            return content;
        });
    }
};

export default PerfilEdit;
