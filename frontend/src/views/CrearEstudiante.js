/** Registro de estudiante con credenciales de acceso (username/password). Solo ADMIN. */
import Auth from "../modules/auth";
import http from "../modules/http";
import Layout from "../components/Layout";
import Toast from "../components/Toast";
import Router from "../modules/router";
import { isAdmin } from "../utils/permissions";
import * as StudentService from "../services/studentService";
import * as InstitutionService from "../services/institutionService";

const CrearEstudiante = {
    render() {
        return Layout.render(() => {
            const content = document.createElement("div");
            content.className = "px-6 py-8 max-w-3xl mx-auto";
            const user = Auth.getUser();

            content.innerHTML = `
                <div class="content-fade-in">
                    <a data-link href="/estudiantes" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a estudiantes
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">Registrar Estudiante</h1>

                    <form id="student-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información personal</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-first_name" class="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                                    <input id="st-first_name" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Nombres del estudiante" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-first_name-error"></p>
                                </div>
                                <div>
                                    <label for="st-last_name" class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                                    <input id="st-last_name" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Apellidos del estudiante" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-last_name-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-doc-type" class="block text-sm font-medium text-gray-700 mb-1">Tipo de documento *</label>
                                    <select id="st-doc-type" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-doc-type-error"></p>
                                </div>
                                <div>
                                    <label for="st-doc-number" class="block text-sm font-medium text-gray-700 mb-1">Número de documento *</label>
                                    <input id="st-doc-number" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Número de documento" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-doc-number-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="st-gender" class="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                                    <select id="st-gender" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-gender-error"></p>
                                </div>
                                <div>
                                    <label for="st-birth_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento *</label>
                                    <input id="st-birth_date" type="date" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-birth_date-error"></p>
                                </div>
                                <div>
                                    <label for="st-neighborhood" class="block text-sm font-medium text-gray-700 mb-1">Barrio *</label>
                                    <select id="st-neighborhood" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-neighborhood-error"></p>
                                </div>
                            </div>

                            <div>
                                <label for="st-address" class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input id="st-address" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Dirección de residencia" />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input id="st-email" type="email" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Correo electrónico" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-email-error"></p>
                                </div>
                                <div>
                                    <label for="st-phone" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input id="st-phone" type="text"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Teléfono de contacto" />
                                </div>
                            </div>

                            <h3 class="text-md font-semibold text-gray-700 pt-2">Credenciales de acceso</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-username" class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                                    <input id="st-username" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Nombre de usuario para el ingreso" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-username-error"></p>
                                </div>
                                <div>
                                    <label for="st-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                    <input id="st-password" type="password" required minlength="6"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Mínimo 6 caracteres" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-password-error"></p>
                                </div>
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información académica</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-institution" class="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
                                    <select id="st-institution" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar institución...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-institution-error"></p>
                                </div>
                                <div>
                                    <label for="st-grade" class="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                                    <select id="st-grade" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar grado...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-grade-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-status" class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                                    <select id="st-status" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar estado...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-status-error"></p>
                                </div>
                                <div>
                                    <label for="st-start_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                                    <input id="st-start_date" type="date"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div id="st-message" class="hidden rounded-lg p-4 text-sm" role="alert"></div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/estudiantes" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="st-submit">Registrar estudiante</button>
                        </div>
                    </form>
                </div>
            `;

            // Loading indicator mientras cargan catálogos
            const formEl = content.querySelector("#student-form");
            const loadingOverlay = document.createElement("div");
            loadingOverlay.className = "flex items-center justify-center py-12";
            loadingOverlay.innerHTML = '<span class="spinner"></span><span class="ml-3 text-sm text-gray-500">Cargando datos del formulario...</span>';
            formEl.parentNode.insertBefore(loadingOverlay, formEl);
            formEl.style.display = "none";

            // Cargar catálogos
            (async () => {
                try {
                    const [docTypes, genders, neighborhoods, institutions, grades, statuses] = await Promise.all([
                        http.getJSON('api/document-types'),
                        http.getJSON('api/genders'),
                        http.getJSON('api/neighborhoods'),
                        InstitutionService.getInstitutions(),
                        http.getJSON('api/grades'),
                        http.getJSON('api/statuses')
                    ]);

                    loadingOverlay.remove();
                    formEl.style.display = "";

                    // Llenar selects
                    const fillSelect = (id, items, valueKey, labelKey) => {
                        const select = content.querySelector(id);
                        items.forEach(item => {
                            const opt = document.createElement("option");
                            opt.value = item[valueKey];
                            opt.textContent = item[labelKey];
                            select.appendChild(opt);
                        });
                    };

                    fillSelect("#st-doc-type", docTypes, 'id', 'name');
                    fillSelect("#st-gender", genders, 'id', 'name');
                    fillSelect("#st-neighborhood", neighborhoods, 'id', 'name');
                    fillSelect("#st-grade", grades, 'id', 'grade');
                    fillSelect("#st-status", statuses, 'id', 'status');

                    // Instituciones: restringir si es ADMINISTRADOR
                    const instSelect = content.querySelector("#st-institution");
                    if (user?.rol === 'ADMINISTRADOR' && user?.institution_id) {
                        const inst = institutions.find(i => i.id === user.institution_id);
                        if (inst) {
                            const opt = document.createElement("option");
                            opt.value = inst.id;
                            opt.textContent = inst.institution_name;
                            opt.selected = true;
                            instSelect.appendChild(opt);
                            instSelect.disabled = true;
                        }
                    } else {
                        institutions.forEach(inst => {
                            const opt = document.createElement("option");
                            opt.value = inst.id;
                            opt.textContent = inst.institution_name;
                            instSelect.appendChild(opt);
                        });
                    }

                    // Seleccionar estado "Activo" por defecto
                    const statusSelect = content.querySelector("#st-status");
                    const activeStatus = statuses.find(s => s.status?.toLowerCase() === 'activo');
                    if (activeStatus) statusSelect.value = activeStatus.id;

                    // Fecha de inicio por defecto: hoy
                    content.querySelector("#st-start_date").value = new Date().toISOString().split('T')[0];

                } catch (err) {
                    console.error("Error loading catalogs:", err);
                    loadingOverlay.remove();
                    formEl.style.display = "";
                    Toast.error("Error al cargar datos del formulario");
                }
            })();

            const form = content.querySelector("#student-form");
            form.addEventListener("submit", async (e) => {
                e.preventDefault();

                const fields = [
                    { id: "st-first_name", key: "first_name", label: "Nombres" },
                    { id: "st-last_name", key: "last_name", label: "Apellidos" },
                    { id: "st-doc-type", key: "document_type_id", label: "Tipo de documento" },
                    { id: "st-doc-number", key: "document_number", label: "Número de documento" },
                    { id: "st-gender", key: "gender_id", label: "Género" },
                    { id: "st-birth_date", key: "birth_date", label: "Fecha de nacimiento" },
                    { id: "st-neighborhood", key: "neighborhood_id", label: "Barrio" },
                    { id: "st-email", key: "email", label: "Email" },
                    { id: "st-phone", key: "phone", label: "Teléfono" },
                    { id: "st-address", key: "address", label: "Dirección" },
                    { id: "st-institution", key: "institution_id", label: "Institución" },
                    { id: "st-grade", key: "grade_id", label: "Grado" },
                    { id: "st-status", key: "status_id", label: "Estado" },
                    { id: "st-start_date", key: "start_date", label: "Fecha de inicio" },
                    { id: "st-username", key: "username", label: "Usuario" },
                    { id: "st-password", key: "password", label: "Contraseña" }
                ];

                let valid = true;
                const msg = content.querySelector("#st-message");
                msg.classList.add("hidden");

                fields.forEach(f => {
                    const inp = content.querySelector(`#${f.id}`);
                    const err = content.querySelector(`#${f.id}-error`);
                    if (err) {
                        err.classList.add("hidden");
                        err.textContent = "";
                    }
                    if (inp && inp.required && !inp.value) {
                        if (err) {
                            err.textContent = `${f.label} es obligatorio`;
                            err.classList.remove("hidden");
                        }
                        valid = false;
                    }
                });

                const pw = content.querySelector("#st-password");
                const pwErr = content.querySelector("#st-password-error");
                if (pw && pw.value && pw.value.length < 6) {
                    if (pwErr) {
                        pwErr.textContent = "La contraseña debe tener al menos 6 caracteres";
                        pwErr.classList.remove("hidden");
                    }
                    valid = false;
                }

                if (!valid) return;

                const submitBtn = content.querySelector("#st-submit");
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner"></span> Registrando...';

                const data = {};
                fields.forEach(f => {
                    data[f.key] = content.querySelector(`#${f.id}`).value;
                });

                try {
                    await StudentService.createStudent(data);
                    Toast.success("Estudiante registrado exitosamente");
                    Router.navigate("/estudiantes");
                } catch (err) {
                    msg.textContent = err.message;
                    msg.className = "rounded-lg p-4 text-sm bg-red-50 text-red-700";
                    msg.classList.remove("hidden");
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Registrar estudiante";
                }
            });

            return content;
        });
    }
};

export default CrearEstudiante;
