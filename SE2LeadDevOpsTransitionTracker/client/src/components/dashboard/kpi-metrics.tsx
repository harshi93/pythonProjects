import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiMetric } from "@shared/schema";
import { KPI_METRICS } from "@/types";

export default function KpiMetrics() {
  const { data: metrics = [], isLoading } = useQuery<KpiMetric[]>({
    queryKey: ["/api/kpi-metrics"],
  });

  // Group metrics by type and get latest value for each
  const latestMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.metricType] || new Date(metric.recordedAt) > new Date(acc[metric.metricType].recordedAt)) {
      acc[metric.metricType] = metric;
    }
    return acc;
  }, {} as Record<string, KpiMetric>);

  const kpiData = [
    {
      key: "deploymentFreq",
      title: "Deployment Frequency",
      icon: "fas fa-rocket",
      color: "text-success",
      bgColor: "bg-green-100",
      value: latestMetrics["deployment_frequency"]?.value || "+18%",
      target: "+20%",
    },
    {
      key: "leadTime", 
      title: "Lead Time Reduction",
      icon: "fas fa-clock",
      color: "text-primary",
      bgColor: "bg-blue-100",
      value: latestMetrics["lead_time"]?.value || "-12%",
      target: "-15%",
    },
    {
      key: "mttr",
      title: "MTTR Improvement", 
      icon: "fas fa-tools",
      color: "text-warning",
      bgColor: "bg-amber-100",
      value: latestMetrics["mttr"]?.value || "-20%",
      target: "-25%",
    },
    {
      key: "failureRate",
      title: "Change Failure Rate",
      icon: "fas fa-shield-alt", 
      color: "text-accent",
      bgColor: "bg-red-100",
      value: latestMetrics["failure_rate"]?.value || "3.2%",
      target: "<5%",
    },
  ];

  if (isLoading) {
    return (
      <Card className="mt-8 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-8 p-6" data-testid="kpi-metrics">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Key Performance Indicators</h3>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 bg-slate-100">
            Week
          </Button>
          <Button size="sm" className="bg-primary text-white">
            Month
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-800 bg-slate-100">
            Quarter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => (
          <div key={kpi.key} className="text-center" data-testid={`kpi-${kpi.key}`}>
            <div className={`w-20 h-20 ${kpi.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <i className={`${kpi.icon} ${kpi.color} text-2xl`}></i>
            </div>
            <h4 className="font-semibold text-slate-800">{kpi.title}</h4>
            <p className="text-2xl font-bold text-slate-800 mt-2" data-testid={`text-${kpi.key}-value`}>
              {kpi.value}
            </p>
            <p className={`text-sm ${kpi.color}`}>
              Target: {kpi.target}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
