import {
  users,
  tasks,
  teamMembers,
  learningResources,
  kpiMetrics,
  weeklyAssessments,
  risks,
  activities,
  phases,
  followUps,
  checklists,
  checklistItems,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type TeamMember,
  type InsertTeamMember,
  type LearningResource,
  type InsertLearningResource,
  type KpiMetric,
  type InsertKpiMetric,
  type WeeklyAssessment,
  type InsertWeeklyAssessment,
  type Risk,
  type InsertRisk,
  type Activity,
  type InsertActivity,
  type Phase,
  type FollowUp,
  type InsertFollowUp,
  type Checklist,
  type InsertChecklist,
  type ChecklistItem,
  type InsertChecklistItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;
  
  // Phase operations
  getPhases(): Promise<Phase[]>;
  
  // Task operations
  getUserTasks(userId: string): Promise<Task[]>;
  getTasksByPhase(userId: string, phaseId: string): Promise<Task[]>;
  getTaskById(userId: string, taskId: string): Promise<Task | undefined>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(userId: string, taskId: string, updates: Partial<InsertTask>): Promise<Task>;
  deleteTask(userId: string, taskId: string): Promise<void>;
  getUpcomingTasks(userId: string, limit?: number): Promise<Task[]>;
  
  // Team member operations
  getUserTeamMembers(userId: string): Promise<TeamMember[]>;
  getTeamMemberById(userId: string, memberId: string): Promise<TeamMember | undefined>;
  createTeamMember(userId: string, member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(userId: string, memberId: string, updates: Partial<InsertTeamMember>): Promise<TeamMember>;
  deleteTeamMember(userId: string, memberId: string): Promise<void>;
  
  // Learning resource operations
  getUserLearningResources(userId: string): Promise<LearningResource[]>;
  getLearningResourceById(userId: string, resourceId: string): Promise<LearningResource | undefined>;
  createLearningResource(userId: string, resource: InsertLearningResource): Promise<LearningResource>;
  updateLearningResource(userId: string, resourceId: string, updates: Partial<InsertLearningResource>): Promise<LearningResource>;
  deleteLearningResource(userId: string, resourceId: string): Promise<void>;
  
  // KPI metrics operations
  getUserKpiMetrics(userId: string): Promise<KpiMetric[]>;
  getKpiMetricsByType(userId: string, metricType: string): Promise<KpiMetric[]>;
  createKpiMetric(userId: string, metric: InsertKpiMetric): Promise<KpiMetric>;
  
  // Weekly assessment operations
  getUserWeeklyAssessments(userId: string): Promise<WeeklyAssessment[]>;
  getWeeklyAssessmentById(userId: string, assessmentId: string): Promise<WeeklyAssessment | undefined>;
  createWeeklyAssessment(userId: string, assessment: InsertWeeklyAssessment): Promise<WeeklyAssessment>;
  updateWeeklyAssessment(userId: string, assessmentId: string, updates: Partial<InsertWeeklyAssessment>): Promise<WeeklyAssessment>;
  
  // Risk operations
  getUserRisks(userId: string): Promise<Risk[]>;
  getRiskById(userId: string, riskId: string): Promise<Risk | undefined>;
  createRisk(userId: string, risk: InsertRisk): Promise<Risk>;
  updateRisk(userId: string, riskId: string, updates: Partial<InsertRisk>): Promise<Risk>;
  deleteRisk(userId: string, riskId: string): Promise<void>;
  
  // Activity operations
  getUserActivities(userId: string, limit?: number): Promise<Activity[]>;
  createActivity(userId: string, activity: InsertActivity): Promise<Activity>;
  
  // Follow-up operations
  getUserFollowUps(userId: string): Promise<FollowUp[]>;
  getFollowUpById(userId: string, followUpId: string): Promise<FollowUp | undefined>;
  createFollowUp(userId: string, followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(userId: string, followUpId: string, updates: Partial<InsertFollowUp>): Promise<FollowUp>;
  deleteFollowUp(userId: string, followUpId: string): Promise<void>;
  
  // Checklist operations
  getUserChecklists(userId: string): Promise<Checklist[]>;
  getChecklistById(userId: string, checklistId: string): Promise<Checklist | undefined>;
  createChecklist(userId: string, checklist: InsertChecklist): Promise<Checklist>;
  updateChecklist(userId: string, checklistId: string, updates: Partial<InsertChecklist>): Promise<Checklist>;
  deleteChecklist(userId: string, checklistId: string): Promise<void>;
  
  // Checklist item operations
  getChecklistItems(checklistId: string): Promise<ChecklistItem[]>;
  createChecklistItem(checklistId: string, item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(itemId: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem>;
  deleteChecklistItem(itemId: string): Promise<void>;
  reorderChecklistItems(checklistId: string, itemOrders: Array<{id: string, order: number}>): Promise<void>;
  
  // Progress tracking
  updateUserProgress(userId: string, currentDay: number): Promise<void>;
  getUserProgress(userId: string): Promise<number>;
  
  // Dashboard statistics
  getUserDashboardStats(userId: string): Promise<{
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    currentPhase: Phase | null;
    teamSatisfactionAvg: number;
    learningProgress: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: userData,
      })
      .returning();
    return user;
  }

  // Phase operations
  async getPhases(): Promise<Phase[]> {
    return await db.select().from(phases).orderBy(phases.orderIndex);
  }

  // Task operations
  async getUserTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByPhase(userId: string, phaseId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.phaseId, phaseId)))
      .orderBy(desc(tasks.createdAt));
  }

  async getTaskById(userId: string, taskId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)));
    return task;
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    
    // Create activity log
    await this.createActivity(userId, {
      type: "task_created",
      description: `Created task: ${newTask.title}`,
      entityId: newTask.id,
      entityType: "task",
    });
    
    return newTask;
  }

  async updateTask(userId: string, taskId: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)))
      .returning();
    
    // Create activity log for completion
    if (updates.status === "completed" && updates.completedAt) {
      await this.createActivity(userId, {
        type: "task_completed",
        description: `Completed task: ${updatedTask.title}`,
        entityId: updatedTask.id,
        entityType: "task",
      });
    }
    
    return updatedTask;
  }

  async deleteTask(userId: string, taskId: string): Promise<void> {
    await db
      .delete(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.id, taskId)));
  }

  async getUpcomingTasks(userId: string, limit: number = 10): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        eq(tasks.status, "pending")
      ))
      .orderBy(tasks.dueDate, tasks.priority)
      .limit(limit);
  }

  // Team member operations
  async getUserTeamMembers(userId: string): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId))
      .orderBy(teamMembers.name);
  }

  async getTeamMemberById(userId: string, memberId: string): Promise<TeamMember | undefined> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.userId, userId), eq(teamMembers.id, memberId)));
    return member;
  }

  async createTeamMember(userId: string, member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values({ ...member, userId })
      .returning();
    
    await this.createActivity(userId, {
      type: "team_member_added",
      description: `Added team member: ${newMember.name}`,
      entityId: newMember.id,
      entityType: "team_member",
    });
    
    return newMember;
  }

  async updateTeamMember(userId: string, memberId: string, updates: Partial<InsertTeamMember>): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(teamMembers.userId, userId), eq(teamMembers.id, memberId)))
      .returning();
    return updatedMember;
  }

  async deleteTeamMember(userId: string, memberId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.userId, userId), eq(teamMembers.id, memberId)));
  }

  // Learning resource operations
  async getUserLearningResources(userId: string): Promise<LearningResource[]> {
    return await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.userId, userId))
      .orderBy(desc(learningResources.createdAt));
  }

  async getLearningResourceById(userId: string, resourceId: string): Promise<LearningResource | undefined> {
    const [resource] = await db
      .select()
      .from(learningResources)
      .where(and(eq(learningResources.userId, userId), eq(learningResources.id, resourceId)));
    return resource;
  }

  async createLearningResource(userId: string, resource: InsertLearningResource): Promise<LearningResource> {
    const [newResource] = await db
      .insert(learningResources)
      .values({ ...resource, userId })
      .returning();
    
    await this.createActivity(userId, {
      type: "learning_resource_added",
      description: `Added learning resource: ${newResource.title}`,
      entityId: newResource.id,
      entityType: "learning_resource",
    });
    
    return newResource;
  }

  async updateLearningResource(userId: string, resourceId: string, updates: Partial<InsertLearningResource>): Promise<LearningResource> {
    const [updatedResource] = await db
      .update(learningResources)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(learningResources.userId, userId), eq(learningResources.id, resourceId)))
      .returning();
    
    // Log completion
    if (updates.status === "completed" && updates.completedAt) {
      await this.createActivity(userId, {
        type: "learning_completed",
        description: `Completed learning resource: ${updatedResource.title}`,
        entityId: updatedResource.id,
        entityType: "learning_resource",
      });
    }
    
    return updatedResource;
  }

  async deleteLearningResource(userId: string, resourceId: string): Promise<void> {
    await db
      .delete(learningResources)
      .where(and(eq(learningResources.userId, userId), eq(learningResources.id, resourceId)));
  }

  // KPI metrics operations
  async getUserKpiMetrics(userId: string): Promise<KpiMetric[]> {
    return await db
      .select()
      .from(kpiMetrics)
      .where(eq(kpiMetrics.userId, userId))
      .orderBy(desc(kpiMetrics.recordedAt));
  }

  async getKpiMetricsByType(userId: string, metricType: string): Promise<KpiMetric[]> {
    return await db
      .select()
      .from(kpiMetrics)
      .where(and(eq(kpiMetrics.userId, userId), eq(kpiMetrics.metricType, metricType)))
      .orderBy(desc(kpiMetrics.recordedAt));
  }

  async createKpiMetric(userId: string, metric: InsertKpiMetric): Promise<KpiMetric> {
    const [newMetric] = await db
      .insert(kpiMetrics)
      .values({ ...metric, userId })
      .returning();
    
    await this.createActivity(userId, {
      type: "metric_recorded",
      description: `Recorded KPI metric: ${newMetric.metricType}`,
      entityId: newMetric.id,
      entityType: "kpi_metric",
    });
    
    return newMetric;
  }

  // Weekly assessment operations
  async getUserWeeklyAssessments(userId: string): Promise<WeeklyAssessment[]> {
    return await db
      .select()
      .from(weeklyAssessments)
      .where(eq(weeklyAssessments.userId, userId))
      .orderBy(desc(weeklyAssessments.weekStartDate));
  }

  async getWeeklyAssessmentById(userId: string, assessmentId: string): Promise<WeeklyAssessment | undefined> {
    const [assessment] = await db
      .select()
      .from(weeklyAssessments)
      .where(and(eq(weeklyAssessments.userId, userId), eq(weeklyAssessments.id, assessmentId)));
    return assessment;
  }

  async createWeeklyAssessment(userId: string, assessment: InsertWeeklyAssessment): Promise<WeeklyAssessment> {
    const [newAssessment] = await db
      .insert(weeklyAssessments)
      .values({ ...assessment, userId })
      .returning();
    
    await this.createActivity(userId, {
      type: "weekly_assessment",
      description: `Completed weekly self-assessment`,
      entityId: newAssessment.id,
      entityType: "weekly_assessment",
    });
    
    return newAssessment;
  }

  async updateWeeklyAssessment(userId: string, assessmentId: string, updates: Partial<InsertWeeklyAssessment>): Promise<WeeklyAssessment> {
    const [updatedAssessment] = await db
      .update(weeklyAssessments)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(weeklyAssessments.userId, userId), eq(weeklyAssessments.id, assessmentId)))
      .returning();
    return updatedAssessment;
  }

  // Risk operations
  async getUserRisks(userId: string): Promise<Risk[]> {
    return await db
      .select()
      .from(risks)
      .where(eq(risks.userId, userId))
      .orderBy(desc(risks.createdAt));
  }

  async getRiskById(userId: string, riskId: string): Promise<Risk | undefined> {
    const [risk] = await db
      .select()
      .from(risks)
      .where(and(eq(risks.userId, userId), eq(risks.id, riskId)));
    return risk;
  }

  async createRisk(userId: string, risk: InsertRisk): Promise<Risk> {
    const [newRisk] = await db
      .insert(risks)
      .values({ ...risk, userId })
      .returning();
    
    await this.createActivity(userId, {
      type: "risk_identified",
      description: `Identified risk: ${newRisk.title}`,
      entityId: newRisk.id,
      entityType: "risk",
    });
    
    return newRisk;
  }

  async updateRisk(userId: string, riskId: string, updates: Partial<InsertRisk>): Promise<Risk> {
    const [updatedRisk] = await db
      .update(risks)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(risks.userId, userId), eq(risks.id, riskId)))
      .returning();
    return updatedRisk;
  }

  async deleteRisk(userId: string, riskId: string): Promise<void> {
    await db
      .delete(risks)
      .where(and(eq(risks.userId, userId), eq(risks.id, riskId)));
  }

  // Activity operations
  async getUserActivities(userId: string, limit: number = 20): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(userId: string, activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values({ ...activity, userId })
      .returning();
    return newActivity;
  }

  // Progress tracking operations
  async updateUserProgress(userId: string, currentDay: number): Promise<void> {
    // Store progress in an activity for tracking
    await this.createActivity(userId, {
      type: "progress_updated",
      description: `Progress updated to day ${currentDay} (${Math.round((currentDay / 90) * 100)}%)`,
      entityId: null,
      entityType: "progress",
    });
  }

  async getUserProgress(userId: string): Promise<number> {
    return await this.getUserCurrentDay(userId);
  }

  async getUserCurrentDay(userId: string): Promise<number> {
    // Calculate from recent activities
    const recentProgressActivity = await db
      .select()
      .from(activities)
      .where(and(eq(activities.userId, userId), eq(activities.type, "progress_updated")))
      .orderBy(desc(activities.createdAt))
      .limit(1);
      
    if (recentProgressActivity.length > 0) {
      // Extract day from description (simple parsing)
      const description = recentProgressActivity[0].description;
      const dayMatch = description.match(/day (\d+)/);
      return dayMatch ? parseInt(dayMatch[1]) : 0;
    }
    
    return 0;
  }

  // Follow-up operations
  async getUserFollowUps(userId: string): Promise<FollowUp[]> {
    return await db
      .select()
      .from(followUps)
      .where(eq(followUps.userId, userId))
      .orderBy(desc(followUps.dueDate));
  }

  async getFollowUpById(userId: string, followUpId: string): Promise<FollowUp | undefined> {
    const [followUp] = await db
      .select()
      .from(followUps)
      .where(and(eq(followUps.userId, userId), eq(followUps.id, followUpId)));
    return followUp;
  }

  async createFollowUp(userId: string, followUp: InsertFollowUp): Promise<FollowUp> {
    const [newFollowUp] = await db
      .insert(followUps)
      .values({ ...followUp, userId })
      .returning();
    
    // Create activity log
    await this.createActivity(userId, {
      type: "follow_up_created",
      description: `Created follow-up: ${newFollowUp.title}`,
      entityId: newFollowUp.id,
      entityType: "follow_up",
    });
    
    return newFollowUp;
  }

  async updateFollowUp(userId: string, followUpId: string, updates: Partial<InsertFollowUp>): Promise<FollowUp> {
    const [updatedFollowUp] = await db
      .update(followUps)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(followUps.userId, userId), eq(followUps.id, followUpId)))
      .returning();
    
    // Create activity log for status changes
    if (updates.status === "completed") {
      await this.createActivity(userId, {
        type: "follow_up_completed",
        description: `Completed follow-up: ${updatedFollowUp.title}`,
        entityId: updatedFollowUp.id,
        entityType: "follow_up",
      });
    }
    
    return updatedFollowUp;
  }

  async deleteFollowUp(userId: string, followUpId: string): Promise<void> {
    await db
      .delete(followUps)
      .where(and(eq(followUps.userId, userId), eq(followUps.id, followUpId)));
  }

  // Checklist operations
  async getUserChecklists(userId: string): Promise<Checklist[]> {
    return await db
      .select()
      .from(checklists)
      .where(eq(checklists.userId, userId))
      .orderBy(desc(checklists.updatedAt));
  }

  async getChecklistById(userId: string, checklistId: string): Promise<Checklist | undefined> {
    const [checklist] = await db
      .select()
      .from(checklists)
      .where(and(eq(checklists.userId, userId), eq(checklists.id, checklistId)));
    return checklist;
  }

  async createChecklist(userId: string, checklist: InsertChecklist): Promise<Checklist> {
    const [newChecklist] = await db
      .insert(checklists)
      .values({ ...checklist, userId })
      .returning();
    
    // Create activity log
    await this.createActivity(userId, {
      type: "checklist_created",
      description: `Created checklist: ${newChecklist.name}`,
      entityId: newChecklist.id,
      entityType: "checklist",
    });
    
    return newChecklist;
  }

  async updateChecklist(userId: string, checklistId: string, updates: Partial<InsertChecklist>): Promise<Checklist> {
    const [updatedChecklist] = await db
      .update(checklists)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(checklists.userId, userId), eq(checklists.id, checklistId)))
      .returning();
    
    return updatedChecklist;
  }

  async deleteChecklist(userId: string, checklistId: string): Promise<void> {
    await db
      .delete(checklists)
      .where(and(eq(checklists.userId, userId), eq(checklists.id, checklistId)));
  }

  // Checklist item operations
  async getChecklistItems(checklistId: string): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.checklistId, checklistId))
      .orderBy(checklistItems.order, checklistItems.createdAt);
  }

  async createChecklistItem(checklistId: string, item: InsertChecklistItem): Promise<ChecklistItem> {
    // Get the next order value
    const maxOrderResult = await db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${checklistItems.order}), -1)` })
      .from(checklistItems)
      .where(eq(checklistItems.checklistId, checklistId));
    
    const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;
    
    const [newItem] = await db
      .insert(checklistItems)
      .values({ 
        text: item.text,
        completed: item.completed ?? false,
        priority: (item.priority as "low" | "medium" | "high") ?? "medium",
        order: nextOrder,
        checklistId 
      })
      .returning();
    
    return newItem;
  }

  async updateChecklistItem(itemId: string, updates: Partial<InsertChecklistItem>): Promise<ChecklistItem> {
    const updateData: any = {};
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.order !== undefined) updateData.order = updates.order;
    
    const [updatedItem] = await db
      .update(checklistItems)
      .set(updateData)
      .where(eq(checklistItems.id, itemId))
      .returning();
    
    return updatedItem;
  }

  async deleteChecklistItem(itemId: string): Promise<void> {
    await db
      .delete(checklistItems)
      .where(eq(checklistItems.id, itemId));
  }

  async reorderChecklistItems(checklistId: string, itemOrders: Array<{id: string, order: number}>): Promise<void> {
    // Update each item's order
    for (const itemOrder of itemOrders) {
      await db
        .update(checklistItems)
        .set({ order: itemOrder.order })
        .where(and(
          eq(checklistItems.id, itemOrder.id),
          eq(checklistItems.checklistId, checklistId)
        ));
    }
  }

  // Dashboard statistics
  async getUserDashboardStats(userId: string): Promise<{
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    currentPhase: Phase | null;
    teamSatisfactionAvg: number;
    learningProgress: number;
  }> {
    // Get current day from progress tracking
    const currentDay = await this.getUserCurrentDay(userId);
    
    // Get task statistics
    const taskStats = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(*) filter (where status = 'completed')`,
      })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // Get team satisfaction average
    const teamSatStats = await db
      .select({
        avgSatisfaction: sql<number>`avg(satisfaction_score)`,
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, userId));

    // Get learning progress
    const learningStats = await db
      .select({
        avgProgress: sql<number>`avg(progress)`,
      })
      .from(learningResources)
      .where(eq(learningResources.userId, userId));

    // Get current phase based on current day
    const currentPhaseResult = await db
      .select()
      .from(phases)
      .where(and(
        lte(phases.startDay, currentDay),
        gte(phases.endDay, currentDay)
      ));

    const stats = taskStats[0];
    const overallProgress = Math.round((currentDay / 90) * 100);
    const teamSatisfactionAvg = teamSatStats[0]?.avgSatisfaction || 0;
    const learningProgress = learningStats[0]?.avgProgress || 0;

    return {
      overallProgress,
      tasksCompleted: stats?.completed || 0,
      totalTasks: stats?.total || 0,
      currentPhase: currentPhaseResult[0] || null,
      teamSatisfactionAvg: Number(teamSatisfactionAvg),
      learningProgress: Number(learningProgress),
    };
  }
}

export const storage = new DatabaseStorage();
