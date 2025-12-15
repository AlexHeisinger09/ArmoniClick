// scripts/create-rls-policies.ts
// Script para crear políticas RLS manualmente

import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 10000,
});

async function executeSQL(sql: string, description: string) {
  try {
    console.log(`   ⏳ ${description}...`);
    await pool.query(sql);
    console.log(`   ✅ ${description} - OK`);
    return true;
  } catch (error: any) {
    console.error(`   ❌ ${description} - ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('\n🔒 CREANDO POLÍTICAS ROW-LEVEL SECURITY\n');

  try {
    // 1. Habilitar RLS en patients (parece que no se habilitó)
    console.log('1️⃣  Habilitando RLS en tabla patients:');
    await executeSQL(
      'ALTER TABLE patients ENABLE ROW LEVEL SECURITY',
      'Habilitar RLS en patients'
    );

    // 2. Crear políticas RLS
    console.log('\n2️⃣  Creando políticas RLS:');

    // Patients
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_patients ON patients`,
      'Eliminar política antigua patients'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_patients ON patients
       FOR ALL
       USING (id_doctor = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política patients'
    );

    // Appointments
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_appointments ON appointments`,
      'Eliminar política antigua appointments'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_appointments ON appointments
       FOR ALL
       USING (doctor_id = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política appointments'
    );

    // Treatments
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_treatments ON treatments`,
      'Eliminar política antigua treatments'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_treatments ON treatments
       FOR ALL
       USING (id_doctor = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política treatments'
    );

    // Budgets
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_budgets ON budgets`,
      'Eliminar política antigua budgets'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_budgets ON budgets
       FOR ALL
       USING (user_id = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política budgets'
    );

    // Budget Items (a través de budgets)
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_budget_items ON budget_items`,
      'Eliminar política antigua budget_items'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_budget_items ON budget_items
       FOR ALL
       USING (
         budget_id IN (
           SELECT id FROM budgets
           WHERE user_id = current_setting('app.current_doctor_id', true)::int
         )
       )`,
      'Crear política budget_items'
    );

    // Documents
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_documents ON documents`,
      'Eliminar política antigua documents'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_documents ON documents
       FOR ALL
       USING (id_doctor = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política documents'
    );

    // Services
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_services ON services`,
      'Eliminar política antigua services'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_services ON services
       FOR ALL
       USING (user_id = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política services'
    );

    // Schedule Blocks
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_schedule_blocks ON schedule_blocks`,
      'Eliminar política antigua schedule_blocks'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_schedule_blocks ON schedule_blocks
       FOR ALL
       USING (doctor_id = current_setting('app.current_doctor_id', true)::int)`,
      'Crear política schedule_blocks'
    );

    // Audit Logs (a través de patients)
    await executeSQL(
      `DROP POLICY IF EXISTS tenant_isolation_audit_logs ON audit_logs`,
      'Eliminar política antigua audit_logs'
    );
    await executeSQL(
      `CREATE POLICY tenant_isolation_audit_logs ON audit_logs
       FOR ALL
       USING (
         patient_id IN (
           SELECT id FROM patients
           WHERE id_doctor = current_setting('app.current_doctor_id', true)::int
         )
       )`,
      'Crear política audit_logs'
    );

    // 3. Verificar políticas creadas
    console.log('\n3️⃣  Verificando políticas creadas:');
    const policiesResult = await pool.query(`
      SELECT tablename, policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    if (policiesResult.rows.length === 0) {
      console.log('   ⚠️  NO se crearon políticas');
    } else {
      console.log(`   ✅ Políticas creadas: ${policiesResult.rows.length}`);
      policiesResult.rows.forEach((row: any) => {
        console.log(`      - ${row.tablename}: ${row.policyname}`);
      });
    }

    // 4. Verificar RLS habilitado
    console.log('\n4️⃣  Verificando tablas con RLS habilitado:');
    const rlsResult = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename
    `);

    console.log(`   ✅ Tablas con RLS: ${rlsResult.rows.length}`);
    rlsResult.rows.forEach((row: any) => {
      console.log(`      - ${row.tablename}`);
    });

    console.log('\n✅ POLÍTICAS RLS CREADAS EXITOSAMENTE\n');

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
