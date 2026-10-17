import { createInsertSchema } from "drizzle-zod";
import { date, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const eventsTable = pgTable("school_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: date("event_date", { mode: "string" }).notNull(),
  time: text("event_time").notNull().default(""),
  location: text("location").notNull().default(""),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("teal"),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type SchoolEventRow = typeof eventsTable.$inferSelect;
