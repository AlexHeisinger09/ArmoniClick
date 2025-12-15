// scripts/apply-migrations.ts
// Script para aplicar migraciones de multi-tenancy

import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
import ws from 'ws';

// Configurar WebSocket para Neon
neonConfig.webSocketConstructor = ws;

// Cargar variables de entorno
config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL no está definida en .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

async function executeMigration(filename: string, description: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 Ejecutando: ${filename}`);
  console.log(`📝 Descripción: ${description}`);
  console.log('='.repeat(60));

  try {
    // Leer archivo SQL
    const migrationPath = join(process.cwd(), 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Dividir en statements individuales (separados por punto y coma)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`\n📊 Total de statements: ${statements.length}`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comentarios y líneas vacías
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        await pool.query(statement);

        // Mostrar progreso cada 5 statements
        if ((i + 1) % 5 === 0 || i === statements.length - 1) {
          console.log(`   ✓ Ejecutado ${i + 1}/${statements.length} statements`);
        }
      } catch (error: any) {
        // Ignorar errores de "ya existe" (DROP IF EXISTS, etc)
        if (error.message?.includes('does not exist') ||
            error.message?.includes('already exists')) {
          console.log(`   ⚠️  Statement ${i + 1}: ${error.message}`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n✅ Migración completada exitosamente`);
    return true;

  } catch (error: any) {
    console.error(`\n❌ Error ejecutando migración:`);
    console.error(error.message);
    return false;
  }
}

async function verifyMigrations() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('🔍 VERIFICACIÓN DE MIGRACIONES');
  console.log('='.repeat(60));

  try {
    // Verificar índices creados
    console.log('\n📊 Verificando índices compuestos...');
    const indexesResult = await pool.query(`
      SELECT
        schemaname,
        tablename,
        indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%doctor%'
      ORDER BY tablename, indexname
    `);

    console.log(`   ✓ Índices compuestos encontrados: ${indexesResult.rows.length}`);
    indexesResult.rows.slice(0, 5).forEach((row: any) => {
      console.log(`      - ${row.tablename}.${row.indexname}`);
    });

    // Verificar RLS habilitado
    console.log('\n🔒 Verificando Row-Level Security...');
    const rlsResult = await pool.query(`
      SELECT
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename
    `);

    console.log(`   ✓ Tablas con RLS habilitado: ${rlsResult.rows.length}`);
    rlsResult.rows.forEach((row: any) => {
      console.log(`      - ${row.tablename}`);
    });

    // Verificar políticas RLS
    console.log('\n📋 Verificando políticas RLS...');
    const policiesResult = await pool.query(`
      SELECT
        tablename,
        policyname
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `);

    console.log(`   ✓ Políticas RLS creadas: ${policiesResult.rows.length}`);
    policiesResult.rows.slice(0, 5).forEach((row: any) => {
      console.log(`      - ${row.tablename}: ${row.policyname}`);
    });

    console.log('\n✅ Verificación completada');

  } catch (error: any) {
    console.error('\n❌ Error en verificación:', error.message);
  }
}

async function main() {
  console.log('\n🚀 INICIANDO APLICACIÓN DE MIGRACIONES');
  console.log(`📍 Database: ${DATABASE_URL?.split('@')[1]?.split('/')[0]}`);

  try {
    // Test conexión
    console.log('\n🔌 Probando conexión a base de datos...');
    await pool.query('SELECT NOW()');
    console.log('   ✓ Conexión exitosa');

    // Migración 1: Índices compuestos
    const step1 = await executeMigration(
      '0001_optimize_multi_tenant_indexes.sql',
      'Optimización de índices para multi-tenancy'
    );

    if (!step1) {
      console.error('\n❌ Falló la migración de índices. Abortando.');
      process.exit(1);
    }

    // Migración 2: Row-Level Security
    const step2 = await executeMigration(
      '0002_enable_row_level_security.sql',
      'Habilitar Row-Level Security'
    );

    if (!step2) {
      console.error('\n❌ Falló la migración de RLS. Abortando.');
      process.exit(1);
    }

    // Verificar que todo se aplicó correctamente
    await verifyMigrations();

    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRACIONES COMPLETADAS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log('\n📚 Próximos pasos:');
    console.log('   1. Actualizar Netlify Functions para usar setupTenantFromAuth()');
    console.log('   2. Probar aislamiento con dos cuentas de doctor');
    console.log('   3. Ver MULTI_TENANCY.md para más detalles\n');

  } catch (error: any) {
    console.error('\n❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
main();
