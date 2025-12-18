// src/core/use-cases/budgets/add-budget-item.use-case.ts
import type { HttpAdapter } from '@/config/adapters/http/http.adapter';

export const addBudgetItemUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number,
  data: {
    pieza?: string;
    accion: string;
    valor: number;
  }
): Promise<{ budgetItemId: number }> => {
  const response = await fetcher.post<{
    budgetItemId: number;
    message: string;
  }>(`/budgets/${budgetId}/items`, data);

  return { budgetItemId: response.budgetItemId };
};
