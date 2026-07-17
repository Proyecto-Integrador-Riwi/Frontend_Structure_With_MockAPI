# Guía de Migración al Backend Real

> Este backend mock reemplaza una API real que el equipo backend debe construir.  
> Cuando esa API esté lista, sigue esta guía para reemplazar el mock.

---

## 1. Archivos a Eliminar

```
backend/                 # Toda la carpeta
frontend/src/services/   # Los servicios mock (reemplazar por llamadas reales)
```

---

## 2. Contracto de API

El frontend espera que la API real implemente exactamente los mismos endpoints, parámetros y estructuras de respuesta que el mock.  
Ver `backend/README.md` para la especificación completa.

### Cambios importantes respecto al mock original

| Cambio | Detalle |
|--------|---------|
| `POST /api/people` | Ahora **requiere** `username` + `password`. Crea un credential con `role_id=3` (ESTUDIANTE) y lo vincula a la persona via `credential_id`. |
| `GET /api/people/:id` | Nuevo campo en respuesta: `credential_username` (string o null). |
| `POST /api/campaigns` | Ya NO acepta `scope_type`/`institution_id`/`neighborhood_id`/`locality_id` del body. El scope se deriva del rol: SUPERADMIN→GLOBAL, ADMINISTRADOR→INSTITUTION (con `req.user.institution_id`). |
| `GET /api/campaigns` (+ variantes) | Cada objeto incluye `created_by_username` y `created_by_role`. |
| `GET /api/credentials` | Ya no se usa para estudiantes. Solo para administradores creados via `POST /api/credentials`. |

### Endpoints requeridos

**Autenticación**
- `POST /api/auth/login` → `{ token, username, rol, person_id, institution_id?, student_profile_id? }`
- `GET  /api/auth/me` → Datos del usuario (requiere `Authorization: Bearer <token>`)

**Campañas**
- `GET    /api/campaigns` — Lista con filtros: `active`, `institution_id`, `scope_type`, `person_id`
- `GET    /api/campaigns/active` — Solo campañas vigentes
- `GET    /api/campaigns/pinned` — Campañas fijadas (SUPERADMIN)
- `GET    /api/campaigns/available/:personId` — Disponibles para una persona (filtra por target_population, scope, criteria)
- `GET    /api/campaigns/:id` — Detalle con scope, criteria, enrollment_count, enrolled students
- `GET    /api/campaigns/:id/progress` — Progreso de actualización por estudiante
- `POST   /api/campaigns` — Crear (scope derivado del rol, no del body)
- `PUT    /api/campaigns/:id` — Editar
- `DELETE /api/campaigns/:id` — Eliminar
- `POST   /api/campaigns/:id/enroll` — Inscribir estudiante (valida target_population, scope, criteria)

**Estudiantes**
- `GET  /api/students` — Lista con filtros: `institution_id`, `status_id`, `grade_id`, `gender_id`, `min_age`, `max_age`, `search`
- `GET  /api/students/campaign/:campaignId` — Estudiantes inscritos en campaña
- `PUT  /api/students/:studentProfileId` — Editar campos del perfil por ADMIN

**Personas**
- `POST /api/people` — Crear persona + perfil de estudiante + credential (requiere username/password)
- `GET  /api/people/:id` — Detalle enriquecido (edad, género, documento, barrio, localidad, student_profile, credential_username)
- `PUT  /api/people/:id` — Actualizar por estudiante (campos: first_name, last_name, email, phone, address; requiere campaña activa)

**Instituciones**
- `GET    /api/institutions` — Lista
- `GET    /api/institutions/:id` — Detalle
- `GET    /api/institutions/:id/students` — Estudiantes de la institución
- `POST   /api/institutions` — Crear (SUPERADMIN)
- `PUT    /api/institutions/:id` — Editar (SUPERADMIN)
- `DELETE /api/institutions/:id` — Eliminar (SUPERADMIN)
- `PATCH  /api/institutions/:id/toggle-active` — Activar/desactivar (SUPERADMIN)

**Credenciales**
- `POST /api/credentials` — Crear usuario administrador (SUPERADMIN). Para estudiantes, usar `POST /api/people`.

**Dashboard**
- `GET /api/dashboard/stats` — Estadísticas globales
- `GET /api/dashboard/stats/:institutionId` — Estadísticas por institución

**Catálogos**
- `GET /api/user-roles`, `/api/document-types`, `/api/genders`, `/api/grades`, `/api/statuses`, `/api/localities`, `/api/neighborhoods`

**Configuración**
- `POST /api/auth/change-password` — Cambiar contraseña
- `POST /api/auth/forgot-password` — Recuperación de contraseña

---

## 3. Autenticación y Roles

El frontend envía el token en cada petición:
```
Authorization: Bearer <token>
```

El backend real debe:
1. Extraer y verificar el token (JWT)
2. Poblar `req.user` con `{ id, username, role, person_id, institution_id?, student_profile_id? }`
3. Retornar 401 si el token es inválido/expirado
4. Retornar 403 si el rol no tiene permiso

### Restricciones por rol

| Operación | SUPERADMIN | ADMINISTRADOR | ESTUDIANTE |
|-----------|:----------:|:-------------:|:----------:|
| CRUD instituciones | ✅ | ❌ | ❌ |
| CRUD campañas (scope GLOBAL) | ✅ | ❌ | ❌ |
| CRUD campañas (scope INSTITUTION) | ✅ | ✅ | ❌ |
| Ver todos los estudiantes | ✅ | ❌ | ❌ |
| Ver estudiantes de su institución | ✅ | ✅ | ❌ |
| Crear estudiantes (con credential) | ✅ | ✅ | ❌ |
| Ver detalle de estudiante | ✅ | ✅ | ❌ |
| Editar perfil propio (con campaña activa) | ❌ | ❌ | ✅ |
| Inscribirse en campaña | ❌ | ❌ | ✅ |
| Dashboard estadísticas | ✅ | ✅ (solo su inst.) | ❌ |
| Crear administradores | ✅ | ❌ | ❌ |
| Ver su perfil (solo lectura) | ❌ | ✅ | ✅ |

---

## 4. Cambios en Frontend

Cuando la API real esté lista:

1. **Eliminar la carpeta `backend/` completa**
2. **Eliminar `frontend/src/services/`** y reemplazar con llamadas a la API real
3. **Configurar la URL del API** en `frontend/src/modules/auth.js`:
   ```js
   export const API_URL = "http://localhost:3000" // Puerto del backend real
   ```
4. **Actualizar `vite.config.js`** si es necesario (proxy)
5. **Actualizar `package.json` raíz** para quitar scripts del mock

---

## 5. Checklist de Migración

- [ ] Todos los endpoints implementados
- [ ] JWT funcionando con `Authorization: Bearer`
- [ ] `requireAuth` y `requireRole` implementados
- [ ] `POST /api/campaigns/:id/enroll` valida target_population, scope y criteria
- [ ] `GET /api/students` filtra por search/status/grade/gender/age
- [ ] `GET /api/people/:id` retorna datos enriquecidos (incluye `credential_username`)
- [ ] `POST /api/people` crea credential interno para estudiantes (requiere username/password)
- [ ] `POST /api/campaigns` deriva scope del rol (SUPERADMIN→GLOBAL, ADMIN→INSTITUTION) en vez del body
- [ ] `GET /api/campaigns` devuelve `created_by_username` y `created_by_role` en cada campaña
- [ ] Respuestas coinciden con la estructura del mock
- [ ] Scripts de `package.json` raíz actualizados
- [ ] Frontend actualizado para apuntar al nuevo backend
- [ ] Pruebas de integración realizadas
