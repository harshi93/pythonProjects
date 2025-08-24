import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import type { Checklist, ChecklistItem } from "@shared/schema";
import ChecklistItemModal from "../checklist/checklist-item-modal";

interface ChecklistDetailViewProps {
  checklist: Checklist;
  onBack: () => void;
  onChecklistUpdated: (checklist: Checklist) => void;
}

export default function ChecklistDetailView({ 
  checklist, 
  onBack, 
  onChecklistUpdated 
}: ChecklistDetailViewProps) {
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | undefined>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<ChecklistItem[]>({
    queryKey: ["/api/checklists", checklist.id, "items"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<ChecklistItem> }) => {
      await apiRequest("PUT", `/api/checklist-items/${itemId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists", checklist.id, "items"] });
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await apiRequest("DELETE", `/api/checklist-items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists", checklist.id, "items"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
  });

  const completedItems = items.filter(item => item.completed).length;
  const progressPercentage = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const toggleItemCompleted = (item: ChecklistItem) => {
    updateItemMutation.mutate({
      itemId: item.id,
      updates: { completed: !item.completed }
    });
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
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            <div className="max-w-5xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    data-testid="button-back-to-checklists"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Back to Checklists
                  </Button>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">{checklist.name}</h1>
                    {checklist.description && (
                      <p className="text-slate-600 mt-2">{checklist.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowItemModal(true)}
                    className="bg-primary hover:bg-blue-800"
                    data-testid="button-add-item"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Item
                  </Button>
                </div>

                {/* Progress Card */}
                <Card className="p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Progress Overview</h3>
                    <Badge variant="outline" className="text-sm">
                      {completedItems} of {items.length} completed
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-3 mb-2" />
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{progressPercentage}% Complete</span>
                    <span>Created {formatDate(checklist.createdAt)}</span>
                  </div>
                </Card>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {items.length === 0 ? (
                  <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <i className="fas fa-list text-4xl text-slate-300 mb-4"></i>
                      <h3 className="text-lg font-medium text-slate-800 mb-2">
                        No Items Yet
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Start adding items to this checklist to track your progress.
                      </p>
                      <Button
                        onClick={() => setShowItemModal(true)}
                        className="bg-primary hover:bg-blue-800"
                        data-testid="button-add-first-item"
                      >
                        <i className="fas fa-plus mr-2"></i>
                        Add First Item
                      </Button>
                    </div>
                  </Card>
                ) : (
                  items.map((item: ChecklistItem) => (
                    <Card 
                      key={item.id} 
                      className={`p-4 transition-all ${
                        item.completed ? "bg-green-50 border-green-200" : "bg-white"
                      }`}
                      data-testid={`checklist-item-${item.id}`}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => toggleItemCompleted(item)}
                          className="mt-1"
                          data-testid={`checkbox-item-${item.id}`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p 
                              className={`text-sm font-medium ${
                                item.completed 
                                  ? "line-through text-slate-500" 
                                  : "text-slate-800"
                              }`}
                            >
                              {item.text}
                            </p>
                            <Badge className={getPriorityColor(item.priority || "medium")}>
                              {(item.priority || "medium").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            Added {formatDate(item.createdAt)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingItem(item);
                              setShowItemModal(true);
                            }}
                            data-testid={`button-edit-item-${item.id}`}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this item?")) {
                                deleteItemMutation.mutate(item.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            data-testid={`button-delete-item-${item.id}`}
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

      <ChecklistItemModal 
        open={showItemModal}
        onOpenChange={(open: boolean) => {
          setShowItemModal(open);
          if (!open) setEditingItem(undefined);
        }}
        checklistId={checklist.id}
        item={editingItem}
      />
    </>
  );
}