
import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// Users model
export const Users = pgTable("users", {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
})

// Reports model
export const Reports = pgTable("reports", {
    id: serial('id').primaryKey(),
    userId: integer("user_id").references(() => Users.id).notNull(), // in reference with the users table 
    location: text('location').notNull(),
    wasteType: varchar('waste_type', { length: 255 }).notNull(),
    amount: varchar('amount', { length: 255 }).notNull(),
    imageUrl: text('image_url'),
    verificationResult: jsonb('verification_result'),
    status: varchar('status', { length: 255 }).notNull().default('pending'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    collectorId: integer('collector_id').references(() => Users.id).notNull() // in reference with the users table 
})

// Rewards model
export const Rewards = pgTable('rewards', {
    id: serial('id').primaryKey(),
    userId: integer("user_id").references(() => Users.id).notNull(), // in reference with the users table 
    points: integer('points').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    isAvailable: boolean('is_available').notNull().default(true),
    description: text('description'),
    name: varchar('name', { length: 255 }).notNull(),
    collectionInfo: text('collection_info').notNull()
})

// CollectedWaste model
export const CollectedWastes = pgTable('collected_waste', {
    id: serial('id').primaryKey(),
    reportId: integer('report_id').references(() => Reports.id).notNull(), // in reference with the reports table 
    collectorId: integer('collector_id').references(() => Users.id).notNull(), // in reference with the users table 
    collectionDate: timestamp('created_at').defaultNow().notNull(),
    status: varchar('status', { length: 255 }).notNull().default('collected'),
})

// Notification model
export const Notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer("user_id").references(() => Users.id).notNull(), // in reference with the users table 
    message: text('message'),
    type: varchar('type', { length: 50 }).notNull(),
    isRead: boolean('is_read').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Transactions model
export const Transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    userId: integer("user_id").references(() => Users.id).notNull(), // in reference with the users table 
    type: varchar('type', { length: 20 }).notNull(),
    amount: integer('amount').notNull(),
    description: text('description').notNull(),
    date: timestamp('date').defaultNow().notNull(),
})