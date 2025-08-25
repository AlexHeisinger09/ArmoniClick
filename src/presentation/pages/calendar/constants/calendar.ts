// src/presentation/pages/calendar/constants/calendar.ts - TIPOS CORREGIDOS
import { AppointmentsCalendarData, Service } from '../types/calendar';

export const monthNames: string[] = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const dayNames: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export const timeSlots: string[] = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

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
      id: '3', time: '14:00', duration: 60, patient: 'Carmen Silva', service: 'Tratamiento anti-edad', 
      status: 'confirmed', title: 'Carmen Silva - Tratamiento anti-edad',
      start: new Date('2025-08-10T14:00:00'), end: new Date('2025-08-10T15:00:00'), allDay: false 
    }
  ],
  '2025-08-11': [
    { 
      id: '4', time: '10:00', duration: 30, patient: 'Laura Martín', service: 'Manicura', 
      status: 'confirmed', title: 'Laura Martín - Manicura',
      start: new Date('2025-08-11T10:00:00'), end: new Date('2025-08-11T10:30:00'), allDay: false 
    },
    { 
      id: '5', time: '15:00', duration: 60, patient: 'Patricia Ruiz', service: 'Masaje facial', 
      status: 'cancelled', title: 'Patricia Ruiz - Masaje facial',
      start: new Date('2025-08-11T15:00:00'), end: new Date('2025-08-11T16:00:00'), allDay: false 
    }
  ]
};