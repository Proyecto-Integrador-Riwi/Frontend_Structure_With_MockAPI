# NexoEdu — Roadmap de Mejora (Negocio + Diseño)

> Estado: Julio 2026 · Próxima revisión: Pendiente

---

## Estado Actual

### ✅ Completado
- **19 vistas funcionales**: Login, DashboardSuperAdmin, DashboardAdmin, DashboardEstudiante, Institución, Campañas, CampañaForm, CampañaDetalle, Estudiantes, EstudianteDetalle, MisCampañas, Perfil, PerfilEdit, Configuracion, GestionInstituciones, InstitucionForm, CrearAdmin, CrearEstudiante
- **GestionUsuarios eliminada** — ruta `/usuarios` no existe más. La gestión de admins se hace desde Crear Admin.
- **CRUD de campañas**: Crear, ver detalle, editar y eliminar campañas con formulario completo (título, tipo, fechas, descripción, alcance, imagen)
- **Detalle de estudiante**: Perfil completo con información personal, grado, institución, estado, campañas, semáforo actualización, quién actualizó
- **MVP 100% completo**: 18/18 HU implementadas
- **25+ bugs/mejoras corregidas** (role checks, router loops, http.put, auth guards, validaciones, etc.)
- **Sistema de diseño**: Tokens CSS, paleta Barranquilla, theming por rol (SUPERADMIN=azul+oro, ADMIN=azul+verde, ESTUDIANTE=turquesa+naranja)
- **Estados profesionales**: Skeleton loaders, crossfade, stagger entrance, empty states con placeholder, errores con retry
- **UX**: Transiciones de página, ConfirmDialog, validación inline, toggle contraseña, loading bar, notificaciones Toast, forgot password, remember me
- **Accesibilidad**: Skip-link, focus-visible, aria-current, aria-hidden en SVGs, roles ARIA, keyboard nav, prefers-reduced-motion, high contrast, dark mode
- **Backend mock**: Todos los endpoints con auth, requireRole, validaciones, CRUD completo, dashboard stats, progress tracking, updated_by tracking
- **Proxy de Vite**: API_URL reemplazada por proxy, eliminando CORS y hardcodeo de puerto
- **Timeout en http.js**: AbortSignal con 30s para evitar peticiones colgadas
- **Dependencias duplicadas limpiadas**: express y cors eliminados de package.json raíz
- **.env sanitizado**: Contraseña real reemplazada por valores de ejemplo
- **Seed reducido**: Solo 6 credenciales, 2 instituciones, 1 campaña — debugging rápido
- **Limpieza general**: store.js, hero.png eliminados; funciones y CSS sin uso removidos

---

## 📋 Fase B1 — Funcionalidades de Negocio Faltantes (Prioridad Crítica)

| # | Funcionalidad | Rol afectado | Impacto |
|---|--------------|--------------|---------|
| B1.1 | **Crear campaña** — Formulario para crear nuevas campañas (título, tipo, fechas, descripción, imagen, alcance) | SUPERADMIN, ADMIN | ✅ Implementado — `CampañaForm.js` + `POST /api/campaigns` |
| B1.2 | **Editar/Eliminar campaña** — Vista detalle de campaña con opciones de edición y borrado | SUPERADMIN, ADMIN | ✅ Implementado — `CampañaDetalle.js` + `PUT/DELETE /api/campaigns/:id` |
| B1.3 | **Detalle de estudiante** — Al hacer clic en un estudiante, ver su perfil completo, campañas en las que participó, progreso | SUPERADMIN, ADMIN, ESTUDIANTE | ✅ Implementado — `EstudianteDetalle.js` + `GET /api/people/:id` |
| B1.4 | **Dashboard de progreso por campaña** — Para cada campaña, ver cuántos estudiantes han actualizado sus datos, quiénes faltan, gráficos | SUPERADMIN, ADMIN | ✅ Implementado — barra de progreso + cards en `CampañaDetalle.js` + endpoint `GET /api/campaigns/:id/progress` |
| B1.5 | **Desinscripción de campaña** — Un estudiante debe poder salirse de una campaña | ESTUDIANTE | Sin esto el estudiante queda atrapado |
| B1.6 | ~~**Gestión de usuarios**~~ — Reemplazado por flujos específicos | SUPERADMIN | ❌ Eliminado — los admins se crean desde Crear Admin; los estudiantes se crean desde Crear Estudiante con credential automático |
| B1.7 | **Gestión de instituciones** — Crear/editar/desactivar instituciones desde el panel SuperAdmin | SUPERADMIN | ✅ Implementado — CRUD completo + toggle active |
| B1.8 | **Cambio de contraseña** — El usuario debe poder cambiar su propia contraseña | TODOS | ✅ Implementado — formulario en `Configuracion.js` + endpoint `POST /api/auth/change-password` |
| B1.9 | **Configuración real** — La ruta `/configuracion` debe tener una vista propia (no reusar Perfil) | TODOS | ✅ Implementado — `Configuracion.js` con cambio de contraseña + selector de tema oscuro |
| B1.10 | **Exportar datos** — Exportar listados de estudiantes, campañas, estadísticas a CSV/Excel | SUPERADMIN, ADMIN | Los ministerios necesitan reportes |

