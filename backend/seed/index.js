import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import localidades from './data/localidades.js';
import barrios from './data/barrios.js';
import instituciones from './data/instituciones.js';
import campanas from './data/campanas.js';



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
// CREDENCIALES
// ============================================================

function generateCredentials() {
    return [
        { id: 1, username: "admin_global", password: "123456", role_id: 1 },
        { id: 2, username: "admin_n1",     password: "123456", role_id: 2 },
        { id: 3, username: "admin_n2",     password: "123456", role_id: 2 }
    ];
}

// ============================================================
// PERSONAS (admins + estudiantes hardcodeados)
// ============================================================

function generatePeople() {
    const people = [];

    // Admin persona para admin_global (credential_id: 1)
    people.push({
        id: 1,
        first_name: "Admin",
        last_name: "Global",
        gender_id: 1,
        birth_date: "1990-01-01",
        email: "admin.global@nexoedu.gov.co",
        phone: "3001111111",
        document_type_id: 1,
        document_number: "1000000001",
        address: "Calle 1 # 1-1",
        neighborhood_id: 1,
        credential_id: 1
    });

    // Admin persona para admin_n1 (credential_id: 2)
    people.push({
        id: 2,
        first_name: "Admin",
        last_name: "Normal Superior",
        gender_id: 2,
        birth_date: "1992-05-10",
        email: "admin.n1@nexoedu.gov.co",
        phone: "3002222222",
        document_type_id: 1,
        document_number: "1000000002",
        address: "Calle 2 # 2-2",
        neighborhood_id: 1,
        credential_id: 2
    });

    // Admin persona para admin_n2 (credential_id: 3)
    people.push({
        id: 3,
        first_name: "Admin",
        last_name: "Uninorte",
        gender_id: 1,
        birth_date: "1988-11-20",
        email: "admin.n2@nexoedu.gov.co",
        phone: "3003333333",
        document_type_id: 1,
        document_number: "1000000003",
        address: "Calle 3 # 3-3",
        neighborhood_id: 6,
        credential_id: 3
    });

    // Estudiante 1: Carlos García, M, 11°, activo → institución 1
    people.push({
        id: 4,
        first_name: "Carlos",
        last_name: "García Martínez",
        gender_id: 1,
        birth_date: "2008-03-15",
        email: "carlos.garcia4@gmail.com",
        phone: "3004444444",
        document_type_id: 1,
        document_number: "1000000004",
        address: "Calle 10 # 20-30",
        neighborhood_id: 1,
        credential_id: null
    });

    // Estudiante 2: María López, F, 10°, activa → institución 2
    people.push({
        id: 5,
        first_name: "María",
        last_name: "López Pérez",
        gender_id: 2,
        birth_date: "2009-07-22",
        email: "maria.lopez5@gmail.com",
        phone: "3005555555",
        document_type_id: 1,
        document_number: "1000000005",
        address: "Carrera 15 # 40-50",
        neighborhood_id: 6,
        credential_id: null
    });

    // Estudiante 3: José Rodríguez, M, 11°, egresado → institución 1
    people.push({
        id: 6,
        first_name: "José",
        last_name: "Rodríguez Díaz",
        gender_id: 1,
        birth_date: "2007-02-10",
        email: "jose.rodriguez6@gmail.com",
        phone: "3006666666",
        document_type_id: 1,
        document_number: "1000000006",
        address: "Calle 5 # 15-25",
        neighborhood_id: 1,
        credential_id: null
    });

    return people;
}

// ============================================================
// PERFILES DE ESTUDIANTE
// ============================================================

function generateStudentProfiles() {
    return [
        { id: 1, people_id: 4, institution_id: 1, status_id: 1, grade_id: 11, start_date: "2025-02-01", end_date: null },
        { id: 2, people_id: 5, institution_id: 2, status_id: 1, grade_id: 10, start_date: "2025-02-01", end_date: null },
        { id: 3, people_id: 6, institution_id: 1, status_id: 2, grade_id: 11, start_date: "2020-02-01", end_date: "2025-11-30" }
    ];
}

// ============================================================
// ALCANCE DE CAMPAÑA (1 sola campaña global, sin criterios)
// ============================================================

