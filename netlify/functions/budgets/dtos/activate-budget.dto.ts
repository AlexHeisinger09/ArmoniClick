export class ActivateBudgetDto {
  private constructor() {}

  static create(object: { [key: string]: any }): [string?, ActivateBudgetDto?] {
    // No necesita validaciones adicionales por ahora
    return [undefined, new ActivateBudgetDto()];
  }
}