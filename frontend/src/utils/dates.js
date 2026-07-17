/** Utilidades de formato de fechas, estado de actualizacion (semaforo) y estado de campanas. */
export function formatDate(dateStr, locale = "es-CO") {
    if (!dateStr) return "—";
    try {
        return new Intl.DateTimeFormat(locale, {
            day: "2-digit", month: "short", year: "numeric"
        }).format(new Date(dateStr));
    } catch (e) {
        return dateStr;
    }
}

export function getUpdateStatus(lastUpdate) {
    if (!lastUpdate) {
        return { color: "bg-red-500", label: "Nunca actualizado", textColor: "text-red-700", daysSince: Infinity, level: "red" };
    }
    const daysSince = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 30) {
        return { color: "bg-green-500", label: "Actualizado recientemente", textColor: "text-green-700", daysSince, level: "green" };
    }
    if (daysSince <= 90) {
        return { color: "bg-yellow-500", label: "Por actualizar", textColor: "text-yellow-700", daysSince, level: "yellow" };
    }
    return { color: "bg-red-500", label: "Desactualizado", textColor: "text-red-700", daysSince, level: "red" };
}

export function getUpdateColor(student) {
    const lastUpd = student.last_update_date || student.person?.last_update_date;
    if (!lastUpd) return "red";
    const daysSince = Math.floor((Date.now() - new Date(lastUpd).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 30) return "green";
    if (daysSince <= 90) return "yellow";
    return "red";
}

export function getCampaignStatus(campaign) {
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = campaign.end_date ? new Date(campaign.end_date) : new Date("2099-12-31");
    if (now >= start && now <= end) {
        return { status: "active", label: "Activa", color: "badge-green" };
    }
    if (now < start) {
        return { status: "upcoming", label: "Próxima", color: "badge-yellow" };
    }
    return { status: "finished", label: "Finalizada", color: "badge-gray" };
}
