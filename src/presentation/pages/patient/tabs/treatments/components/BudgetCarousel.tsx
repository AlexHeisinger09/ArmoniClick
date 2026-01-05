// src/presentation/pages/patient/tabs/treatments/components/BudgetCarousel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BudgetSummary, Treatment, BudgetItem } from "@/core/use-cases/treatments";

interface BudgetCarouselProps {
    budgets: BudgetSummary[];
    selectedBudgetId: number | null;
    onBudgetChange: (budgetId: number | null) => void;
    loading: boolean;
    treatments?: Treatment[];
    budgetItems?: BudgetItem[];
}

const BudgetCarousel: React.FC<BudgetCarouselProps> = ({
    budgets,
    selectedBudgetId,
    onBudgetChange,
    loading,
    treatments = [],
    budgetItems = []
}) => {
    // ✅ NUEVO: Estado para alternar entre activos y completados
    const [showCompleted, setShowCompleted] = useState(false);

    // Filtrar presupuestos según el modo
    const activeBudgets = budgets.filter(b =>
        showCompleted ? b.status === 'completed' : b.status === 'activo'
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Cuando cambia la selección, sincronizar el índice
    useEffect(() => {
        if (selectedBudgetId && activeBudgets.length > 0) {
            const index = activeBudgets.findIndex(b => b.id === selectedBudgetId);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [selectedBudgetId, activeBudgets]);

    // ✅ Resetear índice cuando cambia el modo (activos/completados)
    useEffect(() => {
        setCurrentIndex(0);
        if (activeBudgets.length > 0) {
            onBudgetChange(activeBudgets[0].id);
        }
    }, [showCompleted]);

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
            case 'completado':
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
            case 'completado':
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
            case 'completado':
                return 'Completado';
            case 'pendiente':
                return 'Pendiente';
            case 'borrador':
                return 'Borrador';
            default:
                return status;
        }
    };

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % activeBudgets.length;
        setCurrentIndex(nextIndex);
        onBudgetChange(activeBudgets[nextIndex].id);
    };

    const handlePrev = () => {
        const prevIndex = (currentIndex - 1 + activeBudgets.length) % activeBudgets.length;
        setCurrentIndex(prevIndex);
        onBudgetChange(activeBudgets[prevIndex].id);
    };

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        onBudgetChange(activeBudgets[index].id);
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-cyan-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (activeBudgets.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-cyan-200">
                {/* Mini pestañas */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setShowCompleted(false)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            !showCompleted
                                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        🟢 Activos
                    </button>
                    <button
                        onClick={() => setShowCompleted(true)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            showCompleted
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        🔵 Completados
                    </button>
                </div>

                {/* Estado vacío */}
                <div className="p-6 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-slate-500 mb-2">
                        {showCompleted ? 'No hay presupuestos completados' : 'No hay presupuestos activos'}
                    </p>
                    <p className="text-sm text-slate-400">
                        {showCompleted
                            ? 'Completa presupuestos para verlos aquí'
                            : 'Crea y activa un presupuesto para generar tratamientos'
                        }
                    </p>
                </div>
            </div>
        );
    }

    const currentBudget = activeBudgets[currentIndex];
    const totalBudget = parseFloat(currentBudget.total_amount);

    // ✅ CORRECCIÓN: Contar budget_items en lugar de sesiones de tratamiento
    // Filtrar budget_items activos
    const activeBudgetItems = budgetItems.filter(item => item.is_active !== false);
    const totalBudgetItems = activeBudgetItems.length;

    // Contar budget_items completados
    const completedBudgetItems = activeBudgetItems.filter(item => item.status === 'completado');
    const completedBudgetItemsCount = completedBudgetItems.length;

    // Calcular el valor total completado (suma de valores de items completados)
    const completed = completedBudgetItems.reduce((sum, item) => sum + parseFloat(item.valor || '0'), 0);

    const pending = Math.max(0, totalBudget - completed);
    const progressPercentage = totalBudget > 0 ? Math.min(100, Math.round((completed / totalBudget) * 100)) : 0;

    return (
        <div className="bg-white rounded-xl border border-cyan-200 overflow-hidden flex flex-col h-full">
            {/* Header con mini pestañas */}
            <div className="border-b border-cyan-200">
                {/* Mini pestañas */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => setShowCompleted(false)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            !showCompleted
                                ? 'text-cyan-600 border-b-2 border-cyan-600 bg-cyan-50/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        🟢 Activos
                    </button>
                    <button
                        onClick={() => setShowCompleted(true)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            showCompleted
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        🔵 Completados
                    </button>
                </div>

                {/* Contador e info */}
                <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-cyan-600" />
                        <span className="text-sm text-slate-600">
                            {activeBudgets.length} presupuesto{activeBudgets.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    {activeBudgets.length > 0 && (
                        <div className="bg-cyan-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                            {currentIndex + 1}/{activeBudgets.length}
                        </div>
                    )}
                </div>
            </div>

            {/* Carrusel */}
            <div className="flex-1 overflow-hidden flex flex-col justify-between p-4">
                {/* Card del presupuesto actual */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 rounded-xl"></div>
                    <div className="relative p-4 border-2 border-cyan-300 rounded-xl bg-white/80 backdrop-blur-sm">
                        {/* ID y fecha */}
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-xs text-slate-500">Presupuesto</div>
                                <div className="text-sm font-semibold text-slate-700">#{currentBudget.id}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500">{formatDate(currentBudget.created_at)}</div>
                            </div>
                        </div>

                        {/* Presupuesto total */}
                        <div className="mb-4 pb-4 border-b border-slate-200">
                            <div className="text-xs text-slate-500">Presupuesto total</div>
                            <div className="text-2xl font-bold text-slate-700">
                                ${formatCurrency(totalBudget)}
                            </div>
                        </div>

                        {/* Estadísticas */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500">Realizado</div>
                                <div className="text-sm font-semibold text-green-600">
                                    ${formatCurrency(completed)}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {completedBudgetItemsCount} de {totalBudgetItems}
                                </div>
                            </div>
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500">Pendiente</div>
                                <div className="text-sm font-semibold text-orange-600">
                                    ${formatCurrency(pending)}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {totalBudgetItems - completedBudgetItemsCount} pendientes
                                </div>
                            </div>
                        </div>

                        {/* Barra de progreso */}
                        <div>
                            <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                                <span>Progreso</span>
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
                        </div>
                    </div>
                </div>

                {/* Controles del carrusel (cuando hay más de 1 presupuesto) */}
                {activeBudgets.length > 1 && (
                    <div className="space-y-3">
                        {/* Botones de navegación */}
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrev}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 font-medium transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Anterior</span>
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-600 font-medium transition-colors"
                            >
                                <span>Siguiente</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Indicadores (dots) */}
                        <div className="flex justify-center gap-2">
                            {activeBudgets.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    className={`h-2 rounded-full transition-all ${
                                        index === currentIndex
                                            ? 'w-6 bg-cyan-600'
                                            : 'w-2 bg-slate-300 hover:bg-slate-400'
                                    }`}
                                    aria-label={`Ir al presupuesto ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Instrucción visual */}
                        <div className="text-xs text-slate-500 text-center">
                            💡 Desliza o usa los puntos para cambiar de presupuesto
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="text-xs text-slate-600">
                    💡 <strong>Tip:</strong> Los valores se actualizan automáticamente cuando completas o eliminas tratamientos.
                </div>
            </div>
        </div>
    );
};

export { BudgetCarousel };
