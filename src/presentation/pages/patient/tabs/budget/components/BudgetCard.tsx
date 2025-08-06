import React from 'react';
import {
    Calendar,
    Eye,
    Edit,
    Download,
    Play,
    CheckCircle,
    RotateCcw,
    Trash2,
    Stethoscope,
    Sparkles
} from 'lucide-react';
import { 
    BUDGET_STATUS_LABELS, 
    BUDGET_TYPE, 
    BudgetUtils 
} from "@/core/use-cases/budgets";
import { BudgetCardProps, BudgetFormUtils } from '../types/budget.types';

const BudgetCard: React.FC<BudgetCardProps> = ({
    budget,
    onView,
    onEdit,
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
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'activo':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'completed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'pendiente':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'borrador':
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div
            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-md ${
                budget.status === 'completed' 
                    ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-green-50/50 hover:from-blue-50 hover:to-green-50' 
                    : budget.status === 'activo'
                    ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-cyan-50/50 hover:from-green-50 hover:to-cyan-50'
                    : 'border-cyan-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/30'
            }`}
            onClick={() => onView(budget)}
        >
            {/* Header compacto para móvil */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                        {/* Icono más pequeño en móvil */}
                        <div className="p-1.5 sm:p-2 rounded-full bg-slate-100 flex-shrink-0">
                            {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? (
                                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            ) : (
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            )}
                        </div>
                        
                        {/* Título responsivo */}
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                                Presupuesto #{budget.id}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 truncate">
                                {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? 'Odontológico' : 'Estética'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Status badge responsivo */}
                    <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                            {BUDGET_STATUS_LABELS[budget.status as keyof typeof BUDGET_STATUS_LABELS]}
                        </span>
                        <div className="text-xs text-slate-500 hidden sm:block">
                            {BudgetFormUtils.formatDate(budget.created_at)}
                        </div>
                    </div>
                </div>

                {/* Valor prominente */}
                <div className="text-right ml-2 flex-shrink-0">
                    <div className="text-base sm:text-lg font-bold text-slate-700">
                        ${BudgetFormUtils.formatCurrency(parseFloat(budget.total_amount))}
                    </div>
                    <div className="text-xs text-slate-500">
                        {budget.items.length} {budget.items.length === 1 ? 'item' : 'items'}
                    </div>
                </div>
            </div>

            {/* Fecha en móvil */}
            <div className="text-xs text-slate-500 mb-3 sm:hidden">
                <Calendar className="w-3 h-3 inline mr-1" />
                {BudgetFormUtils.formatDate(budget.created_at)}
            </div>

            {/* Preview de tratamientos - compacto en móvil */}
            <div className="mb-3 sm:mb-4">
                <h5 className="text-xs sm:text-sm font-medium text-slate-600 mb-2">Tratamientos:</h5>
                <div className="space-y-1">
                    {budget.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex justify-between text-xs sm:text-sm">
                            <span className="text-slate-600 truncate flex-1 mr-2">
                                {item.pieza ? `${item.pieza}: ` : ''}{item.accion}
                            </span>
                            <span className="font-medium text-slate-700 flex-shrink-0">
                                ${BudgetFormUtils.formatCurrency(parseFloat(item.valor.toString()))}
                            </span>
                        </div>
                    ))}
                    {budget.items.length > 2 && (
                        <div className="text-xs text-slate-500 italic">
                            +{budget.items.length - 2} más
                        </div>
                    )}
                </div>
            </div>

            {/* Acciones responsivas */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {/* Acciones básicas - siempre visibles */}
                <div className="flex space-x-1">
                    <button
                        onClick={(e) => handleActionClick(e, () => onView(budget))}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Ver detalles"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    
                    {BudgetUtils.canModify(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={(e) => handleActionClick(e, () => onExportPDF(budget))}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Exportar PDF"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>

                {/* Acciones de estado - stack en móvil */}
                <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
                    {BudgetUtils.canActivate(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => onActivate(budget))}
                            disabled={isLoadingActivate}
                            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-medium rounded-lg px-2 py-1.5 sm:px-3 transition-colors disabled:opacity-50"
                        >
                            {isLoadingActivate ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                                <Play className="w-3 h-3 mr-1" />
                            )}
                            <span className="hidden sm:inline">Activar</span>
                            <span className="sm:hidden">▶</span>
                        </button>
                    )}

                    {BudgetUtils.canComplete(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => onComplete(budget))}
                            disabled={isLoadingComplete}
                            className="flex items-center bg-slate-600 hover:bg-slate-700 text-white text-xs font-medium rounded-lg px-2 py-1.5 sm:px-3 transition-colors disabled:opacity-50"
                        >
                            {isLoadingComplete ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            <span className="hidden sm:inline">Completar</span>
                            <span className="sm:hidden">✓</span>
                        </button>
                    )}

                    {BudgetUtils.canRevert(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => onRevert(budget))}
                            disabled={isLoadingRevert}
                            className="flex items-center bg-slate-400 hover:bg-slate-500 text-white text-xs font-medium rounded-lg px-2 py-1.5 sm:px-3 transition-colors disabled:opacity-50"
                        >
                            {isLoadingRevert ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                                <RotateCcw className="w-3 h-3 mr-1" />
                            )}
                            <span className="hidden lg:inline">Revertir</span>
                            <span className="lg:hidden">↺</span>
                        </button>
                    )}

                    {BudgetUtils.canDelete(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => {
                                if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
                                    onDelete(budget);
                                }
                            })}
                            disabled={isLoadingDelete}
                            className="flex items-center bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg px-2 py-1.5 sm:px-3 transition-colors disabled:opacity-50"
                        >
                            {isLoadingDelete ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            ) : (
                                <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            <span className="hidden sm:inline">Eliminar</span>
                            <span className="sm:hidden">🗑</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export { BudgetCard };