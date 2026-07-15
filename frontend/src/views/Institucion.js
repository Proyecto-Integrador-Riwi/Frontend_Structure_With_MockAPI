import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import CampaignCard from "../components/CampaignCard";
import FilterBar from "../components/FilterBar";
import StudentList from "../components/StudentList";
import Skeleton from "../components/Skeleton";
import { applyStudentFilters } from "../utils/filters";
import * as InstitutionService from "../services/institutionService";
import * as CampaignService from "../services/campaignService";

const Institucion = {
    render(params = {}) {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "max-w-7xl mx-auto";

            const user = Auth.getUser();
            let institutionId = params.id || user?.institution_id;

            if (!institutionId) {
                content.innerHTML = `<div class="text-center py-20 text-gray-500 px-6">No se encontró institución</div>`;
                return content;
            }

            content.innerHTML = `
                <section class="relative h-64 w-full overflow-hidden bg-gray-200">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="shimmer w-full h-full"></div>
                    </div>
                </section>
                <section class="flex justify-center -mt-12 mb-6 relative z-10 px-6">
                    <div class="shimmer w-28 h-28 rounded-full"></div>
                </section>
                <section class="px-6 space-y-4">
                    ${Skeleton.textLine().outerHTML}
                    ${Skeleton.textLine().outerHTML}
                </section>
            `;

            (async () => {
                try {
                    const [institution, campaigns, students] = await Promise.all([
                        InstitutionService.getInstitutionById(institutionId),
                        CampaignService.getCampaigns({ active: true, institution_id: institutionId }),
                        InstitutionService.getInstitutionStudents(institutionId)
                    ]);

                    const [grades, genders, statuses] = await Promise.all([
                        http.get('api/grades').then(r => r.json()),
                        http.get('api/genders').then(r => r.json()),
                        http.get('api/statuses').then(r => r.json())
                    ]);

                    content.innerHTML = `
                        <section class="relative h-64 w-full overflow-hidden gradient-barranquilla">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center">
                                    <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${institution.institution_name}</h1>
                                    <p class="text-blue-200">${institution.address || ""}</p>
                                </div>
                            </div>
                        </section>

                        <section class="flex justify-center -mt-12 mb-6 relative z-10 px-6">
                            <div class="bg-white rounded-full p-2 shadow-lg">
                                <div class="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
                                    <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                    </svg>
                                </div>
                            </div>
                        </section>

                        <section class="text-center mb-8 px-6">
                            <p class="text-gray-600"><span class="font-medium">Director:</span> ${institution.director}</p>
                            <p class="text-gray-500 text-sm mt-1">${institution.neighborhood || ""}, ${institution.locality || ""}</p>
                        </section>

                        <div class="px-6">
                            ${campaigns.length > 0 ? `
                                <section class="mb-10">
                                    <h2 class="text-xl font-bold text-gray-800 mb-4">Campañas Activas</h2>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="inst-campaigns"></div>
                                </section>
                            ` : ""}

                            <section>
                                <h2 class="text-xl font-bold text-gray-800 mb-4">Estudiantes</h2>
                                <div id="inst-filters"></div>
                                <div id="inst-students"></div>
                            </section>
                        </div>
                    `;

                    if (campaigns.length > 0) {
                        const grid = content.querySelector("#inst-campaigns");
                        campaigns.forEach(c => grid.appendChild(CampaignCard.render(c)));
                    }

                    const filtersEl = content.querySelector("#inst-filters");
                    const studentsEl = content.querySelector("#inst-students");

                    const onFilter = (filters) => {
                        const filtered = applyStudentFilters(students, filters);
                        studentsEl.innerHTML = "";
                        studentsEl.appendChild(StudentList.render({ students: filtered }));
                        FilterBar.updateCount(filtersEl, filtered.length);
                    };

                    filtersEl.appendChild(FilterBar.render({ grades, genders, statuses, onFilter }));

                    studentsEl.appendChild(StudentList.render({ students }));
                    FilterBar.updateCount(filtersEl, students.length);

                } catch (err) {
                    console.error(err);
                    content.innerHTML = `<div class="text-center py-20 text-red-500">Error al cargar datos</div>`;
                }
            })();

            return content;
        });
    }
};

export default Institucion;
