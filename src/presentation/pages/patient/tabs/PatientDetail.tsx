// src/presentation/pages/patient/PatientDetail.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calculator, Stethoscope, Clock, FileText, Brain, Settings, LogOut, Pill } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { useLoginMutation } from '@/presentation/hooks';

// Importar los componentes de las pestañas
import { PatientInformation } from './information/PatientInformation';
import { PatientBudget } from './budget/PatientBudget';
import { PatientTreatments } from './treatments/PatientTreatments';
import { PatientAppointments } from './appointments/PatientAppointments';
import { PatientMedicalHistory } from './medicalHistory/PatientMedicalHistory';
import { PatientPrescriptions } from './prescriptions/PatientPrescriptions';
import { ClinicalSummaryModal } from '@/presentation/components/ai-analysis';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useLoginMutation();
  const tabFromUrl = searchParams.get('tab') || 'informacion';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [showAISummaryModal, setShowAISummaryModal] = useState(false);
  const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
  const floatingMenuRef = useRef<HTMLDivElement>(null);

  // Effect para actualizar el tab si cambia el parámetro de la URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'informacion';
    setActiveTab(tabFromUrl);
  }, [searchParams]);

  // Cerrar menú flotante al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (floatingMenuRef.current && !floatingMenuRef.current.contains(event.target as Node)) {
        setIsFloatingMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGoToConfiguration = () => {
    navigate('/dashboard/configuracion');
    setIsFloatingMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsFloatingMenuOpen(false);
  };

  // Configuración de pestañas
  const tabs = [
    { id: 'informacion', label: 'Información', shortLabel: 'Info', icon: User },
    { id: 'presupuesto', label: 'Presupuesto', shortLabel: 'Presup', icon: Calculator },
    { id: 'tratamientos', label: 'Tratamientos', shortLabel: 'Trat', icon: Stethoscope },
    { id: 'citas', label: 'Citas Agendadas', shortLabel: 'Citas', icon: Clock },
    { id: 'recetas', label: 'Recetas Médicas', shortLabel: 'Recetas', icon: Pill },
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
      case 'recetas':
        return <PatientPrescriptions patient={patient} />;
      case 'historial':
        return <PatientMedicalHistory patient={patient} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado con botón de regreso y botón de IA */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-cyan-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a la lista
        </button>

        <button
          onClick={() => setShowAISummaryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
        >
          <Brain className="w-5 h-5" />
          <span className="hidden sm:inline">Análisis de IA</span>
          <span className="sm:hidden">IA</span>
        </button>
      </div>

      {/* Botón flotante de configuración - Solo visible en mobile cuando está en detalle */}
      <div className="md:hidden fixed bottom-6 right-6 z-40" ref={floatingMenuRef}>
        {/* Menú desplegable */}
        {isFloatingMenuOpen && (
          <div className="absolute bottom-16 right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 mb-2 animate-in fade-in-0 zoom-in-95 duration-200">
            <button
              onClick={handleGoToConfiguration}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-cyan-700 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span>Configuración</span>
            </button>

            <div className="my-1 h-px bg-slate-200"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* Botón principal */}
        <button
          onClick={() => setIsFloatingMenuOpen(!isFloatingMenuOpen)}
          className="group w-14 h-14 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110"
        >
          <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Modal de Resumen Clínico con IA */}
      <ClinicalSummaryModal
        isOpen={showAISummaryModal}
        onClose={() => setShowAISummaryModal(false)}
        patientId={patient.id}
        patientName={`${patient.nombres} ${patient.apellidos}`}
      />

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
                    flex items-center px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-cyan-500 text-slate-700 bg-cyan-50'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-cyan-25'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Navigation - Íconos con texto pequeño */}
          <nav className="md:hidden flex justify-around px-1 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 rounded-lg transition-all duration-200 min-w-0
                    ${activeTab === tab.id
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-slate-600 hover:bg-cyan-100 hover:text-cyan-700'
                    }
                  `}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[0.6rem] font-medium leading-tight whitespace-nowrap">
                    {tab.shortLabel}
                  </span>
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