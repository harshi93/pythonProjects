import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "task_completed":
      return { icon: "w-2 h-2 bg-success rounded-full", color: "text-success" };
    case "task_created":
      return { icon: "w-2 h-2 bg-primary rounded-full", color: "text-primary" };
    case "learning_completed":
      return { icon: "w-2 h-2 bg-success rounded-full", color: "text-success" };
    case "learning_resource_added":
      return { icon: "w-2 h-2 bg-purple-600 rounded-full", color: "text-purple-600" };
    case "team_member_added":
      return { icon: "w-2 h-2 bg-warning rounded-full", color: "text-warning" };
    case "weekly_assessment":
      return { icon: "w-2 h-2 bg-blue-600 rounded-full", color: "text-blue-600" };
    case "metric_recorded":
      return { icon: "w-2 h-2 bg-primary rounded-full", color: "text-primary" };
    case "risk_identified":
      return { icon: "w-2 h-2 bg-accent rounded-full", color: "text-accent" };
    default:
      return { icon: "w-2 h-2 bg-slate-400 rounded-full", color: "text-slate-400" };
  }
};

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-slate-200 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="recent-activity">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.slice(0, 6).map((activity) => {
          const iconConfig = getActivityIcon(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
              <div className={iconConfig.icon + " mt-2"}></div>
              <div className="flex-1">
                <p className="text-sm text-slate-800">{activity.description}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <i className="fas fa-history text-3xl mb-4"></i>
            <p>No recent activity</p>
            <p className="text-sm">Your actions will appear here</p>
          </div>
        )}
      </div>

      <Button 
        variant="ghost"
        className="w-full mt-4 text-slate-600 hover:text-slate-800"
        data-testid="button-view-all-activity"
      >
        View All Activity
      </Button>
    </Card>
  );
}
