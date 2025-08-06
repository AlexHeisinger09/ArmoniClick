// src/presentation/pages/patient/tabs/treatments/components/BudgetSidebar.tsx
import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import { BudgetSummary, Treatment } from "@/core/use-cases/treatments";

interface BudgetSidebarProps {
  budgets: BudgetSummary[];
  activeBudget: BudgetSummary | null;
  selectedBudgetId: number | null;
  onBudgetChange: (budgetId: number | null) => void;
  loading: boolean;
  treatments?: Treatment[]; // ✅ NUEVO: Para calcular estadísticas reales
}

const BudgetSidebar: React.FC<BudgetSidebarProps> = ({
  budgets,
  activeBudget,
  selectedBudgetId,
  onBudgetChange,
  loading,
  treatments = []
}) => {
  const formatCurrency = (amount: string | number): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numericAmount.toLocaleString('es-CL');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // ✅ CALCULAR ESTADÍSTICAS REALES DE TRATAMIENTOS
  const calculateTreatmentStats = () => {
    if (!activeBudget || !treatments.length) {
      return {
        totalBudget: activeBudget ? parseFloat(activeBudget.total_amount) : 0,
        completed: 0,
        pending: 0
      };
    }

    const totalBudget = parseFloat(activeBudget.total_amount);
    
    // Calcular valor de tratamientos completados
    const completed = treatments
      .filter(t => t.status === 'completed' && t.budget_item_valor)
      .reduce((sum, t) => sum + parseFloat(t.budget_item_valor || '0'), 0);
    
    // Calcular valor de tratamientos no realizados (pendientes)
    const pending = totalBudget - completed;

    return {
      totalBudget,
      completed,
      pending: Math.max(0, pending) // No puede ser negativo
    };
  };

  const stats = calculateTreatmentStats();

  if (loading) {
    return (
      <div className="bg-white h-full rounded-xl border border-cyan-200">
        {/* Header */}
        <div className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-xl">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full rounded-xl border border-cyan-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-100 p-2 rounded-full">
            <FileText className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700">Plan de tratamiento</h3>
            <p className="text-sm text-slate-500">#{activeBudget?.id || 'Sin seleccionar'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!activeBudget ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-slate-500 mb-2">No hay presupuesto activo</p>
            <p className="text-sm text-slate-400">
              Crea y activa un presupuesto para generar tratamientos
            </p>
          </div>
        ) : (
          <div className="p-4">
            {/* ✅ SOLO PRESUPUESTO ACTIVO */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-100/50 to-blue-100/50 rounded-xl"></div>
              <div className="relative p-4 border-2 border-cyan-300 rounded-xl bg-white/80 backdrop-blur-sm">
                {/* Nuevo Plan de tratamiento */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    
                    
                  </div>
                </div>

                {/* Presupuesto total */}
                <div className="mb-3">
                  <div className="text-xs text-slate-500">Presupuesto total</div>
                  <div className="text-2xl font-bold text-slate-700">
                    ${formatCurrency(stats.totalBudget)}
                  </div>
                </div>

                {/* ✅ ESTADÍSTICAS REALES */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Realizado</div>
                    <div className="text-sm font-semibold text-green-600">
                      ${formatCurrency(stats.completed)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">No Realizado</div>
                    <div className="text-sm font-semibold text-orange-600">
                      ${formatCurrency(stats.pending)}
                    </div>
                  </div>
                </div>

                {/* Badge de estado */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activeBudget.status)}`}>
                    {getStatusIcon(activeBudget.status)}
                    <span className="ml-1">{getStatusLabel(activeBudget.status)}</span>
                  </span>
                  <div className="text-xs text-slate-500">
                    {formatDate(activeBudget.created_at)}
                  </div>
                </div>

                {/* ✅ INFORMACIÓN DE PROGRESO */}
                <div className="mt-3">
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                    <span>Progreso</span>
                    <span>{stats.totalBudget > 0 ? Math.round((stats.completed / stats.totalBudget) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stats.totalBudget > 0 ? Math.min(100, (stats.completed / stats.totalBudget) * 100) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con tip */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        <div className="text-xs text-slate-600">
          💡 <strong>Tip:</strong> Los tratamientos se generan automáticamente al activar un presupuesto.
        </div>
      </div>
    </div>
  );
};

export { BudgetSidebar };