// src/presentation/pages/patient/tabs/budget/components/BudgetsList.tsx
import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { Budget } from "@/core/use-cases/budgets";
import { BudgetCard } from './BudgetCard';

interface BudgetsListProps {
    budgets: Budget[];
    loading: boolean;
    onView: (budget: Budget) => void;
    onEdit: (budget: Budget) => void;
    onActivate: (budget: Budget) => void;
    onComplete: (budget: Budget) => void;
    onRevert: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    onExportPDF: (budget: Budget) => void;
    onNewBudget: () => void;
    isLoadingActivate?: boolean;
    isLoadingComplete?: boolean;
    isLoadingRevert?: boolean;
    isLoadingDelete?: boolean;
}

const BudgetsList: React.FC<BudgetsListProps> = ({
    budgets,
    loading,
    onView,
    onEdit,
    onActivate,
    onComplete,
    onRevert,
    onDelete,
    onExportPDF,
    onNewBudget,
    isLoadingActivate = false,
    isLoadingComplete = false,
    isLoadingRevert = false,
    isLoadingDelete = false
}) => {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-6">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-10 bg-gray-200 rounded w-32"></div>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-700">
                    Presupuestos del Paciente
                </h3>
                <button 
                    onClick={onNewBudget}
                    className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Presupuesto
                </button>
            </div>

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

                {budgets.length === 0 && (
                    <div className="text-center py-8">
                        <div className="mb-4">
                            <FileText className="w-16 h-16 mx-auto text-gray-300" />
                        </div>
                        <p className="text-slate-500 mb-4">No hay presupuestos registrados para este paciente</p>
                        <button 
                            onClick={onNewBudget}
                            className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primer Presupuesto
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export { BudgetsList };