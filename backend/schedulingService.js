import { DEFAULT_SERVICES } from './constants.js';
import { getStoredAppointments } from './dataService.js';

/* =========================
   UTILIDADES
========================= */

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

/* =========================
   VERIFICA DISPONIBILIDADE
========================= */

export function isTimeAvailable(
  salonId,
  date,
  startTime,
  serviceName
) {
  const service = DEFAULT_SERVICES.find(
    s => s.name.toLowerCase() === serviceName.toLowerCase()
  );

  if (!service) return false;

  const start = timeToMinutes(startTime);
  const end = start + service.duration;

  const OPEN = timeToMinutes('08:00');
  const CLOSE = timeToMinutes('19:00');

  if (start < OPEN || end > CLOSE) return false;

  const appointments = getStoredAppointments(salonId);
  const sameDay = appointments.filter(a => a.date === date);

  for (const appt of sameDay) {
    const apptService = DEFAULT_SERVICES.find(
      s => s.name.toLowerCase() === appt.service.toLowerCase()
    );

    if (!apptService) continue;

    const aStart = timeToMinutes(appt.time);
    const aEnd = aStart + apptService.duration;

    if (start < aEnd && end > aStart) {
      return false;
    }
  }

  return true;
}

/* =========================
   GERA HORÁRIOS DISPONÍVEIS
========================= */

export function getAvailableTimeSlots(
  salonId,
  date,
  serviceName,
  interval = 15
) {
  const service = DEFAULT_SERVICES.find(
    s => s.name.toLowerCase() === serviceName.toLowerCase()
  );

  if (!service) return [];

  const OPEN = timeToMinutes('08:00');
  const CLOSE = timeToMinutes('19:00');

  const slots = [];

  for (
    let current = OPEN;
    current + service.duration <= CLOSE;
    current += interval
  ) {
    const time = minutesToTime(current);

    const available = isTimeAvailable(
      salonId,
      date,
      time,
      serviceName
    );

    if (available) {
      slots.push(time);
    }
  }

  return slots;
}
