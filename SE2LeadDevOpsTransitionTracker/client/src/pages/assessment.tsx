import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeeklyAssessment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import AssessmentModal from "@/components/forms/assessment-modal";
import { format, startOfWeek, endOfWeek } from "date-fns";

export default function Assessment() {
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<WeeklyAssessment | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<WeeklyAssessment[]>({
    queryKey: ["/api/weekly-assessments"],
    retry: false,
  });

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      await apiRequest("DELETE", `/api/weekly-assessments/${assessmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-assessments"] });
      toast({
        title: "Success",
        description: "Assessment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete assessment",
        variant: "destructive",
      });
    },
  });

  const handleEditAssessment = (assessment: WeeklyAssessment) => {
    setEditingAssessment(assessment);
    setShowAssessmentModal(true);
  };

  const handleCloseModal = () => {
    setShowAssessmentModal(false);
    setEditingAssessment(null);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "bg-green-500";
    if (rating >= 4.0) return "bg-green-400";
    if (rating >= 3.5) return "bg-yellow-500";
    if (rating >= 3.0) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Good";
    if (rating >= 3.5) return "Fair";
    if (rating >= 3.0) return "Needs Improvement";
    return "Poor";
  };

  // Calculate statistics
  const totalAssessments = assessments.length;
  const averageRating = totalAssessments > 0 
    ? assessments.reduce((sum, a) => sum + (a.overallRating || 0), 0) / totalAssessments 
    : 0;
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const hasThisWeekAssessment = assessments.some(a => 
    new Date(a.weekStartDate).getTime() === thisWeekStart.getTime()
  );

  if (assessmentsLoading) {
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
            title="Weekly Self-Assessment"
            subtitle="Reflect on your leadership development and track your progress"
            actions={
              <Button
                onClick={() => setShowAssessmentModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-create-assessment"
              >
                <i className="fas fa-plus mr-2"></i>
                New Assessment
              </Button>
            }
          />
          
          <main className="p-6">
            {/* Assessment Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Assessments</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-total-assessments">
                      {totalAssessments}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clipboard-check text-primary text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Average Rating</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-average-rating">
                      {averageRating.toFixed(1)}/5
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-warning text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">This Week</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-this-week-status">
                      {hasThisWeekAssessment ? "✓" : "—"}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    hasThisWeekAssessment ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    <i className={`fas fa-calendar ${hasThisWeekAssessment ? 'text-success' : 'text-slate-400'} text-xl`}></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Streak</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-assessment-streak">
                      {Math.min(totalAssessments, 12)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-fire text-purple-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>

            {/* Weekly Self-Assessment Framework */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Self-Assessment Framework</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">
                      <i className="fas fa-user-tie mr-2"></i>
                      Leadership Skills Practice
                    </h4>
                    <p className="text-sm text-blue-700">
                      What leadership skills did I practice this week? How did I demonstrate growth?
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      <i className="fas fa-users mr-2"></i>
                      Team Support Efforts
                    </h4>
                    <p className="text-sm text-green-700">
                      How did I support my team members' growth and development?
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">
                      <i className="fas fa-chess mr-2"></i>
                      Strategic Initiatives
                    </h4>
                    <p className="text-sm text-purple-700">
                      What strategic initiatives did I advance? What was the impact?
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-2">
                      <i className="fas fa-comments mr-2"></i>
                      Stakeholder Communication
                    </h4>
                    <p className="text-sm text-amber-700">
                      How effectively did I communicate with stakeholders?
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Assessment History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Assessment History</h3>
              
              {assessmentsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border-b border-slate-200 pb-4">
                      <div className="h-6 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : assessments.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-clipboard-list text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No assessments yet</h3>
                  <p className="text-slate-500 mb-6">
                    Start your weekly reflection practice by completing your first assessment
                  </p>
                  <Button
                    onClick={() => setShowAssessmentModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Complete First Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments
                    .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
                    .map((assessment) => (
                      <div key={assessment.id} className="border-b border-slate-200 pb-6 last:border-b-0" data-testid={`assessment-${assessment.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-lg font-semibold text-slate-800">
                                Week of {format(new Date(assessment.weekStartDate), 'MMM d, yyyy')}
                              </h4>
                              {assessment.overallRating && (
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${getRatingColor(assessment.overallRating)}`}></div>
                                  <Badge variant="outline">
                                    {assessment.overallRating}/5 - {getRatingLabel(assessment.overallRating)}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAssessment(assessment)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              data-testid={`button-edit-assessment-${assessment.id}`}
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAssessmentMutation.mutate(assessment.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              data-testid={`button-delete-assessment-${assessment.id}`}
                            >
                              <i className="fas fa-trash text-sm"></i>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {assessment.leadershipSkillsPractice && (
                            <div>
                              <h5 className="font-medium text-slate-800 mb-2">Leadership Skills Practice</h5>
                              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {assessment.leadershipSkillsPractice}
                              </p>
                            </div>
                          )}
                          
                          {assessment.teamSupportEfforts && (
                            <div>
                              <h5 className="font-medium text-slate-800 mb-2">Team Support Efforts</h5>
                              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {assessment.teamSupportEfforts}
                              </p>
                            </div>
                          )}
                          
                          {assessment.strategicInitiatives && (
                            <div>
                              <h5 className="font-medium text-slate-800 mb-2">Strategic Initiatives</h5>
                              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {assessment.strategicInitiatives}
                              </p>
                            </div>
                          )}
                          
                          {assessment.stakeholderCommunication && (
                            <div>
                              <h5 className="font-medium text-slate-800 mb-2">Stakeholder Communication</h5>
                              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                                {assessment.stakeholderCommunication}
                              </p>
                            </div>
                          )}
                        </div>

                        {assessment.improvementAreas && (
                          <div className="mt-4">
                            <h5 className="font-medium text-slate-800 mb-2">Areas for Improvement</h5>
                            <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                              {assessment.improvementAreas}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>

      <AssessmentModal 
        open={showAssessmentModal}
        onOpenChange={handleCloseModal}
        assessment={editingAssessment}
      />
    </>
  );
}
