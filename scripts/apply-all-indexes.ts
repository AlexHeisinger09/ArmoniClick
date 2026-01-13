// scripts/apply-all-indexes.ts
// Script maestro para aplicar TODOS los índices optimizados

import { Pool, neonConfig } from "@neondatabase/serverless";
import { config } from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
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

async function executeMigration(client: any, filename: string, description: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`📄 Migración: ${filename}`);
  console.log(`📝 ${description}`);
  console.log('='.repeat(70));

  try {
    // Leer archivo SQL
    const migrationPath = join(process.cwd(), 'migrations', filename);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Dividir en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Total de statements: ${statements.length}\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios
      if (!statement || statement.startsWith('--')) continue;

      try {
        await client.query(statement + ';');
        successCount++;

        // Mostrar progreso cada 5 statements
        if ((i + 1) % 5 === 0 || i === statements.length - 1) {
          console.log(`⚙️  Progreso: ${i + 1}/${statements.length} statements ejecutados`);
        }
      } catch (error: any) {
        // Si el índice ya existe, no es un error crítico
        if (error.message?.includes('already exists')) {
          skipCount++;
        } else {
          errorCount++;
          console.error(`❌ Error en statement ${i + 1}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Completado: ${successCount} nuevos | ⚠️  ${skipCount} ya existían | ❌ ${errorCount} errores\n`);

    return { successCount, skipCount, errorCount };
  } catch (error: any) {
    console.error(`\n❌ Error leyendo migración:`, error.message);
    return { successCount: 0, skipCount: 0, errorCount: 1 };
  }
}

async function applyAllIndexes() {
  console.log('\n🚀 Aplicando TODOS los índices optimizados del sistema...\n');

  const migrations = [
    {
      file: '0013_optimize_budget_joins.sql',
      description: 'Índices para presupuestos y items (LEFT JOIN optimization)'
    },
    {
      file: '0014_optimize_all_joins.sql',
      description: 'Índices para appointments, treatments, patients, y más'
    }
  ];

  let totalSuccess = 0;
  let totalSkip = 0;
  let totalError = 0;

  try {
    const client = await pool.connect();

    // Aplicar cada migración
    for (const migration of migrations) {
      const result = await executeMigration(client, migration.file, migration.description);
      totalSuccess += result.successCount;
      totalSkip += result.skipCount;
      totalError += result.errorCount;
    }

    // Resumen de índices por tabla
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DE ÍNDICES POR TABLA');
    console.log('='.repeat(70) + '\n');

    const tables = [
      'appointments',
      'patients',
      'treatments',
      'budget_items',
      'budgets',
      'locations',
      'users',
      'notifications',
      'documents',
      'audit_logs',
      'prescriptions',
      'services',
      'schedule_blocks'
    ];

    for (const table of tables) {
      const result = await client.query(`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE tablename = $1
          AND indexname LIKE 'idx_%';
      `, [table]);

      const count = result.rows[0]?.count || 0;
      console.log(`   ${table.padEnd(20)} → ${count} índices`);
    }

    // Tamaño total de índices
    console.log('\n' + '='.repeat(70));
    console.log('💾 TAMAÑO DE ÍNDICES');
    console.log('='.repeat(70) + '\n');

    const sizeResult = await client.query(`
      SELECT
        pg_size_pretty(sum(pg_relation_size(indexrelid))) as total_size
      FROM pg_stat_user_indexes;
    `);

    const totalSize = sizeResult.rows[0]?.total_size || '0 bytes';
    console.log(`   Tamaño total de índices: ${totalSize}\n`);

    // Top 10 índices más grandes
    console.log('📈 Top 10 índices más grandes:\n');
    const topIndexes = await client.query(`
      SELECT
        indexrelname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE indexrelname LIKE 'idx_%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10;
    `);

    topIndexes.rows.forEach((row: any, i: number) => {
      console.log(`   ${(i + 1).toString().padStart(2)}. ${row.index_name.padEnd(40)} ${row.size}`);
    });

    // Verificar índices no usados
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  ÍNDICES NO USADOS (candidatos a eliminar)');
    console.log('='.repeat(70) + '\n');

    const unusedIndexes = await client.query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as size
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
        AND indexname LIKE 'idx_%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 5;
    `);

    if (unusedIndexes.rows.length > 0) {
      console.log('   ⚠️  Encontrados índices sin uso:\n');
      unusedIndexes.rows.forEach((row: any) => {
        console.log(`      • ${row.tablename}.${row.indexname} (${row.size})`);
      });
      console.log('\n   💡 Considera eliminarlos si siguen sin uso después de 1 semana\n');
    } else {
      console.log('   ✅ Todos los índices están siendo utilizados!\n');
    }

    client.release();

    // Resumen final
    console.log('='.repeat(70));
    console.log('✅ RESUMEN FINAL');
    console.log('='.repeat(70) + '\n');
    console.log(`   Índices nuevos creados: ${totalSuccess}`);
    console.log(`   Índices ya existentes:  ${totalSkip}`);
    console.log(`   Errores:                ${totalError}`);
    console.log(`   Total procesado:        ${totalSuccess + totalSkip + totalError}`);
    console.log('');
    console.log('🎯 Próximos pasos:');
    console.log('   1. Probar queries con EXPLAIN ANALYZE');
    console.log('   2. Medir tiempos en DevTools (Network tab)');
    console.log('   3. Verificar que dashboard cargue en <2s');
    console.log('   4. Monitorear uso de índices en pg_stat_user_indexes\n');

  } catch (error: any) {
    console.error('\n❌ Error aplicando índices:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
applyAllIndexes();
