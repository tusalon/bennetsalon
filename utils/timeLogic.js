// utils/timeLogic.js - Bennet Salon (FUNCIONES DE UTILIDAD)

function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function formatTo12Hour(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hour12 = hours % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// 🔥 FUNCIÓN QUE GENERA LOS HORARIOS (8 AM y 2 PM)
function generateBaseSlots(durationMinutes) {
    return ["08:00", "14:00"];
}

function filterAvailableSlots(baseSlots, durationMinutes, existingBookings) {
    return baseSlots.filter(slotStartStr => {
        const slotStart = timeToMinutes(slotStartStr);
        const slotEnd = slotStart + durationMinutes;

        const hasConflict = existingBookings.some(booking => {
            const bookingStart = timeToMinutes(booking.hora_inicio);
            const bookingEnd = timeToMinutes(booking.hora_fin);
            return (slotStart < bookingEnd) && (slotEnd > bookingStart);
        });

        return !hasConflict;
    });
}

function calculateEndTime(startTimeStr, durationMinutes) {
    const startMins = timeToMinutes(startTimeStr);
    return minutesToTime(startMins + durationMinutes);
}

// También necesitamos la función isTimePast para TimeSlots
function isTimePast(timeStr24) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const [slotHour, slotMinute] = timeStr24.split(':').map(Number);
    
    if (slotHour < currentHour) return true;
    if (slotHour === currentHour && slotMinute < currentMinute) return true;
    return false;
}