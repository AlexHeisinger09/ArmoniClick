// src/presentation/pages/patient/PatientDetail.tsx
import React, { useState } from 'react';
import { ArrowLeft, User, Calculator, Stethoscope, Clock, FileText } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";

// Importar los componentes de las pestañas
import { PatientInformation } from './PatientInformation';
import { PatientBudget } from './PatientBudget';
import { PatientTreatments } from './PatientTreatments';
import { PatientAppointments } from './PatientAppointments';
import { PatientMedicalHistory } from './PatientMedicalHistory';

interface PatientDetailProps {
  patient: Patient;
  onBack: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patientId: number) => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  onBack,
  onEdit,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState('informacion');

  // Configuración de pestañas
  const tabs = [
    { id: 'informacion', label: 'Información', shortLabel: 'Info', icon: User },
    { id: 'presupuesto', label: 'Presupuesto', shortLabel: 'Presup', icon: Calculator },
    { id: 'tratamientos', label: 'Tratamientos', shortLabel: 'Trat', icon: Stethoscope },
    { id: 'citas', label: 'Citas Agendadas', shortLabel: 'Citas', icon: Clock },
    { id: 'historial', label: 'Historial Médico', shortLabel: 'Hist', icon: FileText },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacion':
        return (
          <PatientInformation
            patient={patient}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      case 'presupuesto':
        return <PatientBudget patient={patient} />;
      case 'tratamientos':
        return <PatientTreatments patient={patient} />;
      case 'citas':
        return <PatientAppointments patient={patient} />;
      case 'historial':
        return <PatientMedicalHistory patient={patient} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón de regreso */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-cyan-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a la lista
        </button>
      </div>

      {/* Pestañas de navegación RESPONSIVE */}
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
        <div className="border-b border-cyan-200">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-cyan-500 text-slate-700 bg-cyan-50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-cyan-25'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Navigation - Solo íconos */}
          <nav className="md:hidden flex justify-around px-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-cyan-500 text-white shadow-lg scale-110'
                      : 'text-slate-600 hover:bg-cyan-100 hover:text-cyan-700 hover:scale-105'
                    }
                  `}
                  title={tab.label}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export { PatientDetail };