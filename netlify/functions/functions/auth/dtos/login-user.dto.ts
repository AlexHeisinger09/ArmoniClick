import { REGEX } from '../../../config/utils';

export class LoginUserDto {
  private constructor(
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: { [key: string]: any }): [string?, LoginUserDto?] {
    const { email, password } = object;

    if (!email) return ["Missing email"];
    if (!REGEX.email.test(email)) return ["Email is not valid"];
    if (!password) return ["Missing password"];
    if (password.length < 6)
      return ["Password too short, minimum 6 characters"];

    return [undefined, new LoginUserDto(email, password)];
  }
}
