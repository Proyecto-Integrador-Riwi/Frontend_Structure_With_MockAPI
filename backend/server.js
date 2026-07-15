/**
 * ============================================================
 * SERVIDOR MOCK - NexoEdu (PROVISIONAL)
 * ============================================================
 * 
 * IMPORTANTE: Este servidor es PROVISIONAL y está diseñado
 * únicamente para el desarrollo del frontend mientras el
 * equipo backend completa los endpoints reales con FastAPI + PostgreSQL.
 * 
 * ============================================================
 * CUANDO EL BACKEND REAL ESTÉ LISTO, ELIMINAR:
 * 1. Este archivo (backend/server.js)
 * 2. backend/db.json
 * 3. backend/seed/ (toda la carpeta)
 * 4. Cambiar API_URL en frontend/src/modules/auth.js
 *    de http://localhost:3001 a http://localhost:3000
 * 5. Actualizar los servicios para apuntar a los endpoints reales
 * ============================================================
 * 
 * ENDPOINTS PROVISIONALES:
 * 
 * AUTENTICACIÓN:
 * - POST /api/auth/login          → Login y obtención de token
 * - GET  /api/auth/me             → Información del usuario actual
 * 
 * CAMPAÑAS:
 * - GET  /api/campaigns           → Lista de campañas (filtros: active, institution_id, scope_type)
 * - GET  /api/campaigns/active    → Solo campañas vigentes
 * - GET  /api/campaigns/pinned    → Campañas fijadas (para SuperAdmin)
 * - GET  /api/campaigns/available/:personId → Campañas disponibles para una persona
 * - POST /api/campaigns/:id/enroll → Inscribirse en una campaña
 * 
 * ESTUDIANTES:
 * - GET  /api/students            → Lista de estudiantes (filtros: institution_id, status_id, grade_id, gender, min_age, max_age)
 * - GET  /api/students/campaign/:campaignId → Estudiantes inscritos en una campaña
 * 
 * INSTITUCIONES:
 * - GET  /api/institutions        → Lista de instituciones
 * - GET  /api/institutions/:id    → Detalle de una institución
 * - GET  /api/institutions/:id/students → Estudiantes de una institución
 * 
 * DASHBOARD:
 * - GET  /api/dashboard/stats/:institutionId? → Estadísticas generales
 * 
 * PEOPLE:
 * - PUT  /api/people/:id          → Actualizar datos de una persona
 * 
 * CATÁLOGOS (CRUD básico):
 * - GET  /api/user-roles          → Roles de usuario
 * - GET  /api/document-types      → Tipos de documento
 * - GET  /api/genders             → Géneros
 * - GET  /api/grades              → Grados
 * - GET  /api/statuses            → Estados
 * - GET  /api/localities          → Localidades
 * - GET  /api/neighborhoods       → Barrios
 * 
 * ============================================================
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

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
    const raw = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(raw);
    console.log('📦 Base de datos cargada desde db.json');
}

function saveDatabase() {
    const dbPath = path.join(__dirname, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// Cargar al iniciar
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
    return sessions.get(token) || null;
}

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
// RUTAS DE AUTENTICACIÓN
// ============================================================

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    // Buscar credencial
    const credential = db.credentials.find(c => c.username === username);
    if (!credential) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Verificar password (simulado)
    if (credential.password !== password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Obtener rol
    const role = db.user_roles.find(r => r.id === credential.role_id);
    if (!role) {
        return res.status(500).json({ error: 'Error en el sistema' });
    }

    // Obtener persona asociada
    const person = db.people.find(p => p.credential_id === credential.id);
    
    // Obtener institución si es admin
    let institutionId = null;
    if (role.name === 'ADMINISTRADOR' && person) {
        const institution = db.institutions.find(i => i.credential_id === credential.id);
        if (institution) {
            institutionId = institution.id;
        }
    }

    // Obtener student_profile si es estudiante
    let studentProfileId = null;
    if (role.name === 'ESTUDIANTE' && person) {
        const profile = db.student_profiles.find(sp => sp.people_id === person.id);
        if (profile) {
            studentProfileId = profile.id;
        }
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
    const now = new Date();
    const activeCampaigns = db.campaigns.filter(c => {
        const start = new Date(c.start_date);
        const end = c.end_date ? new Date(c.end_date) : new Date('2099-12-31');
        return now >= start && now <= end;
    });

    const enriched = activeCampaigns.map(c => ({
        ...c,
        scope: db.campaign_scope.filter(s => s.campaign_id === c.id),
        criteria: db.campaign_criteria.filter(cr => cr.campaign_id === c.id),
        enrollment_count: db.campaign_enrollments.filter(e => e.campaign_id === c.id).length
    }));

    res.json(enriched);
});

app.get('/api/campaigns/pinned', requireAuth, (req, res) => {
    const pinnedCampaigns = db.campaigns.filter(c => c.pinned === true);

    const enriched = pinnedCampaigns.map(c => ({
        ...c,
        scope: db.campaign_scope.filter(s => s.campaign_id === c.id),
        criteria: db.campaign_criteria.filter(cr => cr.campaign_id === c.id),
        enrollment_count: db.campaign_enrollments.filter(e => e.campaign_id === c.id).length
    }));

    res.json(enriched);
});

app.get('/api/campaigns/available/:personId', requireAuth, (req, res) => {
    const { personId } = req.params;
    const person = db.people.find(p => p.id === parseInt(personId));
    
    if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
    }

    const studentProfile = db.student_profiles.find(sp => sp.people_id === person.id);
    
    const now = new Date();
    const activeCampaigns = db.campaigns.filter(c => {
        const start = new Date(c.start_date);
        const end = c.end_date ? new Date(c.end_date) : new Date('2099-12-31');
        return now >= start && now <= end;
    });

    const availableCampaigns = activeCampaigns.filter(campaign => {
        const scopes = db.campaign_scope.filter(s => s.campaign_id === campaign.id);
        const allCriteria = db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id);

        const hasGlobalScope = scopes.some(s => s.scope_type === 'GLOBAL');
        let hasLocationScope = false;
        let hasInstitutionScope = false;

        if (studentProfile) {
            const institution = db.institutions.find(i => i.id === studentProfile.institution_id);
            if (institution) {
                hasInstitutionScope = scopes.some(s => 
                    s.scope_type === 'INSTITUTION' && 
                    parseInt(s.institution_id) === studentProfile.institution_id
                );
                
                const neighborhood = db.neighborhoods.find(n => n.id === institution.neighborhood_id);
                if (neighborhood) {
                    hasLocationScope = scopes.some(s => 
                        s.scope_type === 'NEIGHBORHOOD' && 
                        parseInt(s.neighborhood_id) === institution.neighborhood_id
                    ) || scopes.some(s => 
                        s.scope_type === 'LOCALITY' && 
                        parseInt(s.localities_id) === neighborhood.locality_id
                    );
                }
            }
        }

        const inScope = hasGlobalScope || hasLocationScope || hasInstitutionScope;
        if (!inScope) return false;

        if (!allCriteria || allCriteria.length === 0) return true;

        for (const criteria of allCriteria) {
            if (criteria.gender_id && person.gender_id !== criteria.gender_id) return false;
            if (criteria.grade_id && studentProfile && studentProfile.grade_id !== criteria.grade_id) return false;
            if (criteria.status_id && studentProfile && studentProfile.status_id !== criteria.status_id) return false;

            if (criteria.min_age || criteria.max_age) {
                const birthDate = new Date(person.birth_date);
                const ageDifMs = Date.now() - birthDate.getTime();
                const ageDate = new Date(ageDifMs);
                const age = Math.abs(ageDate.getUTCFullYear() - 1970);

                if (criteria.min_age && age < criteria.min_age) return false;
                if (criteria.max_age && age > criteria.max_age) return false;
            }
        }

        const alreadyEnrolled = db.campaign_enrollments.some(
            e => e.campaign_id === campaign.id && e.student_profile_id === studentProfile?.id
        );
        if (alreadyEnrolled) return false;

        return true;
    });

    const enriched = availableCampaigns.map(c => ({
        ...c,
        scope: db.campaign_scope.filter(s => s.campaign_id === c.id),
        criteria: db.campaign_criteria.filter(cr => cr.campaign_id === c.id),
        enrollment_count: db.campaign_enrollments.filter(e => e.campaign_id === c.id).length
    }));

    res.json(enriched);
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
        const now = new Date();
        campaigns = campaigns.filter(c => {
            const start = new Date(c.start_date);
            const end = c.end_date ? new Date(c.end_date) : new Date('2099-12-31');
            return now >= start && now <= end;
        });
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

    const enriched = campaigns.map(c => ({
        ...c,
        scope: db.campaign_scope.filter(s => s.campaign_id === c.id),
        criteria: db.campaign_criteria.filter(cr => cr.campaign_id === c.id),
        enrollment_count: db.campaign_enrollments.filter(e => e.campaign_id === c.id).length
    }));

    res.json(enriched);
});

app.post('/api/campaigns/:id/enroll', requireAuth, (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));
    
    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31');
    if (now < start || now > end) {
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

    // Validar scope
    const person = db.people.find(p => p.id === personId);
    const scopes = db.campaign_scope.filter(s => s.campaign_id === campaign.id);
    const hasGlobalScope = scopes.some(s => s.scope_type === 'GLOBAL');
    let hasLocationScope = false;
    let hasInstitutionScope = false;

    if (studentProfile) {
        const institution = db.institutions.find(i => i.id === studentProfile.institution_id);
        if (institution) {
            hasInstitutionScope = scopes.some(s =>
                s.scope_type === 'INSTITUTION' &&
                parseInt(s.institution_id) === studentProfile.institution_id
            );
            const neighborhood = db.neighborhoods.find(n => n.id === institution.neighborhood_id);
            if (neighborhood) {
                hasLocationScope = scopes.some(s =>
                    s.scope_type === 'NEIGHBORHOOD' &&
                    parseInt(s.neighborhood_id) === institution.neighborhood_id
                ) || scopes.some(s =>
                    s.scope_type === 'LOCALITY' &&
                    parseInt(s.localities_id) === neighborhood.locality_id
                );
            }
        }
    }

    if (!hasGlobalScope && !hasLocationScope && !hasInstitutionScope) {
        return res.status(403).json({ error: 'No cumples con el alcance de esta campaña' });
    }

    // Validar criteria
    const allCriteria = db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id);
    for (const criteria of allCriteria) {
        if (criteria.gender_id && person && person.gender_id !== criteria.gender_id) {
            return res.status(403).json({ error: 'No cumples con los criterios de esta campaña (género)' });
        }
        if (criteria.grade_id && studentProfile && studentProfile.grade_id !== criteria.grade_id) {
            return res.status(403).json({ error: 'No cumples con los criterios de esta campaña (grado)' });
        }
        if (criteria.status_id && studentProfile && studentProfile.status_id !== criteria.status_id) {
            return res.status(403).json({ error: 'No cumples con los criterios de esta campaña (estado)' });
        }
        if ((criteria.min_age || criteria.max_age) && person && person.birth_date) {
            const birthDate = new Date(person.birth_date);
            const age = Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
            if (criteria.min_age && age < criteria.min_age) {
                return res.status(403).json({ error: 'No cumples con los criterios de esta campaña (edad mínima)' });
            }
            if (criteria.max_age && age > criteria.max_age) {
                return res.status(403).json({ error: 'No cumples con los criterios de esta campaña (edad máxima)' });
            }
        }
    }

    const newEnrollment = {
        id: db.campaign_enrollments.length + 1,
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
    const pendingCount = totalEnrolled - updatedCount;
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

    const updatedFirst = students.sort((a, b) => {
        if (a.has_updated !== b.has_updated) return a.has_updated ? -1 : 1;
        if (a.updated_at && b.updated_at) return new Date(b.updated_at) - new Date(a.updated_at);
        return 0;
    });

    res.json({
        total_enrolled: totalEnrolled,
        updated_count: updatedCount,
        pending_count: pendingCount,
        update_percentage: updatePercentage,
        students: updatedFirst
    });
});

// ============================================================
// CRUD DE CAMPAÑAS
// ============================================================

app.post('/api/campaigns', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { title, type, description, sponsor, start_date, end_date, url_multimedia, pinned } = req.body;

    if (!title || !type || !start_date) {
        return res.status(400).json({ error: 'Título, tipo y fecha de inicio son requeridos' });
    }

    const newId = db.campaigns.length > 0 ? Math.max(...db.campaigns.map(c => c.id)) + 1 : 1;

    const campaign = {
        id: newId,
        title,
        type,
        description: description || '',
        sponsor: sponsor || '',
        created_by_credentials_id: req.user.id,
        start_date,
        end_date: end_date || null,
        url_multimedia: url_multimedia || null,
        pinned: pinned === true
    };

    db.campaigns.push(campaign);
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

    // Get enrolled students
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

    res.json({
        ...campaign,
        scope,
        criteria,
        enrollment_count: enrollmentCount,
        students
    });
});

app.put('/api/campaigns/:id', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { id } = req.params;
    const campaign = db.campaigns.find(c => c.id === parseInt(id));

    if (!campaign) {
        return res.status(404).json({ error: 'Campaña no encontrada' });
    }

    const allowedFields = ['title', 'type', 'description', 'sponsor', 'start_date', 'end_date', 'url_multimedia', 'pinned'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            if (field === 'pinned') {
                campaign[field] = req.body[field] === true;
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

    // Clean up related data
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
    
    const enrollments = db.campaign_enrollments.filter(
        e => e.campaign_id === parseInt(campaignId)
    );

    const studentProfiles = enrollments.map(e => {
        const profile = db.student_profiles.find(sp => sp.id === e.student_profile_id);
        if (!profile) return null;

        const person = db.people.find(p => p.id === profile.people_id);
        const institution = db.institutions.find(i => i.id === profile.institution_id);
        const grade = db.grades.find(g => g.id === profile.grade_id);
        const gender = person ? db.genders.find(g => g.id === person.gender_id) : null;

        return {
            ...profile,
            enrolled_at: e.enrolled_at,
            person: person ? {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email,
                phone: person.phone
            } : null,
            institution: institution ? {
                id: institution.id,
                name: institution.institution_name
            } : null,
            grade: grade ? grade.grade : null,
            gender: gender ? gender.name : null
        };
    }).filter(Boolean);

    res.json(studentProfiles);
});

app.get('/api/students', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { institution_id, status_id, grade_id, gender_id, min_age, max_age } = req.query;

    let studentProfiles = [...db.student_profiles];

    // Restricción por rol
    if (req.user) {
        if (req.user.role === 'ADMINISTRADOR') {
            studentProfiles = studentProfiles.filter(sp => sp.institution_id === req.user.institution_id);
        } else if (req.user.role === 'ESTUDIANTE') {
            studentProfiles = studentProfiles.filter(sp => sp.id === req.user.student_profile_id);
        }
    }

    // Filtros
    if (institution_id) studentProfiles = studentProfiles.filter(sp => sp.institution_id === parseInt(institution_id));
    if (status_id) studentProfiles = studentProfiles.filter(sp => sp.status_id === parseInt(status_id));
    if (grade_id) studentProfiles = studentProfiles.filter(sp => sp.grade_id === parseInt(grade_id));

    const enriched = studentProfiles.map(sp => {
        const person = db.people.find(p => p.id === sp.people_id);
        const institution = db.institutions.find(i => i.id === sp.institution_id);
        const status = db.statuses.find(s => s.id === sp.status_id);
        const grade = db.grades.find(g => g.id === sp.grade_id);
        const gender = person ? db.genders.find(g => g.id === person.gender_id) : null;
        const neighborhood = person ? db.neighborhoods.find(n => n.id === person.neighborhood_id) : null;
        const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;

        let age = null;
        if (person && person.birth_date) {
            const birthDate = new Date(person.birth_date);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        return {
            ...sp,
            person: person ? {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email,
                phone: person.phone,
                document_type: person.document_type_id,
                document_number: person.document_number,
                address: person.address,
                age,
                gender_id: person.gender_id
            } : null,
            institution: institution ? {
                id: institution.id,
                name: institution.institution_name
            } : null,
            status: status ? status.status : null,
            grade: grade ? grade.grade : null,
            gender: gender ? gender.name : null,
            locality: locality ? locality.name : null,
            neighborhood: neighborhood ? neighborhood.name : null
        };
    });

    // Filtrar por género
    let result = enriched;
    if (gender_id) {
        result = result.filter(s => {
            const gender = db.genders.find(g => g.id === parseInt(gender_id));
            return gender && s.gender === gender.name;
        });
    }

    // Filtrar por rango de edad
    if (min_age || max_age) {
        result = result.filter(s => {
            if (!s.person || !s.person.age) return false;
            if (min_age && s.person.age < parseInt(min_age)) return false;
            if (max_age && s.person.age > parseInt(max_age)) return false;
            return true;
        });
    }

    res.json(result);
});

// ============================================================
// RUTAS DE INSTITUCIONES
// ============================================================

app.get('/api/institutions', requireAuth, (req, res) => {
    let institutions = [...db.institutions];

    // Restricción por rol
    if (req.user && req.user.role === 'ADMINISTRADOR') {
        institutions = institutions.filter(i => i.id === req.user.institution_id);
    }

    const enriched = institutions.map(inst => {
        const neighborhood = db.neighborhoods.find(n => n.id === inst.neighborhood_id);
        const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;
        const studentCount = db.student_profiles.filter(
            sp => sp.institution_id === inst.id && sp.status_id === 1
        ).length;
        const graduateCount = db.student_profiles.filter(
            sp => sp.institution_id === inst.id && sp.status_id === 2
        ).length;

        return {
            ...inst,
            neighborhood: neighborhood ? neighborhood.name : null,
            locality: locality ? locality.name : null,
            student_count: studentCount,
            graduate_count: graduateCount
        };
    });

    res.json(enriched);
});

app.get('/api/institutions/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));
    
    if (!institution) {
        return res.status(404).json({ error: 'Institución no encontrada' });
    }

    const neighborhood = db.neighborhoods.find(n => n.id === institution.neighborhood_id);
    const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;

    res.json({
        ...institution,
        neighborhood: neighborhood ? neighborhood.name : null,
        locality: locality ? locality.name : null
    });
});

app.get('/api/institutions/:id/students', requireAuth, (req, res) => {
    const { id } = req.params;
    const institution = db.institutions.find(i => i.id === parseInt(id));
    
    if (!institution) {
        return res.status(404).json({ error: 'Institución no encontrada' });
    }

    const studentProfiles = db.student_profiles.filter(sp => sp.institution_id === parseInt(id));

    const enriched = studentProfiles.map(sp => {
        const person = db.people.find(p => p.id === sp.people_id);
        const status = db.statuses.find(s => s.id === sp.status_id);
        const grade = db.grades.find(g => g.id === sp.grade_id);
        const gender = person ? db.genders.find(g => g.id === person.gender_id) : null;

        let age = null;
        if (person && person.birth_date) {
            const birthDate = new Date(person.birth_date);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        return {
            ...sp,
            person: person ? {
                id: person.id,
                first_name: person.first_name,
                last_name: person.last_name,
                email: person.email,
                phone: person.phone,
                document_type: person.document_type_id,
                document_number: person.document_number,
                address: person.address,
                age,
                gender_id: person.gender_id
            } : null,
            status: status ? status.status : null,
            grade: grade ? grade.grade : null,
            gender: gender ? gender.name : null
        };
    });

    res.json(enriched);
});

// ============================================================
// RUTAS DE DASHBOARD
// ============================================================

// Ruta para estadísticas globales
app.get('/api/dashboard/stats', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const institutionId = req.query.institution_id || null;
    
    let institutionFilter = null;
    
    if (institutionId) {
        institutionFilter = parseInt(institutionId);
    } else if (req.user && req.user.role === 'ADMINISTRADOR') {
        institutionFilter = req.user.institution_id;
    }

    let profiles = [...db.student_profiles];
    
    if (institutionFilter) {
        profiles = profiles.filter(sp => sp.institution_id === institutionFilter);
    }

    const totalStudents = profiles.filter(sp => sp.status_id === 1).length;
    const totalGraduates = profiles.filter(sp => sp.status_id === 2).length;
    const totalWithdrawn = profiles.filter(sp => sp.status_id === 3).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUpdates = db.updates.filter(u => {
        const updateDate = new Date(u.updated_at);
        return updateDate >= thirtyDaysAgo;
    });

    const updatedPeopleIds = new Set(recentUpdates.map(u => u.people_id));
    const updatedCount = profiles.filter(sp => updatedPeopleIds.has(sp.people_id)).length;
    const pendingCount = profiles.length - updatedCount;

    const lastUpdate = db.updates.length > 0 
        ? db.updates.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
        : null;

    res.json({
        total_students: totalStudents,
        total_graduates: totalGraduates,
        total_withdrawn: totalWithdrawn,
        total_population: profiles.length,
        updated_count: updatedCount,
        pending_count: pendingCount,
        update_percentage: profiles.length > 0 
            ? Math.round((updatedCount / profiles.length) * 100) 
            : 0,
        last_update_date: lastUpdate ? lastUpdate.updated_at : null
    });
});

// Ruta para estadísticas de institución específica
app.get('/api/dashboard/stats/:institutionId', requireRole('SUPERADMIN', 'ADMINISTRADOR'), (req, res) => {
    const { institutionId } = req.params;
    
    let profiles = [...db.student_profiles];
    
    if (institutionId) {
        profiles = profiles.filter(sp => sp.institution_id === parseInt(institutionId));
    }

    const totalStudents = profiles.filter(sp => sp.status_id === 1).length;
    const totalGraduates = profiles.filter(sp => sp.status_id === 2).length;
    const totalWithdrawn = profiles.filter(sp => sp.status_id === 3).length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUpdates = db.updates.filter(u => {
        const updateDate = new Date(u.updated_at);
        return updateDate >= thirtyDaysAgo;
    });

    const updatedPeopleIds = new Set(recentUpdates.map(u => u.people_id));
    const updatedCount = profiles.filter(sp => updatedPeopleIds.has(sp.people_id)).length;
    const pendingCount = profiles.length - updatedCount;

    const lastUpdate = db.updates.length > 0 
        ? db.updates.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]
        : null;

    res.json({
        total_students: totalStudents,
        total_graduates: totalGraduates,
        total_withdrawn: totalWithdrawn,
        total_population: profiles.length,
        updated_count: updatedCount,
        pending_count: pendingCount,
        update_percentage: profiles.length > 0 
            ? Math.round((updatedCount / profiles.length) * 100) 
            : 0,
        last_update_date: lastUpdate ? lastUpdate.updated_at : null
    });
});

// ============================================================
// RUTAS DE PEOPLE
// ============================================================

app.put('/api/people/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const person = db.people.find(p => p.id === parseInt(id));
    
    if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
    }

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
            
            const start = new Date(campaign.start_date);
            const end = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31');
            return now >= start && now <= end;
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
        if (existingPerson) {
            return res.status(400).json({ error: 'El email ya está en uso' });
        }
    }

    Object.assign(person, updates);
    
    // Registrar actualización
    const studentProfile = db.student_profiles.find(sp => sp.people_id === parseInt(id));
    if (studentProfile) {
        const activeEnrollment = db.campaign_enrollments.find(e => {
            const campaign = db.campaigns.find(c => c.id === e.campaign_id);
            if (!campaign) return false;
            const now = new Date();
            const start = new Date(campaign.start_date);
            const end = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31');
            return e.student_profile_id === studentProfile.id && now >= start && now <= end;
        });

        if (activeEnrollment) {
            const newUpdate = {
                id: db.updates.length + 1,
                people_id: parseInt(id),
                campaign_id: activeEnrollment.campaign_id,
                updated_at: new Date().toISOString()
            };
            db.updates.push(newUpdate);
        }
    }

    saveDatabase();

    res.json({ data: person, message: 'Persona actualizada exitosamente' });
});

app.get('/api/people/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const person = db.people.find(p => p.id === parseInt(id));

    if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
    }

    const studentProfile = db.student_profiles.find(sp => sp.people_id === person.id);
    const institution = studentProfile ? db.institutions.find(i => i.id === studentProfile.institution_id) : null;
    const status = studentProfile ? db.statuses.find(s => s.id === studentProfile.status_id) : null;
    const grade = studentProfile ? db.grades.find(g => g.id === studentProfile.grade_id) : null;
    const gender = db.genders.find(g => g.id === person.gender_id);
    const documentType = db.document_types.find(d => d.id === person.document_type_id);
    const neighborhood = person.neighborhood_id ? db.neighborhoods.find(n => n.id === person.neighborhood_id) : null;
    const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;

    let age = null;
    if (person.birth_date) {
        const birthDate = new Date(person.birth_date);
        age = Math.abs(new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970);
    }

    res.json({
        ...person,
        age,
        document_type: documentType ? documentType.name : null,
        gender: gender ? gender.name : null,
        neighborhood: neighborhood ? neighborhood.name : null,
        locality: locality ? locality.name : null,
        student_profile: studentProfile ? {
            id: studentProfile.id,
            grade: grade ? grade.grade : null,
            status: status ? status.status : null,
            institution: institution ? { id: institution.id, name: institution.institution_name } : null
        } : null
    });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
    console.log(`\n🚀 Servidor mock de NexoEdu iniciado en http://localhost:${PORT}`);
    console.log(`\n📋 Endpoints disponibles:`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/auth/me`);
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
    console.log(`   GET  /api/institutions`);
    console.log(`   GET  /api/institutions/:id`);
    console.log(`   GET  /api/institutions/:id/students`);
    console.log(`   GET  /api/dashboard/stats`);
    console.log(`   GET  /api/dashboard/stats/:institutionId`);
    console.log(`   PUT  /api/people/:id`);
    console.log(`   GET  /api/people/:id`);
    console.log(`\n⚠️  Este servidor es PROVISIONAL. Ver backend/server.js para más info.\n`);
});
