/** Barra de navegacion superior con breadcrumbs, toggle sidebar y cierre de sesion. */
import Auth from "../modules/auth";
import Router from "../modules/router";
import ConfirmDialog from "../components/ConfirmDialog";

const Navbar = {
    render() {
        const user = Auth.getUser();
        const nav = document.createElement("nav");
        nav.className = "bg-white shadow-sm sticky top-0 z-30";

        const path = window.location.pathname;
        const breadcrumbs = this._getBreadcrumbs(path);

        const isLast = (i) => i === breadcrumbs.length - 1;

        nav.innerHTML = `
            <div class="px-4 md:px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-2 md:gap-4">
                    <button id="sidebar-toggle" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Abrir menú de navegación">
                        <svg class="w-6 h-6 text-gray-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    <div class="truncate max-w-[60vw] sm:max-w-none">
                        <nav class="flex items-center gap-1 text-sm text-gray-500" aria-label="Ruta de navegación">
                            ${breadcrumbs.map((crumb, i) => `
                                ${i > 0 ? `<svg class="w-4 h-4 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>` : ''}
                                ${crumb.href 
                                    ? `<a data-link href="${crumb.href}" class="hover:text-gray-700 transition-colors" ${isLast(i) ? 'aria-current="page"' : ''}>${crumb.label}</a>` 
                                    : `<span class="text-gray-800 font-medium" aria-current="page">${crumb.label}</span>`
                                }
                            `).join("")}
                        </nav>
                    </div>
                </div>
                <div class="flex items-center gap-2 md:gap-4">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style="background:var(--rol-primary, #1D4ED8)">
                        ${user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                    </div>
                    <button id="logout-btn" class="btn-secondary text-sm cursor-pointer">
                        Salir
                    </button>
                </div>
            </div>
        `;

        nav.querySelector("#logout-btn").addEventListener("click", (e) => {
            e.preventDefault();
            ConfirmDialog.show({
                title: "Cerrar Sesión",
                message: "¿Estás seguro que quieres cerrar sesión?",
                confirmText: "Salir",
                onConfirm: () => {
                    Auth.logout();
                    Router.navigate("/");
                }
            });
        });

        return nav;
    },

    _getBreadcrumbs(path) {
        const user = Auth.getUser();
        let dashboardPath = "/dashboard";
        if (user?.rol === "SUPERADMIN") dashboardPath = "/dashboard-superadmin";
        else if (user?.rol === "ESTUDIANTE") dashboardPath = "/dashboard-estudiante";

        const crumbs = [{ label: "NexoEdu", href: dashboardPath }];

        const segments = path.split("/").filter(Boolean);
        let builtPath = "";

        const routeLabels = {
            "dashboard-superadmin": "Dashboard",
            "dashboard": "Dashboard",
            "dashboard-estudiante": "Dashboard",
            "institucion": "Institución",
            "campanas": "Campañas",
            "estudiantes": "Estudiantes",
            "mis-campanas": "Mis Campañas",
            "perfil": "Mi Perfil",
            "configuracion": "Configuración"
        };

        segments.forEach((seg, i) => {
            builtPath += `/${seg}`;
            const label = routeLabels[seg] || seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

            if (i === segments.length - 1) {
                crumbs.push({ label, href: null });
            } else {
                crumbs.push({ label, href: builtPath });
            }
        });

        return crumbs;
    }
};

export default Navbar;
