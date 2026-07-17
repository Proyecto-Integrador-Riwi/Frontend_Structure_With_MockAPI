/** Servicio de campanas - CRUD, inscripcion, progreso y listados disponibles. */
/**
 * Servicio de Campañas
 * 
 * IMPORTANTE: Este servicio es PROVISIONAL y apunta al backend mock.
 * Cuando el backend real esté listo, cambiar la URL base y
 * ajustar las respuestas según la estructura del backend real.
 */

import http from '../modules/http.js';

/**
 * Obtener todas las campañas
 * @param {Object} filters - Filtros opcionales
 * @param {boolean} filters.active - Solo campañas activas
 * @param {number} filters.institution_id - Filtrar por institución
 * @param {string} filters.scope_type - Filtrar por tipo de alcance
 * @returns {Promise<Array>} Lista de campañas
 */
export async function getCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.active) params.append('active', 'true');
    if (filters.institution_id) params.append('institution_id', filters.institution_id);
    if (filters.scope_type) params.append('scope_type', filters.scope_type);
    if (filters.person_id) params.append('person_id', filters.person_id);
    
    const queryString = params.toString();
    const endpoint = queryString ? `api/campaigns?${queryString}` : 'api/campaigns';
    
    const res = await http.get(endpoint);
    return res.json();
}

/**
 * Obtener campañas activas (vigentes)
 * @returns {Promise<Array>} Campañas activas
 */
export async function getActiveCampaigns() {
    const res = await http.get('api/campaigns/active');
    return res.json();
}

/**
 * Obtener campañas disponibles para una persona
 * @param {number} personId - ID de la persona
 * @returns {Promise<Array>} Campañas disponibles
 */
export async function getAvailableCampaigns(personId) {
    const res = await http.get(`api/campaigns/available/${personId}`);
    return res.json();
}

/**
 * Inscribirse en una campaña
 * @param {number} campaignId - ID de la campaña
 * @returns {Promise<Object>} Resultado de la inscripción
 */
export async function enrollInCampaign(campaignId) {
    const res = await http.post(`api/campaigns/${campaignId}/enroll`, {});
    return res.json();
}

/**
 * Obtener una campaña por ID (con alcance, criterios y estudiantes inscritos)
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getCampaign(id) {
    const res = await http.get(`api/campaigns/${id}`);
    return res.json();
}

/**
 * Crear una nueva campaña
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function createCampaign(data) {
    const res = await http.post('api/campaigns', data);
    return res.json();
}

/**
 * Actualizar una campaña existente
 * @param {number} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateCampaign(id, data) {
    const res = await http.put(`api/campaigns/${id}`, data);
    return res.json();
}

/**
 * Eliminar una campaña
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function deleteCampaign(id) {
    const res = await http.delete('api/campaigns', id);
    return res.json();
}
