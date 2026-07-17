# NexoEdu — Changelog

## Proyecto

Sistema de Seguimiento de Egresados/Estudiantes (NexoEdu) — SPA para instituciones educativas de Barranquilla.

- **Roles**: `SUPERADMIN`, `ADMINISTRADOR`, `ESTUDIANTE`
- **Frontend**: Vite 8 + Vanilla JS + Tailwind CSS v4
- **Backend**: Express 5 mock (provisional, mientras el equipo termina endpoints reales)
- **Auth**: Token simulado en memoria (no JWT real)

---

## [1.2.0] — 2026-07-16 — Refactor Backend Mock

### Utilidades compartidas
- **Creado `backend/utils.js`**: Helpers centralizados que eliminan toda la duplicación del servidor:
  - `nextId(array)` — generación segura de IDs (reemplaza 7 fórmulas dispersas, incluidos los bug de `.length+1` y `Date.now()`)
  - `calcAge(birthDate)` — cálculo de edad (reemplaza 5 fórmulas idénticas)
  - `isCampaignActive(campaign)` — filtro de campaña activa (reemplaza 7 repeticiones del patrón `2099-12-31`)
  - `getLastUpdate(peopleId)` — última actualización de persona (reemplaza 3 repeticiones)
  - `enrichCampaign(campaign)` — enriquecimiento con scope/criteria/enrollment_count (reemplaza 4 repeticiones)
  - `checkCampaignScope(campaignId, studentProfile)` — validación de alcance (reemplaza 2 bloques idénticos de ~25 líneas)
  - `computeDashboardStats(profiles)` — estadísticas de dashboard (reemplaza 2 bloques de ~50 líneas)
  - `checkCriteria(allCriteria, person, studentProfile)` — validación de criterios desacoplada
  - `enrichStudentProfile(sp)` — enriquecimiento completo de perfil estudiantil
  - `enrichInstitution(inst)` — enriquecimiento de institución

### Mejoras de robustez
- **Error handling**: Agregado `try/catch` en `loadDatabase()` y `saveDatabase()` para evitar crashes silenciosos. Agregado middleware global de error `app.use((err, req, res, next) => ...)`.
- **Sesiones con TTL**: Las sesiones ahora expiran después de 24h de inactividad. Cleanup periódico cada hora.
- **ID generation**: Unificado via `nextId()`. Corregido `Date.now()` como ID en scope (colisión) y `.length+1` en enrollments/updates.
- **`localities_id` → `locality_id`**: Corregido typo en 20+ ocurrencias (server.js + seed/index.js).
- **`/api/campaigns/pinned`**: Agregado `requireRole('SUPERADMIN')` para alinear con comentarios del código y MIGRATION_GUIDE.
- **PORT configurable**: Ahora usa `process.env.PORT || 3001`.

### Server.js
- Reducido de 1526 líneas a ~750 líneas (~50% más compacto) sin perder funcionalidad.
- Secciones claras con rutas agrupadas. Toda la lógica repetitiva extraída a `utils.js`.
- Bugfix: filtro de género en estudiantes usa comparación directa (evita string matching frágil).

### Seed
- `seed/index.js`: Corregido `localities_id` → `locality_id` (15 ocurrencias).

---

## [1.3.0] — 2026-07-16 — Quick Wins UX/UI

### Bugs corregidos (6)

| # | Vista | Problema | Solución |
|---|---|---|---|
| B5 | `DashboardSuperAdmin.js` | API call innecesaria — `getCampaigns()` solo para top-5 | Eliminada; usa `activeCampaigns` en su lugar |
| B6 | `DashboardEstudiante.js` | API de Toast inconsistente (`Toast.show` vs `Toast.success/error`) | Unificado a `Toast.success()`/`Toast.error()` |
| B7 | `CampañaDetalle.js` | URL multimedia sin protocolo rompía la imagen | Agregado prefijo `https://` automático |
| B8 | `CampañaForm.js` | URL field sin feedback de error | Agregado mensaje de validación + error `<p>` |
| B9 | `CrearEstudiante.js` | `hasAttribute("required")` no estándar | Reemplazado por `inp.required` |
| B10 | `EstudianteDetalle.js` | `profileId` puede ser undefined | Early throw con `if (!sp?.id)` |

### Correcciones adicionales de sesiones anteriores

| # | Vista | Problema | Solución |
|---|---|---|---|
| B1 | `Login.js` | Error de password no se limpiaba al escribir | `nextElementSibling` → `closest("div").querySelector()` |
| B2 | `InstitucionForm.js` | Race condition en select de barrio | Flag + variable pendiente en lugar de `setTimeout` |
| B3 | `CrearAdmin.js` | `role_id: 2` hardcodeado | Lookup dinámico vía `api/user-roles` |
| B4 | `CampañaForm.js` | No validaba end_date >= start_date | Validación agregada |

