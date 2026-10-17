import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { teachersTable } from "./teachers";

export const classesTable = pgTable("school_classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  teacherId: integer("teacher_id").references(() => teachersTable.id, { onDelete: "set null" }),
  room: text("room").notNull().default(""),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type SchoolClassRow = typeof classesTable.$inferSelect;
