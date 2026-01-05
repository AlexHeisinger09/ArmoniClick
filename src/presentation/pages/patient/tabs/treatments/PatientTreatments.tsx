// src/presentation/pages/patient/tabs/treatments/PatientTreatments.tsx - ACTUALIZADO CON SISTEMA DE EVOLUCIONES
import React, { useState, useEffect } from 'react';
import { Patient } from "@/core/use-cases/patients";
import { Treatment, CreateTreatmentData, UpdateTreatmentData, BudgetSummary, AddSessionData } from "@/core/use-cases/treatments";
import {
  useTreatmentsWithBudgets,
  useTreatmentsByBudgetGrouped,
  useCreateTreatment,
  useUpdateTreatment,
  useDeleteTreatment,
  useCompleteTreatment,
  useAddTreatmentSession
} from "@/presentation/hooks/treatments/useTreatments";
import { useDeleteBudgetItem, useCompleteBudgetItem, useAddBudgetItem } from "@/presentation/hooks/budgets/useBudgets";

// Componentes
import { TreatmentsGroupedList } from './components/TreatmentsGroupedList';
import { BudgetCarousel } from './components/BudgetCarousel';
import { NewTreatmentModal } from './modals/NewTreatmentModal';
import { AddBudgetItemModal } from './modals/AddBudgetItemModal';
import { EditTreatmentModal } from './modals/EditTreatmentModal';
import { TreatmentDetailModal } from './modals/TreatmentDetailModal';
import { AddSessionModal } from './modals/AddSessionModal';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';

interface PatientTreatmentsProps {
  patient: Patient;
}

