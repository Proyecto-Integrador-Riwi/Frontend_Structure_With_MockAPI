import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
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

                    const formatDate = (dateStr) => {
                        if (!dateStr) return "—";
                        return new Intl.DateTimeFormat("es-CO", {
                            day: "2-digit", month: "short", year: "numeric"
                        }).format(new Date(dateStr));
                    };

                    const initials = person.first_name && person.last_name
                        ? `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`
                        : "?";
                    const avatarPalette = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];
                    const avatarColor = avatarPalette[(person.id || 0) % avatarPalette.length];

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
                                        <h1 class="text-2xl font-bold text-gray-800">${person.first_name || ""} ${person.last_name || ""}</h1>
                                        <p class="text-muted mt-1">${person.student_profile?.grade || "Sin grado"} · ${person.student_profile?.institution?.name || "Sin institución"}</p>
                                        <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                            ${person.email ? `<span>${person.email}</span>` : ""}
                                            ${person.phone ? `<span>${person.phone}</span>` : ""}
                                            ${person.age ? `<span>${person.age} años</span>` : ""}
                                            ${person.gender ? `<span>${person.gender}</span>` : ""}
                                        </div>
                                    </div>
                                    <div>
                                        <span class="inline-block px-3 py-1 rounded-lg text-sm font-medium ${
                                            person.student_profile?.status === "Activo" ? "bg-green-100 text-green-800" :
                                            person.student_profile?.status === "Graduado" ? "bg-blue-100 text-blue-800" :
                                            "bg-gray-100 text-gray-800"
                                        }">
                                            ${person.student_profile?.status || "Sin estado"}
                                        </span>
                                    </div>
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
                                        <p class="text-sm font-medium text-gray-800 mt-1">${person.student_profile?.institution?.name || "—"}</p>
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
