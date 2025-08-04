// src/presentation/pages/patient/tabs/budget/PatientBudget.tsx - ESTRUCTURA SIMPLIFICADA
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Patient } from "@/core/use-cases/patients";
import { Budget } from "@/core/use-cases/budgets";
import { useMultipleBudgetOperations } from "@/presentation/hooks/budgets/useBudgets";

// Componentes
import { BudgetsList } from './components/BudgetList';
import { Notification } from './components/Notification';
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

    // Navegación a páginas separadas
    const handleCreateNewBudget = () => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}`);
    };

    const handleEditBudget = (budget: Budget) => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budget.id}&mode=edit`);
    };

    const handleViewBudget = (budget: Budget) => {
        navigate(`/dashboard/presupuestos?patientId=${patient.id}&budgetId=${budget.id}&mode=view`);
    };

    // Operaciones de presupuesto
    const handleActivateBudget = async (budget: Budget) => {
        try {
            await activateBudget(budget.id);
            showNotification('success', 'Presupuesto activado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            showNotification('error', errorMessage);
        }
    };

    const handleCompleteBudget = async (budget: Budget) => {
        try {
            await completeBudget(budget.id);
            showNotification('success', 'Presupuesto completado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            showNotification('error', errorMessage);
        }
    };

    const handleRevertBudget = async (budget: Budget) => {
        try {
            await revertBudget(budget.id);
            showNotification('success', 'Presupuesto revertido a borrador');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            showNotification('error', errorMessage);
        }
    };

    const handleDeleteBudget = async (budget: Budget) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await deleteBudget(budget.id);
            showNotification('success', 'Presupuesto eliminado exitosamente');
        } catch (error: any) {
            const errorMessage = processApiError(error);
            showNotification('error', errorMessage);
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

    return (
        <>
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
        </>
    );
};

export { PatientBudget };