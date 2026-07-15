# Guía de Migración al Backend Real

## IMPORTANTE

Este documento explica qué archivos eliminar y qué cambios realizar cuando el equipo backend termine los endpoints reales con FastAPI + PostgreSQL.

---

## 1. ARCHIVOS A ELIMINAR

### Backend Mock
- `backend/server.js` - Servidor Express mock
- `backend/db.json` - Base de datos JSON
- `backend/seed/` - Toda la carpeta (generador de datos)

### Dependencias (opcional)
Si no se usan en el backend real:
```bash
npm uninstall json-server
```

---

## 2. ARCHIVOS A MODIFICAR

### `frontend/src/modules/auth.js`

**Cambiar la URL del API:**
```javascript
// ANTES (Backend mock)
export const API_URL = "http://localhost:3001"

// DESPUÉS (Backend real)
export const API_URL = "http://localhost:3000"
```

### `package.json` (raíz)

**Actualizar scripts:**
```json
{
  "scripts": {
    "dev:backend": "npm --prefix backend run dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\""
  }
}
```

**Eliminar script obsoleto:**
```json
// ELIMINAR:
"dev:mock": "npm --prefix backend run dev:mock",
"db:seed": "node backend/seed/index.js"
```

---

## 3. ENDPOINTS DEL BACKEND REAL

Asegúrate de que el backend real implemente los siguientes endpoints:

### Autenticación
- `POST /api/auth/login` → `{ token, username, rol, person_id, institution_id? }`
- `GET /api/auth/me` → Datos del usuario actual (requiere Authorization header)

### Campañas
- `GET /api/campaigns` → Lista de campañas (filtros: active, institution_id, scope_type, person_id)
- `GET /api/campaigns/active` → Solo campañas vigentes
- `GET /api/campaigns/pinned` → Campañas fijadas
- `GET /api/campaigns/available/:personId` → Campañas disponibles para una persona
- `POST /api/campaigns/:id/enroll` → Inscribirse (debe validar scope + criteria del estudiante)

### Estudiantes
- `GET /api/students` → Lista de estudiantes (filtros: institution_id, status_id, grade_id, gender_id, min_age, max_age). Requiere rol SUPERADMIN o ADMINISTRADOR.
- `GET /api/students/campaign/:campaignId` → Estudiantes inscritos en una campaña

### Instituciones
- `GET /api/institutions` → Lista de instituciones
- `GET /api/institutions/:id` → Detalle de una institución
- `GET /api/institutions/:id/students` → Estudiantes de una institución

### Dashboard
- `GET /api/dashboard/stats` → Estadísticas globales (requiere rol SUPERADMIN o ADMINISTRADOR)
- `GET /api/dashboard/stats/:institutionId` → Estadísticas de una institución (requiere rol SUPERADMIN o ADMINISTRADOR)

### Personas
- `GET /api/people/:id` → Detalle de una persona (con datos enriquecidos: edad, género, documento, barrio, localidad, student_profile)
- `PUT /api/people/:id` → Actualizar datos de una persona (estudiantes solo con campaña activa; campos permitidos: first_name, last_name, email, phone, address)

### Catálogos
- `GET /api/user-roles`
- `GET /api/document-types`
- `GET /api/genders`
- `GET /api/grades`
- `GET /api/statuses`
- `GET /api/localities`
- `GET /api/neighborhoods`

---

## 4. ESTRUCTURA ESPERADA DE RESPUESTAS

### Login
```json
{
  "token": "jwt_token_aqui",
  "username": "admin_global",
  "rol": "SUPERADMIN",
  "person_id": 1,
  "institution_id": null,
  "student_profile_id": null
}
```

### Estudiante
```json
{
  "id": 1,
  "people_id": 11,
  "institution_id": 1,
  "status_id": 1,
  "grade_id": 11,
  "start_date": "2023-08-15",
  "end_date": null,
  "person": {
    "id": 11,
    "first_name": "Juan",
    "last_name": "García López",
    "email": "juan.garcia@gmail.com",
    "phone": "3001234567",
    "document_type": 1,
    "document_number": "12345678",
    "address": "Calle 72 # 54-120",
    "age": 17
  },
  "institution": {
    "id": 1,
    "name": "I.E.D. Normal Superior de Barranquilla"
  },
  "status": "Activo",
  "grade": "11°",
  "gender": "Masculino",
  "locality": "Norte",
  "neighborhood": "Belén"
}
```

### Campaña
```json
{
  "id": 1,
  "title": "Actualización Datos Generales 2026",
  "type": "General",
  "description": "Campaña para actualizar información...",
  "sponsor": "Alcaldía de Barranquilla",
  "created_by_credentials_id": 1,
  "start_date": "2026-01-15",
  "end_date": "2026-12-31",
  "url_multimedia": null,
  "pinned": true,
  "scope": [
    {
      "id": 1,
      "scope_type": "GLOBAL",
      "campaign_id": 1,
      "institution_id": null,
      "neighborhood_id": null,
      "localities_id": null
    }
  ],
  "criteria": [],
  "enrollment_count": 150
}
```

