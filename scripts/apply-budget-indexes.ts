// scripts/apply-budget-indexes.ts
// Script para aplicar índices optimizados de presupuestos

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

async function applyBudgetIndexes() {
  console.log('\n🚀 Aplicando índices optimizados para presupuestos...\n');

  try {
    const client = await pool.connect();

    // Leer archivo SQL
    const migrationPath = join(process.cwd(), 'migrations', '0013_optimize_budget_joins.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    // Dividir en statements individuales
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Total de statements: ${statements.length}\n`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios y líneas vacías
      if (!statement || statement.startsWith('--')) continue;

      try {
        console.log(`⚙️  Ejecutando statement ${i + 1}/${statements.length}...`);
        await client.query(statement + ';');
        console.log(`✅ Statement ${i + 1} ejecutado correctamente\n`);
      } catch (error: any) {
        // Si el índice ya existe, no es un error crítico
        if (error.message?.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1}: Índice ya existe (OK)\n`);
        } else {
          console.error(`❌ Error en statement ${i + 1}:`, error.message, '\n');
        }
      }
    }

    // Verificar índices creados
    console.log('\n📋 Verificando índices de budget_items...');
    const budgetItemsIndexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'budget_items'
        AND indexname LIKE 'idx_budget_items%'
      ORDER BY indexname;
    `);

    console.log(`✅ Encontrados ${budgetItemsIndexes.rows.length} índices:\n`);
    budgetItemsIndexes.rows.forEach((row: any) => {
      console.log(`   • ${row.indexname}`);
    });

    console.log('\n📋 Verificando índices de budgets...');
    const budgetsIndexes = await client.query(`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'budgets'
        AND indexname LIKE 'idx_budgets%'
      ORDER BY indexname;
    `);

    console.log(`✅ Encontrados ${budgetsIndexes.rows.length} índices:\n`);
    budgetsIndexes.rows.forEach((row: any) => {
      console.log(`   • ${row.indexname}`);
    });

    // Verificar tamaño de índices
    console.log('\n📊 Tamaño de índices críticos:');
    const indexSizes = await client.query(`
      SELECT
        indexname,
        pg_size_pretty(pg_relation_size(indexname::regclass)) as size
      FROM pg_indexes
      WHERE tablename IN ('budget_items', 'budgets')
        AND (indexname LIKE 'idx_budget_items%' OR indexname LIKE 'idx_budgets%')
      ORDER BY pg_relation_size(indexname::regclass) DESC;
    `);

    indexSizes.rows.forEach((row: any) => {
      console.log(`   • ${row.indexname}: ${row.size}`);
    });

    client.release();

    console.log('\n✅ Índices optimizados aplicados correctamente!\n');
    console.log('💡 Tip: Puedes verificar el plan de ejecución con:');
    console.log('   npm run drizzle:studio\n');

  } catch (error: any) {
    console.error('\n❌ Error aplicando índices:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
applyBudgetIndexes();
