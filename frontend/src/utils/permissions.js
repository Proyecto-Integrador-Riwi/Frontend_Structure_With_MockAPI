/** Helpers de permisos - hasRole, isAdmin, canManageStudents/Institutions/Campaigns. */
import Auth from "../modules/auth";

export function hasRole(...roles) {
    const user = Auth.getUser();
    return user && roles.includes(user.rol);
}

export function isAdmin() {
    return hasRole("SUPERADMIN", "ADMINISTRADOR");
}

export function isSuperAdmin() {
    return hasRole("SUPERADMIN");
}