### Nuevas funcionalidades

- **Eliminar institución** (`GestionInstituciones.js`): Botón rojo con ConfirmDialog (solo SuperAdmin)
- **Editar institución** (`Institucion.js`): Botón en hero section (solo SuperAdmin)
- **Confirmar contraseña** (`CrearAdmin.js`): Nuevo campo con validación de coincidencia
- **Debounce en búsquedas** (`Estudiantes.js`, `GestionInstituciones.js`): 300ms de espera antes de filtrar
- **Loading state** (`CrearEstudiante.js`): Spinner mientras cargan los 6 catálogos

### Accesibilidad

- **Sidebar**: `aria-expanded` ahora se actualiza al togglear
- **Permisos**: `auth.js` ya no duplica `hasRole()`/`isAdmin()` — `utils/permissions.js` es la única fuente

---

## [1.7.0] — 2026-07-16 — Validaciones y Polish (Fase 3) — MVP Completo ✅

### HU-11: Perfil vinculado a campaña activa
- **Perfil.js**: Al cargar como ESTUDIANTE, verifica campañas disponibles via `getAvailableCampaigns()`. Sin campañas activas: formulario deshabilitado + banner informativo ámbar. Campos con clase `disabled` + `cursor-not-allowed`. Botones Guardar/Cancelar ocultos.

### Validaciones edición de estudiante
- **EstudianteDetalle.js** (modo edición): Validación de formato email (regex) y teléfono (7-20 dígitos/guiones/espacios) antes de enviar. Errores inline en `#edit-message`.

### HU-12: Mostrar quién actualizó
- **Backend**: `PUT /api/people/:id` y `PUT /api/students/:id` ahora almacenan `updated_by_name` + `updated_by_role` en cada entrada de `db.updates`
- **Backend**: `GET /api/people/:id` devuelve `last_update_by_name` y `last_update_by_role`
- **Backend/utils.js**: `enrichStudentProfile()` también incluye estos campos en el listado de estudiantes
- **EstudianteDetalle.js**: Muestra "por Nombre Apellido" junto al semáforo de actualización
- **Perfil.js**: Muestra fecha + quién actualizó en el encabezado del formulario

---

## [1.6.0] — 2026-07-16 — Login UX y Búsqueda (Fase 2)

### F1: Forgot password
- **Login.js**: Agregado link "¿Olvidaste tu contraseña?" que abre modal de recuperación
- **Backend**: Nuevo endpoint `POST /api/auth/forgot-password` — valida username existe y responde con email simulado
- Modal con validación de campo, spinner de carga, manejo de errores, cierre con Escape/click fuera

### F2: Remember me
- **Login.js**: Checkbox "Recordar mis datos" (marcado por defecto)
- **auth.js**: `Login()` acepta parámetro `remember`. Si false, guarda en `sessionStorage` en vez de `localStorage`
- **http.js**: Token se obtiene via `Auth.getToken()` en vez de `localStorage.getItem()` — auth.js es la única fuente de verdad

### F13: Búsqueda en GestionUsuarios
- **GestionUsuarios.js**: Input de búsqueda con debounce 200ms. Filtra por nombre completo, username y rol (admin/superadmin/estudiante). Contador de resultados. Empty state cuando no hay matches.

---

## [1.5.0] — 2026-07-16 — Gaps Críticos MVP (Fase 1)

### HU-13: Dashboard con indicadores
- **DashboardSuperAdmin.js**: Conectado `StudentService.getDashboardStats()` + `StatsCard.render()` — 4 cards (Total Estudiantes, Egresados, Actualizados, Pendientes)
- **DashboardAdmin.js**: Mismo patrón con filtro por `institutionId`
- `StatsCard.js` ya no es componente huérfano — activamente usado en ambos dashboards

### HU-08: institution_id en creación de campaña
- **CampañaForm.js**: Agregado `scope_type` e `institution_id` al payload de creación/edición
- ADMINISTRADOR ahora envía `{ scope_type: "INSTITUTION", institution_id: N }` automáticamente

### GestionUsuarios routing
- **main.js**: Agregada ruta `/usuarios` para SUPERADMIN
- **Sidebar.js**: Agregado enlace "Usuarios" en menú de SUPERADMIN