### Institución
```json
{
  "id": 1,
  "institution_name": "I.E.D. Normal Superior de Barranquilla",
  "director": "María Fernanda López Castillo",
  "address": "Calle 72 # 54-120",
  "neighborhood_id": 1,
  "credential_id": 2,
  "dane_code": "110001000001",
  "neighborhood": "Belén",
  "locality": "Norte",
  "student_count": 18,
  "graduate_count": 12
}
```

### Estadísticas
```json
{
  "total_students": 122,
  "total_graduates": 79,
  "total_withdrawn": 12,
  "total_population": 213,
  "updated_count": 85,
  "pending_count": 128,
  "update_percentage": 40,
  "last_update_date": "2026-07-10T15:30:00.000Z"
}
```

### Persona (GET /api/people/:id)
```json
{
  "id": 11,
  "first_name": "Juan",
  "last_name": "García López",
  "email": "juan.garcia@gmail.com",
  "phone": "3001234567",
  "birth_date": "2009-03-15",
  "document_type_id": 1,
  "document_number": "12345678",
  "address": "Calle 72 # 54-120",
  "neighborhood_id": 1,
  "age": 17,
  "document_type": "Cédula de Ciudadanía",
  "gender": "Masculino",
  "neighborhood": "Belén",
  "locality": "Norte",
  "student_profile": {
    "id": 5,
    "grade": "11°",
    "status": "Activo",
    "institution": {
      "id": 1,
      "name": "I.E.D. Normal Superior de Barranquilla"
    }
  }
}
```

---

## 5. AUTENTICACIÓN

### Frontend (ya implementado)
El frontend envía el token en el header Authorization:
```
Authorization: Bearer <token>
```

### Backend Real
- Recibir el header Authorization
- Extraer el token
- Verificar/decodificar el token JWT
- Retornar 401 si el token es inválido
- Retornar 403 si el usuario no tiene permisos

---

## 6. RESTRICCIONES POR ROL

El backend real debe implementar las siguientes restricciones:

| Operación | SuperAdmin | Admin | Estudiante |
|-----------|------------|-------|------------|
| Ver todas las instituciones | ✅ | ❌ | ❌ |
| Ver su institución | ✅ | ✅ | ✅ (solo info) |
| Crear campañas globales | ✅ | ❌ | ❌ |
| Crear campañas institucionales | ✅ | ✅ | ❌ |
| Ver todos los estudiantes | ✅ | ❌ | ❌ |
| Ver estudiantes de su institución | ✅ | ✅ | ❌ |
| Inscribirse en campaña | ❌ | ❌ | ✅ (con validación scope+criteria) |
| Ver campañas disponibles | ✅ | ✅ | ✅ |
| Editar su perfil | ✅ | ✅ | ✅* |
| Ver estadísticas | ✅ | ✅ (solo su institución) | ❌ |

*Solo cuando hay campaña activa

---

## 7. PRUEBAS

### Credenciales de prueba (mismas que el mock)
- **SuperAdmin:** admin_global / 123456
- **Admin:** admin_n1 / 123456 (Institución 1)
- **Estudiante:** (ver db.json generado)

### Verificar endpoints
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_global","password":"123456"}'

# Obtener campañas activas (con token)
curl http://localhost:3000/api/campaigns/active \
  -H "Authorization: Bearer <token>"
```

---

## 8. CAMBIOS EN FRONTEND (si es necesario)

Si el backend real retorna una estructura diferente, ajustar los servicios:
- `frontend/src/services/campaignService.js`
- `frontend/src/services/studentService.js`
- `frontend/src/services/institutionService.js`
- `frontend/src/services/authService.js`

---

## 9. CHECKLIST DE MIGRACIÓN

- [ ] Backend real implementado con todos los endpoints
- [ ] JWT funcionando correctamente
- [ ] Restricciones por rol implementadas (`requireAuth`, `requireRole`)
- [ ] `POST /api/campaigns/:id/enroll` valida scope (GLOBAL/INSTITUTION/NEIGHBORHOOD/LOCALITY) y criteria (género, grado, estado, edad)
- [ ] `GET /api/students` restringe a rol SUPERADMIN o ADMINISTRADOR
- [ ] `GET /api/dashboard/stats` restringe a rol SUPERADMIN o ADMINISTRADOR
- [ ] `GET /api/people/:id` retorna datos enriquecidos (edad, género, documento, barrio, student_profile)
- [ ] `PUT /api/people/:id` permite campos: first_name, last_name, email, phone, address
- [ ] Respuestas del backend coinciden con la estructura esperada
- [ ] `GET /api/campaigns/available/:personId` incluye `enrollment_count`
- [ ] Frontend actualizado para apuntar a http://localhost:3000
- [ ] Archivos del backend mock eliminados
- [ ] Scripts de package.json actualizados
- [ ] Pruebas de integración realizadas
- [ ] Documentación actualizada
