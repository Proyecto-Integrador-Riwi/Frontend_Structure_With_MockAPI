import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import * as CampaignService from "../services/campaignService";
import * as StudentService from "../services/studentService";

const EstudianteDetalle = {
    async render(params = {}) {
        const { id } = params;

        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-5xl mx-auto";

            content.appendChild(Skeleton.custom(`
                <div class="flex gap-6 mb-6">
                    <div class="w-24 h-24 rounded-full bg-gray-200 shimmer"></div>
                    <div class="flex-1 space-y-3">
                        <div class="h-6 w-48 bg-gray-200 rounded shimmer"></div>
                        <div class="h-4 w-32 bg-gray-200 rounded shimmer"></div>
                        <div class="h-4 w-64 bg-gray-200 rounded shimmer"></div>
                    </div>
                </div>
                <div class="h-40 bg-gray-200 rounded-xl shimmer mb-6"></div>
                <div class="h-32 bg-gray-200 rounded-xl shimmer"></div>
            `));

            (async () => {
                try {
                    const person = await StudentService.getStudentById(id);

                    // Fetch enrolled campaigns
                    let enrolledCampaigns = [];
                    try {
                        enrolledCampaigns = await CampaignService.getCampaigns({ person_id: id });
                    } catch (e) {
                        // No campaigns
                    }

                    // Fetch catalogs for edit mode
                    const [grades, genders, statuses, docTypes, neighborhoods] = await Promise.all([
                        http.get('api/grades').then(r => r.json()).catch(() => []),
                        http.get('api/genders').then(r => r.json()).catch(() => []),
                        http.get('api/statuses').then(r => r.json()).catch(() => []),
                        http.get('api/document-types').then(r => r.json()).catch(() => []),
                        http.get('api/neighborhoods').then(r => r.json()).catch(() => [])
                    ]);

                    const formatDate = (dateStr) => {
                        if (!dateStr) return "—";
                        return new Intl.DateTimeFormat("es-CO", {
                            day: "2-digit", month: "short", year: "numeric"
                        }).format(new Date(dateStr));
                    };

                    const user = Auth.getUser();
                    const isAdmin = user?.rol === "SUPERADMIN" || user?.rol === "ADMINISTRADOR";
                    const isEditing = window.location.pathname.endsWith("/editar");

                    const initials = person.first_name && person.last_name
                        ? `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`
                        : "?";
                    const avatarPalette = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];
                    const avatarColor = avatarPalette[(person.id || 0) % avatarPalette.length];

                    // Determinar estado de actualización (semáforo)
                    const lastUpdate = person.last_update_date;
                    let updateStatus = { color: "bg-red-500", label: "Nunca actualizado", textColor: "text-red-700" };
                    if (lastUpdate) {
                        const daysSinceUpdate = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSinceUpdate <= 30) {
                            updateStatus = { color: "bg-green-500", label: "Actualizado recientemente", textColor: "text-green-700" };
                        } else if (daysSinceUpdate <= 90) {
                            updateStatus = { color: "bg-yellow-500", label: "Actualizado hace más de 30 días", textColor: "text-yellow-700" };
                        } else {
                            updateStatus = { color: "bg-red-500", label: "Desactualizado", textColor: "text-red-700" };
                        }
                    }

                    const sp = person.student_profile || {};

                    if (isEditing && isAdmin) {
                        // MODO EDICIÓN
                        content.innerHTML = `
                            <div class="content-fade-in">
                                <a data-link href="/estudiante/${id}" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                    &larr; Volver al perfil
                                </a>

                                <div class="card p-6 mb-6">
                                    <h2 class="text-lg font-semibold text-gray-800 mb-4">Editar Estudiante</h2>
                                    <form id="edit-student-form" class="space-y-5" novalidate>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                                                <input id="edit-first_name" type="text" value="${person.first_name || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                                <input id="edit-last_name" type="text" value="${person.last_name || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input id="edit-email" type="email" value="${person.email || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                                <input id="edit-phone" type="text" value="${person.phone || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo documento</label>
                                                <select id="edit-document_type_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${docTypes.map(dt => `<option value="${dt.id}" ${person.document_type_id === dt.id ? 'selected' : ''}>${dt.name}</option>`).join("")}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Núm. documento</label>
                                                <input id="edit-document_number" type="text" value="${person.document_number || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                                <select id="edit-gender_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${genders.map(g => `<option value="${g.id}" ${person.gender_id === g.id ? 'selected' : ''}>${g.name}</option>`).join("")}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha nacimiento</label>
                                                <input id="edit-birth_date" type="date" value="${person.birth_date || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
                                                <select id="edit-neighborhood_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${neighborhoods.map(n => `<option value="${n.id}" ${person.neighborhood_id === n.id ? 'selected' : ''}>${n.name}</option>`).join("")}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                                <input id="edit-address" type="text" value="${person.address || ""}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                        </div>

                                        <div class="border-t border-gray-100 pt-5">
                                            <h3 class="text-md font-semibold text-gray-700 mb-3">Información académica</h3>
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                                                    <select id="edit-grade_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                        ${grades.map(g => `<option value="${g.id}" ${sp.grade_id === g.id ? 'selected' : ''}>${g.grade}</option>`).join("")}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                                    <select id="edit-status_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                        ${statuses.map(s => `<option value="${s.id}" ${sp.status_id === s.id ? 'selected' : ''}>${s.status}</option>`).join("")}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="edit-message" class="hidden rounded-lg p-4 text-sm" role="alert"></div>

                                        <div class="flex justify-end gap-3">
                                            <a data-link href="/estudiante/${id}" class="btn-secondary text-sm px-6 py-2">Cancelar</a>
                                            <button type="submit" class="btn-primary px-6" id="edit-submit">Guardar cambios</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        `;

                        const form = content.querySelector("#edit-student-form");
                        form.addEventListener("submit", async (e) => {
                            e.preventDefault();
                            const submitBtn = content.querySelector("#edit-submit");
                            const msg = content.querySelector("#edit-message");
                            msg.classList.add("hidden");
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<span class="spinner"></span> Guardando...';

                            const data = {
                                first_name: content.querySelector("#edit-first_name").value,
                                last_name: content.querySelector("#edit-last_name").value,
                                email: content.querySelector("#edit-email").value,
                                phone: content.querySelector("#edit-phone").value,
                                document_type_id: parseInt(content.querySelector("#edit-document_type_id").value),
                                document_number: content.querySelector("#edit-document_number").value,
                                gender_id: parseInt(content.querySelector("#edit-gender_id").value),
                                birth_date: content.querySelector("#edit-birth_date").value,
                                neighborhood_id: parseInt(content.querySelector("#edit-neighborhood_id").value),
                                address: content.querySelector("#edit-address").value,
                                grade_id: parseInt(content.querySelector("#edit-grade_id").value),
                                status_id: parseInt(content.querySelector("#edit-status_id").value),
                            };

                            try {
                                const profileId = sp.id;
                                if (profileId) {
                                    await StudentService.updateStudentByAdmin(profileId, data);
                                    Toast.success("Estudiante actualizado exitosamente");
                                    Router.navigate(`/estudiante/${id}`);
                                } else {
                                    throw new Error("No se encontró el perfil del estudiante");
                                }
                            } catch (err) {
                                msg.textContent = err.message;
                                msg.className = "rounded-lg p-4 text-sm bg-red-50 text-red-700";
                                msg.classList.remove("hidden");
                                submitBtn.disabled = false;
                                submitBtn.textContent = "Guardar cambios";
                            }
                        });

                        return;
                    }

                    // MODO VISUALIZACIÓN
                    content.innerHTML = `
                        <div class="content-fade-in">
                            <a data-link href="/estudiantes" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                &larr; Volver a estudiantes
                            </a>

                            <div class="card p-6 mb-6">
                                <div class="flex items-start gap-6 flex-wrap">
                                    <div class="w-20 h-20 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                        ${initials}
                                    </div>
                                    <div class="flex-grow min-w-0">
                                        <div class="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <h1 class="text-2xl font-bold text-gray-800">${person.first_name || ""} ${person.last_name || ""}</h1>
                                                <p class="text-muted mt-1">${sp.grade || "Sin grado"} · ${sp.institution?.name || "Sin institución"}</p>
                                                <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                                    ${person.email ? `<span>${person.email}</span>` : ""}
                                                    ${person.phone ? `<span>${person.phone}</span>` : ""}
                                                    ${person.age ? `<span>${person.age} años</span>` : ""}
                                                    ${person.gender ? `<span>${person.gender}</span>` : ""}
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                ${isAdmin ? `<a data-link href="/estudiante/${id}/editar" class="btn-secondary text-sm px-4 py-2">Editar</a>` : ""}
                                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
                                                    sp.status === "Activo" ? "bg-green-100 text-green-800" :
                                                    sp.status === "Graduado" ? "bg-blue-100 text-blue-800" :
                                                    "bg-gray-100 text-gray-800"
                                                }">
                                                    ${sp.status || "Sin estado"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Indicador de última actualización (semáforo) -->
                                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                                    <span class="w-3 h-3 rounded-full ${updateStatus.color}"></span>
                                    <span class="${updateStatus.textColor} font-medium">${updateStatus.label}</span>
                                    ${lastUpdate ? `<span class="text-gray-400">· ${formatDate(lastUpdate)}</span>` : ""}
                                </div>
                            </div>

                            <div class="card p-6 mb-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Información personal</h2>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Tipo de documento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.document_type || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Número de documento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.document_number || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Fecha de nacimiento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.birth_date ? formatDate(person.birth_date) : "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Edad</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.age ? `${person.age} años` : "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Género</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.gender || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Localidad</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.locality || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Barrio</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.neighborhood || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.address || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Institución</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${sp.institution?.name || "—"}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Última actualización</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${lastUpdate ? formatDate(lastUpdate) : "—"}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card p-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">
                                    Campañas inscritas (${enrolledCampaigns.length})
                                </h2>

                                ${enrolledCampaigns.length === 0 ? `
                                    ${EmptyState.html('campaigns', 'Este estudiante no está inscrito en ninguna campaña.')}
                                ` : `
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead>
                                                <tr class="border-b border-gray-100 text-left text-gray-500">
                                                    <th class="pb-3 font-medium">Campaña</th>
                                                    <th class="pb-3 font-medium">Tipo</th>
                                                    <th class="pb-3 font-medium">Inicio</th>
                                                    <th class="pb-3 font-medium">Fin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${enrolledCampaigns.map(c => `
                                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td class="py-3">
                                                            <a data-link href="/campanas/${c.id}" class="text-blue-600 hover:text-blue-800 font-medium">
                                                                ${c.title}
                                                            </a>
                                                        </td>
                                                        <td class="py-3"><span class="text-gray-600">${c.type || "General"}</span></td>
                                                        <td class="py-3 text-gray-500">${formatDate(c.start_date)}</td>
                                                        <td class="py-3 text-gray-500">${c.end_date ? formatDate(c.end_date) : "—"}</td>
                                                    </tr>
                                                `).join("")}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    `;

                } catch (err) {
                    console.error(err);
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                            <svg class="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-gray-500 mb-4">Error al cargar el estudiante</p>
                            <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            })();

            return content;
        });
    }
};

export default EstudianteDetalle;
