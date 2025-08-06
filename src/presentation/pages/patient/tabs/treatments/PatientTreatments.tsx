// src/presentation/pages/patient/tabs/treatments/PatientTreatments.tsx - ACTUALIZADO CON DEPURACIÓN Y MEJOR INVALIDACIÓN
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
//import { useDebugTreatments } from "@/presentation/hooks/treatments/useDebugTreatments";

// Componentes
import { TreatmentsList } from './components/TreatmentsList';
import { BudgetSidebar } from './components/BudgetSidebar';
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

  // ✅ DEPURACIÓN TEMPORAL - REMOVER EN PRODUCCIÓN
  //useDebugTreatments(budgets, budgetTreatments, activeBudget, patient.id);

  // ✅ SELECCIONAR PRESUPUESTO ACTIVO POR DEFECTO
  useEffect(() => {
    if (activeBudget && !selectedBudgetId) {
      console.log(`🎯 Seleccionando presupuesto activo automáticamente: ${activeBudget.id}`);
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

  // ✅ MANEJAR CREACIÓN DE TRATAMIENTO CON LOGGING
  const handleCreateTreatment = async (treatmentData: CreateTreatmentData) => {
    try {
      console.log('🆕 Iniciando creación de tratamiento:', treatmentData);
      
      const response = await createTreatmentMutation.mutateAsync({
        patientId: patient.id,
        treatmentData
      });

      console.log('✅ Tratamiento creado exitosamente:', response);

      setShowNewTreatmentModal(false);
      
      // ✅ MENSAJE MEJORADO según si se vinculó a presupuesto
      const baseMessage = 'Tratamiento creado correctamente';
      const finalMessage = response.budgetItemCreated 
        ? `${baseMessage}. Se agregó al presupuesto y se actualizó el total.`
        : baseMessage;
        
      showNotification('success', 'Éxito', finalMessage);
      
    } catch (error: any) {
      console.error('❌ Error al crear tratamiento:', error);
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al crear tratamiento', errorMessage);
    }
  };

  // ✅ MANEJAR ACTUALIZACIÓN DE TRATAMIENTO CON LOGGING
  const handleUpdateTreatment = async (treatmentId: number, treatmentData: UpdateTreatmentData) => {
    try {
      console.log('🔄 Actualizando tratamiento:', { treatmentId, treatmentData });
      
      await updateTreatmentMutation.mutateAsync({
        treatmentId,
        treatmentData
      });

      console.log('✅ Tratamiento actualizado exitosamente');

      setShowEditTreatmentModal(false);
      setTreatmentToEdit(null);

      if (selectedTreatment && selectedTreatment.id_tratamiento === treatmentId) {
        setShowDetailModal(false);
        setSelectedTreatment(null);
      }

      showNotification('success', 'Éxito', 'Tratamiento actualizado correctamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar tratamiento:', error);
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al actualizar tratamiento', errorMessage);
    }
  };

  // ✅ MANEJAR COMPLETAR TRATAMIENTO CON LOGGING Y CONFIRMACIÓN
  const handleCompleteTreatment = async (treatmentId: number) => {
    const treatment = budgetTreatments.find(t => t.id_tratamiento === treatmentId);
    const confirmMessage = treatment?.budget_item_valor 
      ? `¿Estás seguro de marcar este tratamiento como completado?\n\nSe registrará un avance de $${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')} en el presupuesto.`
      : '¿Estás seguro de marcar este tratamiento como completado?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('✅ Completando tratamiento:', { treatmentId, treatment });
      
      await completeTreatmentMutation.mutateAsync(treatmentId);
      
      console.log('✅ Tratamiento completado exitosamente');

      const successMessage = treatment?.budget_item_valor 
        ? `Tratamiento completado correctamente. Se registró un avance de $${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')} en el presupuesto.`
        : 'Tratamiento completado correctamente';
        
      showNotification('success', 'Éxito', successMessage);
    } catch (error: any) {
      console.error('❌ Error al completar tratamiento:', error);
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
      console.log('🗑️ Eliminando tratamiento:', treatmentId);
      
      await deleteTreatmentMutation.mutateAsync(treatmentId);
      
      console.log('✅ Tratamiento eliminado exitosamente');
      
      setShowDetailModal(false);
      setSelectedTreatment(null);
      showNotification('success', 'Éxito', 'Tratamiento eliminado correctamente');
    } catch (error: any) {
      console.error('❌ Error al eliminar tratamiento:', error);
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

  // Manejar cambio de presupuesto seleccionado
  const handleBudgetChange = (budgetId: number | null) => {
    console.log('🔄 Cambiando presupuesto seleccionado:', { from: selectedBudgetId, to: budgetId });
    setSelectedBudgetId(budgetId);
  };

  // Determinar qué tratamientos mostrar
  const treatments = selectedBudgetId ? budgetTreatments : [];
  const loading = selectedBudgetId ? isLoadingTreatmentsByBudget : false;

  // ✅ LOG DE ESTADO ACTUAL
  useEffect(() => {
    console.log('📊 Estado actual del componente:', {
      patientId: patient.id,
      budgetsCount: budgets.length,
      activeBudgetId: activeBudget?.id,
      selectedBudgetId,
      treatmentsCount: treatments.length,
      isLoadingBudgets,
      isLoadingTreatmentsByBudget
    });
  }, [patient.id, budgets.length, activeBudget?.id, selectedBudgetId, treatments.length, isLoadingBudgets, isLoadingTreatmentsByBudget]);

  return (
    <div className="h-full">
      {/* Layout responsivo: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 treatments-layout">
        {/* Sidebar del presupuesto */}
        <div className="w-full lg:w-80 flex-shrink-0 budget-sidebar">
          <BudgetSidebar
            budgets={budgets}
            activeBudget={activeBudget}
            selectedBudgetId={selectedBudgetId}
            onBudgetChange={handleBudgetChange}
            loading={isLoadingBudgets}
            treatments={treatments}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <TreatmentsList
            treatments={treatments}
            loading={loading}
            selectedBudget={selectedBudgetInfo}
            onView={handleViewTreatment}
            onEdit={handleEditTreatment}
            onComplete={handleCompleteTreatment}
            onDelete={handleDeleteTreatment}
            onNewTreatment={handleNewTreatment}
            isLoadingDelete={isLoadingDelete}
            isLoadingComplete={isLoadingComplete}
            showEmptyState={!selectedBudgetId}
          />
        </div>
      </div>

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
    </div>
  );
};

export { PatientTreatments };