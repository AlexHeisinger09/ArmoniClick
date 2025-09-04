import React, { useState } from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { PatientAppointmentModal } from './PatientAppointmentModal';

interface PatientAppointmentsProps {
  patient: Patient;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patient }) => {
  const [showModal, setShowModal] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);

  // Mock appointments data - reemplazar con datos reales
  const mockAppointments = [
    {
      id: 1,
      fecha: '2024-02-15',
      hora: '10:00',
      servicio: 'Control Ortodóntico',
      estado: 'confirmada',
      descripcion: 'Control mensual de brackets'
    },
    {
      id: 2,
      fecha: '2024-03-15',
      hora: '10:30',
      servicio: 'Ajuste de Alambres',
      estado: 'pendiente',
      descripcion: 'Cambio de alambres de progresión'
    }
  ];

  const handleCreateAppointment = async (appointmentData: any) => {
    setIsCreatingAppointment(true);
    try {
      // Aquí implementarías la lógica para crear la cita
      console.log('Creating appointment:', appointmentData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API call
      setShowModal(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-100 p-2 rounded-full">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">
                Citas Agendadas
              </h3>
              <p className="text-sm text-slate-500">
                {mockAppointments.length} cita{mockAppointments.length !== 1 ? 's' : ''} programada{mockAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* Lista de citas */}
      {mockAppointments.length > 0 ? (
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl border border-cyan-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-slate-800">
                        {appointment.servicio}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.estado === 'confirmada' 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      }`}>
                        {appointment.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-slate-600 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>{new Date(appointment.fecha).toLocaleDateString('es-CL')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                        <span>{appointment.hora}</span>
                      </div>
                    </div>
                    
                    {appointment.descripcion && (
                      <p className="text-sm text-slate-600 mt-2">
                        {appointment.descripcion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-8 sm:p-12 text-center">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">Sin citas agendadas</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            No hay citas programadas para este paciente
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex items-center justify-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-6 py-3 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Programar Primera Cita
          </button>
        </div>
      )}

      {/* Modal de nueva cita */}
      <PatientAppointmentModal
        isOpen={showModal}
        patient={patient}
        appointments={{}} // Pasar datos de citas existentes
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateAppointment}
        isCreating={isCreatingAppointment}
      />
    </div>
  );
};

export { PatientAppointments };