/**
 * Servicio de Instituciones
 * 
 * IMPORTANTE: Este servicio es PROVISIONAL y apunta al backend mock.
 * Cuando el backend real esté listo, cambiar la URL base y
 * ajustar las respuestas según la estructura del backend real.
 */

import http from '../modules/http.js';

/**
 * Obtener todas las instituciones
 * @returns {Promise<Array>} Lista de instituciones
 */
export async function getInstitutions() {
    const res = await http.get('api/institutions');
    return res.json();
}

/**
 * Obtener una institución por ID
 * @param {number} id - ID de la institución
 * @returns {Promise<Object>} Datos de la institución
 */
export async function getInstitutionById(id) {
    const res = await http.get(`api/institutions/${id}`);
    return res.json();
}

/**
 * Obtener estudiantes de una institución
 * @param {number} id - ID de la institución
 * @returns {Promise<Array>} Lista de estudiantes
 */
export async function getInstitutionStudents(id) {
    const res = await http.get(`api/institutions/${id}/students`);
    return res.json();
}
