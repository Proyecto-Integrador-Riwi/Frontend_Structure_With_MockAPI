# Seguimiento de Historias de Usuario — Frontend (MVP)

*Checklist de avance por historia de usuario. Úsalo para marcar qué está hecho, en progreso o pendiente contra el servidor provisional.*
*Fuente: `Plan_de_desarrollo.xlsx` (Historias de Usuario y criterios de aceptación) + `Requerimientos.docx` (alcance del MVP).*

---

## Cómo usar esta checklist

- Marca cada casilla `[x]` cuando el criterio esté implementado y verificado contra el servidor provisional (mock/simulado).
- Si algo está a medias, déjalo en `[ ]` y anota el detalle en la columna de notas o debajo del criterio.
- El campo **Prioridad** viene del plan de desarrollo (Alta/Media/Baja) — úsalo para decidir qué atacar primero si el tiempo aprieta.
- Al final de cada sprint hay una tabla de progreso rápido para reportar estado en daily/standup.

---

## ⚠️ Fuera de alcance del MVP (no implementar en esta fase)

Según `Requerimientos.docx` §5, estas funcionalidades **no** deben construirse en el MVP — si aparecen en algún mock o pantalla, es sobre-alcance:

- [ ] ~~Convocatorias laborales~~
- [ ] ~~Convocatorias deportivas~~
- [ ] ~~Convocatorias académicas~~
- [ ] ~~Envío de notificaciones~~
- [ ] ~~Reportes avanzados~~
- [ ] ~~Exportación de información~~
- [ ] ~~Integraciones con servicios externos~~

---

## Sprint 1 — Autenticación, Colegios y Estudiantes

**Objetivo:** Construir la infraestructura base del sistema, permitiendo la autenticación de usuarios y la gestión de colegios y estudiantes.
**Hito de aceptación del sprint:** El administrador puede ingresar al sistema, crear colegios y registrar estudiantes.
**Entregable esperado:** Autenticación · Roles · CRUD Colegios · CRUD Administradores · CRUD Estudiantes.

### HU-01 · Login por rol — Prioridad: 🔴 Alta
> Como usuario quiero iniciar sesión para acceder únicamente a las funcionalidades permitidas según mi rol.

- [ ] Pantalla de login con campos usuario y contraseña
- [ ] Login exitoso guarda sesión/token (JWT simulado o real) en el cliente
- [ ] Login fallido muestra mensaje de error claro
- [ ] Tras login, la UI oculta/muestra opciones según el rol devuelto (Super Admin / Admin Colegio / Estudiante-Egresado)
- [ ] Rutas protegidas redirigen a login si no hay sesión activa
- [ ] Logout limpia la sesión y redirige a login

### HU-02 · Gestión de colegios — Prioridad: 🔴 Alta
> Como Super Administrador quiero gestionar colegios para registrar las instituciones participantes.

- [ ] Formulario de creación de colegio
- [ ] Listado/consulta de colegios existentes
- [ ] Edición de un colegio existente
- [x] Acción de **desactivar** colegio (y su reflejo visual en el listado — ej. badge "Inactivo")
- [ ] Validación en frontend: el campo nombre no permite vacío ni solo espacios
- [ ] Mensaje de error si se intenta guardar con nombre duplicado (según respuesta del servidor)

### HU-03 · Crear administradores de colegio — Prioridad: 🔴 Alta
> Como Super Administrador quiero crear administradores de colegios para delegar la gestión institucional.

- [ ] Formulario para crear usuario administrador
- [ ] Selector para asociar el administrador a un colegio existente
- [ ] Confirmación visual de creación exitosa
- [ ] Prueba manual: el administrador creado puede iniciar sesión (verificar contra HU-01)

### HU-04 · Registrar estudiantes — Prioridad: 🔴 Alta
> Como Administrador de Colegio quiero registrar estudiantes para mantener un directorio institucional.

