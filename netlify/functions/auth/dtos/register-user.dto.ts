import { REGEX } from '../../../config/utils/regular-exp';

export class RegisterUserDto {
  private constructor(
    public readonly name: string,
    public readonly lastName: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string
  ) {}

  static create(object: { [key: string]: any }): [string?, RegisterUserDto?] {
    const { name,lastName,username, email, password } = object;

    if (!name) return ["Missing name"];
    if (!lastName) return ["Missing lastName"];
    if (!username) return ["Missing username"];
    if (!email) return ["Missing email"];
    if (!REGEX.email.test(email)) return ["Email is not valid"];
    if (!password) return ["Missing password"];
    if (password.length < 6)
      return ["Password too short, minimum 6 characters"];

    return [undefined, new RegisterUserDto(name,lastName,username, email, password)];
  }
}
