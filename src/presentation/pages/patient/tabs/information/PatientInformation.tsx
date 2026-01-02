// src/presentation/pages/patient/tabs/PatientInformation.tsx
import React from 'react';
import { Edit, Trash2, Phone } from 'lucide-react';
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
              onClick={() => onDelete(patient.id)}
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
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-700">{patient.telefono}</p>
              <div className="flex gap-2">
                <a
                  href={`tel:${patient.telefono}`}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Llamar"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${patient.telefono.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                  title="Enviar mensaje por WhatsApp"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
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

        {/* Antecedentes médicos */}
        <div className="mt-6 pt-6 border-t border-cyan-200">
          <h4 className="font-semibold text-slate-700 mb-4">Antecedentes médicos</h4>

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