### HU-02: Desactivar institución (reemplaza hard delete)
- **Backend**: Agregado campo `active: true` en creación. Soporte `active` en PUT. Nuevo `PATCH /api/institutions/:id/toggle-active`
- **http.js**: Agregado método `patch()`
- **institutionService.js**: Agregado `toggleInstitutionActive(id)`
- **GestionInstituciones.js**: Botón rojo "Eliminar" reemplazado por toggle "Desactivar"/"Activar". Badge "Activa"/"Inactiva" visible en card

---

## [1.4.0] — 2026-07-16 — Deuda Técnica Frontend

### Correcciones

| # | Archivo | Problema | Solución |
|---|---|---|---|
| T2 | `services/*` | Sin caché de catálogos estáticos | Creado `utils/cache.js` con `getCached(key, fetcher, ttl)` — TTL de 5 min. Usado en Estudiantes.js para grades/genders/statuses |
| T4 | `Estudiantes.js` | PAGE_SIZE=8 disparejo con grid-cols-3 | Cambiado a PAGE_SIZE=9 (múltiplo de 3, filas completas) |
| T8 | `CampaignCard.js` | Magic date `2099-12-31` | Reemplazado por `null`, lógica condicional para campañas sin fin |
| T9 | `FilterBar.js` | `setTimeout(0)` frágil | Binding directo de eventos sin defer |
| T10 | `StudentList.js` | `setTimeout(0)` frágil | Binding directo de eventos sin defer |
| T11 | `GestionUsuarios.js` | `min-w-[120px]` no Tailwind v4 | Reemplazado por `flex-shrink-0 w-28` |

---

## [1.1.0] — 2026-07-16 — Refactor Arquitectónico

### Arquitectura

- **Creado `frontend/src/utils/dates.js`**: Centraliza toda la lógica de fechas duplicada — `formatDate()`, `getUpdateStatus()`, `getCampaignStatus()`, `getUpdateColor()`. Elimina ~80 líneas duplicadas en 5+ vistas y componentes.
- **Creado `frontend/src/utils/errorHandler.js`**: `createErrorView()` reemplaza el patrón catch de 8 líneas idéntico en 10 vistas. Reduce ~80 líneas de HTML repetido.
- **Creado `frontend/src/utils/permissions.js`**: Helpers `hasRole()`, `isAdmin()`, `canManageStudents()`, `canManageCampaigns()`, `canManageInstitutions()`. Centraliza checks de permisos dispersos.
- **Creado `frontend/src/modules/store.js`**: Pub/Sub simple (`Store.on()`, `Store.emit()`, `Store.off()`) para estado compartido entre vistas.

### Módulos core mejorados

- **`modules/auth.js`**: Añadido `hasRole(...roles)`. `isAdmin()` ahora incluye SUPERADMIN + ADMINISTRADOR.
- **`modules/http.js`**: Añadido `getJSON(endpoint)` = `get().then(r => r.json())` para eliminar patrón repetitivo.

### Componentes refactorizados

- **`StudentList.js`**: Eliminados `_getUpdateStatusColor()` y `_formatDate()` locales — ahora importa `getUpdateColor()` y `formatDate()` de `utils/dates.js`.
- **`FilterBar.js`**: IDs globales (`#filter-grade`, `#filter-gender`, etc.) reemplazados por `data-filter` attributes para evitar colisiones y mejorar encapsulamiento.

### Vistas refactorizadas (14 vistas)

| Vista | Cambios |
|---|---|
| `Estudiantes.js` | Eliminado `window._activeFilters` → variable local `currentFilters`. Imports de dates/permissions/errorHandler. `http.getJSON()`. |
| `EstudianteDetalle.js` | Lógica de fechas/estados extraída a utils. `http.getJSON()`. `createErrorView()`. `isAdmin()` de permissions. |
| `CampañaDetalle.js` | `getCampaignStatus()` reemplaza lógica local de estado (activa/próxima/finalizada). `formatDate()`. `isAdmin()`. `createErrorView()`. |
| `Campañas.js` | `getCampaignStatus()` elimina `getStatus()` local. `createErrorView()`. |
| `DashboardSuperAdmin.js` | `createErrorView()`. |
| `DashboardAdmin.js` | `createErrorView()`. |
| `DashboardEstudiante.js` | `createErrorView()`. |
| `GestionInstituciones.js` | `createErrorView()`. |
| `GestionUsuarios.js` | `createErrorView()`. |
| `MisCampañas.js` | `createErrorView()`. |
| `Institucion.js` | `http.getJSON()`. `createErrorView()`. |
| `CrearEstudiante.js` | `http.getJSON()`. |
| `InstitucionForm.js` | `http.getJSON()`. |

### Base de datos limpiada

