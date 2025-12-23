import { HttpAdapter } from "@/config/adapters/http/http.adapter";

import { User } from "@/core/entities/user.entity";

import { ProfileResponse } from "@/infrastructure/interfaces/user.response";
import { UserMapper } from "@/infrastructure/mappers/user.mapper";

export const profileUseCase = async (
  fetcher: HttpAdapter,
): Promise<User> => {
  const profile = await fetcher.get<ProfileResponse>("/user/profile", {});
  console.log('🔍 Profile from backend:', profile);
  console.log('🔍 Logo field:', profile.logo);

  return UserMapper.fromAuthResponseToUserProfile(profile);
};
