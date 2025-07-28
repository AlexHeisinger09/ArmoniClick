// src/presentation/pages/patient/tabs/PatientAppointments.tsx
import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";

interface Appointment {
  id: number;
  fecha: string;
  hora: string;
  tipo: string;
  estado: 'programada' | 'completada' | 'cancelada';
  notas?: string;
}

interface PatientAppointmentsProps {
  patient: Patient;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patient }) => {
  // Mock data - replace with real data from your API
  const mockAppointments: Appointment[] = [
    {
      id: 1,
      fecha: "2024-07-30",
      hora: "10:00",
      tipo: "Control Ortodóntico",
      estado: 'programada'
    },
    {
      id: 2,
      fecha: "2024-07-15",
      hora: "14:30",
      tipo: "Limpieza Dental",
      estado: 'completada',
      notas: "Paciente muestra buena higiene oral"
    },
    {
      id: 3,
      fecha: "2024-08-05",
      hora: "09:00",
      tipo: "Consulta de Seguimiento",
      estado: 'programada'
    },
    {
      id: 4,
      fecha: "2024-06-20",
      hora: "16:00",
      tipo: "Evaluación Inicial",
      estado: 'cancelada',
      notas: "Paciente canceló por enfermedad"
    }
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada':
        return 'bg-green-100 text-green-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedAppointments = mockAppointments.sort((a, b) => {
    const dateA = new Date(`${a.fecha}T${a.hora}`);
    const dateB = new Date(`${b.fecha}T${b.hora}`);
    return dateB.getTime() - dateA.getTime(); // Más recientes primero
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-700">
          Citas Programadas
        </h3>
        <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      <div className="space-y-4">
        {sortedAppointments.map((appointment) => (
          <div key={appointment.id} className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-slate-700 text-lg">
                  {appointment.tipo}
                </h4>
                <div className="flex items-center text-slate-500 mt-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(appointment.fecha)} • {appointment.hora}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}>
                {appointment.estado}
              </span>
            </div>
            {appointment.notas && (
              <p className="text-slate-500 text-sm bg-slate-50 p-3 rounded-lg">
                <span className="font-medium">Notas:</span> {appointment.notas}
              </p>
            )}
          </div>
        ))}

        {sortedAppointments.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No hay citas programadas para este paciente</p>
            <p className="text-slate-400 text-sm mb-4">Programa la primera cita para comenzar el tratamiento</p>
            <button className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Programar Primera Cita
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { PatientAppointments };