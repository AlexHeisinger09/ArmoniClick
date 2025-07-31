export class UpdateBudgetStatusDto {
  private constructor(
    public readonly status: string
  ) {}

  static create(object: { [key: string]: any }): [string?, UpdateBudgetStatusDto?] {
    const { status } = object;

    if (!status) return ["Estado es requerido"];
    
    const validStatuses = ['borrador', 'activo', 'completed'];
    if (!validStatuses.includes(status)) {
      return [`Estado debe ser uno de: ${validStatuses.join(', ')}`];
    }

    return [undefined, new UpdateBudgetStatusDto(status.trim())];
  }
}