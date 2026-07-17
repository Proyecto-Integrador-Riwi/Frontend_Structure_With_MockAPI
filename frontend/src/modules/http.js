/** Cliente HTTP con timeout, manejo de errores y token Bearer automatico. */
/**
 * Módulo HTTP
 * 
 * Wrapper de fetch para realizar peticiones al backend.
 * 
 * IMPORTANTE: Este módulo es PROVISIONAL.
 * Cuando el backend real esté listo:
 * 1. Cambiar API_URL de http://localhost:3001 a http://localhost:3000
 * 2. El token ya se envía automáticamente en el header Authorization
 */

import Auth, { API_URL } from "./auth.js";

const TIMEOUT_MS = 30000;

const http = {
    /**
     * Realizar una petición HTTP
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} body - Cuerpo de la petición (opcional)
     * @returns {Promise<Response>} Respuesta de fetch
     */
    async request(method, endpoint, body = null) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const options = {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            signal: controller.signal
        };

        const token = Auth.getToken();
        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}/${endpoint}`, options);

            if (!response.ok) {
                let errorMsg = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }

            return response;
        } finally {
            clearTimeout(timeoutId);
        }
    },

    /**
     * Realizar petición GET
     * @param {string} endpoint - Endpoint de la API
     * @returns {Promise<Response>}
     */
    get(endpoint) {
        return this.request("GET", endpoint);
    },

    getJSON(endpoint) {
        return this.request("GET", endpoint).then(r => r.json());
    },

    /**
     * Realizar petición POST
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar
     * @returns {Promise<Response>}
     */
    post(endpoint, data) {
        return this.request("POST", endpoint, data);
    },

    /**
     * Realizar petición PUT
     * @param {string} endpoint - Endpoint de la API (incluye el ID, ej: "api/campaigns/5")
     * @param {Object} data - Datos a enviar
     * @returns {Promise<Response>}
     */
    put(endpoint, data) {
        return this.request("PUT", endpoint, data);
    },

    /**
     * Realizar petición PATCH
     * @param {string} endpoint - Endpoint de la API
     * @param {Object} data - Datos a enviar (opcional)
     * @returns {Promise<Response>}
     */
    patch(endpoint, data = null) {
        return this.request("PATCH", endpoint, data);
    },

    /**
     * Realizar petición DELETE
     * @param {string} endpoint - Endpoint de la API
     * @param {number|string} id - ID del recurso
     * @returns {Promise<Response>}
     */
    delete(endpoint, id) {
        return this.request("DELETE", `${endpoint}/${id}`);
    }
};

export default http;
