/**
 * Generadores de datos para el seed
 * Funciones auxiliares para crear personas, credenciales, etc.
 */

// Nombres colombianos
const nombresMasculinos = [
    "Juan", "Carlos", "Pedro", "Luis", "Miguel", "Andrés", "José", "Diego",
    "Santiago", "Sebastián", "Daniel", "Nicolás", "Mateo", "Lucas", "Alejandro",
    "Gabriel", "Adrián", "David", "Martín", "Emiliano", "Tomás", "Benjamín",
    "Samuel", "Felipe", "Joaquín", "Vicente", "Ignacio", "Mateo", "Luciano",
    "Bruno", "Thiago", "Isaac", "Joshua", "Ethan", "Dylan", "Axel"
];

const nombresFemeninos = [
    "María", "Ana", "Carmen", "Rocío", "Laura", "Sandra", "Patricia", "Claudia",
    "Luz", "Amparo", "Teresa", "Cristina", "Isabel", "Mónica", "Beatriz",
    "Sara", "Valentina", "Camila", "Daniela", "Gabriela", "Luciana", "Mariana",
    "Alejandra", "Andrea", "Carolina", "Diana", "Gloria", "Juliana", "Karen",
    "Natalia", "Paula", "Sophia", "Emma", "Victoria", "Isabella", "Mía"
];

const apellidos = [
    "García", "Rodríguez", "Martínez", "López", "González", "Hernández",
    "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez",
    "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez", "Ortiz", "Ruiz",
    "Vargas", "Castillo", "Jiménez", "Moreno", "Romero", "Herrera",
    "Medina", "Aguilar", "Vega", "Castro", "Mendoza", "Silva", "Rojas",
    "Guerrero", "Parra", "Acosta", "Camacho", "Salazar", "Peña", "Córdoba"
];

const dominiosEmail = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com"];

/**
 * Genera un número de documento aleatorio
 * @param {string} type - Tipo de documento (CC, TI, CE, etc.)
 * @returns {string} Número de documento
 */
function generateDocumentNumber(type) {
    const base = Math.floor(10000000 + Math.random() * 90000000);
    const prefix = type === "CE" ? "E" : type === "PA" ? "P" : "";
    return `${prefix}${base}`;
}

/**
 * Genera un teléfono colombiano aleatorio
 * @returns {string} Número de teléfono
 */
function generatePhone() {
    const prefixes = ["300", "301", "302", "303", "304", "305", "310", "311", "312", "313", "314", "315", "316", "317", "318", "319", "320", "321", "322", "323"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${suffix}`;
}

/**
 * Genera una fecha de nacimiento aleatoria en un rango de edad
 * @param {number} minAge - Edad mínima
 * @param {number} maxAge - Edad máxima
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
function generateBirthDate(minAge = 14, maxAge = 25) {
    const now = new Date();
    const minYear = now.getFullYear() - maxAge;
    const maxYear = now.getFullYear() - minAge;
    const year = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
    const month = Math.floor(Math.random() * 12) + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Genera una dirección colombiana aleatoria
 * @returns {string} Dirección
 */
function generateAddress() {
    const types = ["Calle", "Carrera", "Avenida", "Diagonal", "Transversal"];
    const type = types[Math.floor(Math.random() * types.length)];
    const number = Math.floor(1 + Math.random() * 100);
    const suffix = Math.floor(1 + Math.random() * 50);
    return `${type} ${number} # ${suffix}-${Math.floor(1 + Math.random() * 99)}`;
}

/**
 * Genera una persona aleatoria
 * @param {number} id - ID de la persona
 * @param {number} genderId - ID del género (1=Masculino, 2=Femenino, 3=No binario)
 * @param {number} neighborhoodId - ID del barrio
 * @param {number} credentialId - ID de la credencial (null si no tiene)
 * @returns {Object} Persona
 */
function generatePerson(id, genderId, neighborhoodId, credentialId = null) {
    const isMale = genderId === 1;
    const firstName = isMale
        ? nombresMasculinos[Math.floor(Math.random() * nombresMasculinos.length)]
        : nombresFemeninos[Math.floor(Math.random() * nombresFemeninos.length)];
    const lastName1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const lastName2 = apellidos[Math.floor(Math.random() * apellidos.length)];

    const docTypes = [1, 2, 3]; // CC, TI, CE
    const docTypeId = docTypes[Math.floor(Math.random() * docTypes.length)];
    const docTypeAbbr = ["CC", "TI", "CE"][docTypes.indexOf(docTypeId)];

    const email = `${firstName.toLowerCase()}.${lastName1.toLowerCase()}${id}@${dominiosEmail[Math.floor(Math.random() * dominiosEmail.length)]}`;

    return {
        id,
        first_name: firstName,
        last_name: `${lastName1} ${lastName2}`,
        gender_id: genderId,
        birth_date: generateBirthDate(14, 25),
        email,
        phone: generatePhone(),
        document_type_id: docTypeId,
        document_number: generateDocumentNumber(docTypeAbbr),
        address: generateAddress(),
        neighborhood_id: neighborhoodId,
        credential_id: credentialId
    };
}

/**
 * Genera un perfil de estudiante
 * @param {number} id - ID del perfil
 * @param {number} personId - ID de la persona
 * @param {number} institutionId - ID de la institución
 * @param {number} statusId - ID del estado (1=Activo, 2=Graduado, 3=Retirado)
 * @param {number} gradeId - ID del grado
 * @returns {Object} Perfil de estudiante
 */
function generateStudentProfile(id, personId, institutionId, statusId, gradeId) {
    const startYear = 2020 + Math.floor(Math.random() * 5);
    const startMonth = Math.floor(Math.random() * 12) + 1;
    const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-01`;

    let endDate = null;
    if (statusId === 2) { // Graduado
        const endYear = startYear + Math.floor(Math.random() * 3) + 2;
        endDate = `${endYear}-${String(startMonth).padStart(2, "0")}-01`;
    } else if (statusId === 3) { // Retirado
        const endYear = startYear + Math.floor(Math.random() * 2);
        endDate = `${endYear}-${String(startMonth).padStart(2, "0")}-01`;
    }

    return {
        id,
        people_id: personId,
        institution_id: institutionId,
        status_id: statusId,
        grade_id: gradeId,
        start_date: startDate,
        end_date: endDate
    };
}

/**
 * Genera una campaña de inscripción
 * @param {number} id - ID de la inscripción
 * @param {number} campaignId - ID de la campaña
 * @param {number} studentProfileId - ID del perfil de estudiante
 * @returns {Object} Inscripción
 */
function generateEnrollment(id, campaignId, studentProfileId) {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90);
    const enrolledAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return {
        id,
        campaign_id: campaignId,
        student_profile_id: studentProfileId,
        enrolled_at: enrolledAt.toISOString()
    };
}

/**
 * Genera un registro de actualización
 * @param {number} id - ID de la actualización
 * @param {number} peopleId - ID de la persona
 * @param {number} campaignId - ID de la campaña
 * @returns {Object} Actualización
 */
function generateUpdate(id, peopleId, campaignId) {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 60);
    const updatedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    return {
        id,
        people_id: peopleId,
        campaign_id: campaignId,
        updated_at: updatedAt.toISOString()
    };
}

export {
    generatePerson,
    generateStudentProfile,
    generateEnrollment,
    generateUpdate,
    generatePhone,
    generateAddress,
    generateBirthDate,
    generateDocumentNumber,
    nombresMasculinos,
    nombresFemeninos,
    apellidos
};
