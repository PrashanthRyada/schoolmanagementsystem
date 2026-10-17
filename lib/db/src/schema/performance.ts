import { createInsertSchema } from "drizzle-zod";
import { date, integer, numeric, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const performanceTable = pgTable("student_performance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  assessment: text("assessment").notNull(),
  score: numeric("score", { precision: 7, scale: 2, mode: "number" }).notNull(),
  maxScore: numeric("max_score", { precision: 7, scale: 2, mode: "number" }).notNull(),
  recordedAt: date("recorded_at", { mode: "string" }).notNull(),
});

export const insertPerformanceSchema = createInsertSchema(performanceTable).omit({ id: true });
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type PerformanceRow = typeof performanceTable.$inferSelect;
