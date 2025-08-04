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
        {/* Encabezado con título y botones de acción */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-700">
            Datos Personales
          </h3>

          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(patient)}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              title="Editar Paciente"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
                  onDelete(patient.id);
                }
              }}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar Paciente"
            >
              <Trash2 className="w-4 h-4" />
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

        {/* Información médica adicional */}
        <div className="mt-6 pt-6 border-t border-cyan-200">
          <h4 className="font-semibold text-slate-700 mb-4">Información Médica Adicional</h4>

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