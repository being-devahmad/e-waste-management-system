
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

// User model
export const Users = pgTable("users", {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})