function generateCampaignScopesAndCriteria() {
    return {
        campaignScopes: [
            { id: 1, scope_type: "GLOBAL", campaign_id: 1, institution_id: null, neighborhood_id: null, locality_id: null }
        ],
        campaignCriteria: []
    };
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

function generateDatabase() {
    console.log("🚀 Iniciando generación de base de datos mínima...\n");

    console.log("📋 Generando credenciales...");
    const credentials = generateCredentials();
    console.log(`  Credenciales: ${credentials.length}`);

    console.log("\n👥 Generando personas...");
    const people = generatePeople();
    console.log(`  Personas: ${people.length}`);

    // Asignar credential_id a las personas admin
    for (let i = 0; i < credentials.length; i++) {
        people[i].credential_id = credentials[i].id;
    }

    // Generar credenciales para estudiantes (personas 4, 5, 6)
    const studentCredentials = [];
    let credId = 4;
    for (let i = 3; i < people.length; i++) {
        const person = people[i];
        const cred = {
            id: credId++,
            username: person.email.split("@")[0],
            password: "123456",
            role_id: 3
        };
        studentCredentials.push(cred);
        person.credential_id = cred.id;
    }

    const allCredentials = [...credentials, ...studentCredentials];
    console.log(`  Credenciales totales: ${allCredentials.length}`);
    console.log(`    - admin_global    (SUPERADMIN)    → pass: 123456`);
    console.log(`    - admin_n1        (ADMINISTRADOR) → pass: 123456`);
    console.log(`    - admin_n2        (ADMINISTRADOR) → pass: 123456`);
    console.log(`    - carlos.garcia4  (ESTUDIANTE)    → pass: 123456`);
    console.log(`    - maria.lopez5    (ESTUDIANTE)    → pass: 123456`);
    console.log(`    - jose.rodriguez6 (ESTUDIANTE)    → pass: 123456`);

    console.log("\n📋 Generando perfiles de estudiante...");
    const studentProfiles = generateStudentProfiles();
    console.log(`  Perfiles: ${studentProfiles.length}`);

    console.log("\n📢 Generando campaña...");
    const { campaignScopes, campaignCriteria } = generateCampaignScopesAndCriteria();
    console.log(`  Campañas: ${campanas.length}`);
    console.log(`  Alcances: ${campaignScopes.length}`);
    console.log(`  Criterios: ${campaignCriteria.length}`);

    console.log("\n📝 Inscripciones y actualizaciones — 0 (entorno de prueba mínimo)");
    const enrollments = [];
    const updates = [];

    console.log("\n📞 Contactos personales — 0");
    const personalContacts = [];

    // ============================================================
    // ESTRUCTURA FINAL
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

    const outputPath = path.join(__dirname, '..', 'db.json');

    try {
        fs.writeFileSync(outputPath, JSON.stringify(db, null, 2), 'utf-8');
        console.log(`\n✅ Base de datos generada exitosamente en: ${outputPath}`);
        console.log(`📊 Resumen:`);
        console.log(`   - Roles:               ${user_roles.length}`);
        console.log(`   - Tipos de documento:   ${document_types.length}`);
        console.log(`   - Géneros:             ${genders.length}`);
        console.log(`   - Grados:              ${grades.length}`);
        console.log(`   - Estados:             ${statuses.length}`);
        console.log(`   - Localidades:         ${localidades.length}`);
        console.log(`   - Barrios:             ${barrios.length}`);
        console.log(`   - Credenciales:        ${allCredentials.length}`);
        console.log(`   - Personas:            ${people.length}`);
        console.log(`   - Contactos:           ${personalContacts.length}`);
        console.log(`   - Instituciones:       ${instituciones.length}`);
        console.log(`   - Perfiles estudiante: ${studentProfiles.length}`);
        console.log(`   - Campañas:            ${campanas.length}`);
        console.log(`   - Alcances campaña:    ${campaignScopes.length}`);
        console.log(`   - Criterios campaña:   ${campaignCriteria.length}`);
        console.log(`   - Inscripciones:       ${enrollments.length}`);
        console.log(`   - Actualizaciones:     ${updates.length}`);
    } catch (error) {
        console.error("❌ Error al escribir el archivo:", error);
        process.exit(1);
    }
}

generateDatabase();
