import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PHASE_DATA } from "@/types";
import { DashboardStats } from "@/types";
import { Link } from "wouter";

export default function TimelineWidget() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Calculate currentDay from overall progress (overallProgress = (currentDay / 90) * 100)
  const currentDay = Math.round((stats?.overallProgress || 0) * 90 / 100);

  const getPhaseStatus = (phase: typeof PHASE_DATA[0]) => {
    if (currentDay > phase.endDay) {
      return { status: "completed", color: "success", icon: "fas fa-check" };
    } else if (currentDay >= phase.startDay && currentDay <= phase.endDay) {
      return { status: "in_progress", color: "warning", icon: "fas fa-clock" };
    } else {
      return { status: "upcoming", color: "slate", icon: "fas fa-trophy" };
    }
  };

  const getProgressWidth = (phase: typeof PHASE_DATA[0]) => {
    if (currentDay <= phase.startDay) return "0%";
    if (currentDay >= phase.endDay) return "100%";
    
    const phaseProgress = ((currentDay - phase.startDay + 1) / (phase.endDay - phase.startDay + 1)) * 100;
    return `${Math.min(100, Math.max(0, phaseProgress))}%`;
  };

  return (
    <Card className="p-6" data-testid="timeline-widget">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">90-Day Timeline</h3>
        <Link href="/timeline">
          <Button variant="ghost" className="text-primary hover:text-blue-800 text-sm font-medium">
            View Details
          </Button>
        </Link>
      </div>
      
      <div className="space-y-6">
        {PHASE_DATA.map((phase) => {
          const phaseStatus = getPhaseStatus(phase);
          const progressWidth = getProgressWidth(phase);
          
          const statusConfig = {
            completed: {
              badge: "bg-green-100 text-green-800",
              label: "Completed",
              progressColor: "bg-success",
            },
            in_progress: {
              badge: "bg-amber-100 text-amber-800", 
              label: "In Progress",
              progressColor: "bg-warning",
            },
            upcoming: {
              badge: "bg-slate-100 text-slate-600",
              label: "Upcoming", 
              progressColor: "bg-slate-400",
            },
          };

          const config = statusConfig[phaseStatus.status as keyof typeof statusConfig];
          
          return (
            <div key={phase.id} className="flex items-start space-x-4" data-testid={`phase-${phase.orderIndex}`}>
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 bg-${phaseStatus.color === 'slate' ? 'slate-300' : phaseStatus.color === 'warning' ? 'warning' : 'success'} rounded-full flex items-center justify-center`}>
                  <i className={`${phaseStatus.icon} text-white text-sm`}></i>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">{phase.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mt-1">
                  Days {phase.startDay}-{phase.endDay} • {phase.description}
                </p>
                <div className="mt-2">
                  <div className="bg-slate-200 rounded-full h-2">
                    <div 
                      className={`${config.progressColor} rounded-full h-2 transition-all duration-500`}
                      style={{ width: progressWidth }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
