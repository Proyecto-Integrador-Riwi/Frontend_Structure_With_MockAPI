# NexoEdu — Sistema de Seguimiento de Estudiantes y Egresados

Plataforma web para gestionar y mantener actualizada la información de estudiantes y egresados de instituciones educativas del Distrito de Barranquilla, mediante campañas de actualización de datos.

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | JavaScript (Vanilla), Vite, Tailwind CSS v4 |
| Backend (mock) | Express 5, Node.js |
| Arquitectura | SPA con router client-side |

---

## Requisitos

- Node.js v18+
- npm v9+

---

## Instalación

```bash
npm run install:all
npm run db:seed
```

---

## Ejecución

```bash
npm run dev
```

Inicia ambos servidores:

| Servidor | Puerto | Descripción |
|----------|--------|-------------|
| Backend mock | `http://localhost:3001` | API simulada |
| Frontend (Vite) | `http://localhost:5173` | Aplicación web |

### Por separado

```bash
npm run dev:mock      # Solo backend
npm run dev:frontend  # Solo frontend
```

### Regenerar datos

```bash
npm run db:seed
```

---

## Credenciales de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| SuperAdmin | `admin_global` | `123456` |
| Admin Inst. 1 | `admin_n1` | `123456` |
| Admin Inst. 2–10 | `admin_n2` … `admin_n10` | `123456` |
| Estudiante | `(email sin @)` | `123456` |

---

## Rutas del Frontend

| Ruta | Vista | Protegida | Roles |
|------|-------|-----------|-------|
| `/` | Login | No | — |
| `/dashboard-superadmin` | Panel SuperAdmin | Sí | SUPERADMIN |
| `/dashboard-admin` | Panel Admin institución | Sí | ADMINISTRADOR |
| `/dashboard-estudiante` | Panel Estudiante | Sí | ESTUDIANTE |
| `/estudiantes` | Lista de estudiantes | Sí | SUPERADMIN, ADMINISTRADOR |
| `/estudiantes/crear` | Crear estudiante | Sí | SUPERADMIN, ADMINISTRADOR |
| `/estudiante/:id` | Detalle de estudiante | Sí | Todos |
| `/campanas` | Lista de campañas | Sí | Todos |
| `/campanas/crear` | Crear campaña | Sí | SUPERADMIN, ADMINISTRADOR |
| `/campanas/:id` | Detalle de campaña | Sí | Todos |
| `/instituciones` | Gestionar instituciones | Sí | SUPERADMIN |
| `/instituciones/crear` | Crear institución | Sí | SUPERADMIN |
| `/instituciones/:id` | Detalle institución | Sí | Todos |
| `/instituciones/:id/editar` | Editar institución | Sí | SUPERADMIN |
| `/crear-admin` | Crear admin | Sí | SUPERADMIN |
| `/mis-campanas` | Campañas del estudiante | Sí | ESTUDIANTE |
| `/perfil` | Perfil personal | Sí | Todos |
| `/configuracion` | Configuración | Sí | Todos |

---

## Estructura del Proyecto

```
├── package.json              # Scripts raíz (concurrently)
├── .gitignore
├── backend/
│   ├── server.js             # Servidor Express mock ← PROVISIONAL
│   ├── db.json               # Base de datos JSON (generado)
│   ├── seed/                 # Generador de datos de prueba
│   │   ├── index.js
│   │   ├── data/             # Localidades, barrios, instituciones, campañas
│   │   └── utils/generators.js
│   ├── MIGRATION_GUIDE.md
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.js           # Entry point + rutas
│       ├── style.css         # Tailwind + estilos globales
│       ├── views/            # 17 vistas (una por ruta)
│       ├── components/       # 11 componentes reutilizables
│       ├── modules/          # Router, auth, HTTP client
│       ├── services/         # Llamadas a la API
│       ├── utils/            # Filtros compartidos
│       └── assets/           # Imágenes
└── node_modules/
```

---

## Migración a Backend Real

Cuando el equipo backend termine la API real:

1. Eliminar la carpeta `backend/`
2. Actualizar `API_URL` en `frontend/src/modules/auth.js`
3. Seguir la [Guía de Migración](./backend/MIGRATION_GUIDE.md)

---

## Solución de Problemas

**EADDRINUSE (puerto 3001):**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**Cannot find module:**
```bash
npm run install:all
```

**db.json not found:**
```bash
npm run db:seed
```
