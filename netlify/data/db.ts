
import { envs } from '../config/envs';

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: envs.DATABASE_URL });
export const db = drizzle(pool);
