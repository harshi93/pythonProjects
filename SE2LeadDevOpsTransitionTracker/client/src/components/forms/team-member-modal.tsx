import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamMemberSchema, type InsertTeamMember, type TeamMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: TeamMember | null;
}

export default function TeamMemberModal({ open, onOpenChange, member }: TeamMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTeamMember>({
    resolver: zodResolver(insertTeamMemberSchema),
    defaultValues: {
      name: member?.name || "",
      role: member?.role || "",
      email: member?.email || "",
      strengths: member?.strengths || "",
      improvementAreas: member?.improvementAreas || "",
      careerGoals: member?.careerGoals || "",
      lastOneOnOneDate: member?.lastOneOnOneDate ? new Date(member.lastOneOnOneDate).toISOString().split('T')[0] : undefined,
      nextOneOnOneDate: member?.nextOneOnOneDate ? new Date(member.nextOneOnOneDate).toISOString().split('T')[0] : undefined,
      satisfactionScore: member?.satisfactionScore ? member.satisfactionScore.toString() : "",
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: async (memberData: InsertTeamMember) => {
      if (member) {
        await apiRequest("PUT", `/api/team-members/${member.id}`, memberData);
      } else {
        await apiRequest("POST", "/api/team-members", memberData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Success",
        description: `Team member ${member ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: `Failed to ${member ? 'update' : 'create'} team member`,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: InsertTeamMember) => {
    setIsSubmitting(true);
    // Convert satisfaction score to number if provided
    const processedData = {
      ...data,
      satisfactionScore: data.satisfactionScore ? data.satisfactionScore.toString() : null,
    };
    createMemberMutation.mutate(processedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="team-member-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            {member ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter team member name"
                className="w-full"
                data-testid="input-member-name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </Label>
              <Input
                id="role"
                {...form.register("role")}
                placeholder="e.g. Senior Developer"
                className="w-full"
                data-testid="input-member-role"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="team.member@company.com"
              className="w-full"
              data-testid="input-member-email"
            />
          </div>
          
          <div>
            <Label htmlFor="strengths" className="block text-sm font-medium text-slate-700 mb-2">
              Strengths
            </Label>
            <Textarea
              id="strengths"
              {...form.register("strengths")}
              placeholder="Document their key strengths and skills"
              rows={3}
              className="w-full"
              data-testid="textarea-member-strengths"
            />
          </div>

          <div>
            <Label htmlFor="improvementAreas" className="block text-sm font-medium text-slate-700 mb-2">
              Improvement Areas
            </Label>
            <Textarea
              id="improvementAreas"
              {...form.register("improvementAreas")}
              placeholder="Areas for growth and development"
              rows={3}
              className="w-full"
              data-testid="textarea-member-improvement-areas"
            />
          </div>

          <div>
            <Label htmlFor="careerGoals" className="block text-sm font-medium text-slate-700 mb-2">
              Career Goals
            </Label>
            <Textarea
              id="careerGoals"
              {...form.register("careerGoals")}
              placeholder="Their career aspirations and goals"
              rows={3}
              className="w-full"
              data-testid="textarea-member-career-goals"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lastOneOnOneDate" className="block text-sm font-medium text-slate-700 mb-2">
                Last 1:1 Date
              </Label>
              <Input
                id="lastOneOnOneDate"
                type="date"
                {...form.register("lastOneOnOneDate")}
                className="w-full"
                data-testid="input-member-last-one-on-one"
              />
            </div>
            
            <div>
              <Label htmlFor="nextOneOnOneDate" className="block text-sm font-medium text-slate-700 mb-2">
                Next 1:1 Date
              </Label>
              <Input
                id="nextOneOnOneDate"
                type="date"
                {...form.register("nextOneOnOneDate")}
                className="w-full"
                data-testid="input-member-next-one-on-one"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="satisfactionScore" className="block text-sm font-medium text-slate-700 mb-2">
              Satisfaction Score (1-5)
            </Label>
            <Input
              id="satisfactionScore"
              type="number"
              min="1"
              max="5"
              step="0.1"
              {...form.register("satisfactionScore")}
              placeholder="4.2"
              className="w-full"
              data-testid="input-member-satisfaction-score"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-member"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-blue-800"
              data-testid="button-save-member"
            >
              {isSubmitting ? "Saving..." : member ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
