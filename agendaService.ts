import { salonConfig } from './salonConfig';

export interface Appointment {
  service: string;
  date: string;
  time: string;
}

const appointments: Appointment[] = [];

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isWithinWorkingHours(time: string, duration: number) {
  const start = toMinutes(time);
  const end = start + duration;

  const workStart = toMinutes(salonConfig.workingHours.start);
  const workEnd = toMinutes(salonConfig.workingHours.end);

  return start >= workStart && end <= workEnd;
}

export function isTimeAvailable(date: string, time: string, duration: number) {
  const start = toMinutes(time);
  const end = start + duration;

  return !appointments.some(a => {
    if (a.date !== date) return false;

    const aStart = toMinutes(a.time);
    const aEnd = aStart + salonConfig.services[a.service];

    return start < aEnd && end > aStart;
  });
}

export function createAppointment(appointment: Appointment) {
  const duration = salonConfig.services[appointment.service];

  if (!duration) {
    throw new Error('Serviço não encontrado');
  }

  if (!isWithinWorkingHours(appointment.time, duration)) {
    throw new Error('Fora do horário de atendimento');
  }

  if (!isTimeAvailable(appointment.date, appointment.time, duration)) {
    throw new Error('Horário indisponível');
  }

  appointments.push(appointment);
  return appointment;
}

export function listAppointments() {
  return appointments;
}
