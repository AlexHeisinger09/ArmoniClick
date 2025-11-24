import React, { useState, useEffect, useMemo } from 'react';
import { X, User, UserPlus, Search, Clock, FileText, Mail, Phone, ChevronDown, Loader, AlertCircle } from 'lucide-react';
import { NewAppointmentForm, AppointmentsData } from '../types/calendar';
import { getTimeSlotsForDuration } from '../constants/calendar';
import { isTimeSlotAvailable, hasOverlap } from '../utils/calendar';
import { usePatients } from '@/presentation/hooks/patients/usePatients';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';

interface Patient {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  rut: string;
}

interface NewAppointmentModalProps {
  isOpen: boolean;
  newAppointment: NewAppointmentForm;
  appointments: AppointmentsData;
  onClose: () => void;
  onChange: (appointment: NewAppointmentForm) => void;
  onSubmit: () => void;
  isCreating?: boolean;
  isEditing?: boolean;
  scheduleBlocks?: ScheduleBlock[];
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  newAppointment,
  appointments,
  onClose,
  onChange,
  onSubmit,
  isCreating = false,
  isEditing = false,
  scheduleBlocks = []
}) => {
  // Estados locales para el modal
  const [patientType, setPatientType] = useState<'registered' | 'guest'>('registered');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  
  // Estados para paciente invitado
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: '',
    rut: ''
  });

  // Hook para obtener pacientes
  const { queryPatients } = usePatients();
  const patients = queryPatients.data?.patients || [];
  
  // Filtrar pacientes basado en búsqueda
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => 
      `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  // Debug: Log schedule blocks when modal opens
  useEffect(() => {
    if (isOpen && scheduleBlocks && scheduleBlocks.length > 0) {
      console.log('📅 NewAppointmentModal - Schedule blocks received:', {
        count: scheduleBlocks.length,
        blocks: scheduleBlocks
      });
    }
  }, [isOpen, scheduleBlocks]);

  // Reset estados cuando el modal se abre (pero no si es edición)
  useEffect(() => {
    if (isOpen) {
      const isEditing = !!(window as any).__editingAppointmentId;

      if (!isEditing) {
        // Para creación nueva: resetear todo
        setPatientType('registered');
        setSearchTerm('');
        setSelectedPatient(null);
        setShowPatientSearch(false);
        setGuestData({ name: '', email: '', phone: '', rut: '' });
      } else {
        // Para edición: cargar el paciente del formulario
        setSearchTerm('');
        setShowPatientSearch(false);

        if (newAppointment.patientId) {
          // Es un paciente registrado
          setPatientType('registered');
          // Buscar el paciente en la lista
          const patient = patients.find(p => p.id === newAppointment.patientId);
          if (patient) {
            setSelectedPatient(patient);
          }
        } else if (newAppointment.guestName) {
          // Es un paciente invitado
          setPatientType('guest');
          setGuestData({
            name: newAppointment.guestName || '',
            email: newAppointment.guestEmail || '',
            phone: newAppointment.guestPhone || '',
            rut: newAppointment.guestRut || ''
          });
        }
      }
    }
  }, [isOpen, patients]);

  // Actualizar formulario cuando se selecciona paciente
  useEffect(() => {
    if (!isOpen) return;
    
    if (patientType === 'registered' && selectedPatient) {
      const expectedPatientName = `${selectedPatient.nombres} ${selectedPatient.apellidos}`;
      const expectedPatientId = selectedPatient.id;
      
      if (newAppointment.patient !== expectedPatientName || newAppointment.patientId !== expectedPatientId) {
        onChange({
          ...newAppointment,
          patient: expectedPatientName,
          patientId: expectedPatientId,
          guestName: undefined,
          guestEmail: undefined,
          guestPhone: undefined,
          guestRut: undefined
        });
      }
    } else if (patientType === 'guest' && guestData.name) {
      if (newAppointment.patient !== guestData.name || 
          newAppointment.guestName !== guestData.name ||
          newAppointment.guestEmail !== guestData.email) {
        onChange({
          ...newAppointment,
          patient: guestData.name,
          patientId: undefined,
          guestName: guestData.name,
          guestEmail: guestData.email,
          guestPhone: guestData.phone,
          guestRut: guestData.rut
        });
      }
    }
  }, [patientType, selectedPatient, guestData, isOpen]);

  // Handlers
  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  const handleGuestDataChange = (field: keyof typeof guestData, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormChange = (updates: Partial<NewAppointmentForm>) => {
    onChange({ ...newAppointment, ...updates });
  };

  const handleSubmit = () => {
    if (isCreating) return;
    onSubmit();
  };

  // Validaciones
  const isFormValid = () => {
    const hasPatient = patientType === 'registered' ? selectedPatient : guestData.name.trim();
    return hasPatient && newAppointment.service && newAppointment.time && newAppointment.date;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-xl">
            {/* Header con gradiente - Estándar */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Nueva Cita</h3>
                  {newAppointment.date && (
                    <p className="text-xs sm:text-sm text-white text-opacity-90 mt-0.5 truncate">
                      {newAppointment.date.toLocaleDateString('es-CL', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })} • {newAppointment.time || 'Sin horario'}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  disabled={isCreating}
                  className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Contenido principal - Scrolleable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 max-h-[60vh]">
              <div className="space-y-4">
            
            {/* Selector de tipo de paciente */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Paciente
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPatientType('registered')}
                  disabled={isCreating}
                  className={`flex items-center justify-center p-2 sm:p-2.5 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium disabled:opacity-50 ${
                    patientType === 'registered'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  Registrado
                </button>
                <button
                  type="button"
                  onClick={() => setPatientType('guest')}
                  disabled={isCreating}
                  className={`flex items-center justify-center p-2 sm:p-2.5 rounded-lg border-2 transition-all text-xs sm:text-sm font-medium disabled:opacity-50 ${
                    patientType === 'guest'
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                  Invitado
                </button>
              </div>
            </div>

            {/* Selector de paciente registrado */}
            {patientType === 'registered' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Paciente *
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    disabled={isCreating}
                    className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => !isCreating && setShowPatientSearch(!showPatientSearch)}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <Search className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 mr-2 flex-shrink-0" />
                      <span className={`truncate text-xs sm:text-sm ${selectedPatient ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                        {selectedPatient ? `${selectedPatient.nombres} ${selectedPatient.apellidos}` : 'Buscar paciente...'}
                      </span>
                    </div>
                    <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                      showPatientSearch ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown de búsqueda */}
                  {showPatientSearch && !isCreating && (
                    <div className="absolute z-20 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl">
                      <div className="p-2 border-b border-slate-200 bg-slate-50">
                        <input
                          type="text"
                          placeholder="Buscar por nombre o RUT..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-2 py-1.5 sm:px-3 sm:py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xs sm:text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="max-h-32 sm:max-h-40 overflow-y-auto">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.slice(0, 5).map((patient) => (
                            <button
                              key={patient.id}
                              onClick={() => handlePatientSelect(patient)}
                              className="w-full text-left p-2 sm:p-3 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-800 text-xs sm:text-sm mb-0.5 truncate">
                                {patient.nombres} {patient.apellidos}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {patient.rut} • {patient.telefono}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 sm:p-4 text-center text-slate-500 text-xs sm:text-sm">
                            No se encontraron pacientes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Información del paciente seleccionado */}
                {selectedPatient && (
                  <div className="mt-2 p-2 sm:p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div className="flex items-center text-slate-600 truncate">
                        <Mail className="w-3 h-3 mr-2 text-cyan-500 flex-shrink-0" />
                        <span className="truncate">{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center text-slate-600">
                        <Phone className="w-3 h-3 mr-2 text-cyan-500 flex-shrink-0" />
                        <span>{selectedPatient.telefono}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Formulario para paciente invitado */}
            {patientType === 'guest' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={guestData.name}
                    onChange={(e) => handleGuestDataChange('name', e.target.value)}
                    disabled={isCreating}
                    className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                    placeholder="Nombre del paciente"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={guestData.email}
                      onChange={(e) => handleGuestDataChange('email', e.target.value)}
                      disabled={isCreating}
                      className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={guestData.phone}
                      onChange={(e) => handleGuestDataChange('phone', e.target.value)}
                      disabled={isCreating}
                      className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campo de servicio/tratamiento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tratamiento/Servicio *
              </label>
              <input
                type="text"
                value={newAppointment.service}
                onChange={(e) => handleFormChange({ service: e.target.value })}
                disabled={isCreating}
                className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                placeholder="Ej: Limpieza facial, Consulta general, Tratamiento..."
              />
            </div>

            {/* Selector de duración */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duración de la Cita *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[30, 60, 90, 120].map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => !isCreating && handleFormChange({ duration })}
                    disabled={isCreating}
                    className={`
                      p-2 sm:p-2.5 text-xs sm:text-sm rounded-lg transition-all border-2 font-medium disabled:cursor-not-allowed flex items-center justify-center
                      ${newAppointment.duration === duration
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-50'
                      }
                    `}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {duration} min
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de horario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Horario * ({newAppointment.duration || 30} min)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getTimeSlotsForDuration(newAppointment.duration || 30).map(time => {
                  const available = newAppointment.date ?
                    isTimeSlotAvailable(appointments, newAppointment.date, time, newAppointment.duration || 30, scheduleBlocks) : false;
                  const isOverlap = newAppointment.date ?
                    hasOverlap(appointments, newAppointment.date, time, newAppointment.duration || 30) : false;

                  // Debug log
                  if (newAppointment.date) {
                    console.log(`🔍 Time slot ${time}:`, {
                      date: newAppointment.date.toISOString().split('T')[0],
                      duration: newAppointment.duration || 30,
                      available,
                      isOverlap,
                      scheduleBlocksCount: scheduleBlocks?.length || 0,
                      scheduleBlocks: scheduleBlocks || [],
                      hasConflictWithAppointment: !available && !isOverlap
                    });
                  }

                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        if (available && !isCreating) {
                          handleFormChange({ time });
                        }
                      }}
                      disabled={!available || isCreating}
                      className={`
                        p-1.5 sm:p-2 text-xs sm:text-sm rounded-lg transition-all border-2 font-medium relative disabled:cursor-not-allowed
                        ${newAppointment.time === time && available
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                          : available && !isCreating
                            ? isOverlap
                              ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'
                        }
                      `}
                      title={!available ? `No disponible: conflicta con cita existente` : available && isOverlap ? 'Sobrecupo' : 'Disponible'}
                    >
                      <div className="flex items-center justify-center">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {time}
                      </div>
                      {isOverlap && available && (
                        <div className="text-xs font-semibold mt-0.5">Sobrecupo</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de notas/descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={newAppointment.description}
                onChange={(e) => handleFormChange({ description: e.target.value })}
                disabled={isCreating}
                className="w-full p-2 sm:p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-12 sm:h-16 resize-none transition-all text-sm disabled:opacity-50"
                placeholder="Observaciones, motivo de consulta, etc..."
              />
            </div>

              </div>
            </div>

            {/* Footer con botones */}
            <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 bg-slate-50">
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isCreating}
                  className={`flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center ${
                    isFormValid() && !isCreating
                      ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCreating ? (
                    <>
                      <Loader className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                      <span className="hidden sm:inline">{isEditing ? 'Actualizando...' : 'Creando...'}</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden sm:inline">{isEditing ? 'Actualizar Cita' : 'Crear Cita'}</span>
                      <span className="sm:hidden">{isEditing ? 'Actualizar' : 'Crear'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {showPatientSearch && !isCreating && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowPatientSearch(false)}
        />
      )}
    </>
  );
};