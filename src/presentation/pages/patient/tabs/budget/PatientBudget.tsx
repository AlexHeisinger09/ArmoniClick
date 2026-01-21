// src/presentation/pages/patient/tabs/budget/PatientBudget.tsx - CON VISTAS EN LA MISMA PÁGINA
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { Budget, BudgetItem, BUDGET_TYPE, BudgetUtils } from "@/core/use-cases/budgets";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";

// Componentes
import { BudgetsList } from './components/BudgetList';
import { BudgetEditor } from './components/BudgetEditor';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { PDFGenerator } from './utils/pdfGenerator';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';
import { BudgetFormData, BudgetFormUtils } from './types/budget.types';

// Hooks para datos del doctor
import { useLoginMutation, useProfile } from "@/presentation/hooks";

interface PatientBudgetProps {
    patient: Patient;
}

const PatientBudget: React.FC<PatientBudgetProps> = ({ patient }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Estado de vista actual
    const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>('list');
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

    // Estados del formulario del editor
    const [items, setItems] = useState<BudgetItem[]>([]);
    const [budgetType, setBudgetType] = useState<string>(BUDGET_TYPE.ODONTOLOGICO);
    const [newItem, setNewItem] = useState<BudgetFormData>({
        pieza: '',
        accion: '',
        valor: ''
    });
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<BudgetFormData>({
        pieza: '',
        accion: '',
        valor: ''
    });
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Hooks para presupuestos
    const {
        sortedBudgets,
        isLoadingAll,
        activateBudget,
        completeBudget,
        revertBudget,
        deleteBudget,
        saveBudget,
        isLoadingActivate,
        isLoadingComplete,
        isLoadingRevert,
        isLoadingDelete,
        isLoadingSave,
    } = useMultipleBudgetOperations(patient.id);

    // Hook para datos del doctor (para PDF)
    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    // Notification y confirmation hooks
    const notification = useNotification();
    const confirmation = useConfirmation();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

    // ✅ FUNCIONES DE NAVEGACIÓN
    const handleCreateNewBudget = () => {
        setSelectedBudget(null);
        setItems([]);
        setBudgetType(BUDGET_TYPE.ODONTOLOGICO);
        setHasUnsavedChanges(false);
        setCurrentView('create');
    };

    const handleEditBudget = (budget: Budget) => {
        setSelectedBudget(budget);
        setItems(budget.items.map(item => ({
            ...item,
            valor: parseFloat(item.valor.toString())
        })));
        setBudgetType(budget.budget_type);
        setHasUnsavedChanges(false);
        setCurrentView('edit');
    };

    const handleViewBudget = (budget: Budget) => {
        setSelectedBudget(budget);
        setItems(budget.items.map(item => ({
            ...item,
            valor: parseFloat(item.valor.toString())
        })));
        setBudgetType(budget.budget_type);
        setCurrentView('view');
    };

    const handleBackToList = async () => {
        if (hasUnsavedChanges) {
            const confirmed = await confirmation.confirm({
                title: 'Cambios sin guardar',
                message: '¿Estás seguro de que quieres volver? Los cambios no guardados se perderán.',
                confirmText: 'Volver',
                cancelText: 'Continuar editando',
                variant: 'warning'
            });

            if (!confirmed) {
                confirmation.close();
                return;
            }
            confirmation.close();
        }

        setCurrentView('list');
        setSelectedBudget(null);
        setItems([]);
        setHasUnsavedChanges(false);
        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
        setNewItem({ pieza: '', accion: '', valor: '' });
    };

    // ✅ FUNCIONES DEL EDITOR
    const markAsChanged = () => setHasUnsavedChanges(true);

    const handleAddItem = (customData?: { pieza?: string; accion?: string; valor?: string }) => {
        // Usar datos personalizados si se proveen, sino usar newItem del estado
        const itemToValidate = customData || newItem;

        // Debug: Mostrar datos antes de validar
        console.log('Datos a validar:', itemToValidate);
        console.log('Custom data:', customData);
        console.log('newItem state:', newItem);

        const validation = BudgetFormUtils.validateItem(itemToValidate);
        if (validation) {
            console.error('Error de validación:', validation);
            notification.error(validation);
            return;
        }

        const valor = BudgetFormUtils.parseValue(itemToValidate.valor);
        const item: BudgetItem = {
            pieza: itemToValidate.pieza,
            accion: itemToValidate.accion,
            valor: valor,
            orden: items.length
        };

        setItems([...items, item]);

        // Si se usaron datos personalizados (desde FacialAesthetic), no actualizar newItem
        // Si se usó newItem del estado (odontológico), limpiar pieza pero mantener servicio y valor
        if (!customData) {
            setNewItem({ pieza: '', accion: newItem.accion, valor: newItem.valor });
        }

        markAsChanged();
        notification.success('Tratamiento agregado exitosamente');
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        markAsChanged();
        notification.success('Tratamiento eliminado');
    };

    const handleStartEditing = (index: number) => {
        const item = items[index];
        setIsEditing(index.toString());
        setEditingItem({
            pieza: item.pieza || '',
            accion: item.accion,
            valor: item.valor.toString()
        });
    };

    const handleCancelEditing = () => {
        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
    };

    const handleSaveEditing = () => {
        const validation = BudgetFormUtils.validateItem(editingItem);
        if (validation) {
            notification.error(validation);
            return;
        }

        const index = parseInt(isEditing!);
        const valor = BudgetFormUtils.parseValue(editingItem.valor);

        setItems(items.map((item, i) =>
            i === index
                ? {
                    ...item,
                    pieza: editingItem.pieza,
                    accion: editingItem.accion,
                    valor: valor
                }
                : item
        ));

        setIsEditing(null);
        setEditingItem({ pieza: '', accion: '', valor: '' });
        markAsChanged();
        notification.success('Tratamiento actualizado');
    };

    const handleBudgetTypeChange = (type: string) => {
        setBudgetType(type);
        markAsChanged();
    };

    const handleNewItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        console.log(`Cambiando ${field} a:`, value);
        setNewItem(prev => {
            const updated = { ...prev, [field]: value };
            console.log('newItem actualizado:', updated);
            return updated;
        });
    };

    const handleEditingItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveBudget = async () => {
        if (!items || items.length === 0) {
            notification.error('Agrega al menos un tratamiento antes de guardar');
            return;
        }

        try {
            const formattedItems = items.map((item, index) => {
                const formattedItem: any = {
                    pieza: item.pieza || '',
                    accion: item.accion || '',
                    valor: Number(item.valor) || 0,
                    orden: index
                };

                if (item.id && typeof item.id === 'number' && item.id > 0) {
                    formattedItem.id = item.id;
                }

                return formattedItem;
            });

            const budgetData = {
                patientId: patient.id,
                budgetType,
                items: formattedItems
            };

            await saveBudget(budgetData);
            setHasUnsavedChanges(false);
            notification.success('Presupuesto guardado exitosamente');

            // Volver a la lista después de guardar
            setTimeout(() => {
                setCurrentView('list');
                setSelectedBudget(null);
                setItems([]);
            }, 1500);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido al guardar';
            notification.error(`Error al guardar: ${errorMessage}`);
        }
    };

    const handleExportPDFFromEditor = async () => {
        if (items.length === 0) {
            notification.error('No hay tratamientos para exportar');
            return;
        }

        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature,
                logo: queryProfile.data.logo,
                profession: queryProfile.data.profession,
                specialty: queryProfile.data.specialty
            } : undefined;

            // Crear objeto temporal del presupuesto para PDF
            const tempBudget: Budget = selectedBudget || {
                id: 0,
                patient_id: patient.id,
                user_id: 0,
                total_amount: BudgetFormUtils.calculateTotal(items).toString(),
                status: 'borrador',
                budget_type: budgetType,
                created_at: new Date().toISOString(),
                updated_at: null,
                items: items.map(item => ({
                    ...item,
                    valor: typeof item.valor === 'string' ? parseFloat(item.valor) : item.valor
                }))
            };

            await PDFGenerator.generateBudgetPDF(tempBudget, patient, doctorData);
            notification.success('PDF generado exitosamente');

        } catch (error: any) {
            const errorMessage = error.message || 'Error al generar PDF';
            notification.error(errorMessage);
        }
    };

    // ✅ OPERACIONES DE PRESUPUESTO
    const handleActivateBudget = async (budget: Budget) => {
        const treatmentDetails = budget.items.map((item: any) =>
            `${item.pieza ? `${item.pieza}: ` : ''}${item.accion} ($${parseFloat(item.valor).toLocaleString('es-CL')})`
        );

        const confirmed = await confirmation.confirm({
            title: 'Activar presupuesto',
            message: `Se activará este presupuesto y se crearán los tratamientos siguientes:`,
            confirmText: 'Activar',
            cancelText: 'Cancelar',
            variant: 'success',
            details: treatmentDetails
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await activateBudget(budget.id);
            notification.success('Presupuesto activado exitosamente');
            confirmation.close();
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
            confirmation.close();
        }
    };

    const handleCompleteBudget = async (budget: Budget) => {
        const details = [
            'Asegúrate de completar todos los tratamientos antes de marcar el presupuesto como completado.',
            'Se marcará el presupuesto como completado'
        ];

        const confirmed = await confirmation.confirm({
            title: 'Completar presupuesto',
            message: '¿Desea completar este presupuesto aun si los tratamientos no están completados?',
            confirmText: 'Completar',
            cancelText: 'Cancelar',
            variant: 'warning',
            details: details
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await completeBudget(budget.id);
            notification.success('Presupuesto completado exitosamente');
            confirmation.close();
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
            confirmation.close();
        }
    };

    const handleRevertBudget = async (budget: Budget) => {
        try {
            await revertBudget(budget.id);
            notification.success('Presupuesto revertido a borrador');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        const confirmed = await confirmation.confirm({
            title: 'Eliminar presupuesto',
            message: '¿Estás seguro de que deseas eliminar este presupuesto?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            variant: 'danger',
            details: ['Esta acción no se puede deshacer']
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await deleteBudget(budget.id);
            notification.success('Presupuesto eliminado exitosamente');
            confirmation.close();
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
            confirmation.close();
        }
    };

    const handleExportPDF = async (budget: Budget) => {
        setIsGeneratingPDF(true);

        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature,
                logo: queryProfile.data.logo,
                profession: queryProfile.data.profession,
                specialty: queryProfile.data.specialty
            } : undefined;

            await PDFGenerator.generateBudgetPDF(budget, patient, doctorData);
            notification.success('PDF generado exitosamente');

        } catch (error: any) {
            const errorMessage = error.message || 'Error al generar PDF';
            notification.error(errorMessage);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ✅ NUEVO: Callback para navegar a la pestaña de tratamientos con el presupuesto seleccionado
    const handleNavigateToTreatments = (budget: Budget) => {
        // Cambiar a la pestaña de tratamientos y pasar el budgetId en la URL
        searchParams.set('tab', 'tratamientos');
        searchParams.set('budgetId', budget.id.toString());
        setSearchParams(searchParams);
    };

    const showEditor = currentView !== 'list';
    const canEdit = currentView !== 'view' && (!selectedBudget || BudgetUtils.canModify(selectedBudget));

    // Vista: Crear/Editar presupuesto
    if (showEditor) {
        return (
            <div className="space-y-4">
                {/* Botón de regreso */}
                <button
                    onClick={handleBackToList}
                    className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm font-medium"
                >
                    <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                    Volver a presupuestos
                </button>

                {/* Editor de presupuesto */}
                <BudgetEditor
                    patient={patient}
                    budget={selectedBudget}
                    items={items}
                    budgetType={budgetType}
                    newItem={newItem}
                    editingItem={editingItem}
                    isEditing={isEditing}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isLoadingSave={isLoadingSave}
                    onBack={handleBackToList}
                    onSave={handleSaveBudget}
                    onBudgetTypeChange={handleBudgetTypeChange}
                    onAddItem={handleAddItem}
                    onDeleteItem={handleDeleteItem}
                    onStartEditing={handleStartEditing}
                    onCancelEditing={handleCancelEditing}
                    onSaveEditing={handleSaveEditing}
                    onNewItemChange={handleNewItemChange}
                    onEditingItemChange={handleEditingItemChange}
                    onExportPDF={handleExportPDFFromEditor}
                />

                {/* Footer con botones de acción */}
                {canEdit && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={handleBackToList}
                                className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveBudget}
                                disabled={isLoadingSave || !hasUnsavedChanges || items.length === 0}
                                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {isLoadingSave ? 'Guardando...' : 'Guardar Presupuesto'}
                            </button>
                        </div>
                    </div>
                )}

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
    }

    // Vista: Lista de presupuestos (por defecto)
    return (
        <>
            <BudgetsList
                budgets={sortedBudgets}
                loading={isLoadingAll}
                onView={handleViewBudget}
                onEdit={handleEditBudget}
                onActivate={handleActivateBudget}
                onComplete={handleCompleteBudget}
                onRevert={handleRevertBudget}
                onDelete={handleDeleteBudget}
                onExportPDF={handleExportPDF}
                onNewBudget={handleCreateNewBudget}
                onCardClick={handleNavigateToTreatments}
                isLoadingActivate={isLoadingActivate}
                isLoadingComplete={isLoadingComplete}
                isLoadingRevert={isLoadingRevert}
                isLoadingDelete={isLoadingDelete}
            />

            {/* Indicador de generación de PDF */}
            {isGeneratingPDF && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Generando PDF</h3>
                                <p className="text-sm text-gray-500">Por favor espera...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
        </>
    );
};

export { PatientBudget };
