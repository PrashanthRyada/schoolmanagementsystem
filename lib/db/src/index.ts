import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";
import { seedDatabase } from "./seed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file if available
function loadEnv() {
  if (typeof process.loadEnvFile === "function") {
    const candidatePaths = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(__dirname, "../../../.env"),
    ];
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          process.loadEnvFile(p);
          break;
        } catch {
          // ignore
        }
      }
    }
  }
}
loadEnv();

export type SchemaType = typeof schema;
export type AppDatabase = NodePgDatabase<SchemaType>;

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS "school_attendance" (
	"id" serial PRIMARY KEY NOT NULL,
	"person_id" integer NOT NULL,
	"person_type" text NOT NULL,
	"class_id" integer,
	"attendance_date" date NOT NULL,
	"status" text NOT NULL,
	"note" text
);
CREATE TABLE IF NOT EXISTS "school_teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"phone" text DEFAULT '' NOT NULL,
	"subject" text NOT NULL,
	"department" text NOT NULL,
	"qualification" text DEFAULT '' NOT NULL,
	"avatar_url" text
);
CREATE TABLE IF NOT EXISTS "school_classes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grade" text NOT NULL,
	"section" text NOT NULL,
	"teacher_id" integer,
	"room" text DEFAULT '' NOT NULL
);
CREATE TABLE IF NOT EXISTS "school_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"event_date" date NOT NULL,
	"event_time" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" text DEFAULT 'teal' NOT NULL
);
CREATE TABLE IF NOT EXISTS "school_fees" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"period" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"due_date" date NOT NULL
);
CREATE TABLE IF NOT EXISTS "homepage_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"media_type" text NOT NULL,
	"url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
CREATE TABLE IF NOT EXISTS "student_performance" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" integer NOT NULL,
	"subject" text NOT NULL,
	"assessment" text NOT NULL,
	"score" numeric(7, 2) NOT NULL,
	"max_score" numeric(7, 2) NOT NULL,
	"recorded_at" date NOT NULL
);
CREATE TABLE IF NOT EXISTS "school_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"email" text NOT NULL,
	"department" text NOT NULL,
	"avatar_url" text
);
CREATE TABLE IF NOT EXISTS "school_students" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"admission_number" text NOT NULL,
	"grade" text NOT NULL,
	"section" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"class_id" integer,
	CONSTRAINT "school_students_admission_number_unique" UNIQUE("admission_number")
);
CREATE UNIQUE INDEX IF NOT EXISTS "school_attendance_person_day_idx" ON "school_attendance" USING btree ("person_id","person_type","attendance_date");
`;

let dbInstance: AppDatabase;
let poolInstance: any = null;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("local")) {
  const { Pool } = pg;
  poolInstance = new Pool({ connectionString: process.env.DATABASE_URL });
  dbInstance = drizzleNodePg(poolInstance, { schema });
} else {
  // Use local embedded PGlite database
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle: drizzlePglite } = await import("drizzle-orm/pglite");

  const projectRoot = path.resolve(__dirname, "../../..");
  const dataDir = path.resolve(projectRoot, ".data/local-db");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pgliteClient = new PGlite(dataDir);
  // PGlite driver implements the identical postgres query interface and schema mapping
  dbInstance = drizzlePglite(pgliteClient, { schema }) as unknown as AppDatabase;
  poolInstance = pgliteClient;

  // Initialize schema tables if they do not exist
  const statements = SCHEMA_DDL.split(";").map((s) => s.trim()).filter(Boolean);
  for (const statement of statements) {
    try {
      await pgliteClient.exec(statement);
    } catch (err) {
      console.warn("[db] Warning executing statement during local init:", err);
    }
  }

  // Seed sample data if database is empty
  try {
    await seedDatabase(dbInstance);
  } catch (err) {
    console.warn("[db] Warning seeding local database:", err);
  }
}

export const pool = poolInstance;
export const db: AppDatabase = dbInstance;
export * from "./schema";
export { seedDatabase } from "./seed";
