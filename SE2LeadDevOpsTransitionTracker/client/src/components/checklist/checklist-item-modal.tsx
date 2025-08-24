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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertChecklistItemSchema, type InsertChecklistItem, type ChecklistItem } from "@shared/schema";

interface ChecklistItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklistId: string;
  item?: ChecklistItem;
}

export default function ChecklistItemModal({ 
  open, 
  onOpenChange, 
  checklistId, 
  item 
}: ChecklistItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertChecklistItem>({
    resolver: zodResolver(insertChecklistItemSchema),
    defaultValues: {
      text: item?.text || "",
      completed: item?.completed || false,
      priority: item?.priority || "medium",
      order: item?.order || 0,
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: InsertChecklistItem) => {
      if (item) {
        await apiRequest("PUT", `/api/checklist-items/${item.id}`, itemData);
      } else {
        await apiRequest("POST", `/api/checklists/${checklistId}/items`, itemData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists", checklistId, "items"] });
      toast({
        title: "Success",
        description: `Item ${item ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error", 
        description: `Failed to ${item ? 'update' : 'create'} item`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertChecklistItem) => {
    setIsSubmitting(true);
    createItemMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="checklist-item-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {item ? "Edit Checklist Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="text" className="block text-sm font-medium text-slate-700 mb-2">
              Item Text *
            </Label>
            <Input
              id="text"
              {...form.register("text")}
              placeholder="e.g. Set up development environment"
              className="w-full"
              data-testid="input-item-text"
            />
            {form.formState.errors.text && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.text.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </Label>
            <Select 
              onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")} 
              defaultValue={form.getValues("priority") || "medium"}
            >
              <SelectTrigger data-testid="select-item-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={form.watch("completed")}
              onCheckedChange={(checked) => form.setValue("completed", !!checked)}
              data-testid="checkbox-item-completed"
            />
            <Label htmlFor="completed" className="text-sm font-medium text-slate-700">
              Mark as completed
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-item"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-item"
            >
              {isSubmitting ? "Saving..." : `${item ? 'Update' : 'Add'} Item`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}