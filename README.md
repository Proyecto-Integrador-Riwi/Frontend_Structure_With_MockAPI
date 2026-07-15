# NexoEdu - Sistema de Seguimiento de Estudiantes y Egresados

Plataforma web para gestionar y mantener actualizada la información de estudiantes y egresados de instituciones educativas del Distrito de Barranquilla, mediante campañas de actualización de datos.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | JavaScript (Vanilla), Vite, Tailwind CSS v4 |
| Backend mock | Express 5, Node.js |
| Backend real (en desarrollo) | Express, SQLAlchemy, PostgreSQL |
| Arquitectura | SPA con router client-side, MVC en backend |

## Prerrequisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm v9 o superior
- Git

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Proyecto-Integrador-Riwi/Riwi-Projects.git
cd Riwi-Projects

# 2. Instalar dependencias (raíz + frontend + backend)
npm run install:all

# 3. Generar base de datos de prueba
npm run db:seed
```

## Ejecución

### Modo desarrollo (backend mock)

```bash
npm run dev
```

Esto inicia dos servidores simultáneamente:

| Servidor | Puerto | Descripción |
|----------|--------|-------------|
| Backend mock (Express) | `http://localhost:3001` | API simulada con datos de prueba |
| Frontend (Vite) | `http://localhost:5173` | Aplicación web |

### Ejecutar por separado

```bash
npm run dev:mock      # Solo backend mock (puerto 3001)
npm run dev:frontend  # Solo frontend (puerto 5173)
```

### Regenerar datos de prueba

```bash
npm run db:seed
```

Esto sobreescribe `backend/db.json` con datos nuevos.

## Credenciales de Prueba

| Rol | Usuario | Contraseña | Descripción |
|-----|---------|------------|-------------|
| SuperAdmin | `admin_global` | `123456` | Acceso total a todas las instituciones |
| Admin | `admin_n1` | `123456` | Administrador Institución 1 |
| Admin | `admin_n2` | `123456` | Administrador Institución 2 |
| Admin | `admin_n3` a `admin_n10` | `123456` | Admins de las demás instituciones |
| Estudiante | `(email sin @)` | `123456` | Ejemplo: `juan.garcia` / `123456` |

## Rutas del Frontend

| Ruta | Vista | Protegida | Roles permitidos |
|------|-------|-----------|------------------|
| `/` | Login | No | Todos |
| `/dashboard` | Dashboard general | Sí | Admin, Estudiante |
| `/dashboard-superadmin` | Panel SuperAdmin | Sí | Solo SuperAdmin |
| `/perfil` | Mi perfil | Sí | Todos |
| `/institucion/:id` | Detalle de institución | Sí | Admin, SuperAdmin |
| `/campanas` | Campañas | Sí | Todos |
| `/estudiantes` | Lista de estudiantes | Sí | Admin, SuperAdmin |
| `/mis-campanas` | Campañas del estudiante | Sí | Estudiante |
| `/configuracion` | Configuración | Sí | Todos |

## Endpoints del Backend Mock

### Autenticación

```
POST /api/auth/login
Body: { "username": "admin_global", "password": "123456" }
Response: { "token", "username", "rol", "person_id", "institution_id" }

GET  /api/auth/me
Header: Authorization: Bearer <token>
Response: { "id", "username", "role", "person_id", ... }
```

### Campañas

```
GET  /api/campaigns                          # Todas las campañas
GET  /api/campaigns/active                   # Solo campañas vigentes
GET  /api/campaigns/pinned                   # Campañas fijadas (SuperAdmin)
GET  /api/campaigns/available/:personId      # Campañas disponibles para una persona
POST /api/campaigns/:id/enroll               # Inscribirse (requiere auth)
```

### Estudiantes

```
GET  /api/students                           # Lista de estudiantes
     ?institution_id=1                       # Filtrar por institución
     &status_id=1                            # Filtrar por estado (1=Activo, 2=Graduado, 3=Retirado)
     &grade_id=11                            # Filtrar por grado
     &gender_id=1                            # Filtrar por género (1=M, 2=F, 3=NB)
     &min_age=15&max_age=20                  # Filtrar por rango de edad

GET  /api/students/campaign/:campaignId      # Estudiantes inscritos en una campaña
```

### Instituciones

```
GET  /api/institutions                       # Todas las instituciones
GET  /api/institutions/:id                   # Detalle de una institución
GET  /api/institutions/:id/students          # Estudiantes de una institución
```

