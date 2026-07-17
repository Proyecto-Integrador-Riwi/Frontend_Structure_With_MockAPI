(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=3e4,t={async request(t,n,i=null){let a=new AbortController,o=setTimeout(()=>a.abort(),e),s={method:t,headers:{"Content-Type":`application/json`},signal:a.signal},c=r.getToken();c&&(s.headers.Authorization=`Bearer ${c}`),i&&(s.body=JSON.stringify(i));try{let e=await fetch(`/${n}`,s);if(!e.ok){let t=`Error ${e.status}`;try{t=(await e.json()).error||t}catch{}throw Error(t)}return e}finally{clearTimeout(o)}},get(e){return this.request(`GET`,e)},getJSON(e){return this.request(`GET`,e).then(e=>e.json())},post(e,t){return this.request(`POST`,e,t)},put(e,t){return this.request(`PUT`,e,t)},patch(e,t=null){return this.request(`PATCH`,e,t)},delete(e,t){return this.request(`DELETE`,`${e}/${t}`)}};function n(e,n){return t.post(`api/auth/login`,{username:e,password:n})}var r={_currentUser:null,_token:null,_listeners:[],init(){this._currentUser=this._loadFromStorage(`currentUser`),this._token=this._loadFromStorage(`authToken`)},_loadFromStorage(e){return localStorage.getItem(e)||sessionStorage.getItem(e)||null},_saveToStorage(e,t,n){n?localStorage.setItem(e,t):sessionStorage.setItem(e,t)},_removeFromStorage(e){localStorage.removeItem(e),sessionStorage.removeItem(e)},getUser(){return this._currentUser},getToken(){return this._token},isAuthenticated(){return this._currentUser!=null&&this._token!=null},async Login(e,t,r=!0){let i=await n(e,t),a=await i.json();if(!i.ok)throw Error(a.error||`Credenciales incorrectas`);return this._token=a.token,this._currentUser={username:a.username,rol:a.rol,person_id:a.person_id,institution_id:a.institution_id,student_profile_id:a.student_profile_id},this._saveToStorage(`currentUser`,JSON.stringify(this._currentUser),r),this._saveToStorage(`authToken`,this._token,r),this._notify(),this._currentUser},logout(){this._removeFromStorage(`currentUser`),this._removeFromStorage(`authToken`),this._currentUser=null,this._token=null,this._notify()},onChange(e){this._listeners.push(e)},_notify(){this._listeners.forEach(e=>e(this._currentUser))}},i={routes:[],currentPath:null,_loader:null,init(e){this.routes=this._parseRoutes(e),window.addEventListener(`popstate`,()=>this.resolve()),document.addEventListener(`click`,e=>{let t=e.target.closest(`[data-link]`);t&&(e.preventDefault(),this.navigate(t.getAttribute(`href`)))}),r.onChange(()=>this.resolve()),this.resolve()},_parseRoutes(e){return Object.entries(e).map(([e,t])=>{let n=[],r=e.replace(/:([^/]+)/g,(e,t)=>(n.push(t),`([^/]+)`));return{path:e,regex:RegExp(`^${r}$`),paramNames:n,view:t.view,protected:t.protected||!1,roles:t.roles||null,layout:t.layout||null}})},navigate(e){window.history.pushState({},``,e),this.resolve()},_matchRoute(e){for(let t of this.routes){let n=e.match(t.regex);if(n){let e={};return t.paramNames.forEach((t,r)=>{e[t]=n[r+1]}),{route:t,params:e}}}return null},_showLoader(){this._loader||(this._loader=document.createElement(`div`),this._loader.className=`route-loader`,document.body.appendChild(this._loader))},_hideLoader(){this._loader&&=(this._loader.remove(),null)},async resolve(){let e=window.location.pathname;this.currentPath=e;let t=this._matchRoute(e);if(!t){this.navigate(`/`);return}let{route:n,params:i}=t;if(n.protected&&!r.isAuthenticated()){this.navigate(`/`);return}if(e===`/`&&r.isAuthenticated()){let e=r.getUser();e.rol===`SUPERADMIN`?this.navigate(`/dashboard-superadmin`):e.rol===`ADMINISTRADOR`?this.navigate(`/dashboard`):e.rol===`ESTUDIANTE`?this.navigate(`/dashboard-estudiante`):this.navigate(`/dashboard`);return}if(n.roles&&!n.roles.includes(r.getUser()?.rol)){let e=r.getUser();e?.rol===`SUPERADMIN`?this.navigate(`/dashboard-superadmin`):e?.rol===`ESTUDIANTE`?this.navigate(`/dashboard-estudiante`):this.navigate(`/dashboard`);return}await this.render(n.view,i)},async render(e,t={}){let n=document.getElementById(`app`);if(!n)return;this._showLoader();let r=n.firstElementChild;r&&(r.classList.add(`page-leave`),await new Promise(e=>setTimeout(e,100))),n.innerHTML=``;let i;try{i=await e.render(t)}catch(e){console.error(`Error rendering view:`,e),i=document.createElement(`div`),i.className=`flex flex-col items-center justify-center min-h-[60vh] px-6 text-center`,i.innerHTML=`
                <svg class="w-20 h-20 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <h2 class="text-xl font-semibold text-gray-800 mb-2">Algo salió mal</h2>
                <p class="text-gray-500 mb-6">No se pudo cargar esta página. Intenta de nuevo.</p>
                <button class="btn-primary" onclick="window.location.reload()">Recargar página</button>
            `}n.appendChild(i),this._hideLoader()}},a={async render(){let e=document.createElement(`div`);return e.className=`min-h-screen flex items-center justify-center bg-surface px-4`,e.innerHTML=`
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


                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input id="remember-me" type="checkbox" checked
                                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <span class="text-sm text-gray-600">Recordar mis datos</span>
                            </label>
                            <button type="button" id="forgot-password"
                                class="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </button>
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
        `,this._bindEvents(e),e},_bindEvents(e){let t=e.querySelector(`#loginForm`),n=e.querySelector(`#login-btn`),a=e.querySelector(`#error-message`),o=e.querySelector(`#username`),s=e.querySelector(`#password`),c=e.querySelector(`#username-error`),l=e.querySelector(`#password-error`),u=e.querySelector(`#toggle-password`),d=e.querySelector(`#eye-icon`),f=e.querySelector(`#remember-me`),p=e.querySelector(`#forgot-password`),m=(e,t)=>{e.textContent=t,e.classList.remove(`hidden`),e.previousElementSibling.classList.add(`border-red-500`)},h=()=>{[c,l].forEach(e=>{e.textContent=``,e.classList.add(`hidden`),e.previousElementSibling.classList.remove(`border-red-500`)})},g=e=>{n.disabled=e,n.innerHTML=e?`<span class="spinner"></span> Ingresando...`:`Iniciar Sesión`};u.addEventListener(`click`,()=>{let e=s.type===`password`;s.type=e?`text`:`password`,u.setAttribute(`aria-label`,e?`Ocultar contraseña`:`Mostrar contraseña`),d.innerHTML=e?`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.243 4.243M9.878 9.878L3 3m3.456 14.322l2.422-2.422M9.878 9.878l4.243 4.243M9.878 9.878L3 3m6.456 14.322l2.422-2.422M3 3l18 18M3 3l6.456 14.322M21 12a9.97 9.97 0 01-3.437 6.364M15 12a3 3 0 00-3-3"/>`:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`}),t.addEventListener(`submit`,async t=>{t.preventDefault(),h(),a.classList.add(`hidden`),e.classList.remove(`shake`);let n=!0;if(o.value.trim()||(m(c,`El usuario es obligatorio`),n=!1),s.value.trim()||(m(l,`La contraseña es obligatoria`),n=!1),!n){e.classList.add(`shake`);return}g(!0);try{let e=await r.Login(o.value,s.value,f.checked);e.rol===`SUPERADMIN`?i.navigate(`/dashboard-superadmin`):e.rol===`ESTUDIANTE`?i.navigate(`/dashboard-estudiante`):i.navigate(`/dashboard`)}catch(t){a.textContent=t.message,a.classList.remove(`hidden`),e.classList.add(`shake`)}finally{g(!1)}}),[o,s].forEach(e=>{e.addEventListener(`input`,()=>{let t=e.closest(`div`)?.querySelector(`[id$="-error"]`);t&&(t.textContent=``,t.classList.add(`hidden`),e.classList.remove(`border-red-500`))})}),p.addEventListener(`click`,()=>{this._showForgotModal(e)})},_showForgotModal(e){if(e.querySelector(`#forgot-modal`))return;let t=document.createElement(`div`);t.className=`fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4`,t.id=`forgot-modal`,t.innerHTML=`
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
        `,document.body.appendChild(t);let n=()=>t.remove();t.querySelector(`#forgot-close`).addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()});let r=t.querySelector(`#forgot-username`),i=t.querySelector(`#forgot-error`),a=t.querySelector(`#forgot-success`),o=t.querySelector(`#forgot-submit`);o.addEventListener(`click`,async()=>{let e=r.value.trim();if(!e){i.textContent=`Ingresa tu nombre de usuario`,i.classList.remove(`hidden`);return}i.classList.add(`hidden`),a.classList.add(`hidden`),o.disabled=!0,o.innerHTML=`<span class="spinner"></span> Enviando...`;try{let t=await fetch(`/api/auth/forgot-password`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({username:e})}),r=await t.json();if(!t.ok)throw Error(r.error||`Error al recuperar contraseña`);a.textContent=r.message||`Se han enviado las instrucciones a tu correo electrónico.`,a.classList.remove(`hidden`),o.textContent=`Cerrar`,o.onclick=n}catch(e){i.textContent=e.message,i.classList.remove(`hidden`),o.disabled=!1,o.innerHTML=`Enviar instrucciones`}}),r.addEventListener(`keydown`,e=>{e.key===`Enter`&&o.click(),e.key===`Escape`&&n()}),setTimeout(()=>r.focus(),100)}},o={_lastFocused:null,show({title:e=`Confirmar`,message:t=`¿Estás seguro?`,confirmText:n=`Aceptar`,cancelText:r=`Cancelar`,onConfirm:i,onCancel:a,destructive:o=!1}={}){let s=document.querySelector(`#confirm-overlay`);s&&s.remove(),this._lastFocused=document.activeElement;let c=document.createElement(`div`);c.id=`confirm-overlay`,c.className=`fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4`,c.style.animation=`fadeIn 0.2s ease-out`,c.setAttribute(`role`,`dialog`),c.setAttribute(`aria-modal`,`true`),c.setAttribute(`aria-labelledby`,`confirm-title`),c.setAttribute(`aria-describedby`,`confirm-message`),c.innerHTML=`
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 mx-4 sm:mx-auto" style="animation: fadeInUp 0.25s ease-out">
                <h3 id="confirm-title" class="text-lg font-bold text-gray-800 mb-2">${e}</h3>
                <p id="confirm-message" class="text-gray-600 text-sm mb-6">${t}</p>
                <div class="flex justify-end gap-3">
                    <button id="confirm-cancel" class="btn-secondary text-sm">${r}</button>
                    <button id="confirm-ok" class="${o?`px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors`:`btn-primary text-sm`}">${n}</button>
                </div>
            </div>
        `,document.body.appendChild(c);let l=c.querySelector(`#confirm-ok`),u=c.querySelector(`#confirm-cancel`);l.focus();let d=()=>{c.remove(),this._lastFocused&&document.body.contains(this._lastFocused)&&this._lastFocused.focus(),this._lastFocused=null};u.addEventListener(`click`,()=>{d(),a&&a()}),l.addEventListener(`click`,()=>{d(),i&&i()});let f=[u,l];c.addEventListener(`keydown`,e=>{if(e.key===`Escape`&&(e.preventDefault(),d(),a&&a()),e.key===`Tab`){let t=f[0],n=f[f.length-1];e.shiftKey&&document.activeElement===t?(e.preventDefault(),n.focus()):!e.shiftKey&&document.activeElement===n&&(e.preventDefault(),t.focus())}})}},s={render(){let e=r.getUser(),t=document.createElement(`nav`);t.className=`bg-white shadow-sm sticky top-0 z-30`;let n=window.location.pathname,a=this._getBreadcrumbs(n),s=e=>e===a.length-1;return t.innerHTML=`
            <div class="px-4 md:px-6 py-4 flex items-center justify-between">
                <div class="flex items-center gap-2 md:gap-4">
                    <button id="sidebar-toggle" class="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Abrir menú de navegación">
                        <svg class="w-6 h-6 text-gray-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                    <div class="truncate max-w-[60vw] sm:max-w-none">
                        <nav class="flex items-center gap-1 text-sm text-gray-500" aria-label="Ruta de navegación">
                            ${a.map((e,t)=>`
                                ${t>0?`<svg class="w-4 h-4 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`:``}
                                ${e.href?`<a data-link href="${e.href}" class="hover:text-gray-700 transition-colors" ${s(t)?`aria-current="page"`:``}>${e.label}</a>`:`<span class="text-gray-800 font-medium" aria-current="page">${e.label}</span>`}
                            `).join(``)}
                        </nav>
                    </div>
                </div>
                <div class="flex items-center gap-2 md:gap-4">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style="background:var(--rol-primary, #1D4ED8)">
                        ${e?.username?e.username.charAt(0).toUpperCase():`?`}
                    </div>
                    <button id="logout-btn" class="btn-secondary text-sm">
                        Salir
                    </button>
                </div>
            </div>
        `,t.querySelector(`#logout-btn`).addEventListener(`click`,e=>{e.preventDefault(),o.show({title:`Cerrar Sesión`,message:`¿Estás seguro que quieres cerrar sesión?`,confirmText:`Salir`,onConfirm:()=>{r.logout(),i.navigate(`/`)}})}),t},_getBreadcrumbs(e){let t=r.getUser(),n=`/dashboard`;t?.rol===`SUPERADMIN`?n=`/dashboard-superadmin`:t?.rol===`ESTUDIANTE`&&(n=`/dashboard-estudiante`);let i=[{label:`NexoEdu`,href:n}],a=e.split(`/`).filter(Boolean),o=``,s={"dashboard-superadmin":`Dashboard`,dashboard:`Dashboard`,"dashboard-estudiante":`Dashboard`,institucion:`Institución`,campanas:`Campañas`,estudiantes:`Estudiantes`,"mis-campanas":`Mis Campañas`,perfil:`Mi Perfil`,configuracion:`Configuración`};return a.forEach((e,t)=>{o+=`/${e}`;let n=s[e]||e.replace(/-/g,` `).replace(/\b\w/g,e=>e.toUpperCase());t===a.length-1?i.push({label:n,href:null}):i.push({label:n,href:o})}),i}},c={render(){let e=r.getUser(),t=document.createElement(`aside`),n=this._getLinks(e?.rol);return t.innerHTML=`
            <aside class="w-64 h-screen bg-slate-900 text-white flex flex-col" aria-label="Barra lateral de navegación">
                <div class="p-6 border-b border-slate-700">
                    <a data-link href="/${e?.rol===`SUPERADMIN`?`dashboard-superadmin`:e?.rol===`ESTUDIANTE`?`dashboard-estudiante`:`dashboard`}" class="block">
                        <div class="flex items-center gap-3 mb-1">
                            <img src="/src/assets/logo.jpeg" alt="NexoEdu" class="w-9 h-9 rounded-lg object-cover" />
                            <h1 class="text-2xl font-bold tracking-tight">NexoEdu</h1>
                        </div>
                        <p class="text-slate-400 text-xs mt-1 ml-12">Panel de Control</p>
                    </a>
                </div>
                <nav class="flex-1 p-3 overflow-y-auto" aria-label="Navegación principal">
                    <ul class="space-y-1">
                        ${n.map(e=>`
                            <li>
                                <a data-link href="${e.href}" 
                                   class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors sidebar-link
                                   ${this._isActive(e.href)?`sidebar-active`:`text-slate-300 hover:bg-slate-800 hover:text-white`}"
                                   ${this._isActive(e.href)?`aria-current="page"`:``}>
                                    ${e.icon}
                                    <span>${e.label}</span>
                                </a>
                            </li>
                        `).join(``)}
                    </ul>
                </nav>
                <div class="p-4 border-t border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style="background:var(--rol-primary, #1D4ED8)">
                            ${e?.username?e.username.charAt(0).toUpperCase():`?`}
                        </div>
                        <div class="flex-grow min-w-0">
                            <p class="text-sm font-medium truncate">${e?.username||`Usuario`}</p>
                            <p class="text-xs text-slate-400">${this._roleLabel(e?.rol)}</p>
                        </div>
                    </div>
                </div>
            </aside>
        `,t},_isActive(e){let t=window.location.pathname;return e===`/dashboard`||e===`/dashboard-superadmin`||e===`/dashboard-estudiante`?t===e:t.startsWith(e)&&e!==`/dashboard`},_roleLabel(e){return{SUPERADMIN:`Super Administrador`,ADMINISTRADOR:`Administrador`,ESTUDIANTE:`Estudiante`}[e]||e},_getLinks(e){let t={dashboard:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,campana:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>`,escuela:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,gente:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,perfil:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`,config:`<svg class="w-5 h-5 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`};return e===`SUPERADMIN`?[{href:`/dashboard-superadmin`,label:`Dashboard`,icon:t.dashboard},{href:`/instituciones`,label:`Instituciones`,icon:t.escuela},{href:`/campanas`,label:`Campañas`,icon:t.campana},{href:`/instituciones/crear-admin`,label:`Crear Admin`,icon:t.perfil},{href:`/configuracion`,label:`Configuración`,icon:t.config}]:e===`ADMINISTRADOR`?[{href:`/dashboard`,label:`Dashboard`,icon:t.dashboard},{href:`/institucion`,label:`Mi Institución`,icon:t.escuela},{href:`/campanas`,label:`Campañas`,icon:t.campana},{href:`/estudiantes`,label:`Estudiantes`,icon:t.gente},{href:`/perfil`,label:`Mi Perfil`,icon:t.perfil},{href:`/configuracion`,label:`Configuración`,icon:t.config}]:[{href:`/dashboard-estudiante`,label:`Dashboard`,icon:t.dashboard},{href:`/mis-campanas`,label:`Mis Campañas`,icon:t.campana},{href:`/perfil`,label:`Mi Perfil`,icon:t.perfil},{href:`/configuracion`,label:`Configuración`,icon:t.config}]}},l=`nexoedu-sidebar`,u={render(e){let t=r.getUser(),n=document.createElement(`div`);n.className=`min-h-screen bg-surface`,t?.rol&&(n.dataset.role=t.rol);let i=window.innerWidth<1024||localStorage.getItem(l)===`true`;return n.innerHTML=`
            <div id="layout-sidebar"
                class="fixed left-0 top-0 z-50 w-64 h-screen transition-transform duration-300
                       ${i?`-translate-x-full`:`translate-x-0`}">
            </div>
            <div id="sidebar-backdrop"
                class="fixed inset-0 z-40 bg-black/50 opacity-0 pointer-events-none transition-opacity duration-300">
            </div>
            <div class="flex-1 flex flex-col min-h-screen layout-main
                        transition-[margin] duration-300
                        ${i?`ml-0`:`ml-64`}
                        max-lg:ml-0">
                <div id="layout-navbar" role="banner"></div>
                <main id="layout-content" class="flex-1 page-enter"></main>
            </div>
        `,requestAnimationFrame(()=>{let t=n.querySelector(`#layout-sidebar`),r=n.querySelector(`#sidebar-backdrop`),i=n.querySelector(`.layout-main`);t.appendChild(c.render());let a=s.render();n.querySelector(`#layout-navbar`).appendChild(a);let o=a.querySelector(`#sidebar-toggle`);if(o){let e=()=>{if(window.innerWidth<1024)t.classList.toggle(`translate-x-0`),t.classList.toggle(`-translate-x-full`),r.classList.toggle(`opacity-0`),r.classList.toggle(`pointer-events-none`),r.classList.toggle(`opacity-100`),r.classList.toggle(`pointer-events-auto`);else{t.classList.toggle(`-translate-x-full`),t.classList.toggle(`translate-x-0`),i.classList.toggle(`ml-64`),i.classList.toggle(`ml-0`);let e=t.classList.contains(`-translate-x-full`);localStorage.setItem(l,e)}let e=t.classList.contains(`translate-x-0`);o.setAttribute(`aria-label`,e?`Cerrar menú`:`Abrir menú`),o.setAttribute(`aria-expanded`,e)};o.addEventListener(`click`,e),r.addEventListener(`click`,e)}let u=n.querySelector(`#layout-content`);if(typeof e==`function`){let t=e();t instanceof HTMLElement&&u.appendChild(t)}else e instanceof HTMLElement&&u.appendChild(e)}),n}},d={academico:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,cultural:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"/></svg>`,deportivo:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,tecnologia:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,salud:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,medio_ambiente:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,artes:`<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>`},f={academico:`badge-blue`,cultural:`badge-yellow`,deportivo:`badge-green`,tecnologia:`badge-blue`,salud:`badge-red`,medio_ambiente:`badge-green`,artes:`badge-yellow`},p={render(e,t={}){let{showEnrollButton:n=!1,onEnroll:r=()=>{}}=t,i=new Date,a=new Date(e.start_date),o=e.end_date?new Date(e.end_date):null,s=`Próxima`,c=`badge-yellow`;i>=a&&(!o||i<=o)?(s=`Activa`,c=`badge-green`):o&&i>o&&(s=`Finalizada`,c=`badge-gray`);let l=e=>new Intl.DateTimeFormat(`es-CO`,{day:`2-digit`,month:`short`,year:`numeric`}).format(e),u=(e.type||``).toLowerCase().replace(/\s+/g,`_`),p=d[u]||d.academico,m=f[u]||`badge-blue`,h=document.createElement(`div`);if(h.className=`card card-hover flex flex-col h-full`,h.innerHTML=`
            <div class="relative h-40 gradient-barranquilla overflow-hidden">
                ${e.url_multimedia?`
                    <img 
                        src="${e.url_multimedia}" 
                        alt="${e.title}"
                        class="w-full h-full object-cover"
                    />
                `:`
                    <div class="w-full h-full flex items-center justify-center">
                        <svg class="w-16 h-16 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                        </svg>
                    </div>
                `}

                <div class="absolute top-3 right-3">
                    <span class="badge ${c}">
                        ${s}
                    </span>
                </div>

                ${e.sponsor?`
                    <div class="absolute bottom-3 left-3">
                        <span class="px-2 py-1 rounded text-xs font-medium bg-white/90 text-gray-700">
                            ${e.sponsor}
                        </span>
                    </div>
                `:``}
            </div>

            <div class="p-5 flex flex-col flex-grow">
                <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    ${e.title}
                </h3>

                <div class="mb-2">
                    <span class="badge ${m} inline-flex items-center">
                        ${p}
                        ${e.type||`General`}
                    </span>
                </div>

                <p class="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    ${e.description||`Sin descripción`}
                </p>

                <div class="flex items-center text-sm text-gray-500 mb-4">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>${l(a)} - ${e.end_date?l(o):`Sin fin`}</span>
                </div>

                <div class="flex items-center text-sm text-gray-500 mb-4">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <span>${e.enrollment_count||0} inscritos</span>
                </div>

                <div class="flex items-center text-sm text-gray-400 mb-4">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span>Creado por: ${e.created_by_username||`—`}</span>
                </div>

                ${n&&s===`Activa`?`
                    <button 
                        class="btn-primary w-full text-center"
                        data-campaign-id="${e.id}"
                    >
                        Inscribirse
                    </button>
                `:``}
            </div>
        `,n){let t=h.querySelector(`[data-campaign-id]`);t&&t.addEventListener(`click`,()=>{r(e.id)})}return h}};function m(e,t,n=800){let r=String(t).match(/^([\d.]+)(.*)$/);if(!r){e.textContent=t;return}let i=parseFloat(r[1]),a=r[2],o=Number.isInteger(i),s=performance.now();function c(t){let r=t-s,l=Math.min(r/n,1),u=1-(1-l)**3,d=Math.round(i*u*(o?1:100))/(o?1:100);e.textContent=o?Math.floor(d)+a:d.toFixed(1)+a,l<1&&requestAnimationFrame(c)}requestAnimationFrame(c)}var h={render(e={}){let{label:t=``,value:n=0,icon:r=``,color:i=`blue`,description:a=``}=e,o={blue:`bg-primary-light`,green:`bg-success-light`,yellow:`bg-warm-light`,red:`bg-error-light`,purple:`bg-purple-50 text-purple-600`,gray:`bg-gray-50 text-gray-600`},s=document.createElement(`div`);s.className=`card card-hover p-6`,s.innerHTML=`
            <div class="flex items-start justify-between">
                <div>
                    <p class="text-sm font-medium text-muted">${t}</p>
                    <p class="text-3xl font-bold text-gray-900 mt-2 count-value">${n}</p>
                    ${a?`
                        <p class="text-sm text-gray-500 mt-1">${a}</p>
                    `:``}
                </div>
                ${r?`
                    <div class="p-3 rounded-lg ${o[i]||o.blue}">
                        ${r}
                    </div>
                `:``}
            </div>
        `;let c=s.querySelector(`.count-value`),l=new IntersectionObserver(e=>{e[0].isIntersecting&&(m(c,n),l.disconnect())},{threshold:.3});return l.observe(c),s}},g={campaigns:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <rect x="10" y="20" width="60" height="44" rx="6" stroke="currentColor" stroke-width="2" fill="url(#empty-camp-bg)"/>
            <rect x="18" y="32" width="44" height="4" rx="2" fill="currentColor" opacity="0.3"/>
            <rect x="18" y="40" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.2"/>
            <rect x="18" y="47" width="36" height="3" rx="1.5" fill="currentColor" opacity="0.15"/>
            <circle cx="60" cy="24" r="10" fill="currentColor" opacity="0.1"/>
            <path d="M57 24h6M60 21v6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <defs><linearGradient id="empty-camp-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,search:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="34" cy="34" r="18" stroke="currentColor" stroke-width="2.5" fill="url(#empty-search-bg)"/>
            <path d="M47 47l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="34" cy="34" r="6" fill="currentColor" opacity="0.1"/>
            <defs><linearGradient id="empty-search-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,enrollments:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <rect x="12" y="16" width="56" height="52" rx="6" stroke="currentColor" stroke-width="2" fill="url(#empty-enroll-bg)"/>
            <path d="M28 34l8 8 16-16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
            <rect x="16" y="10" width="48" height="8" rx="4" fill="currentColor" opacity="0.08"/>
            <defs><linearGradient id="empty-enroll-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,students:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="32" cy="28" r="10" stroke="currentColor" stroke-width="2" fill="url(#empty-stud-bg)"/>
            <path d="M18 56c0-8 6-14 14-14s14 6 14 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="56" cy="32" r="7" stroke="currentColor" stroke-width="1.5" opacity="0.4"/>
            <path d="M48 52c0-5.6 4-10 8-10s8 4.4 8 10" stroke="currentColor" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>
            <defs><linearGradient id="empty-stud-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,pinned:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <path d="M40 12v4M28 28l-6-6M52 28l6-6M40 28v32" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.3"/>
            <path d="M28 44c0 6.6 5.4 12 12 12s12-5.4 12-12" stroke="currentColor" stroke-width="2.5" fill="url(#empty-pin-bg)"/>
            <path d="M40 52v12M32 64h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
            <defs><linearGradient id="empty-pin-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`,eye:`
        <svg class="w-20 h-20 text-gray-300" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <path d="M12 40c0 0 12-18 28-18s28 18 28 18-12 18-28 18-28-18-28-18z" stroke="currentColor" stroke-width="2" fill="url(#empty-eye-bg)"/>
            <circle cx="40" cy="40" r="6" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.08"/>
            <defs><linearGradient id="empty-eye-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity="0.08"/><stop offset="100%" stop-color="currentColor" stop-opacity="0.02"/></linearGradient></defs>
        </svg>`},_={render(e=`campaigns`,t=`No hay datos disponibles`){let n=document.createElement(`div`);return n.className=`empty-state`,n.innerHTML=`
            ${this.svg(e)}
            <p class="text-gray-400">${t}</p>
        `,n},html(e=`campaigns`,t=`No hay datos disponibles`){return`
            <div class="empty-state">
                ${this.svg(e)}
                <p class="text-gray-400">${t}</p>
            </div>
        `},svg(e=`campaigns`){return g[e]||g.campaigns}};function v(e=`Error al cargar datos`){let t=document.createElement(`div`);return t.className=`flex flex-col items-center justify-center py-20 text-center content-fade-in`,t.innerHTML=`
        <svg class="w-16 h-16 text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-gray-500 mb-4">${e}</p>
        <button class="btn-primary" onclick="window.location.reload()">Reintentar</button>
    `,t}async function y(e={}){let n=new URLSearchParams;e.active&&n.append(`active`,`true`),e.institution_id&&n.append(`institution_id`,e.institution_id),e.scope_type&&n.append(`scope_type`,e.scope_type),e.person_id&&n.append(`person_id`,e.person_id);let r=n.toString(),i=r?`api/campaigns?${r}`:`api/campaigns`;return(await t.get(i)).json()}async function b(){return(await t.get(`api/campaigns/active`)).json()}async function x(e){return(await t.get(`api/campaigns/available/${e}`)).json()}async function S(e){return(await t.post(`api/campaigns/${e}/enroll`,{})).json()}async function C(e){return(await t.get(`api/campaigns/${e}`)).json()}async function w(e){return(await t.post(`api/campaigns`,e)).json()}async function ee(e,n){return(await t.put(`api/campaigns/${e}`,n)).json()}async function te(e){return(await t.delete(`api/campaigns`,e)).json()}async function ne(e={}){let n=new URLSearchParams;e.institution_id&&n.append(`institution_id`,e.institution_id),e.status_id&&n.append(`status_id`,e.status_id),e.grade_id&&n.append(`grade_id`,e.grade_id),e.gender_id&&n.append(`gender_id`,e.gender_id),e.min_age&&n.append(`min_age`,e.min_age),e.max_age&&n.append(`max_age`,e.max_age),e.search&&n.append(`search`,e.search);let r=n.toString(),i=r?`api/students?${r}`:`api/students`;return(await t.get(i)).json()}async function re(e){return(await t.post(`api/people`,e)).json()}async function T(e,n){return(await t.put(`api/students/${e}`,n)).json()}async function E(e){return(await t.get(`api/people/${e}`)).json()}async function ie(e,n){return(await t.put(`api/people/${e}`,n)).json()}async function D(e=null){let n=e?`api/dashboard/stats/${e}`:`api/dashboard/stats`;return(await t.get(n)).json()}var ae={render(){return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-7xl mx-auto`;let t=document.createElement(`div`);return t.className=`space-y-6`,t.innerHTML=`
                <div class="h-40 rounded-2xl shimmer"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${[,,,].fill(`<div class="h-64 rounded-xl shimmer"></div>`).join(``)}
                </div>
            `,e.appendChild(t),(async()=>{try{let[t,n]=await Promise.all([b(),D()]),r=[...t].sort((e,t)=>(t.enrollment_count||0)-(e.enrollment_count||0)).slice(0,5),a={students:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,graduates:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,updated:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,pending:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`};e.innerHTML=`
                        <section class="mb-8 content-fade-in">
                            <div class="gradient-barranquilla rounded-2xl p-8 relative overflow-hidden">
                                <div class="hero-shape hero-shape-1"></div>
                                <div class="hero-shape hero-shape-2"></div>
                                <div class="relative z-10">
                                    <div class="flex items-center gap-3 mb-2">
                                        <span class="badge bg-white/20 text-white border border-white/20">Dashboard</span>
                                        <span class="text-white/60 text-sm">${new Date().toLocaleDateString(`es-CO`,{weekday:`long`,day:`numeric`,month:`long`,year:`numeric`})}</span>
                                    </div>
                                    <h1 class="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
                                    <p class="text-white/80 text-lg max-w-2xl">Bienvenido al sistema de seguimiento educativo del Distrito de Barranquilla.</p>
                                    <div class="flex flex-wrap gap-3 mt-5">
                                        <a data-link href="/campanas" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                                            Campañas
                                        </a>
                                        <a data-link href="/instituciones" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                                            Instituciones
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid"></div>
                        </section>

                        <div class="mb-8 content-fade-in">
                            <div class="card p-6">
                                <h2 class="text-lg font-bold text-gray-800 mb-5">Acciones Rápidas</h2>
                                <div class="space-y-3" id="quick-actions"></div>
                            </div>
                        </div>

                        <section class="mb-8 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-bold text-gray-800">Campañas Activas</h2>
                                <a data-link href="/campanas" class="text-sm font-medium" style="color:var(--rol-primary, #1D4ED8);">Ver todas</a>
                            </div>
                            ${t.length>0?`
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="campaigns-grid"></div>
                            `:`
                                ${_.html(`campaigns`,`No hay campañas activas en este momento.`)}
                            `}
                        </section>

                        ${r.length>0?`
                            <section class="mb-8 content-fade-in">
                                <div class="card p-6">
                                    <div class="flex items-center justify-between mb-5">
                                        <h2 class="text-lg font-bold text-gray-800">Campañas con Mayor Inscripción</h2>
                                        <span class="text-sm text-muted">Top 5</span>
                                    </div>
                                    <div class="divide-y divide-gray-100" id="top-enrolled-list"></div>
                                </div>
                            </section>
                        `:``}
                    `;let o=e.querySelector(`#quick-actions`);this._renderQuickActions(o);let s=e.querySelector(`#stats-grid`);if([{label:`Total Estudiantes`,value:n.total_students,icon:a.students,color:`blue`,description:`Estudiantes activos`},{label:`Egresados`,value:n.total_graduates,icon:a.graduates,color:`purple`,description:`Graduados`},{label:`Actualizados`,value:n.updated_count,icon:a.updated,color:`green`,description:`${n.update_percentage||0}% del total`},{label:`Pendientes`,value:n.pending_count,icon:a.pending,color:`yellow`,description:`Requieren actualización`}].forEach(e=>{s.appendChild(h.render(e))}),t.length>0){let n=e.querySelector(`#campaigns-grid`);t.slice(0,6).forEach(e=>{let t=p.render(e);t.classList.add(`stagger-item`,`cursor-pointer`),t.addEventListener(`click`,t=>{t.target.closest(`button, a, input, select`)||i.navigate(`/campanas/${e.id}`)}),n.appendChild(t)})}let c=e.querySelector(`#top-enrolled-list`);c&&r.forEach((e,t)=>{c.appendChild(this._renderTopEnrolledRow(e,t))})}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar datos`))}})(),e})},_renderQuickActions(e){[{label:`Nueva Campaña`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,href:`/campanas/crear`},{label:`Crear Institución`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,href:`/instituciones/crear`}].forEach(t=>{let n=document.createElement(`a`);n.setAttribute(`data-link`,``),n.href=t.href,n.className=`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer hover:bg-gray-50`,n.innerHTML=`
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                    <span style="color:var(--rol-primary, #1D4ED8)">${t.icon}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">${t.label}</span>
                <svg class="w-4 h-4 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            `,e.appendChild(n)})},_renderTopEnrolledRow(e,t){let n=document.createElement(`div`);return n.className=`flex items-center gap-4 py-3 stagger-item cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded-lg transition`,n.style.animationDelay=`${.05*t}s`,n.innerHTML=`
            <span class="text-sm font-bold text-muted w-6">${t+1}</span>
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                <svg class="w-5 h-5" style="color:var(--rol-primary, #1D4ED8)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6"/></svg>
            </div>
            <div class="flex-grow min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">${e.title}</p>
                <p class="text-xs text-muted">${e.type||`General`}</p>
            </div>
            <div class="text-right flex-shrink-0">
                <p class="text-sm font-bold" style="color:var(--rol-primary, #1D4ED8)">${e.enrollment_count||0}</p>
                <p class="text-xs text-muted">inscritos</p>
            </div>
        `,n.addEventListener(`click`,()=>i.navigate(`/campanas/${e.id}`)),n.addEventListener(`keydown`,t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),i.navigate(`/campanas/${e.id}`))}),n.setAttribute(`tabindex`,`0`),n.setAttribute(`role`,`button`),n}};async function O(){return(await t.get(`api/institutions`)).json()}async function k(e){return(await t.get(`api/institutions/${e}`)).json()}async function oe(e){return(await t.get(`api/institutions/${e}/students`)).json()}async function A(e){return(await t.post(`api/institutions`,e)).json()}async function se(e,n){return(await t.put(`api/institutions/${e}`,n)).json()}async function ce(e){return(await t.patch(`api/institutions/${e}/toggle-active`)).json()}var le={render(){return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-7xl mx-auto`;let t=r.getUser()?.institution_id;if(!t)return e.innerHTML=`<div class="text-center py-20 text-gray-500">No se encontró institución asociada</div>`,e;let n=document.createElement(`div`);return n.className=`space-y-6`,n.innerHTML=`
                <div class="h-40 rounded-2xl shimmer"></div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${[,,,].fill(`<div class="h-64 rounded-xl shimmer"></div>`).join(``)}
                </div>
            `,e.appendChild(n),(async()=>{try{let[n,r,a]=await Promise.all([k(t),y({active:!0,institution_id:t}),D(t)]),o={students:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,graduates:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,updated:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,pending:`<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`};e.innerHTML=`
                        <section class="mb-8 rounded-2xl overflow-hidden relative gradient-barranquilla content-fade-in">
                            <div class="hero-shape hero-shape-1"></div>
                            <div class="hero-shape hero-shape-2"></div>
                            <div class="relative z-10 px-8 py-10">
                                <span class="badge bg-white/20 text-white border border-white/20 mb-2">Dashboard</span>
                                <h1 class="text-2xl md:text-3xl font-bold text-white mb-1">${n.institution_name}</h1>
                                <p class="text-blue-100">${n.neighborhood||``}${n.neighborhood&&n.locality?`, `:``}${n.locality||``}</p>
                                <div class="flex flex-wrap gap-3 mt-4">
                                    <a data-link href="/estudiantes" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857"/></svg>
                                        Estudiantes
                                    </a>
                                    <a data-link href="/campanas" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6"/></svg>
                                        Campañas
                                    </a>
                                    <a data-link href="/institucion" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition text-sm font-medium">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                                        Mi Institución
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid"></div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="card p-6">
                                <h2 class="text-lg font-bold text-gray-800 mb-5">Acciones Rápidas</h2>
                                <div class="space-y-3" id="quick-actions"></div>
                            </div>
                        </section>

                        <section class="mb-8 content-fade-in">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-bold text-gray-800">Campañas Activas</h2>
                                <a data-link href="/campanas" class="text-sm font-medium" style="color:var(--rol-primary, #2563ED)">Ver todas →</a>
                            </div>
                            ${r.length>0?`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="campaigns-grid"></div>`:_.html(`campaigns`,`No hay campañas activas actualmente.`)}
                        </section>
                    `;let s=e.querySelector(`#quick-actions`);this._renderQuickActions(s);let c=e.querySelector(`#stats-grid`);if([{label:`Total Estudiantes`,value:a.total_students,icon:o.students,color:`blue`,description:`Estudiantes activos`},{label:`Egresados`,value:a.total_graduates,icon:o.graduates,color:`purple`,description:`Graduados`},{label:`Actualizados`,value:a.updated_count,icon:o.updated,color:`green`,description:`${a.update_percentage||0}% del total`},{label:`Pendientes`,value:a.pending_count,icon:o.pending,color:`yellow`,description:`Requieren actualización`}].forEach(e=>{c.appendChild(h.render(e))}),r.length>0){let t=e.querySelector(`#campaigns-grid`);r.forEach(e=>{let n=p.render(e);n.classList.add(`stagger-item`,`cursor-pointer`),n.addEventListener(`click`,t=>{t.target.closest(`button, a, input, select`)||i.navigate(`/campanas/${e.id}`)}),t.appendChild(n)})}}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar datos`))}})(),e})},_renderQuickActions(e){[{label:`Crear Estudiante`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>`,href:`/estudiantes/crear`},{label:`Nueva Campaña`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>`,href:`/campanas/crear`},{label:`Ver Institución`,icon:`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>`,href:`/institucion`}].forEach(t=>{let n=document.createElement(`a`);n.setAttribute(`data-link`,``),n.href=t.href,n.className=`flex items-center gap-3 p-3 rounded-lg transition cursor-pointer hover:bg-gray-50`,n.innerHTML=`
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:var(--rol-primary-light, #DBEAFE)">
                    <span style="color:var(--rol-primary, #2563EB)">${t.icon}</span>
                </div>
                <span class="text-sm font-medium text-gray-700">${t.label}</span>
                <svg class="w-4 h-4 ml-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            `,e.appendChild(n)})}},j={card(){let e=document.createElement(`div`);return e.className=`bg-white rounded-xl border border-gray-100 overflow-hidden shimmer`,e.innerHTML=`
            <div class="h-40 bg-gray-200/50"></div>
            <div class="p-5 space-y-3">
                <div class="h-4 bg-gray-200/50 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200/50 rounded w-1/4"></div>
                <div class="h-3 bg-gray-200/50 rounded w-full"></div>
                <div class="h-3 bg-gray-200/50 rounded w-2/3"></div>
            </div>
        `,e},textLine(e=`w-full`){let t=document.createElement(`div`);return t.className=`h-3 bg-gray-200/50 rounded ${e} shimmer`,t},custom(e){let t=document.createElement(`div`);return t.innerHTML=e,t},grid(e=6){let t=document.createElement(`div`);t.className=`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5`;for(let n=0;n<e;n++)t.appendChild(this.card());return t}},M=3,N={show(e,t=`success`,n=4e3){let r=document.querySelector(`#toast-container`);for(r||(r=document.createElement(`div`),r.id=`toast-container`,r.className=`fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm`,r.setAttribute(`aria-live`,`polite`),r.setAttribute(`aria-relevant`,`additions`),document.body.appendChild(r));r.children.length>=M;)r.firstChild.remove();let i=document.createElement(`div`);i.setAttribute(`role`,`alert`);let a={success:`bg-green-50 border-green-400 text-green-800`,error:`bg-error-light border-red-400 text-error`,info:`bg-primary-light border-blue-400 text-primary`,warning:`bg-warm-light border-yellow-400 text-warm`},o={success:`<svg class="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,error:`<svg class="w-5 h-5 text-red-500 flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,info:`<svg class="w-5 h-5 text-primary flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,warning:`<svg class="w-5 h-5 text-warm flex-shrink-0" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`};i.className=`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg ${a[t]||a.info}`,i.style.animation=`toastIn 0.3s ease-out`,i.innerHTML=`
            ${o[t]||o.info}
            <p class="text-sm font-medium flex-1">${e}</p>
            <button class="close-toast flex-shrink-0 ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Cerrar">
                <svg class="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
        `,i.querySelector(`.close-toast`).addEventListener(`click`,()=>{i.style.animation=`toastOut 0.3s ease-in forwards`,setTimeout(()=>i.remove(),300)}),r.appendChild(i),setTimeout(()=>{document.body.contains(i)&&(i.style.animation=`toastOut 0.3s ease-in forwards`,setTimeout(()=>i.remove(),300))},n)},success(e,t){this.show(e,`success`,t)},error(e,t){this.show(e,`error`,t)},info(e,t){this.show(e,`info`,t)},warning(e,t){this.show(e,`warning`,t)}},ue={render(){return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-7xl mx-auto`;let t=j.grid(3,`card`);return t.id=`campaigns-grid`,e.appendChild(j.textLine()),e.appendChild(t),(async()=>{let t=r.getUser();try{let n=[];t?.person_id&&(n=await x(t.person_id)),e.innerHTML=`
                        <section class="mb-8 rounded-xl bg-white shadow-sm p-6 content-fade-in">
                            <h1 class="text-2xl font-bold text-gray-800 mb-2">
                                Bienvenido, ${t?.username||`Estudiante`}
                            </h1>
                            <p class="text-muted">Aquí puedes ver las campañas disponibles para ti y actualizar tu información.</p>
                        </section>

                        <section class="mb-10">
                            <h2 class="text-xl font-bold text-gray-800 mb-4">Campañas Disponibles</h2>
                            ${n.length>0?`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="campaigns-grid" aria-live="polite"></div>`:_.html(`eye`,`No hay campañas disponibles en este momento.`)}
                        </section>

                        <section class="content-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <a data-link href="/mis-campanas" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Mis Campañas</p>
                                        <p class="text-sm text-muted">Ver campañas inscritas</p>
                                    </div>
                                </a>
                                <a data-link href="/perfil" class="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex items-center gap-4">
                                    <div class="p-3 rounded-lg" style="background:var(--rol-accent-light, #FEF3C7);color:var(--rol-accent, #F59E0B)">
                                        <svg class="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                    </div>
                                    <div>
                                        <p class="font-semibold text-gray-800">Mi Perfil</p>
                                        <p class="text-sm text-muted">Actualizar datos personales</p>
                                    </div>
                                </a>
                            </div>
                        </section>
                    `;let r=e.querySelector(`#campaigns-grid`);r&&n.forEach(e=>{let t=p.render(e,{showEnrollButton:!0,onEnroll:async e=>{o.show({title:`Inscribirse en campaña`,message:`¿Estás seguro que deseas inscribirte en esta campaña?`,confirmText:`Inscribirme`,onConfirm:async()=>{try{await S(e),N.success(`¡Inscripción exitosa! Ahora puedes actualizar tus datos.`),i.navigate(`/perfil/editar`)}catch(e){N.error(e.message||`Error al inscribirse`)}}})}});t.classList.add(`stagger-item`),r.appendChild(t)})}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar datos`))}})(),e})}},P={render(e={}){let{onFilter:t=()=>{},grades:n=[],genders:r=[],statuses:i=[]}=e,a=document.createElement(`div`);a.className=`bg-white rounded-lg shadow-sm p-4 mb-6`,a.innerHTML=`
            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                <!-- Grado -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Grado</label>
                    <select 
                        data-filter="grade" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${n.map(e=>`
                            <option value="${e.id}">${e.grade}</option>
                        `).join(``)}
                    </select>
                </div>
                
                <!-- Género -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Género</label>
                    <select 
                        data-filter="gender" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${r.map(e=>`
                            <option value="${e.id}">${e.name}</option>
                        `).join(``)}
                    </select>
                </div>
                
                <!-- Estado -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select 
                        data-filter="status" 
                        class="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm max-sm:w-full"
                    >
                        <option value="">Todos</option>
                        ${i.map(e=>`
                            <option value="${e.id}">${e.status}</option>
                        `).join(``)}
                    </select>
                </div>
                
                <!-- Rango de edad -->
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Edad mínima</label>
                    <input 
                        type="number" 
                        data-filter="min-age" 
                        min="10" 
                        max="30"
                        placeholder="Mín"
                        class="w-20 max-sm:w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
                
                <div class="flex flex-col max-sm:w-full">
                    <label class="text-sm font-medium text-gray-700 mb-1">Edad máxima</label>
                    <input 
                        type="number" 
                        data-filter="max-age" 
                        min="10" 
                        max="30"
                        placeholder="Máx"
                        class="w-20 max-sm:w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    />
                </div>
                
                <!-- Botones -->
                <div class="flex gap-2 max-sm:w-full max-sm:flex-col">
                    <button 
                            id="filter-apply"
                            class="btn-primary text-sm max-sm:w-full"
                    >
                        Filtrar
                    </button>
                    <button 
                            id="filter-clear"
                            class="btn-secondary text-sm max-sm:w-full"
                    >
                        Limpiar
                    </button>
                </div>
            </div>
            
            <!-- Contador de resultados -->
            <div id="filter-count" class="mt-3 text-sm text-gray-500"></div>
        `;let o=a.querySelector(`#filter-apply`),s=a.querySelector(`#filter-clear`),c=a.querySelector(`[data-filter="grade"]`),l=a.querySelector(`[data-filter="gender"]`),u=a.querySelector(`[data-filter="status"]`),d=a.querySelector(`[data-filter="min-age"]`),f=a.querySelector(`[data-filter="max-age"]`),p=()=>({grade_id:c.value||null,gender_id:l.value||null,status_id:u.value||null,min_age:d.value||null,max_age:f.value||null});return o&&o.addEventListener(`click`,()=>{t(p())}),s&&s.addEventListener(`click`,()=>{c.value=``,l.value=``,u.value=``,d.value=``,f.value=``,t({})}),[c,l,u].forEach(e=>{e&&e.addEventListener(`change`,()=>{t(p())})}),a},updateCount(e,t){let n=e.querySelector(`#filter-count`);n&&(n.textContent=`${t} estudiante${t===1?``:`s`} encontrado${t===1?``:`s`}`)}};function F(e,t=`es-CO`){if(!e)return`—`;try{return new Intl.DateTimeFormat(t,{day:`2-digit`,month:`short`,year:`numeric`}).format(new Date(e))}catch{return e}}function de(e){if(!e)return{color:`bg-red-500`,label:`Nunca actualizado`,textColor:`text-red-700`,daysSince:1/0,level:`red`};let t=Math.floor((Date.now()-new Date(e).getTime())/(1e3*60*60*24));return t<=30?{color:`bg-green-500`,label:`Actualizado recientemente`,textColor:`text-green-700`,daysSince:t,level:`green`}:t<=90?{color:`bg-yellow-500`,label:`Por actualizar`,textColor:`text-yellow-700`,daysSince:t,level:`yellow`}:{color:`bg-red-500`,label:`Desactualizado`,textColor:`text-red-700`,daysSince:t,level:`red`}}function I(e){let t=e.last_update_date||e.person?.last_update_date;if(!t)return`red`;let n=Math.floor((Date.now()-new Date(t).getTime())/(1e3*60*60*24));return n<=30?`green`:n<=90?`yellow`:`red`}function L(e){let t=new Date,n=new Date(e.start_date),r=e.end_date?new Date(e.end_date):new Date(`2099-12-31`);return t>=n&&t<=r?{status:`active`,label:`Activa`,color:`badge-green`}:t<n?{status:`upcoming`,label:`Próxima`,color:`badge-yellow`}:{status:`finished`,label:`Finalizada`,color:`badge-gray`}}var R={render(e={}){let{students:t=[],onStudentClick:n=()=>{},showUpdateIndicator:r=!1}=e,i=document.createElement(`div`);if(i.className=`space-y-6`,t.length===0)return i.innerHTML=`
                <div class="text-center py-12 card">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p class="mt-4 text-gray-500">No se encontraron estudiantes</p>
                </div>
            `,i;let a=t.reduce((e,t)=>{let n=t.grade||`Sin grado`;return e[n]||(e[n]=[]),e[n].push(t),e},{}),o=Object.keys(a).sort((e,t)=>(parseInt(t)||0)-(parseInt(e)||0));return this.showUpdateIndicator=r,o.forEach(e=>{let t=a[e],n=document.createElement(`div`);n.className=`card overflow-hidden`,n.innerHTML=`
                <div class="bg-gray-50 px-4 py-3 border-b">
                    <h3 class="text-lg font-semibold text-gray-800">
                        Grado ${e}
                        <span class="ml-2 text-sm font-normal text-gray-500">
                            (${t.length} estudiante${t.length===1?``:`s`})
                        </span>
                    </h3>
                </div>
                
                <div class="divide-y divide-gray-100">
                    ${t.map(e=>this._renderStudentItem(e,r)).join(``)}
                </div>
            `,i.appendChild(n)}),i.querySelectorAll(`[data-student-id]`).forEach(e=>{let r=()=>{let r=parseInt(e.dataset.studentId),i=t.find(e=>e.id===r);i&&n(i)};e.addEventListener(`click`,r),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),r())})}),i},_renderStudentItem(e,t=!1){let n=e.person||{},r=n.first_name&&n.last_name?`${n.first_name.charAt(0)}${n.last_name.charAt(0)}`:`?`,i=[`bg-blue-500`,`bg-emerald-500`,`bg-violet-500`,`bg-amber-500`,`bg-rose-500`,`bg-cyan-500`,`bg-indigo-500`,`bg-teal-500`],a=i[(e.id||0)%i.length],o=e._updateStatusColor||I(e);return`
            <div 
                class="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                data-student-id="${e.id}"
                tabindex="0"
                role="button"
                aria-label="${n.first_name||``} ${n.last_name||``}, ${e.grade||`sin grado`}"
            >
                ${t?`
                <!-- Indicador semáforo -->
                <div class="flex-shrink-0 mr-3 flex flex-col items-center">
                    <div class="w-3 h-3 rounded-full bg-${o}-500" 
                         title="${o===`green`?`Actualizado`:o===`yellow`?`Por actualizar`:`Desactualizado`}"></div>
                </div>
                `:``}

                <!-- Avatar -->
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 rounded-full ${a} flex items-center justify-center text-white font-bold text-lg">
                        ${r}
                    </div>
                </div>
                
                <!-- Información -->
                <div class="ml-4 flex-grow">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-900">
                                ${n.first_name||``} ${n.last_name||``}
                            </p>
                            <p class="text-sm text-gray-500">
                                ${n.email||``}
                            </p>
                        </div>
                        
                        <div class="text-right">
                            ${n.age?`
                                <p class="text-sm text-gray-500">${n.age} años</p>
                            `:``}
                            <span class="inline-block px-2 py-0.5 rounded text-xs font-medium ${e.status===`Activo`?`bg-green-100 text-green-800`:e.status===`Graduado`?`bg-blue-100 text-blue-800`:`bg-gray-100 text-gray-800`}">
                                ${e.status||`Sin estado`}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Información adicional -->
                    <div class="mt-1 flex items-center gap-4 text-xs text-gray-400">
                        ${n.phone?`
                            <span class="flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                </svg>
                                ${n.phone}
                            </span>
                        `:``}
                        ${e.institution?`
                            <span class="flex items-center">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                </svg>
                                ${e.institution.name}
                            </span>
                        `:``}
                        ${t&&(n.last_update_date||e.last_update_date)?`
                            <span class="flex items-center text-gray-400">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${F(n.last_update_date||e.last_update_date)}
                            </span>
                        `:``}
                    </div>
                </div>
                
                <!-- Flecha -->
                <div class="flex-shrink-0 ml-4">
                    <svg class="w-5 h-5 text-gray-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </div>
            </div>
        `}};function z(...e){let t=r.getUser();return t&&e.includes(t.rol)}function B(){return z(`SUPERADMIN`,`ADMINISTRADOR`)}function V(){return z(`SUPERADMIN`)}function H(e,t){let n=[...e];return t.grade_id&&(n=n.filter(e=>e.grade_id==t.grade_id)),t.gender_id&&(n=n.filter(e=>e.person?.gender_id==t.gender_id)),t.status_id&&(n=n.filter(e=>e.status_id==t.status_id)),t.min_age&&(n=n.filter(e=>e.person?.age>=parseInt(t.min_age))),t.max_age&&(n=n.filter(e=>e.person?.age<=parseInt(t.max_age))),n}var U={render(e={}){return u.render(()=>{let n=document.createElement(`div`);n.className=`max-w-7xl mx-auto`;let i=r.getUser(),a=e.id||i?.institution_id;return a?(n.innerHTML=`
                <section class="relative h-64 w-full overflow-hidden bg-gray-200">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <div class="shimmer w-full h-full"></div>
                    </div>
                </section>
                <section class="flex justify-center -mt-12 mb-6 relative z-10 px-6">
                    <div class="shimmer w-28 h-28 rounded-full"></div>
                </section>
                <section class="px-6 space-y-4">
                    ${j.textLine().outerHTML}
                    ${j.textLine().outerHTML}
                </section>
            `,(async()=>{try{let[e,r,i]=await Promise.all([k(a),y({active:!0,institution_id:a}),oe(a)]),[o,s,c]=await Promise.all([t.getJSON(`api/grades`),t.getJSON(`api/genders`),t.getJSON(`api/statuses`)]);if(n.innerHTML=`
                        <section class="relative h-64 w-full overflow-hidden gradient-barranquilla">
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center">
                                    <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${e.institution_name}</h1>
                                    <p class="text-blue-200">${e.address||``}</p>
                                    ${V()?`
                                    <a data-link href="/instituciones/${e.id}/editar" class="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                        </svg>
                                        Editar institución
                                    </a>
                                    `:``}
                                </div>
                            </div>
                        </section>

                        <section class="flex justify-center -mt-12 mb-6 relative z-10 px-6">
                            <div class="bg-white rounded-full p-2 shadow-lg">
                                <div class="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
                                    <svg class="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                                    </svg>
                                </div>
                            </div>
                        </section>

                        <section class="text-center mb-8 px-6">
                            <p class="text-gray-600"><span class="font-medium">Director:</span> ${e.director}</p>
                            <p class="text-gray-500 text-sm mt-1">${e.neighborhood||``}, ${e.locality||``}</p>
                        </section>

                        <div class="px-6">
                            ${r.length>0?`
                                <section class="mb-10">
                                    <h2 class="text-xl font-bold text-gray-800 mb-4">Campañas Activas</h2>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="inst-campaigns"></div>
                                </section>
                            `:``}

                            <section>
                                <h2 class="text-xl font-bold text-gray-800 mb-4">Estudiantes</h2>
                                <div id="inst-filters"></div>
                                <div id="inst-students"></div>
                            </section>
                        </div>
                    `,r.length>0){let e=n.querySelector(`#inst-campaigns`);r.forEach(t=>e.appendChild(p.render(t)))}let l=n.querySelector(`#inst-filters`),u=n.querySelector(`#inst-students`);l.appendChild(P.render({grades:o,genders:s,statuses:c,onFilter:e=>{let t=H(i,e);u.innerHTML=``,u.appendChild(R.render({students:t})),P.updateCount(l,t.length)}})),u.appendChild(R.render({students:i})),P.updateCount(l,i.length)}catch(e){console.error(e),n.innerHTML=``,n.appendChild(v(`Error al cargar datos`))}})(),n):(n.innerHTML=`<div class="text-center py-20 text-gray-500 px-6">No se encontró institución</div>`,n)})}},W={render(){return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-7xl mx-auto`,e.innerHTML=`
                <div class="space-y-4">
                    ${j.grid(3,`card`).outerHTML}
                </div>
            `,(async()=>{try{let t=await O();e.innerHTML=`
                        <section class="mb-6 content-fade-in">
                            <div class="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl px-6 py-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Instituciones Educativas</h1>
                                    <p id="inst-hero-count" class="text-slate-200/80 mt-1 text-sm" data-count="${t.length}">${t.length} institución${t.length===1?``:`es`} registrada${t.length===1?``:`s`}</p>
                                </div>
                                <a data-link href="/instituciones/crear" class="inline-flex items-center gap-2 bg-white text-slate-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Nueva institución
                                </a>
                            </div>
                        </section>

                        <div class="bg-white rounded-lg shadow-sm p-4 mb-6 content-fade-in">
                            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                    <div class="relative">
                                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                        <input id="inst-search" type="text" placeholder="Nombre, director o código DANE..."
                                            class="w-full sm:min-w-[260px] pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            aria-label="Buscar institución" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="inst-count" class="text-sm text-muted mb-4 content-fade-in" aria-live="polite"></div>

                        <div id="inst-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-fade-in"></div>
                    `;let n=e.querySelector(`#inst-grid`),r=e.querySelector(`#inst-search`),i=e.querySelector(`#inst-count`),a=e=>{if(n.innerHTML=``,e.length===0){n.innerHTML=_.html(`search`,`No se encontraron instituciones con ese criterio de búsqueda.`),i.textContent=`0 instituciones`;return}e.forEach((t,r)=>{let i=this._renderCard(t,r),s=i.querySelector(`[data-toggle-id]`);s&&s.addEventListener(`click`,r=>{r.stopPropagation();let i=t.active===!1?`activar`:`desactivar`;o.show({title:`${i===`desactivar`?`Desactivar`:`Activar`} institución`,message:`¿Estás seguro de ${i} "${t.institution_name}"?${i===`desactivar`?` Los administradores no podrán acceder.`:``}`,confirmText:i===`desactivar`?`Desactivar`:`Activar`,destructive:i===`desactivar`,onConfirm:async()=>{try{let r=await ce(t.id);t.active=r.data.active,N.success(r.message),n.innerHTML=``,a(e)}catch(e){N.error(e.message)}}})}),n.appendChild(i)}),i.textContent=`${e.length} institución${e.length===1?``:`es`}`},s=()=>{let e=(r.value||``).toLowerCase().trim();if(!e){a(t);return}let n=t.filter(t=>t.institution_name.toLowerCase().includes(e)||(t.director||``).toLowerCase().includes(e)||(t.dane_code||``).toLowerCase().includes(e)||(t.neighborhood||``).toLowerCase().includes(e)||(t.locality||``).toLowerCase().includes(e));a(n)},c;r.addEventListener(`input`,()=>{clearTimeout(c),c=setTimeout(s,300)}),a(t)}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar instituciones`))}})(),e})},_renderCard(e,t){let n=document.createElement(`div`);n.className=`card card-hover overflow-hidden flex flex-col stagger-item cursor-pointer`,n.style.animationDelay=`${Math.min(.05*t,.5)}s`,n.setAttribute(`tabindex`,`0`),n.setAttribute(`role`,`button`);let r=(e.institution_name||`?`).charAt(0).toUpperCase(),a=e.active!==!1;return n.innerHTML=`
            <div class="h-2" style="background:${a?`var(--rol-gradient, linear-gradient(135deg, #1D4ED8, #1E3A8A))`:`linear-gradient(135deg, #9CA3AF, #6B7280)`}"></div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-start gap-4 mb-4">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style="${a?`background:var(--rol-primary-light, #DBEAFE)`:`background:#F3F4F6`}">
                        <span class="text-xl font-bold" style="${a?`color:var(--rol-primary, #1D4ED8)`:`color:#9CA3AF`}">${r}</span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-bold ${a?`text-gray-800`:`text-gray-400`} leading-tight mb-1">${e.institution_name}</h3>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge badge-blue text-xs">DANE: ${e.dane_code||`—`}</span>
                            <span class="text-xs text-muted">${e.neighborhood||``}${e.neighborhood&&e.locality?`, `:``}${e.locality||``}</span>
                            <span class="badge ${a?`badge-green`:`badge-gray`} text-xs">${a?`Activa`:`Inactiva`}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-2.5 mb-5 flex-grow">
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>${e.director||`Sin director`}</span>
                    </div>
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        <span>${e.address||`Sin dirección registrada`}</span>
                    </div>
                </div>

                <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"/>
                        </svg>
                        ${e.student_count||0} estudiantes
                    </div>
                    <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                        </svg>
                        ${e.graduate_count||0} egresados
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100 space-y-2">
                    <a data-link href="/institucion/${e.id}" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Ver detalle
                    </a>
                    ${V()?`
                    <button data-toggle-id="${e.id}" class="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${a?`bg-red-50 text-red-600 hover:bg-red-100`:`bg-green-50 text-green-700 hover:bg-green-100`}">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        </svg>
                        ${a?`Desactivar`:`Activar`}
                    </button>
                    `:``}
                </div>
            </div>
        `,n.addEventListener(`click`,t=>{t.target.closest(`a`)||i.navigate(`/institucion/${e.id}`)}),n.addEventListener(`keydown`,t=>{t.target.closest(`a`)||(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),i.navigate(`/institucion/${e.id}`))}),n}},G={async render(e={}){let{id:n}=e;return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-3xl mx-auto`;let r=!!n;e.innerHTML=`
                <div class="content-fade-in">
                    <a data-link href="/instituciones" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a instituciones
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">${r?`Editar Institución`:`Nueva Institución`}</h1>

                    <form id="inst-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <div>
                                <label for="inst-name" class="block text-sm font-medium text-gray-700 mb-1">Nombre de la institución *</label>
                                <input id="inst-name" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre oficial de la institución" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-name-error"></p>
                            </div>

                            <div>
                                <label for="inst-director" class="block text-sm font-medium text-gray-700 mb-1">Director *</label>
                                <input id="inst-director" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre del director" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-director-error"></p>
                            </div>

                            <div>
                                <label for="inst-dane" class="block text-sm font-medium text-gray-700 mb-1">Código DANE *</label>
                                <input id="inst-dane" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Código DANE de la institución" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-dane-error"></p>
                            </div>

                            <div>
                                <label for="inst-address" class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input id="inst-address" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Dirección física" />
                            </div>

                            <div>
                                <label for="inst-neighborhood" class="block text-sm font-medium text-gray-700 mb-1">Barrio *</label>
                                <select id="inst-neighborhood" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar barrio...</option>
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="inst-neighborhood-error"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/instituciones" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="inst-submit">
                                ${r?`Guardar cambios`:`Crear institución`}
                            </button>
                        </div>
                    </form>
                </div>
            `;let a=!1,o=null;return(async()=>{try{let n=await t.getJSON(`api/neighborhoods`),r=e.querySelector(`#inst-neighborhood`);n.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.name,r.appendChild(t)}),a=!0,o!==null&&(r.value=o,o=null)}catch(e){console.error(`Error loading neighborhoods:`,e)}})(),r&&(async()=>{try{let t=await k(n);e.querySelector(`#inst-name`).value=t.institution_name||``,e.querySelector(`#inst-director`).value=t.director||``,e.querySelector(`#inst-dane`).value=t.dane_code||``,e.querySelector(`#inst-address`).value=t.address||``,o=t.neighborhood_id||``,a&&(e.querySelector(`#inst-neighborhood`).value=o,o=null)}catch(e){N.error(`Error al cargar institución: `+e.message)}})(),e.querySelector(`#inst-form`).addEventListener(`submit`,async t=>{t.preventDefault();let a=e.querySelector(`#inst-name`).value.trim(),o=e.querySelector(`#inst-director`).value.trim(),s=e.querySelector(`#inst-dane`).value.trim(),c=e.querySelector(`#inst-neighborhood`).value,l=e.querySelector(`#inst-address`).value.trim(),u=!0,d=(t,n)=>{let r=e.querySelector(t);r&&(r.classList.remove(`hidden`),r.textContent=n),u=!1},f=t=>{let n=e.querySelector(t);n&&n.classList.add(`hidden`)};if(f(`#inst-name-error`),f(`#inst-director-error`),f(`#inst-dane-error`),f(`#inst-neighborhood-error`),a||d(`#inst-name-error`,`El nombre es obligatorio`),o||d(`#inst-director-error`,`El director es obligatorio`),s||d(`#inst-dane-error`,`El código DANE es obligatorio`),c||d(`#inst-neighborhood-error`,`Selecciona un barrio`),!u)return;let p=e.querySelector(`#inst-submit`);p.disabled=!0,p.innerHTML=`<span class="spinner"></span> Guardando...`;let m={institution_name:a,director:o,dane_code:s,address:l,neighborhood_id:c};try{r?(await se(n,m),N.success(`Institución actualizada exitosamente`),i.navigate(`/instituciones`)):(await A(m),N.success(`Institución creada exitosamente`),i.navigate(`/instituciones`))}catch(e){N.error(e.message),p.disabled=!1,p.textContent=r?`Guardar cambios`:`Crear institución`}}),e})}},K=null,fe={render(){return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-3xl mx-auto`,e.innerHTML=`
                <div class="content-fade-in">
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">Crear Administrador</h1>

                    <form id="admin-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <div>
                                <label for="adm-username" class="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario *</label>
                                <input id="adm-username" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Usuario para iniciar sesión" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-username-error"></p>
                            </div>

                            <div>
                                <label for="adm-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                <input id="adm-password" type="password" required minlength="6"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Mínimo 6 caracteres" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-password-error"></p>
                            </div>

                            <div>
                                <label for="adm-confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                                <input id="adm-confirm-password" type="password" required minlength="6"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Repite la contraseña" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-confirm-password-error"></p>
                            </div>

                            <div>
                                <label for="adm-institution" class="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
                                <select id="adm-institution" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar institución...</option>
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="adm-institution-error"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <button type="button" onclick="window.history.back()" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
                            <button type="submit" class="btn-primary px-6" id="adm-submit">Crear administrador</button>
                        </div>
                    </form>
                </div>
            `,(async()=>{try{let e=(await t.getJSON(`api/user-roles`)).find(e=>e.name===`ADMINISTRADOR`);e&&(K=e.id)}catch(e){console.error(`Error loading roles:`,e)}})(),(async()=>{try{let t=await O(),n=e.querySelector(`#adm-institution`);t.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.institution_name,n.appendChild(t)})}catch(e){console.error(`Error loading institutions:`,e)}})(),e.querySelector(`#admin-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=e.querySelector(`#adm-username`).value.trim(),a=e.querySelector(`#adm-password`).value,o=e.querySelector(`#adm-confirm-password`).value,s=e.querySelector(`#adm-institution`).value,c=!0,l=(t,n)=>{let r=e.querySelector(t);r&&(r.classList.remove(`hidden`),r.textContent=n),c=!1},u=t=>{let n=e.querySelector(t);n&&n.classList.add(`hidden`)};if(u(`#adm-username-error`),u(`#adm-password-error`),u(`#adm-confirm-password-error`),u(`#adm-institution-error`),r||l(`#adm-username-error`,`El usuario es obligatorio`),(!a||a.length<6)&&l(`#adm-password-error`,`La contraseña debe tener al menos 6 caracteres`),a!==o&&l(`#adm-confirm-password-error`,`Las contraseñas no coinciden`),s||l(`#adm-institution-error`,`Selecciona una institución`),!c)return;let d=e.querySelector(`#adm-submit`);d.disabled=!0,d.innerHTML=`<span class="spinner"></span> Creando...`;try{await(await t.post(`api/credentials`,{username:r,password:a,role_id:K||2,institution_id:parseInt(s)})).json(),N.success(`Administrador creado exitosamente`),i.navigate(`/instituciones`)}catch(e){N.error(e.message),d.disabled=!1,d.textContent=`Crear administrador`}}),e})}},pe={render(){return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-7xl mx-auto`,e.appendChild(j.grid(3)),(async()=>{try{let t=r.getUser(),n=await y(),a=n;t?.rol===`ADMINISTRADOR`&&t?.institution_id&&(a=n.filter(e=>e.scope?.some(e=>e.scope_type===`GLOBAL`)||e.scope?.some(e=>e.scope_type===`INSTITUTION`&&parseInt(e.institution_id)===t.institution_id)));let o=[...new Set(a.map(e=>e.type).filter(Boolean))];e.innerHTML=`
                        <section class="mb-6 content-fade-in">
                            <div class="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl px-6 py-5 shadow-md flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 class="text-2xl font-bold text-white">Campañas</h1>
                                    <p class="text-slate-200/80 mt-1 text-sm">Explora y gestiona todas las campañas disponibles</p>
                                </div>
                                <a data-link href="/campanas/crear" class="inline-flex items-center gap-2 bg-white text-slate-800 font-medium text-sm px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                    </svg>
                                    Nueva campaña
                                </a>
                            </div>
                        </section>

                        <div class="bg-white rounded-lg shadow-sm p-4 mb-6 content-fade-in">
                            <div class="flex flex-wrap items-end gap-4 max-sm:flex-col max-sm:gap-3">
                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                    <input id="cam-search" type="text" placeholder="Nombre de la campaña..."
                                        class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        aria-label="Buscar campañas por nombre" />
                                </div>

                                <div class="flex flex-col max-sm:w-full">
                                    <label class="text-sm font-medium text-gray-700 mb-1">Estado</label>
                                    <select id="cam-status-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por estado">
                                        <option value="">Todos los estados</option>
                                        <option value="active">Vigentes</option>
                                        <option value="upcoming">Próximas</option>
                                        <option value="finished">Finalizadas</option>
                                    </select>
                                </div>

                                ${o.length>0?`
                                    <div class="flex flex-col max-sm:w-full">
                                        <label class="text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select id="cam-type-filter" class="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white" aria-label="Filtrar por tipo">
                                            <option value="">Todos los tipos</option>
                                            ${o.map(e=>`<option value="${e}">${e}</option>`).join(``)}
                                        </select>
                                    </div>
                                `:``}
                            </div>
                        </div>

                        <div id="cam-count" class="text-sm text-muted mb-4 content-fade-in" aria-live="polite"></div>

                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="cam-grid"></div>
                    `;let s=()=>{let t=(e.querySelector(`#cam-search`).value||``).toLowerCase(),n=e.querySelector(`#cam-status-filter`).value,r=e.querySelector(`#cam-type-filter`)?.value||``,o=[...a];t&&(o=o.filter(e=>(e.title||``).toLowerCase().includes(t))),n&&(o=o.filter(e=>L(e).status===n)),r&&(o=o.filter(e=>e.type===r));let s=e.querySelector(`#cam-grid`);s.innerHTML=``,o.length===0?s.innerHTML=_.html(`search`,`No se encontraron campañas con los filtros seleccionados.`):o.forEach(e=>{let t=p.render(e);t.classList.add(`stagger-item`,`cursor-pointer`),t.addEventListener(`click`,t=>{t.target.closest(`button, a, input, select`)||i.navigate(`/campanas/${e.id}`)}),t.addEventListener(`keydown`,t=>{if(t.key===`Enter`||t.key===` `){if(t.preventDefault(),t.target.closest(`button, a, input, select`))return;i.navigate(`/campanas/${e.id}`)}}),s.appendChild(t)}),e.querySelector(`#cam-count`).textContent=`${o.length} campaña${o.length===1?``:`s`}`};e.querySelector(`#cam-search`).addEventListener(`input`,s),e.querySelector(`#cam-status-filter`).addEventListener(`change`,s);let c=e.querySelector(`#cam-type-filter`);c&&c.addEventListener(`change`,s),s()}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar campañas`))}})(),e})}},me={academico:`badge-blue`,cultural:`badge-yellow`,deportivo:`badge-green`,tecnologia:`badge-blue`,salud:`badge-red`,medio_ambiente:`badge-green`,artes:`badge-yellow`},he={async render(e={}){let{id:n}=e;return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-5xl mx-auto`,e.appendChild(j.custom(`
                <div class="h-8 w-48 bg-gray-200 rounded mb-4 shimmer"></div>
                <div class="h-6 w-64 bg-gray-200 rounded mb-6 shimmer"></div>
                <div class="h-40 bg-gray-200 rounded-xl mb-6 shimmer"></div>
                <div class="h-8 w-32 bg-gray-200 rounded mb-4 shimmer"></div>
                <div class="h-32 bg-gray-200 rounded-xl shimmer"></div>
            `)),(async()=>{try{let[a,s]=await Promise.all([C(n),t.get(`api/campaigns/${n}/progress`).then(e=>e.json()).catch(()=>null)]);r.getUser();let c=B(),l=L(a),u=l.label,d=l.color,f=me[(a.type||``).toLowerCase().replace(/\s+/g,`_`)]||`badge-blue`;e.innerHTML=`
                        <div class="content-fade-in">
                            <a data-link href="/campanas" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                &larr; Volver a campañas
                            </a>

                            <div class="card overflow-hidden mb-6">
                                ${a.url_multimedia?`
                                    <div class="h-48 sm:h-64 overflow-hidden">
                                        <img src="${a.url_multimedia.startsWith(`http`)?a.url_multimedia:`https://`+a.url_multimedia}" alt="${a.title}" class="w-full h-full object-cover" />
                                    </div>
                                `:`
                                    <div class="h-48 sm:h-64 gradient-barranquilla flex items-center justify-center">
                                        <svg class="w-20 h-20 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                        </svg>
                                    </div>
                                `}

                                <div class="p-6 space-y-6">
                                    <div class="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="badge ${d}">${u}</span>
                                                <span class="badge ${f}">${a.type||`General`}</span>
                                            </div>
                                            <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">${a.title}</h1>
                                            ${a.sponsor?`
                                                <p class="text-muted mt-1">Patrocinado por ${a.sponsor}</p>
                                            `:``}
                                        </div>

                                        ${c?`
                                            <div class="flex items-center gap-2">
                                                <a data-link href="/campanas/${n}/editar" class="btn-secondary text-sm px-4 py-2">
                                                    Editar
                                                </a>
                                                <button id="btn-delete-campaign" class="px-4 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                                    Eliminar
                                                </button>
                                            </div>
                                        `:``}
                                    </div>

                                    <p class="text-gray-600 leading-relaxed">${a.description||`Sin descripción`}</p>

                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Inicio</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${F(a.start_date)}</p>
                                        </div>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Fin</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${F(a.end_date)}</p>
                                        </div>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            <p class="text-xs text-gray-500 uppercase tracking-wide">Inscritos</p>
                                            <p class="text-sm font-semibold text-gray-800 mt-1">${a.enrollment_count||0} estudiantes</p>
                                        </div>
                                    </div>

                                    ${a.scope&&a.scope.length>0?`
                                        <div>
                                            <h3 class="text-sm font-semibold text-gray-700 mb-2">Alcance</h3>
                                            <div class="flex flex-wrap gap-2">
                                                ${a.scope.map(e=>`
                                                    <span class="badge badge-blue">${e.scope_type===`GLOBAL`?`Global`:e.scope_type===`INSTITUTION`?`Por institución`:e.scope_type===`LOCALITY`?`Por localidad`:`Por barrio`}</span>
                                                `).join(``)}
                                            </div>
                                        </div>
                                    `:``}

                                    ${a.pinned?`
                                        <div class="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg px-4 py-2">
                                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/>
                                            </svg>
                                            Campaña fijada
                                        </div>
                                    `:``}
                                </div>
                            </div>

                            ${s&&s.total_enrolled>0?`
                                <div class="card p-6 mb-6">
                                    <h2 class="text-lg font-semibold text-gray-800 mb-4">Progreso de la Campaña</h2>
                                    <div class="grid grid-cols-3 gap-4 mb-6">
                                        <div class="text-center p-4 bg-blue-50 rounded-xl">
                                            <p class="text-2xl font-bold text-blue-700">${s.total_enrolled}</p>
                                            <p class="text-xs text-blue-600 mt-1">Inscritos</p>
                                        </div>
                                        <div class="text-center p-4 bg-green-50 rounded-xl">
                                            <p class="text-2xl font-bold text-green-700">${s.updated_count}</p>
                                            <p class="text-xs text-green-600 mt-1">Actualizados</p>
                                        </div>
                                        <div class="text-center p-4 bg-red-50 rounded-xl">
                                            <p class="text-2xl font-bold text-red-700">${s.pending_count}</p>
                                            <p class="text-xs text-red-600 mt-1">Pendientes</p>
                                        </div>
                                    </div>
                                    <div class="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                                        <div class="h-full bg-green-500 rounded-full transition-all duration-700"
                                            style="width:${s.update_percentage}%">
                                        </div>
                                        <span class="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                                            ${s.update_percentage}% completado
                                        </span>
                                    </div>
                                </div>
                            `:``}

                            <div class="card p-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">
                                    Estudiantes inscritos (${a.students?.length||0})
                                </h2>

                                ${!a.students||a.students.length===0?`
                                    ${_.html(`students`,`Aún no hay estudiantes inscritos en esta campaña.`)}
                                `:`
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead>
                                                <tr class="border-b border-gray-100 text-left text-gray-500">
                                                    <th class="pb-3 font-medium">Estudiante</th>
                                                    <th class="pb-3 font-medium">Estado</th>
                                                    <th class="pb-3 font-medium">Fecha de inscripción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${a.students.map(e=>{let t=s?.students?.find(t=>t.id===e.id)?.has_updated;return`
                                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td class="py-3">
                                                            <span class="font-medium text-gray-800">
                                                                ${e.person?`${e.person.first_name} ${e.person.last_name}`:`Desconocido`}
                                                            </span>
                                                        </td>
                                                        <td class="py-3">
                                                            <span class="inline-flex items-center gap-1 text-xs font-medium ${t?`text-green-700`:`text-yellow-700`}">
                                                                <span class="w-2 h-2 rounded-full ${t?`bg-green-500`:`bg-yellow-400`}"></span>
                                                                ${t?`Actualizado`:`Pendiente`}
                                                            </span>
                                                        </td>
                                                        <td class="py-3 text-gray-500">${F(e.enrolled_at)}</td>
                                                    </tr>`}).join(``)}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    `;let p=e.querySelector(`#btn-delete-campaign`);p&&p.addEventListener(`click`,()=>{o.show({title:`Eliminar campaña`,message:`¿Estás seguro de eliminar "${a.title}"? Esta acción no se puede deshacer.`,confirmText:`Eliminar`,cancelText:`Cancelar`,destructive:!0,onConfirm:async()=>{try{await te(a.id),N.success(`Campaña eliminada`),i.navigate(`/campanas`)}catch(e){N.error(e.message)}}})})}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar la campaña`))}})(),e})}},ge=[`academico`,`cultural`,`deportivo`,`tecnologia`,`salud`,`medio_ambiente`,`artes`];function _e(){return r.getUser()?.rol===`SUPERADMIN`?[{value:`all`,label:`Todos`},{value:`graduates`,label:`Egresados`}]:[{value:`students`,label:`Estudiantes`},{value:`graduates`,label:`Egresados`},{value:`all`,label:`Ambos`}]}var q={async render(e={}){let{id:t}=e;return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-3xl mx-auto`;let n=!!t;e.innerHTML=`
                <div class="content-fade-in">
                    <a data-link href="/campanas" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a campañas
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">${n?`Editar Campaña`:`Crear Campaña`}</h1>

                    <form id="campaign-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información general</h2>

                            <div>
                                <label for="cam-title" class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                                <input id="cam-title" type="text" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Nombre de la campaña" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-title-error"></p>
                            </div>

                            <div>
                                <label for="cam-type" class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select id="cam-type" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="">Seleccionar tipo...</option>
                                    ${ge.map(e=>`<option value="${e}">${e.charAt(0).toUpperCase()+e.slice(1).replace(/_/g,` `)}</option>`).join(``)}
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-type-error"></p>
                            </div>

                            <div>
                                <label for="cam-desc" class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <textarea id="cam-desc" rows="4"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                                    placeholder="Describe el objetivo y alcance de la campaña"></textarea>
                            </div>

                            <div>
                                <label for="cam-sponsor" class="block text-sm font-medium text-gray-700 mb-1">Patrocinador</label>
                                <input id="cam-sponsor" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Entidad o persona que patrocina" />
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Fechas</h2>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label for="cam-start" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio *</label>
                                    <input id="cam-start" type="date" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="cam-start-error"></p>
                                </div>
                                <div>
                                    <label for="cam-end" class="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
                                    <input id="cam-end" type="date"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Alcance y criterios</h2>

                            <div>
                                <label for="cam-target" class="block text-sm font-medium text-gray-700 mb-1">Población objetivo *</label>
                                <select id="cam-target" required
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    ${_e().map(e=>`<option value="${e.value}">${e.label}</option>`).join(``)}
                                </select>
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-target-error"></p>
                            </div>

                            <div>
                                <label class="flex items-center gap-2">
                                    <input id="cam-pinned" type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <span class="text-sm text-gray-700">Fijar campaña (mostrar al inicio)</span>
                                </label>
                            </div>

                            <div>
                                <label for="cam-url" class="block text-sm font-medium text-gray-700 mb-1">URL de imagen</label>
                                <input id="cam-url" type="url"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="https://ejemplo.com/imagen.jpg" />
                                <p class="text-xs text-red-500 mt-1 hidden" id="cam-url-error"></p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/campanas" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="cam-submit">
                                ${n?`Guardar cambios`:`Crear campaña`}
                            </button>
                        </div>
                    </form>
                </div>
            `,n&&(async()=>{try{let n=await C(t);e.querySelector(`#cam-title`).value=n.title||``,e.querySelector(`#cam-type`).value=n.type||``,e.querySelector(`#cam-desc`).value=n.description||``,e.querySelector(`#cam-sponsor`).value=n.sponsor||``,e.querySelector(`#cam-start`).value=n.start_date||``,e.querySelector(`#cam-end`).value=n.end_date||``,e.querySelector(`#cam-url`).value=n.url_multimedia||``,e.querySelector(`#cam-pinned`).checked=n.pinned===!0,e.querySelector(`#cam-target`).value=n.target_population||`all`}catch(e){N.error(`Error al cargar la campaña: `+e.message)}})();let r=e.querySelector(`#campaign-form`),a=e.querySelector(`#cam-submit`);return r.addEventListener(`submit`,async r=>{r.preventDefault();let o=e.querySelector(`#cam-title`).value.trim(),s=e.querySelector(`#cam-type`).value,c=e.querySelector(`#cam-start`).value,l=!0,u=(t,n)=>{let r=e.querySelector(t);r&&(r.classList.remove(`hidden`),r.textContent=n),l=!1},d=t=>{let n=e.querySelector(t);n&&n.classList.add(`hidden`)};d(`#cam-title-error`),d(`#cam-type-error`),d(`#cam-start-error`),d(`#cam-target-error`),d(`#cam-url-error`);let f=e.querySelector(`#cam-url`).value.trim();f&&!f.match(/^https?:\/\/.+/)&&u(`#cam-url-error`,`Ingresa una URL válida (ej. https://ejemplo.com/imagen.jpg)`);let p=e.querySelector(`#cam-end`).value;if(p&&c&&p<c&&u(`#cam-start-error`,`La fecha de inicio no puede ser después de la fecha de fin`),o||u(`#cam-title-error`,`El título es obligatorio`),s||u(`#cam-type-error`,`Selecciona un tipo`),c||u(`#cam-start-error`,`La fecha de inicio es obligatoria`),e.querySelector(`#cam-target`).value||u(`#cam-target-error`,`Selecciona la población objetivo`),!l)return;a.disabled=!0,a.innerHTML=`<span class="spinner"></span> Guardando...`;let m={title:o,type:s,description:e.querySelector(`#cam-desc`).value.trim(),sponsor:e.querySelector(`#cam-sponsor`).value.trim(),start_date:c,end_date:e.querySelector(`#cam-end`).value||null,url_multimedia:e.querySelector(`#cam-url`).value.trim()||null,pinned:e.querySelector(`#cam-pinned`).checked,target_population:e.querySelector(`#cam-target`).value};try{n?(await ee(t,m),N.success(`Campaña actualizada exitosamente`),i.navigate(`/campanas`)):(await w(m),N.success(`Campaña creada exitosamente`),i.navigate(`/campanas`))}catch(e){N.error(e.message),a.disabled=!1,a.textContent=n?`Guardar cambios`:`Crear campaña`}}),e})}},J=new Map,ve=300*1e3;async function Y(e,t,n=ve){let r=J.get(e);if(r&&Date.now()-r.timestamp<n)return r.data;let i=await t();return J.set(e,{data:i,timestamp:Date.now()}),i}var ye={render(){return u.render(()=>{let e=document.createElement(`div`);if(e.className=`px-6 py-8 max-w-7xl mx-auto`,!z(`SUPERADMIN`,`ADMINISTRADOR`))return e.innerHTML=`
                    <div class="flex flex-col items-center justify-center py-20 text-center content-fade-in">
                        <svg class="w-16 h-16 text-gray-300 mb-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <p class="text-gray-500">No tienes permisos para ver esta sección</p>
                    </div>
                `,e;let n=document.createElement(`div`);n.className=`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`;for(let e=0;e<6;e++)n.appendChild(j.card());return e.appendChild(n),(async()=>{try{let n=await ne({institution_id:r.getUser()?.institution_id}),[i,a,o]=await Promise.all([Y(`grades`,()=>t.getJSON(`api/grades`)),Y(`genders`,()=>t.getJSON(`api/genders`)),Y(`statuses`,()=>t.getJSON(`api/statuses`))]),s=new Date;s.setDate(s.getDate()-30);let c=new Date;c.setDate(c.getDate()-90);let l=n.filter(e=>{let t=e.last_update_date||e.person?.last_update_date;return t&&new Date(t)>=s}).length,u=n.filter(e=>{let t=e.last_update_date||e.person?.last_update_date;return t&&new Date(t)>=c&&new Date(t)<s}).length,d=n.filter(e=>{let t=e.last_update_date||e.person?.last_update_date;return!t||new Date(t)<c}).length;e.innerHTML=`
                        <section class="mb-8 content-fade-in">
                            <div class="gradient-barranquilla rounded-2xl p-8 relative overflow-hidden">
                                <div class="hero-shape hero-shape-1"></div>
                                <div class="hero-shape hero-shape-2"></div>
                                <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <div class="flex items-center gap-3 mb-2">
                                            <span class="badge bg-white/20 text-white border border-white/20">Estudiantes</span>
                                            <span class="text-white/60 text-sm" id="hero-count">${n.length} estudiante${n.length===1?``:`s`}</span>
                                        </div>
                                        <h1 class="text-3xl font-bold text-white">Estudiantes</h1>
                                        <p class="text-white/80 mt-1">${z(`SUPERADMIN`)?`Todos los estudiantes del sistema`:`Estudiantes de tu institución`}</p>
                                    </div>
                                    <a data-link href="/estudiantes/crear" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition shadow-lg flex-shrink-0">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                        </svg>
                                        Nuevo estudiante
                                    </a>
                                </div>
                            </div>
                        </section>

                        <div class="flex flex-wrap items-center gap-3 mb-6 content-fade-in">
                            <div class="relative flex-grow max-w-xs">
                                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                <input id="est-search" type="text" placeholder="Buscar por nombre o documento..."
                                    class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    aria-label="Buscar estudiantes" />
                            </div>
                            <select id="est-update-filter"
                                class="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                aria-label="Filtrar por estado de actualización">
                                <option value="">Todos</option>
                                <option value="updated">Actualizados</option>
                                <option value="pending">Pendientes</option>
                            </select>
                        </div>

                        <div id="est-filters" class="content-fade-in mb-4"></div>

                        <div class="flex flex-wrap gap-3 mb-4 text-xs content-fade-in">
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"></span> ${l} actualizados</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> ${u} por actualizar</span>
                            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> ${d} desactualizados</span>
                            <span id="est-count" class="text-muted ml-auto" aria-live="polite"></span>
                        </div>

                        <div id="est-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 content-fade-in"></div>
                        <div id="est-pagination" class="mt-8 content-fade-in"></div>
                    `;let f=e.querySelector(`#est-filters`),p=e.querySelector(`#est-grid`),m=e.querySelector(`#est-search`),h=e.querySelector(`#est-count`),g=1,v=[],y=null,b=()=>{let e=Math.max(1,Math.ceil(v.length/9)),t=document.getElementById(`est-pagination`);if(!t||(t.innerHTML=``,e<=1))return;let n=document.createElement(`div`);n.className=`flex items-center justify-center gap-2`;let r=document.createElement(`button`);r.className=`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 `+(g===1?`text-gray-300 cursor-not-allowed`:`text-gray-700 hover:bg-gray-100`),r.disabled=g===1,r.innerHTML=`<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg> Anterior`,r.addEventListener(`click`,()=>{g>1&&(g--,x(),b(),window.scrollTo({top:0,behavior:`smooth`}))}),n.appendChild(r);let i=[];for(let t=1;t<=e;t++)t===1||t===e||t>=g-1&&t<=g+1?i.push(t):i[i.length-1]!==-1&&i.push(-1);i.forEach(e=>{if(e===-1){let e=document.createElement(`span`);e.className=`px-1 text-gray-400 text-sm`,e.textContent=`...`,n.appendChild(e)}else{let t=document.createElement(`button`);t.className=`w-9 h-9 rounded-lg text-sm font-medium transition inline-flex items-center justify-center `+(e===g?`text-white`:`text-gray-600 hover:bg-gray-100`),e===g&&(t.style.background=`var(--rol-primary, #475569)`),t.textContent=e,t.addEventListener(`click`,()=>{g=e,x(),b(),window.scrollTo({top:0,behavior:`smooth`})}),n.appendChild(t)}});let a=document.createElement(`button`);a.className=`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 `+(g===e?`text-gray-300 cursor-not-allowed`:`text-gray-700 hover:bg-gray-100`),a.disabled=g===e,a.innerHTML=`Siguiente <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>`,a.addEventListener(`click`,()=>{g<e&&(g++,x(),b(),window.scrollTo({top:0,behavior:`smooth`}))}),n.appendChild(a),t.appendChild(n)},x=()=>{if(p.innerHTML=``,v.length===0){p.innerHTML=_.html(`search`,`No se encontraron estudiantes con los filtros seleccionados.`),h.textContent=`0 estudiantes`,document.getElementById(`est-pagination`).innerHTML=``;return}let e=(g-1)*9;v.slice(e,e+9).forEach((t,n)=>{p.appendChild(this._renderCard(t,e+n,I(t)))}),h.textContent=`${v.length} estudiante${v.length===1?``:`s`}`,P.updateCount(f,v.length),b()},S=()=>{g=1;let t=n,r=m.value.trim().toLowerCase();r&&(t=t.filter(e=>{let t=`${e.person?.first_name||``} ${e.person?.last_name||``}`.toLowerCase(),n=e.person?.document_number||``;return t.includes(r)||n.includes(r)})),y!==void 0&&y&&(t=H(t,y));let i=e.querySelector(`#est-update-filter`)?.value;if(i){let e=new Date;e.setDate(e.getDate()-30),t=t.filter(t=>{let n=t.last_update_date||t.person?.last_update_date,r=n&&new Date(n)>=e;return i===`updated`?r:!r})}v=t,x();let a=e.querySelector(`#hero-count`);a&&(a.textContent=`${n.length} estudiante${n.length===1?``:`s`}`)},C;m.addEventListener(`input`,()=>{clearTimeout(C),C=setTimeout(S,300)});let w=e.querySelector(`#est-update-filter`);w&&w.addEventListener(`change`,S),f.appendChild(P.render({grades:i,genders:a,statuses:o,onFilter:e=>{y=e,S()}})),v=n,x()}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar estudiantes`))}})(),e})},_renderCard(e,t,n){let r=document.createElement(`div`);r.className=`card card-hover overflow-hidden flex flex-col stagger-item cursor-pointer`,r.style.animationDelay=`${Math.min(.05*t,.5)}s`,r.setAttribute(`tabindex`,`0`),r.setAttribute(`role`,`button`);let a=e.person||{},o=`${a.first_name||``} ${a.last_name||``}`.trim()||`Sin nombre`,s=(a.first_name||`?`).charAt(0).toUpperCase(),c=e.status===`Activo`?`badge-green`:e.status===`Graduado`?`badge-blue`:`badge-gray`,l=n===`green`?`Actualizado`:n===`yellow`?`Por vencer`:`Desactualizado`,u=()=>{let t=a.id||e.people_id;t&&i.navigate(`/estudiante/${t}`)};return r.innerHTML=`
            <div class="h-2" style="background:var(--rol-gradient, linear-gradient(135deg, #1D4ED8, #1E3A8A))"></div>
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-start gap-4 mb-4">
                    <div class="relative flex-shrink-0">
                        <div class="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm" style="background:var(--rol-primary-light, #DBEAFE)">
                            <span class="text-xl font-bold" style="color:var(--rol-primary, #1D4ED8)">${s}</span>
                        </div>
                        <span class="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${n===`green`?`bg-green-500`:n===`yellow`?`bg-yellow-500`:`bg-red-500`}"></span>
                    </div>
                    <div class="flex-grow min-w-0">
                        <h3 class="text-lg font-bold text-gray-800 leading-tight mb-1 truncate">${o}</h3>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="badge ${c} text-xs">${e.status||`—`}</span>
                            <span class="text-xs text-muted">${e.grade||`—`}</span>
                        </div>
                    </div>
                </div>

                <div class="space-y-2.5 mb-5 flex-grow">
                    ${a.document_number?`
                        <div class="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0"/>
                            </svg>
                            <span>${a.document_number}${a.document_type?` (${a.document_type})`:``}</span>
                        </div>
                    `:``}
                    <div class="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <span>${a.email||`Sin email`}</span>
                    </div>
                    ${e.institution?.name?`
                        <div class="flex items-center gap-2.5 text-sm text-gray-600">
                            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                            </svg>
                            <span class="truncate">${e.institution.name}</span>
                        </div>
                    `:``}
                </div>

                <div class="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                        ${n===`green`?`bg-green-50 text-green-700`:n===`yellow`?`bg-yellow-50 text-yellow-700`:`bg-red-50 text-red-700`}">
                        <span class="w-2 h-2 rounded-full ${n===`green`?`bg-green-500`:n===`yellow`?`bg-yellow-500`:`bg-red-500`}"></span>
                        ${l}
                    </span>
                    ${a.age?`<span class="text-xs text-muted">${a.age} años</span>`:``}
                    <span class="text-xs text-muted ml-auto">${e.gender||``}</span>
                </div>

                <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <a data-link href="/estudiante/${a.id||e.people_id}" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition" style="background:var(--rol-primary-light, #DBEAFE);color:var(--rol-primary, #1D4ED8)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        Ver perfil
                    </a>
                    <a data-link href="/estudiante/${a.id||e.people_id}/editar" class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Editar
                    </a>
                </div>
            </div>
        `,r.addEventListener(`click`,e=>{e.target.closest(`button, a`)||u()}),r.addEventListener(`keydown`,e=>{e.target.closest(`button, a`)||(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),u())}),r}},X={async render(e={}){let{id:n}=e;return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-5xl mx-auto`,e.appendChild(j.custom(`
                <div class="flex gap-6 mb-6">
                    <div class="w-24 h-24 rounded-full bg-gray-200 shimmer"></div>
                    <div class="flex-1 space-y-3">
                        <div class="h-6 w-48 bg-gray-200 rounded shimmer"></div>
                        <div class="h-4 w-32 bg-gray-200 rounded shimmer"></div>
                        <div class="h-4 w-64 bg-gray-200 rounded shimmer"></div>
                    </div>
                </div>
                <div class="h-40 bg-gray-200 rounded-xl shimmer mb-6"></div>
                <div class="h-32 bg-gray-200 rounded-xl shimmer"></div>
            `)),(async()=>{try{let i=await E(n),a=[];try{a=await y({person_id:n})}catch{}let[o,s,c,l,u]=await Promise.all([t.getJSON(`api/grades`).catch(()=>[]),t.getJSON(`api/genders`).catch(()=>[]),t.getJSON(`api/statuses`).catch(()=>[]),t.getJSON(`api/document-types`).catch(()=>[]),t.getJSON(`api/neighborhoods`).catch(()=>[])]);r.getUser();let d=B(),f=window.location.pathname.endsWith(`/editar`),p=i.first_name&&i.last_name?`${i.first_name.charAt(0)}${i.last_name.charAt(0)}`:`?`,m=[`bg-blue-500`,`bg-emerald-500`,`bg-violet-500`,`bg-amber-500`,`bg-rose-500`,`bg-cyan-500`,`bg-indigo-500`,`bg-teal-500`],h=m[(i.id||0)%m.length],g=i.last_update_date,v=de(g),b=i.student_profile||{};if(f&&d){e.innerHTML=`
                            <div class="content-fade-in">
                                <a data-link href="/estudiante/${n}" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                    &larr; Volver al perfil
                                </a>

                                <div class="card p-6 mb-6">
                                    <h2 class="text-lg font-semibold text-gray-800 mb-4">Editar Estudiante</h2>
                                    <form id="edit-student-form" class="space-y-5" novalidate>
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                                                <input id="edit-first_name" type="text" value="${i.first_name||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                                                <input id="edit-last_name" type="text" value="${i.last_name||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <input id="edit-email" type="email" value="${i.email||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                                <input id="edit-phone" type="text" value="${i.phone||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo documento</label>
                                                <select id="edit-document_type_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${l.map(e=>`<option value="${e.id}" ${i.document_type_id===e.id?`selected`:``}>${e.name}</option>`).join(``)}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Núm. documento</label>
                                                <input id="edit-document_number" type="text" value="${i.document_number||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Género</label>
                                                <select id="edit-gender_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${s.map(e=>`<option value="${e.id}" ${i.gender_id===e.id?`selected`:``}>${e.name}</option>`).join(``)}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha nacimiento</label>
                                                <input id="edit-birth_date" type="date" value="${i.birth_date||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Barrio</label>
                                                <select id="edit-neighborhood_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                    ${u.map(e=>`<option value="${e.id}" ${i.neighborhood_id===e.id?`selected`:``}>${e.name}</option>`).join(``)}
                                                </select>
                                            </div>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                                <input id="edit-address" type="text" value="${i.address||``}"
                                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                            </div>
                                        </div>

                                        <div class="border-t border-gray-100 pt-5">
                                            <h3 class="text-md font-semibold text-gray-700 mb-3">Información académica</h3>
                                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-1">Grado</label>
                                                    <select id="edit-grade_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                        ${o.map(e=>`<option value="${e.id}" ${b.grade_id===e.id?`selected`:``}>${e.grade}</option>`).join(``)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                                    <select id="edit-status_id" class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                                        ${c.map(e=>`<option value="${e.id}" ${b.status_id===e.id?`selected`:``}>${e.status}</option>`).join(``)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="edit-message" class="hidden rounded-lg p-4 text-sm" role="alert"></div>

                                        <div class="flex justify-end gap-3">
                                            <a data-link href="/estudiante/${n}" class="btn-secondary text-sm px-6 py-2">Cancelar</a>
                                            <button type="submit" class="btn-primary px-6" id="edit-submit">Guardar cambios</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        `,e.querySelector(`#edit-student-form`).addEventListener(`submit`,async t=>{t.preventDefault();let r=e.querySelector(`#edit-submit`),i=e.querySelector(`#edit-message`);i.classList.add(`hidden`);let a=e.querySelector(`#edit-email`).value.trim(),o=e.querySelector(`#edit-phone`).value.trim();if(a&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)){i.textContent=`El formato del email no es válido`,i.className=`rounded-lg p-4 text-sm bg-red-50 text-red-700`,i.classList.remove(`hidden`);return}if(o&&!/^[\d\s\-+()]{7,20}$/.test(o)){i.textContent=`El formato del teléfono no es válido`,i.className=`rounded-lg p-4 text-sm bg-red-50 text-red-700`,i.classList.remove(`hidden`);return}r.disabled=!0,r.innerHTML=`<span class="spinner"></span> Guardando...`;let s={first_name:e.querySelector(`#edit-first_name`).value,last_name:e.querySelector(`#edit-last_name`).value,email:a,phone:o,document_type_id:parseInt(e.querySelector(`#edit-document_type_id`).value),document_number:e.querySelector(`#edit-document_number`).value,gender_id:parseInt(e.querySelector(`#edit-gender_id`).value),birth_date:e.querySelector(`#edit-birth_date`).value,neighborhood_id:parseInt(e.querySelector(`#edit-neighborhood_id`).value),address:e.querySelector(`#edit-address`).value,grade_id:parseInt(e.querySelector(`#edit-grade_id`).value),status_id:parseInt(e.querySelector(`#edit-status_id`).value)};try{if(!b?.id)throw Error(`No se encontró el perfil del estudiante`);await T(b.id,s),N.success(`Estudiante actualizado exitosamente`),Router.navigate(`/estudiante/${n}`)}catch(e){i.textContent=e.message,i.className=`rounded-lg p-4 text-sm bg-red-50 text-red-700`,i.classList.remove(`hidden`),r.disabled=!1,r.textContent=`Guardar cambios`}});return}e.innerHTML=`
                        <div class="content-fade-in">
                            <a data-link href="/estudiantes" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                                &larr; Volver a estudiantes
                            </a>

                            <div class="card p-6 mb-6">
                                <div class="flex items-start gap-6 flex-wrap">
                                    <div class="w-20 h-20 rounded-full ${h} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                        ${p}
                                    </div>
                                    <div class="flex-grow min-w-0">
                                        <div class="flex items-start justify-between gap-4 flex-wrap">
                                            <div>
                                                <h1 class="text-2xl font-bold text-gray-800">${i.first_name||``} ${i.last_name||``}</h1>
                                                <p class="text-muted mt-1">${b.grade||`Sin grado`} · ${b.institution?.name||`Sin institución`}</p>
                                                <div class="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                                    ${i.email?`<span>${i.email}</span>`:``}
                                                    ${i.phone?`<span>${i.phone}</span>`:``}
                                                    ${i.age?`<span>${i.age} años</span>`:``}
                                                    ${i.gender?`<span>${i.gender}</span>`:``}
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                ${d?`<a data-link href="/estudiante/${n}/editar" class="btn-secondary text-sm px-4 py-2">Editar</a>`:``}
                                                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${b.status===`Activo`?`bg-green-100 text-green-800`:b.status===`Graduado`?`bg-blue-100 text-blue-800`:`bg-gray-100 text-gray-800`}">
                                                    ${b.status||`Sin estado`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Indicador de última actualización (semáforo) -->
                                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm">
                                    <span class="w-3 h-3 rounded-full ${v.color}"></span>
                                    <span class="${v.textColor} font-medium">${v.label}</span>
                                    ${g?`<span class="text-gray-400">· ${F(g)}</span>`:``}
                                    ${i.last_update_by_name?`<span class="text-gray-400">· por ${i.last_update_by_name}</span>`:``}
                                </div>
                            </div>

                            <div class="card p-6 mb-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">Información personal</h2>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Tipo de documento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.document_type||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Número de documento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.document_number||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Fecha de nacimiento</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.birth_date?F(i.birth_date):`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Edad</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.age?`${i.age} años`:`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Género</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.gender||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Localidad</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.locality||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Barrio</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.neighborhood||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.address||`—`}</p>
                                    </div>
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Institución</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${b.institution?.name||`—`}</p>
                                    </div>
                                    ${d?`
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Usuario</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${i.credential_username||`—`}</p>
                                    </div>
                                    `:``}
                                    <div>
                                        <p class="text-xs text-gray-500 uppercase tracking-wide">Última actualización</p>
                                        <p class="text-sm font-medium text-gray-800 mt-1">${g?F(g):`—`}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="card p-6">
                                <h2 class="text-lg font-semibold text-gray-800 mb-4">
                                    Campañas inscritas (${a.length})
                                </h2>

                                ${a.length===0?`
                                    ${_.html(`campaigns`,`Este estudiante no está inscrito en ninguna campaña.`)}
                                `:`
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-sm">
                                            <thead>
                                                <tr class="border-b border-gray-100 text-left text-gray-500">
                                                    <th class="pb-3 font-medium">Campaña</th>
                                                    <th class="pb-3 font-medium">Tipo</th>
                                                    <th class="pb-3 font-medium">Inicio</th>
                                                    <th class="pb-3 font-medium">Fin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${a.map(e=>`
                                                    <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <td class="py-3">
                                                            <a data-link href="/campanas/${e.id}" class="text-blue-600 hover:text-blue-800 font-medium">
                                                                ${e.title}
                                                            </a>
                                                        </td>
                                                        <td class="py-3"><span class="text-gray-600">${e.type||`General`}</span></td>
                                                        <td class="py-3 text-gray-500">${F(e.start_date)}</td>
                                                        <td class="py-3 text-gray-500">${e.end_date?F(e.end_date):`—`}</td>
                                                    </tr>
                                                `).join(``)}
                                            </tbody>
                                        </table>
                                    </div>
                                `}
                            </div>
                        </div>
                    `}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar el estudiante`))}})(),e})}},be={render(){return u.render(()=>{let e=document.createElement(`div`);e.className=`px-6 py-8 max-w-3xl mx-auto`;let n=r.getUser();e.innerHTML=`
                <div class="content-fade-in">
                    <a data-link href="/estudiantes" class="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
                        &larr; Volver a estudiantes
                    </a>
                    <h1 class="text-2xl font-bold text-gray-800 mb-6">Registrar Estudiante</h1>

                    <form id="student-form" class="space-y-6" novalidate>
                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información personal</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-first_name" class="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
                                    <input id="st-first_name" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Nombres del estudiante" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-first_name-error"></p>
                                </div>
                                <div>
                                    <label for="st-last_name" class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                                    <input id="st-last_name" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Apellidos del estudiante" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-last_name-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-doc-type" class="block text-sm font-medium text-gray-700 mb-1">Tipo de documento *</label>
                                    <select id="st-doc-type" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-doc-type-error"></p>
                                </div>
                                <div>
                                    <label for="st-doc-number" class="block text-sm font-medium text-gray-700 mb-1">Número de documento *</label>
                                    <input id="st-doc-number" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Número de documento" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-doc-number-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label for="st-gender" class="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                                    <select id="st-gender" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-gender-error"></p>
                                </div>
                                <div>
                                    <label for="st-birth_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento *</label>
                                    <input id="st-birth_date" type="date" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-birth_date-error"></p>
                                </div>
                                <div>
                                    <label for="st-neighborhood" class="block text-sm font-medium text-gray-700 mb-1">Barrio *</label>
                                    <select id="st-neighborhood" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-neighborhood-error"></p>
                                </div>
                            </div>

                            <div>
                                <label for="st-address" class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input id="st-address" type="text"
                                    class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="Dirección de residencia" />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input id="st-email" type="email" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Correo electrónico" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-email-error"></p>
                                </div>
                                <div>
                                    <label for="st-phone" class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                    <input id="st-phone" type="text"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Teléfono de contacto" />
                                </div>
                            </div>

                            <h3 class="text-md font-semibold text-gray-700 pt-2">Credenciales de acceso</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-username" class="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                                    <input id="st-username" type="text" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Nombre de usuario para el ingreso" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-username-error"></p>
                                </div>
                                <div>
                                    <label for="st-password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                                    <input id="st-password" type="password" required minlength="6"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        placeholder="Mínimo 6 caracteres" />
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-password-error"></p>
                                </div>
                            </div>
                        </div>

                        <div class="card p-6 space-y-5">
                            <h2 class="text-lg font-semibold text-gray-700">Información académica</h2>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-institution" class="block text-sm font-medium text-gray-700 mb-1">Institución *</label>
                                    <select id="st-institution" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar institución...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-institution-error"></p>
                                </div>
                                <div>
                                    <label for="st-grade" class="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
                                    <select id="st-grade" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar grado...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-grade-error"></p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label for="st-status" class="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                                    <select id="st-status" required
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="">Seleccionar estado...</option>
                                    </select>
                                    <p class="text-xs text-red-500 mt-1 hidden" id="st-status-error"></p>
                                </div>
                                <div>
                                    <label for="st-start_date" class="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
                                    <input id="st-start_date" type="date"
                                        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div id="st-message" class="hidden rounded-lg p-4 text-sm" role="alert"></div>

                        <div class="flex items-center gap-3 justify-end">
                            <a data-link href="/estudiantes" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</a>
                            <button type="submit" class="btn-primary px-6" id="st-submit">Registrar estudiante</button>
                        </div>
                    </form>
                </div>
            `;let a=e.querySelector(`#student-form`),o=document.createElement(`div`);return o.className=`flex items-center justify-center py-12`,o.innerHTML=`<span class="spinner"></span><span class="ml-3 text-sm text-gray-500">Cargando datos del formulario...</span>`,a.parentNode.insertBefore(o,a),a.style.display=`none`,(async()=>{try{let[r,i,s,c,l,u]=await Promise.all([t.getJSON(`api/document-types`),t.getJSON(`api/genders`),t.getJSON(`api/neighborhoods`),O(),t.getJSON(`api/grades`),t.getJSON(`api/statuses`)]);o.remove(),a.style.display=``;let d=(t,n,r,i)=>{let a=e.querySelector(t);n.forEach(e=>{let t=document.createElement(`option`);t.value=e[r],t.textContent=e[i],a.appendChild(t)})};d(`#st-doc-type`,r,`id`,`name`),d(`#st-gender`,i,`id`,`name`),d(`#st-neighborhood`,s,`id`,`name`),d(`#st-grade`,l,`id`,`grade`),d(`#st-status`,u,`id`,`status`);let f=e.querySelector(`#st-institution`);if(n?.rol===`ADMINISTRADOR`&&n?.institution_id){let e=c.find(e=>e.id===n.institution_id);if(e){let t=document.createElement(`option`);t.value=e.id,t.textContent=e.institution_name,t.selected=!0,f.appendChild(t),f.disabled=!0}}else c.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=e.institution_name,f.appendChild(t)});let p=e.querySelector(`#st-status`),m=u.find(e=>e.status?.toLowerCase()===`activo`);m&&(p.value=m.id),e.querySelector(`#st-start_date`).value=new Date().toISOString().split(`T`)[0]}catch(e){console.error(`Error loading catalogs:`,e),o.remove(),a.style.display=``,N.error(`Error al cargar datos del formulario`)}})(),e.querySelector(`#student-form`).addEventListener(`submit`,async t=>{t.preventDefault();let n=[{id:`st-first_name`,key:`first_name`,label:`Nombres`},{id:`st-last_name`,key:`last_name`,label:`Apellidos`},{id:`st-doc-type`,key:`document_type_id`,label:`Tipo de documento`},{id:`st-doc-number`,key:`document_number`,label:`Número de documento`},{id:`st-gender`,key:`gender_id`,label:`Género`},{id:`st-birth_date`,key:`birth_date`,label:`Fecha de nacimiento`},{id:`st-neighborhood`,key:`neighborhood_id`,label:`Barrio`},{id:`st-email`,key:`email`,label:`Email`},{id:`st-phone`,key:`phone`,label:`Teléfono`},{id:`st-address`,key:`address`,label:`Dirección`},{id:`st-institution`,key:`institution_id`,label:`Institución`},{id:`st-grade`,key:`grade_id`,label:`Grado`},{id:`st-status`,key:`status_id`,label:`Estado`},{id:`st-start_date`,key:`start_date`,label:`Fecha de inicio`},{id:`st-username`,key:`username`,label:`Usuario`},{id:`st-password`,key:`password`,label:`Contraseña`}],r=!0,a=e.querySelector(`#st-message`);a.classList.add(`hidden`),n.forEach(t=>{let n=e.querySelector(`#${t.id}`),i=e.querySelector(`#${t.id}-error`);i&&(i.classList.add(`hidden`),i.textContent=``),n&&n.required&&!n.value&&(i&&(i.textContent=`${t.label} es obligatorio`,i.classList.remove(`hidden`)),r=!1)});let o=e.querySelector(`#st-password`),s=e.querySelector(`#st-password-error`);if(o&&o.value&&o.value.length<6&&(s&&(s.textContent=`La contraseña debe tener al menos 6 caracteres`,s.classList.remove(`hidden`)),r=!1),!r)return;let c=e.querySelector(`#st-submit`);c.disabled=!0,c.innerHTML=`<span class="spinner"></span> Registrando...`;let l={};n.forEach(t=>{l[t.key]=e.querySelector(`#${t.id}`).value});try{await re(l),N.success(`Estudiante registrado exitosamente`),i.navigate(`/estudiantes`)}catch(e){a.textContent=e.message,a.className=`rounded-lg p-4 text-sm bg-red-50 text-red-700`,a.classList.remove(`hidden`),c.disabled=!1,c.textContent=`Registrar estudiante`}}),e})}},xe={render(){return u.render(()=>{let e=document.createElement(`div`);return e.className=`px-6 py-8 max-w-7xl mx-auto`,e.appendChild(j.grid(3,`card`)),(async()=>{let t=r.getUser();try{let n=[];if(t?.person_id&&(n=await y({person_id:t.person_id})),e.innerHTML=`
                        <section class="mb-8 content-fade-in">
                            <h1 class="text-2xl font-bold text-gray-800">Mis Campañas</h1>
                            <p class="text-muted mt-1">Campañas en las que estás inscrito/a</p>
                        </section>

                        ${n.length>0?`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-grid" id="mc-grid"></div>`:`
                            <div class="empty-state content-fade-in">
                                ${_.svg(`enrollments`)}
                                <p class="text-gray-400 mb-4">No estás inscrito/a en ninguna campaña actualmente.</p>
                                <a data-link href="/dashboard-estudiante" class="btn-primary text-sm">
                                    Ver campañas disponibles
                                </a>
                            </div>
                            `}
                    `,n.length>0){let t=e.querySelector(`#mc-grid`);n.forEach(e=>{let n=p.render(e);n.classList.add(`stagger-item`),t.appendChild(n)})}}catch(t){console.error(t),e.innerHTML=``,e.appendChild(v(`Error al cargar campañas`))}})(),e})}},Se={render(){return u.render(()=>{let e=r.getUser(),t=document.createElement(`div`);return t.className=`max-w-2xl mx-auto px-6 py-10`,t.innerHTML=`
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>
                <div class="bg-white rounded-2xl shadow p-6 flex items-center gap-6 mb-6">
                    <div class="shimmer w-16 h-16 rounded-full"></div>
                    <div class="space-y-2">
                        <div class="shimmer w-40 h-5 rounded"></div>
                        <div class="shimmer w-24 h-4 rounded"></div>
                    </div>
                </div>
                <div class="bg-white rounded-2xl shadow p-6">
                    <div class="space-y-4">
                        ${Array.from({length:5},()=>`<div class="space-y-1">
                                <div class="shimmer w-20 h-3 rounded"></div>
                                <div class="shimmer w-full h-5 rounded"></div>
                            </div>`).join(``)}
                    </div>
                </div>
            `,(async()=>{let n=null;if(e?.person_id)try{n=await E(e.person_id)}catch(e){console.error(`Error loading profile:`,e)}let r=n||{},i=r.student_profile||{};t.innerHTML=`
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

                    <div class="bg-white rounded-2xl shadow p-6 flex items-center gap-6 mb-6">
                        <div class="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                            ${(e?.username||`U`).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p class="text-lg font-semibold text-gray-800">${e?.username||`Usuario`}</p>
                            <p class="text-sm text-gray-500 capitalize">Rol: ${e?.rol||`—`}</p>
                            ${i.institution?`<p class="text-sm text-gray-500">${i.institution.name}</p>`:``}
                        </div>
                    </div>

                    ${n?`
                        <div class="bg-white rounded-2xl shadow p-6 space-y-5">
                            <h3 class="text-lg font-semibold text-gray-800">Datos Personales</h3>

                            ${r.last_update_date?`
                                <div class="flex items-center gap-2 text-xs text-gray-400 pb-4 border-b border-gray-100">
                                    <span>Última actualización: ${new Date(r.last_update_date).toLocaleDateString(`es-CO`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`})}</span>
                                    ${r.last_update_by_name?`<span>· por ${r.last_update_by_name}</span>`:``}
                                </div>
                            `:``}

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${r.first_name||`—`}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Apellido</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${r.last_name||`—`}</p>
                                </div>
                                <div class="md:col-span-2">
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${r.email||`—`}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Teléfono</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${r.phone||`—`}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500 uppercase tracking-wide">Dirección</p>
                                    <p class="text-sm font-medium text-gray-800 mt-1">${r.address||`—`}</p>
                                </div>
                            </div>
                        </div>
                    `:`
                        <div class="bg-white rounded-2xl shadow p-6 text-center text-gray-400">
                            No se pudieron cargar los datos del perfil.
                        </div>
                    `}
                `})(),t})}},Ce={render(){return u.render(()=>{let e=r.getUser(),t=document.createElement(`div`);return t.className=`max-w-2xl mx-auto px-6 py-10`,t.innerHTML=`
                <h2 class="text-2xl font-bold text-gray-800 mb-6">Actualizar Datos</h2>
                <div class="bg-white rounded-2xl shadow p-6">
                    <div class="space-y-4">
                        ${Array.from({length:5},()=>`<div class="space-y-1">
                                <div class="shimmer w-20 h-3 rounded"></div>
                                <div class="shimmer w-full h-9 rounded-lg"></div>
                            </div>`).join(``)}
                    </div>
                </div>
            `,(async()=>{let n=null;if(e?.person_id)try{n=await E(e.person_id)}catch(e){console.error(`Error loading profile:`,e)}if(!n){t.innerHTML=`
                        <div class="text-center py-12 text-gray-500">No se pudieron cargar los datos.</div>
                    `;return}let r=n;t.innerHTML=`
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Actualizar Datos</h2>

                    <div class="bg-white rounded-2xl shadow p-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>

                        <form id="edit-profile-form" class="space-y-4" novalidate>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-first_name">Nombre</label>
                                    <input type="text" id="edit-first_name" value="${r.first_name||``}" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="edit-first_name-error" />
                                    <p id="edit-first_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-last_name">Apellido</label>
                                    <input type="text" id="edit-last_name" value="${r.last_name||``}" required
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                        aria-describedby="edit-last_name-error" />
                                    <p id="edit-last_name-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-email">Email</label>
                                <input type="email" id="edit-email" value="${r.email||``}" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-email-error" />
                                <p id="edit-email-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-phone">Teléfono</label>
                                <input type="text" id="edit-phone" value="${r.phone||``}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-phone-error" />
                                <p id="edit-phone-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="edit-address">Dirección</label>
                                <input type="text" id="edit-address" value="${r.address||``}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="edit-address-error" />
                                <p id="edit-address-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>

                            <div id="edit-message" class="hidden text-sm rounded-lg p-3" role="alert"></div>

                            <div class="flex justify-end gap-3">
                                <a data-link href="/perfil" class="btn-secondary text-sm inline-flex items-center px-4 py-2">Cancelar</a>
                                <button type="submit" id="edit-save" class="btn-primary text-sm">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                `;let a=t.querySelector(`#edit-profile-form`),o=t.querySelector(`#edit-message`),s=[`first_name`,`last_name`,`email`,`phone`,`address`],c={first_name:`Nombre`,last_name:`Apellido`,email:`Email`,phone:`Teléfono`,address:`Dirección`},l=()=>{s.forEach(e=>{let n=t.querySelector(`#edit-${e}-error`);n&&(n.textContent=``,n.classList.add(`hidden`));let r=t.querySelector(`#edit-${e}`);r&&r.classList.remove(`border-red-500`)}),o.classList.add(`hidden`)};s.forEach(e=>{let n=t.querySelector(`#edit-${e}`);n?.addEventListener(`input`,()=>{let r=t.querySelector(`#edit-${e}-error`);r&&!r.classList.contains(`hidden`)&&(r.textContent=``,r.classList.add(`hidden`),n.classList.remove(`border-red-500`))})}),a.addEventListener(`submit`,async n=>{n.preventDefault(),l();let r=!0;if(s.forEach(e=>{let n=t.querySelector(`#edit-${e}`),i=t.querySelector(`#edit-${e}-error`);(e===`first_name`||e===`last_name`||e===`email`)&&(n.value.trim()||(i.textContent=`${c[e]} es obligatorio`,i.classList.remove(`hidden`),n.classList.add(`border-red-500`),r=!1)),e===`email`&&n.value.trim()&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.value)&&(i.textContent=`Email no válido`,i.classList.remove(`hidden`),n.classList.add(`border-red-500`),r=!1)}),!r)return;let a=t.querySelector(`#edit-save`);a.disabled=!0,a.innerHTML=`<span class="spinner"></span> Guardando...`;try{let n={};s.forEach(e=>n[e]=t.querySelector(`#edit-${e}`).value),await ie(e.person_id,n),N.success(`Datos actualizados correctamente`),i.navigate(`/perfil`)}catch(e){o.textContent=e.message||`Error al guardar`,o.className=`text-sm rounded-lg p-3 bg-red-50 text-red-700`,o.classList.remove(`hidden`),a.disabled=!1,a.textContent=`Guardar Cambios`}})})(),t})}},Z=`nexoedu-theme`;function Q(){return localStorage.getItem(Z)||`light`}function $(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(Z,e)}var we={render(){return u.render(()=>{let e=document.createElement(`div`);e.className=`max-w-2xl mx-auto px-6 py-10`;let n=Q();e.innerHTML=`
                <h1 class="text-2xl font-bold text-gray-800 mb-8">Configuración</h1>

                <section class="mb-8">
                    <div class="bg-white rounded-2xl shadow p-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Apariencia</h2>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-700">Tema</p>
                                <p class="text-xs text-muted mt-0.5">Claro / Oscuro</p>
                            </div>
                            <button id="theme-toggle"
                                class="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                style="background:${n===`dark`?`var(--rol-primary, #1D4ED8)`:`#d1d5db`}"
                                aria-label="Cambiar tema">
                                <span class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 text-xs"
                                    style="transform:translateX(${n===`dark`?`28px`:`0`})">
                                    ${n===`dark`?`🌙`:`☀️`}
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <div class="bg-white rounded-2xl shadow p-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-4">Cambiar Contraseña</h2>
                        <form id="password-form" class="space-y-4" novalidate>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-current-password">Contraseña actual</label>
                                <input type="password" id="cfg-current-password" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-current-password-error" />
                                <p id="cfg-current-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-new-password">Nueva contraseña</label>
                                <input type="password" id="cfg-new-password" required minlength="6"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-new-password-error" />
                                <p id="cfg-new-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1" for="cfg-confirm-password">Confirmar nueva contraseña</label>
                                <input type="password" id="cfg-confirm-password" required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                                    aria-describedby="cfg-confirm-password-error" />
                                <p id="cfg-confirm-password-error" class="hidden text-red-500 text-xs mt-1" role="alert"></p>
                            </div>

                            <div id="cfg-message" class="hidden text-sm rounded-lg p-3" role="alert"></div>

                            <div class="flex justify-end">
                                <button type="submit" id="cfg-save" class="btn-primary text-sm">
                                    Cambiar Contraseña
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            `,e.querySelector(`#theme-toggle`).addEventListener(`click`,()=>{let t=Q()===`dark`?`light`:`dark`;$(t);let n=e.querySelector(`#theme-toggle`),r=n.querySelector(`span`);n.style.background=t===`dark`?`var(--rol-primary, #1D4ED8)`:`#d1d5db`,r.style.transform=t===`dark`?`translateX(28px)`:`translateX(0)`,r.innerHTML=t===`dark`?`🌙`:`☀️`});let r=e.querySelector(`#password-form`),i=e.querySelector(`#cfg-message`),a=()=>{[`current-password`,`new-password`,`confirm-password`].forEach(t=>{let n=e.querySelector(`#cfg-${t}-error`);n&&(n.textContent=``,n.classList.add(`hidden`));let r=e.querySelector(`#cfg-${t}`);r&&r.classList.remove(`border-red-500`)}),i.classList.add(`hidden`)},o=(t,n)=>{let r=e.querySelector(t);if(r){r.textContent=n,r.classList.remove(`hidden`);let e=r.previousElementSibling;e&&e.classList.add(`border-red-500`)}};return r.addEventListener(`submit`,async n=>{n.preventDefault(),a();let r=e.querySelector(`#cfg-current-password`).value,s=e.querySelector(`#cfg-new-password`).value,c=e.querySelector(`#cfg-confirm-password`).value,l=!0;if(r||(o(`#cfg-current-password-error`,`La contraseña actual es obligatoria`),l=!1),s?s.length<6&&(o(`#cfg-new-password-error`,`Mínimo 6 caracteres`),l=!1):(o(`#cfg-new-password-error`,`La nueva contraseña es obligatoria`),l=!1),s!==c&&(o(`#cfg-confirm-password-error`,`Las contraseñas no coinciden`),l=!1),!l)return;let u=e.querySelector(`#cfg-save`);u.disabled=!0,u.innerHTML=`<span class="spinner"></span> Cambiando...`;try{let n=await(await t.post(`api/auth/change-password`,{current_password:r,new_password:s})).json();N.success(n.message||`Contraseña cambiada exitosamente`),e.querySelector(`#cfg-current-password`).value=``,e.querySelector(`#cfg-new-password`).value=``,e.querySelector(`#cfg-confirm-password`).value=``}catch(e){i.textContent=e.message||`Error al cambiar la contraseña`,i.className=`text-sm rounded-lg p-3 bg-red-50 text-red-700`,i.classList.remove(`hidden`)}finally{u.disabled=!1,u.textContent=`Cambiar Contraseña`}}),e})}};$(Q());var Te={"/":{view:a,protected:!1},"/dashboard-superadmin":{view:ae,protected:!0,roles:[`SUPERADMIN`]},"/dashboard":{view:le,protected:!0,roles:[`ADMINISTRADOR`]},"/dashboard-estudiante":{view:ue,protected:!0,roles:[`ESTUDIANTE`]},"/instituciones":{view:W,protected:!0,roles:[`SUPERADMIN`]},"/instituciones/crear":{view:G,protected:!0,roles:[`SUPERADMIN`]},"/instituciones/:id/editar":{view:G,protected:!0,roles:[`SUPERADMIN`]},"/instituciones/crear-admin":{view:fe,protected:!0,roles:[`SUPERADMIN`]},"/institucion/:id":{view:U,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/institucion":{view:U,protected:!0,roles:[`ADMINISTRADOR`]},"/campanas":{view:pe,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/campanas/crear":{view:q,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/campanas/:id":{view:he,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/campanas/:id/editar":{view:q,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/estudiantes":{view:ye,protected:!0,roles:[`ADMINISTRADOR`]},"/estudiantes/crear":{view:be,protected:!0,roles:[`ADMINISTRADOR`]},"/estudiante/:id":{view:X,protected:!0,roles:[`SUPERADMIN`,`ADMINISTRADOR`]},"/estudiante/:id/editar":{view:X,protected:!0,roles:[`ADMINISTRADOR`]},"/mis-campanas":{view:xe,protected:!0,roles:[`ESTUDIANTE`]},"/perfil":{view:Se,protected:!0,roles:[`ADMINISTRADOR`,`ESTUDIANTE`]},"/perfil/editar":{view:Ce,protected:!0,roles:[`ESTUDIANTE`]},"/configuracion":{view:we,protected:!0}};r.init(),i.init(Te);