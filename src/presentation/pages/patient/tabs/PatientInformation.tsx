// src/presentation/pages/patient/tabs/PatientInformation.tsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";

interface PatientInformationProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: number) => void;
}

const PatientInformation: React.FC<PatientInformationProps> = ({
  patient,
  onEdit,
  onDelete
}) => {
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex gap-3 justify-center sm:justify-end">
            <button
              onClick={() => onEdit(patient)}
              className="flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
              title="Editar Paciente"
            >
              <Edit className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Editar Paciente</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
                  onDelete(patient.id);
                }
              }}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
              title="Eliminar Paciente"
            >
              <Trash2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Información de contacto */}
        <h4 className="font-semibold text-slate-700 mb-4">Información de contacto</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-500 font-medium mb-2">Email</p>
            <p className="text-sm text-slate-700">{patient.email}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-2">Teléfono</p>
            <p className="text-sm text-slate-700">{patient.telefono}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-2">Dirección</p>
            <p className="text-sm text-slate-700">{patient.direccion}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-2">Ciudad</p>
            <p className="text-sm text-slate-700">{patient.ciudad}</p>
          </div>
        </div>

        {/* Información médica */}
        <div className="mt-6 pt-6 border-t border-cyan-200">
          <h4 className="font-semibold text-slate-700 mb-4">Información Médica</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patient.alergias && (
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">Alergias</p>
                <p className="text-sm text-slate-700">{patient.alergias}</p>
              </div>
            )}

            {patient.medicamentos_actuales && (
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">Medicamentos Actuales</p>
                <p className="text-sm text-slate-700">{patient.medicamentos_actuales}</p>
              </div>
            )}

            {patient.enfermedades_cronicas && (
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">Enfermedades Crónicas</p>
                <p className="text-sm text-slate-700">{patient.enfermedades_cronicas}</p>
              </div>
            )}

            {patient.cirugias_previas && (
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">Cirugías Previas</p>
                <p className="text-sm text-slate-700">{patient.cirugias_previas}</p>
              </div>
            )}

            {patient.hospitalizaciones_previas && (
              <div>
                <p className="text-sm text-slate-500 font-medium mb-2">Hospitalizaciones Previas</p>
                <p className="text-sm text-slate-700">{patient.hospitalizaciones_previas}</p>
              </div>
            )}
          </div>

          {patient.notas_medicas && (
            <div className="mt-4 pt-4 border-t border-cyan-100">
              <p className="text-sm text-slate-500 font-medium mb-2">Notas Médicas</p>
              <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded-lg">{patient.notas_medicas}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { PatientInformation };