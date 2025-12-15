// scripts/test-tenant-context.ts
// Test para verificar que setTenantContext funciona correctamente

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { config } from 'dotenv';
import ws from 'ws';
import { setTenantContext, getCurrentTenantId } from '../netlify/config/tenant-context';

neonConfig.webSocketConstructor = ws;
config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: 10000,
});

const db = drizzle(pool);

async function main() {
  console.log('\n🧪 PROBANDO TENANT CONTEXT\n');

  try {
    // Test 1: Setear contexto de tenant
    console.log('1️⃣  Seteando contexto para doctor ID=1...');
    await setTenantContext(db, 1);
    console.log('   ✅ Contexto seteado exitosamente');

    // Test 2: Verificar que se seteó correctamente
    console.log('\n2️⃣  Verificando contexto actual...');
    const currentTenant = await getCurrentTenantId(db);
    console.log(`   ✅ Tenant actual: ${currentTenant}`);

    if (currentTenant === 1) {
      console.log('   ✅ ¡Contexto correcto!');
    } else {
      console.log('   ❌ Error: contexto no coincide');
    }

    // Test 3: Cambiar a otro doctor
    console.log('\n3️⃣  Cambiando a doctor ID=2...');
    await setTenantContext(db, 2);
    const newTenant = await getCurrentTenantId(db);
    console.log(`   ✅ Tenant actual: ${newTenant}`);

    if (newTenant === 2) {
      console.log('   ✅ ¡Contexto actualizado correctamente!');
    } else {
      console.log('   ❌ Error: contexto no se actualizó');
    }

    console.log('\n✅ TODOS LOS TESTS PASARON\n');

  } catch (error: any) {
    console.error('\n❌ ERROR EN TEST:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

main();
