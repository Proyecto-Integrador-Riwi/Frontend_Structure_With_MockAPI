# Backend Mock — NexoEdu

> **PROVISIONAL** — Solo para desarrollo del frontend.  
> Cuando el backend real esté listo, eliminar esta carpeta y seguir la [Guía de Migración](./MIGRATION_GUIDE.md).

---

## Inicio Rápido

```bash
# 1. Generar datos de prueba
npm run seed

# 2. Iniciar servidor mock
npm start
```

El servidor corre en `http://localhost:3001`.

---

## Credenciales de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| SuperAdmin | `admin_global` | `123456` |
| Admin (Normal Superior) | `admin_n1` | `123456` |
| Admin (Uninorte) | `admin_n2` | `123456` |
| Estudiante (M, 11°, activo) | `carlos.garcia4` | `123456` |
| Estudiante (F, 10°, activa) | `maria.lopez5` | `123456` |
| Estudiante (M, 11°, egresado) | `jose.rodriguez6` | `123456` |

---

## Endpoints

### Autenticación
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/auth/login` | — | — |
| GET | `/api/auth/me` | Sí | Todos |
| POST | `/api/auth/change-password` | Sí | Todos |
| POST | `/api/auth/forgot-password` | — | — |

### Campañas
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/campaigns` | Sí | Todos |
| GET | `/api/campaigns/active` | Sí | Todos |
| GET | `/api/campaigns/pinned` | Sí | Todos |
| GET | `/api/campaigns/available/:personId` | Sí | Todos |
| GET | `/api/campaigns/:id` | Sí | Todos |
| POST | `/api/campaigns` | Sí | SUPERADMIN, ADMINISTRADOR |
| PUT | `/api/campaigns/:id` | Sí | SUPERADMIN, ADMINISTRADOR |
| DELETE | `/api/campaigns/:id` | Sí | SUPERADMIN, ADMINISTRADOR |
| POST | `/api/campaigns/:id/enroll` | Sí | Todos |

### Estudiantes
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/students` | Sí | SUPERADMIN, ADMINISTRADOR |
| GET | `/api/students/campaign/:campaignId` | Sí | Todos |
| PUT | `/api/students/:studentProfileId` | Sí | SUPERADMIN, ADMINISTRADOR |

### Personas
| Método | Ruta | Auth | Roles | Notas |
|--------|------|------|-------|-------|
| POST | `/api/people` | Sí | SUPERADMIN, ADMINISTRADOR | Requiere `username`+`password` — crea credential interno (role_id=3) |
| GET | `/api/people/:id` | Sí | Todos | Incluye `credential_username` si existe |
| PUT | `/api/people/:id` | Sí | ESTUDIANTE | Solo permite editar con campaña activa. Campos: first_name, last_name, email, phone, address |

### Instituciones
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/institutions` | Sí | Todos |
| GET | `/api/institutions/:id` | Sí | Todos |
| GET | `/api/institutions/:id/students` | Sí | Todos |
| POST | `/api/institutions` | Sí | SUPERADMIN |
| PUT | `/api/institutions/:id` | Sí | SUPERADMIN |
| DELETE | `/api/institutions/:id` | Sí | SUPERADMIN |
| PATCH | `/api/institutions/:id/toggle-active` | Sí | SUPERADMIN |

### Credenciales
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/credentials` | Sí | SUPERADMIN |
| PUT | `/api/credentials/:id/toggle-active` | Sí | SUPERADMIN |
| POST | `/api/credentials` | Sí | SUPERADMIN |

### Dashboard
| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/dashboard/stats` | Sí | SUPERADMIN, ADMINISTRADOR |
| GET | `/api/dashboard/stats/:institutionId` | Sí | SUPERADMIN, ADMINISTRADOR |
| GET | `/api/campaigns/:id/progress` | Sí | SUPERADMIN, ADMINISTRADOR |

### Catálogos
| Método | Ruta |
|--------|------|
| GET | `/api/user-roles` |
| GET | `/api/document-types` |
| GET | `/api/genders` |
| GET | `/api/grades` |
| GET | `/api/statuses` |
| GET | `/api/localities` |
| GET | `/api/neighborhoods` |

---

## Parámetros de Consulta

### `GET /api/campaigns`
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `active` | `true` | Solo campañas vigentes |
| `institution_id` | int | Filtrar por institución |
| `scope_type` | string | GLOBAL, INSTITUTION, LOCALITY, NEIGHBORHOOD |
| `person_id` | int | Campañas en las que la persona está inscrita |

### `GET /api/students`
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `institution_id` | int | Filtrar por institución |
| `status_id` | int | 1=Activo, 2=Graduado, 3=Retirado |
| `grade_id` | int | Filtrar por grado |
| `gender_id` | int | 1=M, 2=F, 3=NB |
| `min_age` | int | Edad mínima |
| `max_age` | int | Edad máxima |
| `search` | string | Búsqueda por nombre o documento |

---

## Estructura del Proyecto

```
backend/
├── server.js         # Servidor Express mock (~1190 líneas)
├── utils.js          # Helpers compartidos (enrich, stats, scope, criteria)
├── db.json           # Base de datos JSON (generado por seed)
├── seed/
│   ├── index.js      # Script generador de datos
│   ├── data/         # Datos estáticos (localidades, barrios, instituciones, campañas)
│   └── utils/
│       └── generators.js
├── MIGRATION_GUIDE.md
├── package.json
└── node_modules/
```

---

## Solución de Problemas

**Error "Credenciales incorrectas"** — Verifica usuario/contraseña en la tabla de arriba.

**Error "No autorizado"** — El token expiró o no se envió. Vuelve a iniciar sesión.

**Error EADDRINUSE (puerto 3001 en uso):**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Error "db.json not found"** — Ejecuta `npm run seed` para regenerar los datos.