### Dashboard

```
GET  /api/dashboard/stats                    # Estadísticas globales
GET  /api/dashboard/stats/1                  # Estadísticas de una institución
```

### Catálogos

```
GET  /api/user-roles
GET  /api/document-types
GET  /api/genders
GET  /api/grades
GET  /api/statuses
GET  /api/localities
GET  /api/neighborhoods
```

## Variables de Entorno

El backend mock **no requiere** archivo `.env` porque usa `db.json`.

El backend real (en desarrollo) usa PostgreSQL y necesita:

```bash
cp backend/.env.example backend/.env
```

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cp_database_final
DB_USER=postgres
DB_PASSWORD=tu_password
PORT=3000
```

`.env` está en `.gitignore` — nunca commitearlo.

## Estructura del Proyecto

```
Riwi-Projects/
├── package.json                    # Scripts raíz (concurrently)
│
├── backend/
│   ├── server.js                   # Backend mock (Express) ← PROVISIONAL
│   ├── db.json                     # Base de datos JSON ← PROVISIONAL
│   ├── index.js                    # Backend real (FastAPI proxy) ← EN DESARROLLO
│   ├── seed/                       # Generador de datos de prueba
│   │   ├── index.js
│   │   ├── data/                   # Datos estáticos
│   │   └── utils/generators.js
│   ├── models/                     # Queries SQL (backend real)
│   ├── controllers/                # Lógica de endpoints (backend real)
│   ├── routes/                     # Definición de rutas (backend real)
│   ├── MIGRATION_GUIDE.md          # Guía para migrar al backend real
│   └── .env
│
├── frontend/
│   ├── vite.config.js
│   └── src/
│       ├── main.js                 # Entry point + rutas
│       ├── style.css               # Tailwind CSS
│       ├── views/                  # Vistas por página
│       │   ├── Login.js
│       │   ├── Dashboard.js
│       │   ├── DashboardSuperAdmin.js
│       │   ├── Institucion.js
│       │   └── Perfil.js
│       ├── components/             # Componentes reutilizables
│       │   ├── Navbar.js
│       │   ├── Sidebar.js
│       │   ├── Hero.js
│       │   ├── Carousel.js
│       │   ├── CampaignCard.js
│       │   ├── FilterBar.js
│       │   ├── StudentList.js
│       │   └── StatsCard.js
│       ├── modules/                # Router, auth, http
│       │   ├── auth.js
│       │   ├── router.js
│       │   └── http.js
│       ├── services/               # Llamadas a la API
│       │   ├── authService.js
│       │   ├── campaignService.js
│       │   ├── studentService.js
│       │   └── institutionService.js
│       └── assets/                 # Imágenes
```

## Fotos e Imágenes

El frontend busca las siguientes imágenes. Debes colocarlas o editar las rutas en el código:

| Archivo | Dónde se usa | Instrucción |
|---------|-------------|-------------|
| `/src/assets/alcaldia-hero.jpg` | Hero del SuperAdmin | Buscar `CAMBIAR ESTA RUTA` en `DashboardSuperAdmin.js` |
| `/src/assets/institution-hero.jpg` | Hero de Institución | Buscar `CAMBIAR ESTA RUTA` en `Institucion.js` |
| `/src/assets/institution-logo.png` | Logo de Institución | Buscar `CAMBIAR ESTA RUTA` en `Institucion.js` |

## Backend Real (en desarrollo)

El backend real usa FastAPI + PostgreSQL y corre en el puerto `3000`. Cuando esté listo:

1. Eliminar `backend/server.js`, `backend/db.json`, `backend/seed/`
2. Cambiar en `frontend/src/modules/auth.js`:
   ```javascript
   // ANTES
   export const API_URL = "http://localhost:3001"
   // DESPUÉS
   export const API_URL = "http://localhost:3000"
   ```
3. Ver `backend/MIGRATION_GUIDE.md` para la guía completa.

## Solución de Problemas

**Error "EADDRINUSE" (puerto en uso):**
```bash
# En Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# En Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Error "Cannot find module":**
```bash
npm run install:all
```

**Error "db.json not found":**
```bash
npm run db:seed
```

**Frontend no conecta al backend:**
- Verificar que el mock server esté corriendo en puerto `3001`
- Verificar que `API_URL` en `frontend/src/modules/auth.js` apunte a `http://localhost:3001`
