import { type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
export type SchemaType = typeof schema;
export type AppDatabase = NodePgDatabase<SchemaType>;
export declare const pool: any;
export declare const db: AppDatabase;
export * from "./schema";
export { seedDatabase } from "./seed";
//# sourceMappingURL=index.d.ts.map