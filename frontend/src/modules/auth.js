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
     * Inicializar autenticación desde localStorage
     */
    init() {
        const storedUser = localStorage.getItem("currentUser");
        const storedToken = localStorage.getItem("authToken");
        
        this._currentUser = storedUser ? JSON.parse(storedUser) : null;
        this._token = storedToken || null;
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
     * Verificar si el usuario es SuperAdmin
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this._currentUser?.rol === "SUPERADMIN";
    },

    /**
     * Verificar si el usuario es Administrador
     * @returns {boolean}
     */
    isAdmin() {
        return this._currentUser?.rol === "ADMINISTRADOR";
    },

    /**
     * Verificar si el usuario es Estudiante
     * @returns {boolean}
     */
    isEstudiante() {
        return this._currentUser?.rol === "ESTUDIANTE";
    },

    /**
     * Iniciar sesión
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Datos del usuario
     */
    async Login(username, password) {
        const res = await AuthService.login(username, password);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Credenciales incorrectas");
        }

        // Guardar token y usuario
        this._token = data.token;
        this._currentUser = {
            username: data.username,
            rol: data.rol,
            person_id: data.person_id,
            institution_id: data.institution_id,
            student_profile_id: data.student_profile_id
        };

        // Persistir en localStorage
        localStorage.setItem("currentUser", JSON.stringify(this._currentUser));
        localStorage.setItem("authToken", this._token);

        this._notify();
        return this._currentUser;
    },

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("authToken");
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
