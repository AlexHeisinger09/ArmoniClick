// src/core/use-cases/budgets/delete-budget-item.use-case.ts
import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export interface DeleteBudgetItemResponse {
  message: string;
  deletedTreatments: number;
  newBudgetTotal: number;
}

/**
 * Use case para eliminar un item específico del presupuesto
 * Elimina el budget_item y todos sus tratamientos asociados en cascada
 * Recalcula el total del presupuesto automáticamente
 * @param fetcher - Adaptador HTTP
 * @param budgetItemId - ID del item del presupuesto a eliminar
 */
export const deleteBudgetItemUseCase = async (
  fetcher: HttpAdapter,
  budgetItemId: number
): Promise<DeleteBudgetItemResponse> => {
  const response = await fetcher.delete<DeleteBudgetItemResponse>(
    `/budgets/items/${budgetItemId}`
  );

  return response;
};
