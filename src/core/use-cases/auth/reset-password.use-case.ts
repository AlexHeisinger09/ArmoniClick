import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces";

export const resetPasswordUseCase = async (
  fetcher: HttpAdapter,
  body: Record<string, string>
): Promise<MsgResponse> => {
  const resetPassword = await fetcher.post<MsgResponse>("/auth/reset-password",body);

  return resetPassword;
};
