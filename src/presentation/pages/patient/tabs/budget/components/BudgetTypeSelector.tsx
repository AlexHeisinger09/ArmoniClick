// src/presentation/pages/patient/tabs/budget/components/BudgetTypeSelector.tsx
import React from 'react';
import { Stethoscope, Sparkles } from 'lucide-react';
import { BUDGET_TYPE } from "@/core/use-cases/budgets";

interface BudgetTypeSelectorProps {
    budgetType: string;
    onTypeChange: (type: string) => void;
    canEdit: boolean;
}

const BudgetTypeSelector: React.FC<BudgetTypeSelectorProps> = ({ 
    budgetType, 
    onTypeChange, 
    canEdit 
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-2">
                    <div className="bg-cyan-100 p-1.5 rounded-lg">
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700">Tipo de Presupuesto</h3>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => canEdit && onTypeChange(BUDGET_TYPE.ODONTOLOGICO)}
                        disabled={!canEdit}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                            budgetType === BUDGET_TYPE.ODONTOLOGICO
                                ? 'border-cyan-500 bg-cyan-50'
                                : 'border-gray-200 hover:border-cyan-300'
                        } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <div className={`p-1 rounded-full ${
                            budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'bg-cyan-500' : 'bg-gray-300'
                        }`}>
                            <Stethoscope className={`w-3.5 h-3.5 ${
                                budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Odontológico</span>
                    </button>

                    <button
                        onClick={() => canEdit && onTypeChange(BUDGET_TYPE.ESTETICA)}
                        disabled={!canEdit}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
                            budgetType === BUDGET_TYPE.ESTETICA
                                ? 'border-cyan-500 bg-cyan-50'
                                : 'border-gray-200 hover:border-cyan-300'
                        } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        <div className={`p-1 rounded-full ${
                            budgetType === BUDGET_TYPE.ESTETICA ? 'bg-cyan-500' : 'bg-gray-300'
                        }`}>
                            <Sparkles className={`w-3.5 h-3.5 ${
                                budgetType === BUDGET_TYPE.ESTETICA ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Estética</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export { BudgetTypeSelector };