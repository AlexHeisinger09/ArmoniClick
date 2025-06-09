import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export const registerUserUseCase = async (fetcher: HttpAdapter, body: Record<string,string>): Promise<MsgResponse> => {
	const register = await fetcher.post<MsgResponse>("/auth/register", body);

	return register;
}