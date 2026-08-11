import { relations } from "drizzle-orm/_relations";
import {
  date,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// 1. Users Table (Populated via Clerk Webhook on sign-up)
export const users = pgTable("users", {
  id: varchar("id", { length: 256 }).primaryKey(), // Clerk User ID
  timezone: varchar("timezone", { length: 100 }).default("Europe/London").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  
  // Keeps the MVP interactive with streak counts
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
});

// 2. Quran Logs Table (A row exists = they read on that day)
export const quranLogs = pgTable(
  "quran_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 256 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date").notNull(), // 'YYYY-MM-DD' representing their local calendar day
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // CRITICAL: Guarantees a user can only log reading once per day
    userDateIdx: uniqueIndex("quran_user_date_idx").on(table.userId, table.date),
  })
);

// --- Simplest Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  quranLogs: many(quranLogs),
}));

export const quranLogsRelations = relations(quranLogs, ({ one }) => ({
  user: one(users, {
    fields: [quranLogs.userId],
    references: [users.id],
  }),
}));