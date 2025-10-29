import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Calculator, Eye, Download, Play, CheckCircle, Trash2 } from 'lucide-react';
import { useAllBudgets, useDeleteBudgetById, useActivateBudget, useCompleteBudget } from "@/presentation/hooks/budgets/useBudgets";
import { BUDGET_STATUS_LABELS, BUDGET_TYPE, BudgetUtils } from "@/core/use-cases/budgets";
import { Patient } from "@/core/use-cases/patients";
import { BudgetFormUtils } from './types/budget.types';
import { PDFGenerator } from './utils/pdfGenerator';
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { ConfirmationModal } from '@/presentation/components/ui/ConfirmationModal';
import { useConfirmation } from '@/presentation/hooks/useConfirmation';

interface PatientBudgetDisplayProps {
    patient: Patient;
}

const PatientBudgetDisplay: React.FC<PatientBudgetDisplayProps> = ({ patient }) => {
    const navigate = useNavigate();
    const { budgets, sortedBudgets, isLoadingAll } = useAllBudgets(patient.id);
    const { deleteBudget, isLoadingDelete } = useDeleteBudgetById();
    const { activateBudget, isLoadingActivate } = useActivateBudget();
    const { completeBudget, isLoadingComplete } = useCompleteBudget();
    const confirmation = useConfirmation();

    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    const handleCreateNewBudget = () => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}`);
    };

    const handleEditBudget = (budgetId: number) => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budgetId}&mode=edit`);
    };

    const handleViewBudget = (budgetId: number) => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budgetId}&mode=view`);
    };

    const handleExportPDF = async (budget: any) => {
        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature
            } : undefined;

            await PDFGenerator.generateBudgetPDF(budget, patient, doctorData);
        } catch (error: any) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleDeleteBudget = async (budgetId: number) => {
        const confirmed = await confirmation.confirm({
            title: 'Eliminar presupuesto',
            message: '¿Estás seguro de que deseas eliminar este presupuesto?',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            variant: 'danger',
            details: ['Esta acción no se puede deshacer']
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await deleteBudget(budgetId);
            confirmation.close();
        } catch (error) {
            console.error('Error deleting budget:', error);
            confirmation.close();
        }
    };

    const handleActivateBudget = async (budget: any) => {
        // Preparar detalles de los tratamientos que se crearán
        const treatmentDetails = budget.items.map((item: any) =>
            `${item.pieza ? `${item.pieza}: ` : ''}${item.accion} ($${parseFloat(item.valor).toLocaleString('es-CL')})`
        );

        const confirmed = await confirmation.confirm({
            title: 'Activar presupuesto',
            message: `Se activará este presupuesto y se crearán los tratamientos siguientes:`,
            confirmText: 'Activar',
            cancelText: 'Cancelar',
            variant: 'success',
            details: treatmentDetails
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await activateBudget(budget.id);
            confirmation.close();
        } catch (error) {
            console.error('Error activating budget:', error);
            confirmation.close();
        }
    };

    const handleCompleteBudget = async (budget: any) => {
        // Buscar tratamientos no completados en el presupuesto
        const incompleteTreatments: string[] = [];

        // Aquí podríamos obtener los tratamientos del presupuesto
        // Por ahora mostramos un mensaje genérico

        const confirmed = await confirmation.confirm({
            title: 'Completar presupuesto',
            message: '¿Desea completar este presupuesto aun si los tratamientos no están completados?',
            confirmText: 'Completar',
            cancelText: 'Cancelar',
            variant: 'warning',
            details: incompleteTreatments.length > 0
                ? incompleteTreatments
                : ['Se marcará el presupuesto como completado']
        });

        if (!confirmed) {
            confirmation.close();
            return;
        }

        try {
            await completeBudget(budget.id);
            confirmation.close();
        } catch (error) {
            console.error('Error completing budget:', error);
            confirmation.close();
        }
    };

    if (isLoadingAll) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header responsivo */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                Presupuestos
                            </h3>
                            <p className="text-sm text-slate-500">
                                {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} creado{budgets.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateNewBudget}
                        className="w-full sm:w-auto flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Presupuesto
                    </button>
                </div>
            </div>

            {/* Lista responsiva de presupuestos */}
            {sortedBudgets.length > 0 ? (
                <div className="space-y-4">
                    {sortedBudgets.map((budget) => {
                        const colors = BudgetUtils.getStatusColor(budget.status);
                        
                        return (
                            <div
                                key={budget.id}
                                className={`bg-white rounded-xl border-2 ${colors.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden`}
                            >
                                {/* Header responsivo */}
                                <div className={`${colors.bg} p-4 border-b ${colors.border}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 rounded-full bg-white/80">
                                                {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? (
                                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                                                ) : (
                                                    <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className={`font-semibold ${colors.text} truncate`}>
                                                    {budget.budget_type === BUDGET_TYPE.ODONTOLOGICO ? 'Odontológico' : 'Estética'}
                                                </h3>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.badge} mt-1`}>
                                                    {BUDGET_STATUS_LABELS[budget.status as keyof typeof BUDGET_STATUS_LABELS]}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className={`text-lg sm:text-xl font-bold ${colors.text}`}>
                                                ${BudgetFormUtils.formatCurrency(parseFloat(budget.total_amount))}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {budget.items.length} tratamientos
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contenido responsivo */}
                                <div className="p-4">
                                    {/* Fecha */}
                                    <div className="text-sm text-gray-500 mb-4">
                                        Creado: {BudgetFormUtils.formatDate(budget.created_at)}
                                        {budget.updated_at && budget.updated_at !== budget.created_at && (
                                            <span className="block sm:inline sm:ml-4 mt-1 sm:mt-0">
                                                Actualizado: {BudgetFormUtils.formatDate(budget.updated_at)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Preview de tratamientos */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Tratamientos:</h4>
                                        <div className="space-y-1">
                                            {budget.items.slice(0, 2).map((item, index) => (
                                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between text-sm">
                                                    <span className="text-gray-600 flex-1 mb-1 sm:mb-0">
                                                        {item.pieza ? `${item.pieza}: ` : ''}{item.accion}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        ${BudgetFormUtils.formatCurrency(parseFloat(item.valor.toString()))}
                                                    </span>
                                                </div>
                                            ))}
                                            {budget.items.length > 2 && (
                                                <div className="text-sm text-gray-500 italic">
                                                    +{budget.items.length - 2} tratamientos más
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Acciones responsivas */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 space-y-3 sm:space-y-0">
                                        <div className="flex space-x-2 order-2 sm:order-1">
                                            <button
                                                onClick={() => handleViewBudget(budget.id)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleExportPDF(budget)}
                                                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Exportar PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 order-1 sm:order-2">
                                            {BudgetUtils.canModify(budget) && (
                                                <button
                                                    onClick={() => handleEditBudget(budget.id)}
                                                    className="flex items-center bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
                                                >
                                                    Editar
                                                </button>
                                            )}

                                            {BudgetUtils.canActivate(budget) && (
                                                <button
                                                    onClick={() => handleActivateBudget(budget)}
                                                    disabled={isLoadingActivate}
                                                    className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
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
                                                    onClick={() => handleCompleteBudget(budget)}
                                                    disabled={isLoadingComplete}
                                                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
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

                                            {BudgetUtils.canDelete(budget) && (
                                                <button
                                                    onClick={() => handleDeleteBudget(budget.id)}
                                                    disabled={isLoadingDelete}
                                                    className="flex items-center bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
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
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Estado vacío responsivo */
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-8 sm:p-12 text-center">
                    <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Sin presupuestos creados</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        Crea el primer presupuesto para este paciente
                    </p>
                    <button 
                        onClick={handleCreateNewBudget}
                        className="w-full sm:w-auto flex items-center justify-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Primer Presupuesto
                    </button>
                </div>
            )}

            {/* Modal de confirmación */}
            <ConfirmationModal
                isOpen={confirmation.isOpen}
                title={confirmation.title}
                message={confirmation.message}
                details={confirmation.details}
                confirmText={confirmation.confirmText}
                cancelText={confirmation.cancelText}
                variant={confirmation.variant}
                isLoading={confirmation.isLoading}
                onConfirm={confirmation.onConfirm}
                onCancel={confirmation.onCancel}
            />
        </div>
    );
};

export { PatientBudgetDisplay };