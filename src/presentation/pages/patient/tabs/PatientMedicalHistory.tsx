// src/presentation/pages/patient/tabs/PatientMedicalHistory.tsx
import React from 'react';
import { Plus, FileText, Stethoscope, Activity, Calendar } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";

interface MedicalRecord {
  id: number;
  fecha: string;
  tipo: string;
  descripcion: string;
  medico: string;
  categoria: 'consulta' | 'examen' | 'tratamiento' | 'cirugia' | 'diagnostico';
}

interface PatientMedicalHistoryProps {
  patient: Patient;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patient }) => {
  // Mock data - replace with real data from your API
  const mockMedicalRecords: MedicalRecord[] = [
    {
      id: 1,
      fecha: "2024-07-20",
      tipo: "Consulta de Control",
      descripcion: "Control rutinario. Paciente presenta evolución favorable en tratamiento de ortodoncia. Se observa buena higiene oral.",
      medico: "Dra. García",
      categoria: 'consulta'
    },
    {
      id: 2,
      fecha: "2024-06-15",
      tipo: "Radiografía Panorámica",
      descripcion: "Radiografía de control para evaluar progreso de tratamiento ortodóntico. Sin anomalías detectadas.",
      medico: "Dr. Martínez",
      categoria: 'examen'
    },
    {
      id: 3,
      fecha: "2024-05-20",
      tipo: "Ajuste de Brackets",
      descripcion: "Ajuste mensual de brackets. Cambio de ligaduras. Progreso satisfactorio en el movimiento dental.",
      medico: "Dra. García",
      categoria: 'tratamiento'
    },
    {
      id: 4,
      fecha: "2024-04-10",
      tipo: "Limpieza Dental",
      descripcion: "Profilaxis dental completa. Destartraje supragingival. Se recomienda mejorar técnica de cepillado.",
      medico: "Higienista López",
      categoria: 'tratamiento'
    },
    {
      id: 5,
      fecha: "2024-01-15",
      tipo: "Diagnóstico Inicial",
      descripcion: "Evaluación ortodóntica inicial. Apiñamiento dental severo. Plan de tratamiento con brackets convencionales.",
      medico: "Dra. García",
      categoria: 'diagnostico'
    }
  ];

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'consulta':
        return 'border-blue-500 bg-blue-50';
      case 'examen':
        return 'border-purple-500 bg-purple-50';
      case 'tratamiento':
        return 'border-green-500 bg-green-50';
      case 'cirugia':
        return 'border-red-500 bg-red-50';
      case 'diagnostico':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'consulta':
        return <Stethoscope className="w-5 h-5 text-blue-600" />;
      case 'examen':
        return <Activity className="w-5 h-5 text-purple-600" />;
      case 'tratamiento':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'cirugia':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'diagnostico':
        return <FileText className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const sortedRecords = mockMedicalRecords.sort((a, b) => {
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-700">
          Historial Médico
        </h3>
        <button className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Registro
        </button>
      </div>

      <div className="space-y-4">
        {sortedRecords.map((record) => (
          <div 
            key={record.id} 
            className={`border-l-4 pl-4 py-4 pr-4 hover:bg-opacity-50 transition-colors rounded-r-lg ${getCategoryColor(record.categoria)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(record.categoria)}
                <div>
                  <h4 className="font-medium text-slate-700 text-lg">
                    {record.tipo}
                  </h4>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(record.fecha)}
                    <span className="mx-2">•</span>
                    <span className="font-medium">{record.medico}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full border">
                {record.categoria}
              </span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              {record.descripcion}
            </p>
          </div>
        ))}

        {sortedRecords.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No hay registros médicos para este paciente</p>
            <p className="text-slate-400 text-sm mb-4">Comienza agregando el primer registro del historial médico</p>
            <button className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Registro
            </button>
          </div>
        )}
      </div>

      {/* Resumen del historial */}
      {sortedRecords.length > 0 && (
        <div className="mt-6 pt-6 border-t border-cyan-200">
          <h4 className="font-medium text-slate-700 mb-3">Resumen del Historial</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['consulta', 'examen', 'tratamiento', 'cirugia', 'diagnostico'].map((categoria) => {
              const count = sortedRecords.filter(record => record.categoria === categoria).length;
              return (
                <div key={categoria} className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-center mb-1">
                    {getCategoryIcon(categoria)}
                  </div>
                  <p className="text-lg font-semibold text-slate-700">{count}</p>
                  <p className="text-xs text-slate-500 capitalize">{categoria}s</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { PatientMedicalHistory };