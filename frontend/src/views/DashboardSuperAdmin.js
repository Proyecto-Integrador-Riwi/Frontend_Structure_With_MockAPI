/** Dashboard del SUPERADMIN - estadisticas globales del sistema. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import StatsCard from "../components/StatsCard";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import * as CampaignService from "../services/campaignService";
import * as StudentService from "../services/studentService";
import Router from "../modules/router";

const DashboardSuperAdmin = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

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
                    const [activeCampaignsResponse, statsResponse] = await Promise.all([
                        CampaignService.getActiveCampaigns().catch(() => []),
                        StudentService.getDashboardStats().catch(() => ({}))
                    ]);

                    const activeCampaigns = Array.isArray(activeCampaignsResponse) ? activeCampaignsResponse : [];
                    const stats = statsResponse && typeof statsResponse === "object" ? statsResponse : {};

                    const topEnrolled = [...activeCampaigns]
                        .sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
                        .slice(0, 5);

                    const statIcons = {
                        students: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
                        graduates: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
                        updated: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
                        pending: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
                    };

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in">
                            <div class="gradient-barranquilla rounded-2xl p-8 relative overflow-hidden">
                                <div class="hero-shape hero-shape-1"></div>
                                <div class="hero-shape hero-shape-2"></div>
                                <div class="relative z-10">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="badge bg-white/20 text-white border border-white/20">Dashboard</span>
                                        <span class="text-white/60 text-sm">${new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
                                    <p class="text-white/80 text-lg max-w-2xl">Bienvenido al sistema de seguimiento educativo del Distrito de Barranquilla.</p>
                                    <div class="flex flex-wrap gap-3 mt-5">
                                        <a data-link href="/campanas" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                                            Campañas
                                        </a>
                                        <a data-link href="/instituciones" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                                            Instituciones
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid"></div>
                        </section>

                        <div class="mb-8 content-fade-in">
                            <div class="card p-6">
                                <h2 class="text-lg font-bold text-gray-800 mb-5">Acciones Rápidas</h2>
                                <div class="space-y-3" id="quick-actions"></div>
                            </div>
                        </div>

                        <section class="mb-8 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-bold text-gray-800">Campañas Activas</h2>
                                <a data-link href="/campanas" class="text-sm font-medium" style="color:var(--rol-primary, #1D4ED8);">Ver todas</a>
                            </div>
                            ${activeCampaigns.length > 0 ? `
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="campaigns-grid"></div>
                            ` : `
                                ${EmptyState.html('campaigns', 'No hay campañas activas en este momento.')}
                            `}
                        </section>

                        ${topEnrolled.length > 0 ? `
                            <section class="mb-8 content-fade-in">
                                <div class="card p-6">
                                    <div class="flex items-center justify-between mb-5">
                                        <h2 class="text-lg font-bold text-gray-800">Campañas con Mayor Inscripción</h2>
                                        <span class="text-sm text-muted">Top 5</span>
                                    </div>
                                    <div class="divide-y divide-gray-100" id="top-enrolled-list"></div>
                                </div>
                            </section>
                        ` : ""}
                    `;

                    const quickActionsEl = content.querySelector("#quick-actions");
                    this._renderQuickActions(quickActionsEl);

                    const statsGrid = content.querySelector("#stats-grid");
                    const statConfigs = [
                        { label: "Total Estudiantes", value: Number(stats.total_students ?? 0), icon: statIcons.students, color: "blue", description: "Estudiantes activos" },
                        { label: "Egresados", value: Number(stats.total_graduates ?? 0), icon: statIcons.graduates, color: "purple", description: "Graduados" },
                        { label: "Actualizados", value: Number(stats.updated_count ?? 0), icon: statIcons.updated, color: "green", description: `${Number(stats.update_percentage ?? 0)}% del total` },
                        { label: "Pendientes", value: Number(stats.pending_count ?? 0), icon: statIcons.pending, color: "yellow", description: "Requieren actualización" }
                    ];
                    statConfigs.forEach(cfg => {
                        if (statsGrid) {
                            statsGrid.appendChild(StatsCard.render(cfg));
                        }
                    });

                    if (activeCampaigns.length > 0) {
                        const cg = content.querySelector("#campaigns-grid");
                        if (cg) {
                            activeCampaigns.slice(0, 6).forEach(c => {
                                const card = CampaignCard.render(c);
                                card.classList.add("stagger-item", "cursor-pointer");
                                card.addEventListener("click", (e) => {
                                    if (e.target.closest("button, a, input, select")) return;
                                    Router.navigate(`/campanas/${c.id}`);
                                });
                                cg.appendChild(card);
                            });
                        }
                    }

                    const topEnrolledList = content.querySelector("#top-enrolled-list");
                    if (topEnrolledList) {
                        topEnrolled.forEach((c, i) => {
                            topEnrolledList.appendChild(this._renderTopEnrolledRow(c, i));
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
                label: "Nueva Campaña",
                icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,
                href: "/campanas/crear"
            },
            {
                label: "Crear Institución",
                icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
                href: "/instituciones/crear"
            }
        ];

        actions.forEach(action => {
            const el = document.createElement("a");
            el.setAttribute("data-link", "");
            el.href = action.href;
            el.className = "flex items-center gap-3 p-3 rounded-lg transition cursor-pointer hover:bg-gray-50";
            el.innerHTML = `
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                    <span style="color:var(--rol-primary, #1D4ED8)">${action.icon}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">${action.label}</span>
                <svg class="w-4 h-4 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            `;
            container.appendChild(el);
        });
    },

    _renderTopEnrolledRow(campaign, index) {
        const el = document.createElement("div");
        el.className = "flex items-center gap-4 py-3 stagger-item cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition";
        el.style.animationDelay = `${0.05 * index}s`;
        el.innerHTML = `
            <span class="text-sm font-bold text-muted w-6">${index + 1}</span>
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                <svg class="w-5 h-5" style="color:var(--rol-primary, #1D4ED8)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6"/></svg>
            </div>
            <div class="flex-grow min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">${campaign.title}</p>
                <p class="text-xs text-muted">${campaign.type || "General"}</p>
            </div>
            <div class="text-right flex-shrink-0">
                <p class="text-sm font-bold" style="color:var(--rol-primary, #1D4ED8)">${campaign.enrollment_count || 0}</p>
                <p class="text-xs text-muted">inscritos</p>
            </div>
        `;
        el.addEventListener("click", () => Router.navigate(`/campanas/${campaign.id}`));
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); Router.navigate(`/campanas/${campaign.id}`); }
        });
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        return el;
    },

};

export default DashboardSuperAdmin;
