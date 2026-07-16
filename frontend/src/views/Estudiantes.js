import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import FilterBar from "../components/FilterBar";
import StudentList from "../components/StudentList";
import Skeleton from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import * as StudentService from "../services/studentService";
import { applyStudentFilters } from "../utils/filters";
import Router from "../modules/router";

const Estudiantes = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-7xl mx-auto";

            const user = Auth.getUser();

            if (user?.rol !== "SUPERADMIN" && user?.rol !== "ADMINISTRADOR") {
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

            const skeletonGrid = document.createElement("div");
            skeletonGrid.className = "space-y-4";
            for (let i = 0; i < 4; i++) {
                skeletonGrid.appendChild(Skeleton.tableRow());
            }
            content.appendChild(skeletonGrid);

            (async () => {
                try {
                    let students = await StudentService.getStudents({ institution_id: user?.institution_id });

                    const [grades, genders, statuses] = await Promise.all([
                        http.get('api/grades').then(r => r.json()),
                        http.get('api/genders').then(r => r.json()),
                        http.get('api/statuses').then(r => r.json())
                    ]);

                    content.innerHTML = `
                        <section class="mb-8 content-fade-in flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">Estudiantes</h1>
                                <p class="text-muted mt-1">${user?.rol === "SUPERADMIN" ? "Todos los estudiantes del sistema" : "Estudiantes de tu institución"}</p>
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <input id="est-search" type="text" placeholder="Buscar por nombre o documento..."
                                    class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    aria-label="Buscar estudiantes por nombre o documento" />
                                <select id="est-update-filter"
                                    class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    aria-label="Filtrar por estado de actualización">
                                    <option value="">Todos</option>
                                    <option value="updated">Actualizados</option>
                                    <option value="pending">Pendientes</option>
                                </select>
                                <a data-link href="/estudiantes/crear" class="btn-primary inline-flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Nuevo
                                </a>
                            </div>
                        </section>

                        <div id="est-filters" class="content-fade-in"></div>
                        <div id="est-count" class="text-sm text-muted mb-4" aria-live="polite"></div>
                        <div id="est-students" class="content-fade-in"></div>
                    `;

                    // Barra de estado de actualización (semáforo - HU-14)
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

                    const filtersEl = content.querySelector("#est-filters");
                    const studentsEl = content.querySelector("#est-students");
                    const searchInput = content.querySelector("#est-search");

                    const renderList = (filteredStudents) => {
                        studentsEl.innerHTML = "";

                        // Agregar indicador de semáforo resumen
                        const summaryEl = document.createElement("div");
                        summaryEl.className = "flex flex-wrap gap-3 mb-4 text-xs";
                        summaryEl.innerHTML = `
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> ${updated} actualizados</span>
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> ${pending30} por actualizar</span>
                            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> ${pending90} desactualizados</span>
                        `;
                        studentsEl.appendChild(summaryEl);

                        if (filteredStudents.length === 0) {
                            const emptyEl = document.createElement('div');
                            emptyEl.innerHTML = EmptyState.html('search', 'No se encontraron estudiantes con los filtros seleccionados.');
                            studentsEl.appendChild(emptyEl);
                        } else {
                            const enrichedStudents = filteredStudents.map(s => {
                                const lastUpd = s.last_update_date || s.person?.last_update_date;
                                let statusColor = "red";
                                if (lastUpd) {
                                    const daysSince = Math.floor((Date.now() - new Date(lastUpd).getTime()) / (1000 * 60 * 60 * 24));
                                    if (daysSince <= 30) statusColor = "green";
                                    else if (daysSince <= 90) statusColor = "yellow";
                                }
                                return { ...s, _updateStatusColor: statusColor };
                            });

                            studentsEl.appendChild(StudentList.render({
                                students: enrichedStudents,
                                showUpdateIndicator: true,
                                onStudentClick: (student) => {
                                    const personId = student.person?.id || student.people_id;
                                    if (personId) Router.navigate(`/estudiante/${personId}`);
                                }
                            }));
                        }
                    };

                    const applyAllFilters = () => {
                        // Filtro por búsqueda
                        let filtered = students;
                        const searchTerm = searchInput.value.trim().toLowerCase();
                        if (searchTerm) {
                            filtered = filtered.filter(s => {
                                const fullName = `${s.person?.first_name || ''} ${s.person?.last_name || ''}`.toLowerCase();
                                const docNumber = s.person?.document_number || '';
                                return fullName.includes(searchTerm) || docNumber.includes(searchTerm);
                            });
                        }

                        // Filtros del FilterBar
                        if (window._activeFilters) {
                            filtered = applyStudentFilters(filtered, window._activeFilters);
                        }

                        // Filtro por estado de actualización (HU-15)
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

                        renderList(filtered);
                        const el = content.querySelector("#est-count");
                        if (el) el.textContent = `${filtered.length} estudiante${filtered.length !== 1 ? "s" : ""}`;
                        FilterBar.updateCount(filtersEl, filtered.length);
                    };

                    searchInput.addEventListener("input", applyAllFilters);
                    const updateFilterSelect = content.querySelector("#est-update-filter");
                    if (updateFilterSelect) updateFilterSelect.addEventListener("change", applyAllFilters);

                    const onFilter = (filters) => {
                        window._activeFilters = filters;
                        applyAllFilters();
                    };

                    filtersEl.appendChild(FilterBar.render({ grades, genders, statuses, onFilter }));

                    // Render inicial
                    renderList(students);
                    const countEl = content.querySelector("#est-count");
                    if (countEl) countEl.textContent = `${students.length} estudiante${students.length !== 1 ? "s" : ""}`;
                    FilterBar.updateCount(filtersEl, students.length);

                } catch (err) {
                    console.error(err);
                    content.innerHTML = `
                        <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                            <svg class="w-16 h-16 text-red-300 mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <p class="text-gray-500 mb-4">Error al cargar estudiantes</p>
                            <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
                        </div>
                    `;
                }
            })();

            return content;
        });
    }
};

export default Estudiantes;
