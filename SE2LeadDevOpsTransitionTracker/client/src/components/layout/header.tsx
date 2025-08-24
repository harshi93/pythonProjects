import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log("Export report clicked");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && (
            <p className="text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
          
          {!actions && (
            <Button 
              onClick={handleExportReport}
              className="bg-primary text-white hover:bg-blue-800 transition-colors"
              data-testid="button-export-report"
            >
              <i className="fas fa-download mr-2"></i>
              Export Report
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center" data-testid="avatar-placeholder">
              <i className="fas fa-user text-slate-600"></i>
            </div>
            <span className="text-slate-700 font-medium" data-testid="text-username">
              Demo User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
