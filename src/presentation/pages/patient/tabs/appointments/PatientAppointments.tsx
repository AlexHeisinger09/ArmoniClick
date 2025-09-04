// src/presentation/pages/patient/tabs/appointments/PatientAppointments.tsx
import React, { useState, useMemo } from 'react';
import { Plus, Calendar, Clock, User, Phone, Mail, ChevronRight, Filter } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { useAppointments } from '@/presentation/hooks/appointments/useAppointments';
import { PatientAppointmentModal } from '../../tabs/appointments/PatientAppointmentModal';
import { useCreateAppointment } from '@/presentation/hooks/appointments/useCreateAppointment';
import { useCalendarAppointments } from '@/presentation/hooks/appointments/useCalendarAppointments';
import { AppointmentResponse } from '@/infrastructure/interfaces/appointment.response';
import { AppointmentMapper } from '@/infrastructure/mappers/appointment.mapper';
import { Spinner } from '@/presentation/components/ui/spinner';
import { Alert, AlertDescription } from '@/presentation/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PatientAppointmentForm {
  date: Date;
  time: string;
  service: string;
  description: string;
  duration: number;
}

interface PatientAppointmentsProps {
  patient: Patient;
}

type AppointmentFilter = 'all' | 'upcoming' | 'completed' | 'cancelled';

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patient }) => {
  // Estados para el modal específico de pacientes
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [filter, setFilter] = useState<AppointmentFilter>('all');
  
  // Hook para obtener todas las citas del doctor (sin filtros de fecha)
  const { data: allAppointments, isLoading, error, refetch } = useAppointments();

  // Hook para crear citas
  const createAppointmentMutation = useCreateAppointment();

  // Hook para obtener el estado de appointments para disponibilidad
  const { appointments: calendarAppointments } = useCalendarAppointments(new Date(), 'month');

  // Filtrar citas del paciente específico usando múltiples criterios
  const patientAppointments = useMemo(() => {
    if (!allAppointments) return [];
    
    console.log('🔍 Filtering appointments for patient:', {
      patientId: patient.id,
      patientName: `${patient.nombres} ${patient.apellidos}`,
      patientRut: patient.rut,
      totalAppointments: allAppointments.length
    });
    
    const filtered = allAppointments.filter((appointment: AppointmentResponse) => {
      // Criterio 1: Coincidencia por ID del paciente
      const matchesById = appointment.patientId === patient.id;
      
      // Criterio 2: Coincidencia por nombre completo (para citas creadas como invitado)
      const patientFullName = `${patient.nombres} ${patient.apellidos}`;
      const appointmentFullName = appointment.patientName && appointment.patientLastName 
        ? `${appointment.patientName} ${appointment.patientLastName}`
        : appointment.guestName || '';
      const matchesByName = appointmentFullName.toLowerCase().trim() === patientFullName.toLowerCase().trim();
      
      // Criterio 3: Coincidencia por RUT (si está disponible)
      const matchesByRut = appointment.guestRut === patient.rut;
      
      // Criterio 4: Coincidencia por email
      const matchesByEmail = appointment.patientEmail === patient.email || appointment.guestEmail === patient.email;
      
      const matches = matchesById || matchesByName || matchesByRut || matchesByEmail;
      
      if (matches) {
        console.log('✅ Found matching appointment:', {
          appointmentId: appointment.id,
          appointmentTitle: appointment.title,
          matchesById,
          matchesByName,
          matchesByRut,
          matchesByEmail,
          appointmentPatientId: appointment.patientId,
          appointmentPatientName: appointment.patientName,
          appointmentGuestName: appointment.guestName
        });
      }
      
      return matches;
    });
    
    console.log('📊 Patient appointments result:', {
      patientId: patient.id,
      patientName: `${patient.nombres} ${patient.apellidos}`,
      foundAppointments: filtered.length,
      appointments: filtered
    });
    
    return filtered;
  }, [allAppointments, patient]);

  // Aplicar filtro
  const filteredAppointments = useMemo(() => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return patientAppointments.filter(apt => 
          new Date(apt.appointmentDate) > now && 
          ['pending', 'confirmed'].includes(apt.status)
        );
      case 'completed':
        return patientAppointments.filter(apt => apt.status === 'completed');
      case 'cancelled':
        return patientAppointments.filter(apt => apt.status === 'cancelled');
      default:
        return patientAppointments;
    }
  }, [patientAppointments, filter]);

  // Ordenar por fecha (más recientes primero)
  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => 
      new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
    );
  }, [filteredAppointments]);

  const handleNewAppointment = () => {
    setShowNewAppointmentModal(true);
  };

  const handleCreateAppointment = async (appointmentData: PatientAppointmentForm) => {
    try {
      // Convertir el formulario del paciente al formato del backend
      const backendData = AppointmentMapper.fromCalendarFormToBackendRequest({
        patient: `${patient.nombres} ${patient.apellidos}`,
        patientId: patient.id,
        service: appointmentData.service,
        description: appointmentData.description,
        time: appointmentData.time,
        duration: appointmentData.duration,
        date: appointmentData.date,
        guestName: undefined,
        guestEmail: undefined,
        guestPhone: undefined,
        guestRut: undefined
      });

      await createAppointmentMutation.mutateAsync(backendData);
      setShowNewAppointmentModal(false);
      
      // Refrescar las citas después de crear una nueva
      refetch();
    } catch (error) {
      console.error('Error creating patient appointment:', error);
      // El error se maneja automáticamente por el hook
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmada',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: '✓'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '○'
        };
      case 'completed':
        return {
          label: 'Completada',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✓'
        };
      case 'cancelled':
        return {
          label: 'Cancelada',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '✕'
        };
      case 'no-show':
        return {
          label: 'No asistió',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '?'
        };
      default:
        return {
          label: status,
          color: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: '○'
        };
    }
  };

  const getFilterCount = (filterType: AppointmentFilter): number => {
    const now = new Date();
    
    switch (filterType) {
      case 'upcoming':
        return patientAppointments.filter(apt => 
          new Date(apt.appointmentDate) > now && 
          ['pending', 'confirmed'].includes(apt.status)
        ).length;
      case 'completed':
        return patientAppointments.filter(apt => apt.status === 'completed').length;
      case 'cancelled':
        return patientAppointments.filter(apt => apt.status === 'cancelled').length;
      default:
        return patientAppointments.length;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Spinner />
          <span className="ml-3 text-slate-600">Cargando citas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar las citas del paciente
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      {/* Header con información del paciente y botón de nueva cita */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Historial de Citas
          </h3>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-slate-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {patient.nombres} {patient.apellidos}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {patient.telefono}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {patient.email}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleNewAppointment}
          className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-4 py-2.5 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      {/* Filtros - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
        <div className="flex items-center">
          <Filter className="w-4 h-4 text-slate-500 mr-2" />
          <span className="text-sm text-slate-600 font-medium">Filtros:</span>
        </div>
        <div className="flex overflow-x-auto pb-2 sm:pb-0 space-x-2">
          {[
            { key: 'all' as const, label: 'Todas' },
            { key: 'upcoming' as const, label: 'Próximas' },
            { key: 'completed' as const, label: 'Completadas' },
            { key: 'cancelled' as const, label: 'Canceladas' }
          ].map(({ key, label }) => {
            const count = getFilterCount(key);
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  filter === key
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === key
                    ? 'bg-white bg-opacity-20'
                    : 'bg-slate-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista de citas */}
      <div className="space-y-4">
        {sortedAppointments.map((appointment) => {
          const statusConfig = getStatusConfig(appointment.status);
          const appointmentDate = new Date(appointment.appointmentDate);
          const isUpcoming = appointmentDate > new Date();
          
          return (
            <div 
              key={appointment.id} 
              className={`border-2 rounded-xl p-4 transition-colors hover:shadow-md ${
                isUpcoming 
                  ? 'border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                    <h4 className="font-semibold text-slate-800 text-lg">
                      {appointment.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-2 sm:mt-0 self-start ${statusConfig.color}`}>
                      <span className="mr-1">{statusConfig.icon}</span>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-slate-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="font-medium text-sm sm:text-base">{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="font-medium text-sm sm:text-base">{formatTime(appointment.appointmentDate)}</span>
                      <span className="ml-1 text-slate-500 text-sm">({appointment.duration} min)</span>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">Notas:</span> {appointment.notes}
                      </p>
                    </div>
                  )}
                  
                  {appointment.description && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Descripción:</span> {appointment.description}
                      </p>
                    </div>
                  )}
                </div>
                
                <button className="mt-4 sm:mt-0 sm:ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors self-start">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Estado vacío */}
        {sortedAppointments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              {filter === 'all' 
                ? 'No hay citas registradas' 
                : `No hay citas ${filter === 'upcoming' ? 'próximas' : filter === 'completed' ? 'completadas' : 'canceladas'}`
              }
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              {filter === 'all' 
                ? `Programa la primera cita para ${patient.nombres} para comenzar el tratamiento.`
                : `No se encontraron citas con el filtro "${filter === 'upcoming' ? 'próximas' : filter === 'completed' ? 'completadas' : 'canceladas'}".`
              }
            </p>
            {filter === 'all' && (
              <button 
                onClick={handleNewAppointment}
                className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-6 py-3 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5 mr-2" />
                Programar Primera Cita
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de nueva cita específico para pacientes */}
      <PatientAppointmentModal
        isOpen={showNewAppointmentModal}
        patient={patient}
        appointments={calendarAppointments}
        onClose={() => setShowNewAppointmentModal(false)}
        onSubmit={handleCreateAppointment}
        isCreating={createAppointmentMutation.isPending}
      />
    </div>
  );
};

export { PatientAppointments };