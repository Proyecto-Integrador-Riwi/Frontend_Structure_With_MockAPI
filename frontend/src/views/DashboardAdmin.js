import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import StatsCard from "../components/StatsCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as CampaignService from "../services/campaignService";
import * as InstitutionService from "../services/institutionService";
import * as StudentService from "../services/studentService";

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

            content.appendChild(Skeleton.grid(4, "stat"));

            (async () => {
                try {
                    const [institution, campaigns, stats] = await Promise.all([
                        InstitutionService.getInstitutionById(institutionId),
                        CampaignService.getCampaigns({ active: true, institution_id: institutionId }),
                        StudentService.getDashboardStats(institutionId)
                    ]);

                    content.innerHTML = `
                        <section class="mb-8 rounded-xl overflow-hidden relative h-48 gradient-barranquilla content-fade-in">
                            <div class="absolute inset-0 flex items-center px-8">
                                <div>
                                    <h1 class="text-2xl md:text-3xl font-bold text-white mb-1">${institution.institution_name}</h1>
                                    <p class="text-blue-100">${institution.neighborhood || ""}, ${institution.locality || ""}</p>
                                </div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid" id="stats-grid"></div>
                        </section>

                        <section class="mb-10 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl font-bold text-gray-800">Campañas Activas</h2>
                                <a data-link href="/campanas" class="text-sm" style="color:var(--rol-accent, #059669)">Ver todas →</a>
                            </div>
                            ${campaigns.length > 0 
                                ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="campaigns-grid"></div>`
                                : EmptyState.html('campaigns', 'No hay campañas activas actualmente.')
                            }
                        </section>

                        <section class="content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl font-bold text-gray-800">Accesos Rápidos</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <a data-link href="/institucion" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #2563EB)">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Mi Institución</p>
                                        <p class="text-sm text-muted">Ver detalles y estudiantes</p>
                                    </div>
                                </a>
                                <a data-link href="/estudiantes" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg bg-success-light text-success">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Estudiantes</p>
                                        <p class="text-sm text-muted">Gestionar y filtrar</p>
                                    </div>
                                </a>
                                <a data-link href="/campanas" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg bg-warm-light text-warm">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Campañas</p>
                                        <p class="text-sm text-muted">Crear y gestionar</p>
                                    </div>
                                </a>
                            </div>
                        </section>
                    `;

                    const statsGrid = content.querySelector("#stats-grid");
                    statsGrid.appendChild(StatsCard.render({
                        label: "Estudiantes Activos", value: stats.total_students, color: "blue",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
                    }));
                    statsGrid.appendChild(StatsCard.render({
                        label: "Egresados", value: stats.total_graduates, color: "green",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`
                    }));
                    statsGrid.appendChild(StatsCard.render({
                        label: "Actualizados", value: `${stats.update_percentage}%`, color: "yellow",
                        description: `${stats.updated_count} de ${stats.total_population}`,
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    }));
                    statsGrid.appendChild(StatsCard.render({
                        label: "Pendientes", value: stats.pending_count, color: "red",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    }));
                    statsGrid.querySelectorAll(".card").forEach(c => c.classList.add("stagger-item"));

                    if (campaigns.length > 0) {
                        const grid = content.querySelector("#campaigns-grid");
                        campaigns.forEach(c => {
                            const card = CampaignCard.render(c);
                            card.classList.add("stagger-item");
                            grid.appendChild(card);
                        });
                    }

                } catch (err) {
                    console.error(err);
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                            <svg class="w-16 h-16 text-red-300 mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-gray-500 mb-4">Error al cargar datos</p>
                            <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            })();

            return content;
        });
    }
};

export default DashboardAdmin;
