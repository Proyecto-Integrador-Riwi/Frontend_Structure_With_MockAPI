/**
 * Script de generación de datos para JSON-Server
 * 
 * Este script genera el archivo db.json con todos los datos de prueba
 * necesarios para el desarrollo del frontend mientras el equipo backend
 * completa los endpoints reales con FastAPI + PostgreSQL.
 * 
 * IMPORTANTE: Este script es PROVISIONAL y será eliminado cuando el
 * backend real esté listo.
 * 
 * Uso:
 *   node backend/seed/index.js
 * 
 * El archivo db.json se generará en backend/db.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar datos estáticos
import localidades from './data/localidades.js';
import barrios from './data/barrios.js';
import instituciones from './data/instituciones.js';
import campanas from './data/campanas.js';

// Importar generadores
import {
    generatePerson,
    generateStudentProfile,
    generateEnrollment,
    generateUpdate
} from './utils/generators.js';

// ============================================================
// CONFIGURACIÓN DEL SEED
// ============================================================

const CONFIG = {
    // Número de estudiantes por institución
    studentsPerInstitution: [18, 16, 14, 13, 12, 11, 10, 10, 10, 8], // Total: 122
    
    // Número de egresados por institución
    graduatesPerInstitution: [12, 11, 10, 9, 8, 7, 6, 6, 6, 4], // Total: 79
    
    // Número de retirados por institución
    withdrawnPerInstitution: [2, 2, 2, 1, 1, 1, 1, 1, 1, 0], // Total: 12
    
    // Porcentaje de estudiantes que se inscriben en campañas
    enrollmentPercentage: 0.6,
    
    // Porcentaje de personas que actualizan sus datos
    updatePercentage: 0.4
};

// ============================================================
// CATÁLOGOS
// ============================================================

const user_roles = [
    { id: 1, name: "SUPERADMIN" },
    { id: 2, name: "ADMINISTRADOR" },
    { id: 3, name: "ESTUDIANTE" }
];

const document_types = [
    { id: 1, abbreviation: "CC", name: "Cédula de Ciudadanía" },
    { id: 2, abbreviation: "TI", name: "Tarjeta de Identidad" },
    { id: 3, abbreviation: "CE", name: "Cédula de Extranjería" },
    { id: 4, abbreviation: "PA", name: "Pasaporte" },
    { id: 5, abbreviation: "RC", name: "Registro Civil" }
];

const genders = [
    { id: 1, name: "Masculino" },
    { id: 2, name: "Femenino" },
    { id: 3, name: "No binario" }
];

const grades = [
    { id: 1, grade: "1°" },
    { id: 2, grade: "2°" },
    { id: 3, grade: "3°" },
    { id: 4, grade: "4°" },
    { id: 5, grade: "5°" },
    { id: 6, grade: "6°" },
    { id: 7, grade: "7°" },
    { id: 8, grade: "8°" },
    { id: 9, grade: "9°" },
    { id: 10, grade: "10°" },
    { id: 11, grade: "11°" }
];

const statuses = [
    { id: 1, status: "Activo" },
    { id: 2, status: "Graduado" },
    { id: 3, status: "Retirado" }
];

// ============================================================
// GENERACIÓN DE CREDENCIALES
// ============================================================

function generateCredentials() {
    const credentials = [];
    let id = 1;

    // SuperAdmin
    credentials.push({
        id: id++,
        username: "admin_global",
        password: "123456",
        role_id: 1
    });

    // Admins (uno por institución)
    for (let i = 0; i < 10; i++) {
        credentials.push({
            id: id++,
            username: `admin_n${i + 1}`,
            password: "123456",
            role_id: 2
        });
    }

    // Estudiantes (se generarán después)
    return { credentials, nextId: id };
}

// ============================================================
// GENERACIÓN DE PERSONAS Y PERFILES
// ============================================================

function generatePeopleAndProfiles(startId) {
    const people = [];
    const studentProfiles = [];
    let personId = startId;
    let profileId = 1;

    let totalStudents = 0;
    let totalGraduates = 0;
    let totalWithdrawn = 0;

    for (let instIdx = 0; instIdx < 10; instIdx++) {
        const institutionId = instIdx + 1;
        const neighborhoodId = instituciones[instIdx].neighborhood_id;

        // Estudiantes activos
        const numStudents = CONFIG.studentsPerInstitution[instIdx];
        for (let i = 0; i < numStudents; i++) {
            const genderId = Math.random() > 0.5 ? 1 : 2; // 50% masculino, 50% femenino
            const gradeId = Math.floor(Math.random() * 11) + 1; // Grado 1-11
            
            const person = generatePerson(personId, genderId, neighborhoodId, null);
            people.push(person);

            const profile = generateStudentProfile(profileId, personId, institutionId, 1, gradeId);
            studentProfiles.push(profile);

            personId++;
            profileId++;
            totalStudents++;
        }

        // Egresados
        const numGraduates = CONFIG.graduatesPerInstitution[instIdx];
        for (let i = 0; i < numGraduates; i++) {
            const genderId = Math.random() > 0.5 ? 1 : 2;
            const gradeId = 11; // Egresados son grado 11
            
            const person = generatePerson(personId, genderId, neighborhoodId, null);
            people.push(person);

            const profile = generateStudentProfile(profileId, personId, institutionId, 2, gradeId);
            studentProfiles.push(profile);

            personId++;
            profileId++;
            totalGraduates++;
        }

        // Retirados
        const numWithdrawn = CONFIG.withdrawnPerInstitution[instIdx];
        for (let i = 0; i < numWithdrawn; i++) {
            const genderId = Math.random() > 0.5 ? 1 : 2;
            const gradeId = Math.floor(Math.random() * 8) + 4; // Grado 4-11
            
            const person = generatePerson(personId, genderId, neighborhoodId, null);
            people.push(person);

            const profile = generateStudentProfile(profileId, personId, institutionId, 3, gradeId);
            studentProfiles.push(profile);

            personId++;
            profileId++;
            totalWithdrawn++;
        }
    }

    console.log(`  Personas generadas: ${people.length}`);
    console.log(`    - Estudiantes activos: ${totalStudents}`);
    console.log(`    - Egresados: ${totalGraduates}`);
    console.log(`    - Retirados: ${totalWithdrawn}`);

    return { people, studentProfiles, nextPersonId: personId, nextProfileId: profileId };
}

// ============================================================
// GENERACIÓN DE CAMPAÑAS Y ALCANCES
// ============================================================

function generateCampaignScopesAndCriteria() {
    const campaignScopes = [];
    const campaignCriteria = [];
    let scopeId = 1;
    let criteriaId = 1;

    // Campaña 1: Global (sin alcance específico)
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 1,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });

    // Campaña 2: Institución 1
    campaignScopes.push({
        id: scopeId++,
        scope_type: "INSTITUTION",
        campaign_id: 2,
        institution_id: 1,
        neighborhood_id: null,
        localities_id: null
    });

    // Campaña 3: Global
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 3,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });

    // Campaña 4: Localidad Norte
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 4,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 1
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 4,
        gender_id: null,
        min_age: 15,
        max_age: 25,
        grade_id: null,
        status_id: null
    });

    // Campaña 5: Barrio específico
    campaignScopes.push({
        id: scopeId++,
        scope_type: "NEIGHBORHOOD",
        campaign_id: 5,
        institution_id: null,
        neighborhood_id: 1, // Belén
        localities_id: null
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 5,
        gender_id: null,
        min_age: null,
        max_age: null,
        grade_id: 11,
        status_id: 1
    });

    // Campaña 6: Global
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 6,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 6,
        gender_id: null,
        min_age: null,
        max_age: null,
        grade_id: null,
        status_id: 2 // Solo graduados
    });

    // Campaña 7: Occidente
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 7,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 3
    });

    // Campaña 8: Global
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 8,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 8,
        gender_id: null,
        min_age: null,
        max_age: null,
        grade_id: null,
        status_id: 1 // Solo activos
    });

    // Campaña 9: Institución 2
    campaignScopes.push({
        id: scopeId++,
        scope_type: "INSTITUTION",
        campaign_id: 9,
        institution_id: 2,
        neighborhood_id: null,
        localities_id: null
    });

    // Campaña 10: Oriente
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 10,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 4
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 10,
        gender_id: null,
        min_age: 16,
        max_age: 30,
        grade_id: null,
        status_id: null
    });

    // Campaña 11: Sur
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 11,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 5
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 11,
        gender_id: null,
        min_age: 12,
        max_age: 18,
        grade_id: null,
        status_id: null
    });

    // Campaña 12: Global
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 12,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 12,
        gender_id: null,
        min_age: null,
        max_age: null,
        grade_id: 10,
        status_id: 1
    });

    // Campaña 13: Nororiente
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 13,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 2
    });

    // Campaña 14: Suroccidente
    campaignScopes.push({
        id: scopeId++,
        scope_type: "LOCALITY",
        campaign_id: 14,
        institution_id: null,
        neighborhood_id: null,
        localities_id: 6
    });
    campaignCriteria.push({
        id: criteriaId++,
        campaign_id: 14,
        gender_id: null,
        min_age: 15,
        max_age: 22,
        grade_id: null,
        status_id: null
    });

    // Campaña 15: Global
    campaignScopes.push({
        id: scopeId++,
        scope_type: "GLOBAL",
        campaign_id: 15,
        institution_id: null,
        neighborhood_id: null,
        localities_id: null
    });

    return { campaignScopes, campaignCriteria };
}

// ============================================================
// GENERACIÓN DE INSCRIPCIONES Y ACTUALIZACIONES
// ============================================================

function generateEnrollmentsAndUpdates(studentProfiles, people) {
    const enrollments = [];
    const updates = [];
    let enrollmentId = 1;
    let updateId = 1;

    // Para cada campaña activa o pasada
    const activeCampaigns = campanas.filter(c => {
        const now = new Date();
        const start = new Date(c.start_date);
        const end = c.end_date ? new Date(c.end_date) : new Date('2099-12-31');
        return now >= start || now <= end;
    });

    for (const campaign of activeCampaigns) {
        // Inscribir un porcentaje de estudiantes
        const numToEnroll = Math.floor(studentProfiles.length * CONFIG.enrollmentPercentage);
        const shuffled = [...studentProfiles].sort(() => 0.5 - Math.random());
        const toEnroll = shuffled.slice(0, numToEnroll);

        for (const profile of toEnroll) {
            enrollments.push(generateEnrollment(enrollmentId++, campaign.id, profile.id));
        }
    }

    // Generar actualizaciones para algunos inscritos
    const numToUpdate = Math.floor(enrollments.length * CONFIG.updatePercentage);
    const shuffledEnrollments = [...enrollments].sort(() => 0.5 - Math.random());
    const toUpdate = shuffledEnrollments.slice(0, numToUpdate);

    for (const enrollment of toUpdate) {
        const profile = studentProfiles.find(p => p.id === enrollment.student_profile_id);
        if (profile) {
            updates.push(generateUpdate(updateId++, profile.people_id, enrollment.campaign_id));
        }
    }

    console.log(`  Inscripciones generadas: ${enrollments.length}`);
    console.log(`  Actualizaciones generadas: ${updates.length}`);

    return { enrollments, updates };
}

// ============================================================
// GENERACIÓN DE CONTACTOS PERSONALES
// ============================================================

function generatePersonalContacts(people) {
    const contacts = [];
    let contactId = 1;

    // Generar contactos para el 70% de las personas
    const numContacts = Math.floor(people.length * 0.7);
    const shuffledPeople = [...people].sort(() => 0.5 - Math.random());
    const peopleWithContacts = shuffledPeople.slice(0, numContacts);

    const relationships = ["Padre", "Madre", "Hermano", "Hermana", "Tío", "Tía", "Abuelo", "Abuela", "Primo", "Prima", "Amigo", "Amiga"];

    for (const person of peopleWithContacts) {
        const relationship = relationships[Math.floor(Math.random() * relationships.length)];
        const isMale = Math.random() > 0.5;

        contacts.push({
            id: contactId++,
            first_name: isMale ? "Carlos" : "María",
            last_name: person.last_name.split(" ")[0],
            phone: `3${Math.floor(10 + Math.random() * 90)}${Math.floor(1000000 + Math.random() * 9000000)}`,
            people_id: person.id,
            relationship
        });
    }

    console.log(`  Contactos personales generados: ${contacts.length}`);

    return contacts;
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

function generateDatabase() {
    console.log("🚀 Iniciando generación de base de datos...\n");

    // 1. Credenciales
    console.log("📋 Generando credenciales...");
    const { credentials: baseCredentials, nextId: credentialsNextId } = generateCredentials();
    console.log(`  Credenciales base: ${baseCredentials.length}`);

    // 2. Personas y perfiles de estudiante
    console.log("\n👥 Generando personas y perfiles...");
    const { people, studentProfiles, nextPersonId, nextProfileId } = generatePeopleAndProfiles(credentialsNextId);
    
    // Asignar credenciales a personas (solo admins y superadmin)
    for (let i = 0; i < baseCredentials.length; i++) {
        people[i].credential_id = baseCredentials[i].id;
    }

    // Generar credenciales para estudiantes
    const studentCredentials = [];
    let credId = credentialsNextId;
    for (const person of people.slice(baseCredentials.length)) {
        const cred = {
            id: credId++,
            username: person.email.split("@")[0],
            password: "123456",
            role_id: 3
        };
        studentCredentials.push(cred);
        person.credential_id = cred.id;
    }

    const allCredentials = [...baseCredentials, ...studentCredentials];
    console.log(`  Credenciales totales: ${allCredentials.length}`);

    // 3. Campañas, alcances y criterios
    console.log("\n📢 Generando campañas...");
    const { campaignScopes, campaignCriteria } = generateCampaignScopesAndCriteria();
    console.log(`  Alcances de campaña: ${campaignScopes.length}`);
    console.log(`  Criterios de campaña: ${campaignCriteria.length}`);

    // 4. Inscripciones y actualizaciones
    console.log("\n📝 Generando inscripciones y actualizaciones...");
    const { enrollments, updates } = generateEnrollmentsAndUpdates(studentProfiles, people);

    // 5. Contactos personales
    console.log("\n📞 Generando contactos personales...");
    const personalContacts = generatePersonalContacts(people);

    // ============================================================
    // ESTRUCTURA FINAL DE LA BASE DE DATOS
    // ============================================================

    const db = {
        user_roles,
        document_types,
        genders,
        grades,
        statuses,
        localities: localidades,
        neighborhoods: barrios,
        credentials: allCredentials,
        people,
        personal_contacts: personalContacts,
        institutions: instituciones,
        student_profiles: studentProfiles,
        campaigns: campanas,
        campaign_scope: campaignScopes,
        campaign_criteria: campaignCriteria,
        campaign_enrollments: enrollments,
        updates
    };

    // ============================================================
    // ESCRITURA DEL ARCHIVO
    // ============================================================

    const outputPath = path.join(__dirname, '..', 'db.json');
    
    try {
        fs.writeFileSync(outputPath, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`\n✅ Base de datos generada exitosamente en: ${outputPath}`);
        console.log(`📊 Resumen:`);
        console.log(`   - Roles: ${user_roles.length}`);
        console.log(`   - Tipos de documento: ${document_types.length}`);
        console.log(`   - Géneros: ${genders.length}`);
        console.log(`   - Grados: ${grades.length}`);
        console.log(`   - Estados: ${statuses.length}`);
        console.log(`   - Localidades: ${localidades.length}`);
        console.log(`   - Barrios: ${barrios.length}`);
        console.log(`   - Credenciales: ${allCredentials.length}`);
        console.log(`   - Personas: ${people.length}`);
        console.log(`   - Contactos personales: ${personalContacts.length}`);
        console.log(`   - Instituciones: ${instituciones.length}`);
        console.log(`   - Perfiles de estudiante: ${studentProfiles.length}`);
        console.log(`   - Campañas: ${campanas.length}`);
        console.log(`   - Alcances de campaña: ${campaignScopes.length}`);
        console.log(`   - Criterios de campaña: ${campaignCriteria.length}`);
        console.log(`   - Inscripciones: ${enrollments.length}`);
        console.log(`   - Actualizaciones: ${updates.length}`);
    } catch (error) {
        console.error("❌ Error al escribir el archivo:", error);
        process.exit(1);
    }
}

// Ejecutar generación
generateDatabase();
