import { createInsertSchema } from "drizzle-zod";
import { date, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const attendanceTable = pgTable(
  "school_attendance",
  {
    id: serial("id").primaryKey(),
    personId: integer("person_id").notNull(),
    personType: text("person_type").notNull(),
    classId: integer("class_id"),
    date: date("attendance_date", { mode: "string" }).notNull(),
    status: text("status").notNull(),
    note: text("note"),
  },
  (table) => [
    uniqueIndex("school_attendance_person_day_idx").on(
      table.personId,
      table.personType,
      table.date,
    ),
  ],
);

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({ id: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type AttendanceRow = typeof attendanceTable.$inferSelect;
