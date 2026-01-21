import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { BUDGET_TYPE } from "@/core/use-cases/budgets";
import { BudgetFormData, BudgetFormUtils } from '../types/budget.types';
import { useServices } from '@/presentation/hooks/services/useServices';

interface BudgetItemFormProps {
    budgetType: string;
    newItem: BudgetFormData;
    onItemChange: (field: keyof BudgetFormData, value: string) => void;
    onAddItem: () => void;
    canEdit: boolean;
}

const BudgetItemForm: React.FC<BudgetItemFormProps> = ({
    budgetType,
    newItem,
    onItemChange,
    onAddItem,
    canEdit
}) => {
    // ✅ OBTENER SERVICIOS DE LA BASE DE DATOS
    const { services, isLoading } = useServices();

    // ✅ Estado local para controlar el select
    const [selectedServiceId, setSelectedServiceId] = useState('');

    // ✅ NO resetear el select - solo se limpia la pieza para agregar el mismo tratamiento varias veces
    // El doctor puede seleccionar el mismo servicio para diferentes piezas sin tener que buscarlo de nuevo

    // ✅ FILTRAR SERVICIOS POR TIPO
    const filteredServices = services.filter(
        service => service.tipo === budgetType
    );

    const handleServiceSelect = (serviceId: string) => {
        setSelectedServiceId(serviceId);

        if (!serviceId) {
            onItemChange('accion', '');
            onItemChange('valor', '');
            return;
        }

        const service = services.find(s => s.id === parseInt(serviceId));
        if (service) {
            onItemChange('accion', service.nombre);
            onItemChange('valor', BudgetFormUtils.formatCurrency(parseFloat(service.valor)));
        }
    };

    const handleValueChange = (value: string) => {
        const formattedValue = BudgetFormUtils.formatValueInput(value);
        onItemChange('valor', formattedValue);
    };

    if (!canEdit) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                Agregar Tratamiento
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        {budgetType === BUDGET_TYPE.ODONTOLOGICO ? 'Pieza' : 'Zona'}
                    </label>
                    <input
                        type="text"
                        value={newItem.pieza}
                        onChange={(e) => onItemChange('pieza', e.target.value)}
                        placeholder={budgetType === BUDGET_TYPE.ODONTOLOGICO ? "1.1, 1.2" : "Frente, Pómulos"}
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tratamiento
                    </label>
                    
                    {isLoading ? (
                        <div className="w-full px-3 py-2 border border-cyan-200 rounded-xl bg-slate-50">
                            <span className="text-slate-400 text-sm">Cargando servicios...</span>
                        </div>
                    ) : (
                        <>
                            {/* Select con servicios de la base de datos */}
                            <select
                                value={selectedServiceId}
                                onChange={(e) => handleServiceSelect(e.target.value)}
                                className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                            >
                                <option value="">Seleccionar servicio...</option>
                                {filteredServices.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.nombre} - ${BudgetFormUtils.formatCurrency(parseFloat(service.valor))}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Input para tratamiento personalizado */}
                            <input
                                type="text"
                                value={newItem.accion}
                                onChange={(e) => onItemChange('accion', e.target.value)}
                                placeholder="O escriba un tratamiento personalizado"
                                className="w-full px-3 py-1 mt-2 border border-cyan-100 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-cyan-400"
                            />
                        </>
                    )}
                </div>

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
                    <input
                        type="text"
                        value={newItem.valor}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="25.000"
                        className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                </div>

                <button
                    onClick={() => onAddItem()}
                    className="w-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl text-sm px-4 py-2.5 transition-colors shadow-sm h-[42px]"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                </button>
            </div>
        </div>
    );
};

export { BudgetItemForm };