// src/presentation/pages/patient/tabs/budget/PatientBudget.tsx - ACTUALIZADO CON MODAL
import React, { useState } from 'react';
import { Patient } from "@/core/use-cases/patients";
import { Budget } from "@/core/use-cases/budgets";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";

// Componentes
import { BudgetsList } from './components/BudgetList';
import { BudgetModal } from './components/BudgetModal';
import { PDFGenerator } from './utils/pdfGenerator';
import { useNotification } from '@/presentation/hooks/notifications/useNotification';

// Hooks para datos del doctor
import { useLoginMutation, useProfile } from "@/presentation/hooks";

interface PatientBudgetProps {
    patient: Patient;
}

const PatientBudget: React.FC<PatientBudgetProps> = ({ patient }) => {
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

    // Estados del modal
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        budget: Budget | null;
        mode: 'create' | 'edit' | 'view';
    }>({
        isOpen: false,
        budget: null,
        mode: 'create'
    });

    // Notification hook
    const notification = useNotification();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Función para procesar errores de API
    const processApiError = (error: any): string => {
        if (!error.response) {
            return `Error de conexión: ${error.message || 'No se pudo conectar al servidor'}`;
        }

        const status = error.response?.status;
        const data = error.response?.data;

        let errorMessage = `Error ${status}`;

        if (data) {
            if (typeof data === 'string') {
                errorMessage += `: ${data}`;
            } else if (data.message) {
                errorMessage += `: ${data.message}`;
            } else {
                errorMessage += `: ${JSON.stringify(data)}`;
            }
        }

        return errorMessage;
    };

    // ✅ FUNCIONES DEL MODAL
    const handleCreateNewBudget = () => {
        setModalState({
            isOpen: true,
            budget: null,
            mode: 'create'
        });
    };

    const handleEditBudget = (budget: Budget) => {
        setModalState({
            isOpen: true,
            budget: budget,
            mode: 'edit'
        });
    };

    const handleViewBudget = (budget: Budget) => {
        setModalState({
            isOpen: true,
            budget: budget,
            mode: 'view'
        });
    };

    const handleCloseModal = () => {
        setModalState({
            isOpen: false,
            budget: null,
            mode: 'create'
        });
    };

    // ✅ OPERACIONES DE PRESUPUESTO (mantienen la misma lógica)
    const handleActivateBudget = async (budget: Budget) => {
        try {
            await activateBudget(budget.id);
            notification.success('Presupuesto activado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
        }
    };

    const handleCompleteBudget = async (budget: Budget) => {
        try {
            await completeBudget(budget.id);
            notification.success('Presupuesto completado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
        }
    };

    const handleRevertBudget = async (budget: Budget) => {
        try {
            await revertBudget(budget.id);
            notification.success('Presupuesto revertido a borrador');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await deleteBudget(budget.id);
            notification.success('Presupuesto eliminado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            notification.error(errorMessage);
        }
    };

    const handleExportPDF = async (budget: Budget) => {
        setIsGeneratingPDF(true);
        
        try {
            const doctorData = queryProfile.data ? {
                name: queryProfile.data.name,
                lastName: queryProfile.data.lastName,
                rut: queryProfile.data.rut,
                signature: queryProfile.data.signature
            } : undefined;

            await PDFGenerator.generateBudgetPDF(budget, patient, doctorData);
            notification.success('PDF generado exitosamente');

        } catch (error: any) {
            const errorMessage = error.message || 'Error al generar PDF';
            notification.error(errorMessage);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <>
            {/* Lista de presupuestos */}
            <BudgetsList
                budgets={sortedBudgets}
                loading={isLoadingAll}
                onView={handleViewBudget}
                onEdit={handleEditBudget}
                onActivate={handleActivateBudget}
                onComplete={handleCompleteBudget}
                onRevert={handleRevertBudget}
                onDelete={handleDeleteBudget}
                onExportPDF={handleExportPDF}
                onNewBudget={handleCreateNewBudget}
                isLoadingActivate={isLoadingActivate}
                isLoadingComplete={isLoadingComplete}
                isLoadingRevert={isLoadingRevert}
                isLoadingDelete={isLoadingDelete}
            />

            {/* Modal de presupuesto */}
            <BudgetModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                patient={patient}
                budget={modalState.budget}
                mode={modalState.mode}
            />


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
        </>
    );
};

export { PatientBudget };