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
            className={`flex flex-col rounded-lg border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg ${
                budget.status === 'completed'
                    ? 'border-blue-200 bg-gradient-to-b from-blue-50 to-white hover:from-blue-100'
                    : budget.status === 'activo'
                    ? 'border-green-200 bg-gradient-to-b from-green-50 to-white hover:from-green-100'
                    : 'border-orange-200 bg-gradient-to-b from-orange-50 to-white hover:from-orange-100'
            }`}
            onClick={() => onView(budget)}
        >
            {/* Header compacto */}
            <div className="p-2 border-b border-slate-200">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    {/* Icono pequeño */}
                    <div className={`p-1.5 rounded ${
                        budget.budget_type === BUDGET_TYPE.ODONTOLOGICO
                            ? 'bg-cyan-100'
                            : 'bg-purple-100'
                    }`}>
                        {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? (
                            <Stethoscope className="w-3.5 h-3.5 text-cyan-700" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                        )}
                    </div>

                    {/* Badge de estado compacto */}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getStatusColor(budget.status)}`}>
                        {BUDGET_STATUS_LABELS[budget.status as keyof typeof BUDGET_STATUS_LABELS] || budget.status}
                    </span>
                </div>

                {/* Título compacto */}
                <h4 className="font-bold text-slate-800 text-sm leading-tight">
                    Presupuesto. #{budget.id}
                </h4>

                {/* Info mínima */}
                <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {BudgetFormUtils.formatDate(budget.created_at)}
                </p>
            </div>

            {/* Valor total compacto */}
            <div className="px-2 py-2 bg-white border-b border-slate-200">
                <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 leading-tight">
                        ${BudgetFormUtils.formatCurrency(parseFloat(budget.total_amount))}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                        {budget.items.length} {budget.items.length === 1 ? 'tratamiento' : 'tratamientos'}
                    </p>
                </div>
            </div>

            {/* Preview de tratamientos - SIEMPRE VISIBLE, información crítica */}
            <div className="flex-1 px-2 py-2 bg-slate-50/50 min-h-[80px] overflow-y-auto">
                <div className="space-y-1.5">
                    {budget.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-xs leading-snug">
                            <p className="font-semibold text-slate-700">
                                {item.pieza && (
                                    <span className="inline-block bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">
                                        #{item.pieza}
                                    </span>
                                )}
                                <span className="break-words">{item.accion}</span>
                            </p>
                        </div>
                    ))}
                    {budget.items.length > 3 && (
                        <p className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-200">
                            +{budget.items.length - 3} tratamiento{budget.items.length - 3 > 1 ? 's' : ''} más
                        </p>
                    )}
                </div>
            </div>

            {/* Acciones súper compactas */}
            <div className="p-1.5 bg-white border-t border-slate-200">
                {/* Acciones principales en una sola fila */}
                <div className="flex gap-0.5 mb-1">
                    <button
                        onClick={(e) => handleActionClick(e, () => onView(budget))}
                        className="flex-1 flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="Ver"
                    >
                        <Eye className="w-3 h-3" />
                    </button>

                    {BudgetUtils.canModify(budget) && (
                        <button
                            onClick={(e) => handleActionClick(e, () => onEdit(budget))}
                            className="flex-1 flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Editar"
                        >
                            <Edit className="w-3 h-3" />
                        </button>
                    )}

                    <button
                        onClick={(e) => handleActionClick(e, () => onExportPDF(budget))}
                        className="flex-1 flex items-center justify-center p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        title="PDF"
                    >
                        <Download className="w-3 h-3" />
                    </button>
                </div>

                {/* Botón de acción principal compacto */}
                {BudgetUtils.canActivate(budget) && (
                    <button
                        onClick={(e) => handleActionClick(e, () => onActivate(budget))}
                        disabled={isLoadingActivate}
                        className="w-full flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[11px] font-semibold rounded py-1.5 transition-colors disabled:opacity-50"
                        title="Activar"
                    >
                        {isLoadingActivate ? (
                            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-white"></div>
                        ) : (
                            <Play className="w-2.5 h-2.5" />
                        )}
                        <span>Activar</span>
                    </button>
                )}

                {BudgetUtils.canComplete(budget) && (
                    <button
                        onClick={(e) => handleActionClick(e, () => onComplete(budget))}
                        disabled={isLoadingComplete}
                        className="w-full flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold rounded py-1.5 transition-colors disabled:opacity-50"
                        title="Completar"
                    >
                        {isLoadingComplete ? (
                            <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-white"></div>
                        ) : (
                            <CheckCircle className="w-2.5 h-2.5" />
                        )}
                        <span>Completar</span>
                    </button>
                )}

                {/* Acciones secundarias en fila */}
                {(BudgetUtils.canRevert(budget) || BudgetUtils.canDelete(budget)) && (
                    <div className="flex gap-0.5 mt-1">
                        {BudgetUtils.canRevert(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onRevert(budget))}
                                disabled={isLoadingRevert}
                                className="flex-1 flex items-center justify-center gap-0.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-[10px] font-medium rounded py-1 transition-colors disabled:opacity-50"
                                title="Revertir"
                            >
                                {isLoadingRevert ? (
                                    <div className="animate-spin rounded-full h-2 w-2 border-b border-yellow-800"></div>
                                ) : (
                                    <RotateCcw className="w-2.5 h-2.5" />
                                )}
                                <span>Revertir</span>
                            </button>
                        )}

                        {BudgetUtils.canDelete(budget) && (
                            <button
                                onClick={(e) => handleActionClick(e, () => onDelete(budget))}
                                disabled={isLoadingDelete}
                                className="flex-1 flex items-center justify-center gap-0.5 bg-red-100 hover:bg-red-200 text-red-800 text-[10px] font-medium rounded py-1 transition-colors disabled:opacity-50"
                                title="Eliminar"
                            >
                                {isLoadingDelete ? (
                                    <div className="animate-spin rounded-full h-2 w-2 border-b border-red-800"></div>
                                ) : (
                                    <Trash2 className="w-2.5 h-2.5" />
                                )}
                                <span>Eliminar</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export { BudgetCard };