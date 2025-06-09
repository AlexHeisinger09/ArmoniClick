import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";


export const confirmAccountUseCase = async(fetcher: HttpAdapter, id: string): Promise<MsgResponse> => {
  const confirmAccount = await fetcher.get<MsgResponse>(`/auth/validate-email/${id}`);

  return confirmAccount;
}