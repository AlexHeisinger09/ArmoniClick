import { User } from "../../core/entities/user.entity";
import { ProfileResponse } from "../interfaces/user.response";

export class UserMapper {
  static fromAuthResponseToUserProfile(response: ProfileResponse): User {
    return {
      id: response.id,
      rut: response.rut,
      lastName: response.lastName,
      username: response.username,
      name: response.name,
      email: response.email,
      img: response.img,
      signature: response.signature, // ✅ MAPEAR CAMPO SIGNATURE
      country: response.country,
      city: response.city || '',
      zipCode: response.zipCode || '',
      address: response.address || '',
      phone: response.phone || '',
    };
  }
}