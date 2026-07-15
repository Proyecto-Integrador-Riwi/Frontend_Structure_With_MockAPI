# Backend Mock - NexoEdu

## IMPORTANTE

Este backend es **PROVISIONAL** y está diseñado únicamente para el desarrollo del frontend mientras el equipo backend completa los endpoints reales con FastAPI + PostgreSQL.

**Cuando el backend real esté listo, eliminar toda esta carpeta y seguir la [Guía de Migración](./MIGRATION_GUIDE.md).**

---

## Inicio Rápido

### 1. Generar base de datos de prueba

```bash
npm run db:seed
```

Esto generará el archivo `db.json` con todos los datos de prueba.

### 2. Iniciar servidor mock

```bash
npm run dev:mock
```

El servidor estará disponible en `http://localhost:3001`.

### 3. Iniciar frontend

```bash
npm run dev:frontend
```

---

## Credenciales de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| SuperAdmin | admin_global | 123456 |
| Admin (Institución 1) | admin_n1 | 123456 |
| Admin (Institución 2) | admin_n2 | 123456 |
| Admin (Institución 3) | admin_n3 | 123456 |
| ... | ... | 123456 |
| Estudiante | (email sin @) | 123456 |

---

## Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Campañas
- `GET /api/campaigns` - Lista de campañas (requiere auth; filtros: `active`, `institution_id`, `scope_type`, `person_id`)
- `GET /api/campaigns/active` - Campañas activas (requiere auth)
- `GET /api/campaigns/pinned` - Campañas fijadas (requiere auth)
- `GET /api/campaigns/available/:personId` - Campañas disponibles (requiere auth)
- `POST /api/campaigns/:id/enroll` - Inscribirse (requiere auth + validación de scope y criteria)

### Estudiantes
- `GET /api/students` - Lista de estudiantes (requiere rol SUPERADMIN o ADMINISTRADOR)
- `GET /api/students/campaign/:campaignId` - Estudiantes por campaña (requiere auth)

### Instituciones
- `GET /api/institutions` - Lista de instituciones (requiere auth)
- `GET /api/institutions/:id` - Detalle de institución (requiere auth)
- `GET /api/institutions/:id/students` - Estudiantes de institución (requiere auth)

### Dashboard
- `GET /api/dashboard/stats/:institutionId?` - Estadísticas (requiere rol SUPERADMIN o ADMINISTRADOR)

### Personas
- `GET /api/people/:id` - Detalle de persona (requiere auth)
- `PUT /api/people/:id` - Actualizar persona (requiere auth; estudiantes solo con campaña activa)

### Catálogos
- `GET /api/user-roles`
- `GET /api/document-types`
- `GET /api/genders`
- `GET /api/grades`
- `GET /api/statuses`
- `GET /api/localities`
- `GET /api/neighborhoods`

---

## Datos de Prueba

### Localidades de Barranquilla
1. Norte
2. Nororiente
3. Occidente
4. Oriente
5. Sur
6. Suroccidente

### Instituciones (10)
1. I.E.D. Normal Superior de Barranquilla
2. I.E.D. Universidad del Norte
3. I.E.D. Colegio San José
4. I.E.D. Liceo Departamental
5. I.E.D. Institución Educativa Distrital Juan B. Alberdi
6. I.E.D. Institución Educativa Distrital Técnico Industrial
7. I.E.D. Institución Educativa Distrital La Merced
8. I.E.D. Institución Educativa Distrital Florida Blanca
9. I.E.D. Institución Educativa Distrital Alberto Mercado
10. I.E.D. Institución Educativa Distrital Salud Maldonado

### Campañas (15)
- Campañas globales, institucionales y por localidad
- Diferentes tipos: General, Académico, Deportivo, Cultural, etc.
- Con filtros por edad, género, grado y estado

---

## Estructura de Archivos

```
backend/
├── db.json              # Base de datos JSON (generado)
├── server.js            # Servidor Express mock
├── MIGRATION_GUIDE.md   # Guía de migración al backend real
├── seed/
│   ├── index.js         # Script generador de datos
│   ├── data/
│   │   ├── localidades.js
│   │   ├── barrios.js
│   │   ├── instituciones.js
│   │   └── campanas.js
│   └── utils/
│       └── generators.js
└── package.json
```

---

## Notas para el Frontend

### URLs de Imágenes
El frontend busca las siguientes imágenes (debes crearlas o cambiar las rutas):

- `/src/assets/alcaldia-hero.jpg` - Hero del SuperAdmin
- `/src/assets/institution-hero.jpg` - Hero de Institución
- `/src/assets/institution-logo.png` - Logo de Institución

### Autenticación
El frontend envía el token en el header Authorization:
```
Authorization: Bearer <token>
```

---

## Solución de Problemas

### Error: "Credenciales incorrectas"
Verifica que estés usando las credenciales correctas de la tabla de arriba.

### Error: "No autorizado"
El token puede haber expirado. Cierra sesión y vuelve a iniciar.

### Error: "No hay campaña activa"
Solo puedes actualizar datos cuando hay una campaña activa para tu perfil.

---

## Próximos Pasos

1. Implementar los endpoints reales en FastAPI
2. Configurar PostgreSQL
3. Implementar JWT real
4. Eliminar este backend mock
5. Seguir la [Guía de Migración](./MIGRATION_GUIDE.md)
