// src/presentation/pages/patient/tabs/budget/components/BudgetItemsTable.tsx
import React from 'react';
import { Save, Download, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import { BUDGET_TYPE } from "@/core/use-cases/budgets";
import {  BudgetFormData, ODONTOLOGICO_TREATMENTS, ESTETICA_TREATMENTS, BudgetFormUtils } from '../types/budget.types';
import { BudgetItem } from "@/core/use-cases/budgets";

interface BudgetItemsTableProps {
    items: BudgetItem[];
    budgetType: string;
    editingItem: BudgetFormData;
    isEditing: string | null;
    hasUnsavedChanges: boolean;
    isLoadingSave: boolean;
    canEdit: boolean;
    onSave: () => void;
    onExportPDF: () => void;
    onStartEditing: (index: number) => void;
    onCancelEditing: () => void;
    onSaveEditing: () => void;
    onDeleteItem: (index: number) => void;
    onEditingItemChange: (field: keyof BudgetFormData, value: string) => void;
}

const BudgetItemsTable: React.FC<BudgetItemsTableProps> = ({
    items,
    budgetType,
    editingItem,
    isEditing,
    hasUnsavedChanges,
    isLoadingSave,
    canEdit,
    onSave,
    onExportPDF,
    onStartEditing,
    onCancelEditing,
    onSaveEditing,
    onDeleteItem,
    onEditingItemChange
}) => {
    const getCurrentTreatments = () => {
        return budgetType === BUDGET_TYPE.ODONTOLOGICO ? ODONTOLOGICO_TREATMENTS : ESTETICA_TREATMENTS;
    };

    const handleValueChange = (value: string) => {
        const formattedValue = BudgetFormUtils.formatValueInput(value);
        onEditingItemChange('valor', formattedValue);
    };

    if (items.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-cyan-200 bg-slate-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-700">Tratamientos</h3>
                    <div className="flex items-center space-x-3">
                        {canEdit && hasUnsavedChanges && (
                            <button
                                onClick={onSave}
                                disabled={isLoadingSave}
                                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isLoadingSave ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Guardar
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={onExportPDF}
                            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Exportar PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-slate-50 border-b border-cyan-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                                {budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'Pieza' : 'Zona'}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Tratamiento</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">Valor</th>
                            {canEdit && (
                                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Acciones</th>
                            )}
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-cyan-100">
                        {items.map((item, index) => (
                            <tr key={index} className="hover:bg-cyan-50 transition-colors">
                                <td className="px-6 py-4">
                                    {canEdit && isEditing === index.toString() ? (
                                        <input
                                            type="text"
                                            value={editingItem.pieza}
                                            onChange={(e) => onEditingItemChange('pieza', e.target.value)}
                                            className="w-full px-2 py-1 border border-cyan-300 rounded text-sm"
                                        />
                                    ) : (
                                        <span className="text-sm font-medium text-slate-700">
                                            {item.pieza || '-'}
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    {canEdit && isEditing === index.toString() ? (
                                        <select
                                            value={editingItem.accion}
                                            onChange={(e) => onEditingItemChange('accion', e.target.value)}
                                            className="w-full px-2 py-1 border border-cyan-300 rounded text-sm"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {getCurrentTreatments().map((treatment) => (
                                                <option key={treatment} value={treatment}>{treatment}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-sm text-slate-700">
                                            {item.accion}
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-right">
                                    {canEdit && isEditing === index.toString() ? (
                                        <input
                                            type="text"
                                            value={editingItem.valor}
                                            onChange={(e) => handleValueChange(e.target.value)}
                                            className="w-full px-2 py-1 border border-cyan-300 rounded text-sm text-right"
                                        />
                                    ) : (
                                        <span className="text-sm font-semibold text-green-600">
                                            ${BudgetFormUtils.formatCurrency(Number(item.valor))}
                                        </span>
                                    )}
                                </td>

                                {canEdit && (
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center space-x-2">
                                            {isEditing === index.toString() ? (
                                                <>
                                                    <button
                                                        onClick={onSaveEditing}
                                                        className="text-green-600 hover:text-green-800 transition-colors p-1"
                                                        title="Guardar cambios"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={onCancelEditing}
                                                        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                                                        title="Cancelar edición"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => onStartEditing(index)}
                                                        className="text-cyan-600 hover:text-cyan-800 transition-colors p-1"
                                                        title="Editar tratamiento"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteItem(index)}
                                                        className="text-red-600 hover:text-red-800 transition-colors p-1"
                                                        title="Eliminar tratamiento"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {/* FILA DEL TOTAL */}
                        <tr className="bg-slate-50 border-t-2 border-cyan-500">
                            <td className="px-6 py-4 font-semibold text-slate-700" colSpan={canEdit ? 2 : 2}>
                                TOTAL
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className="text-lg font-bold text-cyan-600">
                                    ${BudgetFormUtils.formatCurrency(BudgetFormUtils.calculateTotal(items))}
                                </span>
                            </td>
                            {canEdit && <td></td>}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export { BudgetItemsTable };