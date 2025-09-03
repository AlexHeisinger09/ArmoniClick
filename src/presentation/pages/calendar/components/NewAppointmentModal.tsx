import React, { useState, useEffect, useMemo } from 'react';
import { X, User, UserPlus, Search, Clock, FileText, Mail, Phone, ChevronDown, Loader } from 'lucide-react';
import { NewAppointmentForm, AppointmentsData } from '../types/calendar';
import { timeSlots } from '../constants/calendar';
import { isTimeSlotAvailable, hasOverlap } from '../utils/calendar';
import { usePatients } from '@/presentation/hooks/patients/usePatients';

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
  isCreating?: boolean; // ✅ NUEVO - Estado de creación para bloquear botón
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  newAppointment,
  appointments,
  onClose,
  onChange,
  onSubmit,
  isCreating = false // ✅ NUEVO
}) => {
  // Estados para pacientes
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
  
  // Filtrar pacientes basado en búsqueda - MEMOIZADO para evitar recalculos
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => 
      `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.rut.includes(searchTerm)
    );
  }, [patients, searchTerm]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPatientType('registered');
      setSearchTerm('');
      setSelectedPatient(null);
      setShowPatientSearch(false);
      setGuestData({ name: '', email: '', phone: '', rut: '' });
    }
  }, [isOpen]);

  // Separar la lógica de actualización del formulario
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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  const handleGuestDataChange = (field: keyof typeof guestData, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    const hasPatient = patientType === 'registered' ? selectedPatient : guestData.name.trim();
    return hasPatient && newAppointment.service && newAppointment.time && newAppointment.date;
  };

  const handleFormChange = (updates: Partial<NewAppointmentForm>) => {
    onChange({ ...newAppointment, ...updates });
  };

  // ✅ NUEVO - Handler que previene múltiples envíos
  const handleSubmit = () => {
    if (isCreating) return; // Prevenir múltiples clicks
    onSubmit();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* ✅ OPTIMIZADO - Modal más compacto en móvil */}
      <div className="bg-white w-full h-[95vh] sm:h-auto sm:w-full sm:max-w-xl sm:max-h-[85vh] sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header compacto */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Nueva Cita</h3>
              {newAppointment.date && (
                <p className="text-xs opacity-90 mt-0.5">
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
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Más compacto */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          
          {/* Tipo de Paciente - Más pequeño */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Paciente</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPatientType('registered')}
                disabled={isCreating}
                className={`flex items-center justify-center p-2.5 rounded-lg border-2 transition-all text-sm font-medium disabled:opacity-50 ${
                  patientType === 'registered'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <User className="w-4 h-4 mr-1.5" />
                Registrado
              </button>
              <button
                type="button"
                onClick={() => setPatientType('guest')}
                disabled={isCreating}
                className={`flex items-center justify-center p-2.5 rounded-lg border-2 transition-all text-sm font-medium disabled:opacity-50 ${
                  patientType === 'guest'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Invitado
              </button>
            </div>
          </div>

          {/* Selección de Paciente Registrado - Más compacto */}
          {patientType === 'registered' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Paciente *</label>
              
              <div className="relative">
                <button
                  type="button"
                  disabled={isCreating}
                  className="w-full p-2.5 border-2 border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => !isCreating && setShowPatientSearch(!showPatientSearch)}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                    <span className={`truncate ${selectedPatient ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {selectedPatient ? `${selectedPatient.nombres} ${selectedPatient.apellidos}` : 'Buscar paciente...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                    showPatientSearch ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Lista de pacientes más compacta */}
                {showPatientSearch && !isCreating && (
                  <div className="absolute z-20 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl">
                    <div className="p-2 border-b border-slate-200 bg-slate-50">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                        autoFocus
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.slice(0, 5).map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left p-3 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-slate-800 text-sm mb-0.5">
                              {patient.nombres} {patient.apellidos}
                            </div>
                            <div className="text-xs text-slate-500">
                              {patient.rut} • {patient.telefono}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          No se encontraron pacientes
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Info del paciente más compacta */}
              {selectedPatient && (
                <div className="mt-2 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
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

          {/* Datos de Paciente Invitado - Más compacto */}
          {patientType === 'guest' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={guestData.name}
                  onChange={(e) => handleGuestDataChange('name', e.target.value)}
                  disabled={isCreating}
                  className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                  placeholder="Nombre del paciente"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => handleGuestDataChange('email', e.target.value)}
                    disabled={isCreating}
                    className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => handleGuestDataChange('phone', e.target.value)}
                    disabled={isCreating}
                    className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ✅ CAMBIADO - Tratamiento como input de texto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tratamiento *</label>
            <input
              type="text"
              value={newAppointment.service}
              onChange={(e) => handleFormChange({ service: e.target.value })}
              disabled={isCreating}
              className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm disabled:opacity-50"
              placeholder="Ej: Limpieza facial, Consulta general, Tratamiento..."
            />
          </div>

          {/* Horario más compacto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Horario *</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(time => {
                const available = newAppointment.date ?
                  isTimeSlotAvailable(appointments, newAppointment.date, time) : false;
                const isOverlap = newAppointment.date ?
                  hasOverlap(appointments, newAppointment.date, time) : false;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isCreating && handleFormChange({ time })}
                    disabled={!available || isCreating}
                    className={`
                      p-2 text-xs rounded-lg transition-all border-2 font-medium relative disabled:cursor-not-allowed
                      ${newAppointment.time === time
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                        : available && !isCreating
                          ? isOverlap
                            ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200 opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </div>
                    {isOverlap && available && (
                      <div className="text-[10px] font-semibold">Sobrecupo</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas más compacto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
            <textarea
              value={newAppointment.description}
              onChange={(e) => handleFormChange({ description: e.target.value })}
              disabled={isCreating}
              className="w-full p-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-16 resize-none transition-all text-sm disabled:opacity-50"
              placeholder="Observaciones adicionales..."
            />
          </div>
        </div>

        {/* ✅ MEJORADO - Footer con botón de carga */}
        <div className="border-t border-slate-200 px-4 py-3 flex-shrink-0 bg-slate-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid() || isCreating}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center relative ${
                isFormValid() && !isCreating
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCreating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Crear Cita
                </>
              )}
            </button>
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
    </div>
  );
};