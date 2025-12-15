// scripts/check-rls-status.ts
// Script para verificar el estado de RLS

import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from 'dotenv';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 10000,
});

async function main() {
  console.log('\n🔍 VERIFICACIÓN DE ROW-LEVEL SECURITY\n');

  try {
    // Ver todas las tablas
    console.log('📊 Tablas existentes:');
    const tablesResult = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    tablesResult.rows.forEach((row: any) => {
      console.log(`   - ${row.tablename}`);
    });

    // Ver RLS status
    console.log('\n🔒 Estado de RLS por tabla:');
    const rlsStatus = await pool.query(`
      SELECT
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    rlsStatus.rows.forEach((row: any) => {
      const status = row.rowsecurity ? '✅ HABILITADO' : '❌ DESHABILITADO';
      console.log(`   ${status} - ${row.tablename}`);
    });

    // Ver políticas
    console.log('\n📋 Políticas RLS activas:');
    const policiesResult = await pool.query(`
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    if (policiesResult.rows.length === 0) {
      console.log('   ⚠️  NO hay políticas RLS creadas');
    } else {
      policiesResult.rows.forEach((row: any) => {
        console.log(`   - ${row.tablename}.${row.policyname} (${row.cmd})`);
      });
    }

    // Ver índices creados
    console.log('\n📊 Índices compuestos para multi-tenancy:');
    const indexesResult = await pool.query(`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND (
          indexname LIKE '%doctor%'
          OR indexname LIKE '%user%'
        )
      ORDER BY tablename, indexname
    `);

    if (indexesResult.rows.length === 0) {
      console.log('   ⚠️  NO hay índices compuestos');
    } else {
      indexesResult.rows.forEach((row: any) => {
        console.log(`   - ${row.tablename}.${row.indexname}`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

main();
