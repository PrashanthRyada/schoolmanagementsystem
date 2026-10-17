import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const staffTable = pgTable("school_staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  department: text("department").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertStaffSchema = createInsertSchema(staffTable).omit({ id: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type StaffRow = typeof staffTable.$inferSelect;
