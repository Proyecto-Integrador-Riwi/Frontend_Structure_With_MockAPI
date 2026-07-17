let db = null;

export function setDb(database) {
    db = database;
}

export function nextId(array) {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

export function calcAge(birthDate) {
    if (!birthDate) return null;
    const bd = new Date(birthDate);
    return Math.abs(new Date(Date.now() - bd.getTime()).getUTCFullYear() - 1970);
}

export function isCampaignActive(campaign) {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = campaign.end_date ? new Date(campaign.end_date) : new Date('2099-12-31');
    return now >= start && now <= end;
}

export function getLastUpdate(peopleId) {
    return db.updates
        .filter(u => u.people_id === peopleId)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] || null;
}

export function enrichCampaign(campaign) {
    const creatorCred = campaign.created_by_credentials_id
        ? db.credentials.find(c => c.id === campaign.created_by_credentials_id)
        : null;
    const creatorRole = creatorCred
        ? db.user_roles.find(r => r.id === creatorCred.role_id)
        : null;

    return {
        ...campaign,
        scope: db.campaign_scope.filter(s => s.campaign_id === campaign.id),
        criteria: db.campaign_criteria.filter(cr => cr.campaign_id === campaign.id),
        enrollment_count: db.campaign_enrollments.filter(e => e.campaign_id === campaign.id).length,
        created_by_username: creatorCred ? creatorCred.username : null,
        created_by_role: creatorRole ? creatorRole.name : null
    };
}

export function checkCampaignScope(campaignId, studentProfile) {
    const scopes = db.campaign_scope.filter(s => s.campaign_id === campaignId);
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
                    parseInt(s.locality_id) === neighborhood.locality_id
                );
            }
        }
    }

    return hasGlobalScope || hasLocationScope || hasInstitutionScope;
}

export function computeDashboardStats(profiles) {
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

    return {
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
    };
}

export function checkCriteria(allCriteria, person, studentProfile) {
    for (const criteria of allCriteria) {
        if (criteria.gender_id && person && person.gender_id !== criteria.gender_id) return false;
        if (criteria.grade_id && studentProfile && studentProfile.grade_id !== criteria.grade_id) return false;
        if (criteria.status_id && studentProfile && studentProfile.status_id !== criteria.status_id) return false;
        if ((criteria.min_age || criteria.max_age) && person && person.birth_date) {
            const age = calcAge(person.birth_date);
            if (criteria.min_age && age < criteria.min_age) return false;
            if (criteria.max_age && age > criteria.max_age) return false;
        }
    }
    return true;
}

export function enrichStudentProfile(sp) {
    const person = db.people.find(p => p.id === sp.people_id);
    const institution = db.institutions.find(i => i.id === sp.institution_id);
    const status = db.statuses.find(s => s.id === sp.status_id);
    const grade = db.grades.find(g => g.id === sp.grade_id);
    const gender = person ? db.genders.find(g => g.id === person.gender_id) : null;
    const neighborhood = person ? db.neighborhoods.find(n => n.id === person.neighborhood_id) : null;
    const locality = neighborhood ? db.localities.find(l => l.id === neighborhood.locality_id) : null;
    const lastUpdate = getLastUpdate(person ? person.id : null);

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
            age: calcAge(person.birth_date),
            gender_id: person.gender_id,
            last_update_date: lastUpdate ? lastUpdate.updated_at : null,
            last_update_by_name: lastUpdate ? lastUpdate.updated_by_name : null,
            last_update_by_role: lastUpdate ? lastUpdate.updated_by_role : null
        } : null,
        institution: institution ? {
            id: institution.id,
            name: institution.institution_name
        } : null,
        status: status ? status.status : null,
        grade: grade ? grade.grade : null,
        gender: gender ? gender.name : null,
        locality: locality ? locality.name : null,
        neighborhood: neighborhood ? neighborhood.name : null,
        last_update_date: lastUpdate ? lastUpdate.updated_at : null,
        last_update_by_name: lastUpdate ? lastUpdate.updated_by_name : null,
        last_update_by_role: lastUpdate ? lastUpdate.updated_by_role : null
    };
}

export function enrichInstitution(inst) {
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
}
