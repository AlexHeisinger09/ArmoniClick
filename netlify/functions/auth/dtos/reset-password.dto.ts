import { REGEX } from '../../../config/utils/regular-exp';

export class ResetPasswordDto {
  private constructor(public readonly email: string) {}

  static create(object: { [key: string]: any }): [string?, ResetPasswordDto?] {
    const { email } = object;

    if (!email) return ["Missing email"];
    if (!REGEX.email.test(email)) return ["Email is not valid"];

    return [undefined, new ResetPasswordDto(email)];
  }
}
