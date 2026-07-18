/** Listado de campañas con filtros (búsqueda, estado, tipo). ADMIN filtra por scope GLOBAL + propia institución. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import { getCampaignStatus } from "../utils/dates";
import * as CampaignService from "../services/campaignService";
import Router from "../modules/router";

const Campanas = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            content.appendChild(Skeleton.grid(3));

            (async () => {
                try {
                    const user = Auth.getUser();
                    const campaigns = await CampaignService.getCampaigns();

                    // ADMINISTRADOR: filtra para ver solo globales + las de su institución
                    let filteredCampaigns = campaigns;
                    if (user?.rol === "ADMINISTRADOR" && user?.institution_id) {
                        filteredCampaigns = campaigns.filter(c =>
                            c.scope?.some(s => s.scope_type === "GLOBAL") ||
                            c.scope?.some(s => s.scope_type === "INSTITUTION" && parseInt(s.institution_id) === user.institution_id)
                        );
                    }

                    // Collect unique types (de la lista filtrada si ADMIN)
                    const types = [...new Set(filteredCampaigns.map(c => c.type).filter(Boolean))];

                    content.innerHTML = `
                        <section class="mb-6 content-fade-in">
                            <div class="gradient-barranquilla rounded-2xl px-6 py-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Campañas</h1>
                                    <p class="text-slate-200/80 mt-1 text-sm">Explora y gestiona todas las campañas disponibles</p>
                                </div>
                                <a data-link href="/campanas/crear" class="inline-flex items-center gap-2 bg-[#F8F9FA] text-slate-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Nueva campaña
                                </a>
                            </div>
                        </section>

                        <div class="bg-white rounded-lg shadow-sm p-4 mb-6 content-fade-in">
                            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                    <input id="cam-search" type="text" placeholder="Nombre de la campaña..."
                                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        aria-label="Buscar campañas por nombre" />
                                </div>

                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select id="cam-status-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por estado">
                                        <option value="">Todos los estados</option>
                                        <option value="active">Vigentes</option>
                                        <option value="upcoming">Próximas</option>
                                        <option value="finished">Finalizadas</option>
                                    </select>
                                </div>

                                ${types.length > 0 ? `
                                    <div class="flex flex-col max-sm:w-full">
                                        <label class="text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select id="cam-type-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por tipo">
                                            <option value="">Todos los tipos</option>
                                            ${types.map(t => `<option value="${t}">${t}</option>`).join("")}
                                        </select>
                                    </div>
                                ` : ""}
                            </div>
                        </div>

                        <div id="cam-count" class="text-sm text-muted mb-4 content-fade-in" aria-live="polite"></div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="cam-grid"></div>
                    `;

                    const renderFiltered = () => {
                        const searchTerm = (content.querySelector("#cam-search").value || "").toLowerCase();
                        const statusFilter = content.querySelector("#cam-status-filter").value;
                        const typeFilter = content.querySelector("#cam-type-filter")?.value || "";

                        let filtered = [...filteredCampaigns];
                        if (searchTerm) {
                            filtered = filtered.filter(c => (c.title || "").toLowerCase().includes(searchTerm));
                        }
                        if (statusFilter) {
                            filtered = filtered.filter(c => getCampaignStatus(c).status === statusFilter);
                        }
                        if (typeFilter) {
                            filtered = filtered.filter(c => c.type === typeFilter);
                        }

                        const grid = content.querySelector("#cam-grid");
                        grid.innerHTML = "";

                        if (filtered.length === 0) {
                            grid.innerHTML = EmptyState.html('search', 'No se encontraron campañas con los filtros seleccionados.');
                        } else {
                            filtered.forEach(c => {
                                const card = CampaignCard.render(c);
                                card.classList.add("stagger-item", "cursor-pointer");
                                card.addEventListener("click", (e) => {
                                    if (e.target.closest("button, a, input, select")) return;
                                    Router.navigate(`/campanas/${c.id}`);
                                });
                                card.addEventListener("keydown", (e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        if (e.target.closest("button, a, input, select")) return;
                                        Router.navigate(`/campanas/${c.id}`);
                                    }
                                });
                                grid.appendChild(card);
                            });
                        }

                        content.querySelector("#cam-count").textContent = `${filtered.length} campaña${filtered.length !== 1 ? "s" : ""}`;
                    };

                    content.querySelector("#cam-search").addEventListener("input", renderFiltered);
                    content.querySelector("#cam-status-filter").addEventListener("change", renderFiltered);
                    const typeFilter = content.querySelector("#cam-type-filter");
                    if (typeFilter) typeFilter.addEventListener("change", renderFiltered);
                    renderFiltered();

                } catch (err) {
                    console.error(err);
                    content.innerHTML = "";
                    content.appendChild(createErrorView("Error al cargar campañas"));
                }
            })();

            return content;
        });
    }
};

export default Campanas;
