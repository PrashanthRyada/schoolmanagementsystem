import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const teachersTable = pgTable("school_teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().default(""),
  subject: text("subject").notNull(),
  department: text("department").notNull(),
  qualification: text("qualification").notNull().default(""),
  avatarUrl: text("avatar_url"),
});

export const insertTeacherSchema = createInsertSchema(teachersTable).omit({ id: true });
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;
export type TeacherRow = typeof teachersTable.$inferSelect;
