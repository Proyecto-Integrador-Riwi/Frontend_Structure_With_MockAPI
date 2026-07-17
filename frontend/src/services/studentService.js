/** Servicio de estudiantes - CRUD, estadisticas y actualizacion de perfil. */
/**
 * Servicio de Estudiantes
 * 
 * IMPORTANTE: Este servicio es PROVISIONAL y apunta al backend mock.
 * Cuando el backend real esté listo, cambiar la URL base y
 * ajustar las respuestas según la estructura del backend real.
 */

import http from '../modules/http.js';

/**
 * Obtener lista de estudiantes
 * @param {Object} filters - Filtros opcionales
 * @param {number} filters.institution_id - Filtrar por institución
 * @param {number} filters.status_id - Filtrar por estado (1=Activo, 2=Graduado, 3=Retirado)
 * @param {number} filters.grade_id - Filtrar por grado
 * @param {number} filters.gender_id - Filtrar por género
 * @param {number} filters.min_age - Edad mínima
 * @param {number} filters.max_age - Edad máxima
 * @returns {Promise<Array>} Lista de estudiantes
 */
export async function getStudents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.institution_id) params.append('institution_id', filters.institution_id);
    if (filters.status_id) params.append('status_id', filters.status_id);
    if (filters.grade_id) params.append('grade_id', filters.grade_id);
    if (filters.gender_id) params.append('gender_id', filters.gender_id);
    if (filters.min_age) params.append('min_age', filters.min_age);
    if (filters.max_age) params.append('max_age', filters.max_age);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `api/students?${queryString}` : 'api/students';
    
    const res = await http.get(endpoint);
    return res.json();
}

/**
 * Crear un nuevo estudiante (persona + perfil académico)
 * @param {Object} data - Datos del estudiante
 * @returns {Promise<Object>}
 */
export async function createStudent(data) {
    const res = await http.post('api/people', data);
    return res.json();
}

/**
 * Actualizar estudiante por admin (editar datos de persona y perfil)
 * @param {number} studentProfileId - ID del perfil de estudiante
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export async function updateStudentByAdmin(studentProfileId, data) {
    const res = await http.put(`api/students/${studentProfileId}`, data);
    return res.json();
}

/**
 * Obtener un estudiante por ID
 * @param {number} id - ID de la persona
 * @returns {Promise<Object>} Datos del estudiante
 */
export async function getStudentById(id) {
    const res = await http.get(`api/people/${id}`);
    return res.json();
}

/**
 * Actualizar datos de un estudiante
 * @param {number} id - ID de la persona
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la actualización
 */
export async function updateStudent(id, data) {
    const res = await http.put(`api/people/${id}`, data);
    return res.json();
}

/**
 * Obtener estadísticas de estudiantes
 * @param {number} institutionId - ID de la institución (opcional)
 * @returns {Promise<Object>} Estadísticas
 */
export async function getDashboardStats(institutionId = null) {
    const endpoint = institutionId 
        ? `api/dashboard/stats/${institutionId}` 
        : 'api/dashboard/stats';
    
    const res = await http.get(endpoint);
    return res.json();
}
