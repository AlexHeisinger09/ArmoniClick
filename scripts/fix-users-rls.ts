// scripts/fix-users-rls.ts
// URGENTE: Deshabilitar RLS en tabla users que bloquea el login

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
  console.log('\n🚨 FIX URGENTE: Deshabilitar RLS en tabla users\n');

  try {
    // 1. Deshabilitar RLS en users
    console.log('1️⃣  Deshabilitando RLS en tabla users...');
    await pool.query(`ALTER TABLE users DISABLE ROW LEVEL SECURITY`);
    console.log('   ✅ RLS deshabilitado en users');

    // 2. Eliminar política si existe
    console.log('\n2️⃣  Eliminando política tenant_isolation_users si existe...');
    await pool.query(`DROP POLICY IF EXISTS tenant_isolation_users ON users`);
    console.log('   ✅ Política eliminada (si existía)');

    // 3. Verificar estado final
    console.log('\n3️⃣  Verificando estado final...');
    const result = await pool.query(`
      SELECT tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'users'
    `);

    const isRLSEnabled = result.rows[0]?.rowsecurity;
    console.log(`   RLS en tabla users: ${isRLSEnabled ? '❌ ACTIVO (MAL)' : '✅ DESACTIVADO (CORRECTO)'}`);

    if (!isRLSEnabled) {
      console.log('\n✅ PROBLEMA SOLUCIONADO - Login debería funcionar ahora\n');
    } else {
      console.log('\n⚠️  ADVERTENCIA: RLS sigue activo. Revisar manualmente.\n');
    }

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

main();
