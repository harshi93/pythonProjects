import { useState } from "react";
import { Card } from "@/components/ui/card";
import TaskModal from "@/components/forms/task-modal";
import { Link } from "wouter";

export default function QuickActions() {
  const [showTaskModal, setShowTaskModal] = useState(false);

  const quickActions = [
    {
      id: "schedule-1on1",
      icon: "fas fa-calendar-plus",
      color: "text-primary",
      hoverColor: "hover:border-primary hover:bg-blue-50",
      label: "Schedule 1:1",
      href: "/team",
    },
    {
      id: "weekly-assessment", 
      icon: "fas fa-clipboard-check",
      color: "text-success",
      hoverColor: "hover:border-success hover:bg-green-50",
      label: "Weekly Assessment",
      href: "/assessment",
    },
    {
      id: "log-learning",
      icon: "fas fa-book-open", 
      color: "text-warning",
      hoverColor: "hover:border-warning hover:bg-amber-50",
      label: "Log Learning",
      href: "/learning",
    },
    {
      id: "update-metrics",
      icon: "fas fa-chart-bar",
      color: "text-purple-600", 
      hoverColor: "hover:border-purple-600 hover:bg-purple-50",
      label: "Update Metrics",
      href: "/metrics",
    },
    {
      id: "add-risk",
      icon: "fas fa-exclamation-triangle",
      color: "text-accent",
      hoverColor: "hover:border-accent hover:bg-red-50", 
      label: "Add Risk",
      href: "/risks",
    },
    {
      id: "add-note",
      icon: "fas fa-sticky-note",
      color: "text-slate-600",
      hoverColor: "hover:border-slate-600 hover:bg-slate-50",
      label: "Add Note",
      onClick: () => setShowTaskModal(true),
    },
  ];

  return (
    <>
      <Card className="p-6" data-testid="quick-actions">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const ActionComponent = action.href ? Link : "button";
            
            return (
              <ActionComponent
                key={action.id}
                {...(action.href ? { href: action.href } : { onClick: action.onClick })}
                className={`p-4 border border-slate-200 rounded-lg ${action.hoverColor} transition-colors group cursor-pointer block text-center`}
                data-testid={`button-${action.id}`}
              >
                <i className={`${action.icon} ${action.color} text-xl mb-2 group-hover:scale-110 transition-transform`}></i>
                <p className="text-sm font-medium text-slate-800">{action.label}</p>
              </ActionComponent>
            );
          })}
        </div>

        {/* File upload area */}
        <div className="mt-6 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary transition-colors cursor-pointer group">
          <div className="text-center">
            <i className="fas fa-cloud-upload-alt text-slate-400 group-hover:text-primary text-2xl mb-2 transition-colors"></i>
            <p className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
              Upload documents or progress reports
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOC, or images</p>
          </div>
        </div>
      </Card>

      <TaskModal 
        open={showTaskModal}
        onOpenChange={setShowTaskModal}
      />
    </>
  );
}
