import Auth from "../modules/auth";

const Sidebar = {
    render() {
        const user = Auth.getUser();
        const aside = document.createElement("aside");

        const links = this._getLinks(user?.rol);

        aside.innerHTML = `
            <aside class="w-64 h-screen bg-slate-900 text-white flex flex-col" aria-label="Barra lateral de navegación">
                <div class="p-6 border-b border-slate-700">
                    <a data-link href="/${user?.rol === "SUPERADMIN" ? "dashboard-superadmin" : user?.rol === "ESTUDIANTE" ? "dashboard-estudiante" : "dashboard"}" class="block">
                        <div class="flex items-center gap-3 mb-1">
                            <img src="/src/assets/logo.jpeg" alt="NexoEdu" class="w-9 h-9 rounded-lg object-cover" />
                            <h1 class="text-2xl font-bold tracking-tight">NexoEdu</h1>
                        </div>
                        <p class="text-slate-400 text-xs mt-1 ml-12">Panel de Control</p>
                    </a>
                </div>
                <nav class="flex-1 p-3 overflow-y-auto" aria-label="Navegación principal">
                    <ul class="space-y-1">
                        ${links.map(link => `
                            <li>
                                <a data-link href="${link.href}" 
                                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors sidebar-link
                                   ${this._isActive(link.href) ? 'sidebar-active' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}"
                                   ${this._isActive(link.href) ? 'aria-current="page"' : ''}>
                                    ${link.icon}
                                    <span>${link.label}</span>
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                </nav>
                <div class="p-4 border-t border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style="background:var(--rol-primary, #1D4ED8)">
                            ${user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div class="flex-grow min-w-0">
                            <p class="text-sm font-medium truncate">${user?.username || "Usuario"}</p>
                            <p class="text-xs text-slate-400">${this._roleLabel(user?.rol)}</p>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        return aside;
    },

    _isActive(href) {
        const path = window.location.pathname;
        if (href === "/dashboard" || href === "/dashboard-superadmin" || href === "/dashboard-estudiante") {
            return path === href;
        }
        return path.startsWith(href) && href !== "/dashboard";
    },

    _roleLabel(rol) {
        const labels = {
            SUPERADMIN: "Super Administrador",
            ADMINISTRADOR: "Administrador",
            ESTUDIANTE: "Estudiante"
        };
        return labels[rol] || rol;
    },

    _getLinks(rol) {
        const icon = {
            dashboard: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
            campana: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>`,
            escuela: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,
            gente: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
            perfil: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
            config: `<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
        };

        if (rol === "SUPERADMIN") {
            return [
                { href: "/dashboard-superadmin", label: "Dashboard", icon: icon.dashboard },
                { href: "/instituciones", label: "Instituciones", icon: icon.escuela },
                { href: "/campanas", label: "Campañas", icon: icon.campana },
                { href: "/estudiantes", label: "Estudiantes", icon: icon.gente },
                { href: "/instituciones/crear-admin", label: "Crear Admin", icon: icon.perfil },
                { href: "/perfil", label: "Mi Perfil", icon: icon.perfil },
                { href: "/configuracion", label: "Configuración", icon: icon.config }
            ];
        }
        if (rol === "ADMINISTRADOR") {
            return [
                { href: "/dashboard", label: "Dashboard", icon: icon.dashboard },
                { href: "/institucion", label: "Mi Institución", icon: icon.escuela },
                { href: "/campanas", label: "Campañas", icon: icon.campana },
                { href: "/estudiantes", label: "Estudiantes", icon: icon.gente },
                { href: "/perfil", label: "Mi Perfil", icon: icon.perfil },
                { href: "/configuracion", label: "Configuración", icon: icon.config }
            ];
        }
        return [
            { href: "/dashboard-estudiante", label: "Dashboard", icon: icon.dashboard },
            { href: "/mis-campanas", label: "Mis Campañas", icon: icon.campana },
            { href: "/perfil", label: "Mi Perfil", icon: icon.perfil },
            { href: "/configuracion", label: "Configuración", icon: icon.config }
        ];
    }
};

export default Sidebar;
