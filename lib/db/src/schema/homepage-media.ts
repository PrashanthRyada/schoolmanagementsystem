import { createInsertSchema } from "drizzle-zod";
import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const homepageMediaTable = pgTable("homepage_media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  caption: text("caption").notNull().default(""),
  mediaType: text("media_type").notNull(),
  url: text("url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertHomepageMediaSchema = createInsertSchema(homepageMediaTable).omit({ id: true });
export type InsertHomepageMedia = z.infer<typeof insertHomepageMediaSchema>;
export type HomepageMediaRow = typeof homepageMediaTable.$inferSelect;
