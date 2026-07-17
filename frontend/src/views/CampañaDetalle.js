/** Detalle de campaña — muestra información completa, estudiantes inscritos, progreso y criterios. */
import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import { formatDate, getCampaignStatus } from "../utils/dates";
import { isAdmin } from "../utils/permissions";
import * as CampaignService from "../services/campaignService";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import Router from "../modules/router";

const TYPE_BADGE_COLORS = {
    'academico': 'badge-blue',
    'cultural': 'badge-yellow',
    'deportivo': 'badge-green',
    'tecnologia': 'badge-blue',
    'salud': 'badge-red',
    'medio_ambiente': 'badge-green',
    'artes': 'badge-yellow',
};

const CampanaDetalle = {
    async render(params = {}) {
        const { id } = params;

        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-5xl mx-auto";

            content.appendChild(Skeleton.custom(`
                <div class="h-8 w-48 bg-gray-200 rounded mb-4 shimmer"></div>
                <div class="h-6 w-64 bg-gray-200 rounded mb-6 shimmer"></div>
                <div class="h-40 bg-gray-200 rounded-xl mb-6 shimmer"></div>
                <div class="h-8 w-32 bg-gray-200 rounded mb-4 shimmer"></div>
                <div class="h-32 bg-gray-200 rounded-xl shimmer"></div>
            `));

            (async () => {
                try {
                    const [campaign, progress] = await Promise.all([
                        CampaignService.getCampaign(id),
                        http.get(`api/campaigns/${id}/progress`).then(r => r.json()).catch(() => null)
                    ]);
                    const user = Auth.getUser();
                    const userIsAdmin = isAdmin();

                    const cs = getCampaignStatus(campaign);
                    const status = cs.label;
                    const statusColor = cs.color;

                    const typeKey = (campaign.type || "").toLowerCase().replace(/\s+/g, "_");
                    const typeBadgeClass = TYPE_BADGE_COLORS[typeKey] || "badge-blue";

                    content.innerHTML = `
                        <div class="content-fade-in">
                            <a data-link href="/campanas" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                &larr; Volver a campañas
                            </a>

                            <div class="card overflow-hidden mb-6">
                                ${campaign.url_multimedia ? `
                                    <div class="h-48 sm:h-64 overflow-hidden">
                                        <img src="${campaign.url_multimedia.startsWith('http') ? campaign.url_multimedia : 'https://' + campaign.url_multimedia}" alt="${campaign.title}" class="w-full h-full object-cover" />
                                    </div>
                                ` : `
                                    <div class="h-48 sm:h-64 gradient-barranquilla flex items-center justify-center">
                                        <svg class="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                        </svg>
                                    </div>
                                `}

                                <div class="p-6 space-y-6">
                                    <div class="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="badge ${statusColor}">${status}</span>
                                                <span class="badge ${typeBadgeClass}">${campaign.type || "General"}</span>
                                            </div>
                                            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">${campaign.title}</h1>
                                            ${campaign.sponsor ? `
                                                <p class="text-muted mt-1">Patrocinado por ${campaign.sponsor}</p>
                                            ` : ""}
                                        </div>

                                        ${userIsAdmin ? `
                                            <div class="flex items-center gap-2">
                                                <a data-link href="/campanas/${id}/editar" class="btn-secondary text-sm px-4 py-2">
                                                    Editar
                                                </a>
                                                <button id="btn-delete-campaign" class="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                    Eliminar
                                                </button>
                                            </div>
                                        ` : ""}
                                    </div>

                                    <p class="text-gray-600 leading-relaxed">${campaign.description || "Sin descripción"}</p>

                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Inicio</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${formatDate(campaign.start_date)}</p>
                                        </div>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Fin</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${formatDate(campaign.end_date)}</p>
                                        </div>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Inscritos</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${campaign.enrollment_count || 0} estudiantes</p>
                                        </div>
                                    </div>

                                    ${campaign.scope && campaign.scope.length > 0 ? `
                                        <div>
                                            <h3 class="text-sm font-semibold text-gray-700 mb-2">Alcance</h3>
                                            <div class="flex flex-wrap gap-2">
                                                ${campaign.scope.map(s => `
                                                    <span class="badge badge-blue">${s.scope_type === "GLOBAL" ? "Global" : s.scope_type === "INSTITUTION" ? "Por institución" : s.scope_type === "LOCALITY" ? "Por localidad" : "Por barrio"}</span>
                                                `).join("")}
                                            </div>
                                        </div>
                                    ` : ""}

                                    ${campaign.pinned ? `
                                        <div class="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg px-4 py-2">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                                            </svg>
                                            Campaña fijada
                                        </div>
                                    ` : ""}
                                </div>
                            </div>

                            ${progress && progress.total_enrolled > 0 ? `
                                <div class="card p-6 mb-6">
                                    <h2 class="text-lg font-semibold text-gray-800 mb-4">Progreso de la Campaña</h2>
                                    <div class="grid grid-cols-3 gap-4 mb-6">
                                        <div class="text-center p-4 bg-blue-50 rounded-xl">
                                            <p class="text-2xl font-bold text-blue-700">${progress.total_enrolled}</p>
                                            <p class="text-xs text-blue-600 mt-1">Inscritos</p>
                                        </div>
                                        <div class="text-center p-4 bg-green-50 rounded-xl">
                                            <p class="text-2xl font-bold text-green-700">${progress.updated_count}</p>
                                            <p class="text-xs text-green-600 mt-1">Actualizados</p>
                                        </div>
                                        <div class="text-center p-4 bg-red-50 rounded-xl">
                                            <p class="text-2xl font-bold text-red-700">${progress.pending_count}</p>
                                            <p class="text-xs text-red-600 mt-1">Pendientes</p>
                                        </div>
                                    </div>
                                    <div class="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-green-500 rounded-full transition-all duration-700"
                                            style="width:${progress.update_percentage}%">
                                        </div>
                                        <span class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                                            ${progress.update_percentage}% completado
                                        </span>
                                    </div>
                                </div>
                            ` : ""}

                            <div class="card p-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">
                                    Estudiantes inscritos (${campaign.students?.length || 0})
                                </h2>

                                ${(!campaign.students || campaign.students.length === 0) ? `
                                    ${EmptyState.html('students', 'Aún no hay estudiantes inscritos en esta campaña.')}
                                ` : `
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead>
                                                <tr class="border-b border-gray-100 text-left text-gray-500">
                                                    <th class="pb-3 font-medium">Estudiante</th>
                                                    <th class="pb-3 font-medium">Estado</th>
                                                    <th class="pb-3 font-medium">Fecha de inscripción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${campaign.students.map(s => {
                                                    const progStudent = progress?.students?.find(ps => ps.id === s.id);
                                                    const hasUpdated = progStudent?.has_updated;
                                                    return `
                                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td class="py-3">
                                                            <span class="font-medium text-gray-800">
                                                                ${s.person ? `${s.person.first_name} ${s.person.last_name}` : "Desconocido"}
                                                            </span>
                                                        </td>
                                                        <td class="py-3">
                                                            <span class="inline-flex items-center gap-1 text-xs font-medium ${hasUpdated ? 'text-green-700' : 'text-yellow-700'}">
                                                                <span class="w-2 h-2 rounded-full ${hasUpdated ? 'bg-green-500' : 'bg-yellow-400'}"></span>
                                                                ${hasUpdated ? 'Actualizado' : 'Pendiente'}
                                                            </span>
                                                        </td>
                                                        <td class="py-3 text-gray-500">${formatDate(s.enrolled_at)}</td>
                                                    </tr>`;
                                                }).join("")}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    `;

                    const deleteBtn = content.querySelector("#btn-delete-campaign");
                    if (deleteBtn) {
                        deleteBtn.addEventListener("click", () => {
                            ConfirmDialog.show({
                                title: "Eliminar campaña",
                                message: `¿Estás seguro de eliminar "${campaign.title}"? Esta acción no se puede deshacer.`,
                                confirmText: "Eliminar",
                                cancelText: "Cancelar",
                                destructive: true,
                                onConfirm: async () => {
                                    try {
                                        await CampaignService.deleteCampaign(campaign.id);
                                        Toast.success("Campaña eliminada");
                                        Router.navigate("/campanas");
                                    } catch (err) {
                                        Toast.error(err.message);
                                    }
                                }
                            });
                        });
                    }

                } catch (err) {
                    console.error(err);
                    content.innerHTML = "";
                    content.appendChild(createErrorView("Error al cargar la campaña"));
                }
            })();

            return content;
        });
    }
};

export default CampanaDetalle;
