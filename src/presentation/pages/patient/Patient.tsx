// src/presentation/pages/patient/Patient.tsx - REFACTORIZADO
import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
  Heart,
  Stethoscope
} from "lucide-react";

import { NewPatientModal, PatientFormData } from "./NewPatientModal";
import { EditPatientModal, PatientFormData as EditPatientFormData } from "./EditPatientModal";
import { PatientDetail } from "./tabs/PatientDetail";

// IMPORTAR LOS HOOKS
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/presentation/hooks/patients/usePatients";

// USAR LA INTERFACE REAL DEL BACKEND
import { Patient as PatientType } from "@/core/use-cases/patients";

interface PatientProps {
  doctorId?: number;
}

// Componente para mostrar notificaciones de error/éxito
interface NotificationProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-auto`}>
      <div className={`p-4 rounded-lg border shadow-lg ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {title}
            </p>
            <p className="mt-1 text-sm">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente sin animación
const PatientsAnimation: React.FC = () => null;

// Función utilitaria para procesar errores de API
const processApiError = (error: any): string => {
  console.error('Error completo:', error);

  // Si es un error de red o no hay respuesta
  if (!error.response) {
    return `Error de conexión: ${error.message || 'No se pudo conectar al servidor'}`;
  }

  // Si hay respuesta del servidor
  const status = error.response?.status;
  const data = error.response?.data;

  let errorMessage = `Error ${status}`;

  if (data) {
    if (typeof data === 'string') {
      errorMessage += `: ${data}`;
    } else if (data.message) {
      errorMessage += `: ${data.message}`;
      if (data.error) {
        errorMessage += ` (Detalle: ${data.error})`;
      }
    } else if (data.error) {
      errorMessage += `: ${data.error}`;
    } else {
      errorMessage += `: ${JSON.stringify(data)}`;
    }
  }

  return errorMessage;
};

