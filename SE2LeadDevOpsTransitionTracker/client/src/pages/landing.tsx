import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              DevOps Leadership Transition
            </h1>
            <p className="text-lg text-slate-600">
              Track your 90-day journey from Senior DevOps Engineer to Team Lead
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-tasks text-primary"></i>
              </div>
              <h3 className="font-semibold text-slate-800">Task Tracking</h3>
              <p className="text-sm text-slate-600">Monitor progress through 3 phases</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-users text-success"></i>
              </div>
              <h3 className="font-semibold text-slate-800">Team Management</h3>
              <p className="text-sm text-slate-600">1:1s and team assessments</p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="fas fa-chart-bar text-purple-600"></i>
              </div>
              <h3 className="font-semibold text-slate-800">KPI Metrics</h3>
              <p className="text-sm text-slate-600">Track leadership effectiveness</p>
            </div>
          </div>

          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-primary hover:bg-blue-800 text-white px-8 py-3 text-lg"
            data-testid="button-login"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
