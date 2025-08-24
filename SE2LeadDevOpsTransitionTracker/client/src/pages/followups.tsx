import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import type { FollowUp } from "@shared/schema";
import FollowUpModal from "../components/forms/follow-up-modal";

export default function FollowUpsPage() {
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: followUps = [], isLoading } = useQuery<FollowUp[]>({
    queryKey: ["/api/follow-ups"],
  });

  const deleteFollowUpMutation = useMutation({
    mutationFn: async (followUpId: string) => {
      await apiRequest("DELETE", `/api/follow-ups/${followUpId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      toast({
        title: "Success",
        description: "Follow-up deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete follow-up",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/follow-ups/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      toast({
        title: "Success",
        description: "Follow-up status updated",
      });
    },
  });

  const filteredFollowUps = followUps.filter((followUp: FollowUp) => {
    if (statusFilter !== "all" && followUp.status !== statusFilter) return false;
    if (priorityFilter !== "all" && followUp.priority !== priorityFilter) return false;
    if (searchTerm && !followUp.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !followUp.assignee.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !followUp.requester.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "awaiting_response": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <main className="p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">Follow-up Tracker</h1>
                    <p className="text-slate-600 mt-2">
                      Track and manage follow-up items, assignments, and their progress
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowFollowUpModal(true)}
                    className="bg-primary hover:bg-blue-800"
                    data-testid="button-create-follow-up"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    New Follow-up
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <Input
                    placeholder="Search follow-ups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                    data-testid="input-search-followups"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48" data-testid="select-priority-filter">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Follow-ups List */}
              <div className="space-y-4">
                {filteredFollowUps.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <i className="fas fa-tasks text-4xl text-slate-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        {followUps.length === 0 ? "No Follow-ups Yet" : "No Matching Follow-ups"}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {followUps.length === 0 
                          ? "Start tracking follow-up items and assignments to stay organized."
                          : "Try adjusting your filters to see more results."}
                      </p>
                      {followUps.length === 0 && (
                        <Button
                          onClick={() => setShowFollowUpModal(true)}
                          className="bg-primary hover:bg-blue-800"
                          data-testid="button-add-first-followup"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Add First Follow-up
                        </Button>
                      )}
                    </div>
                  </Card>
                ) : (
                  filteredFollowUps.map((followUp: FollowUp) => (
                    <Card key={followUp.id} className="p-6" data-testid={`followup-card-${followUp.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-800">{followUp.title}</h3>
                            <Badge className={getStatusColor(followUp.status)}>
                              {followUp.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge className={getPriorityColor(followUp.priority)}>
                              {followUp.priority.toUpperCase()}
                            </Badge>
                            {isOverdue(followUp.dueDate) && followUp.status !== "completed" && (
                              <Badge className="bg-red-100 text-red-800">
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                Overdue
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
                            <div>
                              <span className="font-medium">Assignee:</span>
                              <br />
                              {followUp.assignee}
                            </div>
                            <div>
                              <span className="font-medium">Requester:</span>
                              <br />
                              {followUp.requester}
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span>
                              <br />
                              <span className={isOverdue(followUp.dueDate) && followUp.status !== "completed" ? "text-red-600 font-medium" : ""}>
                                {formatDate(followUp.dueDate)}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Last Check-in:</span>
                              <br />
                              {formatDate(followUp.lastCheckIn)}
                            </div>
                          </div>

                          {followUp.person && (
                            <div className="text-sm text-slate-600 mb-4">
                              <span className="font-medium">Person:</span> {followUp.person}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Select 
                            value={followUp.status} 
                            onValueChange={(status) => updateStatusMutation.mutate({ id: followUp.id, status })}
                          >
                            <SelectTrigger className="w-32" data-testid={`select-status-${followUp.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="awaiting_response">Awaiting Response</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFollowUp(followUp);
                              setShowFollowUpModal(true);
                            }}
                            data-testid={`button-edit-followup-${followUp.id}`}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteFollowUpMutation.mutate(followUp.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            data-testid={`button-delete-followup-${followUp.id}`}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      <FollowUpModal 
        open={showFollowUpModal}
        onOpenChange={(open: boolean) => {
          setShowFollowUpModal(open);
          if (!open) setEditingFollowUp(undefined);
        }}
        followUp={editingFollowUp}
      />
    </>
  );
}