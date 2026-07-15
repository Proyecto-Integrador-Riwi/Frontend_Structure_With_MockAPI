import Auth from "./auth";

const Router = {
    routes: [],
    currentPath: null,
    _loader: null,

    init(routesConfig) {
        this.routes = this._parseRoutes(routesConfig);

        window.addEventListener("popstate", () => this.resolve());

        document.addEventListener("click", (e) => {
            const link = e.target.closest("[data-link]");
            if (link) {
                e.preventDefault();
                this.navigate(link.getAttribute("href"));
            }
        });

        Auth.onChange(() => this.resolve());
        this.resolve();
    },

    _parseRoutes(routesConfig) {
        return Object.entries(routesConfig).map(([path, config]) => {
            const paramNames = [];
            const regexPath = path.replace(/:([^/]+)/g, (_, name) => {
                paramNames.push(name);
                return "([^/]+)";
            });
            return {
                path,
                regex: new RegExp(`^${regexPath}$`),
                paramNames,
                view: config.view,
                protected: config.protected || false,
                roles: config.roles || null,
                layout: config.layout || null
            };
        });
    },

    navigate(path) {
        window.history.pushState({}, "", path);
        this.resolve();
    },

    _matchRoute(pathname) {
        for (const route of this.routes) {
            const match = pathname.match(route.regex);
            if (match) {
                const params = {};
                route.paramNames.forEach((name, i) => {
                    params[name] = match[i + 1];
                });
                return { route, params };
            }
        }
        return null;
    },

    _showLoader() {
        if (!this._loader) {
            this._loader = document.createElement("div");
            this._loader.className = "route-loader";
            document.body.appendChild(this._loader);
        }
    },

    _hideLoader() {
        if (this._loader) {
            this._loader.remove();
            this._loader = null;
        }
    },

    async resolve() {
        const path = window.location.pathname;
        this.currentPath = path;

        const result = this._matchRoute(path);

        if (!result) {
            this.navigate("/");
            return;
        }

        const { route, params } = result;

        if (route.protected && !Auth.isAuthenticated()) {
            this.navigate("/");
            return;
        }

        if (path === "/" && Auth.isAuthenticated()) {
            const user = Auth.getUser();
            if (user.rol === "SUPERADMIN") {
                this.navigate("/dashboard-superadmin");
            } else if (user.rol === "ADMINISTRADOR") {
                this.navigate("/dashboard");
            } else if (user.rol === "ESTUDIANTE") {
                this.navigate("/dashboard-estudiante");
            } else {
                this.navigate("/dashboard");
            }
            return;
        }

        if (route.roles && !route.roles.includes(Auth.getUser()?.rol)) {
            const user = Auth.getUser();
            if (user?.rol === "SUPERADMIN") {
                this.navigate("/dashboard-superadmin");
            } else if (user?.rol === "ESTUDIANTE") {
                this.navigate("/dashboard-estudiante");
            } else {
                this.navigate("/dashboard");
            }
            return;
        }

        await this.render(route.view, params);
    },

    async render(view, params = {}) {
        const app = document.getElementById("app");
        if (!app) return;

        this._showLoader();

        const oldContent = app.firstElementChild;
        if (oldContent) {
            oldContent.classList.add("page-leave");
            await new Promise(r => setTimeout(r, 100));
        }

        app.innerHTML = "";

        let element;
        try {
            element = await view.render(params);
        } catch (err) {
            console.error("Error rendering view:", err);
            element = document.createElement("div");
            element.className = "flex flex-col items-center justify-center min-h-[60vh] px-6 text-center";
            element.innerHTML = `
                <svg class="w-20 h-20 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Algo salió mal</h2>
                <p class="text-gray-500 mb-6">No se pudo cargar esta página. Intenta de nuevo.</p>
                <button class="btn-primary" onclick="window.location.reload()">Recargar página</button>
            `;
        }

        app.appendChild(element);
        this._hideLoader();
    }
};

export default Router;
