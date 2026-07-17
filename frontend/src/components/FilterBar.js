/** Barra de filtros reutilizable para listados de estudiantes. */
/**
 * Componente FilterBar
 * 
 * Barra de filtros horizontal para listas de estudiantes.
 * Incluye selects para grado, género, estado, rango de edad y botón limpiar.
 */

const FilterBar = {
    /**
     * Renderiza el componente FilterBar
     * @param {Object} options - Opciones de configuración
     * @param {Function} options.onFilter - Callback cuando cambian los filtros
     * @param {Object} options.grades - Lista de grados disponibles
     * @param {Object} options.genders - Lista de géneros disponibles
     * @param {Object} options.statuses - Lista de estados disponibles
     * @returns {HTMLElement} Elemento DOM de la barra de filtros
     */
    render(options = {}) {
        const {
            onFilter = () => {},
            grades = [],
            genders = [],
            statuses = []
        } = options;

        const container = document.createElement('div');
        container.className = 'bg-white rounded-lg shadow-sm p-4 mb-6';

        container.innerHTML = `
            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                <!-- Grado -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Grado</label>
                    <select 
                        data-filter="grade" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${grades.map(g => `
                            <option value="${g.id}">${g.grade}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Género -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Género</label>
                    <select 
                        data-filter="gender" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${genders.map(g => `
                            <option value="${g.id}">${g.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Estado -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                        data-filter="status" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${statuses.map(s => `
                            <option value="${s.id}">${s.status}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Rango de edad -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Edad mínima</label>
                    <input 
                        type="number" 
                        data-filter="min-age" 
                        min="10" 
                        max="30"
                        placeholder="Mín"
                        class="w-20 max-sm:w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
                
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Edad máxima</label>
                    <input 
                        type="number" 
                        data-filter="max-age" 
                        min="10" 
                        max="30"
                        placeholder="Máx"
                        class="w-20 max-sm:w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
                
                <!-- Botones -->
                <div class="flex gap-2 max-sm:w-full max-sm:flex-col">
                    <button 
                            id="filter-apply"
                            class="btn-primary text-sm max-sm:w-full"
                    >
                        Filtrar
                    </button>
                    <button 
                            id="filter-clear"
                            class="btn-secondary text-sm max-sm:w-full"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
            
            <!-- Contador de resultados -->
            <div id="filter-count" class="mt-3 text-sm text-gray-500"></div>
        `;

        const applyBtn = container.querySelector('#filter-apply');
        const clearBtn = container.querySelector('#filter-clear');
        const gradeSelect = container.querySelector('[data-filter="grade"]');
        const genderSelect = container.querySelector('[data-filter="gender"]');
        const statusSelect = container.querySelector('[data-filter="status"]');
        const minAgeInput = container.querySelector('[data-filter="min-age"]');
        const maxAgeInput = container.querySelector('[data-filter="max-age"]');

        const getFilters = () => ({
            grade_id: gradeSelect.value || null,
            gender_id: genderSelect.value || null,
            status_id: statusSelect.value || null,
            min_age: minAgeInput.value || null,
            max_age: maxAgeInput.value || null
        });

        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                onFilter(getFilters());
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                gradeSelect.value = '';
                genderSelect.value = '';
                statusSelect.value = '';
                minAgeInput.value = '';
                maxAgeInput.value = '';
                onFilter({});
            });
        }

        [gradeSelect, genderSelect, statusSelect].forEach(select => {
            if (select) {
                select.addEventListener('change', () => {
                    onFilter(getFilters());
                });
            }
        });

        return container;
    },

    /**
     * Actualiza el contador de resultados
     * @param {HTMLElement} container - Elemento contenedor del FilterBar
     * @param {number} count - Número de resultados
     */
    updateCount(container, count) {
        const countEl = container.querySelector('#filter-count');
        if (!countEl) return;
        countEl.textContent = `${count} estudiante${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }
};

export default FilterBar;
