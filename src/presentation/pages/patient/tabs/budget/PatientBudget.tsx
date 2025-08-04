// src/presentation/pages/patient/tabs/budget/PatientBudget.tsx - CON GENERACIÓN DE PDF
import React, { useState, useEffect } from 'react';
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";
import { 
    BudgetItem, 
    Budget,
    BUDGET_TYPE, 
    BudgetUtils 
} from "@/core/use-cases/budgets";

// Importar todos los componentes modulares
import { Notification } from './components/Notification';
import { BudgetList } from './components/BudgetList';
import { BudgetEditor } from './components/BudgetEditor';

// Importar tipos y utilidades
import { 
    PatientBudgetProps, 
    BudgetFormData,
    BudgetFormUtils 
} from './types/budget.types';

// ✅ IMPORTAR EL GENERADOR DE PDF
import { PDFGenerator } from './utils/pdfGenerator';

const PatientBudget: React.FC<PatientBudgetProps> = ({ patient }) => {
    // Hooks para presupuestos múltiples
    const {
        budgets,
        sortedBudgets,
        activeBudget,
        isLoadingAll,
        isLoadingActive,
        saveBudget,
        activateBudget,
        completeBudget,
        revertBudget,
        deleteBudget,
        isLoadingSave,
        isLoadingActivate,
        isLoadingComplete,
        isLoadingRevert,
        isLoadingDelete,
    } = useMultipleBudgetOperations(patient.id);

    // Estados para la UI
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
    const [showBudgetEditor, setShowBudgetEditor] = useState(false);
    const [showBudgetList, setShowBudgetList] = useState(true);
    
    // Estados del formulario
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
    
    // Estados de notificación y guardado
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false); // ✅ NUEVO ESTADO

    // Hook para datos del doctor
    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    // Cargar datos del presupuesto seleccionado para edición
    useEffect(() => {
        if (selectedBudget && showBudgetEditor) {
            const formattedItems = selectedBudget.items?.map(item => ({
                id: item.id,
                budget_id: item.budget_id,
                pieza: item.pieza || '',
                accion: item.accion,
                valor: parseFloat(item.valor.toString()) || 0,
                orden: item.orden || 0,
                created_at: item.created_at
            })) || [];

            setItems(formattedItems);
            setBudgetType(selectedBudget.budget_type);
            setHasUnsavedChanges(false);
        }
    }, [selectedBudget, showBudgetEditor]);

    // ✅ FUNCIONES DE NAVEGACIÓN

    const handleCreateNewBudget = () => {
        setSelectedBudget(null);
        setItems([]);
        setBudgetType(BUDGET_TYPE.ODONTOLOGICO);
        setShowBudgetEditor(true);
        setShowBudgetList(false);
        setHasUnsavedChanges(false);
    };

    const handleEditBudget = (budget: Budget) => {
        if (!BudgetUtils.canModify(budget)) {
            showNotification('error', 'Solo se pueden editar presupuestos en estado borrador');
            return;
        }
        setSelectedBudget(budget);
        setShowBudgetEditor(true);
        setShowBudgetList(false);
    };

    const handleViewBudget = (budget: Budget) => {
        setSelectedBudget(budget);
        setItems(budget.items.map(item => ({
            ...item,
            valor: parseFloat(item.valor.toString())
        })));
        setBudgetType(budget.budget_type);
        setShowBudgetEditor(true);
        setShowBudgetList(false);
        setHasUnsavedChanges(false);
    };

    const handleBackToList = () => {
        if (hasUnsavedChanges) {
            if (!window.confirm('Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
                return;
            }
        }
        setShowBudgetEditor(false);
        setShowBudgetList(true);
        setSelectedBudget(null);
        setItems([]);
        setHasUnsavedChanges(false);
    };

    // ✅ FUNCIONES DE OPERACIONES DE PRESUPUESTO

    const handleActivateBudget = async (budget: Budget) => {
        try {
            await activateBudget(budget.id);
            showNotification('success', 'Presupuesto activado exitosamente');
        } catch (error: any) {
            const errorMessage = error?.message || 'Error al activar presupuesto';
            showNotification('error', errorMessage);
        }
    };

    const handleCompleteBudget = async (budget: Budget) => {
        try {
            await completeBudget(budget.id);
            showNotification('success', 'Presupuesto completado exitosamente');
        } catch (error: any) {
            showNotification('error', `Error al completar: ${error.message}`);
        }
    };

    const handleRevertBudget = async (budget: Budget) => {
        try {
            await revertBudget(budget.id);
            showNotification('success', 'Presupuesto revertido a borrador');
        } catch (error: any) {
            showNotification('error', `Error al revertir: ${error.message}`);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        try {
            await deleteBudget(budget.id);
            showNotification('success', 'Presupuesto eliminado exitosamente');
        } catch (error: any) {
            showNotification('error', `Error al eliminar: ${error.message}`);
        }
    };

    // ✅ FUNCIÓN DE EXPORTAR PDF IMPLEMENTADA
    const handleExportPDF = async (budget: Budget) => {
        setIsGeneratingPDF(true);
        
        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut
            } : undefined;

            await PDFGenerator.generateBudgetPDF(budget, patient, doctorData);
            showNotification('success', 'PDF generado exitosamente');
            
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            const errorMessage = error.message || 'Error al generar PDF';
            showNotification('error', errorMessage);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ✅ FUNCIÓN PARA EXPORTAR PDF DEL PRESUPUESTO ACTUAL EN EL EDITOR
    const handleExportCurrentBudgetPDF = async () => {
        if (!selectedBudget && items.length === 0) {
            showNotification('error', 'No hay tratamientos para exportar');
            return;
        }

        setIsGeneratingPDF(true);

        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut
            } : undefined;

            // Si hay un presupuesto seleccionado, usar sus datos
            if (selectedBudget) {
                await PDFGenerator.generateBudgetPDF(selectedBudget, patient, doctorData);
            } else {
                // Si es un presupuesto nuevo, crear un objeto temporal para el PDF
                const tempBudget: Budget = {
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
            }

            showNotification('success', 'PDF generado exitosamente');
            
        } catch (error: any) {
            console.error('Error generating PDF:', error);
            const errorMessage = error.message || 'Error al generar PDF';
            showNotification('error', errorMessage);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ✅ FUNCIONES DEL EDITOR (mantenidas igual)

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const markAsChanged = () => setHasUnsavedChanges(true);

    const handleAddItem = () => {
        const validation = BudgetFormUtils.validateItem(newItem);
        if (validation) {
            showNotification('error', validation);
            return;
        }

        const valor = BudgetFormUtils.parseValue(newItem.valor);
        const item: BudgetItem = {
            pieza: newItem.pieza,
            accion: newItem.accion,
            valor: valor,
            orden: items.length
        };

        setItems([...items, item]);
        setNewItem({ pieza: '', accion: '', valor: '' });
        markAsChanged();
        showNotification('success', 'Tratamiento agregado exitosamente');
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        markAsChanged();
        showNotification('success', 'Tratamiento eliminado');
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
            showNotification('error', validation);
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
        showNotification('success', 'Tratamiento actualizado');
    };

    const handleBudgetTypeChange = (type: string) => {
        setBudgetType(type);
        markAsChanged();
    };

    const handleSaveBudget = async () => {
        if (!items || items.length === 0) {
            showNotification('error', 'Agrega al menos un tratamiento antes de guardar');
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
            showNotification('success', 'Presupuesto guardado exitosamente');
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido al guardar';
            showNotification('error', `Error al guardar: ${errorMessage}`);
        }
    };

    // Funciones para cambios en formularios
    const handleNewItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        setNewItem(prev => ({ ...prev, [field]: value }));
    };

    const handleEditingItemChange = (field: keyof BudgetFormData, value: string) => {
        if (field === 'valor') {
            value = BudgetFormUtils.formatValueInput(value);
        }
        setEditingItem(prev => ({ ...prev, [field]: value }));
    };

    // Loading state
    if (isLoadingAll || isLoadingActive) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notificaciones */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

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

            {/* Vista Lista de Presupuestos */}
            {showBudgetList && (
                <BudgetList
                    budgets={sortedBudgets}
                    patient={patient}
                    onCreateNew={handleCreateNewBudget}
                    onEdit={handleEditBudget}
                    onView={handleViewBudget}
                    onActivate={handleActivateBudget}
                    onComplete={handleCompleteBudget}
                    onRevert={handleRevertBudget}
                    onDelete={handleDeleteBudget}
                    onExportPDF={handleExportPDF}
                    isLoadingActivate={isLoadingActivate}
                    isLoadingComplete={isLoadingComplete}
                    isLoadingRevert={isLoadingRevert}
                    isLoadingDelete={isLoadingDelete}
                />
            )}

            {/* Vista Editor de Presupuestos */}
            {showBudgetEditor && (
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
                    onExportPDF={handleExportCurrentBudgetPDF}
                />
            )}
        </div>
    );
};

export { PatientBudget };