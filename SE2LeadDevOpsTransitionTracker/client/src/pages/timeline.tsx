import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PHASE_DATA } from "@/types";
import { DashboardStats } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export default function Timeline() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  // Calculate currentDay from overall progress (overallProgress = (currentDay / 90) * 100)
  const currentDay = Math.round((stats?.overallProgress || 0) * 90 / 100);
  
  // Parse phase parameter from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const selectedPhase = urlParams.get('phase');

  const startProgressMutation = useMutation({
    mutationFn: async (day: number) => {
      await apiRequest("POST", "/api/progress/start", { currentDay: day });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Progress Started",
        description: "Your 90-day leadership transition journey has begun!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start progress tracking",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (day: number) => {
      await apiRequest("PUT", "/api/progress/update", { currentDay: day });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Progress Updated",
        description: `Progress updated to day ${currentDay + 1}`,
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header
          title="90-Day Timeline"
          subtitle="Track your progress through the three phases of leadership development"
        />
        
        <main className="p-6">
          {/* Overall Progress */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Overall Progress</h3>
                <p className="text-slate-600">Day {currentDay} of 90</p>
              </div>
              <div className="flex items-center space-x-4">
                {currentDay === 0 ? (
                  <Button
                    onClick={() => startProgressMutation.mutate(1)}
                    className="bg-success hover:bg-green-700"
                    disabled={startProgressMutation.isPending}
                    data-testid="button-start-progress"
                  >
                    <i className="fas fa-play mr-2"></i>
                    Start Journey
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateProgressMutation.mutate(currentDay + 1)}
                      className="bg-primary hover:bg-blue-800"
                      disabled={updateProgressMutation.isPending || currentDay >= 90}
                      data-testid="button-advance-day"
                    >
                      <i className="fas fa-forward mr-2"></i>
                      Advance Day
                    </Button>
                    <Button
                      onClick={() => updateProgressMutation.mutate(Math.max(0, currentDay - 1))}
                      variant="outline"
                      disabled={updateProgressMutation.isPending || currentDay <= 0}
                      data-testid="button-previous-day"
                    >
                      <i className="fas fa-backward mr-2"></i>
                      Previous Day
                    </Button>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{Math.round((currentDay / 90) * 100)}%</p>
                  <p className="text-sm text-slate-500">Complete</p>
                </div>
              </div>
            </div>
            <Progress value={(currentDay / 90) * 100} className="h-3" />
          </Card>

          {/* Phase Details */}
          <div className="space-y-6">
            {PHASE_DATA.map((phase, index) => {
              const isCompleted = currentDay > phase.endDay;
              const isActive = currentDay >= phase.startDay && currentDay <= phase.endDay;
              const phaseProgress = isCompleted ? 100 : 
                isActive ? ((currentDay - phase.startDay + 1) / (phase.endDay - phase.startDay + 1)) * 100 : 0;

              const isSelectedPhase = selectedPhase === phase.id;
              
              return (
                <Card 
                  key={phase.id} 
                  className={`p-6 ${isSelectedPhase ? 'ring-2 ring-primary bg-blue-50' : ''}`} 
                  data-testid={`phase-detail-${index + 1}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-success text-white' : 
                        isActive ? 'bg-warning text-white' : 
                        'bg-slate-200 text-slate-500'
                      }`}>
                        <i className={`fas ${
                          isCompleted ? 'fa-check' : 
                          isActive ? 'fa-clock' : 
                          'fa-circle'
                        }`}></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{phase.name}</h3>
                        <p className="text-slate-600 mt-1">{phase.description}</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Days {phase.startDay}-{phase.endDay} ({phase.endDay - phase.startDay + 1} days)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCompleted ? 'bg-green-100 text-green-800' :
                        isActive ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round(phaseProgress)}%</span>
                    </div>
                    <Progress value={phaseProgress} className="h-2" />
                  </div>

                  {/* Phase-specific content would go here */}
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-medium text-slate-800 mb-2">Key Deliverables:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {index === 0 && (
                        <>
                          <li>• Team assessment report with individual development plans</li>
                          <li>• Process improvement roadmap</li>
                          <li>• Team charter and working agreements</li>
                          <li>• Updated documentation and runbooks</li>
                        </>
                      )}
                      {index === 1 && (
                        <>
                          <li>• Individual development plans for all team members</li>
                          <li>• Team OKRs and success metrics</li>
                          <li>• 6-month technical roadmap</li>
                          <li>• Cross-functional collaboration framework</li>
                        </>
                      )}
                      {index === 2 && (
                        <>
                          <li>• Change management success story</li>
                          <li>• Executive presentation on team value and roadmap</li>
                          <li>• Hiring and onboarding framework</li>
                          <li>• Innovation program implementation</li>
                        </>
                      )}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
