import Auth from "../modules/auth";
import Router from "../modules/router";

const Login = {

    async render() {

        const container = document.createElement("div");

        container.className = "min-h-screen flex items-center justify-center bg-surface px-4";

        container.innerHTML = `
        <div class="mx-auto max-w-6xl mt-8 rounded-2xl shadow-lg overflow-hidden bg-white w-full">
            <div class="grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">

                <div class="hidden lg:block">
                    <img src="/src/assets/login.jpg" 
                    class="w-full h-full object-cover" 
                    alt="Estudiantes en aula"
                    role="presentation">
                </div>


                <div class="bg-white p-8 md:p-12 flex flex-col justify-center">

                    <div class="flex justify-center mb-6">
                        <img src="/src/assets/logo.jpeg" alt="NexoEdu" class="w-20 h-20 rounded-2xl object-cover shadow-md" />
                    </div>

                    <h1 class="font-bold text-gray-800 text-3xl md:text-4xl text-center">
                        Bienvenido a NexoEdu
                    </h1>

                    <p class="text-gray-500 text-base py-2 text-center">
                        Inicia sesión para continuar con tu formación académica.
                    </p>


                    <form id="loginForm" class="mt-8 space-y-5">

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="username">
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
                            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="password">
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
                                    class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Mostrar contraseña"
                                    tabindex="-1">
                                    <svg class="w-5 h-5" id="eye-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                            </div>
                            <p id="password-error" class="hidden text-error text-xs mt-1" role="alert"></p>
                        </div>


                        <div id="error-message"
                        class="hidden bg-error-light text-error text-sm rounded-lg px-4 py-3 text-center">
                        </div>


                        <button 
                            id="login-btn"
                            type="submit"
                            class="btn-primary w-full py-2.5 text-base">
                            Iniciar Sesión
                        </button>

                        <div class="flex justify-center pt-2">
                            <img 
                            src="/src/assets/barranquilla_logo.png"
                            alt="Alcaldía de Barranquilla"
                            class="h-24 object-contain">
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


    _bindEvents(container){

        const form = container.querySelector("#loginForm");
        const btn = container.querySelector("#login-btn");
        const errorMSG = container.querySelector("#error-message");
        const usernameInput = container.querySelector("#username");
        const passwordInput = container.querySelector("#password");
        const usernameError = container.querySelector("#username-error");
        const passwordError = container.querySelector("#password-error");
        const toggleBtn = container.querySelector("#toggle-password");
        const eyeIcon = container.querySelector("#eye-icon");

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

        const setLoading = (loading)=>{
            btn.disabled = loading;
            btn.innerHTML = loading 
                ? '<span class="spinner"></span> Ingresando...' 
                : 'Iniciar Sesión';
        };

        // Password visibility toggle
        toggleBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleBtn.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
            eyeIcon.innerHTML = isPassword
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.243 4.243M9.878 9.878L3 3m3.456 14.322l2.422-2.422M9.878 9.878l4.243 4.243M9.878 9.878L3 3m6.456 14.322l2.422-2.422M3 3l18 18M3 3l6.456 14.322M21 12a9.97 9.97 0 01-3.437 6.364M15 12a3 3 0 00-3-3"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
        });

        form.addEventListener("submit", async(e)=>{
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
                const user = await Auth.Login(usernameInput.value, passwordInput.value);
                if (user.rol === "SUPERADMIN") {
                    Router.navigate("/dashboard-superadmin");
                } else if (user.rol === "ESTUDIANTE") {
                    Router.navigate("/dashboard-estudiante");
                } else {
                    Router.navigate("/dashboard");
                }
            }catch(error){
                errorMSG.textContent = error.message;
                errorMSG.classList.remove("hidden");
                container.classList.add("shake");
            }finally{
                setLoading(false)
            }
        });

        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener("input", () => {
                const errorEl = input.nextElementSibling;
                if (errorEl && errorEl.id?.includes("-error")) {
                    errorEl.textContent = "";
                    errorEl.classList.add("hidden");
                    input.classList.remove("border-red-500");
                }
            });
        });
    }
};
export default Login;
