import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTaskSchema,
  insertTeamMemberSchema,
  insertLearningResourceSchema,
  insertKpiMetricSchema,
  insertWeeklyAssessmentSchema,
  insertRiskSchema,
  insertFollowUpSchema,
  insertChecklistSchema,
  insertChecklistItemSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Demo user ID for non-authenticated usage
  const DEMO_USER_ID = "demo-user-1";

  // Create demo user if it doesn't exist
  app.post('/api/init-demo', async (req, res) => {
    try {
      const existingUser = await storage.getUser(DEMO_USER_ID);
      if (!existingUser) {
        await storage.upsertUser({
          id: DEMO_USER_ID,
          email: "demo@example.com",
          firstName: "Demo",
          lastName: "User",
        });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error initializing demo user:", error);
      res.status(500).json({ message: "Failed to initialize demo user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      const stats = await storage.getUserDashboardStats(DEMO_USER_ID);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Task routes
  app.get('/api/tasks', async (req, res) => {
    try {
      const tasks = await storage.getUserTasks(DEMO_USER_ID);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get('/api/tasks/upcoming', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const tasks = await storage.getUpcomingTasks(DEMO_USER_ID, limit);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching upcoming tasks:", error);
      res.status(500).json({ message: "Failed to fetch upcoming tasks" });
    }
  });

  app.post('/api/tasks', async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(DEMO_USER_ID, taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      const updates = insertTaskSchema.partial().parse(req.body);
      
      // Add completion timestamp if marking as completed
      if (updates.status === 'completed' && !updates.completedAt) {
        updates.completedAt = new Date();
      }
      
      const task = await storage.updateTask(DEMO_USER_ID, taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const taskId = req.params.id;
      await storage.deleteTask(DEMO_USER_ID, taskId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Team member routes
  app.get('/api/team-members', async (req, res) => {
    try {
      const teamMembers = await storage.getUserTeamMembers(DEMO_USER_ID);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post('/api/team-members', async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(DEMO_USER_ID, memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(500).json({ message: "Failed to create team member" });
    }
  });

  app.put('/api/team-members/:id', async (req, res) => {
    try {
      const memberId = req.params.id;
      const updates = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(DEMO_USER_ID, memberId, updates);
      res.json(member);
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(500).json({ message: "Failed to update team member" });
    }
  });

  // Learning resource routes
  app.get('/api/learning-resources', async (req, res) => {
    try {
      const resources = await storage.getUserLearningResources(DEMO_USER_ID);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching learning resources:", error);
      res.status(500).json({ message: "Failed to fetch learning resources" });
    }
  });

  app.post('/api/learning-resources', async (req, res) => {
    try {
      const resourceData = insertLearningResourceSchema.parse(req.body);
      const resource = await storage.createLearningResource(DEMO_USER_ID, resourceData);
      res.json(resource);
    } catch (error) {
      console.error("Error creating learning resource:", error);
      res.status(500).json({ message: "Failed to create learning resource" });
    }
  });

  app.put('/api/learning-resources/:id', async (req, res) => {
    try {
      const resourceId = req.params.id;
      const updates = insertLearningResourceSchema.partial().parse(req.body);
      
      // Add completion timestamp if marking as completed
      if (updates.status === 'completed' && !updates.completedAt) {
        updates.completedAt = new Date();
      }
      
      const resource = await storage.updateLearningResource(DEMO_USER_ID, resourceId, updates);
      res.json(resource);
    } catch (error) {
      console.error("Error updating learning resource:", error);
      res.status(500).json({ message: "Failed to update learning resource" });
    }
  });

  // KPI metrics routes
  app.get('/api/kpi-metrics', async (req, res) => {
    try {
      const metrics = await storage.getUserKpiMetrics(DEMO_USER_ID);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching KPI metrics:", error);
      res.status(500).json({ message: "Failed to fetch KPI metrics" });
    }
  });

  app.post('/api/kpi-metrics', async (req, res) => {
    try {
      const metricData = insertKpiMetricSchema.parse(req.body);
      const metric = await storage.createKpiMetric(DEMO_USER_ID, metricData);
      res.json(metric);
    } catch (error) {
      console.error("Error creating KPI metric:", error);
      res.status(500).json({ message: "Failed to create KPI metric" });
    }
  });

  // Weekly assessment routes
  app.get('/api/weekly-assessments', async (req, res) => {
    try {
      const assessments = await storage.getUserWeeklyAssessments(DEMO_USER_ID);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching weekly assessments:", error);
      res.status(500).json({ message: "Failed to fetch weekly assessments" });
    }
  });

  app.post('/api/weekly-assessments', async (req, res) => {
    try {
      const assessmentData = insertWeeklyAssessmentSchema.parse(req.body);
      const assessment = await storage.createWeeklyAssessment(DEMO_USER_ID, assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating weekly assessment:", error);
      res.status(500).json({ message: "Failed to create weekly assessment" });
    }
  });

  // Risk routes
  app.get('/api/risks', async (req, res) => {
    try {
      const risks = await storage.getUserRisks(DEMO_USER_ID);
      res.json(risks);
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Failed to fetch risks" });
    }
  });

  app.post('/api/risks', async (req, res) => {
    try {
      const riskData = insertRiskSchema.parse(req.body);
      const risk = await storage.createRisk(DEMO_USER_ID, riskData);
      res.json(risk);
    } catch (error) {
      console.error("Error creating risk:", error);
      res.status(500).json({ message: "Failed to create risk" });
    }
  });

  app.put('/api/risks/:id', async (req, res) => {
    try {
      const riskId = req.params.id;
      const updates = insertRiskSchema.partial().parse(req.body);
      const risk = await storage.updateRisk(DEMO_USER_ID, riskId, updates);
      res.json(risk);
    } catch (error) {
      console.error("Error updating risk:", error);
      res.status(500).json({ message: "Failed to update risk" });
    }
  });

  // Activity routes
  app.get('/api/activities', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getUserActivities(DEMO_USER_ID, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Progress tracking routes
  app.post('/api/progress/start', async (req, res) => {
    try {
      const { currentDay } = req.body;
      await storage.updateUserProgress(DEMO_USER_ID, currentDay || 1);
      res.json({ success: true, currentDay: currentDay || 1 });
    } catch (error) {
      console.error("Error starting progress:", error);
      res.status(500).json({ message: "Failed to start progress tracking" });
    }
  });

  app.put('/api/progress/update', async (req, res) => {
    try {
      const { currentDay } = req.body;
      await storage.updateUserProgress(DEMO_USER_ID, currentDay);
      res.json({ success: true, currentDay });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Follow-up routes
  app.get('/api/follow-ups', async (req, res) => {
    try {
      const followUps = await storage.getUserFollowUps(DEMO_USER_ID);
      res.json(followUps);
    } catch (error) {
      console.error("Error fetching follow-ups:", error);
      res.status(500).json({ message: "Failed to fetch follow-ups" });
    }
  });

  app.post('/api/follow-ups', async (req, res) => {
    try {
      const followUpData = insertFollowUpSchema.parse(req.body);
      const followUp = await storage.createFollowUp(DEMO_USER_ID, followUpData);
      res.json(followUp);
    } catch (error) {
      console.error("Error creating follow-up:", error);
      res.status(500).json({ message: "Failed to create follow-up" });
    }
  });

  app.put('/api/follow-ups/:id', async (req, res) => {
    try {
      const followUpId = req.params.id;
      const updates = insertFollowUpSchema.partial().parse(req.body);
      const followUp = await storage.updateFollowUp(DEMO_USER_ID, followUpId, updates);
      res.json(followUp);
    } catch (error) {
      console.error("Error updating follow-up:", error);
      res.status(500).json({ message: "Failed to update follow-up" });
    }
  });

  app.delete('/api/follow-ups/:id', async (req, res) => {
    try {
      const followUpId = req.params.id;
      await storage.deleteFollowUp(DEMO_USER_ID, followUpId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting follow-up:", error);
      res.status(500).json({ message: "Failed to delete follow-up" });
    }
  });

  // Checklist routes
  app.get('/api/checklists', async (req, res) => {
    try {
      const checklists = await storage.getUserChecklists(DEMO_USER_ID);
      res.json(checklists);
    } catch (error) {
      console.error("Error fetching checklists:", error);
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  });

  app.post('/api/checklists', async (req, res) => {
    try {
      const checklistData = insertChecklistSchema.parse(req.body);
      const checklist = await storage.createChecklist(DEMO_USER_ID, checklistData);
      res.json(checklist);
    } catch (error) {
      console.error("Error creating checklist:", error);
      res.status(500).json({ message: "Failed to create checklist" });
    }
  });

  app.put('/api/checklists/:id', async (req, res) => {
    try {
      const checklistId = req.params.id;
      const updates = insertChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateChecklist(DEMO_USER_ID, checklistId, updates);
      res.json(checklist);
    } catch (error) {
      console.error("Error updating checklist:", error);
      res.status(500).json({ message: "Failed to update checklist" });
    }
  });

  app.delete('/api/checklists/:id', async (req, res) => {
    try {
      const checklistId = req.params.id;
      await storage.deleteChecklist(DEMO_USER_ID, checklistId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist:", error);
      res.status(500).json({ message: "Failed to delete checklist" });
    }
  });

  // Checklist item routes
  app.get('/api/checklists/:id/items', async (req, res) => {
    try {
      const checklistId = req.params.id;
      const items = await storage.getChecklistItems(checklistId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      res.status(500).json({ message: "Failed to fetch checklist items" });
    }
  });

  app.post('/api/checklists/:id/items', async (req, res) => {
    try {
      const checklistId = req.params.id;
      const itemData = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(checklistId, itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating checklist item:", error);
      res.status(500).json({ message: "Failed to create checklist item" });
    }
  });

  app.put('/api/checklist-items/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      const updates = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(itemId, updates);
      res.json(item);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      res.status(500).json({ message: "Failed to update checklist item" });
    }
  });

  app.delete('/api/checklist-items/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      await storage.deleteChecklistItem(itemId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist item:", error);
      res.status(500).json({ message: "Failed to delete checklist item" });
    }
  });

  app.put('/api/checklists/:id/items/reorder', async (req, res) => {
    try {
      const checklistId = req.params.id;
      const { itemOrders } = req.body;
      await storage.reorderChecklistItems(checklistId, itemOrders);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering checklist items:", error);
      res.status(500).json({ message: "Failed to reorder checklist items" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
