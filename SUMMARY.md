## Objective
- Complete the NexoEdu frontend (vanilla JS SPA) with all views, fix critical bugs found in audit, and execute a 17-item visual design overhaul (4 phases)

## Important Details
- Role values are uppercase: `"SUPERADMIN"`, `"ADMINISTRADOR"`, `"ESTUDIANTE"`; stored as `rol` (not `role`)
- `Auth.Login()` returns user with `rol`, `person_id`, `institution_id`, `student_profile_id`
- Express 5 does NOT support `?` optional params — separate routes for `/institucion` and `/institucion/:id`
- Campaigns have no `status_id` — use date-based filtering (active / upcoming / finished)
- All data endpoints now require auth (`requireAuth`), admin-only ones use `requireRole`
- Design uses two fonts: Inter (headings) + Nunito (body) via Google Fonts

## Work State
### Completed
- **All views functional**: Login, DashboardSuperAdmin, DashboardAdmin, DashboardEstudiante, Institucion, Campañas, CampañaForm, CampañaDetalle, Estudiantes, EstudianteDetalle, MisCampañas, Perfil, Configuracion (13 views total)
- **CRUD de campañas**: Crear (`CampañaForm.js` + ruta `/campanas/crear` + `POST /api/campaigns`), ver detalle (`CampañaDetalle.js` + ruta `/campanas/:id` + `GET /api/campaigns/:id`), editar (`CampañaForm.js` + `PUT /api/campaigns/:id`), eliminar (ConfirmDialog + `DELETE /api/campaigns/:id`)
- **Detalle de estudiante**: `EstudianteDetalle.js` + ruta `/estudiante/:id` + `GET /api/people/:id` con información personal, grado, institución, estado y campañas inscritas
- **Progreso por campaña (B1.4)**: Barra de progreso + cards (inscritos/actualizados/pendientes) + columna de estado en tabla de estudiantes. Endpoint `GET /api/campaigns/:id/progress`
- **Configuración (B1.9)**: `Configuracion.js` con cambio de contraseña + selector de tema oscuro. Endpoint `POST /api/auth/change-password`
- **Filtro de estudiantes extraído** a `utils/filters.js` (eliminada duplicación entre Estudiantes e Institución)
- 15 audit bugs fixed (3 critical, 7 high, 5 medium)
- All 3 READMEs updated
- Design Phase 1 (Quick Wins) completed
- `style.css` rewritten with CSS variables, keyframes, utilities, dark mode variables
- Skeleton loaders in all views with sync render pattern
- **Proxy de Vite**: `API_URL` cambiada a `""`, proxy `/api` → `localhost:3001` en `vite.config.js`, eliminando CORS y hardcodeo
- **Timeout en http.js**: AbortSignal con 30s para evitar peticiones colgadas
- **Dependencias duplicadas limpiadas**: `express` y `cors` eliminados de `package.json` raíz
- **.env sanitizado**: Contraseña real reemplazada por valores de ejemplo
- **Sidebar colapsable en todos los tamaños**: Botón toggle siempre visible, animación con transform, estado persistido en localStorage. Main content con margin-left dinámico
- **Error boundary en Router**: try/catch con pantalla de error + botón recargar
- **Breakpoint sidebar corregido**: 1023px → 1024px
- **Delay router reducido**: 200ms → 100ms
- **StatsCard con animación de conteo**: requestAnimationFrame + IntersectionObserver
- **Responsive mejorado**: breadcrumbs truncados, filtros full-width, dialog mobile padding

### Active
- (none)

### Blocked
- (none)

## Next Move
1. F2.#6: Apply CSS variables + Barranquilla palette (blue+red+yellow) to all components
2. F2.#7: Add logo.jpeg to Sidebar and Login
3. F2.#8: Enhance Hero sections with gradient overlays and decorative shapes
4. F2.#9: Category badges (book, trophy, etc.) on CampaignCard

## Relevant Files
- `frontend/index.html`: Updated with lang=es, Google Fonts, title
- `frontend/src/style.css`: CSS variables, animations, font config, shimmer utility
- `frontend/public/favicon.svg`: Replaced purple lightning with blue book icon
- `frontend/src/components/Toast.js`: New toast notification component
- `frontend/src/components/Skeleton.js`: New skeleton loader component
- `frontend/src/components/CampaignCard.js`: Hover lift + will get border-accent color per status
- `frontend/src/components/StatsCard.js`: Hover lift + border
- `frontend/src/components/Layout.js`: contentFn called synchronously (non-async)
- `frontend/src/views/DashboardEstudiante.js`: alert()→Toast, skeleton pattern
- `frontend/src/views/DashboardSuperAdmin.js`: Skeleton pattern
- `frontend/src/views/DashboardAdmin.js`: Skeleton pattern
- `frontend/src/views/Institucion.js`: Skeleton pattern, API_URL import
- `frontend/src/views/Campañas.js`: Skeleton pattern, date-based filter, institution scope for Admin
- `frontend/src/views/Estudiantes.js`: Skeleton pattern, fixed rol check, API_URL import
- `frontend/src/views/MisCampañas.js`: Skeleton pattern
- `frontend/src/views/Perfil.js`: Skeleton pattern, full profile editor
- `frontend/src/modules/auth.js`: isAuthenticated loose equality
- `frontend/src/modules/http.js`: HTTP error throwing
- `frontend/src/modules/router.js`: Role-based redirects, Estudiante dashboard
- `backend/server.js`: requireAuth on all data routes, requireRole on admin routes, enrollment scope/criteria validation, GET /api/people/:id, enrollment_count, person_id filter, fixed criteria loop
