/** Listado de estudiantes con filtros, paginacion y cache de catalogos. Solo ADMIN. */
import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import FilterBar from "../components/FilterBar";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import { createErrorView } from "../utils/errorHandler";
import { getUpdateColor } from "../utils/dates";
import { hasRole } from "../utils/permissions";
import { getCached } from "../utils/cache";
import * as StudentService from "../services/studentService";
import { applyStudentFilters } from "../utils/filters";
import Router from "../modules/router";

const Estudiantes = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            if (!hasRole("SUPERADMIN", "ADMINISTRADOR")) {
                content.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                        <svg class="w-16 h-16 text-gray-300 mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <p class="text-gray-500">No tienes permisos para ver esta sección</p>
                    </div>
                `;
                return content;
            }

            const loading = document.createElement("div");
            loading.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5";
            for (let i = 0; i < 6; i++) loading.appendChild(Skeleton.card());
            content.appendChild(loading);

            (async () => {
                try {
                    const user = Auth.getUser();
                    let students = await StudentService.getStudents({ institution_id: user?.institution_id });

                    const [grades, genders, statuses] = await Promise.all([
                        getCached('grades', () => http.getJSON('api/grades')),
                        getCached('genders', () => http.getJSON('api/genders')),
                        getCached('statuses', () => http.getJSON('api/statuses'))
                    ]);

                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const ninetyDaysAgo = new Date();
                    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

                    const updated = students.filter(s => {
                        const lastUpd = s.last_update_date || s.person?.last_update_date;
                        return lastUpd && new Date(lastUpd) >= thirtyDaysAgo;
                    }).length;
                    const pending30 = students.filter(s => {
                        const lastUpd = s.last_update_date || s.person?.last_update_date;
                        return lastUpd && new Date(lastUpd) >= ninetyDaysAgo && new Date(lastUpd) < thirtyDaysAgo;
                    }).length;
                    const pending90 = students.filter(s => {
                        const lastUpd = s.last_update_date || s.person?.last_update_date;
                        return !lastUpd || new Date(lastUpd) < ninetyDaysAgo;
                    }).length;

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in">
                            <div class="gradient-barranquilla rounded-2xl p-8 relative overflow-hidden">
                                <div class="hero-shape hero-shape-1"></div>
                                <div class="hero-shape hero-shape-2"></div>
                                <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div class="flex items-center gap-3 mb-2">
                                            <span class="badge bg-white/20 text-white border border-white/20">Estudiantes</span>
                                            <span class="text-white/60 text-sm" id="hero-count">${students.length} estudiante${students.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <h1 class="text-3xl font-bold text-white">Estudiantes</h1>
                                        <p class="text-white/80 mt-1">${hasRole("SUPERADMIN") ? "Todos los estudiantes del sistema" : "Estudiantes de tu institución"}</p>
                                    </div>
                                    <a data-link href="/estudiantes/crear" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition shadow-lg flex-shrink-0">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                        </svg>
                                        Nuevo estudiante
                                    </a>
                                </div>
                            </div>
                        </section>

                        <div class="flex flex-wrap items-center gap-3 mb-6 content-fade-in">
                            <div class="relative flex-grow max-w-xs">
                                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <input id="est-search" type="text" placeholder="Buscar por nombre o documento..."
                                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    aria-label="Buscar estudiantes" />
                            </div>
                            <select id="est-update-filter"
                                class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                aria-label="Filtrar por estado de actualización">
                                <option value="">Todos</option>
                                <option value="updated">Actualizados</option>
                                <option value="pending">Pendientes</option>
                            </select>
                        </div>

                        <div id="est-filters" class="content-fade-in mb-4"></div>

                        <div class="flex flex-wrap gap-3 mb-4 text-xs content-fade-in">
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> ${updated} actualizados</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> ${pending30} por actualizar</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> ${pending90} desactualizados</span>
                            <span id="est-count" class="text-muted ml-auto" aria-live="polite"></span>
                        </div>

                        <div id="est-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-fade-in"></div>
                        <div id="est-pagination" class="mt-8 content-fade-in"></div>
                    `;

                    const filtersEl = content.querySelector("#est-filters");
                    const grid = content.querySelector("#est-grid");
                    const searchInput = content.querySelector("#est-search");
                    const countEl = content.querySelector("#est-count");

                    const PAGE_SIZE = 9;
                    let currentPage = 1;
                    let allFiltered = [];
                    let currentFilters = null;

                    const renderPagination = () => {
                        const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
                        let pagHtml = document.getElementById("est-pagination");
                        if (!pagHtml) return;
                        pagHtml.innerHTML = "";

                        if (totalPages <= 1) return;

                        const wrapper = document.createElement("div");
                        wrapper.className = "flex items-center justify-center gap-2";

                        const prevBtn = document.createElement("button");
                        prevBtn.className = "px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 " + (currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100");
                        prevBtn.disabled = currentPage === 1;
                        prevBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg> Anterior`;
                        prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderCards(); renderPagination(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
                        wrapper.appendChild(prevBtn);

                        const pages = [];
                        for (let i = 1; i <= totalPages; i++) {
                            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                                pages.push(i);
                            } else if (pages[pages.length - 1] !== -1) {
                                pages.push(-1);
                            }
                        }

                        pages.forEach(p => {
                            if (p === -1) {
                                const dot = document.createElement("span");
                                dot.className = "px-1 text-gray-400 text-sm";
                                dot.textContent = "...";
                                wrapper.appendChild(dot);
                            } else {
                                const btn = document.createElement("button");
                                btn.className = "w-9 h-9 rounded-lg text-sm font-medium transition inline-flex items-center justify-center " + (p === currentPage ? "text-white" : "text-gray-600 hover:bg-gray-100");
                                if (p === currentPage) btn.style.background = "var(--rol-primary, #475569)";
                                btn.textContent = p;
                                btn.addEventListener("click", () => { currentPage = p; renderCards(); renderPagination(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
                                wrapper.appendChild(btn);
                            }
                        });

                        const nextBtn = document.createElement("button");
                        nextBtn.className = "px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 " + (currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100");
                        nextBtn.disabled = currentPage === totalPages;
                        nextBtn.innerHTML = `Siguiente <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`;
                        nextBtn.addEventListener("click", () => { if (currentPage < totalPages) { currentPage++; renderCards(); renderPagination(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });
                        wrapper.appendChild(nextBtn);

                        pagHtml.appendChild(wrapper);
                    };

                    const renderCards = () => {
                        grid.innerHTML = "";

                        if (allFiltered.length === 0) {
                            grid.innerHTML = EmptyState.html('search', 'No se encontraron estudiantes con los filtros seleccionados.');
                            countEl.textContent = "0 estudiantes";
                            document.getElementById("est-pagination").innerHTML = "";
                            return;
                        }

                        const start = (currentPage - 1) * PAGE_SIZE;
                        const pageItems = allFiltered.slice(start, start + PAGE_SIZE);

                        pageItems.forEach((s, i) => {
                            grid.appendChild(this._renderCard(s, start + i, getUpdateColor(s)));
                        });

                        countEl.textContent = `${allFiltered.length} estudiante${allFiltered.length !== 1 ? "s" : ""}`;
                        FilterBar.updateCount(filtersEl, allFiltered.length);
                        renderPagination();
                    };

                    const applyAllFilters = () => {
                        currentPage = 1;
                        let filtered = students;
                        const searchTerm = searchInput.value.trim().toLowerCase();
                        if (searchTerm) {
                            filtered = filtered.filter(s => {
                                const fullName = `${s.person?.first_name || ''} ${s.person?.last_name || ''}`.toLowerCase();
                                const docNumber = s.person?.document_number || '';
                                return fullName.includes(searchTerm) || docNumber.includes(searchTerm);
                            });
                        }

                        if (typeof currentFilters !== 'undefined' && currentFilters) {
                            filtered = applyStudentFilters(filtered, currentFilters);
                        }

                        const updateFilter = content.querySelector("#est-update-filter")?.value;
                        if (updateFilter) {
                            const thirtyDaysAgo = new Date();
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                            filtered = filtered.filter(s => {
                                const lastUpd = s.last_update_date || s.person?.last_update_date;
                                const isUpdated = lastUpd && new Date(lastUpd) >= thirtyDaysAgo;
                                return updateFilter === "updated" ? isUpdated : !isUpdated;
                            });
                        }

                        allFiltered = filtered;
                        renderCards();
                        const heroCount = content.querySelector("#hero-count");
                        if (heroCount) heroCount.textContent = `${students.length} estudiante${students.length !== 1 ? "s" : ""}`;
                    };

                    let searchTimeout;
                    searchInput.addEventListener("input", () => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(applyAllFilters, 300);
                    });
                    const updateFilterSelect = content.querySelector("#est-update-filter");
                    if (updateFilterSelect) updateFilterSelect.addEventListener("change", applyAllFilters);

                    const onFilter = (filters) => {
                        currentFilters = filters;
                        applyAllFilters();
                    };

                    filtersEl.appendChild(FilterBar.render({ grades, genders, statuses, onFilter }));

                    allFiltered = students;
                    renderCards();

                } catch (err) {
                    console.error(err);
                    content.innerHTML = "";
                    content.appendChild(createErrorView("Error al cargar estudiantes"));
                }
            })();

            return content;
        });
    },

    _renderCard(student, index, updateColor) {
        const el = document.createElement("div");
        el.className = "card card-hover overflow-hidden flex flex-col stagger-item cursor-pointer";
        el.style.animationDelay = `${Math.min(0.05 * index, 0.5)}s`;
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");

        const p = student.person || {};
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || "Sin nombre";
        const initial = (p.first_name || "?").charAt(0).toUpperCase();
        const statusColor = student.status === "Activo" ? "badge-green" : student.status === "Graduado" ? "badge-blue" : "badge-gray";
        const updateLabel = updateColor === "green" ? "Actualizado" : updateColor === "yellow" ? "Por vencer" : "Desactualizado";

        const navigate = () => {
            const personId = p.id || student.people_id;
            if (personId) Router.navigate(`/estudiante/${personId}`);
        };

        el.innerHTML = `
            <div class="h-2" style="background:var(--rol-gradient, linear-gradient(135deg, #1D4ED8, #1E3A8A))"></div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-start gap-4 mb-4">
                    <div class="relative flex-shrink-0">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style="background:var(--rol-primary-light, #DBEAFE)">
                            <span class="text-xl font-bold" style="color:var(--rol-primary, #1D4ED8)">${initial}</span>
                        </div>
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${updateColor === "green" ? "bg-green-500" : updateColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}"></span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-bold text-gray-800 leading-tight mb-1 truncate">${fullName}</h3>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge ${statusColor} text-xs">${student.status || "—"}</span>
                            <span class="text-xs text-muted">${student.grade || "—"}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-2.5 mb-5 flex-grow">
                    ${p.document_number ? `
                        <div class="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/>
                            </svg>
                            <span>${p.document_number}${p.document_type ? ` (${p.document_type})` : ""}</span>
                        </div>
                    ` : ""}
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>${p.email || "Sin email"}</span>
                    </div>
                    ${student.institution?.name ? `
                        <div class="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                            </svg>
                            <span class="truncate">${student.institution.name}</span>
                        </div>
                    ` : ""}
                </div>

                <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${updateColor === "green" ? "bg-green-50 text-green-700" : updateColor === "yellow" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"}">
                        <span class="w-2 h-2 rounded-full ${updateColor === "green" ? "bg-green-500" : updateColor === "yellow" ? "bg-yellow-500" : "bg-red-500"}"></span>
                        ${updateLabel}
                    </span>
                    ${p.age ? `<span class="text-xs text-muted">${p.age} años</span>` : ""}
                    <span class="text-xs text-muted ml-auto">${student.gender || ""}</span>
                </div>

                <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <a data-link href="/estudiante/${p.id || student.people_id}" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Ver perfil
                    </a>
                    <a data-link href="/estudiante/${p.id || student.people_id}/editar" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Editar
                    </a>
                </div>
            </div>
        `;

        el.addEventListener("click", (e) => {
            if (e.target.closest("button, a")) return;
            navigate();
        });
        el.addEventListener("keydown", (e) => {
            if (e.target.closest("button, a")) return;
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate();
            }
        });

        return el;
    }
};

export default Estudiantes;
