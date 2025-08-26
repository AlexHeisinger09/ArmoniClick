import React, { useState, useEffect } from 'react';
import { X, User, UserPlus, Search, Clock, Calendar, FileText, Mail, Phone } from 'lucide-react';
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

interface PatientFormData {
  patientId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestRut?: string;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl w-full max-w-md sm:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            Nueva Cita
            {newAppointment.date && (
              <span className="text-sm font-normal text-slate-500 ml-2">
                {newAppointment.date.toLocaleDateString('es-CL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Tipo de Paciente */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Tipo de Paciente
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setPatientType('registered')}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${
                  patientType === 'registered'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <User className="w-5 h-5 mr-2" />
                Paciente Registrado
              </button>
              <button
                type="button"
                onClick={() => setPatientType('guest')}
                className={`flex-1 flex items-center justify-center p-3 rounded-lg border transition-all ${
                  patientType === 'guest'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Paciente Invitado
              </button>
            </div>
          </div>

          {/* Selección de Paciente Registrado */}
          {patientType === 'registered' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Seleccionar Paciente *
              </label>
              
              {/* Campo de búsqueda/selección */}
              <div className="relative">
                <div 
                  className="w-full p-3 border border-slate-300 rounded-lg cursor-pointer flex items-center justify-between hover:border-slate-400 transition-colors"
                  onClick={() => setShowPatientSearch(!showPatientSearch)}
                >
                  <div className="flex items-center">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <span className={selectedPatient ? 'text-slate-800' : 'text-slate-500'}>
                      {selectedPatient ? `${selectedPatient.nombres} ${selectedPatient.apellidos}` : 'Buscar paciente...'}
                    </span>
                  </div>
                  <X className={`w-4 h-4 transition-transform ${showPatientSearch ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown de pacientes */}
                {showPatientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {/* Campo de búsqueda */}
                    <div className="p-3 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre o RUT..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Lista de pacientes */}
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handlePatientSelect(patient)}
                            className="w-full text-left p-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div className="font-medium text-slate-800">
                              {patient.nombres} {patient.apellidos}
                            </div>
                            <div className="text-sm text-slate-500 flex items-center space-x-3 mt-1">
                              <span>RUT: {patient.rut}</span>
                              <span>•</span>
                              <span>{patient.telefono}</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500">
                          {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Información del paciente seleccionado */}
              {selectedPatient && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedPatient.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {selectedPatient.telefono}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={guestData.name}
                    onChange={(e) => handleGuestDataChange('name', e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    placeholder="Nombre del paciente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT
                  </label>
                  <input
                    type="text"
                    value={guestData.rut}
                    onChange={(e) => handleGuestDataChange('rut', e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => handleGuestDataChange('email', e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
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
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
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
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
            >
              <option value="">Seleccionar tratamiento</option>
              {services.map(service => (
                <option key={service.name} value={service.name}>
                  {service.name} - {service.price} ({service.duration} min)
                </option>
              ))}
            </select>
          </div>

          {/* Descripción/Notas */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={newAppointment.description}
              onChange={(e) => onChange({ ...newAppointment, description: e.target.value })}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent h-20 resize-none text-sm"
              placeholder="Observaciones, motivo de consulta, etc..."
            />
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Horario * (60 min)
            </label>
            <div className="grid grid-cols-3 gap-2 border border-slate-300 rounded-lg p-3">
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
                      p-2 text-sm rounded-md transition-all border font-medium
                      ${newAppointment.time === time
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                        : available
                          ? isOverlap
                            ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </div>
                    {isOverlap && available && (
                      <div className="text-[10px] leading-tight mt-0.5">Sobrecupo</div>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Disponible • <span className="text-orange-600 ml-1">Sobrecupo</span> • <span className="text-slate-400 ml-1">No disponible</span>
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={!isFormValid()}
              className="flex-1 px-4 py-3 text-sm font-medium bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Crear Cita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};