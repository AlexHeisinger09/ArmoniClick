// src/presentation/pages/patient/Patient.tsx - COMPLETO CON NAVEGACIÓN Y ALERTAS MÉDICAS
import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  User,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  Info,
} from "lucide-react";

import { NewPatientModal, PatientFormData } from "./NewPatientModal";
import { EditPatientModal, PatientFormData as EditPatientFormData } from "./EditPatientModal";
import { PatientDetail } from "./tabs/PatientDetail";
import { ConfirmationModal } from "@/presentation/components/ui/ConfirmationModal";
import { useNotification } from "@/presentation/hooks/notifications/useNotification";
import { useConfirmation } from "@/presentation/hooks/useConfirmation";

import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/presentation/hooks/patients/usePatients";

import { Patient as PatientType } from "@/core/use-cases/patients";

interface PatientProps {
  doctorId?: number;
}

const PatientsAnimation: React.FC = () => null;

const processApiError = (error: any): string => {
  console.error('Error completo:', error);

  if (!error.response) {
    return `Error: ${error.message || 'No se pudo conectar al servidor'}`;
  }

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

const Patient: React.FC<PatientProps> = ({ doctorId = 1 }) => {
  // ✅ Obtener query params de la URL
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados para vista
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para modales
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientType | null>(null);

  // Notification y confirmation hooks
  const notification = useNotification();
  const confirmation = useConfirmation();

  // Cargar todos los pacientes
  const { queryPatients } = usePatients();
  const { createPatientMutation, isLoadingCreate } = useCreatePatient();
  const { updatePatientMutation, isLoadingUpdate } = useUpdatePatient();
  const { deletePatientMutation, isLoadingDelete } = useDeletePatient();

  const allPatients = queryPatients.data?.patients || [];
  const loading = queryPatients.isLoading;

  // ✅ NUEVO: Effect para detectar ID en URL y mostrar detalle automáticamente
  useEffect(() => {
    const patientIdFromUrl = searchParams.get('id');
    
    if (patientIdFromUrl && allPatients.length > 0) {
      const patientId = parseInt(patientIdFromUrl);
      
      console.log('🔍 Navegando a paciente con ID desde URL:', patientId);
      
      const patient = allPatients.find(p => p.id === patientId);
      
      if (patient) {
        console.log('✅ Paciente encontrado:', {
          id: patient.id,
          nombre: `${patient.nombres} ${patient.apellidos}`
        });
        setSelectedPatient(patient);
        setCurrentView('detail');
        // Limpiar el query param 'id' pero mantener 'tab' si existe
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('id');
        setSearchParams(newSearchParams);
      } else {
        console.log('❌ Paciente no encontrado con ID:', patientId);
        notification.error(
          `No se encontró el paciente con ID ${patientId}`,
          { description: 'Paciente no encontrado' }
        );
      }
    }
  }, [searchParams, allPatients, notification]);

  // FILTRADO LOCAL
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


  // Calcular edad
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
    // ✅ Agregar view=detail a la URL para que el Header se minimice
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', 'detail');
    setSearchParams(newSearchParams);
  };

  const handleBackToGrid = () => {
    setCurrentView('grid');
    setSelectedPatient(null);
    // ✅ Limpiar query params al volver
    searchParams.delete('id');
    searchParams.delete('view');
    setSearchParams(searchParams);
  };

  const handleNewPatient = () => {
    setShowNewPatientModal(true);
  };

  const handleCloseNewPatientModal = () => {
    setShowNewPatientModal(false);
  };

  const handleSubmitNewPatient = async (formData: PatientFormData) => {
    try {
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

      notification.success('Paciente creado exitosamente');
      setShowNewPatientModal(false);

    } catch (error: any) {
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al crear paciente' });
    }
  };

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

      if (selectedPatient && selectedPatient.id === patientId) {
        setCurrentView('grid');
      }

      notification.success('Paciente actualizado exitosamente');
      setShowEditPatientModal(false);
      setPatientToEdit(null);

    } catch (error: any) {
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al actualizar paciente' });
    }
  };

  const handleDeletePatient = async (patientId: number) => {
    const confirmed = await confirmation.confirm({
      title: 'Eliminar paciente',
      message: '¿Estás seguro de que deseas eliminar este paciente?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      details: ['Se eliminará toda la información del paciente', 'Esta acción no se puede deshacer']
    });

    if (!confirmed) {
      confirmation.close();
      return;
    }

    try {
      await deletePatientMutation.mutateAsync(patientId);
      setCurrentView('grid');
      setSelectedPatient(null);
      notification.success('Paciente eliminado exitosamente');
      confirmation.close();
    } catch (error: any) {
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al eliminar paciente' });
      confirmation.close();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-cyan-50 min-h-full flex flex-col">
      <div className="flex-1 p-6">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Información básica del paciente */}
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

              {/* Alertas médicas */}
              {(selectedPatient.alergias || selectedPatient.enfermedades_cronicas || selectedPatient.medicamentos_actuales) && (
                <>
                  {/* Vista Mobile - Alertas unificadas */}
                  <div className="md:hidden">
                    <div className="bg-cyan-500 rounded-lg px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white mb-2">Alertas Médicas</p>
                          <p className="text-xs text-cyan-50 leading-relaxed">
                            {[
                              selectedPatient.alergias,
                              selectedPatient.enfermedades_cronicas,
                              selectedPatient.medicamentos_actuales
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vista Desktop - Alertas separadas */}
                  <div className="hidden md:flex flex-wrap gap-3 md:justify-end">
                    {/* Alergias */}
                    {selectedPatient.alergias && (
                      <div className="bg-cyan-500 rounded-lg px-4 py-3 min-w-[140px]">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white mb-1">Alergias</p>
                            <p className="text-xs text-cyan-50 leading-relaxed border-b border-dashed border-cyan-300 pb-1">
                              {selectedPatient.alergias}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enfermedades Crónicas */}
                    {selectedPatient.enfermedades_cronicas && (
                      <div className="bg-cyan-500 rounded-lg px-4 py-3 min-w-[140px]">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white mb-1">Enfermedades</p>
                            <p className="text-xs text-cyan-50 leading-relaxed border-b border-dashed border-cyan-300 pb-1">
                              {selectedPatient.enfermedades_cronicas}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Medicamentos Actuales */}
                    {selectedPatient.medicamentos_actuales && (
                      <div className="bg-cyan-500 rounded-lg px-4 py-3 min-w-[140px]">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-white mb-1">Medicamentos</p>
                            <p className="text-xs text-cyan-50 leading-relaxed border-b border-dashed border-cyan-300 pb-1">
                              {selectedPatient.medicamentos_actuales}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'grid' ? (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-slate-50 border-b border-cyan-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Nombre Completo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">RUT</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Edad</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Correo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Teléfono</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Ciudad</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-cyan-100">
                      {filteredPatients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <User className="w-12 h-12 text-slate-400 mb-4" />
                              <p className="text-slate-700 text-lg mb-2">
                                {searchTerm ? "No se encontraron pacientes" : "No hay pacientes registrados"}
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
                              <span className="text-sm text-slate-700">{patient.rut}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{calculateAge(patient.fecha_nacimiento)} años</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{patient.email}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{patient.telefono}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-700">{patient.ciudad}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden">
                {filteredPatients.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <User className="w-12 h-12 text-slate-400 mb-4 mx-auto" />
                    <p className="text-slate-700 text-lg">
                      {searchTerm ? "No se encontraron pacientes" : "No hay pacientes"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-cyan-100">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => handlePatientClick(patient)}
                        className="p-4 hover:bg-cyan-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-base font-semibold text-slate-700">
                              {patient.nombres} {patient.apellidos}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {calculateAge(patient.fecha_nacimiento)} años • {patient.rut}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filteredPatients.length > 0 && (
                <div className="px-6 py-4 border-t border-cyan-200 bg-slate-50">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                      {filteredPatients.length} paciente(s)
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg disabled:opacity-50" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg disabled:opacity-50" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
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

        <NewPatientModal
          isOpen={showNewPatientModal}
          onClose={handleCloseNewPatientModal}
          onSubmit={handleSubmitNewPatient}
        />

        <EditPatientModal
          isOpen={showEditPatientModal}
          patient={patientToEdit}
          onClose={handleCloseEditPatientModal}
          onSubmit={handleSubmitEditPatient}
        />

        {/* Modal de confirmación */}
        <ConfirmationModal
          isOpen={confirmation.isOpen}
          title={confirmation.title}
          message={confirmation.message}
          details={confirmation.details}
          confirmText={confirmation.confirmText}
          cancelText={confirmation.cancelText}
          variant={confirmation.variant}
          isLoading={confirmation.isLoading}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
        />
      </div>
    </div>
  );
};

export { Patient };