import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PHASE_DATA } from "@/types";

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any; // For editing existing tasks
}

export default function TaskModal({ open, onOpenChange, task }: TaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      status: task?.status || "pending",
      phaseId: task?.phaseId || "",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : undefined,
      notes: task?.notes || "",
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: InsertTask) => {
      await apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to create task",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertTask) => {
    setIsSubmitting(true);
    createTaskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="task-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter task title"
              className="w-full"
              data-testid="input-task-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Task description"
              rows={3}
              className="w-full"
              data-testid="textarea-task-description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phaseId" className="block text-sm font-medium text-slate-700 mb-2">
                Phase
              </Label>
              <Select onValueChange={(value) => form.setValue("phaseId", value)} defaultValue={form.getValues("phaseId") || undefined}>
                <SelectTrigger data-testid="select-task-phase">
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Phase</SelectItem>
                  {PHASE_DATA.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </Label>
              <Select onValueChange={(value) => form.setValue("priority", value as "high" | "medium" | "low")} defaultValue={form.getValues("priority")}>
                <SelectTrigger data-testid="select-task-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-2">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register("dueDate")}
              className="w-full"
              data-testid="input-task-due-date"
            />
          </div>
          
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Additional notes"
              rows={2}
              className="w-full"
              data-testid="textarea-task-notes"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-task"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-task"
            >
              {isSubmitting ? "Saving..." : "Save Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
