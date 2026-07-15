/**
 * Aplicar filtros a una lista de estudiantes
 * @param {Array} students - Lista de estudiantes
 * @param {Object} filters - Filtros a aplicar (grade_id, gender_id, status_id, min_age, max_age)
 * @param {Array} grades - Catálogo de grados [{id, grade}]
 * @param {Array} genders - Catálogo de géneros [{id, name}]
 * @param {Array} statuses - Catálogo de estados [{id, status}]
 * @returns {Array} Estudiantes filtrados
 */
export function applyStudentFilters(students, filters) {
    let filtered = [...students];
    if (filters.grade_id) {
        filtered = filtered.filter(s => s.grade_id == filters.grade_id);
    }
    if (filters.gender_id) {
        filtered = filtered.filter(s => s.person?.gender_id == filters.gender_id);
    }
    if (filters.status_id) {
        filtered = filtered.filter(s => s.status_id == filters.status_id);
    }
    if (filters.min_age) {
        filtered = filtered.filter(s => s.person?.age >= parseInt(filters.min_age));
    }
    if (filters.max_age) {
        filtered = filtered.filter(s => s.person?.age <= parseInt(filters.max_age));
    }
    return filtered;
}
