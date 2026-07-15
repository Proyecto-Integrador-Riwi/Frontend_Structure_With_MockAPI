import Auth from "../modules/auth";
import Router from "../modules/router";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import * as CampaignService from "../services/campaignService";

const DashboardEstudiante = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            const skeleton = Skeleton.grid(3, "card");
            skeleton.id = "campaigns-grid";
            content.appendChild(Skeleton.textLine());
            content.appendChild(skeleton);

            (async () => {
                const user = Auth.getUser();

                try {
                    let campaigns = [];
                    if (user?.person_id) {
                        campaigns = await CampaignService.getAvailableCampaigns(user.person_id);
                    }

                    content.innerHTML = `
                        <section class="mb-8 rounded-xl bg-white shadow-sm p-6 content-fade-in">
                            <h1 class="text-2xl font-bold text-gray-800 mb-2">
                                Bienvenido, ${user?.username || "Estudiante"}
                            </h1>
                            <p class="text-muted">Aquí puedes ver las campañas disponibles para ti y actualizar tu información.</p>
                        </section>

                        <section class="mb-10">
                            <h2 class="text-xl font-bold text-gray-800 mb-4">Campañas Disponibles</h2>
                            ${campaigns.length > 0
                                ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="campaigns-grid" aria-live="polite"></div>`
                                : EmptyState.html('eye', 'No hay campañas disponibles en este momento.')
                            }
                        </section>

                        <section class="content-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <a data-link href="/mis-campanas" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Mis Campañas</p>
                                        <p class="text-sm text-muted">Ver campañas inscritas</p>
                                    </div>
                                </a>
                                <a data-link href="/perfil" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg" style="background:var(--rol-accent-light, #FEF3C7);color:var(--rol-accent, #F59E0B)">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Mi Perfil</p>
                                        <p class="text-sm text-muted">Actualizar datos personales</p>
                                    </div>
                                </a>
                            </div>
                        </section>
                    `;

                    const grid = content.querySelector("#campaigns-grid");
                    if (grid) {
                        campaigns.forEach(c => {
                            const card = CampaignCard.render(c, {
                                showEnrollButton: true,
                                onEnroll: async (campaignId) => {
                                    ConfirmDialog.show({
                                        title: "Inscribirse en campaña",
                                        message: "¿Estás seguro que deseas inscribirte en esta campaña?",
                                        confirmText: "Inscribirme",
                                        onConfirm: async () => {
                                            try {
                                                await CampaignService.enrollInCampaign(campaignId);
                                                Toast.show("¡Inscripción exitosa!", "success");
                                                // Mark card as enrolled instead of full refresh
                                                const btn = card.querySelector("[data-campaign-id]");
                                                if (btn) {
                                                    btn.disabled = true;
                                                    btn.textContent = "✓ Inscrito";
                                                    btn.classList.remove("btn-primary");
                                                    btn.classList.add("btn-outline");
                                                }
                                            } catch (err) {
                                                Toast.show(err.message || "Error al inscribirse", "error");
                                            }
                                        }
                                    });
                                }
                            });
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

export default DashboardEstudiante;