---

## 🎨 Fase D1 — Mejoras de Diseño y UX (Alta Prioridad)

| # | Mejora | Archivos | Detalle |
|---|--------|----------|---------|
| D1.1 | **Ilustraciones en empty states** — Reemplazar los placeholders comentados con SVG reales | `DashboardSuperAdmin`, `DashboardAdmin`, `DashboardEstudiante`, `Campañas`, `MisCampañas`, `StudentList` | Hay 7 lugares con `<!-- ILUSTRACIÓN: -->` esperando SVGs |
| D1.2 | **Avatar uploading** — Perfil debe permitir subir foto | `Perfil.js` | Actualmente solo inicial |
| D1.3 | **Vista mobile completa** — Sidebar colapsable funciona, pero el contenido no está optimizado para móvil (breadcrumbs se enciman, filtros no colapsan) | `Navbar.js`, `FilterBar.js`, `style.css` | ✅ Mejorado — breadcrumbs truncados, filtros full-width en <640px, dialog sin padding, mobile-table-card helper |
| D1.4 | **Paginación real** — Listas de estudiantes y campañas deben paginarse (server-side) | `Estudiantes.js`, `Campañas.js`, `Institucion.js` | Ya se filtró por nombre, falta paginación |
| D1.5 | **Búsqueda server-side** — El filtro de estudiantes debe ser server-side, no client-side | `FilterBar.js`, backend | Con 5000+ estudiantes el cliente colapsa |
| D1.6 | **Animación de conteo en StatsCard** — Los números deben contar de 0 al valor final | `StatsCard.js` | ✅ Implementado — `requestAnimationFrame` con easing cúbico + `IntersectionObserver` |
| D1.7 | **Tooltips en acciones** — Los botones de acción deberían tener tooltips descriptivos | Todos los componentes | Mejora UX sutil pero profesional |
| D1.8 | **Toast posición responsive** — En móvil, el toast se superpone con la navbar | `Toast.js` | Mover a `top-16` en móvil o centrar |
| D1.9 | **Stagger hasta 20 items** — Actualmente solo 10 items tienen delay | `style.css` | Agregar `.stagger-item:nth-child(11..20)` |
| D1.10 | **Cards clickeables** — CampaignCard debería navegar al detalle al hacer clic en cualquier parte | `CampaignCard.js` | Actualmente solo el botón es interactivo |

---

## 🛠 Fase T1 — Deuda Técnica (Media Prioridad)

| # | Deuda | Archivos | Acción |
|---|-------|----------|--------|
| T1.1 | **Código muerto** — Eliminar archivos sin uso | store.js, hero.png, funciones sin uso, CSS huérfano | Limpieza general v1.8.0 | ✅ store.js, hero.png eliminados; functions sin uso removidas; 4 clases CSS eliminadas |
| T1.2 | **Lógica duplicada** — El `onFilter` en `Institucion.js` y `Estudiantes.js` es idéntico | Ambos archivos | ✅ Extraído a `utils/filters.js` |
| T1.3 | **Listener leaks en Layout** — Cada navegación re-agrega event listeners sin limpiar los viejos | `Layout.js` | ⏳ Pendiente — bajo impacto actual |
| T1.4 | **Proxy de Vite** — Configurar proxy para eliminar CORS y hardcodeo de `API_URL` | `vite.config.js`, `auth.js` | ✅ Implementado — `API_URL=""` + proxy en `vite.config.js` |
| T1.5 | **Breakpoint mismatch** — Sidbar CSS usa `1023px` pero Tailwind `lg` es `1024px` | `style.css` | ✅ Corregido a `1024px` |
| T1.6 | **Delay artificial 200ms** — Router tiene un `setTimeout` de 200ms para la animación de salida | `router.js` | ✅ Reducido a 100ms |
| T1.8 | **Sin error boundary en Router** — Si un view.render() lanza error, la app se rompe | `router.js` | ✅ Implementado — try/catch con pantalla de error + botón recargar |
| T1.9 | **PUT en http.js ignora ID** — Firma acepta `id` pero no lo usa | `http.js` | ✅ Implementado — JSDoc corregido, firma limpia |
| T1.10 | **Sin lazy loading** — Todos los views se importan al inicio en `main.js` | `main.js` | ⏳ Baja prioridad, SPA pequeña |
| T1.11 | **Sin .gitignore** — `node_modules/` y `dist/` pueden commiteares | raíz | ✅ Creado `.gitignore` |
| T1.12 | **Seed masivo** — 122+ estudiantes dificultaban debugging | `seed/` | ✅ Reducido a 6 credenciales, 2 instituciones, 3 estudiantes |
| T1.13 | **Limpieza CSS** — Clases sin uso hero-shape-3, text-accent, text-success, bg-accent-light | `style.css` | ✅ Eliminadas |
| T1.14 | **Dependencia pg** — Instalada pero no usada en mock | `backend/package.json` | ✅ Eliminada |

