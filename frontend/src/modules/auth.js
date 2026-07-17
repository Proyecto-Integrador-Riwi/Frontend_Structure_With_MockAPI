/** Modulo de autenticacion - estado de sesion, token, login/logout y notificacion de cambios. */
/**
 * Módulo de Autenticación
 * 
 * Maneja el estado de autenticación del usuario.
 * 
 * IMPORTANTE: Este módulo es PROVISIONAL y usa un sistema de tokens simulados.
 * Cuando el backend real esté listo:
 * 1. Asegúrate de que el backend retorne tokens JWT reales
 * 2. El frontend ya está configurado para enviar el token en el header Authorization
 * 3. Solo necesitarás cambiar API_URL de http://localhost:3001 a http://localhost:3000
 */

import * as AuthService from "../services/authService.js";

// ============================================================
// URL base de la API.
// En desarrollo: vacío (usa el proxy de Vite → localhost:3001)
// En producción con backend real: cambiar a "http://localhost:3000"
// ============================================================
export const API_URL = ""
// export const API_URL = "http://localhost:3000" // <--- BACKEND REAL

const Auth = {
    _currentUser: null,
    _token: null,
    _listeners: [],

    /**
     * Inicializar autenticación desde localStorage o sessionStorage
     */
    init() {
        this._currentUser = this._loadUserFromStorage();
        this._token = this._loadFromStorage("authToken");
    },

    _loadFromStorage(key) {
        return localStorage.getItem(key) || sessionStorage.getItem(key) || null;
    },

    _loadUserFromStorage() {
        const value = this._loadFromStorage("currentUser");
        if (!value) return null;

        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" ? parsed : null;
        } catch (error) {
            console.warn("No se pudo parsear el usuario guardado en storage", error);
            return null;
        }
    },

    _saveToStorage(key, value, remember) {
        if (remember) {
            localStorage.setItem(key, value);
        } else {
            sessionStorage.setItem(key, value);
        }
    },

    _removeFromStorage(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    },

    /**
     * Obtener usuario actual
     * @returns {Object|null} Usuario actual
     */
    getUser() {
        return this._currentUser;
    },

    /**
     * Obtener token de autenticación
     * @returns {string|null} Token JWT
     */
    getToken() {
        return this._token;
    },

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return this._currentUser != null && this._token != null;
    },

    /**
     * Para verificar permisos, usa utils/permissions.js
     * que es la fuente única de verdad para hasRole(), isAdmin(), etc.
     */

    /**
     * Iniciar sesión
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @param {boolean} remember - Persistir sesión entre pestañas
     * @returns {Promise<Object>} Datos del usuario
     */
    async Login(username, password, remember = true) {
        const res = await AuthService.login(username, password);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Credenciales incorrectas");
        }

        this._token = data.token;
        this._currentUser = {
            username: data.username,
            rol: data.rol,
            person_id: data.person_id,
            institution_id: data.institution_id,
            student_profile_id: data.student_profile_id
        };

        this._saveToStorage("currentUser", JSON.stringify(this._currentUser), remember);
        this._saveToStorage("authToken", this._token, remember);

        this._notify();
        return this._currentUser;
    },

    /**
     * Cerrar sesión
     */
    logout() {
        this._removeFromStorage("currentUser");
        this._removeFromStorage("authToken");
        this._currentUser = null;
        this._token = null;
        this._notify();
    },

    /**
     * Registrar callback para cambios de autenticación
     * @param {Function} callback - Función a ejecutar
     */
    onChange(callback) {
        this._listeners.push(callback);
    },

    /**
     * Notificar a los listeners sobre cambios
     * @private
     */
    _notify() {
        this._listeners.forEach(cb => cb(this._currentUser));
    }
};

export default Auth;
