import Auth from "../modules/auth";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const STORAGE_KEY = "nexoedu-sidebar";

const Layout = {
    render(contentFn) {
        const user = Auth.getUser();
        const container = document.createElement("div");
        container.className = "min-h-screen bg-surface";
        if (user?.rol) {
            container.dataset.role = user.rol;
        }

        const isMobile = window.innerWidth < 1024;
        const sidebarCollapsed = isMobile ? true : (localStorage.getItem(STORAGE_KEY) === "true");

        container.innerHTML = `
            <div id="layout-sidebar"
                class="fixed left-0 top-0 z-50 w-64 h-screen transition-transform duration-300
                       ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}">
            </div>
            <div id="sidebar-backdrop"
                class="fixed inset-0 z-40 bg-black/50 opacity-0 pointer-events-none transition-opacity duration-300">
            </div>
            <div class="flex-1 flex flex-col min-h-screen layout-main
                        transition-[margin] duration-300
                        ${sidebarCollapsed ? 'ml-0' : 'ml-64'}
                        max-lg:ml-0">
                <div id="layout-navbar" role="banner"></div>
                <main id="layout-content" class="flex-1 page-enter"></main>
            </div>
        `;

        requestAnimationFrame(() => {
            const sidebarEl = container.querySelector("#layout-sidebar");
            const backdrop = container.querySelector("#sidebar-backdrop");
            const mainEl = container.querySelector(".layout-main");
            sidebarEl.appendChild(Sidebar.render());

            const navEl = Navbar.render();
            container.querySelector("#layout-navbar").appendChild(navEl);

            const toggleBtn = navEl.querySelector("#sidebar-toggle");
            if (toggleBtn) {
                const toggle = () => {
                    const isMobile = window.innerWidth < 1024;
                    if (isMobile) {
                        sidebarEl.classList.toggle("translate-x-0");
                        sidebarEl.classList.toggle("-translate-x-full");
                        backdrop.classList.toggle("opacity-0");
                        backdrop.classList.toggle("pointer-events-none");
                        backdrop.classList.toggle("opacity-100");
                        backdrop.classList.toggle("pointer-events-auto");
                    } else {
                        sidebarEl.classList.toggle("-translate-x-full");
                        sidebarEl.classList.toggle("translate-x-0");
                        mainEl.classList.toggle("ml-64");
                        mainEl.classList.toggle("ml-0");
                        const collapsed = sidebarEl.classList.contains("-translate-x-full");
                        localStorage.setItem(STORAGE_KEY, collapsed);
                    }
                    const isOpen = sidebarEl.classList.contains("translate-x-0");
                    toggleBtn.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
                };
                toggleBtn.addEventListener("click", toggle);
                backdrop.addEventListener("click", toggle);
            }

            const contentEl = container.querySelector("#layout-content");
            if (typeof contentFn === "function") {
                const result = contentFn();
                if (result instanceof HTMLElement) {
                    contentEl.appendChild(result);
                }
            } else if (contentFn instanceof HTMLElement) {
                contentEl.appendChild(contentFn);
            }
        });

        return container;
    }
};

export default Layout;