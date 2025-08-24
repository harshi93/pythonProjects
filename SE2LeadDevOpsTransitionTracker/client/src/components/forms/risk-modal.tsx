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
import { insertRiskSchema, type InsertRisk, type Risk } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const RISK_CATEGORIES = [
  "Technical Skills Atrophy",
  "Team Resistance to Change", 
  "Overwhelming Workload",
  "Stakeholder Misalignment",
  "Communication Breakdown",
  "Resource Constraints",
  "Timeline Pressure",
  "Knowledge Gap",
  "Process Failure",
  "Technology Risk",
];

interface RiskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: Risk | null;
}

export default function RiskModal({ open, onOpenChange, risk }: RiskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertRisk>({
    resolver: zodResolver(insertRiskSchema),
    defaultValues: {
      title: risk?.title || "",
      description: risk?.description || "",
      category: risk?.category || "",
      probability: risk?.probability || "medium",
      impact: risk?.impact || "medium",
      status: risk?.status || "active",
      mitigationPlan: risk?.mitigationPlan || "",
      contingencyPlan: risk?.contingencyPlan || "",
    },
  });

  const createRiskMutation = useMutation({
    mutationFn: async (riskData: InsertRisk) => {
      if (risk) {
        await apiRequest("PUT", `/api/risks/${risk.id}`, riskData);
      } else {
        await apiRequest("POST", "/api/risks", riskData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: `Risk ${risk ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to ${risk ? 'update' : 'create'} risk`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertRisk) => {
    setIsSubmitting(true);
    createRiskMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="risk-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {risk ? "Edit Risk" : "Add New Risk"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
              Risk Title *
            </Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g. Technical skills becoming outdated"
              className="w-full"
              data-testid="input-risk-title"
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
              placeholder="Detailed description of the risk and its potential consequences"
              rows={3}
              className="w-full"
              data-testid="textarea-risk-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </Label>
              <Select onValueChange={(value) => form.setValue("category", value)} defaultValue={form.getValues("category") || undefined}>
                <SelectTrigger data-testid="select-risk-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {RISK_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </Label>
              <Select onValueChange={(value) => form.setValue("status", value)} defaultValue={form.getValues("status")}>
                <SelectTrigger data-testid="select-risk-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="probability" className="block text-sm font-medium text-slate-700 mb-2">
                Probability
              </Label>
              <Select onValueChange={(value) => form.setValue("probability", value)} defaultValue={form.getValues("probability") || undefined}>
                <SelectTrigger data-testid="select-risk-probability">
                  <SelectValue placeholder="Select probability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="impact" className="block text-sm font-medium text-slate-700 mb-2">
                Impact
              </Label>
              <Select onValueChange={(value) => form.setValue("impact", value)} defaultValue={form.getValues("impact") || undefined}>
                <SelectTrigger data-testid="select-risk-impact">
                  <SelectValue placeholder="Select impact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="mitigationPlan" className="block text-sm font-medium text-slate-700 mb-2">
              Mitigation Plan
            </Label>
            <Textarea
              id="mitigationPlan"
              {...form.register("mitigationPlan")}
              placeholder="Steps to reduce the probability or impact of this risk"
              rows={3}
              className="w-full"
              data-testid="textarea-risk-mitigation"
            />
          </div>

          <div>
            <Label htmlFor="contingencyPlan" className="block text-sm font-medium text-slate-700 mb-2">
              Contingency Plan
            </Label>
            <Textarea
              id="contingencyPlan"
              {...form.register("contingencyPlan")}
              placeholder="Backup plan if the risk occurs despite mitigation efforts"
              rows={3}
              className="w-full"
              data-testid="textarea-risk-contingency"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-risk"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-risk"
            >
              {isSubmitting ? "Saving..." : risk ? "Update Risk" : "Add Risk"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
