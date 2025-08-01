// netlify/services/budget.service.ts
import { db } from '../data/db';
import { budgetsTable, budgetItemsTable, BUDGET_STATUS } from '../data/schemas/budget.schema';
import { eq, and, desc, sum, sql, inArray } from "drizzle-orm";

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

    // ✅ MÉTODO MEJORADO: UPSERT INTELIGENTE
    async saveOrUpdateBudget(
        patientId: number,
        userId: number,
        budgetType: string,
        items: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>
    ): Promise<BudgetWithItems> {

        console.log('🔄 saveOrUpdateBudget iniciado');
        console.log('📥 Items recibidos en service:', JSON.stringify(items, null, 2));

        // ✅ AGREGAR DEBUG: Verificar que los IDs se están enviando
        const itemsWithIds = items.filter(item => item.id && item.id > 0);
        const itemsWithoutIds = items.filter(item => !item.id || item.id <= 0);

        console.log('📊 DIAGNÓSTICO:');
        console.log('  - Items con ID:', itemsWithIds.length, itemsWithIds.map(i => ({ id: i.id, accion: i.accion })));
        console.log('  - Items sin ID:', itemsWithoutIds.length, itemsWithoutIds.map(i => i.accion));

        // Calcular total
        const totalAmount = items.reduce((sum, item) => sum + item.valor, 0);

        // Verificar si ya existe un presupuesto para este paciente
        const existingBudget = await this.findByPatientId(patientId, userId);

        console.log('📋 Presupuesto existente:', existingBudget ? `ID: ${existingBudget.id}` : 'No existe');

        let budgetId: number;

        if (existingBudget) {
            // Solo permitir actualización si está en borrador
            if (existingBudget.status !== BUDGET_STATUS.BORRADOR) {
                throw new Error('Solo se pueden modificar presupuestos en estado borrador');
            }

            console.log('🔄 Actualizando presupuesto existente ID:', existingBudget.id);
            console.log('📋 Items existentes antes del UPSERT:', existingBudget.items.map(i => ({ id: i.id, accion: i.accion })));

            // Actualizar presupuesto existente
            await db
                .update(budgetsTable)
                .set({
                    total_amount: totalAmount.toString(),
                    budget_type: budgetType,
                    updated_at: new Date(),
                })
                .where(eq(budgetsTable.id, existingBudget.id));

            budgetId = existingBudget.id;

            // ✅ AQUÍ ESTÁ EL PROBLEMA - LLAMAR AL UPSERT CORRECTO
            console.log('🔄 Iniciando UPSERT de items...');
            console.log('📤 Enviando a upsertBudgetItems:');
            console.log('  - budgetId:', budgetId);
            console.log('  - newItems:', items);
            console.log('  - existingItems:', existingBudget.items);

            await this.upsertBudgetItems(budgetId, items, existingBudget.items);
            console.log('✅ UPSERT completado');

        } else {
            console.log('➕ Creando nuevo presupuesto');
            // ... resto del código para nuevo presupuesto
        }

        // Retornar presupuesto completo actualizado
        const updatedBudget = await this.findByPatientId(patientId, userId);
        if (!updatedBudget) {
            throw new Error('Error al recuperar el presupuesto actualizado');
        }

        console.log('✅ saveOrUpdateBudget completado, presupuesto ID:', updatedBudget.id);
        console.log('📋 Items finales:', updatedBudget.items.map(i => ({ id: i.id, accion: i.accion })));

        return updatedBudget;
    }

    // ✅ SOLUCIÓN 2: VERIFICAR EL MÉTODO upsertBudgetItems
    private async upsertBudgetItems(
        budgetId: number,
        newItems: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>,
        existingItems: BudgetItemData[]
    ): Promise<void> {

        console.log('🔄 upsertBudgetItems iniciado');
        console.log('📥 newItems recibidos:', JSON.stringify(newItems, null, 2));
        console.log('📋 existingItems:', existingItems.map(i => ({ id: i.id, accion: i.accion })));

        // ✅ DIAGNÓSTICO CRÍTICO: Verificar que los IDs se están detectando correctamente
        const itemsToUpdate = newItems.filter(item => {
            const hasValidId = item.id && typeof item.id === 'number' && item.id > 0;
            console.log(`🔍 Item ${item.accion}: ID=${item.id}, type=${typeof item.id}, hasValidId=${hasValidId}`);
            return hasValidId;
        });

        const itemsToInsert = newItems.filter(item => {
            const needsInsert = !item.id || typeof item.id !== 'number' || item.id <= 0;
            console.log(`🔍 Item ${item.accion}: needsInsert=${needsInsert}`);
            return needsInsert;
        });

        const existingItemIds = existingItems.map(item => item.id);
        const providedItemIds = itemsToUpdate.map(item => item.id!);

        // ✅ SOLO ELIMINAR ITEMS QUE REALMENTE SE REMOVIERON
        const itemsToDelete = existingItemIds.filter(id => !providedItemIds.includes(id));

        console.log('🔄 Operaciones planificadas:');
        console.log('  - Actualizar:', itemsToUpdate.length, 'items con IDs:', providedItemIds);
        console.log('  - Insertar:', itemsToInsert.length, 'items nuevos');
        console.log('  - Eliminar:', itemsToDelete.length, 'items con IDs:', itemsToDelete);

        // ✅ VALIDACIÓN CRÍTICA: Si todos los items van a "insertar", hay un problema
        if (itemsToUpdate.length === 0 && newItems.some(item => item.id)) {
            console.error('🚨 ERROR CRÍTICO: Se recibieron items con ID pero ninguno se va a actualizar');
            console.error('🚨 Esto indica un problema en la detección de IDs');
            console.error('🚨 newItems:', newItems);
            throw new Error('Error en detección de IDs para actualización');
        }

        try {
            // 1. ACTUALIZAR items existentes (PRESERVAR IDs)
            for (const item of itemsToUpdate) {
                console.log(`🔄 Actualizando item ID ${item.id}...`);

                const result = await db
                    .update(budgetItemsTable)
                    .set({
                        pieza: item.pieza || null,
                        accion: item.accion,
                        valor: item.valor.toString(),
                        orden: item.orden,
                    })
                    .where(
                        and(
                            eq(budgetItemsTable.id, item.id!),
                            eq(budgetItemsTable.budget_id, budgetId)
                        )
                    )
                    .returning({ id: budgetItemsTable.id });

                console.log(`✅ Item ID ${item.id} actualizado:`, result);
            }

            // 2. INSERTAR items nuevos SOLAMENTE
            if (itemsToInsert.length > 0) {
                console.log(`➕ Insertando ${itemsToInsert.length} items nuevos...`);

                const budgetItems = itemsToInsert.map((item, index) => ({
                    budget_id: budgetId,
                    pieza: item.pieza || null,
                    accion: item.accion,
                    valor: item.valor.toString(),
                    orden: item.orden ?? (itemsToUpdate.length + index),
                }));

                const insertResult = await db
                    .insert(budgetItemsTable)
                    .values(budgetItems)
                    .returning({ id: budgetItemsTable.id });

                console.log('✅ Items insertados con IDs:', insertResult.map(r => r.id));
            }

            // 3. ELIMINAR items que YA NO ESTÁN (solo si realmente se eliminaron)
            if (itemsToDelete.length > 0) {
                console.log(`🗑️ Eliminando ${itemsToDelete.length} items:`, itemsToDelete);

                const deleteResult = await db
                    .delete(budgetItemsTable)
                    .where(
                        and(
                            eq(budgetItemsTable.budget_id, budgetId),
                            inArray(budgetItemsTable.id, itemsToDelete)
                        )
                    )
                    .returning({ id: budgetItemsTable.id });

                console.log('✅ Items eliminados:', deleteResult.map(r => r.id));
            }

            console.log('✅ upsertBudgetItems completado exitosamente');

        } catch (error) {
            console.error('❌ Error en upsertBudgetItems:', error);
            throw error;
        }
    }
    // ✅ NUEVO MÉTODO: MANEJAR ACTIVACIÓN CON PRESUPUESTOS MODIFICADOS
    async updateStatus(budgetId: number, userId: number, newStatus: string): Promise<void> {
        const validStatuses = [BUDGET_STATUS.BORRADOR, BUDGET_STATUS.ACTIVO, BUDGET_STATUS.COMPLETED];

        if (!validStatuses.includes(newStatus as any)) {
            throw new Error('Estado de presupuesto inválido');
        }

        // Si se está activando, verificar integridad
        if (newStatus === BUDGET_STATUS.ACTIVO) {
            const budget = await this.findByBudgetId(budgetId, userId);
            if (!budget || budget.items.length === 0) {
                throw new Error('No se puede activar un presupuesto sin items');
            }
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

    // ✅ NUEVO MÉTODO: OBTENER PRESUPUESTO POR ID
    async findByBudgetId(budgetId: number, userId: number): Promise<BudgetWithItems | null> {
        const budget = await db
            .select()
            .from(budgetsTable)
            .where(
                and(
                    eq(budgetsTable.id, budgetId),
                    eq(budgetsTable.user_id, userId)
                )
            );

        if (!budget[0]) return null;

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

    // ✅ MÉTODO MEJORADO: VERIFICAR SI SE PUEDE MODIFICAR DESPUÉS DE ACTIVAR
    async canModifyBudget(patientId: number, userId: number): Promise<boolean> {
        const budget = await this.findByPatientId(patientId, userId);

        // Solo se puede modificar si está en borrador
        // O si está activo pero no tiene tratamientos creados aún
        if (!budget) return true;

        if (budget.status === BUDGET_STATUS.BORRADOR) return true;

        // Si está activo, verificar si ya se crearon tratamientos
        if (budget.status === BUDGET_STATUS.ACTIVO) {
            // Aquí podrías verificar si existen tratamientos vinculados
            // Por ejemplo: SELECT COUNT(*) FROM treatments WHERE budget_item_id IN (...)
            // Por ahora, permitimos edición de presupuestos activos
            return true;
        }

        return false; // COMPLETED no se puede modificar
    }

    // Resto de métodos existentes...
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

    async deleteBudget(patientId: number, userId: number): Promise<void> {
        const budget = await this.findByPatientId(patientId, userId);

        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (budget.status !== BUDGET_STATUS.BORRADOR) {
            throw new Error('Solo se pueden eliminar presupuestos en estado borrador');
        }

        await db
            .delete(budgetsTable)
            .where(
                and(
                    eq(budgetsTable.patient_id, patientId),
                    eq(budgetsTable.user_id, userId)
                )
            );
    }

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