- **`db.json`**: Vacíadas todas las entidades (credentials, people, institutions, student_profiles, campaigns, enrollments, etc.). Solo se conservan catálogos (roles, tipos de documento, géneros, grados, estados, localidades, barrios).
- **Seed mínimo**: 2 usuarios funcionales para login — `admin_global` (SUPERADMIN) y `admin_n1`/`admin_n2` (ADMINISTRADOR), cada uno con su institución y persona asociada. Password: `123456`.

### Build

- **43 módulos transformados, 0 errores.** Build exitoso.

---

## [1.0.0] — MVP Inicial

### Funcionalidades completadas
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
- **Limpieza del proyecto**: creado `.gitignore`, eliminados archivos no usados del backend real, eliminado `frontend/dist/`

---

## [1.9.0] — 2026-07-16 — Scope por rol, Credenciales de Estudiante, Perfil Read-Only

### Scope derivado del rol (no del formulario)
- **Backend** (`POST /api/campaigns`): El alcance ya no se recibe del body. Se deriva de `req.user.role`: SUPERADMIN→GLOBAL, ADMINISTRADOR→INSTITUTION (con `req.user.institution_id`).
- **Frontend** (`CampañaForm.js`): Eliminado el selector de alcance. El formulario ya no envía `scope_type`/`institution_id`.

### Credenciales al crear estudiante
- **Backend** (`POST /api/people`): Ahora requiere `username`+`password`. Crea un credential con `role_id=3`, lo vincula a la persona via `credential_id`. Valida unicidad de username.
- **Frontend** (`CrearEstudiante.js`): Agregados campos Usuario y Contraseña con validación de longitud mínima (6 caracteres).

### Credencial visible en detalle de estudiante
- **Backend** (`GET /api/people/:id`): Ahora incluye `credential_username` en la respuesta.
- **Frontend** (`EstudianteDetalle.js`): Muestra el username del estudiante en la grilla de información personal (visible solo para ADMIN).

### Perfil read-only + flujo de edición post-inscripción
- **`Perfil.js`**: Convertido a solo lectura — muestra datos personales como texto, con indicador de última actualización. Sin formulario ni botones de edición.
- **`PerfilEdit.js`** (nuevo): Formulario de actualización de datos (nombre, apellido, email, teléfono, dirección). Accesible solo desde la redirección tras inscribirse en una campaña.
- **`DashboardEstudiante.js`**: Tras inscribirse exitosamente, redirige a `/perfil/editar`.
- **`main.js`**: Nueva ruta `/perfil/editar` → `PerfilEdit` (solo ESTUDIANTE).

### Creador visible en tarjetas de campaña
- **Backend** (`utils.js`, `enrichCampaign`): Ahora incluye `created_by_username` y `created_by_role` resolviendo la credential y el rol asociados a `created_by_credentials_id`.
- **Frontend** (`CampaignCard.js`): Muestra "Creado por: ..." en cada tarjeta, debajo del contador de inscritos.

### Limpieza de código muerto
- Eliminados `GestionUsuarios.js` (sin ruta) y `credentialService.js` (solo usado por GestionUsuarios).
- Eliminado import sin uso de `CampaignService` en `PerfilEdit.js`.

### Documentación
- Agregados comentarios explicativos al inicio de todos los archivos (19 views, 11 components, 5 services, 3 modules, 5 utils).
- `README.md`: Tabla de rutas actualizada, conteo de vistas (19).
- `backend/server.js`: Header de endpoints actualizado con todos los endpoints reales.
- `backend/README.md`: Tabla de personas actualizada con notas sobre credentials.
- `backend/MIGRATION_GUIDE.md`: Sección de cambios importantes respecto al mock; tabla de restricciones por rol actualizada; checklist extendido.
- `IMPROVEMENTS.md`: 6 nuevas entradas resueltas (v1.9.0).
- `ROADMAP.md`: Actualizado.

---

## Archivos relevantes

| Archivo | Descripción |
|---|---|
| `backend/server.js` | Mock API Express (~1200 líneas) |
| `backend/db.json` | Base de datos JSON (catálogos + seed mínimo) |
| `backend/seed/` | Generador de datos de prueba |
| `frontend/src/main.js` | Definición de rutas |
| `frontend/src/modules/router.js` | Router SPA custom |
| `frontend/src/modules/auth.js` | Auth state + helpers |
| `frontend/src/modules/http.js` | Cliente HTTP |
| `frontend/src/utils/dates.js` | Utilidades de fechas |
| `frontend/src/utils/errorHandler.js` | Helper de error |
| `frontend/src/utils/permissions.js` | Helper de permisos |
| `frontend/src/utils/filters.js` | Filtros de estudiantes |
| `frontend/src/views/` | 19 vistas |
| `frontend/src/components/` | 11 componentes |
| `frontend/src/services/` | 4 servicios API |
