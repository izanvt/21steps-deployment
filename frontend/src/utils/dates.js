// constantes de fechas compartidas entre componentes, ahorramos código
export const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
export const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
export const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}
