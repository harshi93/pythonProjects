import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import type { Checklist } from "@shared/schema";
import ChecklistModal from "../components/forms/checklist-modal";
import ChecklistDetailView from "../components/checklist/checklist-detail-view";

export default function ChecklistsPage() {
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | undefined>();
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checklists = [], isLoading } = useQuery<Checklist[]>({
    queryKey: ["/api/checklists"],
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (checklistId: string) => {
      await apiRequest("DELETE", `/api/checklists/${checklistId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      if (selectedChecklist) {
        setSelectedChecklist(null);
      }
      toast({
        title: "Success",
        description: "Checklist deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete checklist",
        variant: "destructive",
      });
    },
  });

  const filteredChecklists = checklists.filter((checklist: Checklist) => {
    if (searchTerm && !checklist.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !checklist.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getChecklistProgress = (checklist: Checklist) => {
    // This would need to be implemented with item counts from the API
    return 0; // Placeholder for now
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

  // If a checklist is selected, show the detail view
  if (selectedChecklist) {
    return (
      <ChecklistDetailView 
        checklist={selectedChecklist}
        onBack={() => setSelectedChecklist(null)}
        onChecklistUpdated={(updatedChecklist) => {
          setSelectedChecklist(updatedChecklist);
          queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
        }}
      />
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
                    <h1 className="text-3xl font-bold text-slate-900">Multipoint Checklists</h1>
                    <p className="text-slate-600 mt-2">
                      Create and manage multiple checklists with detailed item tracking
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowChecklistModal(true)}
                    className="bg-primary hover:bg-blue-800"
                    data-testid="button-create-checklist"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    New Checklist
                  </Button>
                </div>

                {/* Search */}
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search checklists..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                    data-testid="input-search-checklists"
                  />
                </div>
              </div>

              {/* Checklists Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChecklists.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="p-12 text-center">
                      <div className="max-w-md mx-auto">
                        <i className="fas fa-list-check text-4xl text-slate-300 mb-4"></i>
                        <h3 className="text-lg font-medium text-slate-800 mb-2">
                          {checklists.length === 0 ? "No Checklists Yet" : "No Matching Checklists"}
                        </h3>
                        <p className="text-slate-600 mb-4">
                          {checklists.length === 0 
                            ? "Create your first multipoint checklist to organize and track tasks."
                            : "Try adjusting your search to see more results."}
                        </p>
                        {checklists.length === 0 && (
                          <Button
                            onClick={() => setShowChecklistModal(true)}
                            className="bg-primary hover:bg-blue-800"
                            data-testid="button-add-first-checklist"
                          >
                            <i className="fas fa-plus mr-2"></i>
                            Create First Checklist
                          </Button>
                        )}
                      </div>
                    </Card>
                  </div>
                ) : (
                  filteredChecklists.map((checklist: Checklist) => (
                    <Card 
                      key={checklist.id} 
                      className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedChecklist(checklist)}
                      data-testid={`checklist-card-${checklist.id}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
                          {checklist.name}
                        </h3>
                        <div className="flex gap-2 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChecklist(checklist);
                              setShowChecklistModal(true);
                            }}
                            data-testid={`button-edit-checklist-${checklist.id}`}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Are you sure you want to delete this checklist?")) {
                                deleteChecklistMutation.mutate(checklist.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            data-testid={`button-delete-checklist-${checklist.id}`}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                      
                      {checklist.description && (
                        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                          {checklist.description}
                        </p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-slate-500">
                          <span>Progress</span>
                          <span>{getChecklistProgress(checklist)}% complete</span>
                        </div>
                        <Progress value={getChecklistProgress(checklist)} className="h-2" />
                        
                        <div className="flex justify-between items-center text-sm text-slate-500 pt-2 border-t">
                          <span>Created {formatDate(checklist.createdAt)}</span>
                          <Badge variant="outline" className="text-xs">
                            <i className="fas fa-tasks mr-1"></i>
                            Click to open
                          </Badge>
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

      <ChecklistModal 
        open={showChecklistModal}
        onOpenChange={(open: boolean) => {
          setShowChecklistModal(open);
          if (!open) setEditingChecklist(undefined);
        }}
        checklist={editingChecklist}
      />
    </>
  );
}