// Componente principal Patient
const Patient: React.FC<PatientProps> = ({ doctorId = 1 }) => {
  // Estados para vista
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientType | null>(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Cargar todos los pacientes sin filtro de búsqueda
  const { queryPatients } = usePatients();
  const { createPatientMutation, isLoadingCreate } = useCreatePatient();
  const { updatePatientMutation, isLoadingUpdate } = useUpdatePatient();
  const { deletePatientMutation, isLoadingDelete } = useDeletePatient();

  // Obtener datos de la query
  const allPatients = queryPatients.data?.patients || [];
  const loading = queryPatients.isLoading;

  // FILTRADO LOCAL: Usar useMemo para filtrar los pacientes en el frontend
  const filteredPatients = useMemo(() => {
    if (!searchTerm.trim()) {
      return allPatients;
    }

    const lowercaseSearch = searchTerm.toLowerCase().trim();
    
    return allPatients.filter(patient => {
      const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
      const nombres = patient.nombres.toLowerCase();
      const apellidos = patient.apellidos.toLowerCase();
      
      return (
        fullName.includes(lowercaseSearch) ||
        nombres.includes(lowercaseSearch) ||
        apellidos.includes(lowercaseSearch)
      );
    });
  }, [allPatients, searchTerm]);

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Funciones utilitarias
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

  // Manejadores de eventos
  const handlePatientClick = (patient: PatientType) => {
    setSelectedPatient(patient);
    setCurrentView('detail');
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedPatient(null);
  };

  // Manejadores para el modal de nuevo paciente
  const handleNewPatient = () => {
    setShowNewPatientModal(true);
  };

  const handleCloseNewPatientModal = () => {
    setShowNewPatientModal(false);
  };

  const handleSubmitNewPatient = async (formData: PatientFormData) => {
    try {
      console.log('Enviando datos del paciente:', formData);

      await createPatientMutation.mutateAsync({
        rut: formData.rut,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fecha_nacimiento: formData.fecha_nacimiento,
        telefono: formData.telefono,
        email: formData.email,
        direccion: formData.direccion,
        ciudad: formData.ciudad,
        codigo_postal: formData.codigo_postal,
        alergias: formData.alergias,
        medicamentos_actuales: formData.medicamentos_actuales,
        enfermedades_cronicas: formData.enfermedades_cronicas,
        cirugias_previas: formData.cirugias_previas,
        hospitalizaciones_previas: formData.hospitalizaciones_previas,
        notas_medicas: formData.notas_medicas,
      });

      showNotification('success', 'Éxito', 'Paciente creado exitosamente');
      setShowNewPatientModal(false);

    } catch (error: any) {
      console.error('Error al crear paciente:', error);
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al crear paciente', errorMessage);
    }
  };

  // Manejadores para el modal de editar paciente
  const handleEditPatient = (patient: PatientType) => {
    setPatientToEdit(patient);
    setShowEditPatientModal(true);
  };

  const handleCloseEditPatientModal = () => {
    setShowEditPatientModal(false);
    setPatientToEdit(null);
  };

  const handleSubmitEditPatient = async (patientId: number, formData: EditPatientFormData) => {
    try {
      console.log('Actualizando paciente:', patientId, formData);

      await updatePatientMutation.mutateAsync({
        patientId,
        patientData: {
          rut: formData.rut,
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          fecha_nacimiento: formData.fecha_nacimiento,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          codigo_postal: formData.codigo_postal,
          alergias: formData.alergias,
          medicamentos_actuales: formData.medicamentos_actuales,
          enfermedades_cronicas: formData.enfermedades_cronicas,
          cirugias_previas: formData.cirugias_previas,
          hospitalizaciones_previas: formData.hospitalizaciones_previas,
          notas_medicas: formData.notas_medicas,
        },
      });

      // Si el paciente está siendo visualizado, actualizarlo
      if (selectedPatient && selectedPatient.id === patientId) {
        setCurrentView('grid');
      }

      showNotification('success', 'Éxito', 'Paciente actualizado exitosamente');
      setShowEditPatientModal(false);
      setPatientToEdit(null);

    } catch (error: any) {
      console.error('Error al actualizar paciente:', error);
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al actualizar paciente', errorMessage);
    }
  };

  // Manejador para eliminar paciente
  const handleDeletePatient = async (patientId: number) => {
    try {
      console.log('Eliminando paciente:', patientId);

      await deletePatientMutation.mutateAsync(patientId);

      setCurrentView('grid');
      setSelectedPatient(null);

      showNotification('success', 'Éxito', 'Paciente eliminado exitosamente');

    } catch (error: any) {
      console.error('Error al eliminar paciente:', error);
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al eliminar paciente', errorMessage);
    }
  };

  // Render condicional para loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-full flex flex-col">
      {/* Componente de notificación */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex-1 p-6">
        {/* Barra de búsqueda y acciones - Solo en vista de grid */}
        {currentView === 'grid' && (
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
            <div className="flex items-stretch gap-4 mb-4">
              <PatientsAnimation />
              <div className="flex-1">
                <h3 className="font-medium text-slate-700 sm:text-lg">
                  Gestión de Pacientes
                </h3>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre del paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleNewPatient}
                disabled={isLoadingCreate}
                className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus className="w-5 h-5 mr-2" />
                {isLoadingCreate ? 'Creando...' : 'Nuevo Paciente'}
              </button>
            </div>
            
            {/* Indicador de resultados de búsqueda */}
            {searchTerm && (
              <div className="mt-3 text-sm text-slate-600">
                {filteredPatients.length === 0 ? (
                  <span className="text-orange-600">
                    No se encontraron pacientes con "{searchTerm}"
                  </span>
                ) : (
                  <span>
                    Mostrando {filteredPatients.length} de {allPatients.length} pacientes
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        {currentView === 'detail' && selectedPatient && (
          <div className="bg-white border border-cyan-200 rounded-xl px-6 py-4 mb-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Información del paciente - Lado izquierdo */}
              <div className="flex items-center space-x-4 min-w-0">
                <div className="bg-cyan-100 w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-cyan-700 font-bold text-lg">
                    {selectedPatient.nombres?.[0]?.toUpperCase() || ''}{selectedPatient.apellidos?.[0]?.toUpperCase() || ''}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xl font-bold text-slate-700 truncate">
                    {selectedPatient.nombres} {selectedPatient.apellidos}
                  </h4>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
                      {selectedPatient.rut} • {calculateAge(selectedPatient.fecha_nacimiento)} años
                    </span>
                  </div>
                </div>
              </div>

              {/* Alertas médicas destacadas - Lado derecho */}
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                {/* Alergias */}
                <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 border-l-4 ${
                  (selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas") 
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`rounded-full p-1 ${
                    (selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas") 
                      ? 'bg-red-500' 
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm min-w-0">
                    <span className={`font-semibold ${
                      (selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas") 
                        ? 'text-red-800' 
                        : 'text-gray-600'
                    }`}>
                      Alergias
                    </span>
                    <div className={`text-xs truncate max-w-24 ${
                      (selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas") 
                        ? 'text-red-700 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {(selectedPatient.alergias && selectedPatient.alergias !== "Sin alergias conocidas") ? 
                        selectedPatient.alergias : "No"}
                    </div>
                  </div>
                </div>

                {/* Enfermedades */}
                <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 border-l-4 ${
                  (selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas") 
                    ? 'bg-orange-50 border-orange-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`rounded-full p-1 ${
                    (selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas") 
                      ? 'bg-orange-500' 
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm min-w-0">
                    <span className={`font-semibold ${
                      (selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas") 
                        ? 'text-orange-800' 
                        : 'text-gray-600'
                    }`}>
                      Enfermedades
                    </span>
                    <div className={`text-xs truncate max-w-24 ${
                      (selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas") 
                        ? 'text-orange-700 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {(selectedPatient.enfermedades_cronicas && selectedPatient.enfermedades_cronicas !== "Sin enfermedades crónicas") ? 
                        selectedPatient.enfermedades_cronicas : "No"}
                    </div>
                  </div>
                </div>

                {/* Medicamentos */}
                <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 border-l-4 ${
                  (selectedPatient.medicamentos_actuales && selectedPatient.medicamentos_actuales !== "Sin medicamentos") 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`rounded-full p-1 ${
                    (selectedPatient.medicamentos_actuales && selectedPatient.medicamentos_actuales !== "Sin medicamentos") 
                      ? 'bg-blue-500' 
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm min-w-0">
                    <span className={`font-semibold ${
                      (selectedPatient.medicamentos_actuales && selectedPatient.medicamentos_actuales !== "Sin medicamentos") 
                        ? 'text-blue-800' 
                        : 'text-gray-600'
                    }`}>
                      Medicamentos
                    </span>
                    <div className={`text-xs truncate max-w-24 ${
                      (selectedPatient.medicamentos_actuales && selectedPatient.medicamentos_actuales !== "Sin medicamentos") 
                        ? 'text-blue-700 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {(selectedPatient.medicamentos_actuales && selectedPatient.medicamentos_actuales !== "Sin medicamentos") ? 
                        selectedPatient.medicamentos_actuales : "No"}
                    </div>
                  </div>
                </div>

                {/* Notas Médicas / Observaciones */}
                <div className={`flex items-center space-x-2 rounded-lg px-3 py-2 border-l-4 ${
                  (selectedPatient.notas_medicas && selectedPatient.notas_medicas.trim() !== "") 
                    ? 'bg-purple-50 border-purple-500' 
                    : 'bg-gray-50 border-gray-300'
                }`}>
                  <div className={`rounded-full p-1 ${
                    (selectedPatient.notas_medicas && selectedPatient.notas_medicas.trim() !== "") 
                      ? 'bg-purple-500' 
                      : 'bg-gray-400'
                  }`}>
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm min-w-0">
                    <span className={`font-semibold ${
                      (selectedPatient.notas_medicas && selectedPatient.notas_medicas.trim() !== "") 
                        ? 'text-purple-800' 
                        : 'text-gray-600'
                    }`}>
                      Observaciones
                    </span>
                    <div className={`text-xs truncate max-w-24 ${
                      (selectedPatient.notas_medicas && selectedPatient.notas_medicas.trim() !== "") 
                        ? 'text-purple-700 font-medium' 
                        : 'text-gray-500'
                    }`}>
                      {(selectedPatient.notas_medicas && selectedPatient.notas_medicas.trim() !== "") ? 
                        selectedPatient.notas_medicas : "No"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido dinámico */}
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'grid' ? (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
              {/* Vista Desktop - Tabla */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-slate-50 border-b border-cyan-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Nombre Completo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          RUT
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Edad
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Correo
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Ciudad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-cyan-100">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <User className="w-12 h-12 text-slate-400 mb-4" />
                              <p className="text-slate-700 text-lg mb-2">
                                {searchTerm
                                  ? "No se encontraron pacientes con ese nombre"
                                  : "No hay pacientes registrados"}
                              </p>
                              <p className="text-slate-500 text-sm">
                                {searchTerm
                                  ? "Intenta con otro término de búsqueda"
                                  : "Comienza agregando un nuevo paciente"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPatients.map((patient) => (
                          <tr
                            key={patient.id}
                            onClick={() => handlePatientClick(patient)}
                            className="hover:bg-cyan-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-700">
                                {patient.nombres} {patient.apellidos}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {patient.rut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {calculateAge(patient.fecha_nacimiento)} años
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {patient.email}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {patient.telefono}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">
                                {patient.ciudad}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vista Mobile - Cards */}
              <div className="md:hidden">
                {filteredPatients.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <User className="w-12 h-12 text-slate-400 mb-4" />
                      <p className="text-slate-700 text-lg mb-2">
                        {searchTerm
                          ? "No se encontraron pacientes con ese nombre"
                          : "No hay pacientes registrados"}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {searchTerm
                          ? "Intenta con otro término de búsqueda"
                          : "Comienza agregando un nuevo paciente"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-cyan-100">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientClick(patient)}
                        className="p-4 hover:bg-cyan-50 transition-colors cursor-pointer active:bg-cyan-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-700 mb-1">
                              {patient.nombres} {patient.apellidos}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {calculateAge(patient.fecha_nacimiento)} años • RUT: {patient.rut}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="truncate">{patient.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span>{patient.telefono}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></div>
                            <span className="truncate">{patient.direccion}, {patient.ciudad}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Paginación */}
              {filteredPatients.length > 0 && (
                <div className="px-4 md:px-6 py-4 border-t border-cyan-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {filteredPatients.length} paciente(s) {searchTerm ? 'filtrado(s)' : 'encontrado(s)'}
                    </div>
                    <div className="flex space-x-1 md:space-x-2">
                      <button
                        className="px-2 md:px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        className="px-2 md:px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        disabled
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Vista de detalle del paciente */
            selectedPatient && (
              <PatientDetail
                patient={selectedPatient}
                onBack={handleBackToGrid}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            )
          )}
        </div>

        {/* Modal de Nuevo Paciente */}
        <NewPatientModal
          isOpen={showNewPatientModal}
          onClose={handleCloseNewPatientModal}
          onSubmit={handleSubmitNewPatient}
        />

        {/* Modal de Editar Paciente */}
        <EditPatientModal
          isOpen={showEditPatientModal}
          patient={patientToEdit}
          onClose={handleCloseEditPatientModal}
          onSubmit={handleSubmitEditPatient}
        />
      </div>
    </div>
  );
};

export { Patient };