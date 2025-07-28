// src/presentation/pages/patient/tabs/treatments/PatientTreatments.tsx
import React, { useState } from 'react';
import { Patient } from "@/core/use-cases/patients";
import { Treatment, CreateTreatmentData } from "@/core/use-cases/treatments";
import { 
  useTreatments, 
  useCreateTreatment, 
  useDeleteTreatment 
} from "@/presentation/hooks/treatments/useTreatments";

// Componentes
import { TreatmentsList } from './components/TreatmentsList';
import { NewTreatmentModal } from './modals/NewTreatmentModal';
import { TreatmentDetailModal } from './modals/TreatmentDetailModal';
import { Notification } from './shared/Notification';

interface PatientTreatmentsProps {
  patient: Patient;
}

const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ patient }) => {
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Hooks para tratamientos
  const { queryTreatments } = useTreatments(patient.id);
  const { createTreatmentMutation, isLoadingCreate } = useCreateTreatment();
  const { deleteTreatmentMutation, isLoadingDelete } = useDeleteTreatment();

  const treatments = queryTreatments.data?.treatments || [];
  const loading = queryTreatments.isLoading;

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Función para procesar errores de API
  const processApiError = (error: any): string => {
    if (!error.response) {
      return `Error de conexión: ${error.message || 'No se pudo conectar al servidor'}`;
    }

    const status = error.response?.status;
    const data = error.response?.data;

    let errorMessage = `Error ${status}`;

    if (data) {
      if (typeof data === 'string') {
        errorMessage += `: ${data}`;
      } else if (data.message) {
        errorMessage += `: ${data.message}`;
      } else {
        errorMessage += `: ${JSON.stringify(data)}`;
      }
    }

    return errorMessage;
  };

  // Manejar creación de tratamiento
  const handleCreateTreatment = async (treatmentData: CreateTreatmentData) => {
    try {
      await createTreatmentMutation.mutateAsync({
        patientId: patient.id,
        treatmentData
      });
      
      setShowNewTreatmentModal(false);
      showNotification('success', 'Éxito', 'Tratamiento creado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al crear tratamiento', errorMessage);
    }
  };

  // Manejar eliminación de tratamiento
  const handleDeleteTreatment = async (treatmentId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteTreatmentMutation.mutateAsync(treatmentId);
      setShowDetailModal(false);
      setSelectedTreatment(null);
      showNotification('success', 'Éxito', 'Tratamiento eliminado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al eliminar tratamiento', errorMessage);
    }
  };

  // Función para abrir modal de detalles
  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowDetailModal(true);
  };

  // Función para editar tratamiento (placeholder)
  const handleEditTreatment = (treatment: Treatment) => {
    // TODO: Implementar modal de edición
    showNotification('info', 'Funcionalidad en desarrollo', 'La edición de tratamientos estará disponible próximamente');
  };

  // Función para abrir modal de nuevo tratamiento
  const handleNewTreatment = () => {
    setShowNewTreatmentModal(true);
  };

  return (
    <>
      <TreatmentsList
        treatments={treatments}
        loading={loading}
        onView={handleViewTreatment}
        onEdit={handleEditTreatment}
        onDelete={handleDeleteTreatment}
        onNewTreatment={handleNewTreatment}
        isLoadingDelete={isLoadingDelete}
      />

      {/* Modal para nuevo tratamiento */}
      <NewTreatmentModal
        isOpen={showNewTreatmentModal}
        patientId={patient.id}
        onClose={() => setShowNewTreatmentModal(false)}
        onSubmit={handleCreateTreatment}
        isLoading={isLoadingCreate}
      />

      {/* Modal para ver detalles del tratamiento */}
      <TreatmentDetailModal
        isOpen={showDetailModal}
        treatment={selectedTreatment}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTreatment(null);
        }}
        onEdit={handleEditTreatment}
        onDelete={handleDeleteTreatment}
      />

      {/* Notificaciones */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export { PatientTreatments };