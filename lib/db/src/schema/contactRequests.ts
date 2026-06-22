import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contactRequestsTable = pgTable("contact_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  company: varchar("company", { length: 200 }).notNull(),
  position: varchar("position", { length: 200 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  message: text("message"),
  requestType: varchar("request_type", { length: 32 }).notNull(),
  source: varchar("source", { length: 200 }),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  utmSource: varchar("utm_source", { length: 200 }),
  utmMedium: varchar("utm_medium", { length: 200 }),
  utmCampaign: varchar("utm_campaign", { length: 200 }),
  utmContent: varchar("utm_content", { length: 200 }),
  utmTerm: varchar("utm_term", { length: 200 }),
  ipAddress: varchar("ip_address", { length: 64 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertContactRequestSchema = createInsertSchema(
  contactRequestsTable,
).omit({ id: true, createdAt: true });

export type InsertContactRequest = z.infer<typeof insertContactRequestSchema>;
export type ContactRequest = typeof contactRequestsTable.$inferSelect;
