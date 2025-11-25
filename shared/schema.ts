import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
// Extended with role for multi-role support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ['patient', 'center', 'sponsor'] }).notNull().default('patient'),
  phone: varchar("phone"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  wallets: many(wallets),
  assessmentCodes: many(assessmentCodes),
  testResults: many(testResults),
  consentShares: many(consentShares),
  diagnosticCenter: one(diagnosticCenters, {
    fields: [users.id],
    references: [diagnosticCenters.userId],
  }),
}));

// Wallets for patients to fund sexual health tests
export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default('0.00'),
  currency: varchar("currency").notNull().default('NGN'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

// Test Standards Library - defines what tests are available
export const testStandards = pgTable("test_standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  testsIncluded: jsonb("tests_included").notNull().$type<string[]>(),
  sampleType: varchar("sample_type"),
  turnaroundTime: varchar("turnaround_time"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const testStandardsRelations = relations(testStandards, ({ many }) => ({
  assessmentCodes: many(assessmentCodes),
}));

// Assessment Codes - unique codes for tests
export const assessmentCodes = pgTable("assessment_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 12 }).notNull().unique(),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  patientName: text("patient_name").notNull(),
  sponsorId: varchar("sponsor_id").references(() => users.id),
  sponsorType: varchar("sponsor_type", { enum: ['self', 'employer', 'ngo', 'partner', 'family', 'other'] }).notNull().default('self'),
  status: varchar("status", { enum: ['pending', 'used', 'expired'] }).notNull().default('pending'),
  validUntil: timestamp("valid_until").notNull(),
  usedAt: timestamp("used_at"),
  diagnosticCenterId: varchar("diagnostic_center_id").references(() => diagnosticCenters.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessmentCodesRelations = relations(assessmentCodes, ({ one }) => ({
  testStandard: one(testStandards, {
    fields: [assessmentCodes.testStandardId],
    references: [testStandards.id],
  }),
  patient: one(users, {
    fields: [assessmentCodes.patientId],
    references: [users.id],
  }),
  sponsor: one(users, {
    fields: [assessmentCodes.sponsorId],
    references: [users.id],
  }),
  diagnosticCenter: one(diagnosticCenters, {
    fields: [assessmentCodes.diagnosticCenterId],
    references: [diagnosticCenters.id],
  }),
  testResult: one(testResults, {
    fields: [assessmentCodes.id],
    references: [testResults.assessmentCodeId],
  }),
}));

// Diagnostic Centers
export const diagnosticCenters = pgTable("diagnostic_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  country: varchar("country").notNull().default('Nigeria'),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  hours: text("hours"),
  verified: boolean("verified").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0.00'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const diagnosticCentersRelations = relations(diagnosticCenters, ({ one, many }) => ({
  user: one(users, {
    fields: [diagnosticCenters.userId],
    references: [users.id],
  }),
  assessmentCodes: many(assessmentCodes),
  testResults: many(testResults),
}));

// Test Results - anonymous storage without patient names
export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentCodeId: varchar("assessment_code_id").notNull().references(() => assessmentCodes.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  diagnosticCenterId: varchar("diagnostic_center_id").notNull().references(() => diagnosticCenters.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  results: jsonb("results").notNull().$type<{
    parameter: string;
    value: string;
    referenceRange: string;
    status: 'normal' | 'abnormal' | 'borderline';
  }[]>(),
  viewed: boolean("viewed").notNull().default(false),
  viewedAt: timestamp("viewed_at"),
  sponsorNotified: boolean("sponsor_notified").notNull().default(false),
  sponsorNotifiedAt: timestamp("sponsor_notified_at"),
  testedAt: timestamp("tested_at").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const testResultsRelations = relations(testResults, ({ one, many }) => ({
  assessmentCode: one(assessmentCodes, {
    fields: [testResults.assessmentCodeId],
    references: [assessmentCodes.id],
  }),
  patient: one(users, {
    fields: [testResults.patientId],
    references: [users.id],
  }),
  diagnosticCenter: one(diagnosticCenters, {
    fields: [testResults.diagnosticCenterId],
    references: [diagnosticCenters.id],
  }),
  testStandard: one(testStandards, {
    fields: [testResults.testStandardId],
    references: [testStandards.id],
  }),
  consentShares: many(consentShares),
}));

// Consent-based sharing system
export const consentShares = pgTable("consent_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  testResultId: varchar("test_result_id").notNull().references(() => testResults.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  sharedWith: varchar("shared_with"),
  sharedWithType: varchar("shared_with_type", { enum: ['user', 'email', 'phone'] }).notNull(),
  accessLevel: varchar("access_level", { enum: ['summary', 'full'] }).notNull().default('full'),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  accessedAt: timestamp("accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consentSharesRelations = relations(consentShares, ({ one }) => ({
  testResult: one(testResults, {
    fields: [consentShares.testResultId],
    references: [testResults.id],
  }),
  patient: one(users, {
    fields: [consentShares.patientId],
    references: [users.id],
  }),
}));

// Transaction history
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ['credit', 'debit'] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  description: text("description").notNull(),
  reference: varchar("reference"),
  status: varchar("status", { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Zod schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export const insertTestStandardSchema = createInsertSchema(testStandards).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTestStandard = z.infer<typeof insertTestStandardSchema>;
export type TestStandard = typeof testStandards.$inferSelect;

export const insertAssessmentCodeSchema = createInsertSchema(assessmentCodes).omit({ id: true, createdAt: true });
export type InsertAssessmentCode = z.infer<typeof insertAssessmentCodeSchema>;
export type AssessmentCode = typeof assessmentCodes.$inferSelect;

export const insertDiagnosticCenterSchema = createInsertSchema(diagnosticCenters).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDiagnosticCenter = z.infer<typeof insertDiagnosticCenterSchema>;
export type DiagnosticCenter = typeof diagnosticCenters.$inferSelect;

export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, uploadedAt: true });
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;

export const insertConsentShareSchema = createInsertSchema(consentShares).omit({ id: true, createdAt: true });
export type InsertConsentShare = z.infer<typeof insertConsentShareSchema>;
export type ConsentShare = typeof consentShares.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
