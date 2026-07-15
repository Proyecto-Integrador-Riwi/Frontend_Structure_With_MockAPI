import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import FilterBar from "../components/FilterBar";
import StudentList from "../components/StudentList";
import Skeleton from "../components/Skeleton";
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
                        <section class="mb-8 content-fade-in">
                            <h1 class="text-2xl font-bold text-gray-800">Estudiantes</h1>
                            <p class="text-muted mt-1">${user?.rol === "SUPERADMIN" ? "Todos los estudiantes del sistema" : "Estudiantes de tu institución"}</p>
                        </section>

                        <div id="est-filters" class="content-fade-in"></div>
                        <div id="est-count" class="text-sm text-muted mb-4" aria-live="polite"></div>
                        <div id="est-students" class="content-fade-in"></div>
                    `;

                    const filtersEl = content.querySelector("#est-filters");
                    const studentsEl = content.querySelector("#est-students");

                    const onFilter = (filters) => {
                        const filtered = applyStudentFilters(students, filters);
                        studentsEl.innerHTML = "";
                        studentsEl.appendChild(StudentList.render({
                            students: filtered,
                            onStudentClick: (student) => {
                                const personId = student.person?.id || student.people_id;
                                if (personId) Router.navigate(`/estudiante/${personId}`);
                            }
                        }));
                        FilterBar.updateCount(filtersEl, filtered.length);
                    };

                    filtersEl.appendChild(FilterBar.render({ grades, genders, statuses, onFilter }));

                    studentsEl.appendChild(StudentList.render({
                        students,
                        onStudentClick: (student) => {
                            const personId = student.person?.id || student.people_id;
                            if (personId) Router.navigate(`/estudiante/${personId}`);
                        }
                    }));
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
