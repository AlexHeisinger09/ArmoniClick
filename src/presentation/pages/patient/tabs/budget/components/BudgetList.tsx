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
    // Categorizar presupuestos en 3 grupos
    const pendingBudgets = budgets.filter(budget =>
        budget.status === 'pendiente' || budget.status === 'borrador'
    );
    const activeBudgets = budgets.filter(budget => budget.status === 'activo');
    const completedBudgets = budgets.filter(budget => budget.status === 'completed');

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
                <div className="animate-pulse">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-10 bg-gray-200 rounded w-full sm:w-32"></div>
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
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
            {/* Header responsivo */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
                <h3 className="text-lg font-semibold text-slate-700">
                    Presupuestos del Paciente
                </h3>
                <button
                    onClick={onNewBudget}
                    className="w-full sm:w-auto flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Presupuesto
                </button>
            </div>

            {budgets.length === 0 ? (
                <div className="text-center py-8">
                    <div className="mb-4">
                        <FileText className="w-16 h-16 mx-auto text-gray-300" />
                    </div>
                    <p className="text-slate-500 mb-4">No hay presupuestos registrados para este paciente</p>
                    <button
                        onClick={onNewBudget}
                        className="w-full sm:w-auto flex items-center justify-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Presupuesto
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* 1. Presupuestos Pendientes/Borradores */}
                    {pendingBudgets.length > 0 && (
                        <div>
                            <h4 className="text-sm sm:text-base font-semibold text-orange-800 mb-2 sm:mb-4 pb-2 border-b-2 border-orange-200 flex items-center gap-2">
                                <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded">
                                    {pendingBudgets.length}
                                </span>
                                Presupuestos por Activar
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                                {pendingBudgets.map((budget) => (
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
                        </div>
                    )}

                    {/* 2. Presupuestos Activos */}
                    {activeBudgets.length > 0 && (
                        <div>
                            <h4 className="text-sm sm:text-base font-semibold text-green-800 mb-2 sm:mb-4 pb-2 border-b-2 border-green-200 flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded">
                                    {activeBudgets.length}
                                </span>
                                Planes en Ejecución
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                                {activeBudgets.map((budget) => (
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
                        </div>
                    )}

                    {/* 3. Presupuestos Completados */}
                    {completedBudgets.length > 0 && (
                        <div>
                            <h4 className="text-sm sm:text-base font-semibold text-blue-800 mb-2 sm:mb-4 pb-2 border-b-2 border-blue-200 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">
                                    {completedBudgets.length}
                                </span>
                                Presupuestos Completados
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                                {completedBudgets.map((budget) => (
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export { BudgetsList };