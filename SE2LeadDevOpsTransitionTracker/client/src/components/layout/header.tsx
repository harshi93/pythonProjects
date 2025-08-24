import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";


interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 576);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fetch data for export
  const { data: dashboardStats } = useQuery({ queryKey: ["/api/dashboard/stats"] });
  const { data: tasks } = useQuery({ queryKey: ["/api/tasks"] });
  const { data: teamMembers } = useQuery({ queryKey: ["/api/team-members"] });
  const { data: learningResources } = useQuery({ queryKey: ["/api/learning-resources"] });
  const { data: kpiMetrics } = useQuery({ queryKey: ["/api/kpi-metrics"] });
  const { data: assessments } = useQuery({ queryKey: ["/api/weekly-assessments"] });
  const { data: risks } = useQuery({ queryKey: ["/api/risks"] });
  const { data: activities } = useQuery({ queryKey: ["/api/activities"] });

  const generateReportData = () => {
      // Generate report data
      const reportData = {
        generatedAt: new Date().toISOString(),
        reportTitle: "DevOps Leadership Transition Progress Report",
        period: "90-Day Development Plan",
        dashboardOverview: dashboardStats,
        tasks: {
          total: Array.isArray(tasks) ? tasks.length : 0,
          completed: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "completed").length : 0,
          inProgress: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "in_progress").length : 0,
          pending: Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "pending").length : 0,
          details: Array.isArray(tasks) ? tasks : []
        },
        teamAssessment: {
          totalMembers: Array.isArray(teamMembers) ? teamMembers.length : 0,
          details: Array.isArray(teamMembers) ? teamMembers : []
        },
        learningProgress: {
          totalResources: Array.isArray(learningResources) ? learningResources.length : 0,
          completed: Array.isArray(learningResources) ? learningResources.filter((lr: any) => lr.status === "completed").length : 0,
          details: Array.isArray(learningResources) ? learningResources : []
        },
        kpiMetrics: {
          totalMetrics: Array.isArray(kpiMetrics) ? kpiMetrics.length : 0,
          details: Array.isArray(kpiMetrics) ? kpiMetrics : []
        },
        assessments: {
          totalAssessments: Array.isArray(assessments) ? assessments.length : 0,
          details: Array.isArray(assessments) ? assessments : []
        },
        risks: {
          totalRisks: Array.isArray(risks) ? risks.length : 0,
          highPriority: Array.isArray(risks) ? risks.filter((r: any) => r.priority === "high").length : 0,
          details: Array.isArray(risks) ? risks : []
        },
        recentActivities: Array.isArray(activities) ? activities.slice(0, 20) : []
      };
    
    return reportData;
  };

  const exportAsJSON = async () => {
    setIsExporting(true);
    
    try {
      const reportData = generateReportData();
      
      // Create and download JSON file
      const jsonString = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `leadership-transition-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "JSON Report Exported",
        description: "Your progress report has been downloaded as JSON.",
      });

    } catch (error) {
      console.error("JSON Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate the JSON report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsExcel = async () => {
    setIsExporting(true);
    
    try {
      const reportData = generateReportData();
      
      // Create CSV format for Excel compatibility
      const csvData = [
        'DevOps Leadership Transition Progress Report',
        `Generated At,${reportData.generatedAt}`,
        `Period,${reportData.period}`,
        '',
        'Overall Statistics',
        `Total Tasks,${reportData.tasks.total}`,
        `Completed Tasks,${reportData.tasks.completed}`,
        `In Progress Tasks,${reportData.tasks.inProgress}`,
        `Pending Tasks,${reportData.tasks.pending}`,
        '',
        'Team Assessment',
        `Total Team Members,${reportData.teamAssessment.totalMembers}`,
        '',
        'Learning Progress',
        `Total Resources,${reportData.learningProgress.totalResources}`,
        `Completed Resources,${reportData.learningProgress.completed}`,
        '',
        'Risk Management',
        `Total Risks,${reportData.risks.totalRisks}`,
        `High Priority Risks,${reportData.risks.highPriority}`,
        '',
        `KPI Metrics,${reportData.kpiMetrics.totalMetrics}`,
        `Weekly Assessments,${reportData.assessments.totalAssessments}`,
        '',
        'Task Details',
        'Title,Description,Status,Priority,Phase,Due Date'
      ];

      // Add task details
      reportData.tasks.details.forEach((task: any) => {
        csvData.push(`"${task.title || ''}","${task.description || ''}","${task.status || ''}","${task.priority || ''}","${task.phase || ''}","${task.dueDate || ''}"`);
      });

      // Create CSV blob and download
      const csvContent = csvData.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `leadership-transition-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV Report Exported",
        description: "Your progress report has been downloaded as CSV file (Excel compatible).",
      });

    } catch (error) {
      console.error("CSV Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate the CSV report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div className={isMobile ? "ml-12" : ""}>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
          
          {!actions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  disabled={isExporting}
                  className="bg-primary text-white hover:bg-blue-800 transition-colors disabled:opacity-50"
                  size={isMobile ? "sm" : "default"}
                  data-testid="button-export-report"
                >
                  <i className={`fas ${isExporting ? "fa-spinner fa-spin" : "fa-download"} ${!isMobile ? "mr-2" : ""}`}></i>
                  <span className="hidden xs:inline sm:inline md:inline lg:inline">
                    {isExporting ? "Exporting..." : (isMobile ? "Export" : "Export Report")}
                  </span>
                  {!isExporting && <i className="fas fa-chevron-down ml-1 text-xs"></i>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportAsJSON} data-testid="export-json">
                  <i className="fas fa-file-code mr-2"></i>
                  Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportAsExcel} data-testid="export-excel">
                  <i className="fas fa-file-csv mr-2"></i>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          

        </div>
      </div>
    </header>
  );
}
