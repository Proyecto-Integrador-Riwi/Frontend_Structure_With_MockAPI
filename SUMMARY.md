## Objective
- Deliver a complete Student and Graduate Tracking System MVP (NexoEdu) with all 18 user stories, covering Super Admin, Institutional Admin, and Student roles.

## Important Details
- Role values: `SUPERADMIN`, `ADMINISTRADOR`, `ESTUDIANTE`
- Backend is a provisional Express mock (`backend/server.js` + `db.json`)
- Frontend: Vite + Vanilla JS + Tailwind CSS v4 (no framework)
- Auth: token simulado en memoria (no JWT real)

## Work State
### Completed
- **17 vistas funcionales**: Login, DashboardSuperAdmin, DashboardAdmin, DashboardEstudiante, Campañas, CampañaForm, CampañaDetalle, Estudiantes, CrearEstudiante, EstudianteDetalle, GestionInstituciones, InstitucionForm, Institucion, CrearAdmin, MisCampañas, Perfil, Configuracion
- **CRUD completo**: campañas (crear/editar/eliminar), instituciones (crear/editar/eliminar), estudiantes (crear/editar), credenciales (crear)
- **Filtros**: búsqueda por nombre/documento en estudiantes, filtro Actualizados/Pendientes (HU-15), filtros por institución/estado/grado/género/edad
- **target_population**: campañas con alcance a estudiantes, egresados o ambos (HU-07/HU-08). Filtrado en disponibles e inscripción
- **Semáforo de actualización**: indicador verde/amarillo/rojo según last_update_date (HU-14)
- **Dashboard con estadísticas**: totales, actualizados/pendientes, porcentaje
- **Toast, ConfirmDialog, Skeleton, EmptyState**: componentes reutilizables
- **Sidebar colapsable**: persistencia en localStorage, animación
- **Router con error boundary**: try/catch + pantalla de error + recargar
- **Proxy de Vite**: elimina CORS y hardcodeo de API_URL
- **Timeout en HTTP**: AbortSignal 30s
- **15 bugs corregidos**: role checks, router loops, http.put, auth guards, etc.
- **Limpieza del proyecto**: creado `.gitignore`, eliminados archivos no usados del backend real (`index.js`, `db.js`, `controllers/`, `models/`, `routes/`), eliminado `frontend/dist/`

### Active
- (ninguno)

### Blocked
- (ninguno)

## Next Move
- Ninguno por el momento. El MVP está completo.

## Relevant Files
- `backend/server.js` — Mock API (~1526 líneas, todos los endpoints)
- `backend/db.json` — Datos de prueba (213 estudiantes, 15 campañas, 10 instituciones)
- `backend/seed/` — Generador de datos
- `frontend/src/main.js` — Route definitions (14 rutas)
- `frontend/src/views/` — 17 vistas (una por ruta)
- `frontend/src/components/` — 11 componentes
- `frontend/src/services/` — 4 servicios API
- `frontend/src/modules/` — router.js, auth.js, http.js
