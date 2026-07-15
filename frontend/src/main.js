import './style.css'
import Auth from './modules/auth'
import Login from './views/Login'
import Router from './modules/router';

import DashboardSuperAdmin from './views/DashboardSuperAdmin'
import DashboardAdmin from './views/DashboardAdmin'
import DashboardEstudiante from './views/DashboardEstudiante'
import Institucion from './views/Institucion'
import Campañas from './views/Campañas'
import CampañaDetalle from './views/CampañaDetalle'
import CampañaForm from './views/CampañaForm'
import Estudiantes from './views/Estudiantes'
import EstudianteDetalle from './views/EstudianteDetalle'
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

    "/institucion/:id": { view: Institucion, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/institucion": { view: Institucion, protected: true, roles: ["ADMINISTRADOR"] },

    "/campanas": { view: Campañas, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/crear": { view: CampañaForm, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/:id": { view: CampañaDetalle, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/campanas/:id/editar": { view: CampañaForm, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/estudiantes": { view: Estudiantes, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/estudiante/:id": { view: EstudianteDetalle, protected: true, roles: ["SUPERADMIN", "ADMINISTRADOR"] },
    "/mis-campanas": { view: MisCampañas, protected: true, roles: ["ESTUDIANTE"] },
    "/perfil": { view: Perfil, protected: true },
    "/configuracion": { view: Configuracion, protected: true },
};

Auth.init();
Router.init(routes);
