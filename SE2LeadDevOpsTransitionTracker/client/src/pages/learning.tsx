import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningResource } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import LearningResourceModal from "@/components/forms/learning-resource-modal";

const TYPE_COLORS = {
  book: "bg-blue-100 text-blue-800",
  course: "bg-green-100 text-green-800",
  podcast: "bg-purple-100 text-purple-800",
  workshop: "bg-amber-100 text-amber-800",
} as const;

const STATUS_COLORS = {
  not_started: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
} as const;

export default function Learning() {
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingResource, setEditingResource] = useState<LearningResource | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading: resourcesLoading } = useQuery<LearningResource[]>({
    queryKey: ["/api/learning-resources"],
    retry: false,
  });

  const updateResourceMutation = useMutation({
    mutationFn: async ({ resourceId, updates }: { resourceId: string; updates: Partial<LearningResource> }) => {
      await apiRequest("PUT", `/api/learning-resources/${resourceId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-resources"] });
      toast({
        title: "Success",
        description: "Learning resource updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update learning resource",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      await apiRequest("DELETE", `/api/learning-resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/learning-resources"] });
      toast({
        title: "Success",
        description: "Learning resource deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete learning resource",
        variant: "destructive",
      });
    },
  });

  const handleEditResource = (resource: LearningResource) => {
    setEditingResource(resource);
    setShowResourceModal(true);
  };

  const handleCloseModal = () => {
    setShowResourceModal(false);
    setEditingResource(null);
  };

  const handleMarkComplete = (resource: LearningResource) => {
    updateResourceMutation.mutate({
      resourceId: resource.id,
      updates: {
        status: "completed",
        progress: 100,
        completedAt: new Date(),
      },
    });
  };

  const filteredResources = resources.filter((resource) => {
    if (filterType !== "all" && resource.type !== filterType) return false;
    if (filterStatus !== "all" && resource.status !== filterStatus) return false;
    return true;
  });

  // Calculate statistics
  const totalResources = resources.length;
  const completedResources = resources.filter(r => r.status === "completed").length;
  const inProgressResources = resources.filter(r => r.status === "in_progress").length;
  const averageProgress = totalResources > 0 
    ? resources.reduce((sum, r) => sum + (r.progress || 0), 0) / totalResources 
    : 0;

  if (resourcesLoading) {
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
            title="Learning Resources"
            subtitle="Track your professional development and learning progress"
            actions={
              <Button
                onClick={() => setShowResourceModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-add-learning-resource"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Resource
              </Button>
            }
          />
          
          <main className="p-6">
            {/* Learning Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Resources</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-total-resources">
                      {totalResources}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-book text-primary text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-completed-resources">
                      {completedResources}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-success text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">In Progress</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-in-progress-resources">
                      {inProgressResources}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-warning text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg Progress</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-avg-progress">
                      {Math.round(averageProgress)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Type:</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40" data-testid="select-filter-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="book">Books</SelectItem>
                      <SelectItem value="course">Courses</SelectItem>
                      <SelectItem value="podcast">Podcasts</SelectItem>
                      <SelectItem value="workshop">Workshops</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40" data-testid="select-filter-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Learning Resources List */}
            <div className="space-y-4">
              {resourcesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : filteredResources.length === 0 ? (
                <Card className="p-12 text-center">
                  <i className="fas fa-book text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No learning resources found</h3>
                  <p className="text-slate-500 mb-6">
                    {filterType !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your filters or add a new resource"
                      : "Start your learning journey by adding resources"
                    }
                  </p>
                  <Button
                    onClick={() => setShowResourceModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Learning Resource
                  </Button>
                </Card>
              ) : (
                filteredResources.map((resource) => (
                  <Card key={resource.id} className="p-6" data-testid={`resource-card-${resource.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800">{resource.title}</h3>
                          <Badge className={TYPE_COLORS[resource.type as keyof typeof TYPE_COLORS]}>
                            {resource.type}
                          </Badge>
                          <Badge className={STATUS_COLORS[resource.status as keyof typeof STATUS_COLORS]}>
                            {resource.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {resource.url && (
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-blue-800 text-sm mb-3 inline-block"
                          >
                            <i className="fas fa-external-link-alt mr-1"></i>
                            View Resource
                          </a>
                        )}

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>Progress</span>
                            <span>{resource.progress || 0}%</span>
                          </div>
                          <Progress value={resource.progress || 0} className="h-2" />
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-slate-600">
                          {resource.startedAt && (
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-play text-slate-400"></i>
                              <span>Started: {new Date(resource.startedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {resource.completedAt && (
                            <div className="flex items-center space-x-1">
                              <i className="fas fa-check-circle text-green-500"></i>
                              <span>Completed: {new Date(resource.completedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {resource.notes && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">{resource.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {resource.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkComplete(resource)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                            data-testid={`button-complete-resource-${resource.id}`}
                          >
                            <i className="fas fa-check text-sm"></i>
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditResource(resource)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          data-testid={`button-edit-resource-${resource.id}`}
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteResourceMutation.mutate(resource.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          data-testid={`button-delete-resource-${resource.id}`}
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </main>
        </div>
      </div>

      <LearningResourceModal 
        open={showResourceModal}
        onOpenChange={handleCloseModal}
        resource={editingResource}
      />
    </>
  );
}
