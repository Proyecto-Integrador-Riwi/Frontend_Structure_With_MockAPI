/** Perfil de usuario en modo solo lectura — muestra datos personales e información de última actualización. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import { createErrorView } from "../utils/errorHandler";
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
                                <div class="shimmer w-full h-5 rounded"></div>
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
                        <div class="bg-white rounded-2xl shadow p-6 space-y-5">
                            <h3 class="text-lg font-semibold text-gray-800">Datos Personales</h3>

                            ${p.last_update_date ? `
                                <div class="flex items-center gap-2 text-xs text-gray-400 pb-4 border-b border-gray-100">
                                    <span>Última actualización: ${new Date(p.last_update_date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    ${p.last_update_by_name ? `<span>· por ${p.last_update_by_name}</span>` : ""}
                                </div>
                            ` : ""}

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${p.first_name || "—"}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Apellido</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${p.last_name || "—"}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${p.email || "—"}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${p.phone || "—"}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${p.address || "—"}</p>
                                </div>
                            </div>
                        </div>
                    ` : `
                        <div class="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
                            No se pudieron cargar los datos del perfil.
                        </div>
                    `}
                `;
            })();

            return content;
        });
    }
};

export default Perfil;
