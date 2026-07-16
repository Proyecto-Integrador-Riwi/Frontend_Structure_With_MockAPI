import Auth from "../modules/auth";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import Router from "../modules/router";
import * as InstitutionService from "../services/institutionService";

const GestionInstituciones = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            content.appendChild(Skeleton.grid(3, "card"));

            (async () => {
                try {
                    const institutions = await InstitutionService.getInstitutions();

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">Instituciones Educativas</h1>
                                <p class="text-muted mt-1">Gestiona las instituciones registradas en el sistema</p>
                            </div>
                            <a data-link href="/instituciones/crear" class="btn-primary inline-flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                </svg>
                                Nueva institución
                            </a>
                        </section>

                        <div id="inst-grid" class="space-y-4 content-fade-in"></div>
                    `;

                    const grid = content.querySelector("#inst-grid");

                    if (institutions.length === 0) {
                        grid.innerHTML = EmptyState.html('search', 'No hay instituciones registradas.');
                    } else {
                        institutions.forEach(inst => {
                            grid.appendChild(this._renderCard(inst));
                        });
                    }

                } catch (err) {
                    console.error(err);
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                            <svg class="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-gray-500 mb-4">Error al cargar instituciones</p>
                            <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            })();

            return content;
        });
    },

    _renderCard(inst) {
        const el = document.createElement("div");
        el.className = "card card-hover overflow-hidden";
        el.innerHTML = `
            <div class="flex flex-col md:flex-row">
                <div class="flex-shrink-0 flex items-center justify-center p-6 bg-primary-light md:w-40">
                    <div class="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center">
                        <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                    </div>
                </div>
                <div class="flex-grow p-5">
                    <h3 class="text-lg font-bold text-gray-800 mb-1">${inst.institution_name}</h3>
                    <p class="text-sm text-gray-500 mb-3">Director: ${inst.director} · Código DANE: ${inst.dane_code || "—"}</p>
                    <div class="flex flex-wrap gap-4 text-sm">
                        <span class="text-gray-500">${inst.address || "Sin dirección"}</span>
                        <span class="text-gray-400">|</span>
                        <span class="text-gray-500">${inst.neighborhood || ""}, ${inst.locality || ""}</span>
                    </div>
                    <div class="flex gap-4 mt-3 text-sm">
                        <span class="text-blue-600 font-medium">${inst.student_count || 0} estudiantes</span>
                        <span class="text-green-600 font-medium">${inst.graduate_count || 0} egresados</span>
                    </div>
                </div>
                <div class="flex items-center justify-center p-5 border-t md:border-t-0 md:border-l border-gray-100">
                    <div class="flex gap-2">
                        <a data-link href="/instituciones/${inst.id}/editar" class="btn-secondary text-sm px-4 py-2">
                            Editar
                        </a>
                        <button data-delete-id="${inst.id}" data-delete-name="${inst.institution_name}" class="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;

        const deleteBtn = el.querySelector("[data-delete-id]");
        if (deleteBtn) {
            deleteBtn.addEventListener("click", () => {
                const id = parseInt(deleteBtn.dataset.deleteId);
                const name = deleteBtn.dataset.deleteName;
                ConfirmDialog.show({
                    title: "Eliminar institución",
                    message: `¿Estás seguro de eliminar "${name}"? Esta acción no se puede deshacer.`,
                    confirmText: "Eliminar",
                    cancelText: "Cancelar",
                    destructive: true,
                    onConfirm: async () => {
                        try {
                            await InstitutionService.deleteInstitution(id);
                            Toast.success("Institución eliminada");
                            el.remove();
                            const grid = document.querySelector("#inst-grid");
                            if (grid && grid.children.length === 0) {
                                grid.innerHTML = EmptyState.html('search', 'No hay instituciones registradas.');
                            }
                        } catch (err) {
                            Toast.error(err.message);
                        }
                    }
                });
            });
        }

        return el;
    }
};

export default GestionInstituciones;