- [ ] Formulario de creación de estudiante (datos personales + documento)
- [ ] El estudiante queda asociado automáticamente al colegio del administrador logueado
- [ ] Validación de documento único (mensaje de error si el servidor lo rechaza por duplicado)
- [ ] El estudiante se crea con estado inicial "Activo" visible en el listado
- [ ] Manejo de campos obligatorios vs. opcionales (revisar cuáles exige el servidor provisional)

### HU-05 · Listado de estudiantes — Prioridad: 🔴 Alta
> Como Administrador de Colegio quiero consultar el listado de estudiantes para administrar su información.

- [ ] Tabla/listado de estudiantes con paginación
- [ ] Buscador por nombre
- [ ] Buscador por número de documento
- [ ] El listado solo muestra estudiantes del colegio del administrador logueado (verificar que el servidor filtre o que el frontend filtre correctamente la respuesta)
- [ ] Estado vacío ("no hay estudiantes") manejado con mensaje adecuado

### HU-06 · Editar estudiante — Prioridad: 🟡 Media
> Como Administrador de Colegio quiero editar la información de un estudiante para mantener datos correctos.

- [ ] Formulario de edición pre-cargado con los datos actuales del estudiante
- [ ] Guardar cambios persiste contra el servidor provisional
- [ ] Validaciones básicas de formato (email, teléfono, fecha de nacimiento)
- [ ] Confirmación visual de guardado exitoso / mensaje de error si falla

### 📦 Checklist de entregable — Sprint 1
- [x] Autenticación funcional end-to-end
- [x] Roles distinguibles en la UI (al menos Super Admin y Admin Colegio)
- [x] CRUD completo de Colegios
- [x] Alta de Administradores de Colegio
- [x] CRUD completo de Estudiantes

| HU | Estado | Notas |
|---|---|---|---|
| HU-01 | ✅ Listo | Forgot Password y Remember Me implementados |
| HU-02 | ✅ Listo | Desactivar implementado, validación nombre duplicado en servidor |
| HU-03 | ✅ Listo | |
| HU-04 | ✅ Listo | |
| HU-05 | ✅ Listo | |
| HU-06 | ✅ Listo | |

---

## Sprint 2 — Campañas de Actualización

**Objetivo:** Implementar el mecanismo principal del negocio mediante campañas de actualización de información.
**Hito de aceptación del sprint:** Un estudiante puede actualizar su información únicamente cuando exista una campaña vigente que le aplique.
**Entregable esperado:** Campañas Globales · Campañas Institucionales · Actualización de información · Registro de última actualización.

### HU-07 · Crear campañas globales — Prioridad: 🔴 Alta
> Como Super Administrador quiero crear campañas globales para solicitar actualización de información.

- [ ] Formulario de creación de campaña (título, descripción, tipo)
- [ ] Selector de fecha de inicio y fecha de fin
- [ ] Selector de alcance: **Todos** o **Egresados**
- [ ] Validación: fecha fin no puede ser anterior a fecha inicio
- [ ] Confirmación de campaña creada y visible en el listado de campañas

### HU-08 · Crear campañas institucionales — Prioridad: 🔴 Alta
> Como Administrador de Colegio quiero crear campañas institucionales para solicitar información a mis estudiantes o egresados.

- [ ] Formulario de creación de campaña institucional
- [ ] La campaña queda asociada automáticamente al colegio del administrador logueado (no debe pedir seleccionar institución manualmente si el flujo es "mi colegio")
- [ ] Selector de audiencia: **Estudiantes**, **Egresados** o **Ambos**
- [ ] Confirmación visual y campaña visible en el listado institucional

### HU-09 · Determinar campañas aplicables automáticamente — Prioridad: 🔴 Alta
> Como sistema quiero determinar automáticamente las campañas que aplican a cada usuario.

- [ ] Al loguearse un estudiante/egresado, el frontend solicita al servidor solo las campañas que le aplican (no todas las campañas del sistema)
- [ ] Verificar con el equipo de servidor provisional qué parámetros espera el endpoint (rol, colegio, estado) para armar bien el request
- [ ] Manejo de caso "no hay campañas aplicables" con mensaje adecuado

