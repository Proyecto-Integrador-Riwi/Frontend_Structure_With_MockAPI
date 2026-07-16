import Auth from "../modules/auth";
import Layout from "../components/Layout";
import * as CampaignService from "../services/campaignService";
import Toast from "../components/Toast";
import Router from "../modules/router";

const CAMPAIGN_TYPES = [
    "academico", "cultural", "deportivo", "tecnologia", "salud", "medio_ambiente", "artes"
];

// HU-07: SUPERADMIN ve "Todos" o "Egresados"
// HU-08: ADMINISTRADOR ve "Estudiantes", "Egresados" o "Ambos"
function getTargetPopulationOptions() {
    const user = Auth.getUser();
    if (user?.rol === "SUPERADMIN") {
        return [
            { value: "all", label: "Todos" },
            { value: "graduates", label: "Egresados" },
        ];
    }
    return [
        { value: "students", label: "Estudiantes" },
        { value: "graduates", label: "Egresados" },
        { value: "all", label: "Ambos" },
    ];
}

const SCOPE_TYPES = [
    { value: "GLOBAL", label: "Global" },
    { value: "INSTITUTION", label: "Por institución" },
    { value: "LOCALITY", label: "Por localidad" },
    { value: "NEIGHBORHOOD", label: "Por barrio" },
];

const CampanaForm = {
    async render(params = {}) {
        const { id } = params;

        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-3xl mx-auto";

            const isEdit = Boolean(id);
            const title = isEdit ? "Editar Campaña" : "Crear Campaña";

            content.innerHTML = `
                <div class="content-fade-in">
                    <a data-link href="/campanas" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a campañas
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">${title}</h1>

                    <form id="campaign-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información general</h2>

                            <div>
                                <label for="cam-title" class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                                <input id="cam-title" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre de la campaña" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-title-error"></p>
                            </div>

                            <div>
                                <label for="cam-type" class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select id="cam-type" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar tipo...</option>
                                    ${CAMPAIGN_TYPES.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1).replace(/_/g, ' ')}</option>`).join("")}
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-type-error"></p>
                            </div>

                            <div>
                                <label for="cam-desc" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea id="cam-desc" rows="4"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                                    placeholder="Describe el objetivo y alcance de la campaña"></textarea>
                            </div>

                            <div>
                                <label for="cam-sponsor" class="block text-sm font-medium text-gray-700 mb-1">Patrocinador</label>
                                <input id="cam-sponsor" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Entidad o persona que patrocina" />
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Fechas</h2>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="cam-start" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
                                    <input id="cam-start" type="date" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="cam-start-error"></p>
                                </div>
                                <div>
                                    <label for="cam-end" class="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                                    <input id="cam-end" type="date"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Alcance y criterios</h2>

                            <div>
                                <label for="cam-target" class="block text-sm font-medium text-gray-700 mb-1">Población objetivo *</label>
                                <select id="cam-target" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    ${getTargetPopulationOptions().map(t => `<option value="${t.value}">${t.label}</option>`).join("")}
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-target-error"></p>
                            </div>

                            <div>
                                <label for="cam-scope" class="block text-sm font-medium text-gray-700 mb-1">Alcance *</label>
                                <select id="cam-scope" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    ${SCOPE_TYPES.map(s => `<option value="${s.value}">${s.label}</option>`).join("")}
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-scope-error"></p>
                            </div>

                            <div>
                                <label class="flex items-center gap-2">
                                    <input id="cam-pinned" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span class="text-sm text-gray-700">Fijar campaña (mostrar al inicio)</span>
                                </label>
                            </div>

                            <div>
                                <label for="cam-url" class="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
                                <input id="cam-url" type="url"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="https://ejemplo.com/imagen.jpg" />
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/campanas" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="cam-submit">
                                ${isEdit ? "Guardar cambios" : "Crear campaña"}
                            </button>
                        </div>
                    </form>
                </div>
            `;

            if (isEdit) {
                (async () => {
                    try {
                        const campaign = await CampaignService.getCampaign(id);
                        content.querySelector("#cam-title").value = campaign.title || "";
                        content.querySelector("#cam-type").value = campaign.type || "";
                        content.querySelector("#cam-desc").value = campaign.description || "";
                        content.querySelector("#cam-sponsor").value = campaign.sponsor || "";
                        content.querySelector("#cam-start").value = campaign.start_date || "";
                        content.querySelector("#cam-end").value = campaign.end_date || "";
                        content.querySelector("#cam-url").value = campaign.url_multimedia || "";
                        content.querySelector("#cam-pinned").checked = campaign.pinned === true;
                        content.querySelector("#cam-target").value = campaign.target_population || "all";
                        if (campaign.scope && campaign.scope[0]) {
                            content.querySelector("#cam-scope").value = campaign.scope[0].scope_type || "GLOBAL";
                        }
                    } catch (err) {
                        Toast.error("Error al cargar la campaña: " + err.message);
                    }
                })();
            }

            const form = content.querySelector("#campaign-form");
            const submitBtn = content.querySelector("#cam-submit");

            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const titleVal = content.querySelector("#cam-title").value.trim();
                const typeVal = content.querySelector("#cam-type").value;
                const startVal = content.querySelector("#cam-start").value;

                let valid = true;
                const showError = (id, msg) => {
                    const el = content.querySelector(id);
                    if (el) {
                        el.classList.remove("hidden");
                        el.textContent = msg;
                    }
                    valid = false;
                };
                const hideError = (id) => {
                    const el = content.querySelector(id);
                    if (el) el.classList.add("hidden");
                };

                hideError("#cam-title-error");
                hideError("#cam-type-error");
                hideError("#cam-start-error");
                hideError("#cam-scope-error");
                hideError("#cam-target-error");

                if (!titleVal) showError("#cam-title-error", "El título es obligatorio");
                if (!typeVal) showError("#cam-type-error", "Selecciona un tipo");
                if (!startVal) showError("#cam-start-error", "La fecha de inicio es obligatoria");
                if (!content.querySelector("#cam-scope").value) showError("#cam-scope-error", "Selecciona un alcance");
                if (!content.querySelector("#cam-target").value) showError("#cam-target-error", "Selecciona la población objetivo");

                if (!valid) return;

                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner"></span> Guardando...`;

                const data = {
                    title: titleVal,
                    type: typeVal,
                    description: content.querySelector("#cam-desc").value.trim(),
                    sponsor: content.querySelector("#cam-sponsor").value.trim(),
                    start_date: startVal,
                    end_date: content.querySelector("#cam-end").value || null,
                    url_multimedia: content.querySelector("#cam-url").value.trim() || null,
                    pinned: content.querySelector("#cam-pinned").checked,
                    target_population: content.querySelector("#cam-target").value,
                };

                try {
                    if (isEdit) {
                        await CampaignService.updateCampaign(id, data);
                        Toast.success("Campaña actualizada exitosamente");
                        Router.navigate("/campanas");
                    } else {
                        await CampaignService.createCampaign(data);
                        Toast.success("Campaña creada exitosamente");
                        Router.navigate("/campanas");
                    }
                } catch (err) {
                    Toast.error(err.message);
                    submitBtn.disabled = false;
                    submitBtn.textContent = isEdit ? "Guardar cambios" : "Crear campaña";
                }
            });

            return content;
        });
    }
};

export default CampanaForm;