---

## 🔄 Fase M1 — Migración a Backend Real (Bloqueante)

| # | Paso | Estado |
|---|------|--------|
| M1.1 | Decidir stack: el `backend/index.js` actual usa Express v5 + pg, pero `MIGRATION_GUIDE.md` asume FastAPI | ⚠️ Decisión pendiente |
| M1.2 | Implementar todos los endpoints que ya existen en el mock (`server.js` ~20 endpoints) | ❌ Solo auth existe |
| M1.3 | Crear las vistas de PostgreSQL necesarias (`view_credential_info`, etc.) | ❌ Pendiente |
| M1.4 | Reemplazar autenticación mock por JWT real | ❌ Pendiente |
| M1.5 | Migrar `db.json` (24K líneas) a PostgreSQL | ❌ Pendiente |
| M1.6 | Actualizar servicios frontend para mapear respuestas del backend real | ❌ Pendiente |
| M1.7 | `.env` con contraseña real `4417` está en el repo — mover a `.env.example` y agregar a `.gitignore` | ✅ .env sanitizado (sin repo git — no hay historial que limpiar) |

---

## 📐 Fase A1 — Pendientes de Accesibilidad

| # | Item | Archivos |
|---|------|----------|
| A1.1 | `aria-live="assertive"` para toasts de error (vs `polite` para éxito) | `Toast.js` |
| A1.2 | Contraste de color en badges — verificar ratio 4.5:1 | `style.css` |
| A1.3 | `aria-sort` en columnas de listas (cuando haya ordenamiento) | `StudentList.js` |
| A1.4 | Modo oscuro (`prefers-color-scheme: dark`) | `style.css`, todas las vistas |

---

## 📁 Resumen de Archivos por Acción

| Archivo | B1 | D1 | T1 | A1 |
|---------|:--:|:--:|:--:|:--:|
| `style.css` | | 9,10 | 5 | 2,4 |
| `Login.js` | | | | |
| `DashboardSuperAdmin.js` | 1,2,7 | 1 | | |
| `DashboardAdmin.js` | 1,2,7 | 1 | | |
| `DashboardEstudiante.js` | 5 | 1 | | |
| `Institucion.js` | | 4,5 | 2 | |
| `Campañas.js` | 1,2 | 1,4 | | |
| `Estudiantes.js` | 3,10 | 4,5 | 2 | |
| `MisCampañas.js` | 5 | 1 | | |
| `Perfil.js` | 8 | 2 | | |
| `Navbar.js` | | 3 | | |
| `Sidebar.js` | | | | |
| `CampaignCard.js` | 2 | 10 | | |
| `StatsCard.js` | | 6 | | |
| `FilterBar.js` | | 5 | | |
| `StudentList.js` | 3 | 1 | | 3 |
| `Toast.js` | | 8 | | 1 |

| `Layout.js` | | | 3 | |
| `Router.js` | | | 6,8 | |
| `http.js` | | | 7,9 | |
| `main.js` | 9 | | 10 | |
| `vite.config.js` | | | 4 | |
| `index.html` | | | | |
| `auth.js` | | | 4 | |
| `backend/.env` | | | M1.7 | |
| `backend/server.js` | | | M1 | |

---

## 🥇 Prioridad Sugerida para Retomar

1. ~~**M1.7** — .env expuesto~~ ✅ Hecho
2. ~~**B1.1 + B1.2** — CRUD de campañas~~ ✅ Hecho
3. ~~**B1.3** — Detalle de estudiante~~ ✅ Hecho
4. ~~**T1.4** — Proxy de Vite~~ ✅ Hecho
5. ~~**T1.7** — Timeout en http.js~~ ✅ Hecho
6. ~~**D1.3** — Vista mobile completa~~ ✅ Hecho
7. ~~**T1.5** — Breakpoint mismatch~~ ✅ Hecho
8. ~~**T1.6** — Delay 200ms~~ ✅ Hecho
9. ~~**T1.8** — Error boundary~~ ✅ Hecho
10. **D1.1** — Ilustraciones empty state (alto impacto visual, bajo esfuerzo)
11. **B1.5** — Desinscripción de campaña (sin esto el estudiante queda atrapado)
12. **F3** — Verificación de expiración de token
13. **F9** — Mostrar credenciales tras crear estudiante
14. **F16** — Campo email en CrearAdmin
15. **M1.2–M1.6** — Migración completa a backend real
