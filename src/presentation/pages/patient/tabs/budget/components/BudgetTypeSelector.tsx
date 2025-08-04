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
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-full">
                        <Sparkles className="w-6 h-6 text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-700">Tipo de Presupuesto</h3>
                        <p className="text-sm text-slate-500">
                            {canEdit ? 'Selecciona el tipo de presupuesto a generar' : 'Tipo de presupuesto (solo lectura)'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => canEdit && onTypeChange(BUDGET_TYPE.ODONTOLOGICO)}
                    disabled={!canEdit}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        budgetType === BUDGET_TYPE.ODONTOLOGICO
                            ? 'border-cyan-500 bg-cyan-50 shadow-md'
                            : 'border-gray-200 hover:border-cyan-300'
                    } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                            budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'bg-cyan-500' : 'bg-gray-300'
                        }`}>
                            <Stethoscope className={`w-5 h-5 ${
                                budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-slate-700">Odontológico</h4>
                            <p className="text-sm text-slate-500">Tratamientos dentales generales</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => canEdit && onTypeChange(BUDGET_TYPE.ESTETICA)}
                    disabled={!canEdit}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        budgetType === BUDGET_TYPE.ESTETICA
                            ? 'border-cyan-500 bg-cyan-50 shadow-md'
                            : 'border-gray-200 hover:border-cyan-300'
                    } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                            budgetType === BUDGET_TYPE.ESTETICA ? 'bg-cyan-500' : 'bg-gray-300'
                        }`}>
                            <Sparkles className={`w-5 h-5 ${
                                budgetType === BUDGET_TYPE.ESTETICA ? 'text-white' : 'text-gray-600'
                            }`} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-slate-700">Estética</h4>
                            <p className="text-sm text-slate-500">Tratamientos estéticos y armonización</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export { BudgetTypeSelector };