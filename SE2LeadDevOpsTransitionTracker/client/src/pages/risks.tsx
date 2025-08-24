import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Risk } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import RiskModal from "@/components/forms/risk-modal";

const PROBABILITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800", 
  high: "bg-red-100 text-red-800",
} as const;

const IMPACT_COLORS = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-800",
} as const;

const STATUS_COLORS = {
  active: "bg-red-100 text-red-800",
  mitigated: "bg-amber-100 text-amber-800",
  resolved: "bg-green-100 text-green-800",
} as const;

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

export default function Risks() {
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProbability, setFilterProbability] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: risks = [], isLoading: risksLoading } = useQuery<Risk[]>({
    queryKey: ["/api/risks"],
    retry: false,
  });

  const updateRiskMutation = useMutation({
    mutationFn: async ({ riskId, updates }: { riskId: string; updates: Partial<Risk> }) => {
      await apiRequest("PUT", `/api/risks/${riskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: "Risk updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update risk",
        variant: "destructive",
      });
    },
  });

  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      await apiRequest("DELETE", `/api/risks/${riskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/risks"] });
      toast({
        title: "Success",
        description: "Risk deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete risk",
        variant: "destructive",
      });
    },
  });

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
    setShowRiskModal(true);
  };

  const handleCloseModal = () => {
    setShowRiskModal(false);
    setEditingRisk(null);
  };

  const handleQuickStatusUpdate = (risk: Risk, newStatus: string) => {
    updateRiskMutation.mutate({
      riskId: risk.id,
      updates: { status: newStatus },
    });
  };

  const getRiskScore = (probability: string, impact: string) => {
    const probMap = { low: 1, medium: 2, high: 3 };
    const impactMap = { low: 1, medium: 2, high: 3 };
    return (probMap[probability as keyof typeof probMap] || 1) * (impactMap[impact as keyof typeof impactMap] || 1);
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 6) return "text-red-600";
    if (score >= 4) return "text-orange-600";
    return "text-green-600";
  };

  const filteredRisks = risks.filter((risk) => {
    if (filterCategory !== "all" && risk.category !== filterCategory) return false;
    if (filterStatus !== "all" && risk.status !== filterStatus) return false;
    if (filterProbability !== "all" && risk.probability !== filterProbability) return false;
    return true;
  });

  // Calculate statistics
  const totalRisks = risks.length;
  const activeRisks = risks.filter(r => r.status === "active").length;
  const highRisks = risks.filter(r => 
    getRiskScore(r.probability || "low", r.impact || "low") >= 6
  ).length;
  const mitigatedRisks = risks.filter(r => r.status === "mitigated").length;

  if (risksLoading) {
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
            title="Risk Mitigation"
            subtitle="Identify, track, and mitigate risks in your leadership transition"
            actions={
              <Button
                onClick={() => setShowRiskModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-add-risk"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Risk
              </Button>
            }
          />
          
          <main className="p-6">
            {/* Risk Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Risks</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-total-risks">
                      {totalRisks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-triangle text-slate-600 text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Risks</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-active-risks">
                      {activeRisks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation-circle text-accent text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">High Priority</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-high-priority-risks">
                      {highRisks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-fire text-orange-600 text-xl"></i>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Mitigated</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2" data-testid="text-mitigated-risks">
                      {mitigatedRisks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-warning text-xl"></i>
                  </div>
                </div>
              </Card>
            </div>

            {/* Common Risks Framework */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Common Leadership Transition Risks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <h4 className="font-medium text-red-800 mb-2">Technical Skills Atrophy</h4>
                  <p className="text-sm text-red-700">
                    Risk of losing hands-on technical skills while focusing on leadership
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <h4 className="font-medium text-orange-800 mb-2">Team Resistance</h4>
                  <p className="text-sm text-orange-700">
                    Team members may resist changes or new leadership approaches
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <h4 className="font-medium text-amber-800 mb-2">Overwhelming Workload</h4>
                  <p className="text-sm text-amber-700">
                    Balancing individual contributions with leadership responsibilities
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <h4 className="font-medium text-blue-800 mb-2">Stakeholder Misalignment</h4>
                  <p className="text-sm text-blue-700">
                    Inconsistent expectations from different stakeholders
                  </p>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <Card className="p-4 mb-6">
              <div className="flex items-center space-x-4 flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Category:</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48" data-testid="select-filter-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {RISK_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="mitigated">Mitigated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Probability:</label>
                  <Select value={filterProbability} onValueChange={setFilterProbability}>
                    <SelectTrigger className="w-40" data-testid="select-filter-probability">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Risks List */}
            <div className="space-y-4">
              {risksLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                      <div className="h-20 bg-slate-200 rounded"></div>
                    </Card>
                  ))}
                </div>
              ) : filteredRisks.length === 0 ? (
                <Card className="p-12 text-center">
                  <i className="fas fa-shield-alt text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No risks found</h3>
                  <p className="text-slate-500 mb-6">
                    {filterCategory !== "all" || filterStatus !== "all" || filterProbability !== "all"
                      ? "Try adjusting your filters or add a new risk"
                      : "Start proactive risk management by identifying potential risks"
                    }
                  </p>
                  <Button
                    onClick={() => setShowRiskModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add First Risk
                  </Button>
                </Card>
              ) : (
                filteredRisks
                  .sort((a, b) => {
                    // Sort by risk score (probability × impact) descending
                    const scoreA = getRiskScore(a.probability || "low", a.impact || "low");
                    const scoreB = getRiskScore(b.probability || "low", b.impact || "low");
                    return scoreB - scoreA;
                  })
                  .map((risk) => {
                    const riskScore = getRiskScore(risk.probability || "low", risk.impact || "low");
                    
                    return (
                      <Card key={risk.id} className="p-6" data-testid={`risk-card-${risk.id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-800">{risk.title}</h3>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className={STATUS_COLORS[risk.status as keyof typeof STATUS_COLORS]}>
                                  {risk.status}
                                </Badge>
                                
                                {risk.probability && (
                                  <Badge className={PROBABILITY_COLORS[risk.probability as keyof typeof PROBABILITY_COLORS]}>
                                    {risk.probability} prob
                                  </Badge>
                                )}
                                
                                {risk.impact && (
                                  <Badge className={IMPACT_COLORS[risk.impact as keyof typeof IMPACT_COLORS]}>
                                    {risk.impact} impact
                                  </Badge>
                                )}
                                
                                <Badge variant="outline" className={getRiskScoreColor(riskScore)}>
                                  Risk Score: {riskScore}/9
                                </Badge>
                              </div>
                            </div>
                            
                            {risk.category && (
                              <p className="text-sm text-slate-600 mb-2">
                                <i className="fas fa-tag mr-1"></i>
                                {risk.category}
                              </p>
                            )}

                            {risk.description && (
                              <p className="text-slate-700 mb-4">{risk.description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              {risk.mitigationPlan && (
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <h4 className="font-medium text-green-800 mb-2">
                                    <i className="fas fa-shield-alt mr-2"></i>
                                    Mitigation Plan
                                  </h4>
                                  <p className="text-sm text-green-700">{risk.mitigationPlan}</p>
                                </div>
                              )}
                              
                              {risk.contingencyPlan && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h4 className="font-medium text-blue-800 mb-2">
                                    <i className="fas fa-life-ring mr-2"></i>
                                    Contingency Plan
                                  </h4>
                                  <p className="text-sm text-blue-700">{risk.contingencyPlan}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-slate-500">
                              <span>Created: {new Date(risk.createdAt).toLocaleDateString()}</span>
                              <span>Updated: {new Date(risk.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {risk.status === "active" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStatusUpdate(risk, "mitigated")}
                                className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                data-testid={`button-mitigate-risk-${risk.id}`}
                              >
                                <i className="fas fa-shield text-sm"></i>
                              </Button>
                            )}
                            
                            {(risk.status === "active" || risk.status === "mitigated") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickStatusUpdate(risk, "resolved")}
                                className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                data-testid={`button-resolve-risk-${risk.id}`}
                              >
                                <i className="fas fa-check text-sm"></i>
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRisk(risk)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              data-testid={`button-edit-risk-${risk.id}`}
                            >
                              <i className="fas fa-edit text-sm"></i>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteRiskMutation.mutate(risk.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              data-testid={`button-delete-risk-${risk.id}`}
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

      <RiskModal 
        open={showRiskModal}
        onOpenChange={handleCloseModal}
        risk={editingRisk}
      />
    </>
  );
}
