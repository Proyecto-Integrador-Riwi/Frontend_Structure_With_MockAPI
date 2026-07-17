/** Campanas en las que el estudiante esta inscrito. Solo ESTUDIANTE. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import * as CampaignService from "../services/campaignService";

const MisCampanas = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            content.appendChild(Skeleton.grid(3, "card"));

            (async () => {
                const user = Auth.getUser();

                try {
                    let campaigns = [];
                    if (user?.person_id) {
                        campaigns = await CampaignService.getCampaigns({ person_id: user.person_id });
                    }

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in">
                            <h1 class="text-2xl font-bold text-gray-800">Mis Campañas</h1>
                            <p class="text-muted mt-1">Campañas en las que estás inscrito/a</p>
                        </section>

                        ${campaigns.length > 0
                            ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="mc-grid"></div>`
                            : `
                            <div class="empty-state content-fade-in">
                                ${EmptyState.svg('enrollments')}
                                <p class="text-gray-400 mb-4">No estás inscrito/a en ninguna campaña actualmente.</p>
                                <a data-link href="/dashboard-estudiante" class="btn-primary text-sm">
                                    Ver campañas disponibles
                                </a>
                            </div>
                            `
                        }
                    `;

                    if (campaigns.length > 0) {
                        const grid = content.querySelector("#mc-grid");
                        campaigns.forEach(c => {
                            const card = CampaignCard.render(c);
                            card.classList.add("stagger-item");
                            grid.appendChild(card);
                        });
                    }

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

export default MisCampanas;
