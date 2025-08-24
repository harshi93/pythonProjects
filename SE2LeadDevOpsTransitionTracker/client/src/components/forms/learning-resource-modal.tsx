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
import { insertLearningResourceSchema, type InsertLearningResource, type LearningResource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LearningResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource?: LearningResource | null;
}

export default function LearningResourceModal({ open, onOpenChange, resource }: LearningResourceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertLearningResource>({
    resolver: zodResolver(insertLearningResourceSchema),
    defaultValues: {
      title: resource?.title || "",
      type: resource?.type || "book",
      url: resource?.url || "",
      status: resource?.status || "not_started",
      progress: resource?.progress || 0,
      startedAt: resource?.startedAt ? new Date(resource.startedAt).toISOString().split('T')[0] + 'T' + new Date(resource.startedAt).toTimeString().split(' ')[0] : undefined,
      completedAt: resource?.completedAt ? new Date(resource.completedAt).toISOString().split('T')[0] + 'T' + new Date(resource.completedAt).toTimeString().split(' ')[0] : undefined,
      notes: resource?.notes || "",
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: InsertLearningResource) => {
      if (resource) {
        await apiRequest("PUT", `/api/learning-resources/${resource.id}`, resourceData);
      } else {
        await apiRequest("POST", "/api/learning-resources", resourceData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-resources"] });
      toast({
        title: "Success",
        description: `Learning resource ${resource ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to ${resource ? 'update' : 'create'} learning resource`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertLearningResource) => {
    setIsSubmitting(true);
    // Auto-set startedAt if status is in_progress and not already set
    if (data.status === "in_progress" && !data.startedAt) {
      data.startedAt = new Date();
    }
    // Auto-set completedAt if status is completed and not already set
    if (data.status === "completed" && !data.completedAt) {
      data.completedAt = new Date();
      data.progress = 100;
    }
    createResourceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="learning-resource-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {resource ? "Edit Learning Resource" : "Add Learning Resource"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Title *
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g. The Manager's Path"
              className="w-full"
              data-testid="input-resource-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-2">
                Type *
              </Label>
              <Select onValueChange={(value) => form.setValue("type", value as "book" | "course" | "podcast" | "workshop")} defaultValue={form.getValues("type")}>
                <SelectTrigger data-testid="select-resource-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="podcast">Podcast</SelectItem>
                  <SelectItem value="workshop">Workshop</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </Label>
              <Select onValueChange={(value) => form.setValue("status", value as "not_started" | "in_progress" | "completed")} defaultValue={form.getValues("status")}>
                <SelectTrigger data-testid="select-resource-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="url" className="block text-sm font-medium text-slate-700 mb-2">
              URL
            </Label>
            <Input
              id="url"
              type="url"
              {...form.register("url")}
              placeholder="https://example.com/resource"
              className="w-full"
              data-testid="input-resource-url"
            />
          </div>

          <div>
            <Label htmlFor="progress" className="block text-sm font-medium text-slate-700 mb-2">
              Progress (0-100%)
            </Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              {...form.register("progress", { valueAsNumber: true })}
              placeholder="0"
              className="w-full"
              data-testid="input-resource-progress"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startedAt" className="block text-sm font-medium text-slate-700 mb-2">
                Started Date
              </Label>
              <Input
                id="startedAt"
                type="datetime-local"
                {...form.register("startedAt")}
                className="w-full"
                data-testid="input-resource-started-at"
              />
            </div>
            
            <div>
              <Label htmlFor="completedAt" className="block text-sm font-medium text-slate-700 mb-2">
                Completed Date
              </Label>
              <Input
                id="completedAt"
                type="datetime-local"
                {...form.register("completedAt")}
                className="w-full"
                data-testid="input-resource-completed-at"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Key takeaways, thoughts, or progress notes"
              rows={4}
              className="w-full"
              data-testid="textarea-resource-notes"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-resource"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-resource"
            >
              {isSubmitting ? "Saving..." : resource ? "Update Resource" : "Add Resource"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