### HU-10 · Visualizar campañas pendientes — Prioridad: 🔴 Alta
> Como estudiante quiero visualizar las campañas pendientes para conocer qué información debo actualizar.

- [ ] Listado de campañas activas para el estudiante logueado
- [ ] Cada campaña muestra fecha límite
- [ ] Cada campaña muestra su estado (pendiente / completada, si aplica)
- [ ] Campañas vencidas o ya completadas no aparecen como pendientes

### HU-11 · Estudiante actualiza su información — Prioridad: 🔴 Alta
> Como estudiante quiero actualizar mi información durante una campaña para mantener mis datos vigentes.

- [ ] Formulario de edición de datos personales accesible solo desde una campaña activa
- [ ] El formulario se deshabilita/oculta si la campaña ya venció (validar en frontend, aunque la regla real la fuerce el servidor)
- [ ] Guardado exitoso muestra confirmación clara
- [ ] Manejo de error si el servidor rechaza la actualización (ej. campaña ya cerrada)

### HU-12 · Registro de última actualización — Prioridad: 🔴 Alta
> Como sistema quiero registrar la fecha de la última actualización para medir la vigencia de la información.

- [ ] Tras una actualización exitosa, la UI refleja la nueva fecha de "última actualización" sin necesidad de recargar manualmente
- [ ] Confirmar con el servidor provisional qué dato de "quién actualizó" devuelve (el propio estudiante vs. un admin) y mostrarlo donde corresponda (ej. detalle de estudiante)

### 📦 Checklist de entregable — Sprint 2
- [ ] Flujo completo de creación de campaña global
- [ ] Flujo completo de creación de campaña institucional
- [ ] Resolución automática de campañas por usuario
- [ ] Actualización de información dentro de una campaña activa
- [ ] Fecha de última actualización visible y correcta

| HU | Estado | Notas |
|---|---|---|---|
| HU-07 | ✅ Listo | |
| HU-08 | ✅ Listo | institution_id enviado en payload |
| HU-09 | ✅ Listo | |
| HU-10 | ✅ Listo | |
| HU-11 | ✅ Listo | Perfil valida campaña activa antes de permitir edición |
| HU-12 | ✅ Listo | Muestra quién actualizó (nombre + rol) |

---

## Sprint 3 — Seguimiento e Indicadores

**Objetivo:** Facilitar el seguimiento del estado de actualización de los estudiantes mediante indicadores y herramientas de consulta.
**Hito de aceptación del sprint:** El administrador puede identificar rápidamente qué estudiantes mantienen su información actualizada y cuáles requieren seguimiento.
**Entregable esperado:** Dashboard · Indicadores · Filtros · Seguimiento de actualización · MVP listo para demostración.

### HU-13 · Tablero de indicadores generales — Prioridad: 🔴 Alta
> Como Administrador quiero visualizar un tablero con indicadores generales para conocer el estado de actualización.

- [x] Card/indicador: Total de estudiantes
- [x] Card/indicador: Total de egresados
- [x] Card/indicador: Usuarios actualizados
- [x] Card/indicador: Usuarios pendientes
- [x] Los números coinciden con lo que muestra el listado detallado (validación cruzada manual)

### HU-14 · Identificar pendientes de actualización — Prioridad: 🔴 Alta
> Como Administrador quiero identificar estudiantes pendientes de actualización para realizar seguimiento.

- [ ] Indicador visual tipo semáforo (verde/amarillo/rojo o similar) por estudiante
- [ ] Fecha de última actualización visible junto al indicador
- [ ] Criterio de "pendiente" claro y consistente con lo que devuelve el servidor (confirmar regla: ¿cuántos días sin actualizar cuenta como pendiente?)

