// src/presentation/pages/patient/tabs/treatments/PatientTreatments.tsx - ACTUALIZADO CON SELECTOR DE PRESUPUESTOS
import React, { useState, useEffect } from 'react';
import { Patient } from "@/core/use-cases/patients";
import { Treatment, CreateTreatmentData, UpdateTreatmentData, BudgetSummary } from "@/core/use-cases/treatments";
import { 
  useTreatmentsWithBudgets,
  useTreatmentsByBudget,
  useCreateTreatment, 
  useUpdateTreatment,
  useDeleteTreatment,
  useCompleteTreatment
} from "@/presentation/hooks/treatments/useTreatments";

// Componentes
import { TreatmentsList } from './components/TreatmentsList';
import { BudgetSelector } from './components/BudgetSelector';
import { NewTreatmentModal } from './modals/NewTreatmentModal';
import { EditTreatmentModal } from './modals/EditTreatmentModal';
import { TreatmentDetailModal } from './modals/TreatmentDetailModal';
import { Notification } from './shared/Notification';

interface PatientTreatmentsProps {
  patient: Patient;
}

const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ patient }) => {
  // Estados para modales
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);
  const [showEditTreatmentModal, setShowEditTreatmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment | null>(null);
  
  // Estados para presupuestos
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  
  // Estados para notificaciones
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Hooks principales
  const {
    budgets,
    activeBudget,
    isLoadingBudgets,
    errorBudgets
  } = useTreatmentsWithBudgets(patient.id);

  // Hook para tratamientos por presupuesto (cuando hay presupuesto seleccionado)
  const {
    treatments: budgetTreatments,
    budget: selectedBudgetInfo,
    isLoadingTreatmentsByBudget
  } = useTreatmentsByBudget(selectedBudgetId || 0, !!selectedBudgetId);

  // Hooks para operaciones
  const { createTreatmentMutation, isLoadingCreate } = useCreateTreatment();
  const { updateTreatmentMutation, isLoadingUpdate } = useUpdateTreatment();
  const { deleteTreatmentMutation, isLoadingDelete } = useDeleteTreatment();
  const { completeTreatmentMutation, isLoadingComplete } = useCompleteTreatment();

  // ✅ SELECCIONAR PRESUPUESTO ACTIVO POR DEFECTO
  useEffect(() => {
    if (activeBudget && !selectedBudgetId) {
      setSelectedBudgetId(activeBudget.id);
    }
  }, [activeBudget, selectedBudgetId]);

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

  // Manejar actualización de tratamiento
  const handleUpdateTreatment = async (treatmentId: number, treatmentData: UpdateTreatmentData) => {
    try {
      await updateTreatmentMutation.mutateAsync({
        treatmentId,
        treatmentData
      });
      
      setShowEditTreatmentModal(false);
      setTreatmentToEdit(null);
      
      // Si el tratamiento está siendo visualizado, cerrar el modal de detalles
      if (selectedTreatment && selectedTreatment.id_tratamiento === treatmentId) {
        setShowDetailModal(false);
        setSelectedTreatment(null);
      }
      
      showNotification('success', 'Éxito', 'Tratamiento actualizado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al actualizar tratamiento', errorMessage);
    }
  };

  // ✅ NUEVO: Manejar completar tratamiento
  const handleCompleteTreatment = async (treatmentId: number) => {
    if (!window.confirm('¿Estás seguro de marcar este tratamiento como completado?')) {
      return;
    }

    try {
      await completeTreatmentMutation.mutateAsync(treatmentId);
      showNotification('success', 'Éxito', 'Tratamiento completado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al completar tratamiento', errorMessage);
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

  // Función para editar tratamiento
  const handleEditTreatment = (treatment: Treatment) => {
    setTreatmentToEdit(treatment);
    setShowEditTreatmentModal(true);
  };

  // Función para abrir modal de nuevo tratamiento
  const handleNewTreatment = () => {
    setShowNewTreatmentModal(true);
  };

  // Funciones para cerrar modales
  const handleCloseNewModal = () => {
    setShowNewTreatmentModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditTreatmentModal(false);
    setTreatmentToEdit(null);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTreatment(null);
  };

  // ✅ MANEJAR CAMBIO DE PRESUPUESTO SELECCIONADO
  const handleBudgetChange = (budgetId: number | null) => {
    setSelectedBudgetId(budgetId);
  };

  // Determinar qué tratamientos mostrar
  const treatments = selectedBudgetId ? budgetTreatments : [];
  const loading = selectedBudgetId ? isLoadingTreatmentsByBudget : false;

  return (
    <>
      {/* ✅ SELECTOR DE PRESUPUESTOS */}
      <BudgetSelector
        budgets={budgets}
        selectedBudgetId={selectedBudgetId}
        activeBudgetId={activeBudget?.id || null}
        onBudgetChange={handleBudgetChange}
        loading={isLoadingBudgets}
      />

      {/* LISTA DE TRATAMIENTOS */}
      <TreatmentsList
        treatments={treatments}
        loading={loading}
        onView={handleViewTreatment}
        onEdit={handleEditTreatment}
        onComplete={handleCompleteTreatment}
        onDelete={handleDeleteTreatment}
        onNewTreatment={handleNewTreatment}
        isLoadingDelete={isLoadingDelete}
        isLoadingComplete={isLoadingComplete}
        showEmptyState={!selectedBudgetId}
      />

      {/* Modal para nuevo tratamiento */}
      <NewTreatmentModal
        isOpen={showNewTreatmentModal}
        patientId={patient.id}
        selectedBudgetId={selectedBudgetId}
        budgets={budgets}
        onClose={handleCloseNewModal}
        onSubmit={handleCreateTreatment}
        isLoading={isLoadingCreate}
      />

      {/* Modal para editar tratamiento */}
      <EditTreatmentModal
        isOpen={showEditTreatmentModal}
        treatment={treatmentToEdit}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateTreatment}
        isLoading={isLoadingUpdate}
      />

      {/* Modal para ver detalles del tratamiento */}
      <TreatmentDetailModal
        isOpen={showDetailModal}
        treatment={selectedTreatment}
        onClose={handleCloseDetailModal}
        onEdit={handleEditTreatment}
        onComplete={handleCompleteTreatment}
        onDelete={handleDeleteTreatment}
        canComplete={selectedTreatment?.status === 'pending'}
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