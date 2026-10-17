import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { classesTable } from "./classes";

export const studentsTable = pgTable("school_students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  admissionNumber: text("admission_number").notNull().unique(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  avatarUrl: text("avatar_url"),
  classId: integer("class_id").references(() => classesTable.id, { onDelete: "set null" }),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type StudentRow = typeof studentsTable.$inferSelect;
