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

/**
 * Crear una nueva institución
 * @param {Object} data - Datos de la institución
 * @param {string} data.institution_name - Nombre oficial
 * @param {string} data.director - Nombre del director
 * @param {string} data.address - Dirección
 * @param {number} data.neighborhood_id - ID del barrio
 * @param {string} data.dane_code - Código DANE
 * @returns {Promise<Object>}
 */
export async function createInstitution(data) {
    const res = await http.post('api/institutions', data);
    return res.json();
}

/**
 * Actualizar una institución existente
 * @param {number} id - ID de la institución
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>}
 */
export async function updateInstitution(id, data) {
    const res = await http.put(`api/institutions/${id}`, data);
    return res.json();
}

/**
 * Eliminar una institución
 * @param {number} id - ID de la institución
 * @returns {Promise<Object>}
 */
export async function deleteInstitution(id) {
    const res = await http.delete('api/institutions', id);
    return res.json();
}
