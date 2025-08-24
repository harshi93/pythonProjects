import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertChecklistSchema, type InsertChecklist, type Checklist } from "@shared/schema";

interface ChecklistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: Checklist;
}

export default function ChecklistModal({ open, onOpenChange, checklist }: ChecklistModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertChecklist>({
    resolver: zodResolver(insertChecklistSchema),
    defaultValues: {
      name: checklist?.name || "",
      description: checklist?.description || "",
    },
  });

  const createChecklistMutation = useMutation({
    mutationFn: async (checklistData: InsertChecklist) => {
      if (checklist) {
        await apiRequest("PUT", `/api/checklists/${checklist.id}`, checklistData);
      } else {
        await apiRequest("POST", "/api/checklists", checklistData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({
        title: "Success",
        description: `Checklist ${checklist ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: `Failed to ${checklist ? 'update' : 'create'} checklist`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertChecklist) => {
    setIsSubmitting(true);
    createChecklistMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="checklist-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {checklist ? "Edit Checklist" : "Create New Checklist"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Checklist Name *
            </Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g. DevOps Team Onboarding Process"
              className="w-full"
              data-testid="input-checklist-name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe the purpose and scope of this checklist..."
              className="w-full min-h-[100px]"
              data-testid="input-checklist-description"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-checklist"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-checklist"
            >
              {isSubmitting ? "Saving..." : `${checklist ? 'Update' : 'Create'} Checklist`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}