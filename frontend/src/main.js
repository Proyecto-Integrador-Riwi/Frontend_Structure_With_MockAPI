import './style.css'
import Auth from './modules/auth'
import Login from './views/Login'
import Router from './modules/router';

import DashboardSuperAdmin from './views/DashboardSuperAdmin'
import DashboardAdmin from './views/DashboardAdmin'
import DashboardEstudiante from './views/DashboardEstudiante'
import Institucion from './views/Institucion'
import GestionInstituciones from './views/GestionInstituciones'
import InstitucionForm from './views/InstitucionForm'
import CrearAdmin from './views/CrearAdmin'
import Campañas from './views/Campañas'
import CampañaDetalle from './views/CampañaDetalle'
import CampañaForm from './views/CampañaForm'
import Estudiantes from './views/Estudiantes'
import EstudianteDetalle from './views/EstudianteDetalle'
import CrearEstudiante from './views/CrearEstudiante'
import MisCampañas from './views/MisCampañas'
import Perfil from './views/Perfil'
import Configuracion from './views/Configuracion'

const routes = {
    "/": { view: Login, protected: false },

    "/dashboard-superadmin": {
        view: DashboardSuperAdmin,
        protected: true,
        roles: ["SUPERADMIN"]
    },
    "/dashboard": {
        view: DashboardAdmin,
        protected: true,
        roles: ["ADMINISTRADOR"]
    },
    "/dashboard-estudiante": {
        view: DashboardEstudiante,
        protected: true,
        roles: ["ESTUDIANTE"]
    },

    // Gestión de instituciones (HU-02)
    "/instituciones": { view: GestionInstituciones, protected: true, roles: ["SUPERADMIN"] },
    "/instituciones/crear": { view: InstitucionForm, protected: true, roles: ["SUPERADMIN"] },
    "/instituciones/:id/editar": { view: InstitucionForm, protected: true, roles: ["SUPERADMIN"] },
    "/instituciones/crear-admin": { view: CrearAdmin, protected: true, roles: ["SUPERADMIN"] },

    // Vista de institución (detalle con estudiantes)
    "/institucion/:id": { view: Institucion, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/institucion": { view: Institucion, protected: true, roles: ["ADMINISTRADOR"] },

    // Campañas
    "/campanas": { view: Campañas, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/crear": { view: CampañaForm, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/:id": { view: CampañaDetalle, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/:id/editar": { view: CampañaForm, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },

    // Estudiantes (HU-04, HU-05, HU-06)
    "/estudiantes": { view: Estudiantes, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/estudiantes/crear": { view: CrearEstudiante, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/estudiante/:id": { view: EstudianteDetalle, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/estudiante/:id/editar": { view: EstudianteDetalle, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },

    // Estudiante (portal personal)
    "/mis-campanas": { view: MisCampañas, protected: true, roles: ["ESTUDIANTE"] },
    "/perfil": { view: Perfil, protected: true },
    "/configuracion": { view: Configuracion, protected: true },
};

Auth.init();
Router.init(routes);
