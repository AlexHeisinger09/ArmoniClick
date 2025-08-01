// netlify/functions/budgets/dtos/save-budget.dto.ts - AJUSTE BACKEND

export interface BudgetItemDto {
  id?: number;        // ✅ AGREGAR ESTA LÍNEA
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

    // ✅ PARSEAR items preservando IDs
    let parsedItems;
    try {
      if (typeof items === 'string') {
        parsedItems = JSON.parse(items);
      } else {
        parsedItems = items;
      }
    } catch (error) {
      return ["Items debe ser un JSON válido"];
    }

    console.log('🔍 DTO - Items parseados:', parsedItems);

    if (!Array.isArray(parsedItems)) return ["Items debe ser un array"];
    if (parsedItems.length === 0) return ["Debe incluir al menos un item en el presupuesto"];

    // Validar cada item
    for (let i = 0; i < parsedItems.length; i++) {
      const item = parsedItems[i];
      
      if (!item.accion?.trim()) {
        return [`Item ${i + 1}: Acción/tratamiento es requerido`];
      }
      
      if (!item.valor || isNaN(Number(item.valor))) {
        return [`Item ${i + 1}: Valor debe ser un número válido`];
      }
      
      if (Number(item.valor) <= 0) {
        return [`Item ${i + 1}: Valor debe ser mayor a 0`];
      }

      // ✅ VALIDAR ID si se proporciona
      if (item.id !== undefined && isNaN(Number(item.id))) {
        return [`Item ${i + 1}: ID debe ser un número`];
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

    // ✅ NORMALIZAR items PRESERVANDO IDs
    const normalizedItems: BudgetItemDto[] = parsedItems.map((item, index) => {
      const normalizedItem: BudgetItemDto = {
        pieza: item.pieza?.trim() || undefined,
        accion: item.accion.trim(),
        valor: Number(item.valor),
        orden: item.orden !== undefined ? Number(item.orden) : index,
      };

      // ✅ PRESERVAR ID si existe y es válido
      if (item.id !== undefined && item.id !== null && !isNaN(Number(item.id)) && Number(item.id) > 0) {
        normalizedItem.id = Number(item.id);
        console.log(`🔍 DTO - Preservando ID ${normalizedItem.id} para item: ${normalizedItem.accion}`);
      } else {
        console.log(`🔍 DTO - Item sin ID (nuevo): ${normalizedItem.accion}`);
      }

      return normalizedItem;
    });

    console.log('🔍 DTO - Items normalizados finales:', normalizedItems);

    return [undefined, new SaveBudgetDto(
      Number(patientId),
      budgetType.trim(),
      normalizedItems
    )];
  }
}