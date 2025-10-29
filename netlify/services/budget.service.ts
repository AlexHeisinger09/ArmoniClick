// netlify/services/budget.service.ts - ACTUALIZADO PARA CREAR TRATAMIENTOS
import { db } from '../data/db';
import { budgetsTable, budgetItemsTable, BUDGET_STATUS } from '../data/schemas/budget.schema';
import { treatmentsTable } from '../data/schemas/treatment.schema';
import { usersTable } from '../data/schemas/user.schema';
import { eq, and, desc, sum, sql, inArray } from "drizzle-orm";

type NewBudget = typeof budgetsTable.$inferInsert;
type NewBudgetItem = typeof budgetItemsTable.$inferInsert;
type NewTreatment = typeof treatmentsTable.$inferInsert;

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
    // ✅ AGREGAR: Datos del doctor que creó el presupuesto
    doctor_name?: string;
    doctor_lastName?: string;
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

    async removeBudgetItemAndRecalculate(budgetItemId: number, userId: number): Promise<void> {
        console.log('🗑️ Eliminando budget item y recalculando total:', budgetItemId);

        try {
            // 1. Obtener información del item antes de eliminarlo
            const itemInfo = await db
                .select({
                    id: budgetItemsTable.id,
                    budget_id: budgetItemsTable.budget_id,
                    valor: budgetItemsTable.valor,
                    accion: budgetItemsTable.accion
                })
                .from(budgetItemsTable)
                .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
                .where(
                    and(
                        eq(budgetItemsTable.id, budgetItemId),
                        eq(budgetsTable.user_id, userId)
                    )
                );

            if (!itemInfo[0]) {
                throw new Error('Budget item no encontrado o no autorizado');
            }

            const item = itemInfo[0];
            console.log('📋 Budget item encontrado:', item);

            // 2. Verificar que el presupuesto se pueda modificar
            const budget = await this.findByBudgetId(item.budget_id, userId);
            if (!budget) {
                throw new Error('Presupuesto no encontrado');
            }

            // 3. Eliminar el item
            await db
                .delete(budgetItemsTable)
                .where(eq(budgetItemsTable.id, budgetItemId));

            console.log('✅ Budget item eliminado');

            // 4. Recalcular el total del presupuesto
            const remainingItems = await db
                .select({
                    valor: budgetItemsTable.valor
                })
                .from(budgetItemsTable)
                .where(eq(budgetItemsTable.budget_id, item.budget_id));

            const newTotal = remainingItems.reduce((sum, item) => sum + parseFloat(item.valor), 0);

            // 5. Actualizar el total del presupuesto
            await db
                .update(budgetsTable)
                .set({
                    total_amount: newTotal.toString(),
                    updated_at: new Date(),
                })
                .where(eq(budgetsTable.id, item.budget_id));

            console.log(`💰 Total recalculado: $${newTotal.toLocaleString('es-CL')}`);

        } catch (error) {
            console.error('❌ Error eliminando budget item:', error);
            throw error;
        }
    }

    async addTreatmentToBudget(
        budgetId: number,
        userId: number,
        treatmentItem: {
            pieza?: string;
            accion: string;
            valor: number;
        }
    ): Promise<number> {
        console.log('🆕 Agregando tratamiento a presupuesto activo ID:', budgetId);

        // Verificar que el presupuesto existe y está activo
        const budget = await this.findByBudgetId(budgetId, userId);
        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        // ✅ CAMBIO CLAVE: Permitir agregar tratamientos a presupuestos ACTIVOS
        if (budget.status == BUDGET_STATUS.COMPLETED) {
            throw new Error(`No se pueden agregar tratamientos a presupuestos completados. Estado actual: ${budget.status}`);
        }

        // Crear el nuevo item
        const newItemData = {
            budget_id: budgetId,
            pieza: treatmentItem.pieza || null,
            accion: treatmentItem.accion,
            valor: treatmentItem.valor.toString(),
            orden: budget.items.length, // Agregar al final
        };

        // Insertar el nuevo item directamente en la base de datos
        const [newItem] = await db.insert(budgetItemsTable).values(newItemData).returning();

        // Actualizar el total del presupuesto
        const newTotal = parseFloat(budget.total_amount) + treatmentItem.valor;
        await db
            .update(budgetsTable)
            .set({
                total_amount: newTotal.toString(),
                updated_at: new Date(),
            })
            .where(eq(budgetsTable.id, budgetId));

        console.log('✅ Tratamiento agregado al presupuesto. Nuevo item ID:', newItem.id);
        console.log('✅ Total del presupuesto actualizado a:', newTotal);

        return newItem.id;
    }
    // ✅ OBTENER TODOS los presupuestos de un paciente
    async findAllByPatientId(patientId: number, userId: number): Promise<BudgetWithItems[]> {
        const budgets = await db
            .select({
                id: budgetsTable.id,
                patient_id: budgetsTable.patient_id,
                user_id: budgetsTable.user_id,
                total_amount: budgetsTable.total_amount,
                status: budgetsTable.status,
                budget_type: budgetsTable.budget_type,
                created_at: budgetsTable.created_at,
                updated_at: budgetsTable.updated_at,
                // ✅ AGREGAR: Datos del doctor que creó el presupuesto
                doctor_name: usersTable.name,
                doctor_lastName: usersTable.lastName,
            })
            .from(budgetsTable)
            .innerJoin(usersTable, eq(budgetsTable.user_id, usersTable.id))
            .where(
                and(
                    eq(budgetsTable.patient_id, patientId),
                    eq(budgetsTable.user_id, userId)
                )
            )
            .orderBy(desc(budgetsTable.updated_at), desc(budgetsTable.created_at));

        const budgetsWithItems: BudgetWithItems[] = [];

        for (const budget of budgets) {
            // ✅ SOLO ITEMS ACTIVOS
            const items = await db
                .select()
                .from(budgetItemsTable)
                .where(
                    and(
                        eq(budgetItemsTable.budget_id, budget.id),
                        eq(budgetItemsTable.is_active, true) // ✅ FILTRO CRÍTICO
                    )
                )
                .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

            budgetsWithItems.push({
                ...budget,
                status: budget.status ?? '',
                items: items
            });
        }

        return budgetsWithItems;
    }

    // ✅ OBTENER solo el presupuesto ACTIVO de un paciente
    async findActiveByPatientId(patientId: number, userId: number): Promise<BudgetWithItems | null> {
        const budget = await db
            .select({
                id: budgetsTable.id,
                patient_id: budgetsTable.patient_id,
                user_id: budgetsTable.user_id,
                total_amount: budgetsTable.total_amount,
                status: budgetsTable.status,
                budget_type: budgetsTable.budget_type,
                created_at: budgetsTable.created_at,
                updated_at: budgetsTable.updated_at,
                // ✅ AGREGAR: Datos del doctor que creó el presupuesto
                doctor_name: usersTable.name,
                doctor_lastName: usersTable.lastName,
            })
            .from(budgetsTable)
            .innerJoin(usersTable, eq(budgetsTable.user_id, usersTable.id))
            .where(
                and(
                    eq(budgetsTable.patient_id, patientId),
                    eq(budgetsTable.user_id, userId),
                    eq(budgetsTable.status, BUDGET_STATUS.ACTIVO)
                )
            );

        if (!budget[0]) return null;

        // ✅ SOLO ITEMS ACTIVOS
        const items = await db
            .select()
            .from(budgetItemsTable)
            .where(
                and(
                    eq(budgetItemsTable.budget_id, budget[0].id),
                    eq(budgetItemsTable.is_active, true) // ✅ FILTRO CRÍTICO
                )
            )
            .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

        return {
            ...budget[0],
            status: budget[0].status ?? '',
            items: items
        };
    }

    // ✅ CREAR nuevo presupuesto (siempre en borrador)
    async createBudget(
        patientId: number,
        userId: number,
        budgetType: string,
        items: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>
    ): Promise<BudgetWithItems> {
        console.log('🆕 Creando nuevo presupuesto');

        const totalAmount = items.reduce((sum, item) => sum + item.valor, 0);

        // ✅ CREAR SIEMPRE EN BORRADOR (cambio: pendiente -> borrador)
        const [newBudget] = await db
            .insert(budgetsTable)
            .values({
                patient_id: patientId,
                user_id: userId,
                total_amount: totalAmount.toString(),
                status: 'pendiente', // ← Estado inicial pendiente
                budget_type: budgetType,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning();

        console.log('✅ Presupuesto creado con ID:', newBudget.id);

        // Insertar items
        const budgetItems = items.map((item, index) => ({
            budget_id: newBudget.id,
            pieza: item.pieza || null,
            accion: item.accion,
            valor: item.valor.toString(),
            orden: item.orden ?? index,
        }));

        await db.insert(budgetItemsTable).values(budgetItems);

        // Retornar presupuesto completo
        return await this.findByBudgetId(newBudget.id, userId) as BudgetWithItems;
    }

    // ✅ ACTUALIZAR presupuesto existente (solo si está en pendiente o borrador)
    async updateBudget(
        budgetId: number,
        userId: number,
        budgetType: string,
        items: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>
    ): Promise<BudgetWithItems> {
        console.log('🔄 Actualizando presupuesto existente ID:', budgetId);

        // Verificar que el presupuesto exista y esté en estado modificable
        const existingBudget = await this.findByBudgetId(budgetId, userId);
        if (!existingBudget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (!['pendiente', 'borrador'].includes(existingBudget.status)) {
            throw new Error('Solo se pueden modificar presupuestos en estado pendiente o borrador');
        }

        const totalAmount = items.reduce((sum, item) => sum + item.valor, 0);

        // Actualizar presupuesto
        await db
            .update(budgetsTable)
            .set({
                total_amount: totalAmount.toString(),
                budget_type: budgetType,
                updated_at: new Date(),
            })
            .where(eq(budgetsTable.id, budgetId));

        // Actualizar items usando el método existente
        await this.upsertBudgetItems(budgetId, items, existingBudget.items);

        // Retornar presupuesto actualizado
        return await this.findByBudgetId(budgetId, userId) as BudgetWithItems;
    }

    // ✅ ACTIVAR presupuesto (validando unicidad) y CREAR TRATAMIENTOS
    async activateBudget(budgetId: number, userId: number): Promise<void> {
        console.log('🟢 Activando presupuesto ID:', budgetId);

        // Verificar que el presupuesto existe y está en pendiente o borrador
        const budget = await this.findByBudgetId(budgetId, userId);
        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (!['pendiente', 'borrador'].includes(budget.status)) {
            throw new Error('Solo se pueden activar presupuestos en estado pendiente o borrador');
        }

        if (budget.items.length === 0) {
            throw new Error('No se puede activar un presupuesto sin tratamientos');
        }

        // ✅ VERIFICAR QUE NO HAYA OTRO PRESUPUESTO ACTIVO
        const activeBudget = await this.findActiveByPatientId(budget.patient_id, userId);
        if (activeBudget && activeBudget.id !== budgetId) {
            throw new Error(`Ya existe un presupuesto activo para este paciente. Debe completar o desactivar el presupuesto #${activeBudget.id} primero.`);
        }

        // ✅ CREAR TRATAMIENTOS AUTOMÁTICAMENTE
        console.log('📝 Creando tratamientos automáticamente...');

        const currentDate = new Date();
        const treatmentsToCreate: NewTreatment[] = budget.items.map(item => ({
            id_paciente: budget.patient_id,
            id_doctor: userId,
            budget_item_id: item.id, // ✅ VINCULAR CON EL ITEM DEL PRESUPUESTO
            fecha_control: currentDate.toISOString().split('T')[0], // Fecha actual
            hora_control: currentDate.toTimeString().slice(0, 5), // Hora actual
            nombre_servicio: item.accion,
            status: 'pending', // Estado inicial pendiente
            created_at: new Date(),
            is_active: true,
        }));

        // Insertar tratamientos
        await db.insert(treatmentsTable).values(treatmentsToCreate);

        // Activar presupuesto
        await db
            .update(budgetsTable)
            .set({
                status: BUDGET_STATUS.ACTIVO,
                updated_at: new Date(),
            })
            .where(eq(budgetsTable.id, budgetId));

        console.log('✅ Presupuesto activado y tratamientos creados exitosamente');
    }

    // ✅ COMPLETAR presupuesto activo
    async completeBudget(budgetId: number, userId: number): Promise<void> {
        console.log('🏁 Completando presupuesto ID:', budgetId);

        const budget = await this.findByBudgetId(budgetId, userId);
        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (budget.status !== BUDGET_STATUS.ACTIVO) {
            throw new Error('Solo se pueden completar presupuestos activos');
        }

        await db
            .update(budgetsTable)
            .set({
                status: BUDGET_STATUS.COMPLETED,
                updated_at: new Date(),
            })
            .where(eq(budgetsTable.id, budgetId));

        console.log('✅ Presupuesto completado exitosamente');
    }

    // ✅ VOLVER a borrador (solo si está activo y no tiene tratamientos completados)
    async revertToDraft(budgetId: number, userId: number): Promise<void> {
        console.log('🔄 Revirtiendo presupuesto a borrador ID:', budgetId);

        const budget = await this.findByBudgetId(budgetId, userId);
        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (budget.status !== BUDGET_STATUS.ACTIVO) {
            throw new Error('Solo se pueden revertir presupuestos activos');
        }

        // ✅ VERIFICAR QUE NO TENGA TRATAMIENTOS COMPLETADOS
        const completedTreatments = await db
            .select({ count: sql<number>`count(*)` })
            .from(treatmentsTable)
            .innerJoin(budgetItemsTable, eq(treatmentsTable.budget_item_id, budgetItemsTable.id))
            .where(
                and(
                    eq(budgetItemsTable.budget_id, budgetId),
                    eq(treatmentsTable.status, 'completed'),
                    eq(treatmentsTable.is_active, true)
                )
            );

        if (completedTreatments[0].count > 0) {
            throw new Error('No se puede revertir un presupuesto que ya tiene tratamientos completados');
        }

        // ✅ ELIMINAR TRATAMIENTOS PENDIENTES VINCULADOS
        await db
            .update(treatmentsTable)
            .set({
                is_active: false,
                updated_at: new Date(),
            })
            .where(
                and(
                    inArray(
                        treatmentsTable.budget_item_id,
                        budget.items.map(item => item.id)
                    ),
                    eq(treatmentsTable.status, 'pending')
                )
            );

        await db
            .update(budgetsTable)
            .set({
                status: 'pendiente', // Volver a pendiente
                updated_at: new Date(),
            })
            .where(eq(budgetsTable.id, budgetId));

        console.log('✅ Presupuesto revertido a pendiente y tratamientos pendientes eliminados');
    }

    // ✅ ELIMINAR presupuesto (solo pendientes o borradores)
    async deleteBudget(budgetId: number, userId: number): Promise<void> {
        const budget = await this.findByBudgetId(budgetId, userId);

        if (!budget) {
            throw new Error('Presupuesto no encontrado');
        }

        if (!['pendiente', 'borrador'].includes(budget.status)) {
            throw new Error('Solo se pueden eliminar presupuestos en estado pendiente o borrador');
        }

        await db
            .delete(budgetsTable)
            .where(eq(budgetsTable.id, budgetId));
    }

    // ✅ MANTENER MÉTODOS EXISTENTES (para compatibilidad)

    // Método legacy - ahora retorna el primer presupuesto encontrado
    async findByPatientId(patientId: number, userId: number): Promise<BudgetWithItems | null> {
        const budgets = await this.findAllByPatientId(patientId, userId);
        return budgets.length > 0 ? budgets[0] : null;
    }

    async findByBudgetId(budgetId: number, userId: number): Promise<BudgetWithItems | null> {
        const budget = await db
            .select({
                id: budgetsTable.id,
                patient_id: budgetsTable.patient_id,
                user_id: budgetsTable.user_id,
                total_amount: budgetsTable.total_amount,
                status: budgetsTable.status,
                budget_type: budgetsTable.budget_type,
                created_at: budgetsTable.created_at,
                updated_at: budgetsTable.updated_at,
                // ✅ AGREGAR: Datos del doctor que creó el presupuesto
                doctor_name: usersTable.name,
                doctor_lastName: usersTable.lastName,
            })
            .from(budgetsTable)
            .innerJoin(usersTable, eq(budgetsTable.user_id, usersTable.id))
            .where(
                and(
                    eq(budgetsTable.id, budgetId),
                    eq(budgetsTable.user_id, userId)
                )
            );

        if (!budget[0]) return null;

        // ✅ SOLO OBTENER ITEMS ACTIVOS
        const items = await db
            .select()
            .from(budgetItemsTable)
            .where(
                and(
                    eq(budgetItemsTable.budget_id, budget[0].id),
                    eq(budgetItemsTable.is_active, true) // ✅ FILTRO CRÍTICO
                )
            )
            .orderBy(budgetItemsTable.orden, budgetItemsTable.created_at);

        return {
            ...budget[0],
            status: budget[0].status ?? '',
            items: items
        };
    }


    // ✅ MÉTODO WRAPPER para compatibilidad con frontend actual
    async saveOrUpdateBudget(
        patientId: number,
        userId: number,
        budgetType: string,
        items: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>
    ): Promise<BudgetWithItems> {

        // Si hay un ID en los items, significa que es una actualización
        const hasExistingItems = items.some(item => item.id && item.id > 0);

        if (hasExistingItems) {
            // Buscar el presupuesto por el ID del primer item
            const firstItemWithId = items.find(item => item.id && item.id > 0);
            if (firstItemWithId) {
                const existingItem = await db
                    .select({ budget_id: budgetItemsTable.budget_id })
                    .from(budgetItemsTable)
                    .where(eq(budgetItemsTable.id, firstItemWithId.id!));

                if (existingItem[0]) {
                    return this.updateBudget(existingItem[0].budget_id, userId, budgetType, items);
                }
            }
        }

        // Si no hay items existentes, crear nuevo presupuesto
        return this.createBudget(patientId, userId, budgetType, items);
    }

    // Mantener método de upsert existente
    private async upsertBudgetItems(
        budgetId: number,
        newItems: Array<{ id?: number; pieza?: string; accion: string; valor: number; orden?: number }>,
        existingItems: BudgetItemData[]
    ): Promise<void> {
        console.log('🔄 upsertBudgetItems iniciado');

        const itemsToUpdate = newItems.filter(item => item.id && typeof item.id === 'number' && item.id > 0);
        const itemsToInsert = newItems.filter(item => !item.id || typeof item.id !== 'number' || item.id <= 0);
        const existingItemIds = existingItems.map(item => item.id);
        const providedItemIds = itemsToUpdate.map(item => item.id!);
        const itemsToDelete = existingItemIds.filter(id => !providedItemIds.includes(id));

        try {
            // Actualizar items existentes
            for (const item of itemsToUpdate) {
                await db
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
                    );
            }

            // Insertar items nuevos
            if (itemsToInsert.length > 0) {
                const budgetItems = itemsToInsert.map((item, index) => ({
                    budget_id: budgetId,
                    pieza: item.pieza || null,
                    accion: item.accion,
                    valor: item.valor.toString(),
                    orden: item.orden ?? (itemsToUpdate.length + index),
                }));

                await db.insert(budgetItemsTable).values(budgetItems);
            }

            // Eliminar items que ya no están
            if (itemsToDelete.length > 0) {
                await db
                    .delete(budgetItemsTable)
                    .where(
                        and(
                            eq(budgetItemsTable.budget_id, budgetId),
                            inArray(budgetItemsTable.id, itemsToDelete)
                        )
                    );
            }

            console.log('✅ upsertBudgetItems completado exitosamente');
        } catch (error) {
            console.error('❌ Error en upsertBudgetItems:', error);
            throw error;
        }
    }

    // Mantener método de estadísticas
    async getBudgetStats(userId: number): Promise<{
        total_budgets: number;
        pendientes: number;
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
            pendientes: 0,
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
                case 'pendiente':
                    result.pendientes = stat.count;
                    break;
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

    // ✅ VERIFICAR si se puede modificar un presupuesto
    async canModifyBudget(budgetId: number, userId: number): Promise<boolean> {
        const budget = await this.findByBudgetId(budgetId, userId);
        return budget ? ['pendiente', 'borrador'].includes(budget.status) : false;
    }

    // ✅ OBTENER INGRESOS DE TREATMENTS COMPLETADOS (NO budget_items genéricos)
    async getRevenueByCompletedTreatments(userId: number): Promise<BudgetWithItems[]> {
        try {
            console.log('💰 Obteniendo ingresos por treatments completados para doctor:', userId);

            // ✅ Query CORRECTA: obtener budget_items que tienen treatments COMPLETADOS
            // La fecha usada es la del treatment completado (updated_at), no la del budget_item
            const budgetItems = await db
                .select({
                    id: budgetItemsTable.id,
                    budget_id: budgetItemsTable.budget_id,
                    pieza: budgetItemsTable.pieza,
                    accion: budgetItemsTable.accion,
                    valor: budgetItemsTable.valor,
                    orden: budgetItemsTable.orden,
                    // ✅ CAMBIO CLAVE: Usar fecha del treatment completado, no del budget_item
                    created_at: treatmentsTable.updated_at, // Fecha cuando se completó el tratamiento
                    budget_user_id: budgetsTable.user_id,
                    budget_status: budgetsTable.status,
                })
                .from(budgetItemsTable)
                .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
                // ✅ CAMBIO CLAVE: JOIN con treatments para filtrar solo completados
                .innerJoin(treatmentsTable, eq(budgetItemsTable.id, treatmentsTable.budget_item_id))
                .where(
                    and(
                        eq(budgetsTable.user_id, userId),
                        eq(budgetItemsTable.is_active, true),
                        // ✅ CAMBIO CLAVE: Filtrar solo treatments completados
                        eq(treatmentsTable.status, 'completed'),
                        eq(treatmentsTable.is_active, true)
                    )
                )
                // ✅ Ordenar por fecha del treatment completado (más recientes primero)
                .orderBy(desc(treatmentsTable.updated_at));

            console.log(`📊 Budget items con treatments completados encontrados: ${budgetItems.length}`);

            // ✅ Agrupar items por presupuesto
            const budgetMap = new Map<number, BudgetWithItems>();

            for (const item of budgetItems) {
                if (!budgetMap.has(item.budget_id)) {
                    budgetMap.set(item.budget_id, {
                        id: item.budget_id,
                        patient_id: 0, // No necesitamos este valor
                        user_id: item.budget_user_id,
                        total_amount: '0',
                        status: item.budget_status,
                        budget_type: 'odontologico',
                        created_at: new Date().toISOString(),
                        updated_at: null,
                        items: [],
                    });
                }

                const budget = budgetMap.get(item.budget_id)!;
                // ✅ CAMBIO: Usar fecha del treatment (item.created_at ya tiene updated_at del treatment)
                budget.items.push({
                    id: item.id,
                    budget_id: item.budget_id,
                    pieza: item.pieza,
                    accion: item.accion,
                    valor: item.valor.toString(),
                    orden: item.orden,
                    created_at: item.created_at, // Ahora contiene updated_at del treatment
                } as BudgetItemData);
            }

            const budgets = Array.from(budgetMap.values());
            console.log(`✅ Presupuestos agrupados: ${budgets.length}`);

            // Debug: Log de items procesados
            budgets.forEach(budget => {
                console.log(`📦 Presupuesto #${budget.id}: ${budget.items.length} items completados`);
                budget.items.forEach(item => {
                    console.log(`  - ${item.accion}: $${item.valor} (completado: ${item.created_at})`);
                });
            });

            return budgets;
        } catch (error) {
            console.error('❌ Error en getRevenueByCompletedTreatments:', error);
            throw error;
        }
    }

    // ✅ OBTENER DINERO PENDIENTE: Todos los treatments NO completados (dinero potencial futuro)
    async getPendingRevenue(userId: number): Promise<number> {
        try {
            console.log('💵 Obteniendo dinero pendiente (treatments no completados) para doctor:', userId);

            // ✅ Query: obtener SUM de todos los budget_items donde NO existe treatment COMPLETADO
            const result = await db
                .select({
                    total: sql<string>`COALESCE(SUM(CAST(${budgetItemsTable.valor} AS DECIMAL)), 0)`,
                })
                .from(budgetItemsTable)
                .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
                .where(
                    and(
                        eq(budgetsTable.user_id, userId),
                        eq(budgetItemsTable.is_active, true),
                        // ✅ CLAVE: NO EXISTS donde status = 'completed'
                        // Esto incluye todos los items que NO tienen un treatment completado
                        sql`NOT EXISTS (
                            SELECT 1 FROM ${treatmentsTable}
                            WHERE ${treatmentsTable.budget_item_id} = ${budgetItemsTable.id}
                            AND ${treatmentsTable.status} = 'completed'
                            AND ${treatmentsTable.is_active} = true
                        )`
                    )
                );

            const totalPending = parseFloat(result[0]?.total || '0');
            console.log(`💵 Dinero pendiente calculado: $${totalPending.toLocaleString('es-CL')}`);

            return totalPending;
        } catch (error) {
            console.error('❌ Error en getPendingRevenue:', error);
            throw error;
        }
    }
}
