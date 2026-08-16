import {
  date,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const quranLogs = pgTable(
  "quran_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    date: date("date").notNull(), // 'YYYY-MM-DD' representing their local calendar day
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: uniqueIndex("quran_user_date_idx").on(table.userId, table.date),
  })
);
