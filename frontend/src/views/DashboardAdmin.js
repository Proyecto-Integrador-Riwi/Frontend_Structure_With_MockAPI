/** Dashboard del ADMINISTRADOR - estadisticas de su institucion. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import StatsCard from "../components/StatsCard";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import * as CampaignService from "../services/campaignService";
import * as InstitutionService from "../services/institutionService";
import * as StudentService from "../services/studentService";
import Router from "../modules/router";

const DashboardAdmin = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            const user = Auth.getUser();
            const institutionId = user?.institution_id;

            if (!institutionId) {
                content.innerHTML = `<div class="text-center py-20 text-gray-500">No se encontró institución asociada</div>`;
                return content;
            }

            const loading = document.createElement("div");
            loading.className = "space-y-6";
            loading.innerHTML = `
                <div class="h-40 rounded-2xl shimmer"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${Array(3).fill('<div class="h-64 rounded-xl shimmer"></div>').join("")}
                </div>
            `;
            content.appendChild(loading);

            (async () => {
                try {
                    const [institution, campaigns, stats] = await Promise.all([
                        InstitutionService.getInstitutionById(institutionId),
                        CampaignService.getCampaigns({ active: true, institution_id: institutionId }),
                        StudentService.getDashboardStats(institutionId)
                    ]);

                    const statIcons = {
                        students: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
                        graduates: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
                        updated: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
                        pending: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    };

                    content.innerHTML = `
                        <section class="mb-8 rounded-2xl overflow-hidden relative gradient-barranquilla content-fade-in">
                            <div class="hero-shape hero-shape-1"></div>
                            <div class="hero-shape hero-shape-2"></div>
                            <div class="relative z-10 px-8 py-10">
                                <span class="badge bg-white/20 text-white border border-white/20 mb-2">Dashboard</span>
                                <h1 class="text-2xl md:text-3xl font-bold text-white mb-1">${institution.institution_name}</h1>
                                <p class="text-blue-100">${institution.neighborhood || ""}${institution.neighborhood && institution.locality ? ", " : ""}${institution.locality || ""}</p>
                                <div class="flex flex-wrap gap-3 mt-4">
                                    <a data-link href="/estudiantes" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"/></svg>
                                        Estudiantes
                                    </a>
                                    <a data-link href="/campanas" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6"/></svg>
                                        Campañas
                                    </a>
                                    <a data-link href="/institucion" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                                        Mi Institución
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid"></div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="card p-6">
                                <h2 class="text-lg font-bold text-gray-800 mb-5">Acciones Rápidas</h2>
                                <div class="space-y-3" id="quick-actions"></div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-bold text-gray-800">Campañas Activas</h2>
                                <a data-link href="/campanas" class="text-sm font-medium" style="color:var(--rol-primary, #2563ED)">Ver todas →</a>
                            </div>
                            ${campaigns.length > 0
                                ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="campaigns-grid"></div>`
                                : EmptyState.html('campaigns', 'No hay campañas activas actualmente.')
                            }
                        </section>
                    `;

                    const quickActionsEl = content.querySelector("#quick-actions");
                    this._renderQuickActions(quickActionsEl);

                    const statsGrid = content.querySelector("#stats-grid");
                    const statConfigs = [
                        { label: "Total Estudiantes", value: stats.total_students, icon: statIcons.students, color: "blue", description: "Estudiantes activos" },
                        { label: "Egresados", value: stats.total_graduates, icon: statIcons.graduates, color: "purple", description: "Graduados" },
                        { label: "Actualizados", value: stats.updated_count, icon: statIcons.updated, color: "green", description: `${stats.update_percentage || 0}% del total` },
                        { label: "Pendientes", value: stats.pending_count, icon: statIcons.pending, color: "yellow", description: "Requieren actualización" }
                    ];
                    statConfigs.forEach(cfg => {
                        statsGrid.appendChild(StatsCard.render(cfg));
                    });

                    if (campaigns.length > 0) {
                        const grid = content.querySelector("#campaigns-grid");
                        campaigns.forEach(c => {
                            const card = CampaignCard.render(c);
                            card.classList.add("stagger-item", "cursor-pointer");
                            card.addEventListener("click", (e) => {
                                if (e.target.closest("button, a, input, select")) return;
                                Router.navigate(`/campanas/${c.id}`);
                            });
                            grid.appendChild(card);
                        });
                    }

                } catch (err) {
                    console.error(err);
                    content.innerHTML = "";
                    content.appendChild(createErrorView("Error al cargar datos"));
                }
            })();

            return content;
        });
    },

    _renderQuickActions(container) {
        const actions = [
            {
                label: "Crear Estudiante",
                icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>`,
                href: "/estudiantes/crear"
            },
            {
                label: "Nueva Campaña",
                icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
                href: "/campanas/crear"
            },
            {
                label: "Ver Institución",
                icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
                href: "/institucion"
            }
        ];

        actions.forEach(action => {
            const el = document.createElement("a");
            el.setAttribute("data-link", "");
            el.href = action.href;
            el.className = "flex items-center gap-3 p-3 rounded-lg transition cursor-pointer hover:bg-gray-50";
            el.innerHTML = `
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                    <span style="color:var(--rol-primary, #2563EB)">${action.icon}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">${action.label}</span>
                <svg class="w-4 h-4 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            `;
            container.appendChild(el);
        });
    },

};

export default DashboardAdmin;
