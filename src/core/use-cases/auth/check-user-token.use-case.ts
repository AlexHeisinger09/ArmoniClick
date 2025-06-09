
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";


export const checkUserTokenUseCase = async (
  fetcher: HttpAdapter,
  token: string
): Promise<MsgResponse> => {
  const resetPassword = await fetcher.get<MsgResponse>(
    `/auth/change-password/${token}`,
  );

  return resetPassword;
};
