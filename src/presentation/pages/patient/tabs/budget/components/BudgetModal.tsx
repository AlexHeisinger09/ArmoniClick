// src/presentation/pages/patient/tabs/budget/components/BudgetModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { Budget, BudgetItem, BUDGET_TYPE, BudgetUtils } from "@/core/use-cases/budgets";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";
import { BudgetEditor } from './BudgetEditor';
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';
import { PDFGenerator } from '../utils/pdfGenerator';
import { BudgetFormData, BudgetFormUtils } from '../types/budget.types';
import { useLoginMutation, useProfile } from "@/presentation/hooks";

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    budget?: Budget | null; // Para editar un presupuesto existente
    mode?: 'create' | 'edit' | 'view';
}

const BudgetModal: React.FC<BudgetModalProps> = ({
    isOpen,
    onClose,
    patient,
    budget = null,
    mode = 'create'
}) => {
    // Estados principales
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(budget);
    
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

    // Estados de UI
    const notification = useNotification();
    const confirmation = useConfirmation();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Hooks para datos
    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    // Hook para presupuestos
    const {
        saveBudget,
        isLoadingSave,
    } = useMultipleBudgetOperations(patient.id);

    // ✅ CARGAR PRESUPUESTO AL ABRIR MODAL
    useEffect(() => {
        if (isOpen && budget) {
            setSelectedBudget(budget);
            setItems(budget.items.map(item => ({
                ...item,
                valor: parseFloat(item.valor.toString())
            })));
            setBudgetType(budget.budget_type);
            setHasUnsavedChanges(false);
        } else if (isOpen && !budget) {
            // Resetear para nuevo presupuesto
            setSelectedBudget(null);
            setItems([]);
            setBudgetType(BUDGET_TYPE.ODONTOLOGICO);
            setHasUnsavedChanges(false);
        }
    }, [isOpen, budget]);

    // ✅ RESETEAR AL CERRAR
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(null);
            setEditingItem({ pieza: '', accion: '', valor: '' });
            setNewItem({ pieza: '', accion: '', valor: '' });
        }
    }, [isOpen]);

    const markAsChanged = () => setHasUnsavedChanges(true);

    const handleClose = async () => {
        if (hasUnsavedChanges) {
            const confirmed = await confirmation.confirm({
                title: 'Cambios sin guardar',
                message: '¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.',
                confirmText: 'Cerrar',
                cancelText: 'Continuar editando',
                variant: 'warning'
            });

            if (!confirmed) {
                confirmation.close();
                return;
            }

            confirmation.close();
        }
        onClose();
    };

    // ✅ FUNCIONES DEL EDITOR (reutilizamos la lógica existente)
    const handleAddItem = () => {
        const validation = BudgetFormUtils.validateItem(newItem);
        if (validation) {
            notification.error(validation);
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
            
            // Cerrar modal después de guardar exitosamente
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message || 'Error desconocido al guardar';
            notification.error(`Error al guardar: ${errorMessage}`);
        }
    };

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

    const handleExportPDF = async () => {
        if (items.length === 0) {
            notification.error('No hay tratamientos para exportar');
            return;
        }

        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature
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

    // No renderizar si no está abierto
    if (!isOpen) return null;

    const canEdit = mode !== 'view' && (!selectedBudget || BudgetUtils.canModify(selectedBudget));

    return (
        <>
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-4xl">

                        {/* Header del modal */}
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4 text-white rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg font-semibold">
                                        {mode === 'create' ? 'Nuevo Presupuesto' :
                                         mode === 'edit' ? 'Editar Presupuesto' :
                                         'Ver Presupuesto'}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-white text-opacity-90 mt-0.5">
                                        {patient.nombres} {patient.apellidos}
                                    </p>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                            <div className="p-4 sm:p-6 space-y-6">
                                
                                {/* Información del paciente */}
                                <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-slate-700">Paciente:</span>
                                            <span className="ml-2 text-slate-600">
                                                {patient.nombres} {patient.apellidos}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">RUT:</span>
                                            <span className="ml-2 text-slate-600">{patient.rut}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">Teléfono:</span>
                                            <span className="ml-2 text-slate-600">{patient.telefono}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-700">Modo:</span>
                                            <span className="ml-2 text-slate-600">
                                                {mode === 'create' ? 'Crear nuevo' : 
                                                 mode === 'edit' ? 'Editando' : 
                                                 'Solo lectura'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Editor de presupuesto - Reutilizamos el componente existente */}
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
                                    onBack={handleClose}
                                    onSave={handleSaveBudget}
                                    onBudgetTypeChange={handleBudgetTypeChange}
                                    onAddItem={handleAddItem}
                                    onDeleteItem={handleDeleteItem}
                                    onStartEditing={handleStartEditing}
                                    onCancelEditing={handleCancelEditing}
                                    onSaveEditing={handleSaveEditing}
                                    onNewItemChange={handleNewItemChange}
                                    onEditingItemChange={handleEditingItemChange}
                                    onExportPDF={handleExportPDF}
                                />
                            </div>
                        </div>

                        {/* Footer con acciones - Responsive */}
                        <div className="bg-slate-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-slate-200">
                            <div className="flex flex-col gap-3">
                                {/* Total */}
                                <div className="text-xs sm:text-sm text-slate-500">
                                    {items.length > 0 && (
                                        <span>
                                            Total: <strong className="text-cyan-600">
                                                ${BudgetFormUtils.formatCurrency(BudgetFormUtils.calculateTotal(items))}
                                            </strong>
                                        </span>
                                    )}
                                </div>

                                {/* Botones */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>

                                    {canEdit && items.length > 0 && (
                                        <button
                                            onClick={handleSaveBudget}
                                            disabled={isLoadingSave || !hasUnsavedChanges}
                                            className="flex-1 px-3 sm:px-6 py-2 text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                        >
                                            {isLoadingSave ? 'Guardando...' : 'Guardar Presupuesto'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export { BudgetModal };