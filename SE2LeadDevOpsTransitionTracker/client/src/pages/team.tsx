import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TeamMember } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import TeamMemberModal from "@/components/forms/team-member-modal";

export default function Team() {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team-members"],
    retry: false,
  });

  const deleteTeamMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest("DELETE", `/api/team-members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members"] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleCloseModal = () => {
    setShowMemberModal(false);
    setEditingMember(null);
  };

  const getSatisfactionColor = (score: number | null) => {
    if (!score) return "bg-slate-200";
    if (score >= 4.5) return "bg-green-500";
    if (score >= 4.0) return "bg-green-400";
    if (score >= 3.5) return "bg-yellow-500";
    if (score >= 3.0) return "bg-orange-500";
    return "bg-red-500";
  };

  const getNextOneOnOneStatus = (nextDate: string | null) => {
    if (!nextDate) return { label: "Not Scheduled", color: "bg-slate-100 text-slate-600" };
    
    const next = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: "Overdue", color: "bg-red-100 text-red-800" };
    if (diffDays === 0) return { label: "Today", color: "bg-amber-100 text-amber-800" };
    if (diffDays <= 3) return { label: "This Week", color: "bg-blue-100 text-blue-800" };
    return { label: "Scheduled", color: "bg-green-100 text-green-800" };
  };

  if (membersLoading) {
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
            title="Team Assessment"
            subtitle="Manage your team members and track 1:1 meetings"
            actions={
              <Button
                onClick={() => setShowMemberModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-add-team-member"
              >
                <i className="fas fa-user-plus mr-2"></i>
                Add Team Member
              </Button>
            }
          />
          
          <main className="p-6">
            {/* Team Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Team Size</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-team-size">
                      {teamMembers.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-primary text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg Satisfaction</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-avg-satisfaction">
                      {teamMembers.length > 0 
                        ? (teamMembers.reduce((sum, member) => sum + (Number(member.satisfactionScore) || 0), 0) / teamMembers.length).toFixed(1)
                        : "0.0"
                      }/5
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-star text-success text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Pending 1:1s</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-pending-one-on-ones">
                      {teamMembers.filter(member => {
                        if (!member.nextOneOnOneDate) return true;
                        const next = new Date(member.nextOneOnOneDate);
                        const today = new Date();
                        return next <= today;
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-calendar-check text-warning text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Development Plans</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-development-plans">
                      {teamMembers.filter(member => member.careerGoals && member.careerGoals.trim()).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-purple-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>

            {/* Team Members List */}
            <div className="space-y-6">
              {membersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <Card className="p-12 text-center">
                  <i className="fas fa-user-friends text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No team members yet</h3>
                  <p className="text-slate-500 mb-6">
                    Start building your team assessment by adding team members
                  </p>
                  <Button
                    onClick={() => setShowMemberModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    Add First Team Member
                  </Button>
                </Card>
              ) : (
                teamMembers.map((member) => {
                  const oneOnOneStatus = getNextOneOnOneStatus(member.nextOneOnOneDate);
                  
                  return (
                    <Card key={member.id} className="p-6" data-testid={`team-member-${member.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-slate-600"></i>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-slate-800">{member.name}</h3>
                              {member.role && (
                                <Badge variant="outline" className="text-sm">
                                  {member.role}
                                </Badge>
                              )}
                              {member.satisfactionScore && (
                                <div className="flex items-center space-x-1">
                                  <div className={`w-3 h-3 rounded-full ${getSatisfactionColor(Number(member.satisfactionScore))}`}></div>
                                  <span className="text-sm text-slate-600">{member.satisfactionScore}/5</span>
                                </div>
                              )}
                            </div>
                            
                            {member.email && (
                              <p className="text-slate-600 text-sm mb-3">
                                <i className="fas fa-envelope mr-2"></i>
                                {member.email}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {member.strengths && (
                                <div>
                                  <h4 className="font-medium text-slate-800 mb-1">Strengths:</h4>
                                  <p className="text-sm text-slate-600">{member.strengths}</p>
                                </div>
                              )}
                              
                              {member.improvementAreas && (
                                <div>
                                  <h4 className="font-medium text-slate-800 mb-1">Improvement Areas:</h4>
                                  <p className="text-sm text-slate-600">{member.improvementAreas}</p>
                                </div>
                              )}
                            </div>

                            {member.careerGoals && (
                              <div className="mb-4">
                                <h4 className="font-medium text-slate-800 mb-1">Career Goals:</h4>
                                <p className="text-sm text-slate-600">{member.careerGoals}</p>
                              </div>
                            )}

                            <div className="flex items-center space-x-6 text-sm text-slate-600">
                              {member.lastOneOnOneDate && (
                                <div className="flex items-center space-x-1">
                                  <i className="fas fa-calendar text-slate-400"></i>
                                  <span>Last 1:1: {new Date(member.lastOneOnOneDate).toLocaleDateString()}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                <i className="fas fa-calendar-plus text-slate-400"></i>
                                <span>Next 1:1:</span>
                                <Badge className={oneOnOneStatus.color}>
                                  {oneOnOneStatus.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            data-testid={`button-edit-member-${member.id}`}
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTeamMemberMutation.mutate(member.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            data-testid={`button-delete-member-${member.id}`}
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </main>
        </div>
      </div>

      <TeamMemberModal 
        open={showMemberModal}
        onOpenChange={handleCloseModal}
        member={editingMember}
      />
    </>
  );
}
