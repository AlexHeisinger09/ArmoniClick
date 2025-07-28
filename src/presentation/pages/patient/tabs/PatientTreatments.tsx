// src/presentation/pages/patient/tabs/PatientTreatments.tsx
import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";

interface Treatment {
  id: number;
  nombre: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: 'activo' | 'completado' | 'pausado';
  descripcion: string;
}

interface PatientTreatmentsProps {
  patient: Patient;
}

const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ patient }) => {
  // Mock data - replace with real data from your API
  const mockTreatments: Treatment[] = [
    {
      id: 1,
      nombre: "Ortodoncia",
      fecha_inicio: "2024-01-15",
      fecha_fin: "2025-01-15",
      estado: 'activo',
      descripcion: "Tratamiento de ortodoncia con brackets metálicos"
    },
    {
      id: 2,
      nombre: "Blanqueamiento Dental",
      fecha_inicio: "2024-02-01",
      fecha_fin: "2024-03-01",
      estado: 'completado',
      descripcion: "Blanqueamiento dental profesional en consultorio"
    },
    {
      id: 3,
      nombre: "Limpieza Dental",
      fecha_inicio: "2024-06-15",
      estado: 'activo',
      descripcion: "Profilaxis dental y destartraje"
    }
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'completado':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-700">
          Tratamientos del Paciente
        </h3>
        <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tratamiento
        </button>
      </div>

      <div className="space-y-4">
        {mockTreatments.map((treatment) => (
          <div key={treatment.id} className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-slate-700 text-lg">
                {treatment.nombre}
              </h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(treatment.estado)}`}>
                {treatment.estado}
              </span>
            </div>
            <p className="text-slate-500 mb-3">
              {treatment.descripcion}
            </p>
            <div className="flex items-center text-sm text-slate-500">
              <Calendar className="w-4 h-4 mr-2" />
              Inicio: {formatDate(treatment.fecha_inicio)}
              {treatment.fecha_fin && (
                <span className="ml-4">
                  • Fin: {formatDate(treatment.fecha_fin)}
                </span>
              )}
            </div>
          </div>
        ))}

        {mockTreatments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">No hay tratamientos registrados para este paciente</p>
            <button className="mt-4 flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Tratamiento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { PatientTreatments };