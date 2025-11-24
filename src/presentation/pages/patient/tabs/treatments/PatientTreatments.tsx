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
import { BudgetCarousel } from './components/BudgetCarousel';
import { NewTreatmentModal } from './modals/NewTreatmentModal';
import { EditTreatmentModal } from './modals/EditTreatmentModal';
import { TreatmentDetailModal } from './modals/TreatmentDetailModal';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';

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

  // Notification y confirmation hooks
  const notification = useNotification();
  const confirmation = useConfirmation();

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

  // Función para procesar errores de API
  const processApiError = (error: any): string => {
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

      notification.success(finalMessage);

    } catch (error: any) {
      console.error('❌ Error al crear tratamiento:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al crear tratamiento' });
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

      notification.success('Tratamiento actualizado correctamente');
    } catch (error: any) {
      console.error('❌ Error al actualizar tratamiento:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al actualizar tratamiento' });
    }
  };

  // ✅ MANEJAR COMPLETAR TRATAMIENTO CON LOGGING Y CONFIRMACIÓN
  const handleCompleteTreatment = async (treatmentId: number) => {
    const treatment = budgetTreatments.find(t => t.id_tratamiento === treatmentId);

    const details = treatment?.budget_item_valor
      ? [`Se registrará un avance de $${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')} en el presupuesto.`]
      : [];

    const confirmed = await confirmation.confirm({
      title: '¿Marcar como completado?',
      message: '¿Estás seguro de marcar este tratamiento como completado?',
      confirmText: 'Completar',
      cancelText: 'Cancelar',
      variant: 'success',
      details
    });

    if (!confirmed) {
      confirmation.close();
      return;
    }

    try {
      console.log('✅ Completando tratamiento:', { treatmentId, treatment });

      await completeTreatmentMutation.mutateAsync(treatmentId);

      console.log('✅ Tratamiento completado exitosamente');

      const successMessage = treatment?.budget_item_valor
        ? `Tratamiento completado correctamente. Se registró un avance de $${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')} en el presupuesto.`
        : 'Tratamiento completado correctamente';

      notification.success(successMessage);
      confirmation.close();
    } catch (error: any) {
      console.error('❌ Error al completar tratamiento:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al completar tratamiento' });
      confirmation.close();
    }
  };

  // Manejar eliminación de tratamiento
  const handleDeleteTreatment = async (treatmentId: number) => {
    const treatment = budgetTreatments.find(t => t.id_tratamiento === treatmentId);

    const details: string[] = ['Esta acción no se puede deshacer'];

    if (treatment?.budget_item_valor) {
      const valor = parseFloat(treatment.budget_item_valor);
      details.unshift(
        `Se eliminará el item del presupuesto (valor: $${valor.toLocaleString('es-CL')})`,
        'Se recalculará automáticamente el total del presupuesto'
      );
    }

    const confirmed = await confirmation.confirm({
      title: 'Eliminar tratamiento',
      message: '¿Estás seguro de que deseas eliminar este tratamiento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      details
    });

    if (!confirmed) {
      confirmation.close();
      return;
    }

    try {
      console.log('🗑️ Eliminando tratamiento completo:', { treatmentId, treatment });

      await deleteTreatmentMutation.mutateAsync(treatmentId);

      console.log('✅ Tratamiento y budget item eliminados exitosamente');

      setShowDetailModal(false);
      setSelectedTreatment(null);

      // ✅ MENSAJE DE ÉXITO MÁS INFORMATIVO
      const successMessage = treatment?.budget_item_valor
        ? `Tratamiento eliminado correctamente. Se eliminó el item del presupuesto y se recalculó el total automáticamente.`
        : 'Tratamiento eliminado correctamente';

      notification.success(successMessage);
      confirmation.close();

    } catch (error: any) {
      console.error('❌ Error al eliminar tratamiento completo:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al eliminar tratamiento' });
      confirmation.close();
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
      {/* Layout responsivo: Carrusel + Main Content */}
      <div className="flex flex-col lg:flex-row h-full gap-4 lg:gap-6 treatments-layout">
        {/* Carrusel de presupuestos activos */}
        <div className="w-full lg:w-96 flex-shrink-0 budget-carousel">
          <BudgetCarousel
            budgets={budgets}
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
  );
};

export { PatientTreatments };