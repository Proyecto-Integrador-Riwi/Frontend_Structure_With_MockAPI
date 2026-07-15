/**
 * Plantillas de Campañas de Actualización
 * Datos de ejemplo para el MVP
 */

const campanas = [
    {
        id: 1,
        title: "Actualización Datos Generales 2026",
        type: "General",
        description: "Campaña para actualizar información personal básica de todos los estudiantes y egresados del distrito.",
        sponsor: "Alcaldía de Barranquilla",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-01-15",
        end_date: "2026-12-31",
        url_multimedia: null,
        pinned: true // Campaña fijada para SuperAdmin
    },
    {
        id: 2,
        title: "Actualización Datos de Contacto",
        type: "Contacto",
        description: "Actualización de números de correo electrónico y teléfono de contacto.",
        sponsor: "I.E.D. Normal Superior",
        created_by_credentials_id: 2, // Admin institución 1
        start_date: "2026-02-01",
        end_date: "2026-06-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 3,
        title: "Encuesta Empleabilidad Egresados 2026",
        type: "Encuesta",
        description: "Seguimiento a egresados para conocer su situación laboral actual.",
        sponsor: "Ministerio de Educación",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-03-01",
        end_date: "2026-09-30",
        url_multimedia: null,
        pinned: true // Campaña fijada para SuperAdmin
    },
    {
        id: 4,
        title: "Programa Deportivo Escolar",
        type: "Deportivo",
        description: "Inscripción para programas deportivos intercolegiados del distrito.",
        sponsor: "Instituto de Deporte y Recreación",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-04-01",
        end_date: "2026-08-15",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 5,
        title: "Becas Académicas 2026",
        type: "Académico",
        description: "Convocatoria para becas de excelencia académica dirigidas a estudiantes de grado 11.",
        sponsor: "Fundación Educativa Barranquilla",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-05-01",
        end_date: "2026-07-31",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 6,
        title: "Seguimiento Egresados 2024-2025",
        type: "Seguimiento",
        description: "Campaña de seguimiento a egresados del periodo 2024-2025.",
        sponsor: "Secretaría de Educación",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-01-01",
        end_date: "2026-04-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 7,
        title: "Programa Cultural Distrital",
        type: "Cultural",
        description: "Actividades culturales y artísticas para estudiantes de la localidad Occidente.",
        sponsor: "Secretaría de Cultura",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-06-01",
        end_date: "2026-12-15",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 8,
        title: "Actualización Documentos de Identidad",
        type: "Documental",
        description: "Actualización de información de documentos de identidad para estudiantes activos.",
        sponsor: "Registraduría Nacional",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-02-15",
        end_date: "2026-05-15",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 9,
        title: "Encuesta de Satisfacción Institucional",
        type: "Encuesta",
        description: "Encuesta para medir la satisfacción de los estudiantes con la institución educativa.",
        sponsor: "I.E.D. Universidad del Norte",
        created_by_credentials_id: 3, // Admin institución 2
        start_date: "2026-03-15",
        end_date: "2026-04-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 10,
        title: "Programa de Voluntariado Juvenil",
        type: "Social",
        description: "Convocatoria para jóvenes voluntarios en proyectos sociales del distrito.",
        sponsor: "Secretaría de Integración Social",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-07-01",
        end_date: "2026-11-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 11,
        title: "Juegos Deportivos Escolares",
        type: "Deportivo",
        description: "Inscripción para los juegos deportivos interescolares de la localidad Sur.",
        sponsor: "Instituto de Deporte y Recreación",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-05-15",
        end_date: "2026-06-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 12,
        title: "Convocatoria de Prácticas Profesionales",
        type: "Laboral",
        description: "Ofertas de prácticas profesionales para estudiantes de grados 10 y 11.",
        sponsor: "Secretaría de Desarrollo Económico",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-08-01",
        end_date: "2026-10-31",
        url_multimedia: null,
        pinned: true // Campaña fijada para SuperAdmin
    },
    {
        id: 13,
        title: "Actualización de Direcciones Residencia",
        type: "General",
        description: "Campaña para actualizar direcciones de residencia en la localidad Nororiente.",
        sponsor: "Alcaldía de Barranquilla",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-04-15",
        end_date: "2026-07-15",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 14,
        title: "Programa de Liderazgo Estudiantil",
        type: "Social",
        description: "Formación en liderazgo para jóvenes de la localidad Suroccidente.",
        sponsor: "Secretaría de Juventud",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-06-15",
        end_date: "2026-09-30",
        url_multimedia: null,
        pinned: false
    },
    {
        id: 15,
        title: "Encuesta de Tecnología e Innovación",
        type: "Tecnológico",
        description: "Encuesta sobre el uso de tecnología en el proceso educativo.",
        sponsor: "Ministerio de Tecnologías de la Información",
        created_by_credentials_id: 1, // SuperAdmin
        start_date: "2026-03-01",
        end_date: "2026-05-31",
        url_multimedia: null,
        pinned: false
    }
];

export default campanas;
