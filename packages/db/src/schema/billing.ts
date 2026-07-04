import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { subscriptionStatusEnum, subscriptionPlanEnum } from "./enums";

/* ═══════════════════════════════════════════
   SUBSCRIPTIONS
   Razorpay scaffold — not activated in V1.
   ═══════════════════════════════════════════ */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    plan: subscriptionPlanEnum("plan").default("free").notNull(),
    status: subscriptionStatusEnum("status").default("trialing").notNull(),
    razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
    razorpayCustomerId: varchar("razorpay_customer_id", { length: 255 }),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdx: index("idx_subscriptions_user").on(table.userId),
    statusIdx: index("idx_subscriptions_status").on(table.status),
    razorpayIdx: index("idx_subscriptions_razorpay").on(table.razorpaySubscriptionId),
  }),
);
