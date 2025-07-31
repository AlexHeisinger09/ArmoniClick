// netlify/services/budget.service.ts
import { db } from '../data/db';
import { budgetsTable, budgetItemsTable, BUDGET_STATUS } from '../data/schemas/budget.schema';
import { eq, and, desc, sum, sql } from "drizzle-orm";

type NewBudget = typeof budgetsTable.$inferInsert;
type NewBudgetItem = typeof budgetItemsTable.$inferInsert;

export interface BudgetWithItems {
  id: number;
  patient_id: number;
  user_id: number;
  total_amount: string;
  status: string;
  budget_type: string;
  created_at: Date;
  updated_at: Date | null;
  items: BudgetItemData[];
}

export interface BudgetItemData {
  id: number;
  budget_id: number;
  pieza: string | null;
  accion: string;
  valor: string;
  orden: number | null;
  created_at: Date;
}

export class BudgetService {
  
  // Obtener presupuesto de un paciente (solo puede tener uno)
  async findByPatientId(patientId: number, userId: number): Promise<BudgetWithItems | null> {
    const budget = await db
      .select()
      .from(budgetsTable)
      .where(
        and(
          eq(budgetsTable.patient_id, patientId),
          eq(budgetsTable.user_id, userId)
        )
      );

    if (!budget[0]) return null;

    // Obtener items del presupuesto
    const items = await db
      .select()
      .from(budgetItemsTable)
      .where(eq(budgetItemsTable.budget_id, budget[0].id))
      .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

    return {
      ...budget[0],
      status: budget[0].status ?? '',
      items: items
    };
  }

  // Crear o actualizar presupuesto completo
  async saveOrUpdateBudget(
    patientId: number, 
    userId: number, 
    budgetType: string,
    items: Array<{ pieza?: string; accion: string; valor: number; orden?: number }>
  ): Promise<BudgetWithItems> {
    
    // Calcular total
    const totalAmount = items.reduce((sum, item) => sum + item.valor, 0);

    // Verificar si ya existe un presupuesto para este paciente
    const existingBudget = await this.findByPatientId(patientId, userId);

    let budgetId: number;

    if (existingBudget) {
      // Solo permitir actualización si está en borrador
      if (existingBudget.status !== BUDGET_STATUS.BORRADOR) {
        throw new Error('Solo se pueden modificar presupuestos en estado borrador');
      }

      // Actualizar presupuesto existente
      await db
        .update(budgetsTable)
        .set({
          total_amount: totalAmount.toString(),
          budget_type: budgetType,
          updated_at: new Date(),
        })
        .where(eq(budgetsTable.id, existingBudget.id));

      // Eliminar items anteriores
      await db
        .delete(budgetItemsTable)
        .where(eq(budgetItemsTable.budget_id, existingBudget.id));

      budgetId = existingBudget.id;
    } else {
      // Crear nuevo presupuesto
      const newBudget = await db
        .insert(budgetsTable)
        .values({
          patient_id: patientId,
          user_id: userId,
          total_amount: totalAmount.toString(),
          budget_type: budgetType,
          status: BUDGET_STATUS.BORRADOR,
        })
        .returning({ id: budgetsTable.id });

      budgetId = newBudget[0].id;
    }

    // Insertar nuevos items
    if (items.length > 0) {
      const budgetItems = items.map((item, index) => ({
        budget_id: budgetId,
        pieza: item.pieza || null,
        accion: item.accion,
        valor: item.valor.toString(),
        orden: item.orden ?? index,
      }));

      await db
        .insert(budgetItemsTable)
        .values(budgetItems);
    }

    // Retornar presupuesto completo
    const updatedBudget = await this.findByPatientId(patientId, userId);
    if (!updatedBudget) {
      throw new Error('Error al recuperar el presupuesto actualizado');
    }

    return updatedBudget;
  }

  // Cambiar estado del presupuesto
  async updateStatus(budgetId: number, userId: number, newStatus: string): Promise<void> {
    const validStatuses = [BUDGET_STATUS.BORRADOR, BUDGET_STATUS.ACTIVO, BUDGET_STATUS.COMPLETED];
    
    if (!validStatuses.includes(newStatus as any)) {
      throw new Error('Estado de presupuesto inválido');
    }

    await db
      .update(budgetsTable)
      .set({
        status: newStatus,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(budgetsTable.id, budgetId),
          eq(budgetsTable.user_id, userId)
        )
      );
  }

  // Eliminar presupuesto (solo si está en borrador)
  async deleteBudget(patientId: number, userId: number): Promise<void> {
    const budget = await this.findByPatientId(patientId, userId);
    
    if (!budget) {
      throw new Error('Presupuesto no encontrado');
    }

    if (budget.status !== BUDGET_STATUS.BORRADOR) {
      throw new Error('Solo se pueden eliminar presupuestos en estado borrador');
    }

    // Los items se eliminan automáticamente por CASCADE
    await db
      .delete(budgetsTable)
      .where(
        and(
          eq(budgetsTable.patient_id, patientId),
          eq(budgetsTable.user_id, userId)
        )
      );
  }

  // Obtener todos los presupuestos de un doctor
  async findByDoctorId(userId: number, limit?: number): Promise<BudgetWithItems[]> {
    let query = db
      .select()
      .from(budgetsTable)
      .where(eq(budgetsTable.user_id, userId))
      .orderBy(desc(budgetsTable.updated_at), desc(budgetsTable.created_at));

    if (limit) {
      query = query.limit(limit) as any;
    }

    const budgets = await query;

    // Obtener items para cada presupuesto
    const budgetsWithItems: BudgetWithItems[] = [];
    
    for (const budget of budgets) {
      const items = await db
        .select()
        .from(budgetItemsTable)
        .where(eq(budgetItemsTable.budget_id, budget.id))
        .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

      budgetsWithItems.push({
        ...budget,
        status: budget.status ?? '',
        items: items
      });
    }

    return budgetsWithItems;
  }

  // Verificar si un presupuesto puede ser modificado
  async canModifyBudget(patientId: number, userId: number): Promise<boolean> {
    const budget = await this.findByPatientId(patientId, userId);
    return budget ? budget.status === BUDGET_STATUS.BORRADOR : true;
  }

  // Obtener estadísticas básicas de presupuestos
  async getBudgetStats(userId: number): Promise<{
    total_budgets: number;
    drafts: number;
    active: number;
    completed: number;
    total_amount: string;
  }> {
    const stats = await db
      .select({
        status: budgetsTable.status,
        count: sql<number>`count(*)`.as('count'),
        total: sql<string>`sum(${budgetsTable.total_amount})`.as('total'),
      })
      .from(budgetsTable)
      .where(eq(budgetsTable.user_id, userId))
      .groupBy(budgetsTable.status);

    const result = {
      total_budgets: 0,
      drafts: 0,
      active: 0,
      completed: 0,
      total_amount: '0',
    };

    let totalAmount = 0;

    stats.forEach(stat => {
      result.total_budgets += stat.count;
      totalAmount += parseFloat(stat.total || '0');

      switch (stat.status) {
        case BUDGET_STATUS.BORRADOR:
          result.drafts = stat.count;
          break;
        case BUDGET_STATUS.ACTIVO:
          result.active = stat.count;
          break;
        case BUDGET_STATUS.COMPLETED:
          result.completed = stat.count;
          break;
      }
    });

    result.total_amount = totalAmount.toString();
    return result;
  }
}