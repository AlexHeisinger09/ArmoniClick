// netlify/functions/treatments/use-cases/create-treatment.ts - ACTUALIZADO PARA CREAR BUDGET ITEM
import { TreatmentService } from "../../../services/treatment.service";
import { BudgetService } from "../../../services/budget.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { CreateTreatmentDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface CreateTreatmentUseCase {
  execute: (dto: CreateTreatmentDto, doctorId: number) => Promise<HandlerResponse>;
}

export class CreateTreatment implements CreateTreatmentUseCase {
  constructor(
    private readonly treatmentService: TreatmentService = new TreatmentService(),
    private readonly budgetService: BudgetService = new BudgetService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(dto: CreateTreatmentDto, doctorId: number): Promise<HandlerResponse> {
    try {
      let budgetItemId: number | undefined = undefined;

      // ✅ NUEVO: Si hay selectedBudgetId, crear budget item automáticamente
      if (dto.selectedBudgetId && dto.pieza !== undefined && dto.valor !== undefined) {
        console.log('🆕 Creando budget item automáticamente para presupuesto:', dto.selectedBudgetId);
        
        try {
          // ✅ USAR EL NUEVO MÉTODO específico para agregar tratamientos
          budgetItemId = await this.budgetService.addTreatmentToBudget(
            dto.selectedBudgetId,
            doctorId,
            {
              pieza: dto.pieza,
              accion: dto.nombre_servicio,
              valor: dto.valor
            }
          );

          console.log('✅ Budget item creado con ID:', budgetItemId);
        } catch (budgetError: any) {
          console.error('❌ Error creando budget item:', budgetError.message);
          
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Error al vincular con el presupuesto",
              error: budgetError.message,
            }),
            headers: HEADERS.json,
          };
        }
      }

      // Crear el tratamiento (sesión)
      const newTreatment = await this.treatmentService.create({
        id_paciente: dto.id_paciente,
        id_doctor: doctorId,
        budget_item_id: budgetItemId, // ✅ Usar el ID del item creado
        fecha_control: dto.fecha_control,
        hora_control: dto.hora_control,
        fecha_proximo_control: dto.fecha_proximo_control,
        hora_proximo_control: dto.hora_proximo_control,
        nombre_servicio: dto.nombre_servicio,
        producto: dto.producto,
        lote_producto: dto.lote_producto,
        fecha_venc_producto: dto.fecha_venc_producto,
        dilucion: dto.dilucion,
        foto1: dto.foto1,
        foto2: dto.foto2,
        descripcion: dto.descripcion,
      });

      // ✅ NUEVO: Si el treatment tiene budget_item_id, marcar como 'en_proceso'
      if (budgetItemId) {
        await this.budgetService.markBudgetItemInProgress(budgetItemId, doctorId);
        console.log(`✅ Budget item ${budgetItemId} marcado como 'en_proceso'`);
      }

      // 📝 Registrar en auditoría (creación con status=pending, no se muestra aún en historial)
      await this.auditService.logChange({
        patientId: dto.id_paciente,
        entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
        entityId: newTreatment.id,
        action: AUDIT_ACTIONS.CREATED,
        newValues: {
          status: "pending",
          nombre_servicio: newTreatment.nombre_servicio,
          fecha_control: newTreatment.fecha_control,
          descripcion: newTreatment.descripcion,
        },
        changedBy: doctorId,
        notes: `Tratamiento ${newTreatment.nombre_servicio} creado (estado: pendiente)`,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: budgetItemId
            ? "Tratamiento creado y vinculado al presupuesto exitosamente"
            : "Tratamiento creado exitosamente",
          treatment: newTreatment,
          budgetItemCreated: !!budgetItemId
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error('❌ Error en CreateTreatment:', error);
      
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al crear el tratamiento",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}