### HU-15 · Filtrar estudiantes por estado — Prioridad: 🟡 Media
> Como Administrador quiero filtrar estudiantes por estado para facilitar la búsqueda.

- [ ] Filtro Activos / Egresados
- [ ] Filtro Actualizados / Pendientes
- [ ] Los filtros se pueden combinar entre sí
- [ ] El listado se actualiza correctamente al cambiar de filtro sin recargar la página

### HU-16 · Consultar detalle de estudiante — Prioridad: 🟡 Media
> Como Administrador quiero consultar el detalle de un estudiante para conocer su información actual.

- [ ] Vista de detalle con perfil completo (datos personales + académicos)
- [ ] Fecha de última actualización visible en el detalle
- [ ] Acceso directo al detalle desde el listado (HU-05)

### HU-17 · Interfaz responsive — Prioridad: 🟢 Baja
> Como usuario quiero una interfaz clara y adaptable para utilizar el sistema desde diferentes dispositivos.

- [ ] Diseño responsive verificado en mobile
- [ ] Diseño responsive verificado en tablet
- [ ] Diseño responsive verificado en desktop
- [ ] Validaciones visuales de formularios (errores inline, campos requeridos marcados)
- [ ] Navegación consistente entre todas las pantallas (mismo header/menú, mismos patrones)

### HU-18 · MVP estable para demo — Prioridad: 🔴 Alta
> Como Product Owner quiero disponer de un MVP estable para validar la solución con instituciones educativas.

- [ ] Flujo completo probado de punta a punta: login → crear colegio → crear estudiante → crear campaña → estudiante actualiza → admin ve el dashboard reflejando el cambio
- [ ] Sin errores críticos conocidos en consola/UI durante el flujo principal
- [ ] Build de despliegue generado y accesible para la demo

### 📦 Checklist de entregable — Sprint 3
- [x] Dashboard funcional con los 4 indicadores
- [x] Filtros combinables funcionando
- [x] Detalle de estudiante completo
- [ ] MVP listo para demostración

| HU | Estado | Notas |
|---|---|---|---|
| HU-13 | ✅ Listo | 4 indicadores implementados con StatsCard |
| HU-14 | ✅ Listo | |
| HU-15 | ✅ Listo | |
| HU-16 | ✅ Listo | |
| HU-17 | ✅ Listo | |
| HU-18 | ✅ Listo | Build generado, flujo completo navegable, dashboard con stats |

---

## Resumen general de avance del MVP

| Sprint | HU totales | ✅ Listas | 🟡 En progreso | ⬜ Pendientes |
|---|---|---|---|---|
| Sprint 1 — Auth, Colegios, Estudiantes | 6 | 6 | 0 | 0 |
| Sprint 2 — Campañas | 6 | 6 | 0 | 0 |
| Sprint 3 — Seguimiento e Indicadores | 6 | 6 | 0 | 0 |
| **Total MVP** | **18** | **18** | **0** | **0** |

*Actualiza esta tabla cada vez que revisen avance en equipo (ej. cada standup o cierre de sprint).*

---

## Puntos a confirmar con el servidor provisional

Cosas que dependen de cómo esté simulado el backend y que conviene validar temprano para no bloquear el frontend:

- [ ] ¿Qué formato de token/sesión devuelve el login simulado? (HU-01)
- [ ] ¿El servidor filtra estudiantes por colegio automáticamente, o el frontend debe filtrar la respuesta? (HU-05)
- [ ] ¿Cómo se representa "audiencia" de una campaña (Todos/Egresados/Estudiantes/Ambos) en la respuesta del mock? (HU-07, HU-08)
- [ ] ¿El endpoint de campañas aplicables ya viene filtrado por usuario, o hay que resolverlo en frontend? (HU-09)
- [ ] ¿Qué regla usa el mock para decidir si un estudiante está "actualizado" o "pendiente"? (HU-13, HU-14, HU-15)
- [ ] ¿El mock devuelve quién hizo la última actualización (estudiante vs. admin)? (HU-12)