const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ patient }) => {
  // Estados para modales
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);
  const [showAddBudgetItemModal, setShowAddBudgetItemModal] = useState(false);
  const [showEditTreatmentModal, setShowEditTreatmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [treatmentToEdit, setTreatmentToEdit] = useState<Treatment | null>(null);
  const [sessionBudgetItemId, setSessionBudgetItemId] = useState<number | null>(null);
  const [sessionServiceName, setSessionServiceName] = useState<string>('');

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

  // ✅ Hook para budget_items AGRUPADOS con tratamientos
  const {
    budgetItems,
    groupedTreatments,
    budget: selectedBudgetInfo,
    isLoadingTreatmentsByBudget
  } = useTreatmentsByBudgetGrouped(selectedBudgetId || 0, !!selectedBudgetId);

  // ✅ Crear lista plana de todos los treatments para búsquedas
  const budgetTreatments = budgetItems.flatMap(item => item.treatments);

  // Hooks para operaciones
  const { createTreatmentMutation, isLoadingCreate } = useCreateTreatment();
  const { updateTreatmentMutation, isLoadingUpdate } = useUpdateTreatment();
  const { deleteTreatmentMutation, isLoadingDelete } = useDeleteTreatment();
  const { addBudgetItemMutation, isLoadingAddItem } = useAddBudgetItem();
  const { deleteBudgetItemMutation, isLoadingDeleteItem } = useDeleteBudgetItem();
  const { completeBudgetItemMutation, isLoadingCompleteItem } = useCompleteBudgetItem();
  const { completeTreatmentMutation, isLoadingComplete } = useCompleteTreatment(patient.id);
  const { addSessionMutation, isLoadingAddSession } = useAddTreatmentSession(patient.id);

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
      console.log('✅ Completando tratamiento:', { treatmentId, treatment, patientId: patient.id });

      await completeTreatmentMutation.mutateAsync({
        treatmentId,
        patientId: patient.id
      });

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

  // ✅ NUEVO: Manejar eliminación de budget_item (elimina todas las sesiones en cascada)
  const handleDeleteBudgetItem = async (budgetItemId: number) => {
    // Buscar el budget_item en budgetItems
    const budgetItem = budgetItems.find(item => item.id === budgetItemId);

    const details: string[] = [
      'Esta acción no se puede deshacer',
      'Se eliminarán todas las sesiones asociadas a este item'
    ];

    if (budgetItem?.valor) {
      const valor = parseFloat(budgetItem.valor);
      details.unshift(
        `Se eliminará el item del presupuesto (valor: $${valor.toLocaleString('es-CL')})`,
        'Se recalculará automáticamente el total del presupuesto'
      );
    }

    const confirmed = await confirmation.confirm({
      title: 'Eliminar item del presupuesto',
      message: '¿Estás seguro de que deseas eliminar este item del presupuesto y todas sus sesiones?',
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
      console.log('🗑️ Eliminando budget_item y sesiones:', { budgetItemId, budgetItem });

      const result = await deleteBudgetItemMutation.mutateAsync(budgetItemId);

      console.log('✅ Budget item eliminado exitosamente:', result);

      setShowDetailModal(false);
      setSelectedTreatment(null);

      notification.success(
        `Item eliminado correctamente. Se eliminaron ${result.deletedTreatments} sesión(es) y se recalculó el total del presupuesto.`
      );
      confirmation.close();

    } catch (error: any) {
      console.error('❌ Error al eliminar budget item:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al eliminar item del presupuesto' });
      confirmation.close();
    }
  };

  // ✅ NUEVO: Completar budget_item (marca sesiones como completadas y suma ingresos)
  const handleCompleteBudgetItem = async (budgetItemId: number) => {
    const budgetItem = budgetItems.find(item => item.id === budgetItemId);
    const confirmed = await confirmation.confirm({
      title: 'Completar tratamiento',
      message: '¿Deseas marcar este item como completado?',
      details: budgetItem?.valor ? [`Valor: $${parseFloat(budgetItem.valor).toLocaleString('es-CL')}`, 'Se sumará a los ingresos del mes'] : [],
      confirmText: 'Completar',
      cancelText: 'Cancelar',
      variant: 'success',
    });
    if (!confirmed) { confirmation.close(); return; }
    try {
      await completeBudgetItemMutation.mutateAsync(budgetItemId);
      notification.success('Item completado correctamente');
      confirmation.close();
    } catch (error: any) {
      notification.error(processApiError(error));
      confirmation.close();
    }
  };

  // ✅ NUEVO: Agregar budget_item al presupuesto activo
  const handleAddBudgetItem = async (data: { pieza?: string; accion: string; valor: number }) => {
    if (!selectedBudgetId) {
      notification.error('No hay presupuesto seleccionado');
      return;
    }

    try {
      console.log('🆕 Agregando budget item:', { budgetId: selectedBudgetId, data });

      await addBudgetItemMutation.mutateAsync({
        budgetId: selectedBudgetId,
        data
      });

      console.log('✅ Budget item agregado exitosamente');

      setShowAddBudgetItemModal(false);
      notification.success('Tratamiento agregado al presupuesto correctamente');

    } catch (error: any) {
      console.error('❌ Error al agregar budget item:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al agregar tratamiento' });
    }
  };

  // Manejar eliminación de tratamiento (para compatibilidad con código existente)
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

  // ✅ ACTUALIZADO: Función para abrir modal de detalles (recibe ID)
  const handleViewTreatment = (treatmentId: number) => {
    const treatment = budgetTreatments.find(t => t.id_tratamiento === treatmentId);
    if (treatment) {
      setSelectedTreatment(treatment);
      setShowDetailModal(true);
    }
  };

  // ✅ ACTUALIZADO: Función para editar tratamiento (recibe ID)
  const handleEditTreatment = (treatmentId: number) => {
    const treatment = budgetTreatments.find(t => t.id_tratamiento === treatmentId);
    if (treatment) {
      setTreatmentToEdit(treatment);
      setShowEditTreatmentModal(true);
    }
  };

  // ✅ ACTUALIZADO: Función para abrir modal de nuevo tratamiento (ahora AddBudgetItemModal)
  const handleNewTreatment = () => {
    setShowAddBudgetItemModal(true);
  };

  // ✅ NUEVO: Función para abrir modal de agregar sesión
  const handleAddSession = (budgetItemId: number) => {
    console.log('🔍 Abriendo modal para agregar sesión:', {
      budgetItemId,
      selectedBudgetId,
      groupedTreatmentsCount: groupedTreatments.length,
      budgetItemsCount: budgetItems.length
    });

    const group = groupedTreatments.find(g => g.budget_item_id === budgetItemId);

    if (!group) {
      console.error('❌ No se encontró el grupo con budget_item_id:', budgetItemId);
      notification.error('Error: No se encontró el item del presupuesto', {
        description: 'Por favor intenta de nuevo'
      });
      return;
    }

    // ✅ Verificar que el budget_item existe en budgetItems
    const budgetItem = budgetItems.find(item => item.id === budgetItemId);
    if (!budgetItem) {
      console.error('❌ Budget item no encontrado en budgetItems:', {
        searchingFor: budgetItemId,
        availableIds: budgetItems.map(item => item.id)
      });
      notification.error('Error: Item del presupuesto no disponible', {
        description: 'Intenta refrescar la página'
      });
      return;
    }

    console.log('✅ Budget item encontrado:', {
      id: budgetItem.id,
      accion: budgetItem.accion,
      pieza: budgetItem.pieza,
      status: budgetItem.status,
      hasTreatments: group.hasTreatments,
      sessionsCount: group.totalSessions
    });

    setSessionBudgetItemId(budgetItemId);
    setSessionServiceName(group.mainTreatment.nombre_servicio);
    setShowAddSessionModal(true);
  };

  // ✅ NUEVO: Función para crear una nueva sesión
  const handleCreateSession = async (sessionData: AddSessionData) => {
    try {
      console.log('📝 Creando nueva sesión:', {
        patientId: patient.id,
        sessionData,
        budgetItemIdInSession: sessionData.budget_item_id,
        selectedBudgetId
      });

      // ✅ Verificar una última vez que el budget_item_id existe
      const budgetItem = budgetItems.find(item => item.id === sessionData.budget_item_id);
      if (!budgetItem) {
        console.error('❌ CRÍTICO: budget_item_id no existe al momento de crear sesión:', {
          searchingFor: sessionData.budget_item_id,
          availableIds: budgetItems.map(item => item.id),
          budgetItemsRaw: budgetItems
        });
        throw new Error(`Item del presupuesto (ID: ${sessionData.budget_item_id}) no encontrado. Los datos pueden estar desactualizados.`);
      }

      console.log('✅ Verificación exitosa, procediendo a crear sesión...');

      await addSessionMutation.mutateAsync({
        patientId: patient.id,
        sessionData,
      });

      console.log('✅ Sesión creada exitosamente');
      notification.success('Sesión registrada exitosamente');
      setShowAddSessionModal(false);
      setSessionBudgetItemId(null);
      setSessionServiceName('');

    } catch (error: any) {
      console.error('❌ Error al agregar sesión:', error);
      const errorMessage = processApiError(error);
      notification.error(errorMessage, { description: 'Error al agregar sesión' });
    }
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

  const handleCloseAddSessionModal = () => {
    setShowAddSessionModal(false);
    setSessionBudgetItemId(null);
    setSessionServiceName('');
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
            budgetItems={budgetItems}
          />
        </div>

        {/* Contenido principal - ✅ Ahora con tratamientos agrupados */}
        <div className="flex-1 min-w-0">
          <TreatmentsGroupedList
            groupedTreatments={groupedTreatments}
            loading={loading}
            selectedBudget={selectedBudgetInfo}
            onView={handleViewTreatment}
            onEdit={handleEditTreatment}
            onComplete={handleCompleteTreatment}
            onCompleteBudgetItem={handleCompleteBudgetItem}
            onDelete={handleDeleteTreatment}
            onDeleteBudgetItem={handleDeleteBudgetItem}
            onAddSession={handleAddSession}
            onNewTreatment={handleNewTreatment}
            isLoadingDelete={isLoadingDelete}
            isLoadingDeleteItem={isLoadingDeleteItem}
            isLoadingComplete={isLoadingComplete}
            isLoadingCompleteItem={isLoadingCompleteItem}
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

      {/* ✅ NUEVO: Modal para agregar budget item (tratamiento al presupuesto) */}
      <AddBudgetItemModal
        isOpen={showAddBudgetItemModal}
        budgetId={selectedBudgetId || 0}
        onClose={() => setShowAddBudgetItemModal(false)}
        onSubmit={handleAddBudgetItem}
        isLoading={isLoadingAddItem}
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
        onEdit={(treatment) => handleEditTreatment(treatment.id_tratamiento)}
        onComplete={handleCompleteTreatment}
        onDelete={handleDeleteTreatment}
        canComplete={selectedTreatment?.status === 'pending'}
      />

      {/* Modal para agregar sesión/evolución */}
      <AddSessionModal
        isOpen={showAddSessionModal}
        onClose={handleCloseAddSessionModal}
        onSubmit={handleCreateSession}
        budgetItemId={sessionBudgetItemId || 0}
        serviceName={sessionServiceName}
        isLoading={isLoadingAddSession}
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