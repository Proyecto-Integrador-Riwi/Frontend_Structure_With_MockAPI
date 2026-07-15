import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as CampaignService from "../services/campaignService";
import Router from "../modules/router";

const Campanas = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            content.appendChild(Skeleton.grid(3, "card"));

            (async () => {
                try {
                    const user = Auth.getUser();
                    const filters = user?.rol === "ADMINISTRADOR" && user?.institution_id
                        ? { institution_id: user.institution_id }
                        : {};
                    const campaigns = await CampaignService.getCampaigns(filters);

                    // Collect unique types
                    const types = [...new Set(campaigns.map(c => c.type).filter(Boolean))];

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">Campañas</h1>
                                <p class="text-muted mt-1">Todas las campañas disponibles</p>
                            </div>
                            <a data-link href="/campanas/crear" class="btn-primary inline-flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Nueva campaña
                            </a>
                        </section>

                        <div class="flex flex-wrap gap-3 items-center mb-6 content-fade-in">
                            <input id="cam-search" type="text" placeholder="Buscar por nombre..."
                                class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                aria-label="Buscar campañas por nombre" />

                            <select id="cam-status-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por estado">
                                <option value="">Todos los estados</option>
                                <option value="active">Vigentes</option>
                                <option value="upcoming">Próximas</option>
                                <option value="finished">Finalizadas</option>
                            </select>

                            ${types.length > 0 ? `
                                <select id="cam-type-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por tipo">
                                    <option value="">Todos los tipos</option>
                                    ${types.map(t => `<option value="${t}">${t}</option>`).join("")}
                                </select>
                            ` : ""}
                        </div>

                        <div id="cam-count" class="text-sm text-muted mb-4 content-fade-in" aria-live="polite"></div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="cam-grid"></div>
                    `;

                    const getStatus = (c) => {
                        const now = new Date();
                        const start = new Date(c.start_date);
                        const end = c.end_date ? new Date(c.end_date) : new Date("2099-12-31");
                        if (now >= start && now <= end) return "active";
                        if (now < start) return "upcoming";
                        return "finished";
                    };

                    const renderFiltered = () => {
                        const searchTerm = (content.querySelector("#cam-search").value || "").toLowerCase();
                        const statusFilter = content.querySelector("#cam-status-filter").value;
                        const typeFilter = content.querySelector("#cam-type-filter")?.value || "";

                        let filtered = [...campaigns];
                        if (searchTerm) {
                            filtered = filtered.filter(c => (c.title || "").toLowerCase().includes(searchTerm));
                        }
                        if (statusFilter) {
                            filtered = filtered.filter(c => getStatus(c) === statusFilter);
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
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                            <svg class="w-16 h-16 text-red-300 mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-gray-500 mb-4">Error al cargar campañas</p>
                            <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            })();

            return content;
        });
    }
};

export default Campanas;
