import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export interface CompleteBudgetItemResponse {
  message: string;
  valor: string;
}

export const completeBudgetItemUseCase = async (
  fetcher: HttpAdapter,
  budgetItemId: number
): Promise<CompleteBudgetItemResponse> => {
  const response = await fetcher.put<CompleteBudgetItemResponse>(
    `/budgets/items/${budgetItemId}/complete`,
    {}
  );
  return response;
};
