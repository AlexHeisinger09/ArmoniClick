// src/presentation/pages/patient/tabs/budget/components/BudgetEditor.tsx
import React from 'react';
import { X, FileText, AlertCircle, Calculator } from 'lucide-react';
import { BudgetUtils } from "@/core/use-cases/budgets";
import { BudgetEditorProps } from '../types/budget.types';
import { BudgetTypeSelector } from './BudgetTypeSelector';
import { BudgetItemForm } from './BudgetItemForm';
import { BudgetItemsTable } from './BudgetItemsTable';

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

    return (
        <>
            {/* Header del editor */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onBack}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Volver a la lista"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <FileText className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                {budget ? `Editando Presupuesto #${budget.id}` : 'Nuevo Presupuesto'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {budget && !canEdit 
                                    ? 'Modo solo lectura' 
                                    : 'Modo edición'
                                } - {patient.nombres} {patient.apellidos}
                            </p>
                        </div>
                    </div>
                    {hasUnsavedChanges && (
                        <div className="flex items-center text-amber-600 text-sm">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Cambios sin guardar
                        </div>
                    )}
                </div>
            </div>

            {/* Selector de tipo de presupuesto */}
            <BudgetTypeSelector
                budgetType={budgetType}
                onTypeChange={onBudgetTypeChange}
                canEdit={canEdit}
            />

            {/* Formulario para agregar tratamientos */}
            <BudgetItemForm
                budgetType={budgetType}
                newItem={newItem}
                onItemChange={onNewItemChange}
                onAddItem={onAddItem}
                canEdit={canEdit}
            />

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