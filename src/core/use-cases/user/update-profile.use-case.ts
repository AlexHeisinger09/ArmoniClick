import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export const updateProfileUseCase = async (
  fetcher: HttpAdapter,
  body: Record<string, string>
): Promise<MsgResponse> => {
  const response = await fetcher.put<MsgResponse>("/user/profile", body);
  return response;
};