// src/presentation/pages/patient/tabs/budget/components/BudgetList.tsx
import React from 'react';
import { Plus, FileText, Calculator } from 'lucide-react';
import { BudgetListProps } from '../types/budget.types';
import { BudgetCard } from './BudgetCard';

const BudgetList: React.FC<BudgetListProps> = ({
    budgets,
    patient,
    onCreateNew,
    onEdit,
    onView,
    onActivate,
    onComplete,
    onRevert,
    onDelete,
    onExportPDF,
    isLoadingActivate = false,
    isLoadingComplete = false,
    isLoadingRevert = false,
    isLoadingDelete = false
}) => {
    return (
        <>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <FileText className="w-6 h-6 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                Presupuestos de {patient.nombres} {patient.apellidos}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Gestiona todos los planes de tratamiento del paciente
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCreateNew}
                        className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Presupuesto
                    </button>
                </div>
            </div>

            {/* Lista de presupuestos */}
            {budgets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {budgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onView={onView}
                            onEdit={onEdit}
                            onActivate={onActivate}
                            onComplete={onComplete}
                            onRevert={onRevert}
                            onDelete={onDelete}
                            onExportPDF={onExportPDF}
                            isLoadingActivate={isLoadingActivate}
                            isLoadingComplete={isLoadingComplete}
                            isLoadingRevert={isLoadingRevert}
                            isLoadingDelete={isLoadingDelete}
                        />
                    ))}
                </div>
            ) : (
                /* Estado vacío */
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-12 text-center">
                    <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Sin presupuestos creados</h3>
                    <p className="text-slate-500 mb-6">
                        Crea el primer presupuesto para este paciente
                    </p>
                    <button 
                        onClick={onCreateNew}
                        className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Primer Presupuesto
                    </button>
                </div>
            )}
        </>
    );
};

export { BudgetList };