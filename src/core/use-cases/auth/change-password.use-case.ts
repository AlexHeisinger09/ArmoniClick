import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export const changePasswordUseCase = async (
  fetcher: HttpAdapter,
  body: Record<string, string>,
  token: string,
): Promise<MsgResponse> => {
  const resetPassword = await fetcher.post<MsgResponse>(
    `/auth/change-password/${token}`,
    body
  );

  return resetPassword;
};
