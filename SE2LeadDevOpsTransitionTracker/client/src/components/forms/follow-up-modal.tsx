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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFollowUpSchema, type InsertFollowUp, type FollowUp } from "@shared/schema";

interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  followUp?: FollowUp;
}

export default function FollowUpModal({ open, onOpenChange, followUp }: FollowUpModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertFollowUp>({
    resolver: zodResolver(insertFollowUpSchema),
    defaultValues: {
      title: followUp?.title || "",
      assignee: followUp?.assignee || "",
      dueDate: followUp?.dueDate ? new Date(followUp.dueDate).toISOString().split('T')[0] : "",
      requester: followUp?.requester || "",
      status: followUp?.status || "pending",
      lastCheckIn: followUp?.lastCheckIn ? new Date(followUp.lastCheckIn).toISOString().split('T')[0] : "",
      person: followUp?.person || "",
      priority: followUp?.priority || "medium",
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: async (followUpData: InsertFollowUp) => {
      if (followUp) {
        await apiRequest("PUT", `/api/follow-ups/${followUp.id}`, followUpData);
      } else {
        await apiRequest("POST", "/api/follow-ups", followUpData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      toast({
        title: "Success",
        description: `Follow-up ${followUp ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: `Failed to ${followUp ? 'update' : 'create'} follow-up`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertFollowUp) => {
    setIsSubmitting(true);
    createFollowUpMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="followup-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {followUp ? "Edit Follow-up" : "Create New Follow-up"}
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
              placeholder="e.g. Follow up on project timeline with stakeholders"
              className="w-full"
              data-testid="input-followup-title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignee" className="block text-sm font-medium text-slate-700 mb-2">
                Assignee *
              </Label>
              <Input
                id="assignee"
                {...form.register("assignee")}
                placeholder="Who is responsible for this follow-up"
                className="w-full"
                data-testid="input-followup-assignee"
              />
              {form.formState.errors.assignee && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.assignee.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="requester" className="block text-sm font-medium text-slate-700 mb-2">
                Requester *
              </Label>
              <Input
                id="requester"
                {...form.register("requester")}
                placeholder="Who requested this follow-up"
                className="w-full"
                data-testid="input-followup-requester"
              />
              {form.formState.errors.requester && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.requester.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-2">
                Due Date *
              </Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
                className="w-full"
                data-testid="input-followup-due-date"
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastCheckIn" className="block text-sm font-medium text-slate-700 mb-2">
                Last Check-in
              </Label>
              <Input
                id="lastCheckIn"
                type="date"
                {...form.register("lastCheckIn")}
                className="w-full"
                data-testid="input-followup-last-checkin"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </Label>
              <Select onValueChange={(value) => form.setValue("status", value)} defaultValue={form.getValues("status") || undefined}>
                <SelectTrigger data-testid="select-followup-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
                Priority
              </Label>
              <Select onValueChange={(value) => form.setValue("priority", value)} defaultValue={form.getValues("priority") || undefined}>
                <SelectTrigger data-testid="select-followup-priority">
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
            <Label htmlFor="person" className="block text-sm font-medium text-slate-700 mb-2">
              Person (Optional)
            </Label>
            <Input
              id="person"
              {...form.register("person")}
              placeholder="Additional person involved in this follow-up"
              className="w-full"
              data-testid="input-followup-person"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-followup"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-followup"
            >
              {isSubmitting ? "Saving..." : "Save Follow-up"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}