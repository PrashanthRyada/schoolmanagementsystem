import { createInsertSchema } from "drizzle-zod";
import { date, integer, numeric, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const feesTable = pgTable("school_fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id, { onDelete: "cascade" }),
  period: text("period").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
  dueDate: date("due_date", { mode: "string" }).notNull(),
});

export const insertFeeSchema = createInsertSchema(feesTable).omit({ id: true });
export type InsertFee = z.infer<typeof insertFeeSchema>;
export type FeeRow = typeof feesTable.$inferSelect;
