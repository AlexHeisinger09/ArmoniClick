// src/presentation/pages/patient/tabs/budget/PatientBudget.tsx - TAB SIMPLIFICADO
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";
import { Patient } from "@/core/use-cases/patients";
import { Budget, BudgetUtils } from "@/core/use-cases/budgets";

// Importar componentes modulares
import { Notification } from './components/Notification';
import { BudgetCard } from './components/BudgetCard';
import { PDFGenerator } from './utils/pdfGenerator';

// Hooks para datos del doctor
import { useLoginMutation, useProfile } from "@/presentation/hooks";

interface PatientBudgetProps {
    patient: Patient;
}

const PatientBudget: React.FC<PatientBudgetProps> = ({ patient }) => {
    const navigate = useNavigate();
    
    // Hooks para presupuestos
    const {
        sortedBudgets,
        isLoadingAll,
        activateBudget,
        completeBudget,
        revertBudget,
        deleteBudget,
        isLoadingActivate,
        isLoadingComplete,
        isLoadingRevert,
        isLoadingDelete,
    } = useMultipleBudgetOperations(patient.id);

    // Hook para datos del doctor (para PDF)
    const { token } = useLoginMutation();
    const { queryProfile } = useProfile(token || '');

    // Estados locales
    const [notification, setNotification] = useState<{
        type: 'success' | 'error' | 'info';
        message: string;
    } | null>(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    // ✅ NAVEGACIÓN A PÁGINAS SEPARADAS

    const handleCreateNewBudget = () => {
        // Navegar a la página de presupuestos con el paciente preseleccionado
        navigate(`/dashboard/presupuestos?patientId=${patient.id}`);
    };

    const handleEditBudget = (budget: Budget) => {
        if (!BudgetUtils.canModify(budget)) {
            showNotification('error', 'Solo se pueden editar presupuestos en estado borrador');
            return;
        }
        // Navegar a la página de presupuestos para editar
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budget.id}`);
    };

    const handleViewBudget = (budget: Budget) => {
        // Navegar a la página de presupuestos en modo solo lectura
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budget.id}&readonly=true`);
    };

    // ✅ OPERACIONES DE PRESUPUESTO (mantenidas en el tab)

    const handleActivateBudget = async (budget: Budget) => {
        try {
            await activateBudget(budget.id);
            showNotification('success', 'Presupuesto activado exitosamente');
        } catch (error: any) {
            const errorMessage = error?.message || 'Error al activar presupuesto';
            showNotification('error', errorMessage);
        }
    };

    const handleCompleteBudget = async (budget: Budget) => {
        try {
            await completeBudget(budget.id);
            showNotification('success', 'Presupuesto completado exitosamente');
        } catch (error: any) {
            showNotification('error', `Error al completar: ${error.message}`);
        }
    };

    const handleRevertBudget = async (budget: Budget) => {
        try {
            await revertBudget(budget.id);
            showNotification('success', 'Presupuesto revertido a borrador');
        } catch (error: any) {
            showNotification('error', `Error al revertir: ${error.message}`);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        try {
            await deleteBudget(budget.id);
            showNotification('success', 'Presupuesto eliminado exitosamente');
        } catch (error: any) {
            showNotification('error', `Error al eliminar: ${error.message}`);
        }
    };

    const handleExportPDF = async (budget: Budget) => {
        setIsGeneratingPDF(true);
        
        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut
            } : undefined;

            await PDFGenerator.generateBudgetPDF(budget, patient, doctorData);
            showNotification('success', 'PDF generado exitosamente');
            
        } catch (error: any) {
            const errorMessage = error.message || 'Error al generar PDF';
            showNotification('error', errorMessage);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Loading state
    if (isLoadingAll) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notificaciones */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Indicador de generación de PDF */}
            {isGeneratingPDF && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Generando PDF</h3>
                                <p className="text-sm text-gray-500">Por favor espera...</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header simplificado */}
            <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-cyan-100 p-2 rounded-full">
                            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-700">
                                Presupuestos de {patient.nombres} {patient.apellidos}
                            </h3>
                            <p className="text-sm text-slate-500">
                                Visualiza y gestiona los planes de tratamiento
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleCreateNewBudget}
                            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Ir a Presupuestos
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de presupuestos simplificada */}
            {sortedBudgets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedBudgets.map((budget) => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            onView={handleViewBudget}
                            onEdit={handleEditBudget}
                            onActivate={handleActivateBudget}
                            onComplete={handleCompleteBudget}
                            onRevert={handleRevertBudget}
                            onDelete={handleDeleteBudget}
                            onExportPDF={handleExportPDF}
                            isLoadingActivate={isLoadingActivate}
                            isLoadingComplete={isLoadingComplete}
                            isLoadingRevert={isLoadingRevert}
                            isLoadingDelete={isLoadingDelete}
                        />
                    ))}
                </div>
            ) : (
                /* Estado vacío simplificado */
                <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-12 text-center">
                    <div className="bg-slate-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Sin presupuestos creados</h3>
                    <p className="text-slate-500 mb-6">
                        Este paciente no tiene presupuestos aún. Crea el primer plan de tratamiento.
                    </p>
                    <div className="flex items-center justify-center space-x-4">
                        <button 
                            onClick={handleCreateNewBudget}
                            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg px-6 py-3 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Crear Primer Presupuesto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export { PatientBudget };