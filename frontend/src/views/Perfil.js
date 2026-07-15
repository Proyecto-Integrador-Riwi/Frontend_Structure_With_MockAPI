import Auth from "../modules/auth";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import * as StudentService from "../services/studentService";

const Perfil = {
    render() {
        return Layout.render(() => {
            const user = Auth.getUser();
            const content = document.createElement("div");
            content.className = "max-w-2xl mx-auto px-6 py-10";

            content.innerHTML = `
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>
                <div class="bg-white rounded-2xl shadow p-6 flex items-center gap-6 mb-6">
                    <div class="shimmer w-16 h-16 rounded-full"></div>
                    <div class="space-y-2">
                        <div class="shimmer w-40 h-5 rounded"></div>
                        <div class="shimmer w-24 h-4 rounded"></div>
                    </div>
                </div>
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

                const p = personData || {};
                const sp = p.student_profile || {};

                content.innerHTML = `
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

                    <div class="bg-white rounded-2xl shadow p-6 flex items-center gap-6 mb-6">
                        <div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                            ${(user?.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-gray-800">${user?.username || "Usuario"}</p>
                            <p class="text-sm text-gray-500 capitalize">Rol: ${user?.rol || "—"}</p>
                            ${sp.institution ? `<p class="text-sm text-gray-500">${sp.institution.name}</p>` : ""}
                        </div>
                    </div>

                    ${personData ? `
                        <div class="bg-white rounded-2xl shadow p-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-4">Datos Personales</h3>
                            <form id="profile-form" class="space-y-4" novalidate>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1" for="prof-first_name">Nombre</label>
                                        <input type="text" id="prof-first_name" value="${p.first_name || ""}"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            aria-describedby="prof-first_name-error" />
                                        <p id="prof-first_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1" for="prof-last_name">Apellido</label>
                                        <input type="text" id="prof-last_name" value="${p.last_name || ""}"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                            aria-describedby="prof-last_name-error" />
                                        <p id="prof-last_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="prof-email">Email</label>
                                    <input type="email" id="prof-email" value="${p.email || ""}"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="prof-email-error" />
                                    <p id="prof-email-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="prof-phone">Teléfono</label>
                                    <input type="text" id="prof-phone" value="${p.phone || ""}"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="prof-phone-error" />
                                    <p id="prof-phone-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="prof-address">Dirección</label>
                                    <input type="text" id="prof-address" value="${p.address || ""}"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="prof-address-error" />
                                    <p id="prof-address-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>

                                <div id="prof-message" class="hidden text-sm rounded-lg p-3" role="alert"></div>

                                <div class="flex justify-end gap-3">
                                    <button type="button" id="prof-cancel" class="btn-secondary text-sm">
                                        Cancelar
                                    </button>
                                    <button type="submit" id="prof-save" class="btn-primary text-sm">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    ` : `
                        <div class="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
                            No se pudieron cargar los datos del perfil.
                        </div>
                    `}
                `;

                if (personData) {
                    const form = content.querySelector("#profile-form");
                    const msg = content.querySelector("#prof-message");
                    const cancelBtn = content.querySelector("#prof-cancel");

                    const fields = ["first_name", "last_name", "email", "phone", "address"];
                    const fieldLabels = { first_name: "Nombre", last_name: "Apellido", email: "Email", phone: "Teléfono", address: "Dirección" };
                    const initialValues = {};
                    fields.forEach(f => { initialValues[f] = content.querySelector(`#prof-${f}`).value; });

                    const clearErrors = () => {
                        fields.forEach(f => {
                            const err = content.querySelector(`#prof-${f}-error`);
                            if (err) { err.textContent = ""; err.classList.add("hidden"); }
                            const inp = content.querySelector(`#prof-${f}`);
                            if (inp) inp.classList.remove("border-red-500");
                        });
                        msg.classList.add("hidden");
                    };

                    // Persistent input clearing (fixed: no { once: true })
                    fields.forEach(f => {
                        const inp = content.querySelector(`#prof-${f}`);
                        inp.addEventListener("input", () => {
                            const err = content.querySelector(`#prof-${f}-error`);
                            if (err && !err.classList.contains("hidden")) {
                                err.textContent = "";
                                err.classList.add("hidden");
                                inp.classList.remove("border-red-500");
                            }
                        });
                    });

                    cancelBtn.addEventListener("click", () => {
                        fields.forEach(f => {
                            const inp = content.querySelector(`#prof-${f}`);
                            inp.value = initialValues[f];
                        });
                        clearErrors();
                        msg.textContent = "Cambios descartados";
                        msg.className = "text-sm rounded-lg p-3 bg-gray-50 text-gray-600";
                        msg.classList.remove("hidden");
                    });

                    form.addEventListener("submit", async (e) => {
                        e.preventDefault();
                        clearErrors();

                        let valid = true;
                        fields.forEach(f => {
                            const inp = content.querySelector(`#prof-${f}`);
                            const err = content.querySelector(`#prof-${f}-error`);
                            if (!inp.value.trim()) {
                                err.textContent = `${fieldLabels[f]} es obligatorio`;
                                err.classList.remove("hidden");
                                inp.classList.add("border-red-500");
                                valid = false;
                            }
                            if (f === "email" && inp.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value)) {
                                err.textContent = "Email no válido";
                                err.classList.remove("hidden");
                                inp.classList.add("border-red-500");
                                valid = false;
                            }
                        });

                        if (!valid) return;

                        const saveBtn = content.querySelector("#prof-save");
                        saveBtn.disabled = true;
                        saveBtn.innerHTML = '<span class="spinner"></span> Guardando...';

                        try {
                            const data = {};
                            fields.forEach(f => data[f] = content.querySelector(`#prof-${f}`).value);

                            await StudentService.updateStudent(user.person_id, data);
                            msg.textContent = "Datos actualizados correctamente";
                            msg.className = "text-sm rounded-lg p-3 bg-green-50 text-green-700";
                            msg.classList.remove("hidden");
                            // Update cached initial values
                            fields.forEach(f => { initialValues[f] = data[f]; });
                        } catch (err) {
                            msg.textContent = err.message || "Error al guardar";
                            msg.className = "text-sm rounded-lg p-3 bg-red-50 text-red-700";
                            msg.classList.remove("hidden");
                        } finally {
                            saveBtn.disabled = false;
                            saveBtn.textContent = "Guardar Cambios";
                        }
                    });
                }
            })();

            return content;
        });
    }
};

export default Perfil;
