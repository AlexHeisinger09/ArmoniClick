export interface BudgetItemDto {
  pieza?: string;
  accion: string;
  valor: number;
  orden?: number;
}

export class SaveBudgetDto {
  private constructor(
    public readonly patientId: number,
    public readonly budgetType: string,
    public readonly items: BudgetItemDto[]
  ) {}

  static create(object: { [key: string]: any }): [string?, SaveBudgetDto?] {
    const { patientId, budgetType, items } = object;

    // Validaciones básicas
    if (!patientId) return ["ID del paciente es requerido"];
    if (isNaN(Number(patientId))) return ["ID del paciente debe ser un número"];
    
    if (!budgetType) return ["Tipo de presupuesto es requerido"];
    if (!['odontologico', 'estetica'].includes(budgetType)) {
      return ["Tipo de presupuesto debe ser 'odontologico' o 'estetica'"];
    }

    if (!Array.isArray(items)) return ["Items debe ser un array"];
    if (items.length === 0) return ["Debe incluir al menos un item en el presupuesto"];

    // Validar cada item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.accion?.trim()) {
        return [`Item ${i + 1}: Acción/tratamiento es requerido`];
      }
      
      if (!item.valor || isNaN(Number(item.valor))) {
        return [`Item ${i + 1}: Valor debe ser un número válido`];
      }
      
      if (Number(item.valor) <= 0) {
        return [`Item ${i + 1}: Valor debe ser mayor a 0`];
      }

      // Validar pieza si se proporciona
      if (item.pieza && typeof item.pieza !== 'string') {
        return [`Item ${i + 1}: Pieza debe ser texto`];
      }

      // Validar orden si se proporciona
      if (item.orden !== undefined && isNaN(Number(item.orden))) {
        return [`Item ${i + 1}: Orden debe ser un número`];
      }
    }

    // Normalizar items
    const normalizedItems: BudgetItemDto[] = items.map((item, index) => ({
      pieza: item.pieza?.trim() || undefined,
      accion: item.accion.trim(),
      valor: Number(item.valor),
      orden: item.orden !== undefined ? Number(item.orden) : index,
    }));

    return [undefined, new SaveBudgetDto(
      Number(patientId),
      budgetType.trim(),
      normalizedItems
    )];
  }
}