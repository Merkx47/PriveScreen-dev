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
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =====================================================
// CORE USERS & AUTHENTICATION
// =====================================================

// Admin access levels for role-based permissions
export const ADMIN_ACCESS_LEVELS = {
  SUPER_ADMIN: 'super_admin',   // Full access including withdrawals/financial operations
  EDITOR: 'editor',             // Can edit/manage but cannot delete
  READ_ONLY: 'read_only',       // View dashboard only
} as const;

export type AdminAccessLevel = typeof ADMIN_ACCESS_LEVELS[keyof typeof ADMIN_ACCESS_LEVELS];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ['patient', 'center', 'sponsor', 'admin'] }).notNull().default('patient'),
  // For admin users: controls what actions they can perform
  adminAccessLevel: varchar("admin_access_level", { enum: ['super_admin', 'editor', 'read_only'] }),
  phone: varchar("phone"),
  phoneVerified: boolean("phone_verified").default(false),
  emailVerified: boolean("email_verified").default(false),
  status: varchar("status", { enum: ['active', 'inactive', 'suspended', 'deleted'] }).notNull().default('active'),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    userId: varchar("user_id").references(() => users.id),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
    ipAddress: varchar("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// OAuth/SSO Providers (Google, Microsoft, Apple)
export const oauthProviders = pgTable("oauth_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code", { enum: ['google', 'microsoft', 'apple'] }).notNull().unique(),
  clientId: varchar("client_id"),
  enabled: boolean("enabled").notNull().default(true),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User OAuth Accounts - links users to their SSO identities
export const userOauthAccounts = pgTable("user_oauth_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => oauthProviders.id),
  providerUserId: varchar("provider_user_id").notNull(),
  providerEmail: varchar("provider_email"),
  providerName: varchar("provider_name"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  profileData: jsonb("profile_data"),
  linkedAt: timestamp("linked_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceToken: varchar("device_token").notNull(),
  deviceType: varchar("device_type").notNull(),
  deviceName: varchar("device_name"),
  platform: varchar("platform"),
  appVersion: varchar("app_version"),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// WALLETS & PAYMENTS
// =====================================================

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  currency: varchar("currency").notNull().default('NGN'),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  paymentMethod: varchar("payment_method").notNull(),
  channel: varchar("channel").notNull(),
  provider: varchar("provider"),
  providerReference: varchar("provider_reference"),
  providerStatus: varchar("provider_status"),
  description: text("description"),
  status: varchar("status", { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull().default('pending'),
  paidAt: timestamp("paid_at"),
  verifiedAt: timestamp("verified_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { enum: ['credit', 'debit'] }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  description: text("description").notNull(),
  reference: varchar("reference").unique(),
  status: varchar("status", { enum: ['pending', 'completed', 'failed'] }).notNull().default('pending'),
  paymentId: varchar("payment_id").references(() => payments.id),
  virtualAccountId: varchar("virtual_account_id").references(() => virtualAccounts.id),
  ussdPaymentId: varchar("ussd_payment_id").references(() => ussdPayments.id),
  mobileMoneyPaymentId: varchar("mobile_money_payment_id").references(() => mobileMoneyPayments.id),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rubies Bank Virtual Accounts
export const virtualAccounts = pgTable("virtual_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accountNumber: varchar("account_number").notNull(),
  accountName: varchar("account_name").notNull(),
  bankName: varchar("bank_name").notNull().default('Rubies Bank'),
  bankCode: varchar("bank_code").default('125'),
  expectedAmount: decimal("expected_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  status: varchar("status", { enum: ['pending', 'funded', 'expired', 'cancelled'] }).notNull().default('pending'),
  expiresAt: timestamp("expires_at").notNull(),
  fundedAt: timestamp("funded_at"),
  fundedAmount: decimal("funded_amount", { precision: 12, scale: 2 }),
  reference: varchar("reference").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobile Money Providers (MTN, Airtel, Glo, 9mobile, OPay, PalmPay)
export const mobileMoneyProviders = pgTable("mobile_money_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  logoUrl: varchar("logo_url"),
  color: varchar("color"),
  ussdPrefix: varchar("ussd_prefix"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const mobileMoneyPayments = pgTable("mobile_money_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => mobileMoneyProviders.id),
  phoneNumber: varchar("phone_number").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  status: varchar("status", { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  providerReference: varchar("provider_reference"),
  providerStatus: varchar("provider_status"),
  ussdSentAt: timestamp("ussd_sent_at"),
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  failureReason: text("failure_reason"),
  reference: varchar("reference").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// USSD Bank Payments
export const ussdBanks = pgTable("ussd_banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  ussdPrefix: varchar("ussd_prefix").notNull(),
  color: varchar("color"),
  initials: varchar("initials"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ussdPayments = pgTable("ussd_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  bankId: varchar("bank_id").notNull().references(() => ussdBanks.id),
  ussdCode: varchar("ussd_code").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  merchantCode: varchar("merchant_code"),
  status: varchar("status", { enum: ['pending', 'processing', 'completed', 'failed'] }).notNull().default('pending'),
  dialedAt: timestamp("dialed_at"),
  confirmedAt: timestamp("confirmed_at"),
  failedAt: timestamp("failed_at"),
  failureReason: text("failure_reason"),
  reference: varchar("reference").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Nigerian Banks (for withdrawals/transfers)
export const banks = pgTable("banks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  code: varchar("code").notNull().unique(),
  nipCode: varchar("nip_code"),
  logoUrl: varchar("logo_url"),
  ussdPrefix: varchar("ussd_prefix"),
  isPopular: boolean("is_popular").default(false),
  supportsVirtualAccount: boolean("supports_virtual_account").default(false),
  active: boolean("active").notNull().default(true),
});

// =====================================================
// TEST STANDARDS & WELLNESS
// =====================================================

export const testStandards = pgTable("test_standards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: varchar("slug").unique(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  testsIncluded: jsonb("tests_included").notNull().$type<string[]>(),
  sampleType: varchar("sample_type"),
  turnaroundTime: varchar("turnaround_time"),
  preparationInstructions: text("preparation_instructions"),
  active: boolean("active").notNull().default(true),
  isDefault: boolean("is_default").default(false),
  isPopular: boolean("is_popular").default(false),
  hasWindowPeriodInfo: boolean("has_window_period_info").default(false),
  windowPeriodDays: integer("window_period_days"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wellnessAddons = pgTable("wellness_addons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  turnaroundTime: varchar("turnaround_time"),
  compatibleTests: jsonb("compatible_tests"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// DIAGNOSTIC CENTERS
// =====================================================

export const diagnosticCenters = pgTable("diagnostic_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  slug: varchar("slug").unique(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  country: varchar("country").notNull().default('Nigeria'),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  website: varchar("website"),
  hours: jsonb("hours"),
  logoUrl: varchar("logo_url"),
  coverImageUrl: varchar("cover_image_url"),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  status: varchar("status", { enum: ['pending', 'active', 'suspended', 'rejected'] }).notNull().default('pending'),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0.00'),
  totalRatings: integer("total_ratings").default(0),
  totalTestsCompleted: integer("total_tests_completed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerApplications = pgTable("center_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  centerName: text("center_name").notNull(),
  address: text("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email"),
  cacNumber: varchar("cac_number"),
  licenseNumber: varchar("license_number"),
  documents: jsonb("documents"),
  status: varchar("status", { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerTestPricing = pgTable("center_test_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  turnaroundOverride: varchar("turnaround_override"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerWallets = pgTable("center_wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default('0.00'),
  pendingWithdrawal: decimal("pending_withdrawal", { precision: 12, scale: 2 }).notNull().default('0.00'),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).notNull().default('0.00'),
  currency: varchar("currency").notNull().default('NGN'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerBankAccounts = pgTable("center_bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  bankId: varchar("bank_id").notNull().references(() => banks.id),
  accountNumber: varchar("account_number").notNull(),
  accountName: varchar("account_name").notNull(),
  isPrimary: boolean("is_primary").notNull().default(false),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const centerRevenue = pgTable("center_revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  type: varchar("type", { enum: ['test', 'home_service', 'prime_referral'] }).notNull(),
  sourceType: varchar("source_type"),
  sourceId: varchar("source_id"),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 12, scale: 2 }).default('0.00'),
  netAmount: decimal("net_amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  patientCode: varchar("patient_code"),
  status: varchar("status", { enum: ['pending', 'completed', 'refunded'] }).notNull().default('completed'),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const centerRatings = pgTable("center_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  testResultId: varchar("test_result_id").references(() => testResults.id),
  bookingId: varchar("booking_id").references(() => homeServiceBookings.id),
  rating: integer("rating").notNull(),
  review: text("review"),
  isAnonymous: boolean("is_anonymous").default(true),
  centerResponse: text("center_response"),
  centerResponseAt: timestamp("center_response_at"),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// HOME SERVICE
// =====================================================

export const homeServiceSettings = pgTable("home_service_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  offersHomeService: boolean("offers_home_service").notNull().default(false),
  serviceRadiusKm: integer("service_radius_km").default(10),
  minBookingHours: integer("min_booking_hours").default(24),
  maxBookingsPerDay: integer("max_bookings_per_day"),
  startHour: integer("start_hour"),
  endHour: integer("end_hour"),
  unavailableDays: jsonb("unavailable_days"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const homeServicePricing = pgTable("home_service_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const homeServiceBookings = pgTable("home_service_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingNumber: varchar("booking_number").unique().notNull(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  assessmentCodeId: varchar("assessment_code_id").references(() => assessmentCodes.id),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time").notNull(),
  address: text("address").notNull(),
  city: varchar("city"),
  state: varchar("state"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  phoneNumber: varchar("phone_number").notNull(),
  specialInstructions: text("special_instructions"),
  status: varchar("status", { enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] }).notNull().default('pending'),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  paymentId: varchar("payment_id").references(() => payments.id),
  paymentStatus: varchar("payment_status", { enum: ['pending', 'completed', 'failed', 'refunded'] }).default('pending'),
  assignedPhlebotomist: varchar("assigned_phlebotomist"),
  phlebotomistPhone: varchar("phlebotomist_phone"),
  resultId: varchar("result_id").references(() => testResults.id),
  cancelledReason: text("cancelled_reason"),
  cancelledBy: varchar("cancelled_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
});

// =====================================================
// ASSESSMENT CODES & TEST RESULTS
// =====================================================

export const assessmentCodes = pgTable("assessment_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 12 }).notNull().unique(),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  patientName: text("patient_name").notNull(),
  sponsorId: varchar("sponsor_id").references(() => users.id),
  sponsorType: varchar("sponsor_type", { enum: ['self', 'employer', 'ngo', 'partner', 'family', 'other'] }).notNull().default('self'),
  sourceType: varchar("source_type", { enum: ['self_purchase', 'sponsor_request', 'home_service', 'prime_benefit'] }).notNull().default('self_purchase'),
  sourceId: varchar("source_id"),
  status: varchar("status", { enum: ['pending', 'used', 'expired'] }).notNull().default('pending'),
  validUntil: timestamp("valid_until").notNull(),
  usedAt: timestamp("used_at"),
  diagnosticCenterId: varchar("diagnostic_center_id").references(() => diagnosticCenters.id),
  pricePaid: decimal("price_paid", { precision: 12, scale: 2 }),
  currency: varchar("currency").default('NGN'),
  paymentId: varchar("payment_id").references(() => payments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testResults = pgTable("test_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resultNumber: varchar("result_number").unique().notNull(),
  assessmentCodeId: varchar("assessment_code_id").notNull().references(() => assessmentCodes.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  diagnosticCenterId: varchar("diagnostic_center_id").notNull().references(() => diagnosticCenters.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  results: jsonb("results").notNull().$type<{
    parameter: string;
    value: string;
    unit?: string;
    referenceRange: string;
    interpretation?: string;
    status: 'normal' | 'abnormal' | 'borderline';
  }[]>(),
  overallStatus: varchar("overall_status", { enum: ['normal', 'abnormal', 'review_needed'] }),
  overallInterpretation: text("overall_interpretation"),
  labNotes: text("lab_notes"),
  attachments: jsonb("attachments"),
  viewed: boolean("viewed").notNull().default(false),
  viewedAt: timestamp("viewed_at"),
  sponsorNotified: boolean("sponsor_notified").notNull().default(false),
  sponsorNotifiedAt: timestamp("sponsor_notified_at"),
  testedAt: timestamp("tested_at").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  verifiedBy: varchar("verified_by"),
  verifiedAt: timestamp("verified_at"),
});

export const consentShares = pgTable("consent_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shareCode: varchar("share_code").unique().notNull(),
  testResultId: varchar("test_result_id").notNull().references(() => testResults.id),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  sharedWith: varchar("shared_with"),
  sharedWithType: varchar("shared_with_type", { enum: ['user', 'email', 'phone'] }).notNull(),
  sharedWithUserId: varchar("shared_with_user_id").references(() => users.id),
  accessLevel: varchar("access_level", { enum: ['summary', 'full'] }).notNull().default('full'),
  message: text("message"),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  revokedAt: timestamp("revoked_at"),
  firstAccessedAt: timestamp("first_accessed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  accessCount: integer("access_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// SPONSORS & SPONSORSHIP
// =====================================================

export const sponsorProfiles = pgTable("sponsor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationName: varchar("organization_name"),
  organizationType: varchar("organization_type", { enum: ['employer', 'ngo', 'healthcare', 'insurance', 'other'] }),
  organizationSize: varchar("organization_size"),
  industry: varchar("industry"),
  contactPerson: varchar("contact_person"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  isVerified: boolean("is_verified").default(false),
  verificationDocuments: jsonb("verification_documents"),
  totalSponsoredAmount: decimal("total_sponsored_amount", { precision: 12, scale: 2 }).default('0.00'),
  totalSponsoredTests: integer("total_sponsored_tests").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sponsorTestRequests = pgTable("sponsor_test_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  patientName: text("patient_name").notNull(),
  sponsorUserId: varchar("sponsor_user_id").references(() => users.id),
  sponsorEmail: varchar("sponsor_email"),
  sponsorPhone: varchar("sponsor_phone"),
  sponsorName: varchar("sponsor_name"),
  centerId: varchar("center_id").notNull().references(() => diagnosticCenters.id),
  isMultiTest: boolean("is_multi_test").default(false),
  testPackageId: varchar("test_package_id").references(() => testStandards.id),
  testPrice: decimal("test_price", { precision: 12, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  status: varchar("status", { enum: ['pending', 'viewed', 'accepted', 'declined', 'expired', 'completed'] }).notNull().default('pending'),
  notificationSentAt: timestamp("notification_sent_at"),
  reminderSentAt: timestamp("reminder_sent_at"),
  expiresAt: timestamp("expires_at").notNull(),
  viewedAt: timestamp("viewed_at"),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  paymentId: varchar("payment_id").references(() => payments.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sponsorRequestItems = pgTable("sponsor_request_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorRequestId: varchar("sponsor_request_id").notNull().references(() => sponsorTestRequests.id),
  testStandardId: varchar("test_standard_id").notNull().references(() => testStandards.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sponsoredCodes = pgTable("sponsored_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").notNull().references(() => users.id),
  assessmentCodeId: varchar("assessment_code_id").notNull().references(() => assessmentCodes.id),
  sponsorRequestId: varchar("sponsor_request_id").references(() => sponsorTestRequests.id),
  recipientName: text("recipient_name").notNull(),
  recipientEmail: varchar("recipient_email"),
  recipientPhone: varchar("recipient_phone"),
  testType: text("test_type").notNull(),
  status: varchar("status", { enum: ['pending', 'sent', 'used', 'expired'] }).notNull(),
  sentAt: timestamp("sent_at").notNull(),
  codeUsedAt: timestamp("code_used_at"),
  completedAt: timestamp("completed_at"),
  sharedWithSponsor: boolean("shared_with_sponsor").notNull().default(false),
  shareExpiresAt: timestamp("share_expires_at"),
  overallStatus: varchar("overall_status", { enum: ['normal', 'abnormal', 'review_needed'] }),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// PRIME SUBSCRIPTIONS
// =====================================================

export const primePlans = pgTable("prime_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").unique(),
  description: text("description"),
  durationDays: integer("duration_days").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  features: jsonb("features"),
  discountPercent: decimal("discount_percent", { precision: 5, scale: 2 }).default('0.00'),
  isPopular: boolean("is_popular").default(false),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const primeSubscriptions = pgTable("prime_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: varchar("plan_id").notNull().references(() => primePlans.id),
  planName: varchar("plan_name").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  status: varchar("status", { enum: ['active', 'expired', 'cancelled'] }).notNull().default('active'),
  startsAt: timestamp("starts_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  autoRenew: boolean("auto_renew").notNull().default(true),
  paymentId: varchar("payment_id").references(() => payments.id),
  renewalPaymentId: varchar("renewal_payment_id").references(() => payments.id),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const primeBenefitsUsage = pgTable("prime_benefits_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => primeSubscriptions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  benefitType: varchar("benefit_type").notNull(),
  benefitValue: varchar("benefit_value"),
  usedAt: timestamp("used_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// WITHDRAWALS
// =====================================================

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestNumber: varchar("request_number").unique().notNull(),
  requesterType: varchar("requester_type", { enum: ['user', 'center'] }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  centerId: varchar("center_id").references(() => diagnosticCenters.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  bankAccountId: varchar("bank_account_id").references(() => centerBankAccounts.id),
  bankName: varchar("bank_name").notNull(),
  accountNumber: varchar("account_number").notNull(),
  accountName: varchar("account_name").notNull(),
  status: varchar("status", { enum: ['pending', 'processing', 'completed', 'rejected'] }).notNull().default('pending'),
  rejectionReason: text("rejection_reason"),
  transferReference: varchar("transfer_reference"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
});

// =====================================================
// ADMIN & PLATFORM
// =====================================================

// Admin Invite Codes - controls who can sign up as admin
export const adminInviteCodes = pgTable("admin_invite_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  email: varchar("email").notNull(),
  role: varchar("role", { enum: ['admin', 'super_admin', 'support'] }).notNull().default('admin'),
  // Access level determines what actions the admin can perform
  accessLevel: varchar("access_level", { enum: ['super_admin', 'editor', 'read_only'] }).notNull().default('read_only'),
  permissions: jsonb("permissions").$type<string[]>(),
  invitedBy: varchar("invited_by").references(() => users.id),
  status: varchar("status", { enum: ['pending', 'used', 'expired', 'revoked'] }).notNull().default('pending'),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  usedBy: varchar("used_by").references(() => users.id),
  maxUses: integer("max_uses").default(1),
  useCount: integer("use_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin OTP Codes - mandatory OTP for admin login
export const adminOtpCodes = pgTable("admin_otp_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  code: varchar("code").notNull(),
  deliveryMethod: varchar("delivery_method", { enum: ['email', 'sms'] }).notNull().default('email'),
  deliveryAddress: varchar("delivery_address").notNull(),
  purpose: varchar("purpose", { enum: ['login', 'sensitive_action'] }).notNull().default('login'),
  status: varchar("status", { enum: ['pending', 'verified', 'expired', 'invalidated'] }).notNull().default('pending'),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminRevenue = pgTable("admin_revenue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { enum: ['platform_fee', 'subscription', 'commission', 'other'] }).notNull(),
  sourceType: varchar("source_type"),
  sourceId: varchar("source_id"),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default('NGN'),
  reference: varchar("reference"),
  status: varchar("status", { enum: ['pending', 'completed', 'refunded'] }).notNull().default('completed'),
  metadata: jsonb("metadata"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const platformSettings = pgTable("platform_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").notNull().unique(),
  value: jsonb("value").notNull(),
  valueType: varchar("value_type"),
  category: varchar("category"),
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  updatedBy: varchar("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const platformCommissions = pgTable("platform_commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type", { enum: ['percentage', 'fixed'] }).notNull(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  minAmount: decimal("min_amount", { precision: 12, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 12, scale: 2 }),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =====================================================
// NOTIFICATIONS
// =====================================================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientType: varchar("recipient_type", { enum: ['user', 'center', 'sponsor', 'admin'] }).notNull(),
  userId: varchar("user_id").references(() => users.id),
  centerId: varchar("center_id").references(() => diagnosticCenters.id),
  type: varchar("type").notNull(),
  category: varchar("category"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  read: boolean("read").notNull().default(false),
  readAt: timestamp("read_at"),
  actionUrl: varchar("action_url"),
  actionType: varchar("action_type"),
  priority: varchar("priority", { enum: ['low', 'normal', 'high', 'urgent'] }).default('normal'),
  channel: varchar("channel", { enum: ['in_app', 'email', 'sms', 'push'] }).default('in_app'),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  smsSent: boolean("sms_sent").default(false),
  smsSentAt: timestamp("sms_sent_at"),
  pushSent: boolean("push_sent").default(false),
  pushSentAt: timestamp("push_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  notificationType: varchar("notification_type").notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =====================================================
// AUDIT & LOGGING
// =====================================================

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  action: varchar("action").notNull(),
  entityType: varchar("entity_type"),
  entityId: varchar("entity_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  location: varchar("location"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemLogs = pgTable("system_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  level: varchar("level", { enum: ['debug', 'info', 'warn', 'error', 'fatal'] }).notNull(),
  message: text("message").notNull(),
  context: jsonb("context"),
  stackTrace: text("stack_trace"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// COMMUNICATION
// =====================================================

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  template: varchar("template").notNull(),
  toEmail: varchar("to_email").notNull(),
  subject: varchar("subject").notNull(),
  body: text("body"),
  status: varchar("status", { enum: ['pending', 'sent', 'failed', 'bounced'] }).notNull().default('pending'),
  provider: varchar("provider"),
  providerId: varchar("provider_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smsLogs = pgTable("sms_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  toPhone: varchar("to_phone").notNull(),
  message: text("message").notNull(),
  status: varchar("status", { enum: ['pending', 'sent', 'delivered', 'failed'] }).notNull().default('pending'),
  provider: varchar("provider"),
  providerId: varchar("provider_id"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// SUPPORT & FEEDBACK
// =====================================================

export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number").unique().notNull(),
  userId: varchar("user_id").references(() => users.id),
  centerId: varchar("center_id").references(() => diagnosticCenters.id),
  category: varchar("category").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { enum: ['low', 'normal', 'high', 'urgent'] }).default('normal'),
  status: varchar("status", { enum: ['open', 'in_progress', 'resolved', 'closed'] }).notNull().default('open'),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").notNull().references(() => supportTickets.id),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: varchar("sender_type", { enum: ['user', 'center', 'admin'] }).notNull(),
  message: text("message").notNull(),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type", { enum: ['bug', 'feature', 'general', 'complaint', 'praise'] }).notNull(),
  category: varchar("category"),
  rating: integer("rating"),
  message: text("message").notNull(),
  pageUrl: varchar("page_url"),
  metadata: jsonb("metadata"),
  status: varchar("status", { enum: ['new', 'reviewed', 'addressed', 'archived'] }).default('new'),
  createdAt: timestamp("created_at").defaultNow(),
});

// =====================================================
// RELATIONS
// =====================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  sponsorProfile: one(sponsorProfiles, { fields: [users.id], references: [sponsorProfiles.userId] }),
  diagnosticCenter: one(diagnosticCenters, { fields: [users.id], references: [diagnosticCenters.userId] }),
  oauthAccounts: many(userOauthAccounts),
  assessmentCodes: many(assessmentCodes),
  testResults: many(testResults),
  consentShares: many(consentShares),
  notifications: many(notifications),
  primeSubscriptions: many(primeSubscriptions),
  payments: many(payments),
  transactions: many(transactions),
  virtualAccounts: many(virtualAccounts),
  mobileMoneyPayments: many(mobileMoneyPayments),
  ussdPayments: many(ussdPayments),
  auditLogs: many(auditLogs),
}));

export const oauthProvidersRelations = relations(oauthProviders, ({ many }) => ({
  userAccounts: many(userOauthAccounts),
}));

export const userOauthAccountsRelations = relations(userOauthAccounts, ({ one }) => ({
  user: one(users, { fields: [userOauthAccounts.userId], references: [users.id] }),
  provider: one(oauthProviders, { fields: [userOauthAccounts.providerId], references: [oauthProviders.id] }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const diagnosticCentersRelations = relations(diagnosticCenters, ({ one, many }) => ({
  user: one(users, { fields: [diagnosticCenters.userId], references: [users.id] }),
  centerWallet: one(centerWallets, { fields: [diagnosticCenters.id], references: [centerWallets.centerId] }),
  homeServiceSettings: one(homeServiceSettings, { fields: [diagnosticCenters.id], references: [homeServiceSettings.centerId] }),
  assessmentCodes: many(assessmentCodes),
  testResults: many(testResults),
  centerRevenue: many(centerRevenue),
  centerBankAccounts: many(centerBankAccounts),
  centerTestPricing: many(centerTestPricing),
  homeServiceBookings: many(homeServiceBookings),
  centerRatings: many(centerRatings),
  notifications: many(notifications),
}));

export const testStandardsRelations = relations(testStandards, ({ many }) => ({
  assessmentCodes: many(assessmentCodes),
  testResults: many(testResults),
  centerTestPricing: many(centerTestPricing),
  homeServicePricing: many(homeServicePricing),
  sponsorRequestItems: many(sponsorRequestItems),
}));

export const assessmentCodesRelations = relations(assessmentCodes, ({ one }) => ({
  testStandard: one(testStandards, { fields: [assessmentCodes.testStandardId], references: [testStandards.id] }),
  patient: one(users, { fields: [assessmentCodes.patientId], references: [users.id] }),
  sponsor: one(users, { fields: [assessmentCodes.sponsorId], references: [users.id] }),
  diagnosticCenter: one(diagnosticCenters, { fields: [assessmentCodes.diagnosticCenterId], references: [diagnosticCenters.id] }),
  testResult: one(testResults, { fields: [assessmentCodes.id], references: [testResults.assessmentCodeId] }),
  payment: one(payments, { fields: [assessmentCodes.paymentId], references: [payments.id] }),
}));

export const testResultsRelations = relations(testResults, ({ one, many }) => ({
  assessmentCode: one(assessmentCodes, { fields: [testResults.assessmentCodeId], references: [assessmentCodes.id] }),
  patient: one(users, { fields: [testResults.patientId], references: [users.id] }),
  diagnosticCenter: one(diagnosticCenters, { fields: [testResults.diagnosticCenterId], references: [diagnosticCenters.id] }),
  testStandard: one(testStandards, { fields: [testResults.testStandardId], references: [testStandards.id] }),
  consentShares: many(consentShares),
  centerRatings: many(centerRatings),
}));

export const consentSharesRelations = relations(consentShares, ({ one }) => ({
  testResult: one(testResults, { fields: [consentShares.testResultId], references: [testResults.id] }),
  patient: one(users, { fields: [consentShares.patientId], references: [users.id] }),
  sharedWithUser: one(users, { fields: [consentShares.sharedWithUserId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  payment: one(payments, { fields: [transactions.paymentId], references: [payments.id] }),
  virtualAccount: one(virtualAccounts, { fields: [transactions.virtualAccountId], references: [virtualAccounts.id] }),
  ussdPayment: one(ussdPayments, { fields: [transactions.ussdPaymentId], references: [ussdPayments.id] }),
  mobileMoneyPayment: one(mobileMoneyPayments, { fields: [transactions.mobileMoneyPaymentId], references: [mobileMoneyPayments.id] }),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const virtualAccountsRelations = relations(virtualAccounts, ({ one, many }) => ({
  user: one(users, { fields: [virtualAccounts.userId], references: [users.id] }),
  transactions: many(transactions),
}));

export const mobileMoneyPaymentsRelations = relations(mobileMoneyPayments, ({ one, many }) => ({
  user: one(users, { fields: [mobileMoneyPayments.userId], references: [users.id] }),
  provider: one(mobileMoneyProviders, { fields: [mobileMoneyPayments.providerId], references: [mobileMoneyProviders.id] }),
  transactions: many(transactions),
}));

export const ussdPaymentsRelations = relations(ussdPayments, ({ one, many }) => ({
  user: one(users, { fields: [ussdPayments.userId], references: [users.id] }),
  bank: one(ussdBanks, { fields: [ussdPayments.bankId], references: [ussdBanks.id] }),
  transactions: many(transactions),
}));

export const sponsorProfilesRelations = relations(sponsorProfiles, ({ one }) => ({
  user: one(users, { fields: [sponsorProfiles.userId], references: [users.id] }),
}));

export const sponsorTestRequestsRelations = relations(sponsorTestRequests, ({ one, many }) => ({
  patient: one(users, { fields: [sponsorTestRequests.patientId], references: [users.id] }),
  sponsor: one(users, { fields: [sponsorTestRequests.sponsorUserId], references: [users.id] }),
  center: one(diagnosticCenters, { fields: [sponsorTestRequests.centerId], references: [diagnosticCenters.id] }),
  testPackage: one(testStandards, { fields: [sponsorTestRequests.testPackageId], references: [testStandards.id] }),
  payment: one(payments, { fields: [sponsorTestRequests.paymentId], references: [payments.id] }),
  items: many(sponsorRequestItems),
}));

export const sponsorRequestItemsRelations = relations(sponsorRequestItems, ({ one }) => ({
  sponsorRequest: one(sponsorTestRequests, { fields: [sponsorRequestItems.sponsorRequestId], references: [sponsorTestRequests.id] }),
  testStandard: one(testStandards, { fields: [sponsorRequestItems.testStandardId], references: [testStandards.id] }),
}));

export const sponsoredCodesRelations = relations(sponsoredCodes, ({ one }) => ({
  sponsor: one(users, { fields: [sponsoredCodes.sponsorId], references: [users.id] }),
  assessmentCode: one(assessmentCodes, { fields: [sponsoredCodes.assessmentCodeId], references: [assessmentCodes.id] }),
  sponsorRequest: one(sponsorTestRequests, { fields: [sponsoredCodes.sponsorRequestId], references: [sponsorTestRequests.id] }),
}));

export const primePlansRelations = relations(primePlans, ({ many }) => ({
  subscriptions: many(primeSubscriptions),
}));

export const primeSubscriptionsRelations = relations(primeSubscriptions, ({ one, many }) => ({
  user: one(users, { fields: [primeSubscriptions.userId], references: [users.id] }),
  plan: one(primePlans, { fields: [primeSubscriptions.planId], references: [primePlans.id] }),
  payment: one(payments, { fields: [primeSubscriptions.paymentId], references: [payments.id] }),
  benefitsUsage: many(primeBenefitsUsage),
}));

export const primeBenefitsUsageRelations = relations(primeBenefitsUsage, ({ one }) => ({
  subscription: one(primeSubscriptions, { fields: [primeBenefitsUsage.subscriptionId], references: [primeSubscriptions.id] }),
  user: one(users, { fields: [primeBenefitsUsage.userId], references: [users.id] }),
}));

export const centerWalletsRelations = relations(centerWallets, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [centerWallets.centerId], references: [diagnosticCenters.id] }),
}));

export const centerBankAccountsRelations = relations(centerBankAccounts, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [centerBankAccounts.centerId], references: [diagnosticCenters.id] }),
  bank: one(banks, { fields: [centerBankAccounts.bankId], references: [banks.id] }),
}));

export const centerRevenueRelations = relations(centerRevenue, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [centerRevenue.centerId], references: [diagnosticCenters.id] }),
}));

export const centerTestPricingRelations = relations(centerTestPricing, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [centerTestPricing.centerId], references: [diagnosticCenters.id] }),
  testStandard: one(testStandards, { fields: [centerTestPricing.testStandardId], references: [testStandards.id] }),
}));

export const centerRatingsRelations = relations(centerRatings, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [centerRatings.centerId], references: [diagnosticCenters.id] }),
  patient: one(users, { fields: [centerRatings.patientId], references: [users.id] }),
  testResult: one(testResults, { fields: [centerRatings.testResultId], references: [testResults.id] }),
  booking: one(homeServiceBookings, { fields: [centerRatings.bookingId], references: [homeServiceBookings.id] }),
}));

export const homeServiceSettingsRelations = relations(homeServiceSettings, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [homeServiceSettings.centerId], references: [diagnosticCenters.id] }),
}));

export const homeServicePricingRelations = relations(homeServicePricing, ({ one }) => ({
  center: one(diagnosticCenters, { fields: [homeServicePricing.centerId], references: [diagnosticCenters.id] }),
  testStandard: one(testStandards, { fields: [homeServicePricing.testStandardId], references: [testStandards.id] }),
}));

export const homeServiceBookingsRelations = relations(homeServiceBookings, ({ one, many }) => ({
  patient: one(users, { fields: [homeServiceBookings.patientId], references: [users.id] }),
  center: one(diagnosticCenters, { fields: [homeServiceBookings.centerId], references: [diagnosticCenters.id] }),
  testStandard: one(testStandards, { fields: [homeServiceBookings.testStandardId], references: [testStandards.id] }),
  assessmentCode: one(assessmentCodes, { fields: [homeServiceBookings.assessmentCodeId], references: [assessmentCodes.id] }),
  payment: one(payments, { fields: [homeServiceBookings.paymentId], references: [payments.id] }),
  result: one(testResults, { fields: [homeServiceBookings.resultId], references: [testResults.id] }),
  ratings: many(centerRatings),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, { fields: [withdrawalRequests.userId], references: [users.id] }),
  center: one(diagnosticCenters, { fields: [withdrawalRequests.centerId], references: [diagnosticCenters.id] }),
  bankAccount: one(centerBankAccounts, { fields: [withdrawalRequests.bankAccountId], references: [centerBankAccounts.id] }),
  processedByUser: one(users, { fields: [withdrawalRequests.processedBy], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  center: one(diagnosticCenters, { fields: [notifications.centerId], references: [diagnosticCenters.id] }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, { fields: [supportTickets.userId], references: [users.id] }),
  center: one(diagnosticCenters, { fields: [supportTickets.centerId], references: [diagnosticCenters.id] }),
  assignedToUser: one(users, { fields: [supportTickets.assignedTo], references: [users.id] }),
  messages: many(supportMessages),
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  ticket: one(supportTickets, { fields: [supportMessages.ticketId], references: [supportTickets.id] }),
  sender: one(users, { fields: [supportMessages.senderId], references: [users.id] }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const adminInviteCodesRelations = relations(adminInviteCodes, ({ one }) => ({
  invitedByUser: one(users, { fields: [adminInviteCodes.invitedBy], references: [users.id] }),
  usedByUser: one(users, { fields: [adminInviteCodes.usedBy], references: [users.id] }),
}));

export const adminOtpCodesRelations = relations(adminOtpCodes, ({ one }) => ({
  adminUser: one(users, { fields: [adminOtpCodes.adminUserId], references: [users.id] }),
}));

// =====================================================
// ZOD SCHEMAS & TYPES
// =====================================================

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const insertVirtualAccountSchema = createInsertSchema(virtualAccounts).omit({ id: true, createdAt: true });
export type InsertVirtualAccount = z.infer<typeof insertVirtualAccountSchema>;
export type VirtualAccount = typeof virtualAccounts.$inferSelect;

export const insertMobileMoneyPaymentSchema = createInsertSchema(mobileMoneyPayments).omit({ id: true, createdAt: true });
export type InsertMobileMoneyPayment = z.infer<typeof insertMobileMoneyPaymentSchema>;
export type MobileMoneyPayment = typeof mobileMoneyPayments.$inferSelect;

export const insertUssdPaymentSchema = createInsertSchema(ussdPayments).omit({ id: true, createdAt: true });
export type InsertUssdPayment = z.infer<typeof insertUssdPaymentSchema>;
export type UssdPayment = typeof ussdPayments.$inferSelect;

export const insertTestStandardSchema = createInsertSchema(testStandards).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTestStandard = z.infer<typeof insertTestStandardSchema>;
export type TestStandard = typeof testStandards.$inferSelect;

export const insertDiagnosticCenterSchema = createInsertSchema(diagnosticCenters).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDiagnosticCenter = z.infer<typeof insertDiagnosticCenterSchema>;
export type DiagnosticCenter = typeof diagnosticCenters.$inferSelect;

export const insertCenterApplicationSchema = createInsertSchema(centerApplications).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCenterApplication = z.infer<typeof insertCenterApplicationSchema>;
export type CenterApplication = typeof centerApplications.$inferSelect;

export const insertCenterWalletSchema = createInsertSchema(centerWallets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCenterWallet = z.infer<typeof insertCenterWalletSchema>;
export type CenterWallet = typeof centerWallets.$inferSelect;

export const insertCenterRevenueSchema = createInsertSchema(centerRevenue).omit({ id: true, createdAt: true });
export type InsertCenterRevenue = z.infer<typeof insertCenterRevenueSchema>;
export type CenterRevenue = typeof centerRevenue.$inferSelect;

export const insertAssessmentCodeSchema = createInsertSchema(assessmentCodes).omit({ id: true, createdAt: true });
export type InsertAssessmentCode = z.infer<typeof insertAssessmentCodeSchema>;
export type AssessmentCode = typeof assessmentCodes.$inferSelect;

export const insertTestResultSchema = createInsertSchema(testResults).omit({ id: true, uploadedAt: true });
export type InsertTestResult = z.infer<typeof insertTestResultSchema>;
export type TestResult = typeof testResults.$inferSelect;

export const insertConsentShareSchema = createInsertSchema(consentShares).omit({ id: true, createdAt: true });
export type InsertConsentShare = z.infer<typeof insertConsentShareSchema>;
export type ConsentShare = typeof consentShares.$inferSelect;

export const insertSponsorProfileSchema = createInsertSchema(sponsorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSponsorProfile = z.infer<typeof insertSponsorProfileSchema>;
export type SponsorProfile = typeof sponsorProfiles.$inferSelect;

export const insertSponsorTestRequestSchema = createInsertSchema(sponsorTestRequests).omit({ id: true, createdAt: true });
export type InsertSponsorTestRequest = z.infer<typeof insertSponsorTestRequestSchema>;
export type SponsorTestRequest = typeof sponsorTestRequests.$inferSelect;

export const insertSponsorRequestItemSchema = createInsertSchema(sponsorRequestItems).omit({ id: true, createdAt: true });
export type InsertSponsorRequestItem = z.infer<typeof insertSponsorRequestItemSchema>;
export type SponsorRequestItem = typeof sponsorRequestItems.$inferSelect;

export const insertSponsoredCodeSchema = createInsertSchema(sponsoredCodes).omit({ id: true, createdAt: true });
export type InsertSponsoredCode = z.infer<typeof insertSponsoredCodeSchema>;
export type SponsoredCode = typeof sponsoredCodes.$inferSelect;

export const insertPrimePlanSchema = createInsertSchema(primePlans).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrimePlan = z.infer<typeof insertPrimePlanSchema>;
export type PrimePlan = typeof primePlans.$inferSelect;

export const insertPrimeSubscriptionSchema = createInsertSchema(primeSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrimeSubscription = z.infer<typeof insertPrimeSubscriptionSchema>;
export type PrimeSubscription = typeof primeSubscriptions.$inferSelect;

export const insertHomeServiceBookingSchema = createInsertSchema(homeServiceBookings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHomeServiceBooking = z.infer<typeof insertHomeServiceBookingSchema>;
export type HomeServiceBooking = typeof homeServiceBookings.$inferSelect;

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).omit({ id: true, createdAt: true });
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type MobileMoneyProvider = typeof mobileMoneyProviders.$inferSelect;
export type UssdBank = typeof ussdBanks.$inferSelect;
export type Bank = typeof banks.$inferSelect;
export type WellnessAddon = typeof wellnessAddons.$inferSelect;
export type CenterTestPricing = typeof centerTestPricing.$inferSelect;
export type CenterBankAccount = typeof centerBankAccounts.$inferSelect;
export type CenterRating = typeof centerRatings.$inferSelect;
export type HomeServiceSettings = typeof homeServiceSettings.$inferSelect;
export type HomeServicePricing = typeof homeServicePricing.$inferSelect;
export type AdminRevenue = typeof adminRevenue.$inferSelect;
export type PlatformSetting = typeof platformSettings.$inferSelect;
export type PlatformCommission = typeof platformCommissions.$inferSelect;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type PrimeBenefitsUsage = typeof primeBenefitsUsage.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SystemLog = typeof systemLogs.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;
export type SmsLog = typeof smsLogs.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type UserDevice = typeof userDevices.$inferSelect;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type OauthProvider = typeof oauthProviders.$inferSelect;
export type UserOauthAccount = typeof userOauthAccounts.$inferSelect;
export type AdminInviteCode = typeof adminInviteCodes.$inferSelect;
export type AdminOtpCode = typeof adminOtpCodes.$inferSelect;
