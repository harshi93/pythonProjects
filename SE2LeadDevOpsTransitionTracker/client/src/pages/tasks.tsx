import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@shared/schema";
import { PRIORITY_COLORS, STATUS_COLORS, PHASE_DATA } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import TaskModal from "@/components/forms/task-modal";

export default function Tasks() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    retry: false,
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete task",
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

  const filteredTasks = tasks.filter((task) => {
    if (filterPhase !== "all" && task.phaseId !== filterPhase) return false;
    if (filterStatus !== "all" && task.status !== filterStatus) return false;
    return true;
  });

  if (tasksLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        
        <div className="flex-1 overflow-auto">
          <Header
            title="Tasks & Goals"
            subtitle="Manage your leadership development tasks and track progress"
            actions={
              <Button
                onClick={() => setShowTaskModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-create-task"
              >
                <i className="fas fa-plus mr-2"></i>
                New Task
              </Button>
            }
          />
          
          <main className="p-6">
            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Phase:</label>
                  <Select value={filterPhase} onValueChange={setFilterPhase}>
                    <SelectTrigger className="w-48" data-testid="select-filter-phase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Phases</SelectItem>
                      {PHASE_DATA.map((phase) => (
                        <SelectItem key={phase.id} value={phase.id}>
                          {phase.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40" data-testid="select-filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Tasks List */}
            <div className="space-y-4">
              {tasksLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-6 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </Card>
                  ))}
                </div>
              ) : filteredTasks.length === 0 ? (
                <Card className="p-12 text-center">
                  <i className="fas fa-tasks text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No tasks found</h3>
                  <p className="text-slate-500 mb-6">
                    {filterPhase !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your filters or create a new task"
                      : "Create your first task to get started"
                    }
                  </p>
                  <Button
                    onClick={() => setShowTaskModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Task
                  </Button>
                </Card>
              ) : (
                filteredTasks.map((task) => (
                  <Card key={task.id} className="p-6" data-testid={`task-card-${task.id}`}>
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={(checked) => handleTaskComplete(task, !!checked)}
                        className="mt-1"
                        data-testid={`checkbox-task-${task.id}`}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold text-lg ${
                              task.status === "completed" ? "text-slate-500 line-through" : "text-slate-800"
                            }`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-slate-600 mt-1">{task.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3">
                              {task.phaseId && (
                                <div className="flex items-center space-x-1">
                                  <i className="fas fa-layer-group text-slate-400 text-sm"></i>
                                  <span className="text-sm text-slate-600">
                                    {PHASE_DATA.find(p => p.id === task.phaseId)?.name || task.phaseId}
                                  </span>
                                </div>
                              )}
                              
                              {task.dueDate && (
                                <div className="flex items-center space-x-1">
                                  <i className="fas fa-calendar text-slate-400 text-sm"></i>
                                  <span className="text-sm text-slate-600">
                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              
                              {task.completedAt && (
                                <div className="flex items-center space-x-1">
                                  <i className="fas fa-check-circle text-green-500 text-sm"></i>
                                  <span className="text-sm text-green-600">
                                    Completed {new Date(task.completedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Badge className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}>
                              {task.priority}
                            </Badge>
                            <Badge className={STATUS_COLORS[task.status as keyof typeof STATUS_COLORS]}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTaskMutation.mutate(task.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              data-testid={`button-delete-task-${task.id}`}
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </Button>
                          </div>
                        </div>
                        
                        {task.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">{task.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <TaskModal 
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
      />
    </>
  );
}
