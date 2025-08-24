import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProgressOverview from "@/components/dashboard/progress-overview";
import TimelineWidget from "@/components/dashboard/timeline-widget";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import KpiMetrics from "@/components/dashboard/kpi-metrics";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Home() {

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title="Dashboard Overview"
          subtitle="Track your leadership transition progress"
        />
        
        <main className="p-6">
          <ProgressOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <TimelineWidget />
            </div>
            <div>
              <UpcomingTasks />
            </div>
          </div>

          <KpiMetrics />

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivity />
            <QuickActions />
          </div>
        </main>
      </div>
    </div>
  );
}
