import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiMetric } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import MetricModal from "@/components/forms/metric-modal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const METRIC_TYPES = [
  { value: "deployment_frequency", label: "Deployment Frequency", unit: "per week", icon: "fas fa-rocket", color: "text-success" },
  { value: "lead_time", label: "Lead Time for Changes", unit: "hours", icon: "fas fa-clock", color: "text-primary" },
  { value: "mttr", label: "Mean Time to Recovery", unit: "minutes", icon: "fas fa-tools", color: "text-warning" },
  { value: "failure_rate", label: "Change Failure Rate", unit: "%", icon: "fas fa-shield-alt", color: "text-accent" },
  { value: "team_satisfaction", label: "Team Satisfaction", unit: "/5", icon: "fas fa-star", color: "text-warning" },
  { value: "system_uptime", label: "System Uptime", unit: "%", icon: "fas fa-server", color: "text-success" },
];

export default function Metrics() {
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metrics = [], isLoading: metricsLoading } = useQuery<KpiMetric[]>({
    queryKey: ["/api/kpi-metrics"],
    retry: false,
  });

  const deleteMetricMutation = useMutation({
    mutationFn: async (metricId: string) => {
      await apiRequest("DELETE", `/api/kpi-metrics/${metricId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kpi-metrics"] });
      toast({
        title: "Success",
        description: "Metric deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete metric",
        variant: "destructive",
      });
    },
  });

  // Group metrics by type and get latest values
  const metricsByType = METRIC_TYPES.map(type => {
    const typeMetrics = metrics.filter(m => m.metricType === type.value);
    const latestMetric = typeMetrics.sort((a, b) => new Date(b.recordedAt || new Date()).getTime() - new Date(a.recordedAt || new Date()).getTime())[0];
    
    return {
      ...type,
      latestValue: latestMetric?.value || null,
      target: latestMetric?.target || null,
      metrics: typeMetrics,
      trend: typeMetrics.length > 1 ? 
        (Number(typeMetrics[0].value) - Number(typeMetrics[1].value)) : 0,
    };
  });

  // Prepare chart data for selected metric type
  const getChartData = (metricType: string) => {
    const typeMetrics = metrics
      .filter(m => m.metricType === metricType)
      .sort((a, b) => new Date(a.recordedAt || new Date()).getTime() - new Date(b.recordedAt || new Date()).getTime())
      .slice(-10); // Last 10 entries

    return typeMetrics.map(metric => ({
      date: new Date(metric.recordedAt || new Date()).toLocaleDateString(),
      value: Number(metric.value),
      target: Number(metric.target || 0),
    }));
  };

  const filteredMetrics = selectedMetricType === "all" 
    ? metrics 
    : metrics.filter(m => m.metricType === selectedMetricType);

  if (metricsLoading) {
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
            title="KPI Metrics"
            subtitle="Track key performance indicators and team effectiveness metrics"
            actions={
              <Button
                onClick={() => setShowMetricModal(true)}
                className="bg-primary hover:bg-blue-800"
                data-testid="button-add-metric"
              >
                <i className="fas fa-plus mr-2"></i>
                Record Metric
              </Button>
            }
          />
          
          <main className="p-6">
            {/* KPI Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metricsByType.map((metric) => (
                <Card key={metric.value} className="p-6" data-testid={`metric-card-${metric.value}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        metric.color.includes('success') ? 'bg-green-100' :
                        metric.color.includes('primary') ? 'bg-blue-100' :
                        metric.color.includes('warning') ? 'bg-amber-100' :
                        metric.color.includes('accent') ? 'bg-red-100' : 'bg-slate-100'
                      }`}>
                        <i className={`${metric.icon} ${metric.color}`}></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm">{metric.label}</h3>
                        <p className="text-xs text-slate-500">{metric.metrics.length} records</p>
                      </div>
                    </div>
                    
                    {metric.trend !== 0 && (
                      <div className={`flex items-center space-x-1 ${
                        metric.trend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <i className={`fas ${metric.trend > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} text-xs`}></i>
                        <span className="text-xs">{Math.abs(metric.trend).toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Current:</span>
                      <span className="font-bold text-slate-800" data-testid={`text-${metric.value}-current`}>
                        {metric.latestValue ? `${metric.latestValue}${metric.unit}` : 'No data'}
                      </span>
                    </div>
                    
                    {metric.target && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Target:</span>
                        <span className="text-sm text-slate-600">
                          {metric.target}{metric.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Chart Section */}
            {selectedMetricType !== "all" && (
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Trend Analysis</h3>
                  <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
                    <SelectTrigger className="w-64" data-testid="select-chart-metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select metric to chart</SelectItem>
                      {METRIC_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData(selectedMetricType)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#1E40AF" 
                        strokeWidth={2}
                        name="Actual Value"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#DC2626" 
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Filter */}
            <Card className="p-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Metric Type:</label>
                  <Select value={selectedMetricType} onValueChange={setSelectedMetricType}>
                    <SelectTrigger className="w-64" data-testid="select-filter-metric">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Metrics</SelectItem>
                      {METRIC_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Metrics History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Metrics History</h3>
              
              {metricsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border-b border-slate-200 pb-4">
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMetrics.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-chart-line text-4xl text-slate-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No metrics recorded</h3>
                  <p className="text-slate-500 mb-6">Start tracking your KPIs by recording your first metric</p>
                  <Button
                    onClick={() => setShowMetricModal(true)}
                    className="bg-primary hover:bg-blue-800"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Record First Metric
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMetrics
                    .sort((a, b) => new Date(b.recordedAt || new Date()).getTime() - new Date(a.recordedAt || new Date()).getTime())
                    .map((metric) => {
                      const metricType = METRIC_TYPES.find(t => t.value === metric.metricType);
                      
                      return (
                        <div key={metric.id} className="border-b border-slate-200 pb-4 last:border-b-0" data-testid={`metric-record-${metric.id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                metricType?.color.includes('success') ? 'bg-green-100' :
                                metricType?.color.includes('primary') ? 'bg-blue-100' :
                                metricType?.color.includes('warning') ? 'bg-amber-100' :
                                metricType?.color.includes('accent') ? 'bg-red-100' : 'bg-slate-100'
                              }`}>
                                <i className={`${metricType?.icon} ${metricType?.color} text-sm`}></i>
                              </div>
                              
                              <div>
                                <h4 className="font-medium text-slate-800">
                                  {metricType?.label || metric.metricType}
                                </h4>
                                <p className="text-sm text-slate-600">
                                  {new Date(metric.recordedAt || new Date()).toLocaleDateString()} at {new Date(metric.recordedAt || new Date()).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="font-bold text-slate-800">
                                  {metric.value}{metricType?.unit || metric.unit}
                                </p>
                                {metric.target && (
                                  <p className="text-sm text-slate-500">
                                    Target: {metric.target}{metricType?.unit || metric.unit}
                                  </p>
                                )}
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMetricMutation.mutate(metric.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                data-testid={`button-delete-metric-${metric.id}`}
                              >
                                <i className="fas fa-trash text-sm"></i>
                              </Button>
                            </div>
                          </div>
                          
                          {metric.notes && (
                            <div className="mt-2 ml-11 p-2 bg-slate-50 rounded text-sm text-slate-600">
                              {metric.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </main>
        </div>
      </div>

      <MetricModal 
        open={showMetricModal}
        onOpenChange={setShowMetricModal}
      />
    </>
  );
}
