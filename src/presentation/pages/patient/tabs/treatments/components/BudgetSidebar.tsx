// src/presentation/pages/patient/tabs/treatments/components/BudgetSidebar.tsx - LIMPIO Y CORREGIDO
import React, { useMemo } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BudgetSummary, Treatment, BudgetItem } from "@/core/use-cases/treatments";

interface BudgetSidebarProps {
    budgets: BudgetSummary[];
    activeBudget: BudgetSummary | null;
    selectedBudgetId: number | null;
    onBudgetChange: (budgetId: number | null) => void;
    loading: boolean;
    treatments?: Treatment[];
    budgetItems?: BudgetItem[];
}

const BudgetSidebar: React.FC<BudgetSidebarProps> = ({
    budgets,
    activeBudget,
    selectedBudgetId,
    onBudgetChange,
    loading,
    treatments = [],
    budgetItems = []
}) => {
    const formatCurrency = (amount: string | number): string => {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return numericAmount.toLocaleString('es-CL');
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'activo':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'completed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pendiente':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            default:
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'activo':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-blue-600" />;
            case 'pendiente':
                return <Clock className="w-4 h-4 text-orange-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'activo':
                return 'Activo';
            case 'completed':
                return 'Completado';
            case 'pendiente':
                return 'Pendiente';
            case 'borrador':
                return 'Borrador';
            default:
                return status;
        }
    };

    // ✅ CÁLCULOS CORREGIDOS - CONTAR BUDGET_ITEMS EN LUGAR DE SESIONES
    const stats = useMemo(() => {
        if (!activeBudget) {
            return {
                totalBudget: 0,
                completed: 0,
                pending: 0,
                totalBudgetItems: 0,
                completedBudgetItems: 0
            };
        }

        const totalBudget = parseFloat(activeBudget.total_amount);

        // ✅ CORRECCIÓN: Contar budget_items en lugar de sesiones de tratamiento
        // Filtrar budget_items activos
        const activeBudgetItems = budgetItems.filter(item => item.is_active !== false);
        const totalBudgetItems = activeBudgetItems.length;

        // Contar budget_items completados
        const completedItems = activeBudgetItems.filter(item => item.status === 'completado');
        const completedBudgetItems = completedItems.length;

        // Calcular el valor total completado (suma de valores de items completados)
        const completed = completedItems.reduce((sum, item) => sum + parseFloat(item.valor || '0'), 0);

        const pending = Math.max(0, totalBudget - completed);

        return {
            totalBudget,
            completed,
            pending,
            totalBudgetItems,
            completedBudgetItems
        };
    }, [activeBudget, budgetItems]);

    // ✅ PROGRESO CALCULADO CORRECTAMENTE
    const progressPercentage = useMemo(() => {
        if (stats.totalBudget <= 0) return 0;
        return Math.min(100, Math.round((stats.completed / stats.totalBudget) * 100));
    }, [stats.totalBudget, stats.completed]);

    if (loading) {
        return (
            <div className="bg-white h-full rounded-xl border border-cyan-200">
                <div className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-xl">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white h-full rounded-xl border border-cyan-200 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-full">
                        <FileText className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700">Plan de tratamiento</h3>
                        <p className="text-sm text-slate-500">#{activeBudget?.id || 'Sin seleccionar'}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {!activeBudget ? (
                    <div className="p-6 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-slate-500 mb-2">No hay presupuesto activo</p>
                        <p className="text-sm text-slate-400">
                            Crea y activa un presupuesto para generar tratamientos
                        </p>
                    </div>
                ) : (
                    <div className="p-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 rounded-xl"></div>
                            <div className="relative p-4 border-2 border-cyan-300 rounded-xl bg-white/80 backdrop-blur-sm">

                                {/* Presupuesto total */}
                                <div className="mb-4">
                                    <div className="text-xs text-slate-500">Presupuesto total</div>
                                    <div className="text-2xl font-bold text-slate-700">
                                        ${formatCurrency(stats.totalBudget)}
                                    </div>
                                </div>

                                {/* ✅ ESTADÍSTICAS CORREGIDAS - CONTAR BUDGET_ITEMS */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <div className="text-xs text-slate-500">Realizado</div>
                                        <div className="text-sm font-semibold text-green-600">
                                            ${formatCurrency(stats.completed)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {stats.completedBudgetItems} de {stats.totalBudgetItems}
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-slate-50 rounded-lg">
                                        <div className="text-xs text-slate-500">No Realizado</div>
                                        <div className="text-sm font-semibold text-orange-600">
                                            ${formatCurrency(stats.pending)}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {stats.totalBudgetItems - stats.completedBudgetItems} pendientes
                                        </div>
                                    </div>
                                </div>

                                {/* Badge de estado */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activeBudget.status)}`}>
                                        {getStatusIcon(activeBudget.status)}
                                        <span className="ml-1">{getStatusLabel(activeBudget.status)}</span>
                                    </span>
                                    <div className="text-xs text-slate-500">
                                        {formatDate(activeBudget.created_at)}
                                    </div>
                                </div>

                                {/* ✅ BARRA DE PROGRESO CORREGIDA */}
                                <div className="mt-3">
                                    <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                        <span>Progreso del tratamiento</span>
                                        <span className="font-medium">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-cyan-500 to-green-500 h-3 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${progressPercentage}%` }}
                                        >
                                            {progressPercentage > 0 && (
                                                <div className="w-full h-full bg-white/30 animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Mensaje de estado del progreso */}
                                    <div className="text-xs text-slate-600 mt-2">
                                        {progressPercentage === 100 ? (
                                            <span className="text-green-600 font-medium">✅ Tratamiento completado al 100%</span>
                                        ) : progressPercentage >= 75 ? (
                                            <span className="text-blue-600">🎯 Cerca de completar el tratamiento</span>
                                        ) : progressPercentage >= 50 ? (
                                            <span className="text-yellow-600">⚡ Tratamiento en progreso</span>
                                        ) : progressPercentage > 0 ? (
                                            <span className="text-orange-600">🚀 Tratamiento iniciado</span>
                                        ) : (
                                            <span className="text-slate-500">⏳ Tratamiento sin iniciar</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer con tip */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="text-xs text-slate-600">
                    💡 <strong>Tip:</strong> Los valores se actualizan automáticamente cuando completas o eliminas tratamientos.
                </div>
            </div>
        </div>
    );
};

export { BudgetSidebar };