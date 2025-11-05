// src/presentation/pages/calendar/constants/calendar.ts - TIPOS CORREGIDOS
import { AppointmentsCalendarData, Service } from '../types/calendar';

export const monthNames: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const dayNames: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Slots de 30 minutos - actualizado para mejor disponibilidad
// Horario: 09:00 a 19:30 (se trabaja hasta las 20:00)
export const timeSlots: string[] = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
];

// Función para generar time slots dinámicamente - SIEMPRE en incrementos de 30 minutos
export const getTimeSlotsForDuration = (duration: number = 30): string[] => {
  const slots: string[] = [];
  const startHour = 9;
  const endHour = 19; // Hasta las 19:30 (se trabaja hasta las 20:00)

  // Mostrar SIEMPRE slots de 30 minutos, independientemente de la duración
  // Esto permite que una cita de 60 min pueda empezar a las 9:30, 10:30, etc.
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  // Agregar el último slot a las 19:30
  slots.push('19:30');

  return slots;
};

export const services: Service[] = [
  { name: 'Limpieza facial', duration: 60, price: '$45.000' },
  { name: 'Tratamiento anti-edad', duration: 60, price: '$65.000' },
  { name: 'Masaje facial', duration: 60, price: '$35.000' },
  { name: 'Depilación cejas', duration: 30, price: '$15.000' },
  { name: 'Depilación facial', duration: 30, price: '$20.000' },
  { name: 'Manicura', duration: 30, price: '$18.000' },
  { name: 'Pedicura', duration: 60, price: '$25.000' }
];

// Datos de ejemplo - ahora usando el tipo correcto con IDs string
export const exampleAppointments: AppointmentsCalendarData = {
  '2025-08-10': [
    {
      id: '1', time: '09:00', duration: 60, patient: 'María García', service: 'Limpieza facial',
      status: 'confirmed', title: 'María García - Limpieza facial',
      start: new Date('2025-08-10T09:00:00'), end: new Date('2025-08-10T10:00:00'), allDay: false
    },
    {
      id: '2', time: '11:00', duration: 30, patient: 'Ana López', service: 'Depilación cejas',
      status: 'pending', title: 'Ana López - Depilación cejas',
      start: new Date('2025-08-10T11:00:00'), end: new Date('2025-08-10T11:30:00'), allDay: false
    },
    {
      id: '3', time: '14:00', duration: 90, patient: 'Carmen Silva', service: 'Tratamiento anti-edad',
      status: 'confirmed', title: 'Carmen Silva - Tratamiento anti-edad',
      start: new Date('2025-08-10T14:00:00'), end: new Date('2025-08-10T15:30:00'), allDay: false
    }
  ],
  '2025-08-11': [
    {
      id: '4', time: '10:00', duration: 30, patient: 'Laura Martín', service: 'Manicura',
      status: 'confirmed', title: 'Laura Martín - Manicura',
      start: new Date('2025-08-11T10:00:00'), end: new Date('2025-08-11T10:30:00'), allDay: false
    },
    {
      id: '5', time: '15:00', duration: 120, patient: 'Patricia Ruiz', service: 'Masaje facial',
      status: 'cancelled', title: 'Patricia Ruiz - Masaje facial',
      start: new Date('2025-08-11T15:00:00'), end: new Date('2025-08-11T17:00:00'), allDay: false
    }
  ]
};