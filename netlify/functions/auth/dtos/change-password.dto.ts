export class ChangePasswordDto {
  private constructor(public newPassword: string) {}

  static create(object: { [key: string]: any }): [string?, ChangePasswordDto?] {
    const { newPassword } = object;

    if (!newPassword) return ["Missing new password"];
    if (newPassword.length < 6)
      return ["Password too short, minimum 6 characters"];

    return [undefined, new ChangePasswordDto(newPassword)];
  }
}
