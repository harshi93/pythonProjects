import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWeeklyAssessmentSchema, type InsertWeeklyAssessment, type WeeklyAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, format } from "date-fns";

interface AssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment?: WeeklyAssessment | null;
}

export default function AssessmentModal({ open, onOpenChange, assessment }: AssessmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current week start date
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const form = useForm<InsertWeeklyAssessment>({
    resolver: zodResolver(insertWeeklyAssessmentSchema),
    defaultValues: {
      weekStartDate: assessment?.weekStartDate || format(currentWeekStart, 'yyyy-MM-dd'),
      leadershipSkillsPractice: assessment?.leadershipSkillsPractice || "",
      teamSupportEfforts: assessment?.teamSupportEfforts || "",
      strategicInitiatives: assessment?.strategicInitiatives || "",
      stakeholderCommunication: assessment?.stakeholderCommunication || "",
      improvementAreas: assessment?.improvementAreas || "",
      overallRating: assessment?.overallRating || 3,
    },
  });

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: InsertWeeklyAssessment) => {
      if (assessment) {
        await apiRequest("PUT", `/api/weekly-assessments/${assessment.id}`, assessmentData);
      } else {
        await apiRequest("POST", "/api/weekly-assessments", assessmentData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-assessments"] });
      toast({
        title: "Success",
        description: `Assessment ${assessment ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to ${assessment ? 'update' : 'create'} assessment`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertWeeklyAssessment) => {
    setIsSubmitting(true);
    createAssessmentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="assessment-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {assessment ? "Edit Weekly Assessment" : "Weekly Self-Assessment"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="weekStartDate" className="block text-sm font-medium text-slate-700 mb-2">
              Week Starting *
            </Label>
            <Input
              id="weekStartDate"
              type="date"
              {...form.register("weekStartDate")}
              className="w-full"
              data-testid="input-assessment-week-start"
            />
            {form.formState.errors.weekStartDate && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.weekStartDate.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="leadershipSkillsPractice" className="block text-sm font-medium text-slate-700 mb-2">
                <i className="fas fa-user-tie mr-2"></i>
                What leadership skills did I practice this week?
              </Label>
              <Textarea
                id="leadershipSkillsPractice"
                {...form.register("leadershipSkillsPractice")}
                placeholder="Describe the leadership skills you practiced and how you demonstrated growth..."
                rows={4}
                className="w-full"
                data-testid="textarea-leadership-skills"
              />
            </div>

            <div>
              <Label htmlFor="teamSupportEfforts" className="block text-sm font-medium text-slate-700 mb-2">
                <i className="fas fa-users mr-2"></i>
                How did I support my team members' growth?
              </Label>
              <Textarea
                id="teamSupportEfforts"
                {...form.register("teamSupportEfforts")}
                placeholder="Detail how you supported team members, conducted 1:1s, provided feedback, etc..."
                rows={4}
                className="w-full"
                data-testid="textarea-team-support"
              />
            </div>

            <div>
              <Label htmlFor="strategicInitiatives" className="block text-sm font-medium text-slate-700 mb-2">
                <i className="fas fa-chess mr-2"></i>
                What strategic initiatives did I advance?
              </Label>
              <Textarea
                id="strategicInitiatives"
                {...form.register("strategicInitiatives")}
                placeholder="Describe strategic projects, process improvements, or long-term planning work..."
                rows={4}
                className="w-full"
                data-testid="textarea-strategic-initiatives"
              />
            </div>

            <div>
              <Label htmlFor="stakeholderCommunication" className="block text-sm font-medium text-slate-700 mb-2">
                <i className="fas fa-comments mr-2"></i>
                How effectively did I communicate with stakeholders?
              </Label>
              <Textarea
                id="stakeholderCommunication"
                {...form.register("stakeholderCommunication")}
                placeholder="Reflect on your communication with other teams, management, and external stakeholders..."
                rows={4}
                className="w-full"
                data-testid="textarea-stakeholder-communication"
              />
            </div>

            <div>
              <Label htmlFor="improvementAreas" className="block text-sm font-medium text-slate-700 mb-2">
                <i className="fas fa-target mr-2"></i>
                What would I do differently next week?
              </Label>
              <Textarea
                id="improvementAreas"
                {...form.register("improvementAreas")}
                placeholder="Identify areas for improvement and specific actions for next week..."
                rows={4}
                className="w-full"
                data-testid="textarea-improvement-areas"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="overallRating" className="block text-sm font-medium text-slate-700 mb-2">
              Overall Rating (1-5)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="overallRating"
                type="number"
                min="1"
                max="5"
                {...form.register("overallRating", { valueAsNumber: true })}
                className="w-20"
                data-testid="input-overall-rating"
              />
              <div className="text-sm text-slate-600">
                <span className="font-medium">Scale:</span> 1 = Poor, 2 = Needs Improvement, 3 = Fair, 4 = Good, 5 = Excellent
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-assessment"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-assessment"
            >
              {isSubmitting ? "Saving..." : assessment ? "Update Assessment" : "Complete Assessment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
