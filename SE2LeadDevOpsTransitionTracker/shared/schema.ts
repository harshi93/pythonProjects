import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  date,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Simplified user table for demo purposes
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Phases of the 90-day plan
export const phases = pgTable("phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  startDay: integer("start_day").notNull(),
  endDay: integer("end_day").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks and goals
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  phaseId: varchar("phase_id").references(() => phases.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // high, medium, low
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members for assessment
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }),
  email: varchar("email", { length: 255 }),
  strengths: text("strengths"),
  improvementAreas: text("improvement_areas"),
  careerGoals: text("career_goals"),
  lastOneOnOneDate: date("last_one_on_one_date"),
  nextOneOnOneDate: date("next_one_on_one_date"),
  satisfactionScore: decimal("satisfaction_score", { precision: 2, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning resources and progress
export const learningResources = pgTable("learning_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // book, course, podcast, workshop
  url: text("url"),
  status: varchar("status", { length: 20 }).notNull().default("not_started"), // not_started, in_progress, completed
  progress: integer("progress").default(0), // percentage
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KPI metrics tracking
export const kpiMetrics = pgTable("kpi_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  metricType: varchar("metric_type", { length: 100 }).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  target: decimal("target", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 20 }),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly self-assessments
export const weeklyAssessments = pgTable("weekly_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStartDate: date("week_start_date").notNull(),
  leadershipSkillsPractice: text("leadership_skills_practice"),
  teamSupportEfforts: text("team_support_efforts"),
  strategicInitiatives: text("strategic_initiatives"),
  stakeholderCommunication: text("stakeholder_communication"),
  improvementAreas: text("improvement_areas"),
  overallRating: integer("overall_rating"), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Risk tracking
export const risks = pgTable("risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  probability: varchar("probability", { length: 20 }), // low, medium, high
  impact: varchar("impact", { length: 20 }), // low, medium, high
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, mitigated, resolved
  mitigationPlan: text("mitigation_plan"),
  contingencyPlan: text("contingency_plan"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity log for tracking actions
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // task_completed, learning_progress, assessment, etc.
  description: text("description").notNull(),
  entityId: varchar("entity_id"), // ID of related entity (task, learning resource, etc.)
  entityType: varchar("entity_type", { length: 50 }), // task, learning_resource, team_member, etc.
  metadata: jsonb("metadata"), // Additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Follow-up tracker
export const followUps = pgTable("follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  assignee: varchar("assignee", { length: 100 }).notNull(),
  dueDate: date("due_date").notNull(),
  requester: varchar("requester", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, awaiting_response, completed
  lastCheckIn: date("last_check_in"),
  person: varchar("person", { length: 100 }),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("follow_ups_user_id_idx").on(table.userId),
  dueDateIdx: index("follow_ups_due_date_idx").on(table.dueDate),
  statusIdx: index("follow_ups_status_idx").on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  teamMembers: many(teamMembers),
  learningResources: many(learningResources),
  kpiMetrics: many(kpiMetrics),
  weeklyAssessments: many(weeklyAssessments),
  risks: many(risks),
  activities: many(activities),
  followUps: many(followUps),
  checklists: many(checklists),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  phase: one(phases, {
    fields: [tasks.phaseId],
    references: [phases.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

export const learningResourcesRelations = relations(learningResources, ({ one }) => ({
  user: one(users, {
    fields: [learningResources.userId],
    references: [users.id],
  }),
}));

export const kpiMetricsRelations = relations(kpiMetrics, ({ one }) => ({
  user: one(users, {
    fields: [kpiMetrics.userId],
    references: [users.id],
  }),
}));

export const weeklyAssessmentsRelations = relations(weeklyAssessments, ({ one }) => ({
  user: one(users, {
    fields: [weeklyAssessments.userId],
    references: [users.id],
  }),
}));

export const risksRelations = relations(risks, ({ one }) => ({
  user: one(users, {
    fields: [risks.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  user: one(users, {
    fields: [followUps.userId],
    references: [users.id],
  }),
}));

// Checklist tables
export const checklists = pgTable("checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("checklists_user_id_idx").on(table.userId),
}));

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checklistId: varchar("checklist_id").notNull().references(() => checklists.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  completed: boolean("completed").default(false).notNull(),
  priority: varchar("priority", { length: 10 }).$type<"low" | "medium" | "high">().default("medium"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  checklistIdIdx: index("checklist_items_checklist_id_idx").on(table.checklistId),
  orderIdx: index("checklist_items_order_idx").on(table.order),
}));

export const checklistsRelations = relations(checklists, ({ one, many }) => ({
  user: one(users, {
    fields: [checklists.userId],
    references: [users.id],
  }),
  items: many(checklistItems),
}));

export const checklistItemsRelations = relations(checklistItems, ({ one }) => ({
  checklist: one(checklists, {
    fields: [checklistItems.checklistId],
    references: [checklists.id],
  }),
}));

export const phasesRelations = relations(phases, ({ many }) => ({
  tasks: many(tasks),
}));

// Insert schemas
export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertWeeklyAssessmentSchema = createInsertSchema(weeklyAssessments).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskSchema = createInsertSchema(risks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertFollowUpSchema = createInsertSchema(followUps).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;
export type KpiMetric = typeof kpiMetrics.$inferSelect;
export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type WeeklyAssessment = typeof weeklyAssessments.$inferSelect;
export type InsertWeeklyAssessment = z.infer<typeof insertWeeklyAssessmentSchema>;
export type Risk = typeof risks.$inferSelect;
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type FollowUp = typeof followUps.$inferSelect;
export type InsertFollowUp = z.infer<typeof insertFollowUpSchema>;
export type Phase = typeof phases.$inferSelect;

export const insertChecklistSchema = createInsertSchema(checklists).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  checklistId: true,
  createdAt: true,
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
