// src/presentation/pages/patient/tabs/budget/types/budget.types.ts
import { Patient } from "@/core/use-cases/patients";
import { BudgetItem, Budget } from "@/core/use-cases/budgets";

export interface PatientBudgetProps {
    patient: Patient;
}

export interface NotificationProps {
    type: 'success' | 'error' | 'info';
    message: string;
    onClose: () => void;
}

export interface BudgetFormData {
    pieza: string;
    accion: string;
    valor: string;
}

export interface BudgetListProps {
    budgets: Budget[];
    patient: Patient;
    onCreateNew: () => void;
    onEdit: (budget: Budget) => void;
    onView: (budget: Budget) => void;
    onActivate: (budget: Budget) => void;
    onComplete: (budget: Budget) => void;
    onRevert: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    onExportPDF: (budget: Budget) => void;
    isLoadingActivate?: boolean;
    isLoadingComplete?: boolean;
    isLoadingRevert?: boolean;
    isLoadingDelete?: boolean;
}

export interface BudgetEditorProps {
    patient: Patient;
    budget: Budget | null;
    items: BudgetItem[];
    budgetType: string;
    newItem: BudgetFormData;
    editingItem: BudgetFormData;
    isEditing: string | null;
    hasUnsavedChanges: boolean;
    isLoadingSave: boolean;
    onBack: () => void;
    onSave: () => void;
    onBudgetTypeChange: (type: string) => void;
    onAddItem: () => void;
    onDeleteItem: (index: number) => void;
    onStartEditing: (index: number) => void;
    onCancelEditing: () => void;
    onSaveEditing: () => void;
    onNewItemChange: (field: keyof BudgetFormData, value: string) => void;
    onEditingItemChange: (field: keyof BudgetFormData, value: string) => void;
    onExportPDF: () => void;
}

export interface BudgetCardProps {
    budget: Budget;
    onView: (budget: Budget) => void;
    onEdit: (budget: Budget) => void;
    onActivate: (budget: Budget) => void;
    onComplete: (budget: Budget) => void;
    onRevert: (budget: Budget) => void;
    onDelete: (budget: Budget) => void;
    onExportPDF: (budget: Budget) => void;
    isLoadingActivate?: boolean;
    isLoadingComplete?: boolean;
    isLoadingRevert?: boolean;
    isLoadingDelete?: boolean;
}

// Constantes para tratamientos
export const ODONTOLOGICO_TREATMENTS = [
    'Destartraje', 'Resina Compuesta OM', 'Resina Compuesta OD',
    'Corona Cerámica', 'Corona Metal-Cerámica', 'Endodoncia Premolar',
    'Endodoncia Molar', 'Extracción Simple', 'Extracción Quirúrgica',
    'Implante Dental', 'Prótesis Parcial', 'Prótesis Total',
    'Ortodoncia', 'Limpieza Dental', 'Sellante', 'Pulpotomía', 'Apiceptomía'
];

export const ESTETICA_TREATMENTS = [
    'Diseño de Sonrisa', 'Armonización Facial', 'Botox Terapéutico',
    'Ácido Hialurónico', 'Blanqueamiento Profesional'
];

// Utilidades
export const BudgetFormUtils = {
    formatCurrency: (amount: number): string => {
        return amount.toLocaleString('es-CL');
    },

    formatDate: (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    formatValueInput: (value: string): string => {
        const cleanValue = value.replace(/[^\d]/g, '');
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },

    parseValue: (value: string): number => {
        return parseFloat(value.replace(/\./g, ''));
    },

    calculateTotal: (items: BudgetItem[]): number => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (Number(item?.valor) || 0), 0);
    },

    validateItem: (item: BudgetFormData): string | null => {
        if (!item.pieza || !item.accion || !item.valor) {
            return 'Por favor completa todos los campos';
        }

        const valor = BudgetFormUtils.parseValue(item.valor);
        if (isNaN(valor) || valor <= 0) {
            return 'El valor debe ser un número válido mayor a 0';
        }

        return null;
    }
};