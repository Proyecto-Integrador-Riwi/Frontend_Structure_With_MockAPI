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
Ver `backend/README.md` (versión anterior al borrado) para la especificación completa.

### Endpoints requeridos

**Autenticación**
- `POST /api/auth/login` → `{ token, username, rol, person_id, institution_id?, student_profile_id? }`
- `GET  /api/auth/me` → Datos del usuario (requiere `Authorization: Bearer <token>`)

**Campañas**
- `GET    /api/campaigns` — Lista con filtros: `active`, `institution_id`, `scope_type`, `person_id`
- `GET    /api/campaigns/active` — Solo campañas vigentes
- `GET    /api/campaigns/pinned` — Campañas fijadas
- `GET    /api/campaigns/available/:personId` — Disponibles para una persona (filtra por target_population, scope, criteria)
- `GET    /api/campaigns/:id` — Detalle con scope, criteria, enrollment_count, enrolled students
- `POST   /api/campaigns` — Crear (requiere SUPERADMIN o ADMINISTRADOR)
- `PUT    /api/campaigns/:id` — Editar
- `DELETE /api/campaigns/:id` — Eliminar
- `POST   /api/campaigns/:id/enroll` — Inscribir estudiante (valida target_population, scope, criteria)

**Estudiantes**
- `GET  /api/students` — Lista con filtros: `institution_id`, `status_id`, `grade_id`, `gender_id`, `min_age`, `max_age`, `search`
- `GET  /api/students/campaign/:campaignId` — Estudiantes inscritos en campaña
- `PUT  /api/students/:studentProfileId` — Editar campos del perfil

**Personas**
- `POST /api/people` — Crear persona + perfil de estudiante
- `GET  /api/people/:id` — Detalle enriquecido (edad, género, documento, barrio, localidad, student_profile)
- `PUT  /api/people/:id` — Actualizar (campos: first_name, last_name, email, phone, address)

**Instituciones**
- `GET    /api/institutions` — Lista
- `GET    /api/institutions/:id` — Detalle
- `GET    /api/institutions/:id/students` — Estudiantes de la institución
- `POST   /api/institutions` — Crear (SUPERADMIN)
- `PUT    /api/institutions/:id` — Editar (SUPERADMIN)
- `DELETE /api/institutions/:id` — Eliminar (SUPERADMIN)

**Credenciales**
- `POST /api/credentials` — Crear usuario administrador (SUPERADMIN)

**Dashboard**
- `GET /api/dashboard/stats` — Estadísticas globales
- `GET /api/dashboard/stats/:institutionId` — Estadísticas por institución

**Catálogos**
- `GET /api/user-roles`, `/api/document-types`, `/api/genders`, `/api/grades`, `/api/statuses`, `/api/localities`, `/api/neighborhoods`

**Configuración**
- `POST /api/auth/change-password` — Cambiar contraseña

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
| CRUD campañas globales | ✅ | ❌ | ❌ |
| CRUD campañas institucionales | ✅ | ✅ | ❌ |
| Ver todos los estudiantes | ✅ | ❌ | ❌ |
| Ver estudiantes de su institución | ✅ | ✅ | ❌ |
| Ver/editar su perfil | ✅ | ✅ | ✅ |
| Inscribirse en campaña | ❌ | ❌ | ✅ |
| Dashboard estadísticas | ✅ | ✅ (solo su inst.) | ❌ |
| Crear administradores | ✅ | ❌ | ❌ |
| Crear estudiantes | ✅ | ✅ | ❌ |

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
- [ ] `GET /api/people/:id` retorna datos enriquecidos
- [ ] Respuestas coinciden con la estructura del mock
- [ ] Scripts de `package.json` raíz actualizados
- [ ] Frontend actualizado para apuntar al nuevo backend
- [ ] Pruebas de integración realizadas
