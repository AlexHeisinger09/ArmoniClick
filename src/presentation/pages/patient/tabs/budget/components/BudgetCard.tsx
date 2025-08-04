// src/presentation/pages/patient/tabs/budget/components/BudgetCard.tsx
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
    const colors = BudgetUtils.getStatusColor(budget.status);

    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };

    return (
        <div
            className={`bg-white rounded-xl border-2 ${colors.border} shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer`}
            onClick={() => onView(budget)}
        >
            {/* Header */}
            <div className={`${colors.bg} px-6 py-4 border-b ${colors.border}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-white/80">
                            {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? (
                                <Stethoscope className="w-5 h-5 text-cyan-600" />
                            ) : (
                                <Sparkles className="w-5 h-5 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${colors.text}`}>
                                {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? 'Odontológico' : 'Estética'}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                                {BUDGET_STATUS_LABELS[budget.status as keyof typeof BUDGET_STATUS_LABELS]}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-bold ${colors.text}`}>
                            ${BudgetFormUtils.formatCurrency(parseFloat(budget.total_amount))}
                        </div>
                        <div className="text-xs text-gray-500">
                            {budget.items.length} tratamientos
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                {/* Fechas */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Creado: {BudgetFormUtils.formatDate(budget.created_at)}
                    </div>
                    {budget.updated_at && (
                        <div>
                            Actualizado: {BudgetFormUtils.formatDate(budget.updated_at)}
                        </div>
                    )}
                </div>

                {/* Preview de tratamientos */}
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tratamientos incluidos:</h4>
                    <div className="space-y-1">
                        {budget.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate">
                                    {item.pieza ? `${item.pieza}: ` : ''}{item.accion}
                                </span>
                                <span className="font-medium text-gray-900 ml-2">
                                    ${BudgetFormUtils.formatCurrency(parseFloat(item.valor.toString()))}
                                </span>
                            </div>
                        ))}
                        {budget.items.length > 3 && (
                            <div className="text-sm text-gray-500 italic">
                                +{budget.items.length - 3} tratamientos más
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => handleActionClick(e, () => onView(budget))}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        
                        {BudgetUtils.canModify(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={(e) => handleActionClick(e, () => onExportPDF(budget))}
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Exportar PDF"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex space-x-2">
                        {BudgetUtils.canActivate(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onActivate(budget))}
                                disabled={isLoadingActivate}
                                className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                {isLoadingActivate ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <Play className="w-3 h-3 mr-1" />
                                )}
                                Activar
                            </button>
                        )}

                        {BudgetUtils.canComplete(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onComplete(budget))}
                                disabled={isLoadingComplete}
                                className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                {isLoadingComplete ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                Completar
                            </button>
                        )}

                        {BudgetUtils.canRevert(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onRevert(budget))}
                                disabled={isLoadingRevert}
                                className="flex items-center bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                {isLoadingRevert ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                )}
                                Revertir
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
                                className="flex items-center bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                            >
                                {isLoadingDelete ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                ) : (
                                    <Trash2 className="w-3 h-3 mr-1" />
                                )}
                                Eliminar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export { BudgetCard };