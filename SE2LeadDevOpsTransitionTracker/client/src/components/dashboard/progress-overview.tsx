import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { DashboardStats } from "@/types";

export default function ProgressOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-slate-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const progressCards = [
    {
      title: "Overall Progress",
      value: `${stats?.overallProgress || 0}%`,
      icon: "fas fa-chart-pie",
      iconColor: "text-primary",
      bgColor: "bg-blue-100",
      progressWidth: `${stats?.overallProgress || 0}%`,
      progressColor: "bg-primary",
      subtitle: "Day 0 of 90",
    },
    {
      title: "Tasks Completed",
      value: `${stats?.tasksCompleted || 0}/${stats?.totalTasks || 0}`,
      icon: "fas fa-check-circle",
      iconColor: "text-success",
      bgColor: "bg-green-100",
      progressWidth: `${stats?.totalTasks ? (stats.tasksCompleted / stats.totalTasks) * 100 : 0}%`,
      progressColor: "bg-success",
      subtitle: "+3 this week",
      subtitleColor: "text-success",
    },
    {
      title: "Team Satisfaction",
      value: `${stats?.teamSatisfactionAvg.toFixed(1) || '0.0'}/5`,
      icon: "fas fa-star",
      iconColor: "text-warning",
      bgColor: "bg-amber-100",
      progressWidth: `${((stats?.teamSatisfactionAvg || 0) / 5) * 100}%`,
      progressColor: "bg-warning",
      subtitle: "Target: 4.2+",
      subtitleColor: "text-warning",
    },
    {
      title: "Learning Progress",
      value: `${Math.round(stats?.learningProgress || 0)}%`,
      icon: "fas fa-graduation-cap",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      progressWidth: `${stats?.learningProgress || 0}%`,
      progressColor: "bg-purple-600",
      subtitle: "3/5 books completed",
      subtitleColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="progress-overview">
      {progressCards.map((card, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2" data-testid={`text-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {card.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
              <i className={`${card.icon} ${card.iconColor} text-xl`}></i>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className={`${card.progressColor} rounded-full h-2 transition-all duration-500`}
                style={{ width: card.progressWidth }}
              ></div>
            </div>
            <p className={`text-xs mt-2 ${card.subtitleColor || 'text-slate-500'}`}>
              {card.subtitle}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
