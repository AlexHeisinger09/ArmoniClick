import React, { useState, useEffect } from 'react';
import { X, User, UserPlus, Search, Clock, Calendar, FileText, Mail, Phone, ChevronDown } from 'lucide-react';
import { NewAppointmentForm, AppointmentsData } from '../types/calendar';
import { timeSlots, services } from '../constants/calendar';
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
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  newAppointment,
  appointments,
  onClose,
  onChange,
  onSubmit
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
  
  // Filtrar pacientes basado en búsqueda
  const filteredPatients = patients.filter(patient => 
    `${patient.nombres} ${patient.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.rut.includes(searchTerm)
  );

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

  // Actualizar el formulario cuando se selecciona un paciente o se cambian datos de invitado
  useEffect(() => {
    if (patientType === 'registered' && selectedPatient) {
      onChange({
        ...newAppointment,
        patient: `${selectedPatient.nombres} ${selectedPatient.apellidos}`,
        patientId: selectedPatient.id,
        guestName: undefined,
        guestEmail: undefined,
        guestPhone: undefined,
        guestRut: undefined
      });
    } else if (patientType === 'guest' && guestData.name) {
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
  }, [patientType, selectedPatient, guestData, onChange, newAppointment]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      {/* Modal Container - Fullscreen en móvil, centrado en desktop */}
      <div className="bg-white w-full h-full sm:h-auto sm:w-full sm:max-w-2xl sm:max-h-[90vh] sm:rounded-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header - Sticky en móvil */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                Nueva Cita
              </h3>
              {newAppointment.date && (
                <p className="text-sm text-slate-500 mt-1">
                  {newAppointment.date.toLocaleDateString('es-CL', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          
          {/* Tipo de Paciente */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tipo de Paciente
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPatientType('registered')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all font-medium ${
                  patientType === 'registered'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">Registrado</span>
              </button>
              <button
                type="button"
                onClick={() => setPatientType('guest')}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all font-medium ${
                  patientType === 'guest'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="text-sm">Invitado</span>
              </button>
            </div>
          </div>

          {/* Selección de Paciente Registrado */}
          {patientType === 'registered' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Seleccionar Paciente *
              </label>
              
              {/* Campo de selección sin dropdown interno */}
              <div className="relative">
                <button
                  type="button"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg text-left flex items-center justify-between hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all"
                  onClick={() => setShowPatientSearch(!showPatientSearch)}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <span className={`truncate ${selectedPatient ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                      {selectedPatient ? `${selectedPatient.nombres} ${selectedPatient.apellidos}` : 'Buscar paciente...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ml-2 ${
                    showPatientSearch ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* Lista de pacientes - Sin doble scroll */}
                {showPatientSearch && (
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-slate-200 rounded-lg shadow-xl">
                    {/* Campo de búsqueda fijo */}
                    <div className="p-3 border-b border-slate-200 bg-slate-50">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre o RUT..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Lista scrollable con altura fija */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left p-4 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-slate-800 mb-1">
                              {patient.nombres} {patient.apellidos}
                            </div>
                            <div className="text-sm text-slate-500 flex flex-wrap gap-3">
                              <span className="flex items-center">
                                <span className="font-mono">RUT:</span> {patient.rut}
                              </span>
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {patient.telefono}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-6 text-center text-slate-500">
                          {searchTerm ? (
                            <div>
                              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p>No se encontraron pacientes</p>
                            </div>
                          ) : (
                            <div>
                              <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p>No hay pacientes registrados</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Información del paciente seleccionado */}
              {selectedPatient && (
                <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-cyan-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-slate-600">
                      <Mail className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="truncate">{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Phone className="w-4 h-4 mr-2 text-cyan-500" />
                      <span>{selectedPatient.telefono}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Datos de Paciente Invitado */}
          {patientType === 'guest' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={guestData.name}
                    onChange={(e) => handleGuestDataChange('name', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="Nombre del paciente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={guestData.rut}
                    onChange={(e) => handleGuestDataChange('rut', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => handleGuestDataChange('email', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={guestData.phone}
                    onChange={(e) => handleGuestDataChange('phone', e.target.value)}
                    className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tratamiento/Servicio */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tratamiento *
            </label>
            <select
              value={newAppointment.service}
              onChange={(e) => onChange({ ...newAppointment, service: e.target.value })}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="">Seleccionar tratamiento</option>
              {services.map(service => (
                <option key={service.name} value={service.name}>
                  {service.name} - {service.price} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Horario * (60 min)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map(time => {
                const available = newAppointment.date ?
                  isTimeSlotAvailable(appointments, newAppointment.date, time) : false;
                const isOverlap = newAppointment.date ?
                  hasOverlap(appointments, newAppointment.date, time) : false;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onChange({ ...newAppointment, time })}
                    disabled={!available}
                    className={`
                      p-3 text-sm rounded-lg transition-all border-2 font-medium relative
                      ${newAppointment.time === time
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-lg scale-105'
                        : available
                          ? isOverlap
                            ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {time}
                    </div>
                    {isOverlap && available && (
                      <div className="text-xs leading-tight mt-1 font-semibold">
                        Sobrecupo
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-slate-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-50 border border-slate-200 rounded mr-2"></div>
                Disponible
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-2"></div>
                Sobrecupo
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-slate-100 border border-slate-200 rounded mr-2 opacity-50"></div>
                No disponible
              </div>
            </div>
          </div>

          {/* Descripción/Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={newAppointment.description}
              onChange={(e) => onChange({ ...newAppointment, description: e.target.value })}
              className="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 h-20 resize-none transition-all"
              placeholder="Observaciones, motivo de consulta, etc..."
            />
          </div>
        </div>

        {/* Footer - Sticky en móvil */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={!isFormValid()}
              className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center order-1 sm:order-2 ${
                isFormValid()
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Crear Cita
            </button>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar dropdown en móvil */}
      {showPatientSearch && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setShowPatientSearch(false)}
        />
      )}
    </div>
  );
};