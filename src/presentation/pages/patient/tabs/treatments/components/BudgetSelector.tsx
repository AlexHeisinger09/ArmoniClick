// src/presentation/pages/patient/tabs/treatments/components/BudgetSelector.tsx
import React from 'react';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { BudgetSummary } from "@/core/use-cases/treatments";

interface BudgetSelectorProps {
  budgets: BudgetSummary[];
  selectedBudgetId: number | null;
  activeBudgetId: number | null;
  onBudgetChange: (budgetId: number | null) => void;
  loading: boolean;
}

const BudgetSelector: React.FC<BudgetSelectorProps> = ({
  budgets,
  selectedBudgetId,
  activeBudgetId,
  onBudgetChange,
  loading
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activo':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'pendiente':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'pendiente':
        return 'Pendiente';
      case 'borrador':
        return 'Borrador';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pendiente':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const formatCurrency = (amount: string): string => {
    return parseFloat(amount).toLocaleString('es-CL');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-cyan-100 p-2 rounded-full">
            <FileText className="w-5 h-5 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Presupuestos</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-slate-500 mb-2">No hay presupuestos creados</p>
          <p className="text-sm text-slate-400">
            Crea un presupuesto primero para poder generar tratamientos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-cyan-100 p-2 rounded-full">
          <FileText className="w-5 h-5 text-cyan-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">
          Seleccionar Presupuesto
        </h3>
      </div>

      <div className="space-y-3">
        {/* Lista de presupuestos */}
        {budgets.map((budget) => (
          <div
            key={budget.id}
            onClick={() => onBudgetChange(budget.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedBudgetId === budget.id
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-200 hover:border-cyan-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-slate-700">
                    Presupuesto #{budget.id}
                  </h4>
                  
                  {/* Badge de estado */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                    {getStatusIcon(budget.status)}
                    <span className="ml-1">{getStatusLabel(budget.status)}</span>
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span>
                    {budget.budget_type === 'odontologico' ? 'Odontológico' : 'Estética'}
                  </span>
                  <span>•</span>
                  <span>{formatDate(budget.created_at)}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-slate-700">
                  ${formatCurrency(budget.total_amount)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-600">
          💡 <strong>Tip:</strong> Los tratamientos se generan automáticamente al activar un presupuesto. 
          Solo los presupuestos activos pueden generar nuevos tratamientos.
        </p>
      </div>
    </div>
  );
};

export { BudgetSelector };