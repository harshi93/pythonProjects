import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@shared/schema";
import { PRIORITY_COLORS } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TaskModal from "@/components/forms/task-modal";
import { Link } from "wouter";

export default function UpcomingTasks() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/upcoming"],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      await apiRequest("PUT", `/api/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const handleTaskComplete = (task: Task, completed: boolean) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      updates: {
        status: completed ? "completed" : "pending",
        completedAt: completed ? new Date() : null,
      },
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6" data-testid="upcoming-tasks">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">This Week's Focus</h3>
          <Link href="/tasks">
            <Button variant="ghost" className="text-primary hover:text-blue-800 text-sm font-medium">
              View All
            </Button>
          </Link>
        </div>
        
        <div className="space-y-4">
          {tasks.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg" data-testid={`task-${task.id}`}>
              <Checkbox
                checked={task.status === "completed"}
                onCheckedChange={(checked) => handleTaskComplete(task, !!checked)}
                className="mt-1"
                data-testid={`checkbox-task-${task.id}`}
              />
              <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === "completed" ? "text-slate-500 line-through" : "text-slate-800"}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {task.phaseId ? `Phase ${task.phaseId}` : "General"} • 
                  {task.dueDate ? ` Due ${new Date(task.dueDate).toLocaleDateString()}` : " No due date"}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}`}>
                {task.priority}
              </span>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <i className="fas fa-tasks text-3xl mb-4"></i>
              <p>No upcoming tasks</p>
              <p className="text-sm">Create your first task to get started</p>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setShowTaskModal(true)}
          variant="outline"
          className="w-full mt-4 text-primary hover:text-blue-800 border-primary hover:bg-blue-50 transition-colors"
          data-testid="button-add-task"
        >
          Add New Task
        </Button>
      </Card>

      <TaskModal 
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
      />
    </>
  );
}
