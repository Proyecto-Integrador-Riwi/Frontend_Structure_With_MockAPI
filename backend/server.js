/**
 * ============================================================
 * SERVIDOR MOCK - NexoEdu (PROVISIONAL)
 * ============================================================
 *
 * IMPORTANTE: Este servidor es PROVISIONAL y esta disenado
 * unicamente para el desarrollo del frontend mientras el
 * equipo backend completa los endpoints reales con FastAPI + PostgreSQL.
 *
 * ============================================================
 * CUANDO EL BACKEND REAL ESTE LISTO, ELIMINAR:
 * 1. Este archivo (backend/server.js)
 * 2. backend/db.json
 * 3. backend/seed/ (toda la carpeta)
 * 4. backend/utils.js
 * 5. Cambiar API_URL en frontend/src/modules/auth.js
 *    de http://localhost:3001 a http://localhost:3000
 * 6. Actualizar los servicios para apuntar a los endpoints reales
 * ============================================================
 *
 * ENDPOINTS PROVISIONALES:
 *
 * AUTENTICACION:
 * - POST /api/auth/login              → Login y obtencion de token
 * - POST /api/auth/change-password    → Cambio de contrasena
 * - POST /api/auth/forgot-password    → Recuperacion de contrasena
 * - GET  /api/auth/me                 → Informacion del usuario actual
 *
 * CAMPANAS:
 * - GET    /api/campaigns             → Lista con filtros (active, institution_id, scope_type, person_id)
 * - GET    /api/campaigns/active      → Solo vigentes
 * - GET    /api/campaigns/pinned      → Fijadas (SUPERADMIN)
 * - GET    /api/campaigns/available/:personId → Disponibles para una persona
 * - GET    /api/campaigns/:id         → Detalle con scope, criteria, inscritos
 * - GET    /api/campaigns/:id/progress → Progreso de actualizacion
 * - POST   /api/campaigns             → Crear (scope derivado del rol: SUPERADMIN→GLOBAL, ADMIN→INSTITUTION)
 * - PUT    /api/campaigns/:id         → Editar
 * - DELETE /api/campaigns/:id         → Eliminar
 * - POST   /api/campaigns/:id/enroll  → Inscribirse
 *
 * ESTUDIANTES:
 * - GET  /api/students                → Lista con filtros (institution_id, status_id, grade_id, gender, min_age, max_age, search)
 * - GET  /api/students/campaign/:campaignId → Inscritos en una campana
 * - PUT  /api/students/:studentProfileId   → Editar perfil por ADMIN
 *
 * PERSONAS:
 * - POST /api/people                  → Crear estudiante + credential interno (requiere username/password)
 * - GET  /api/people/:id              → Detalle enriquecido (incluye credential_username)
 * - PUT  /api/people/:id              → Actualizar (solo ESTUDIANTE con campana activa)
 *
 * INSTITUCIONES:
 * - GET    /api/institutions          → Lista
 * - GET    /api/institutions/:id      → Detalle
 * - GET    /api/institutions/:id/students → Estudiantes de la institucion
 * - POST   /api/institutions          → Crear (SUPERADMIN)
 * - PUT    /api/institutions/:id      → Editar (SUPERADMIN)
 * - DELETE /api/institutions/:id      → Eliminar (SUPERADMIN)
 * - PATCH  /api/institutions/:id/toggle-active → Activar/desactivar
 *
 * CREDENCIALES:
 * - POST /api/credentials             → Crear usuario admin (SUPERADMIN)
 *
 * DASHBOARD:
 * - GET /api/dashboard/stats          → Estadisticas globales
 * - GET /api/dashboard/stats/:institutionId → Estadisticas por institucion
 *
 * CATALOGOS:
 * - GET /api/user-roles, /api/document-types, /api/genders, /api/grades,
 *   /api/statuses, /api/localities, /api/neighborhoods
 *
 * ============================================================
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    setDb, nextId, calcAge, isCampaignActive, getLastUpdate,
    enrichCampaign, checkCampaignScope, computeDashboardStats,
    checkCriteria, enrichStudentProfile, enrichInstitution
} from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// ============================================================
// MIDDLEWARES GLOBALES
// ============================================================

app.use(cors());
app.use(express.json());

// ============================================================
// CARGA DE BASE DE DATOS
// ============================================================

let db = {};

function loadDatabase() {
    const dbPath = path.join(__dirname, 'db.json');
    try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        db = JSON.parse(raw);
        setDb(db);
        console.log('Base de datos cargada desde db.json');
    } catch (err) {
        console.error('Error al cargar db.json:', err.message);
        process.exit(1);
    }
}

function saveDatabase() {
    const dbPath = path.join(__dirname, 'db.json');
    try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (err) {
        console.error('Error al guardar db.json:', err.message);
    }
}

loadDatabase();

// ============================================================
// SESIONES SIMULADAS (en memoria)
// ============================================================

const sessions = new Map();

function createSession(user) {
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions.set(token, {
        ...user,
        created_at: new Date().toISOString()
    });
    return token;
}

function getSession(token) {
    const session = sessions.get(token);
    if (!session) return null;
    const elapsed = Date.now() - new Date(session.created_at).getTime();
    if (elapsed > SESSION_TTL_MS) {
        sessions.delete(token);
        return null;
    }
    return session;
}

// Cleanup periódico de sesiones expiradas
setInterval(() => {
    const now = Date.now();
    for (const [token, session] of sessions) {
        if (now - new Date(session.created_at).getTime() > SESSION_TTL_MS) {
            sessions.delete(token);
        }
    }
}, 60 * 60 * 1000); // cada hora

// ============================================================
// MIDDLEWARES DE AUTENTICACIÓN
// ============================================================

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        req.user = getSession(token);
    }
    next();
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permisos para esta acción' });
        }
        next();
    };
}

// Aplicar middleware de auth a todas las rutas
app.use(authMiddleware);

// ============================================================
// MIDDLEWARE GLOBAL DE ERROR
// ============================================================

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    const credential = db.credentials.find(c => c.username === username);
    if (!credential || credential.password !== password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const role = db.user_roles.find(r => r.id === credential.role_id);
    if (!role) {
        return res.status(500).json({ error: 'Error en el sistema' });
    }

    const person = db.people.find(p => p.credential_id === credential.id);

    let institutionId = null;
    if (role.name === 'ADMINISTRADOR' && person) {
        const institution = db.institutions.find(i => i.credential_id === credential.id);
        if (institution) institutionId = institution.id;
    }

    let studentProfileId = null;
    if (role.name === 'ESTUDIANTE' && person) {
        const profile = db.student_profiles.find(sp => sp.people_id === person.id);
        if (profile) studentProfileId = profile.id;
    }

    const token = createSession({
        id: credential.id,
        username: credential.username,
        role: role.name,
        person_id: person ? person.id : null,
        institution_id: institutionId,
        student_profile_id: studentProfileId
    });

    res.json({
        token,
        username: credential.username,
        rol: role.name,
        person_id: person ? person.id : null,
        institution_id: institutionId,
        student_profile_id: studentProfileId
    });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json(req.user);
});

// ============================================================
// CAMBIO DE CONTRASEÑA
// ============================================================

app.post('/api/auth/change-password', requireAuth, (req, res) => {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
        return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    }

    if (new_password.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    const credential = db.credentials.find(c => c.id === req.user.id);
    if (!credential) {
        return res.status(404).json({ error: 'Credencial no encontrada' });
    }

    if (credential.password !== current_password) {
        return res.status(400).json({ error: 'La contraseña actual no es correcta' });
    }

    credential.password = new_password;
    saveDatabase();

    res.json({ message: 'Contraseña cambiada exitosamente' });
});

app.post('/api/auth/forgot-password', (req, res) => {
    const { username } = req.body;
    if (!username || !username.trim()) {
        return res.status(400).json({ error: 'El nombre de usuario es obligatorio' });
    }

    const credential = db.credentials.find(c => c.username === username.trim());
    if (!credential) {
        return res.status(404).json({ error: 'No encontramos una cuenta con ese nombre de usuario' });
    }

    const person = db.people.find(p => p.credential_id === credential.id);
    res.json({
        message: `Hemos enviado las instrucciones a${person?.email ? ` ${person.email}` : ' tu correo electrónico institucional'}. Revisa tu bandeja de entrada.`
    });
});

// ============================================================
// RUTAS DE CATÁLOGOS
// ============================================================

app.get('/api/user-roles', (req, res) => res.json(db.user_roles));
app.get('/api/document-types', (req, res) => res.json(db.document_types));
app.get('/api/genders', (req, res) => res.json(db.genders));
app.get('/api/grades', (req, res) => res.json(db.grades));
app.get('/api/statuses', (req, res) => res.json(db.statuses));
app.get('/api/localities', (req, res) => res.json(db.localities));
app.get('/api/neighborhoods', (req, res) => {
    const { locality_id } = req.query;
    let neighborhoods = db.neighborhoods;
    if (locality_id) {
        neighborhoods = neighborhoods.filter(n => n.locality_id === parseInt(locality_id));
    }
    res.json(neighborhoods);
});

// ============================================================
// RUTAS DE CAMPAÑAS
// ============================================================

app.get('/api/campaigns/active', requireAuth, (req, res) => {
    const enriched = db.campaigns
        .filter(isCampaignActive)
        .map(enrichCampaign);
    res.json(enriched);
});

app.get('/api/campaigns/pinned', requireRole('SUPERADMIN'), (req, res) => {
    const enriched = db.campaigns
        .filter(c => c.pinned === true)
        .map(enrichCampaign);
    res.json(enriched);
});

app.get('/api/campaigns/available/:personId', requireAuth, (req, res) => {
    const { personId } = req.params;
    const person = db.people.find(p => p.id === parseInt(personId));

    if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
    }

    const studentProfile = db.student_profiles.find(sp => sp.people_id === person.id);

    const availableCampaigns = db.campaigns
        .filter(isCampaignActive)
        .filter(campaign => {
            if (!checkCampaignScope(campaign.id, studentProfile)) return false;

            const targetPop = campaign.target_population || 'all';
            if (targetPop === 'students' && studentProfile && studentProfile.status_id !== 1) return false;
            if (targetPop === 'graduates' && studentProfile && studentProfile.status_id !== 2) return false;
            if (!studentProfile && targetPop !== 'all') return false;

            const allCriteria = db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id);
            if (allCriteria.length > 0 && !checkCriteria(allCriteria, person, studentProfile)) return false;

            const alreadyEnrolled = db.campaign_enrollments.some(
                e => e.campaign_id === campaign.id && e.student_profile_id === studentProfile?.id
            );
            if (alreadyEnrolled) return false;

            return true;
        })
        .map(enrichCampaign);

    res.json(availableCampaigns);
});

app.get('/api/campaigns', requireAuth, (req, res) => {
    const { active, institution_id, scope_type, person_id } = req.query;
    let campaigns = [...db.campaigns];

    if (person_id) {
        const studentProfile = db.student_profiles.find(sp => sp.people_id === parseInt(person_id));
        if (studentProfile) {
            const enrolledCampaignIds = db.campaign_enrollments
                .filter(e => e.student_profile_id === studentProfile.id)
                .map(e => e.campaign_id);
            campaigns = campaigns.filter(c => enrolledCampaignIds.includes(c.id));
        } else {
            campaigns = [];
        }
    }

    if (active === 'true') {
        campaigns = campaigns.filter(isCampaignActive);
    }

    if (institution_id) {
        const scopes = db.campaign_scope.filter(
            s => s.scope_type === 'INSTITUTION' && parseInt(s.institution_id) === parseInt(institution_id)
        );
        const campaignIds = scopes.map(s => s.campaign_id);
        campaigns = campaigns.filter(c => campaignIds.includes(c.id));
    }

    if (scope_type) {
        const scopes = db.campaign_scope.filter(s => s.scope_type === scope_type);
        const campaignIds = scopes.map(s => s.campaign_id);
        campaigns = campaigns.filter(c => campaignIds.includes(c.id));
    }

    res.json(campaigns.map(enrichCampaign));
});

app.post('/api/campaigns/:id/enroll', requireAuth, (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));

    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    if (!isCampaignActive(campaign)) {
        return res.status(400).json({ error: 'La campaña no está activa' });
    }

    const personId = req.user.person_id;
    const studentProfile = db.student_profiles.find(sp => sp.people_id === personId);

    if (!studentProfile) {
        return res.status(404).json({ error: 'No se encontró perfil de estudiante' });
    }

    const alreadyEnrolled = db.campaign_enrollments.some(
        e => e.campaign_id === parseInt(id) && e.student_profile_id === studentProfile.id
    );

    if (alreadyEnrolled) {
        return res.status(400).json({ error: 'Ya estás inscrito en esta campaña' });
    }

    const targetPop = campaign.target_population || 'all';
    if (targetPop === 'students' && studentProfile.status_id !== 1) {
        return res.status(403).json({ error: 'Esta campaña es solo para estudiantes activos' });
    }
    if (targetPop === 'graduates' && studentProfile.status_id !== 2) {
        return res.status(403).json({ error: 'Esta campaña es solo para egresados' });
    }

    if (!checkCampaignScope(campaign.id, studentProfile)) {
        return res.status(403).json({ error: 'No cumples con el alcance de esta campaña' });
    }

    const person = db.people.find(p => p.id === personId);
    const allCriteria = db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id);
    if (!checkCriteria(allCriteria, person, studentProfile)) {
        return res.status(403).json({ error: 'No cumples con los criterios de esta campaña' });
    }

    const newEnrollment = {
        id: nextId(db.campaign_enrollments),
        campaign_id: parseInt(id),
        student_profile_id: studentProfile.id,
        enrolled_at: new Date().toISOString()
    };

    db.campaign_enrollments.push(newEnrollment);
    saveDatabase();

    res.json({ data: newEnrollment, message: 'Inscripción exitosa' });
});

// ============================================================
// PROGRESO DE CAMPAÑA
// ============================================================

app.get('/api/campaigns/:id/progress', requireAuth, (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));

    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const enrollments = db.campaign_enrollments.filter(e => e.campaign_id === campaign.id);
    const totalEnrolled = enrollments.length;

    const updatesForCampaign = db.updates.filter(u => u.campaign_id === campaign.id);
    const updatedPeopleIds = new Set(updatesForCampaign.map(u => u.people_id));
    const updatedCount = updatedPeopleIds.size;
    const updatePercentage = totalEnrolled > 0 ? Math.round((updatedCount / totalEnrolled) * 100) : 0;

    const students = enrollments.map(e => {
        const profile = db.student_profiles.find(sp => sp.id === e.student_profile_id);
        if (!profile) return null;
        const person = db.people.find(p => p.id === profile.people_id);
        const personUpdate = updatesForCampaign
            .filter(u => u.people_id === (person ? person.id : null))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0];
        return {
            id: profile.id,
            name: person ? `${person.first_name} ${person.last_name}` : 'Desconocido',
            has_updated: !!personUpdate,
            updated_at: personUpdate ? personUpdate.updated_at : null
        };
    }).filter(Boolean);

    const sorted = students.sort((a, b) => {
        if (a.has_updated !== b.has_updated) return a.has_updated ? -1 : 1;
        if (a.updated_at && b.updated_at) return new Date(b.updated_at) - new Date(a.updated_at);
        return 0;
    });

    res.json({
        total_enrolled: totalEnrolled,
        updated_count: updatedCount,
        pending_count: totalEnrolled - updatedCount,
        update_percentage: updatePercentage,
        students: sorted
    });
});

// ============================================================
// CRUD DE CAMPAÑAS
// ============================================================

app.post('/api/campaigns', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { title, type, description, sponsor, start_date, end_date, url_multimedia, pinned, target_population } = req.body;

    if (!title || !type || !start_date) {
        return res.status(400).json({ error: 'Título, tipo y fecha de inicio son requeridos' });
    }

    const validTargets = ['all', 'students', 'graduates'];
    const population = target_population || 'all';
    if (!validTargets.includes(population)) {
        return res.status(400).json({ error: 'Población objetivo no válida. Use: all, students o graduates' });
    }

    const campaign = {
        id: nextId(db.campaigns),
        title,
        type,
        description: description || '',
        sponsor: sponsor || '',
        created_by_credentials_id: req.user.id,
        start_date,
        end_date: end_date || null,
        url_multimedia: url_multimedia || null,
        pinned: pinned === true,
        target_population: population
    };

    db.campaigns.push(campaign);

    const scopeEntry = { id: nextId(db.campaign_scope), campaign_id: campaign.id };
    if (req.user.role === 'SUPERADMIN') {
        scopeEntry.scope_type = 'GLOBAL';
        db.campaign_scope.push(scopeEntry);
    } else if (req.user.role === 'ADMINISTRADOR' && req.user.institution_id) {
        scopeEntry.scope_type = 'INSTITUTION';
        scopeEntry.institution_id = req.user.institution_id;
        db.campaign_scope.push(scopeEntry);
    }

    saveDatabase();

    res.status(201).json({ data: campaign, message: 'Campaña creada exitosamente' });
});

app.get('/api/campaigns/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));

    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const scope = db.campaign_scope.filter(s => s.campaign_id === campaign.id);
    const criteria = db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id);
    const enrollmentCount = db.campaign_enrollments.filter(e => e.campaign_id === campaign.id).length;

    const enrollments = db.campaign_enrollments.filter(e => e.campaign_id === parseInt(id));
    const students = enrollments.map(e => {
        const profile = db.student_profiles.find(sp => sp.id === e.student_profile_id);
        if (!profile) return null;
        const person = db.people.find(p => p.id === profile.people_id);
        return {
            id: profile.id,
            enrolled_at: e.enrolled_at,
            person: person ? { id: person.id, first_name: person.first_name, last_name: person.last_name } : null
        };
    }).filter(Boolean);

    res.json({ ...campaign, scope, criteria, enrollment_count: enrollmentCount, students });
});

app.put('/api/campaigns/:id', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));

    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const allowedFields = ['title', 'type', 'description', 'sponsor', 'start_date', 'end_date', 'url_multimedia', 'pinned', 'target_population'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            if (field === 'pinned') {
                campaign[field] = req.body[field] === true;
            } else if (field === 'target_population') {
                const validTargets = ['all', 'students', 'graduates'];
                if (!validTargets.includes(req.body[field])) {
                    return res.status(400).json({ error: 'Población objetivo no válida. Use: all, students o graduates' });
                }
                campaign[field] = req.body[field];
            } else {
                campaign[field] = req.body[field];
            }
        }
    }

    if (req.body.title === '') return res.status(400).json({ error: 'El título no puede estar vacío' });

    saveDatabase();
    res.json({ data: campaign, message: 'Campaña actualizada exitosamente' });
});

app.delete('/api/campaigns/:id', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { id } = req.params;
    const index = db.campaigns.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const campaign = db.campaigns[index];
    db.campaigns.splice(index, 1);
    db.campaign_scope = db.campaign_scope.filter(s => s.campaign_id !== campaign.id);
    db.campaign_criteria = db.campaign_criteria.filter(cr => cr.campaign_id !== campaign.id);
    db.campaign_enrollments = db.campaign_enrollments.filter(e => e.campaign_id !== campaign.id);

    saveDatabase();
    res.json({ message: 'Campaña eliminada exitosamente' });
});

// ============================================================
// RUTAS DE ESTUDIANTES
// ============================================================

app.get('/api/students/campaign/:campaignId', requireAuth, (req, res) => {
    const { campaignId } = req.params;

    const studentProfiles = db.campaign_enrollments
        .filter(e => e.campaign_id === parseInt(campaignId))
        .map(e => {
            const profile = db.student_profiles.find(sp => sp.id === e.student_profile_id);
            if (!profile) return null;
            const person = db.people.find(p => p.id === profile.people_id);
            const institution = db.institutions.find(i => i.id === profile.institution_id);
            const grade = db.grades.find(g => g.id === profile.grade_id);
            const gender = person ? db.genders.find(g => g.id === person.gender_id) : null;
            return {
                ...profile,
                enrolled_at: e.enrolled_at,
                person: person ? { id: person.id, first_name: person.first_name, last_name: person.last_name, email: person.email, phone: person.phone } : null,
                institution: institution ? { id: institution.id, name: institution.institution_name } : null,
                grade: grade ? grade.grade : null,
                gender: gender ? gender.name : null
            };
        })
        .filter(Boolean);

    res.json(studentProfiles);
});

app.get('/api/students', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { institution_id, status_id, grade_id, gender_id, min_age, max_age, search } = req.query;

    let studentProfiles = [...db.student_profiles];

    if (req.user) {
        if (req.user.role === 'ADMINISTRADOR') {
            studentProfiles = studentProfiles.filter(sp => sp.institution_id === req.user.institution_id);
        } else if (req.user.role === 'ESTUDIANTE') {
            studentProfiles = studentProfiles.filter(sp => sp.id === req.user.student_profile_id);
        }
    }

    if (institution_id) studentProfiles = studentProfiles.filter(sp => sp.institution_id === parseInt(institution_id));
    if (status_id) studentProfiles = studentProfiles.filter(sp => sp.status_id === parseInt(status_id));
    if (grade_id) studentProfiles = studentProfiles.filter(sp => sp.grade_id === parseInt(grade_id));

    let enriched = studentProfiles.map(enrichStudentProfile);

    if (search) {
        const term = search.toLowerCase();
        enriched = enriched.filter(s => {
            const fullName = `${s.person?.first_name || ''} ${s.person?.last_name || ''}`.toLowerCase();
            const docNumber = s.person?.document_number || '';
            return fullName.includes(term) || docNumber.includes(term);
        });
    }

    if (gender_id) {
        const genderName = db.genders.find(g => g.id === parseInt(gender_id))?.name;
        if (genderName) {
            enriched = enriched.filter(s => s.gender === genderName);
        }
    }

    if (min_age || max_age) {
        enriched = enriched.filter(s => {
            if (!s.person || !s.person.age) return false;
            if (min_age && s.person.age < parseInt(min_age)) return false;
            if (max_age && s.person.age > parseInt(max_age)) return false;
            return true;
        });
    }

    res.json(enriched);
});

// ============================================================
// RUTAS DE INSTITUCIONES (CRUD completo)
// ============================================================

app.get('/api/institutions', requireAuth, (req, res) => {
    let institutions = [...db.institutions];

    if (req.user && req.user.role === 'ADMINISTRADOR') {
        institutions = institutions.filter(i => i.id === req.user.institution_id);
    }

    res.json(institutions.map(enrichInstitution));
});

app.post('/api/institutions', requireRole('SUPERADMIN'), (req, res) => {
    const { institution_name, director, address, neighborhood_id, dane_code } = req.body;

    if (!institution_name || !institution_name.trim()) {
        return res.status(400).json({ error: 'El nombre de la institución es obligatorio' });
    }
    if (!director || !director.trim()) {
        return res.status(400).json({ error: 'El nombre del director es obligatorio' });
    }
    if (!dane_code || !dane_code.trim()) {
        return res.status(400).json({ error: 'El código DANE es obligatorio' });
    }
    if (!neighborhood_id) {
        return res.status(400).json({ error: 'El barrio es obligatorio' });
    }

    const existing = db.institutions.find(i => i.institution_name === institution_name.trim());
    if (existing) return res.status(400).json({ error: 'Ya existe una institución con ese nombre' });

    const existingDane = db.institutions.find(i => i.dane_code === dane_code.trim());
    if (existingDane) return res.status(400).json({ error: 'Ya existe una institución con ese código DANE' });

    const institution = {
        id: nextId(db.institutions),
        institution_name: institution_name.trim(),
        director: director.trim(),
        address: address || '',
        neighborhood_id: parseInt(neighborhood_id),
        credential_id: null,
        dane_code: dane_code.trim(),
        active: true
    };

    db.institutions.push(institution);
    saveDatabase();

    res.status(201).json({ data: institution, message: 'Institución creada exitosamente' });
});

app.put('/api/institutions/:id', requireRole('SUPERADMIN'), (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));

    if (!institution) return res.status(404).json({ error: 'Institución no encontrada' });

    if (req.body.institution_name !== undefined) {
        if (!req.body.institution_name.trim()) return res.status(400).json({ error: 'El nombre de la institución no puede estar vacío' });
        const existing = db.institutions.find(i => i.institution_name === req.body.institution_name.trim() && i.id !== parseInt(id));
        if (existing) return res.status(400).json({ error: 'Ya existe otra institución con ese nombre' });
        institution.institution_name = req.body.institution_name.trim();
    }
    if (req.body.director !== undefined) {
        if (!req.body.director.trim()) return res.status(400).json({ error: 'El nombre del director no puede estar vacío' });
        institution.director = req.body.director.trim();
    }
    if (req.body.address !== undefined) institution.address = req.body.address;
    if (req.body.neighborhood_id !== undefined) institution.neighborhood_id = parseInt(req.body.neighborhood_id);
    if (req.body.dane_code !== undefined) {
        if (!req.body.dane_code.trim()) return res.status(400).json({ error: 'El código DANE no puede estar vacío' });
        const existingDane = db.institutions.find(i => i.dane_code === req.body.dane_code.trim() && i.id !== parseInt(id));
        if (existingDane) return res.status(400).json({ error: 'Ya existe otra institución con ese código DANE' });
        institution.dane_code = req.body.dane_code.trim();
    }
    if (req.body.active !== undefined) {
        institution.active = req.body.active === true || req.body.active === 'true';
    }

    saveDatabase();
    res.json({ data: institution, message: 'Institución actualizada exitosamente' });
});

app.patch('/api/institutions/:id/toggle-active', requireRole('SUPERADMIN'), (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));
    if (!institution) return res.status(404).json({ error: 'Institución no encontrada' });
    institution.active = !institution.active;
    saveDatabase();
    res.json({ data: institution, message: `Institución ${institution.active ? 'activada' : 'desactivada'} exitosamente` });
});

app.delete('/api/institutions/:id', requireRole('SUPERADMIN'), (req, res) => {
    const { id } = req.params;
    const index = db.institutions.findIndex(i => i.id === parseInt(id));

    if (index === -1) return res.status(404).json({ error: 'Institución no encontrada' });

    const institution = db.institutions[index];
    const studentsCount = db.student_profiles.filter(sp => sp.institution_id === institution.id).length;
    if (studentsCount > 0) {
        return res.status(400).json({ error: `No se puede eliminar la institución porque tiene ${studentsCount} estudiante(s) asociado(s)` });
    }

    db.institutions.splice(index, 1);
    saveDatabase();

    res.json({ message: 'Institución eliminada exitosamente' });
});

app.get('/api/institutions/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));

    if (!institution) return res.status(404).json({ error: 'Institución no encontrada' });

    const neighborhood = db.neighborhoods.find(n => n.id === institution.neighborhood_id);
    const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;

    res.json({ ...institution, neighborhood: neighborhood ? neighborhood.name : null, locality: locality ? locality.name : null });
});

app.get('/api/institutions/:id/students', requireAuth, (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));

    if (!institution) return res.status(404).json({ error: 'Institución no encontrada' });

    const enriched = db.student_profiles
        .filter(sp => sp.institution_id === parseInt(id))
        .map(enrichStudentProfile);

    res.json(enriched);
});

// ============================================================
// RUTAS DE DASHBOARD
// ============================================================

function resolveDashboardProfiles(institutionId) {
    let profiles = [...db.student_profiles];
    if (institutionId) {
        profiles = profiles.filter(sp => sp.institution_id === parseInt(institutionId));
    }
    return profiles;
}

app.get('/api/dashboard/stats', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    let institutionFilter = null;

    if (req.query.institution_id) {
        institutionFilter = parseInt(req.query.institution_id);
    } else if (req.user && req.user.role === 'ADMINISTRADOR') {
        institutionFilter = req.user.institution_id;
    }

    const profiles = resolveDashboardProfiles(institutionFilter);
    res.json(computeDashboardStats(profiles));
});

app.get('/api/dashboard/stats/:institutionId', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const profiles = resolveDashboardProfiles(req.params.institutionId);
    res.json(computeDashboardStats(profiles));
});

// ============================================================
// CRUD DE PERSONAS (estudiantes)
// ============================================================

app.post('/api/people', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { first_name, last_name, gender_id, birth_date, email, phone, document_type_id, document_number, address, neighborhood_id, institution_id, grade_id, status_id, start_date, username, password } = req.body;

    if (!first_name || !first_name.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' });
    if (!last_name || !last_name.trim()) return res.status(400).json({ error: 'El apellido es obligatorio' });
    if (!gender_id) return res.status(400).json({ error: 'El género es obligatorio' });
    if (!birth_date) return res.status(400).json({ error: 'La fecha de nacimiento es obligatoria' });
    if (!email || !email.trim()) return res.status(400).json({ error: 'El email es obligatorio' });
    if (!document_type_id) return res.status(400).json({ error: 'El tipo de documento es obligatorio' });
    if (!document_number || !document_number.trim()) return res.status(400).json({ error: 'El número de documento es obligatorio' });
    if (!neighborhood_id) return res.status(400).json({ error: 'El barrio es obligatorio' });
    if (!institution_id) return res.status(400).json({ error: 'La institución es obligatoria' });
    if (!grade_id) return res.status(400).json({ error: 'El grado es obligatorio' });
    if (!status_id) return res.status(400).json({ error: 'El estado es obligatorio' });
    if (!username || !username.trim()) return res.status(400).json({ error: 'El nombre de usuario es obligatorio' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const existingEmail = db.people.find(p => p.email === email.trim());
    if (existingEmail) return res.status(400).json({ error: 'El email ya está registrado' });

    const existingDoc = db.people.find(p => p.document_number === document_number.trim());
    if (existingDoc) return res.status(400).json({ error: 'El número de documento ya está registrado' });

    const existingUser = db.credentials.find(c => c.username === username.trim());
    if (existingUser) return res.status(400).json({ error: 'El nombre de usuario ya existe' });

    if (req.user.role === 'ADMINISTRADOR' && parseInt(institution_id) !== req.user.institution_id) {
        return res.status(403).json({ error: 'No puedes crear estudiantes para otra institución' });
    }

    const credential = {
        id: nextId(db.credentials),
        username: username.trim(),
        password,
        role_id: 3
    };

    db.credentials.push(credential);

    const person = {
        id: nextId(db.people),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        gender_id: parseInt(gender_id),
        birth_date,
        email: email.trim(),
        phone: phone || '',
        document_type_id: parseInt(document_type_id),
        document_number: document_number.trim(),
        address: address || '',
        neighborhood_id: parseInt(neighborhood_id),
        credential_id: credential.id
    };

    db.people.push(person);

    const studentProfile = {
        id: nextId(db.student_profiles),
        people_id: person.id,
        institution_id: parseInt(institution_id),
        status_id: parseInt(status_id),
        grade_id: parseInt(grade_id),
        start_date: start_date || new Date().toISOString().split('T')[0],
        end_date: null
    };

    db.student_profiles.push(studentProfile);
    saveDatabase();

    res.status(201).json({
        data: { person, student_profile: studentProfile, credential: { id: credential.id, username: credential.username } },
        message: 'Estudiante creado exitosamente'
    });
});

app.put('/api/people/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const person = db.people.find(p => p.id === parseInt(id));

    if (!person) return res.status(404).json({ error: 'Persona no encontrada' });

    if (req.user.role === 'ESTUDIANTE' && req.user.person_id !== parseInt(id)) {
        return res.status(403).json({ error: 'No puedes editar datos de otra persona' });
    }

    if (req.user.role === 'ESTUDIANTE') {
        const now = new Date();
        const hasActiveCampaign = db.campaign_enrollments.some(e => {
            const profile = db.student_profiles.find(sp => sp.id === e.student_profile_id);
            if (!profile || profile.people_id !== parseInt(id)) return false;
            const campaign = db.campaigns.find(c => c.id === e.campaign_id);
            if (!campaign) return false;
            return isCampaignActive(campaign);
        });

        if (!hasActiveCampaign) {
            return res.status(400).json({ error: 'No hay campaña activa para actualizar datos' });
        }
    }

    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'address'];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    if (updates.email && updates.email !== person.email) {
        const existingPerson = db.people.find(p => p.email === updates.email);
        if (existingPerson) return res.status(400).json({ error: 'El email ya está en uso' });
    }

    Object.assign(person, updates);

    const studentProfile = db.student_profiles.find(sp => sp.people_id === parseInt(id));
    if (studentProfile) {
        const activeEnrollment = db.campaign_enrollments.find(e => {
            const campaign = db.campaigns.find(c => c.id === e.campaign_id);
            if (!campaign) return false;
            return e.student_profile_id === studentProfile.id && isCampaignActive(campaign);
        });

        if (activeEnrollment) {
            const updaterPerson = db.people.find(p => p.credential_id === req.user.id);
            db.updates.push({
                id: nextId(db.updates),
                people_id: parseInt(id),
                campaign_id: activeEnrollment.campaign_id,
                updated_at: new Date().toISOString(),
                updated_by_name: updaterPerson ? `${updaterPerson.first_name} ${updaterPerson.last_name}` : req.user.username,
                updated_by_role: req.user.role
            });
        }
    }

    saveDatabase();

    res.json({ data: person, message: 'Persona actualizada exitosamente' });
});

app.get('/api/people/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const person = db.people.find(p => p.id === parseInt(id));

    if (!person) return res.status(404).json({ error: 'Persona no encontrada' });

    const studentProfile = db.student_profiles.find(sp => sp.people_id === person.id);
    const institution = studentProfile ? db.institutions.find(i => i.id === studentProfile.institution_id) : null;
    const status = studentProfile ? db.statuses.find(s => s.id === studentProfile.status_id) : null;
    const grade = studentProfile ? db.grades.find(g => g.id === studentProfile.grade_id) : null;
    const gender = db.genders.find(g => g.id === person.gender_id);
    const documentType = db.document_types.find(d => d.id === person.document_type_id);
    const neighborhood = person.neighborhood_id ? db.neighborhoods.find(n => n.id === person.neighborhood_id) : null;
    const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;
    const lastUpdate = getLastUpdate(person.id);
    const credential = person.credential_id ? db.credentials.find(c => c.id === person.credential_id) : null;

    res.json({
        ...person,
        age: calcAge(person.birth_date),
        last_update_date: lastUpdate ? lastUpdate.updated_at : null,
        last_update_by_name: lastUpdate ? lastUpdate.updated_by_name : null,
        last_update_by_role: lastUpdate ? lastUpdate.updated_by_role : null,
        document_type: documentType ? documentType.name : null,
        gender: gender ? gender.name : null,
        neighborhood: neighborhood ? neighborhood.name : null,
        locality: locality ? locality.name : null,
        credential_username: credential ? credential.username : null,
        student_profile: studentProfile ? {
            id: studentProfile.id,
            grade: grade ? grade.grade : null,
            status: status ? status.status : null,
            institution: institution ? { id: institution.id, name: institution.institution_name } : null
        } : null
    });
});

// ============================================================
// CRUD DE CREDENCIALES (usuarios administradores)
// ============================================================

app.post('/api/credentials', requireRole('SUPERADMIN'), (req, res) => {
    const { username, password, role_id, institution_id } = req.body;

    if (!username || !username.trim()) return res.status(400).json({ error: 'El nombre de usuario es obligatorio' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    if (!role_id) return res.status(400).json({ error: 'El rol es obligatorio' });

    const existingUser = db.credentials.find(c => c.username === username.trim());
    if (existingUser) return res.status(400).json({ error: 'El nombre de usuario ya existe' });

    const role = db.user_roles.find(r => r.id === parseInt(role_id));
    if (!role) return res.status(400).json({ error: 'Rol no válido' });

    const credential = {
        id: nextId(db.credentials),
        username: username.trim(),
        password,
        role_id: parseInt(role_id)
    };

    db.credentials.push(credential);

    if (role.name === 'ADMINISTRADOR' && institution_id) {
        const institution = db.institutions.find(i => i.id === parseInt(institution_id));
        if (institution) {
            institution.credential_id = credential.id;
        }
    }

    saveDatabase();

    res.status(201).json({
        data: { id: credential.id, username: credential.username, role: role.name },
        message: 'Usuario creado exitosamente'
    });
});

// ============================================================
// ENDPOINT PARA EDITAR ESTUDIANTE POR ADMIN
// ============================================================

app.put('/api/students/:studentProfileId', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { studentProfileId } = req.params;
    const studentProfile = db.student_profiles.find(sp => sp.id === parseInt(studentProfileId));

    if (!studentProfile) return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });

    const person = db.people.find(p => p.id === studentProfile.people_id);
    if (!person) return res.status(404).json({ error: 'Persona no encontrada' });

    if (req.user.role === 'ADMINISTRADOR' && studentProfile.institution_id !== req.user.institution_id) {
        return res.status(403).json({ error: 'No puedes editar estudiantes de otra institución' });
    }

    const personFields = ['first_name', 'last_name', 'email', 'phone', 'address', 'gender_id', 'birth_date', 'document_type_id', 'document_number', 'neighborhood_id'];
    for (const field of personFields) {
        if (req.body[field] !== undefined) {
            if (field === 'email' && req.body[field] !== person.email) {
                const existingEmail = db.people.find(p => p.email === req.body[field] && p.id !== person.id);
                if (existingEmail) return res.status(400).json({ error: 'El email ya está en uso' });
            }
            if (field === 'document_number' && req.body[field] !== person.document_number) {
                const existingDoc = db.people.find(p => p.document_number === req.body[field] && p.id !== person.id);
                if (existingDoc) return res.status(400).json({ error: 'El número de documento ya está en uso' });
            }
            person[field] = req.body[field];
        }
    }

    const profileFields = ['grade_id', 'status_id', 'institution_id'];
    for (const field of profileFields) {
        if (req.body[field] !== undefined) {
            studentProfile[field] = parseInt(req.body[field]);
        }
    }

    const updaterPerson = db.people.find(p => p.credential_id === req.user.id);
    db.updates.push({
        id: nextId(db.updates),
        people_id: person.id,
        campaign_id: null,
        updated_at: new Date().toISOString(),
        updated_by_name: updaterPerson ? `${updaterPerson.first_name} ${updaterPerson.last_name}` : req.user.username,
        updated_by_role: req.user.role
    });

    saveDatabase();

    res.json({ data: person, message: 'Estudiante actualizado exitosamente' });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
    console.log(`\nServidor mock de NexoEdu iniciado en http://localhost:${PORT}`);
    console.log(`\nEndpoints disponibles:`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/me`);
    console.log(`   POST /api/auth/change-password`);
    console.log(`   POST /api/auth/forgot-password`);
    console.log(`   GET  /api/campaigns`);
    console.log(`   GET  /api/campaigns/active`);
    console.log(`   GET  /api/campaigns/pinned`);
    console.log(`   GET  /api/campaigns/available/:personId`);
    console.log(`   GET  /api/campaigns/:id`);
    console.log(`   POST /api/campaigns`);
    console.log(`   PUT  /api/campaigns/:id`);
    console.log(`   DELETE /api/campaigns/:id`);
    console.log(`   POST /api/campaigns/:id/enroll`);
    console.log(`   GET  /api/students`);
    console.log(`   GET  /api/students/campaign/:campaignId`);
    console.log(`   PUT  /api/students/:studentProfileId`);
    console.log(`   POST /api/people`);
    console.log(`   PUT  /api/people/:id`);
    console.log(`   GET  /api/people/:id`);
    console.log(`   GET  /api/institutions`);
    console.log(`   POST /api/institutions`);
    console.log(`   PUT  /api/institutions/:id`);
    console.log(`   DELETE /api/institutions/:id`);
    console.log(`   PATCH /api/institutions/:id/toggle-active`);
    console.log(`   GET  /api/institutions/:id`);
    console.log(`   GET  /api/institutions/:id/students`);
    console.log(`   GET  /api/user-roles`);
    console.log(`   GET  /api/document-types`);
    console.log(`   GET  /api/genders`);
    console.log(`   GET  /api/grades`);
    console.log(`   GET  /api/statuses`);
    console.log(`   GET  /api/localities`);
    console.log(`   GET  /api/neighborhoods`);
    console.log(`   POST /api/credentials`);
    console.log(`   GET  /api/dashboard/stats`);
    console.log(`   GET  /api/dashboard/stats/:institutionId`);
    console.log(`   GET  /api/campaigns/:id/progress`);
    console.log(`\nEste servidor es PROVISIONAL. Ver backend/server.js para más info.\n`);
});
