/** Barra lateral de navegacion con enlaces segun el rol del usuario. */
import Auth from "../modules/auth";

const Sidebar = {
    render() {
        const user = Auth.getUser();
        const aside = document.createElement("aside");

        const links = this._getLinks(user?.rol);
        const activeHref = this._getActiveLink(links);

        aside.innerHTML = `
            <aside class="w-64 h-screen bg-[#F8F9FA] text-black flex flex-col border-r border-[#C3C6D0]"  aria-label="Barra lateral de navegación">
                <div class="flex flex-col justify-start py-2  mb-2">
                    <a class="flex flex-col justify-start items-start" data-link href="/${user?.rol === "SUPERADMIN" ? "dashboard-superadmin" : user?.rol === "ESTUDIANTE" ? "dashboard-estudiante" : "dashboard"}" class="block">
                        <div class="flex flex-col items-center gap-3 ">
                            <img src="/src/assets/nexos.svg" alt="NexoEdu" class="w-60 rounded-lg object-cover" />
                        </div>
                        <p class="text-slate-500 text-sm text-start">Panel de Control</p>
                    </a>
                </div>
                <nav class="flex-1 p-3 overflow-y-auto" aria-label="Navegación principal">
                    <ul class="space-y-1">
                        ${links.map(link => `
                            <li>
                                <a data-link href="${link.href}" 
                                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors sidebar-link w-full
                                   ${activeHref === link.href ? 'sidebar-active' : 'text-slate-800 hover:bg-slate-800 hover:text-white'}"
                                   ${activeHref === link.href ? 'aria-current="page"' : ''}>
                                    ${link.icon}
                                    <span>${link.label}</span>
                                </a>
                            </li>
                        `).join("")}
                    </ul>
                </nav>
                <div class="p-4 border-t border-[#C3C6D0]">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style="background:var(--color-primary, #142334)">
                            ${user?.username ? user.username.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div class="flex flex-col min-w-0">
                            <p class="text-sm font-medium truncate">${user?.username || "Usuario"}</p>
                            <p class="text-xs text-slate-400">${this._roleLabel(user?.rol)}</p>
                        </div>
                    </div>
                </div>
            </aside>
        `;

        return aside;
    },

    _getActiveLink(links) {
        const path = window.location.pathname;
        let active = null;

        for (const link of links) {
            if (link.href === "/dashboard" || link.href === "/dashboard-superadmin" || link.href === "/dashboard-estudiante") {
                if (path === link.href) {
                    return link.href;
                }
                continue;
            }

            if (path === link.href) {
                return link.href;
            }

            if (path.startsWith(link.href)) {
                if (!active || link.href.length > active.length) {
                    active = link.href;
                }
            }
        }

        return active;
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
            dashboard: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z" fill="currentColor"/>
</svg>`,
            campana: `<svg fill="none" stroke="currentColor" aria-hidden="true" class="w-5 h-5 shrink-0" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a4 4 0 0 1-1.564-.317"/></svg>`,
            escuela: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 22 18" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 18L4 14.2V8.2L0 6L11 0L22 6V14H20V7.1L18 8.2V14.2L11 18ZM11 9.7L17.85 6L11 2.3L4.15 6L11 9.7ZM11 15.725L16 13.025V9.25L11 12L6 9.25V13.025L11 15.725Z" fill="currentColor"/>
            </svg>`,
            gente: `<svg class="w-5 h-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
            perfil: `<svg class="w-5 h-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,
            config: `<svg class="w-5 h-5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
        };

        if (rol === "SUPERADMIN") {
            return [
                { href: "/dashboard-superadmin", label: "Dashboard", icon: icon.dashboard },
                { href: "/instituciones", label: "Instituciones", icon: icon.escuela },
                { href: "/campanas", label: "Campañas", icon: icon.campana },
                { href: "/instituciones/crear-admin", label: "Crear Admin", icon: icon.perfil },
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
