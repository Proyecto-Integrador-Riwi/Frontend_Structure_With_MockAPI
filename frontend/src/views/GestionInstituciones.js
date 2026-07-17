/** Gestion de instituciones - listado, activar/desactivar. Solo SUPERADMIN. */
import Auth from "../modules/auth";
import Layout from "../components/Layout";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import Router from "../modules/router";
import { createErrorView } from "../utils/errorHandler";
import { isSuperAdmin } from "../utils/permissions";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import * as InstitutionService from "../services/institutionService";

const GestionInstituciones = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            content.innerHTML = `
                <div class="space-y-4">
                    ${Skeleton.grid(3, "card").outerHTML}
                </div>
            `;

            (async () => {
                try {
                    const institutions = await InstitutionService.getInstitutions();

                    content.innerHTML = `
                        <section class="mb-6 content-fade-in">
                            <div class="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl px-6 py-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Instituciones Educativas</h1>
                                    <p id="inst-hero-count" class="text-slate-200/80 mt-1 text-sm" data-count="${institutions.length}">${institutions.length} institución${institutions.length !== 1 ? "es" : ""} registrada${institutions.length !== 1 ? "s" : ""}</p>
                                </div>
                                <a data-link href="/instituciones/crear" class="inline-flex items-center gap-2 bg-white text-slate-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Nueva institución
                                </a>
                            </div>
                        </section>

                        <div class="bg-white rounded-lg shadow-sm p-4 mb-6 content-fade-in">
                            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                    <div class="relative">
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                        <input id="inst-search" type="text" placeholder="Nombre, director o código DANE..."
                                            class="w-full sm:min-w-[260px] pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            aria-label="Buscar institución" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="inst-count" class="text-sm text-muted mb-4 content-fade-in" aria-live="polite"></div>

                        <div id="inst-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-fade-in"></div>
                    `;

                    const grid = content.querySelector("#inst-grid");
                    const searchInput = content.querySelector("#inst-search");
                    const countEl = content.querySelector("#inst-count");

                    const renderCards = (filtered) => {
                        grid.innerHTML = "";

                        if (filtered.length === 0) {
                            grid.innerHTML = EmptyState.html('search', 'No se encontraron instituciones con ese criterio de búsqueda.');
                            countEl.textContent = "0 instituciones";
                            return;
                        }

                        filtered.forEach((inst, i) => {
                            const card = this._renderCard(inst, i);
                            const toggleBtn = card.querySelector("[data-toggle-id]");
                            if (toggleBtn) {
                                toggleBtn.addEventListener("click", (e) => {
                                    e.stopPropagation();
                                    const action = inst.active !== false ? 'desactivar' : 'activar';
                                    ConfirmDialog.show({
                                        title: `${action === 'desactivar' ? 'Desactivar' : 'Activar'} institución`,
                                        message: `¿Estás seguro de ${action} "${inst.institution_name}"?${action === 'desactivar' ? ' Los administradores no podrán acceder.' : ''}`,
                                        confirmText: action === 'desactivar' ? 'Desactivar' : 'Activar',
                                        destructive: action === 'desactivar',
                                        onConfirm: async () => {
                                            try {
                                                const result = await InstitutionService.toggleInstitutionActive(inst.id);
                                                inst.active = result.data.active;
                                                Toast.success(result.message);
                                                grid.innerHTML = "";
                                                renderCards(filtered);
                                            } catch (err) {
                                                Toast.error(err.message);
                                            }
                                        }
                                    });
                                });
                            }
                            grid.appendChild(card);
                        });

                        countEl.textContent = `${filtered.length} institución${filtered.length !== 1 ? "es" : ""}`;
                    };

                    const filterCards = () => {
                        const term = (searchInput.value || "").toLowerCase().trim();
                        if (!term) {
                            renderCards(institutions);
                            return;
                        }
                        const filtered = institutions.filter(inst =>
                            inst.institution_name.toLowerCase().includes(term) ||
                            (inst.director || "").toLowerCase().includes(term) ||
                            (inst.dane_code || "").toLowerCase().includes(term) ||
                            (inst.neighborhood || "").toLowerCase().includes(term) ||
                            (inst.locality || "").toLowerCase().includes(term)
                        );
                        renderCards(filtered);
                    };

                    let searchTimeout;
                    searchInput.addEventListener("input", () => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(filterCards, 300);
                    });
                    renderCards(institutions);

                } catch (err) {
                    console.error(err);
                    content.innerHTML = "";
                    content.appendChild(createErrorView("Error al cargar instituciones"));
                }
            })();

            return content;
        });
    },

    _renderCard(inst, index) {
        const el = document.createElement("div");
        el.className = "card card-hover overflow-hidden flex flex-col stagger-item cursor-pointer";
        el.style.animationDelay = `${Math.min(0.05 * index, 0.5)}s`;
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");

        const initial = (inst.institution_name || "?").charAt(0).toUpperCase();

        const isActive = inst.active !== false;
        el.innerHTML = `
            <div class="h-2" style="background:${isActive ? 'var(--rol-gradient, linear-gradient(135deg, #1D4ED8, #1E3A8A))' : 'linear-gradient(135deg, #9CA3AF, #6B7280)'}"></div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style="${isActive ? 'background:var(--rol-primary-light, #DBEAFE)' : 'background:#F3F4F6'}">
                        <span class="text-xl font-bold" style="${isActive ? 'color:var(--rol-primary, #1D4ED8)' : 'color:#9CA3AF'}">${initial}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-bold ${isActive ? 'text-gray-800' : 'text-gray-400'} leading-tight mb-1">${inst.institution_name}</h3>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge badge-blue text-xs">DANE: ${inst.dane_code || "—"}</span>
                            <span class="text-xs text-muted">${inst.neighborhood || ""}${inst.neighborhood && inst.locality ? ", " : ""}${inst.locality || ""}</span>
                            <span class="badge ${isActive ? 'badge-green' : 'badge-gray'} text-xs">${isActive ? 'Activa' : 'Inactiva'}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-2.5 mb-5 flex-grow">
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>${inst.director || "Sin director"}</span>
                    </div>
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>${inst.address || "Sin dirección registrada"}</span>
                    </div>
                </div>

                <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/>
                        </svg>
                        ${inst.student_count || 0} estudiantes
                    </div>
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                        ${inst.graduate_count || 0} egresados
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <a data-link href="/institucion/${inst.id}" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Ver detalle
                    </a>
                    ${isSuperAdmin() ? `
                    <button data-toggle-id="${inst.id}" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        ${isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    ` : ""}
                </div>
            </div>
        `;

        el.addEventListener("click", (e) => {
            if (e.target.closest("a")) return;
            Router.navigate(`/institucion/${inst.id}`);
        });
        el.addEventListener("keydown", (e) => {
            if (e.target.closest("a")) return;
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                Router.navigate(`/institucion/${inst.id}`);
            }
        });

        return el;
    }
};

export default GestionInstituciones;
