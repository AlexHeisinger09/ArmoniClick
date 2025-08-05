// constants/calendar.ts
import { AppointmentsData, Service } from '../types/calendar';

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

export const exampleAppointments: AppointmentsData = {
  '2025-06-10': [
    { id: 1, time: '09:00', duration: 60, patient: 'María García', service: 'Limpieza facial', status: 'confirmed' },
    { id: 2, time: '11:00', duration: 30, patient: 'Ana López', service: 'Depilación cejas', status: 'pending' },
    { id: 3, time: '14:30', duration: 60, patient: 'Carmen Silva', service: 'Tratamiento anti-edad', status: 'confirmed' }
  ],
  '2025-06-11': [
    { id: 4, time: '10:00', duration: 30, patient: 'Laura Martín', service: 'Manicura', status: 'confirmed' },
    { id: 5, time: '15:00', duration: 60, patient: 'Patricia Ruiz', service: 'Masaje facial', status: 'confirmed' }
  ],
  '2025-06-17': [
    { id: 6, time: '09:00', duration: 60, patient: 'Isabel Torres', service: 'Depilación', status: 'pending' },
    { id: 7, time: '10:00', duration: 60, patient: 'Sofía Mendoza', service: 'Tratamiento facial', status: 'confirmed' },
    { id: 13, time: '16:00', duration: 60, patient: 'Carla Vega', service: 'Depilación cejas', status: 'confirmed' },
    { id: 14, time: '17:00', duration: 60, patient: 'Carla Vega', service: 'Depilación cejas', status: 'confirmed' }
  ],
  '2025-06-18': [
    { id: 15, time: '10:30', duration: 60, patient: 'Rosa Jiménez', service: 'Limpieza profunda', status: 'confirmed' },
    { id: 16, time: '14:00', duration: 30, patient: 'Elena Castro', service: 'Manicura', status: 'pending' }
  ],
  '2025-06-19': [
    { id: 17, time: '09:00', duration: 30, patient: 'Andrea Morales', service: 'Pedicura', status: 'confirmed' },
    { id: 18, time: '11:30', duration: 60, patient: 'Lucía Herrera', service: 'Masaje relajante', status: 'confirmed' }
  ]
};