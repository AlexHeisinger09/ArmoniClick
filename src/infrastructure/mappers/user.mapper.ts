import { User } from "../../core/entities/user.entity";
import { ProfileResponse } from "../interfaces/user.response";

export class UserMapper {
  static fromAuthResponseToUserProfile(response: ProfileResponse): User {
    return {
      id: response.id,
      lastName: response.lastName,
      username: response.username,
      name: response.name,
      email: response.email,
      img: response.img,
      country: response.country,
    };
  }
}
