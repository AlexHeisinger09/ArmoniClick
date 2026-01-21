// src/presentation/pages/patient/tabs/budget/components/BudgetEditor.tsx
import React from 'react';
import { X, FileText, AlertCircle, Calculator } from 'lucide-react';
import { BudgetUtils, BUDGET_TYPE } from "@/core/use-cases/budgets";
import { BudgetEditorProps } from '../types/budget.types';
import { BudgetTypeSelector } from './BudgetTypeSelector';
import { BudgetItemForm } from './BudgetItemForm';
import { BudgetItemsTable } from './BudgetItemsTable';
import FacialAesthetic from '@/presentation/components/facial-aesthetic/FacialAesthetic';
import { useServices } from '@/presentation/hooks/services/useServices';

const BudgetEditor: React.FC<BudgetEditorProps> = ({
    patient,
    budget,
    items,
    budgetType,
    newItem,
    editingItem,
    isEditing,
    hasUnsavedChanges,
    isLoadingSave,
    onBack,
    onSave,
    onBudgetTypeChange,
    onAddItem,
    onDeleteItem,
    onStartEditing,
    onCancelEditing,
    onSaveEditing,
    onNewItemChange,
    onEditingItemChange,
    onExportPDF
}) => {
    const canEdit = budget ? BudgetUtils.canModify(budget) : true;

    // Obtener servicios y filtrar por tipo de presupuesto
    const { services } = useServices();
    const filteredServices = services.filter(service => service.tipo === budgetType);

    // Handler para agregar tratamiento desde FacialAesthetic
    const handleAddItemFromAesthetic = (zone: string, treatment: string, value: string) => {
        // Formatear el valor con puntos de miles (igual que en odontológico)
        const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Llamar a onAddItem con los datos personalizados
        onAddItem({
            pieza: zone,
            accion: treatment,
            valor: formattedValue
        });
    };

    return (
        <>
            
            {/* Selector de tipo de presupuesto */}
            <BudgetTypeSelector
                budgetType={budgetType}
                onTypeChange={onBudgetTypeChange}
                canEdit={canEdit}
            />

            {/* Formulario para agregar tratamientos - Solo mostrar si NO es estética */}
            {budgetType !== BUDGET_TYPE.ESTETICA && (
                <BudgetItemForm
                    budgetType={budgetType}
                    newItem={newItem}
                    onItemChange={onNewItemChange}
                    onAddItem={onAddItem}
                    canEdit={canEdit}
                />
            )}

            {/* Ficha Estética - Solo mostrar si es presupuesto de estética */}
            {budgetType === BUDGET_TYPE.ESTETICA && canEdit && (
                <div className="mt-6 mb-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        Ficha Estética Facial
                    </h3>
                    <FacialAesthetic
                        onAddItem={handleAddItemFromAesthetic}
                        services={filteredServices}
                    />
                </div>
            )}

            {/* Tabla de tratamientos */}
            {items.length > 0 ? (
                <BudgetItemsTable
                    items={items}
                    budgetType={budgetType}
                    editingItem={editingItem}
                    isEditing={isEditing}
                    hasUnsavedChanges={hasUnsavedChanges}
                    isLoadingSave={isLoadingSave}
                    canEdit={canEdit}
                    onSave={onSave}
                    onExportPDF={onExportPDF}
                    onStartEditing={onStartEditing}
                    onCancelEditing={onCancelEditing}
                    onSaveEditing={onSaveEditing}
                    onDeleteItem={onDeleteItem}
                    onEditingItemChange={onEditingItemChange}
                />
            ) : (
                /* Estado vacío */
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-12 text-center">
                    <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Sin tratamientos agregados</h3>
                    <p className="text-slate-500">
                        {canEdit
                            ? 'Comienza agregando tratamientos para crear el presupuesto'
                            : 'Este presupuesto no tiene tratamientos'
                        }
                    </p>
                </div>
            )}
        </>
    );
};

export { BudgetEditor };