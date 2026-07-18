/** Pantalla de inicio de sesion con formulario de login y recuperacion de contrasena. */
import Auth from "../modules/auth";
import Router from "../modules/router";

const Login = {

    async render() {

        const container = document.createElement("div");

        container.className = "min-h-screen flex items-center justify-center bg-surface px-4";

        container.innerHTML = `
        <div class="flex mx-auto shadow-lg overflow-hidden rounded-xl bg-white w-full sm:justify-center">
            <div class="grid grid-cols-1 lg:grid-cols-2 min-h-175">

                <div class="relative hidden lg:block">
                    <img src="/src/assets/login.jpg" 
                    class="w-full h-full object-cover" 
                    alt="Estudiantes en aula"
                    role="presentation">
                    <div class="absolute bottom-0 inset-0 bg-slate-950/45 p-10 flex flex-col justify-center text-white">

                        <div class="absolute bottom-10 flex flex-col max-w-xl p-1">
                            <div class="flex w-3xs mb-5">
                                <span class="block h-1.5 flex-1 rounded-s-lg " style="background:#FF5963"></span>
                                <span class="block h-1.5 flex-1" style="background:#FED000"></span>
                                <span class="block h-1.5 flex-1 rounded-e-lg" style="background:#00875A"></span>
                            </div>

                        
                        <h2 class="text-3xl w-md md:text-4xl font-bold leading-tight">Transformando la educación en el Caribe.</h2>
                        <p class="mt-3 w-full text-base text-slate-200 font-normal">Accede a una red de conocimiento diseñada para potenciar el talento de nuestra región.</p>
                        </div>
                        
                    </div>
                </div>


                <div class="bg-white p-8 md:p-12 flex flex-col justify-center">

                    <div class="flex justify-center mb-6">
                        <img src="/src/assets/nexoLogo.svg" alt="NexoEdu" class="w-28 h-28  object-cover" />
                    </div>

                    <h1 class="font-semibold text-primary text-3xl md:text-4xl text-center">
                        Bienvenido a NexoEdu
                    </h1>

                    <p class="text-gray-500 text-lg py-2 text-center">
                        Inicia sesión para continuar con tu formación académica.
                    </p>


                    <form id="loginForm" class="mt-8 space-y-5">

                        <div>
                            <label class="block text-lg font-semibold text-gray-700 mb-1.5" for="username">
                                Usuario
                            </label>
                            <input 
                                type="text" 
                                id="username"
                                autocomplete="username"
                                class="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="Ingrese su usuario"
                                required
                                aria-describedby="username-error">
                            <p id="username-error" class="hidden text-error text-xs mt-1" role="alert"></p>
                        </div>


                        <div>
                            <label class="block text-lg font-semibold text-gray-700 mb-1.5" for="password">
                                Contraseña
                            </label>
                            <div class="relative">
                                <input 
                                    type="password"
                                    id="password"
                                    autocomplete="current-password"
                                    class="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10"
                                    placeholder="Ingrese su contraseña"
                                    required
                                    aria-describedby="password-error">
                                <button type="button" id="toggle-password"
                                    class="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                    aria-label="Mostrar contraseña"
                                    aria-pressed="false"
                                    tabindex="-1">
                                    <svg id="eye-icon-show" fill="none" stroke="currentColor" class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7"/>
                                    </svg>
                                    <svg id="eye-icon-hide" class="hidden w-5 h-5" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                                        <path d="M56.88 31.93a12 12 0 1 0-17.76 16.14l16 17.65C20.67 88.66 5.72 121.58 5 123.13a12.08 12.08 0 0 0 0 9.75c.37.82 9.13 20.26 28.49 39.61C59.37 198.34 92 212 128 212a131.3 131.3 0 0 0 51-10l20.09 22.1a12 12 0 0 0 17.76-16.14ZM128 188c-29.59 0-55.47-10.73-76.91-31.88A130.7 130.7 0 0 1 29.52 128c5.27-9.31 18.79-29.9 42-44.29l90.09 99.11A109.3 109.3 0 0 1 128 188m123-55.12c-.36.81-9 20-28 39.16a12 12 0 1 1-17-16.9A130.5 130.5 0 0 0 226.48 128a130.4 130.4 0 0 0-21.57-28.12C183.46 78.73 157.59 68 128 68c-3.35 0-6.7.14-10 .42a12 12 0 1 1-2-23.91c3.93-.34 8-.51 12-.51 36 0 68.63 13.67 94.49 39.52 19.35 19.35 28.11 38.8 28.48 39.61a12.08 12.08 0 0 1 .03 9.75"/>
                                    </svg>
                                </button>
                            </div>
                            <p id="password-error" class="hidden text-error text-xs mt-1" role="alert"></p>
                        </div>


                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input id="remember-me" type="checkbox" checked
                                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span class="text-base text-gray-600">Recordar mis datos</span>
                            </label>
                            <button type="button" id="forgot-password"
                                class="text-base text-blue-600 hover:text-blue-800 transition-colors cursor-pointer">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        <div id="error-message"
                        class="hidden bg-error-light text-error text-sm rounded-lg px-4 py-3 text-center">
                        </div>


                        <button 
                            id="login-btn"
                            type="submit"
                            class="btn-primary w-full py-2.5 text-lg cursor-pointer">
                            Iniciar Sesión
                        </button>

                        <div class="flex justify-center pt-2">
                            <img 
                            src="/src/assets/barranquilla_logo.png"
                            alt="Alcaldía de Barranquilla"
                            class="h-32 object-contain">
                        </div>

                        <p class="text-center text-gray-400 text-sm mt-6">
                            © 2026 NexoEdu. Distrito de Barranquilla.
                        </p>

                    </form>

                </div>

            </div>
        </div>
        `;


        this._bindEvents(container);

        return container;
    },


    _bindEvents(container) {

        const form = container.querySelector("#loginForm");
        const btn = container.querySelector("#login-btn");
        const errorMSG = container.querySelector("#error-message");
        const usernameInput = container.querySelector("#username");
        const passwordInput = container.querySelector("#password");
        const usernameError = container.querySelector("#username-error");
        const passwordError = container.querySelector("#password-error");
        const toggleBtn = container.querySelector("#toggle-password");
        const eyeIconShow = container.querySelector("#eye-icon-show");
        const eyeIconHide = container.querySelector("#eye-icon-hide");
        const rememberMe = container.querySelector("#remember-me");
        const forgotBtn = container.querySelector("#forgot-password");

        const showFieldError = (el, msg) => {
            el.textContent = msg;
            el.classList.remove("hidden");
            el.previousElementSibling.classList.add("border-red-500");
        };
        const clearFieldErrors = () => {
            [usernameError, passwordError].forEach(el => {
                el.textContent = "";
                el.classList.add("hidden");
                el.previousElementSibling.classList.remove("border-red-500");
            });
        };

        const setLoading = (loading) => {
            btn.disabled = loading;
            btn.innerHTML = loading
                ? '<span class="spinner"></span> Ingresando...'
                : 'Iniciar Sesión';
        };

        // Password visibility toggle
        const setPasswordVisibility = (showPassword) => {
            passwordInput.type = showPassword ? "text" : "password";
            toggleBtn.setAttribute("aria-label", showPassword ? "Ocultar contraseña" : "Mostrar contraseña");
            toggleBtn.setAttribute("aria-pressed", String(showPassword));
            eyeIconShow.classList.toggle("hidden", showPassword);
            eyeIconHide.classList.toggle("hidden", !showPassword);
        };

        toggleBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            setPasswordVisibility(isPassword);
        });

        setPasswordVisibility(false);

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            clearFieldErrors();
            errorMSG.classList.add("hidden");
            container.classList.remove("shake");

            let valid = true;
            if (!usernameInput.value.trim()) {
                showFieldError(usernameError, "El usuario es obligatorio");
                valid = false;
            }
            if (!passwordInput.value.trim()) {
                showFieldError(passwordError, "La contraseña es obligatoria");
                valid = false;
            }
            if (!valid) {
                container.classList.add("shake");
                return;
            }

            setLoading(true);

            try {
                const user = await Auth.Login(usernameInput.value, passwordInput.value, rememberMe.checked);
                if (user.rol === "SUPERADMIN") {
                    Router.navigate("/dashboard-superadmin");
                } else if (user.rol === "ESTUDIANTE") {
                    Router.navigate("/dashboard-estudiante");
                } else {
                    Router.navigate("/dashboard");
                }
            } catch (error) {
                errorMSG.textContent = error.message;
                errorMSG.classList.remove("hidden");
                container.classList.add("shake");
            } finally {
                setLoading(false)
            }
        });

        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener("input", () => {
                const errorEl = input.closest("div")?.querySelector('[id$="-error"]');
                if (errorEl) {
                    errorEl.textContent = "";
                    errorEl.classList.add("hidden");
                    input.classList.remove("border-red-500");
                }
            });
        });

        forgotBtn.addEventListener("click", () => {
            this._showForgotModal(container);
        });
    },

    _showForgotModal(container) {
        const existing = container.querySelector("#forgot-modal");
        if (existing) return;

        const backdrop = document.createElement("div");
        backdrop.className = "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4";
        backdrop.id = "forgot-modal";

        backdrop.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 content-fade-in" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="forgot-title" class="text-lg font-bold text-gray-800">Recuperar contraseña</h2>
                    <button type="button" id="forgot-close" class="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100" aria-label="Cerrar">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-5">Ingresa tu nombre de usuario y te enviaremos instrucciones para recuperar tu contraseña.</p>
                <div class="space-y-4">
                    <div>
                        <label for="forgot-username" class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <input id="forgot-username" type="text" required
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            placeholder="Tu nombre de usuario" />
                        <p id="forgot-error" class="hidden text-xs text-red-500 mt-1"></p>
                    </div>
                    <p id="forgot-success" class="hidden text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2"></p>
                    <button id="forgot-submit" type="button" class="btn-primary w-full py-2.5 text-sm">
                        Enviar instrucciones
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        const close = () => backdrop.remove();
        backdrop.querySelector("#forgot-close").addEventListener("click", close);
        backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });

        const usernameInput = backdrop.querySelector("#forgot-username");
        const errorEl = backdrop.querySelector("#forgot-error");
        const successEl = backdrop.querySelector("#forgot-success");
        const submitBtn = backdrop.querySelector("#forgot-submit");

        submitBtn.addEventListener("click", async () => {
            const username = usernameInput.value.trim();
            if (!username) {
                errorEl.textContent = "Ingresa tu nombre de usuario";
                errorEl.classList.remove("hidden");
                return;
            }
            errorEl.classList.add("hidden");
            successEl.classList.add("hidden");
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> Enviando...';

            try {
                const res = await fetch("/api/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Error al recuperar contraseña");
                successEl.textContent = data.message || "Se han enviado las instrucciones a tu correo electrónico.";
                successEl.classList.remove("hidden");
                submitBtn.textContent = "Cerrar";
                submitBtn.onclick = close;
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.classList.remove("hidden");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Enviar instrucciones';
            }
        });

        usernameInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitBtn.click();
            if (e.key === "Escape") close();
        });

        setTimeout(() => usernameInput.focus(), 100);
    }
};
export default Login;
