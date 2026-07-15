import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import StatsCard from "../components/StatsCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as CampaignService from "../services/campaignService";
import * as InstitutionService from "../services/institutionService";
import * as StudentService from "../services/studentService";

const DashboardSuperAdmin = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            const statsGrid = Skeleton.grid(4, "stat");
            statsGrid.id = "stats-grid";
            content.appendChild(statsGrid);

            (async () => {
                try {
                    const [stats, pinnedCampaigns, activeCampaigns, institutions] = await Promise.all([
                        StudentService.getDashboardStats(),
                        CampaignService.getPinnedCampaigns(),
                        CampaignService.getActiveCampaigns(),
                        InstitutionService.getInstitutions()
                    ]);

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid" id="stats-grid"></div>
                        </section>

                        ${pinnedCampaigns.length > 0 ? `
                            <section class="mb-10 content-fade-in">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-xl font-bold text-gray-800">Campañas Destacadas</h2>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-grid" id="pinned-grid"></div>
                            </section>
                        ` : `
                            <section class="mb-10 content-fade-in">
                                ${EmptyState.html('pinned', 'No hay campañas destacadas en este momento.')}
                            </section>
                        `}

                        <section class="mb-10 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl font-bold text-gray-800">Todas las Campañas Activas</h2>
                                <span class="text-sm text-muted">${activeCampaigns.length} campaña${activeCampaigns.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="campaigns-grid"></div>
                        </section>

                        <section class="mb-10 content-fade-in">
                            <h2 class="text-xl font-bold text-gray-800 mb-4">Instituciones Educativas</h2>
                            <div class="space-y-4" id="institutions-grid"></div>
                        </section>
                    `;

                    const sg = content.querySelector("#stats-grid");
                    sg.appendChild(StatsCard.render({
                        label: "Estudiantes Activos", value: stats.total_students, color: "blue",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`
                    }));
                    sg.appendChild(StatsCard.render({
                        label: "Egresados", value: stats.total_graduates, color: "green",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`
                    }));
                    sg.appendChild(StatsCard.render({
                        label: "Actualizados", value: `${stats.update_percentage}%`, color: "yellow",
                        description: `${stats.updated_count} de ${stats.total_population}`,
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    }));
                    sg.appendChild(StatsCard.render({
                        label: "Pendientes", value: stats.pending_count, color: "red",
                        icon: `<svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    }));
                    sg.querySelectorAll(".card").forEach(c => c.classList.add("stagger-item"));

                    if (pinnedCampaigns.length > 0) {
                        const pg = content.querySelector("#pinned-grid");
                        pinnedCampaigns.forEach(c => pg.appendChild(CampaignCard.render(c)));
                        pg.querySelectorAll(".card").forEach(c => c.classList.add("stagger-item"));
                    }

                    const cg = content.querySelector("#campaigns-grid");
                    activeCampaigns.forEach(c => cg.appendChild(CampaignCard.render(c)));
                    cg.querySelectorAll(".card").forEach(c => c.classList.add("stagger-item"));

                    const ig = content.querySelector("#institutions-grid");
                    institutions.forEach(inst => ig.appendChild(this._renderBanner(inst)));

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
    },

    _renderBanner(inst) {
        const el = document.createElement("div");
        el.className = "card card-hover overflow-hidden";
        el.innerHTML = `
            <div class="flex flex-col md:flex-row">
                <div class="flex-shrink-0 flex items-center justify-center p-6 bg-primary-light md:w-40">
                    <div class="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <svg class="w-10 h-10" style="color:var(--rol-primary, #1D4ED8)" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                    </div>
                </div>
                <div class="flex-grow p-5">
                    <h3 class="text-lg font-bold text-gray-800 mb-1">${inst.institution_name}</h3>
                    <p class="text-sm text-gray-500 mb-3">Director: ${inst.director}</p>
                    <div class="flex flex-wrap gap-4 text-sm">
                        <span class="text-gray-500">${inst.address || "Sin dirección"}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-500">${inst.neighborhood || ""}, ${inst.locality || ""}</span>
                    </div>
                    <div class="flex gap-4 mt-3 text-sm">
                        <span class="text-blue-600 font-medium">${inst.student_count} estudiantes</span>
                        <span class="text-green-600 font-medium">${inst.graduate_count} egresados</span>
                    </div>
                </div>
                <div class="flex items-center justify-center p-5 border-t md:border-t-0 md:border-l border-gray-100">
                    <a data-link href="/institucion/${inst.id}" class="btn-primary text-sm">
                        Ver Detalles
                    </a>
                </div>
            </div>
        `;
        return el;
    }
};

export default DashboardSuperAdmin;
