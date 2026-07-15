/**
 * Componente StudentList
 * 
 * Lista de estudiantes agrupados por grado.
 * Incluye avatar, nombre, información básica y acciones.
 */

const StudentList = {
    /**
     * Renderiza el componente StudentList
     * @param {Object} options - Opciones de configuración
     * @param {Array} options.students - Lista de estudiantes
     * @param {Function} options.onStudentClick - Callback al hacer clic en un estudiante
     * @returns {HTMLElement} Elemento DOM de la lista
     */
    render(options = {}) {
        const {
            students = [],
            onStudentClick = () => {}
        } = options;

        const container = document.createElement('div');
        container.className = 'space-y-6';

        if (students.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 card">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="mt-4 text-gray-500">No se encontraron estudiantes</p>
                </div>
            `;
            return container;
        }

        // Agrupar por grado
        const grouped = students.reduce((acc, student) => {
            const grade = student.grade || 'Sin grado';
            if (!acc[grade]) acc[grade] = [];
            acc[grade].push(student);
            return acc;
        }, {});

        // Ordenar grados
        const sortedGrades = Object.keys(grouped).sort((a, b) => {
            const gradeA = parseInt(a) || 0;
            const gradeB = parseInt(b) || 0;
            return gradeB - gradeA;
        });

        sortedGrades.forEach(grade => {
            const gradeStudents = grouped[grade];
            
            const gradeSection = document.createElement('div');
            gradeSection.className = 'card overflow-hidden';

            gradeSection.innerHTML = `
                <div class="bg-gray-50 px-4 py-3 border-b">
                    <h3 class="text-lg font-semibold text-gray-800">
                        Grado ${grade}
                        <span class="ml-2 text-sm font-normal text-gray-500">
                            (${gradeStudents.length} estudiante${gradeStudents.length !== 1 ? 's' : ''})
                        </span>
                    </h3>
                </div>
                
                <div class="divide-y divide-gray-100">
                    ${gradeStudents.map(student => this._renderStudentItem(student)).join('')}
                </div>
            `;

            container.appendChild(gradeSection);
        });

        // Agregar eventos de clic
        setTimeout(() => {
            const items = container.querySelectorAll('[data-student-id]');
            items.forEach(item => {
                const fireClick = () => {
                    const studentId = parseInt(item.dataset.studentId);
                    const student = students.find(s => s.id === studentId);
                    if (student) onStudentClick(student);
                };
                item.addEventListener('click', fireClick);
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        fireClick();
                    }
                });
            });
        }, 0);

        return container;
    },

    /**
     * Renderiza un elemento de estudiante individual
     * @param {Object} student - Datos del estudiante
     * @returns {string} HTML del elemento
     * @private
     */
    _renderStudentItem(student) {
        const person = student.person || {};
        const initials = person.first_name && person.last_name
            ? `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`
            : '?';

        // Avatar color basado en el ID del estudiante (neutral, consistente)
        const avatarPalette = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500'];
        const avatarColor = avatarPalette[(student.id || 0) % avatarPalette.length];

        return `
            <div 
                class="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                data-student-id="${student.id}"
                tabindex="0"
                role="button"
                aria-label="${person.first_name || ''} ${person.last_name || ''}, ${student.grade || 'sin grado'}"
            >
                <!-- Avatar -->
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg">
                        ${initials}
                    </div>
                </div>
                
                <!-- Información -->
                <div class="ml-4 flex-grow">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-900">
                                ${person.first_name || ''} ${person.last_name || ''}
                            </p>
                            <p class="text-sm text-gray-500">
                                ${person.email || ''}
                            </p>
                        </div>
                        
                        <div class="text-right">
                            ${person.age ? `
                                <p class="text-sm text-gray-500">${person.age} años</p>
                            ` : ''}
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                student.status === 'Activo' ? 'bg-green-100 text-green-800' :
                                student.status === 'Graduado' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }">
                                ${student.status || 'Sin estado'}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Información adicional -->
                    <div class="mt-1 flex items-center gap-4 text-xs text-gray-400">
                        ${person.phone ? `
                            <span class="flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                ${person.phone}
                            </span>
                        ` : ''}
                        ${student.institution ? `
                            <span class="flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                                ${student.institution.name}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Flecha -->
                <div class="flex-shrink-0 ml-4">
                    <svg class="w-5 h-5 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        `;
    }
};

export default StudentList;
