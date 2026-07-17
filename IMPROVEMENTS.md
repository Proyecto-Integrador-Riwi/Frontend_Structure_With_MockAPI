# Registro de Mejoras — NexoEdu

## Propósito
Este archivo documenta todos los puntos de mejora identificados durante el análisis
del proyecto, organizados por área. Sirve como registro maestro para trackear
qué se ha resuelto y qué falta, complementando el changelog en SUMMARY.md.

## Convenciones
- ✅ Resuelto — implementado y verificado
- 🔧 En progreso — siendo trabajado
- ⏳ Pendiente — identificado, no iniciado
- 📌 Referencia: [vX.Y.Z] → entry en SUMMARY.md

---

## 1. Arquitectura y Patrones (Frontend)

### ✅ Resueltos [v1.1.0]

| # | Punto | Solución |
|---|---|---|
| 1 | Lógica de fechas duplicada (formatDate, updateStatus, campaignStatus) en 5+ vistas | Creado `utils/dates.js` — funciones centralizadas |
| 2 | Bloque catch idéntico de 8 líneas en 10+ vistas | Creado `utils/errorHandler.js` — `createErrorView()` |
| 3 | Checks de permisos dispersos (`user?.rol === "X"`) en toda la app | Creado `utils/permissions.js` + `auth.hasRole()` |
| 4 | Sin estado compartido entre vistas (comunicación implícita) | Creado `modules/store.js` — Pub/Sub |
| 5 | `window._activeFilters` como estado global en Estudiantes.js | Eliminado — variable local `currentFilters` |
| 6 | `http.get(...).then(r => r.json())` repetido en 5+ vistas | Añadido `http.getJSON()` |
| 7 | IDs hardcodeados (#filter-grade, #filter-gender, etc.) en FilterBar | Reemplazados por `data-filter` attributes |
| 8 | `_getUpdateStatusColor` y `_formatDate` locales en StudentList | Reemplazados por imports de `utils/dates.js` |
| 9 | db.json con datos masivos (122+ estudiantes) que dificultaban debugging | Limpiada — solo seed mínimo funcional (3 credenciales, 2 instituciones, 3 personas) |

### ✅ Resueltos [v1.9.0]

| # | Punto | Solución |
|---|---|---|
| 10 | Scope de campaña seleccionable por el usuario — debía derivarse del rol | `POST /api/campaigns` ahora deriva scope de `req.user.role` (SUPERADMIN→GLOBAL, ADMIN→INSTITUTION). Selector de alcance eliminado del formulario. |
| 11 | Crear estudiante no generaba credential — el estudiante no podía loguearse | `POST /api/people` ahora acepta `username`+`password`, crea credential con role_id=3 y lo vincula a la persona. Formulario actualizado con campos de credencial. |
| 12 | Perfil de estudiante permitía edición directa — debía ser solo post-inscripción | `Perfil.js` convertido a solo lectura. Nuevo `PerfilEdit.js` + ruta `/perfil/editar` accesible solo tras inscribirse en campaña. |
| 13 | No se mostraba quién creó la campaña en las tarjetas del grid | `enrichCampaign()` ahora incluye `created_by_username` y `created_by_role`. `CampaignCard.js` muestra "Creado por: ..." en cada tarjeta. |
| 14 | No se mostraba el username de credential en detalle de estudiante | `GET /api/people/:id` ahora incluye `credential_username`. `EstudianteDetalle.js` lo muestra para ADMIN. |
| 15 | Código muerto: GestionUsuarios.js, credentialService.js | Archivos eliminados (sin rutas ni imports activos). |

---

## 2. Backend Mock

### ✅ Resueltos [v1.2.0]

| # | Punto | Solución |
|---|---|---|
| 1 | `server.js` monolítico (1526 líneas) sin organización interna | Refactorizado con secciones claras, funciones helper extraídas y archivo `utils.js` |
| 2 | Duplicación: enrichment de campañas (4 repeticiones idénticas) | Helper `enrichCampaign()` en `utils.js` |
| 3 | Duplicación: validación de scope individual (2 bloques idénticos) | Helper `checkCampaignScope()` en `utils.js` |
| 4 | Duplicación: dashboard stats (2 bloques de ~50 líneas) | Helper `computeDashboardStats()` en `utils.js` |
| 5 | Duplicación: cálculo de edad (5 fórmulas idénticas) | Helper `calcAge()` en `utils.js` |
| 6 | Duplicación: filtro de campaña activa (7 repeticiones) | Helper `isCampaignActive()` en `utils.js` |
| 7 | Duplicación: last update lookup (3 repeticiones) | Helper `getLastUpdate()` en `utils.js` |
| 8 | ID generation frágil (`.length+1` en enrollments/updates, `Date.now()` en scope) | Helper `nextId()` en `utils.js` |
| 9 | `localities_id` typo (20 ocurrencias) | Renombrado a `locality_id` en server.js y seed/index.js |
| 10 | Sin `try/catch` en `loadDatabase()` / `saveDatabase()` | Agregado manejo de errores con fallback |
| 11 | Sin middleware global de error | Agregado `app.use((err, req, res, next) => ...)` centralizado |
| 12 | Sesiones sin expiración (nunca se invalidan) | Agregado TTL de 24h + cleanup periódico |
| 13 | `/api/campaigns/pinned` sin `requireRole` (comentario decía "para SuperAdmin") | Agregado `requireRole('SUPERADMIN')` |
| 14 | `PORT` hardcodeado a 3001 | Ahora usa `process.env.PORT \|\| 3001` |

### ⏳ Pendientes

| # | Punto | Prioridad | Nota |
|---|---|---|---|
| 15 | Contraseñas en texto plano | Baja | Aceptable para mock — el backend real las manejará con hashing |
| 16 | Sin paginación en GET /api/students | Baja | Aceptable para mock — el backend real la implementará |
| 17 | Magic numbers (status_id 1/2/3, 30 días) | Baja | Menor — no bloquearía migración |

---

## 3. UX/UI (Frontend)

### ⏳ Pendientes — 121 issues identificados [v1.3.0]

#### Funcionalidades faltantes

| # | Prioridad | Vista/Archivo | Punto | Estado |
|---|---|---|---|---|
| F1 | Alta | Login | No hay "Forgot password?" — usuarios no pueden autorecuperar credenciales | ✅ |
| F2 | Alta | Login | No hay "Remember me" — sesión siempre persistida en localStorage | ✅ |
| F3 | Alta | `auth.js` | No hay verificación de expiración de token — token stale da acceso indefinido | ⏳ |
| F4 | Alta | Dashboards | Sin tarjetas de estadísticas (total estudiantes, egresados, actualizados, pendientes) | ✅ |
| F5 | Alta | Dashboards | Sin gráficas/charts — no hay representación visual de datos | ⏳ |
| F6 | Alta | Dashboards | Sin feed de actividad reciente — no hay log de cambios | ⏳ |
| F7 | Alta | Dashboards | Sin indicador de progreso de actualización de estudiantes | ⏳ |
| F8 | Alta | `CampañaForm.js` | No valida que end_date >= start_date | ✅ |
| F9 | Alta | `CrearEstudiante.js` | No dice cuáles son las credenciales iniciales del estudiante tras crearlo | ⏳ |
| F10 | Alta | `Estudiantes.js` | Sin debounce en búsqueda — se filtra en cada keystroke | ✅ |
| F11 | Alta | `GestionInstituciones.js` | Sin debounce en búsqueda | ✅ |
| F12 | Alta | `GestionInstituciones.js` | No hay botón de eliminar institución | ✅ |
| F13 | Alta | `GestionUsuarios.js` | Sin búsqueda/filtro de usuarios | ✅ |
| F14 | Alta | `Institucion.js` | No hay botón "Editar institución" | ✅ |
| F15 | Alta | `CrearAdmin.js` | No hay campo de confirmación de contraseña | ✅ |
| F16 | Alta | `CrearAdmin.js` | No tiene campo de email | ⏳ |
| F17 | Media | Global | Sin página 404 — rutas no encontradas redirigen a login | ⏳ |
| F18 | Media | Global | Sin actualización de título de página por vista | ⏳ |
| F19 | Media | Global | Sin advertencia de cambios no guardados al navegar | ⏳ |
| F20 | Media | Global | Sin auto-refresh / indicador de datos obsoletos | ⏳ |
| F21 | Media | Global | Sin exportación a CSV/Excel/PDF en ninguna lista | ⏳ |
| F22 | Media | Global | Sin campana de notificaciones | ⏳ |
| F23 | Media | `Campañas.js` | Sin opciones de ordenamiento (fecha, inscripciones, nombre) | ⏳ |
| F24 | Media | `CampañaDetalle.js` | Sin botón "Copiar enlace" para compartir campaña | ⏳ |
| F25 | Media | `CampañaDetalle.js` | Sin exportar lista de inscritos a CSV | ⏳ |
| F26 | Media | `CampañaDetalle.js` | Sin desglose por institución de inscritos | ⏳ |
| F27 | Media | `CampañaForm.js` | Sin upload de imagen/archivo — solo URL | ⏳ |
| F28 | Media | `CampañaForm.js` | Sin contador de caracteres en descripción | ⏳ |
| F29 | Media | `Estudiantes.js` | Sin selección múltiple / operaciones por lote | ⏳ |
| F30 | Media | `EstudianteDetalle.js` | Sin área de carga de documentos | ⏳ |
| F31 | Media | `EstudianteDetalle.js` | Sin botón de impresión de perfil | ⏳ |
| F32 | Media | `EstudianteDetalle.js` | Sin historial de cambios / auditoría | ⏳ |
| F33 | Media | `CrearEstudiante.js` | Sin validación de formato de email (frontend) | ⏳ |
| F34 | Media | `CrearEstudiante.js` | Sin validación de formato de teléfono | ⏳ |
| F35 | Media | `InstitucionForm.js` | Sin validación de código DANE | ⏳ |
| F36 | Media | `GestionUsuarios.js` | Sin columna "Último login" o "Creado en" | ⏳ |
| F37 | Media | `GestionUsuarios.js` | Sin botón "Editar usuario" | ⏳ |
| F38 | Media | `MisCampañas.js` | Sin botón de desinscripción de campaña | ⏳ |
| F39 | Media | `MisCampañas.js` | Sin filtro de estado de campaña (activas/completadas) | ⏳ |
| F40 | Media | `Perfil.js` | Sin upload de foto de perfil | ⏳ |
| F41 | Media | `Configuracion.js` | Sin preferencias de notificaciones | ⏳ |
| F42 | Media | `Configuracion.js` | Sin ajustes de accesibilidad (tamaño fuente, contraste) | ⏳ |
| F43 | Media | `Institucion.js` | Sin acción rápida para crear campaña para esta institución | ⏳ |
| F44 | Media | `CrearAdmin.js` | Sin diálogo de confirmación antes de crear | ⏳ |

#### Bugs

| # | Prioridad | Archivo | Línea | Punto | Estado |
|---|-----------|---------|-------|-------|--------|
| B1 | **Alta** | `Login.js` | 207 | Limpieza de error de password rota — `nextElementSibling` apunta al toggle button, no al error `<p>` | ✅ |
| B2 | Alta | `InstitucionForm.js` | 104 | Race condition en modo edición — `setTimeout(500)` para setear select de barrio puede ejecutarse antes de fetch | ✅ |
| B3 | Alta | `CrearAdmin.js` | 107 | `role_id: 2` hardcodeado — depende del orden del seed | ✅ |
| B4 | Media | `CampañaForm.js` | 100-103 | No valida end_date >= start_date | ✅ |
| B5 | Media | `DashboardSuperAdmin.js` | 29,31 | API call innecesaria — getAllCampaigns solo para top-5 enrolados | ✅ |
| B6 | Media | `DashboardEstudiante.js` | 86 | API de Toast inconsistente — mezcla `Toast.show()` y `Toast.success()` | ✅ |
| B7 | Baja | `CampañaDetalle.js` | 63-66 | URL multimedia inyectada directamente en `img.src` — falta protocolo rompe la imagen | ✅ |
| B8 | Baja | `CampañaForm.js` | 138 | URL field type="url" sin feedback de error si el browser lo bloquea | ✅ |
| B9 | Baja | `CrearEstudiante.js` | 270 | `hasAttribute("required")` no estándar — frágil si cambia HTML | ✅ |
| B10 | Baja | `EstudianteDetalle.js` | 192 | `profileId` puede ser undefined en cierto flujo | ✅ |

#### Deuda técnica

| # | Prioridad | Archivo | Punto | |
|---|---|---|---|---|
| T1 | Alta | `auth.js` | Token en localStorage sin capa de abstracción — vulnerable a XSS | ⏳ |
| T2 | Alta | `services/*` | Sin caché de catálogos estáticos (grades, genders, statuses se fetchan en múltiples vistas) | ✅ |
| T3 | Alta | `utils/permissions.js` vs `auth.js` | Lógica de permisos duplicada — `hasRole()`/`isAdmin()` en ambos archivos | ✅ |
| T4 | Alta | `Estudiantes.js` | PAGE_SIZE=8 con xl:grid-cols-3 — columnas no dividen el page size parejo | ✅ |
| T5 | Media | `http.js` | Sin interceptores — no puede loggear centralizadamente ni redirigir 401 | ⏳ |
| T6 | Media | `http.js` | Sin soporte multipart/form-data para uploads | ⏳ |
| T7 | Media | `services/*` | Sin retry logic para errores transitorios de red | ⏳ |
| T8 | Media | `CampaignCard.js` | Magic date '2099-12-31' hardcodeada | ✅ |
| T9 | Media | `FilterBar.js` | `setTimeout(0)` para deferir binding de eventos — frágil | ✅ |
| T10 | Media | `StudentList.js` | `setTimeout(0)` para eventos click — mismo patrón frágil | ✅ |
| T11 | Media | `GestionUsuarios.js` | `min-w-[120px]` no es Tailwind v4 — debería ser `min-w-30` o style inline | ✅ |
| T12 | Baja | `store.js` | No es un store real — era un event emitter sin estado | ✅ Eliminado (limp. v1.8.0) |
| T13 | Baja | `auth.js` | No hay refresh token mechanism | ⏳ |

#### Accesibilidad

| # | Prioridad | Archivo | Punto |
|---|-----------|---------|-------|
| A1 | Alta | `Navbar.js` / `Layout.js` | Sidebar toggle no actualiza `aria-expanded` |
| A2 | Alta | `CampaignCard.js` | Cards como click target sin `role="button"` ni `tabindex="0"` |
| A3 | Media | `Login.js` | Password toggle tiene `tabindex="-1"` — fuera del orden de tabulación |
| A4 | Baja | `Institucion.js` | SVG decorativo sin `aria-hidden="true"` |

#### Responsive Design

| # | Prioridad | Archivo | Punto |
|---|-----------|---------|-------|
| R1 | Media | `Institucion.js` | Hero con `h-64` fijo — muy grande en móvil 320px |
| R2 | Media | `DashboardSuperAdmin.js` | Skeleton heights fijas (`h-40`, `h-64`) en móvil |
| R3 | Baja | `Sidebar.js` | Sin botón "X" dentro del panel en móvil — solo backdrop |

#### Estados de carga faltantes

| # | Prioridad | Archivo | Punto |
|---|-----------|---------|-------|
| L1 | Alta | `CrearEstudiante.js` | Sin loading state mientras cargan catálogos — selects aparecen vacíos |

#### Estados vacíos

| # | Prioridad | Archivo | Punto |
|---|-----------|---------|-------|
| E1 | Baja | `DashboardAdmin.js` | Sin `EmptyState` para institution_id faltante |
| E2 | Baja | `Institucion.js` | Sin `EmptyState` para institución faltante |
| E3 | Baja | `Perfil.js` | Sin `EmptyState` si falla carga de perfil |

#### Error Feedback

| # | Prioridad | Archivo | Punto |
|---|-----------|---------|-------|
| EF1 | Alta | Global | Sin redirect a login en 401 — token expirado da error genérico, no redirige |

---

## 4. Backend Migration (a FastAPI)

### ⏳ Pendientes

| # | Punto | Estado |
|---|---|---|
| — | (postergado hasta que el equipo backend complete endpoints) | ⏳ |

---

## 5. Testing

### ⏳ Pendientes

| # | Punto | Estado |
|---|---|---|
| — | No existe setup de testing en el proyecto | ⏳ |

---

## Historial de referencias

| Versión | Cambios relacionados |
|---|---|
| v1.1.0 | Refactor arquitectónico frontend + limpieza db.json |
| v1.2.0 | Refactor backend mock — utilidades, desduplicación, errores, seguridad |
| v1.3.0 | Quick Wins UX/UI — 10 bugs corregidos, 4 features nuevas, accesibilidad |
| v1.7.0 | Fase 3 — Validaciones, HU-11, HU-12, MVP completo |
| v1.8.0 | Limpieza general — store.js, hero.png, funciones sin uso, CSS huérfano, seed reducido |
| v1.9.0 | Scope derivado de rol, credential en creación de estudiante, Perfil read-only, creador en tarjetas, código muerto eliminado |
