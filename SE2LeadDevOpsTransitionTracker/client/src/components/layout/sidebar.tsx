import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NavigationSection } from "@/types";

const navigationSections: NavigationSection[] = [
  {
    title: "Overview",
    items: [
      { href: "/", icon: "fas fa-chart-pie", label: "Dashboard" },
      { href: "/timeline", icon: "fas fa-calendar-alt", label: "Timeline" },
    ],
  },
  {
    title: "Phases",
    items: [
      { href: "/timeline?phase=1", icon: "fas fa-foundation", label: "Phase 1: Foundation" },
      { href: "/timeline?phase=2", icon: "fas fa-users", label: "Phase 2: Development" },
      { href: "/timeline?phase=3", icon: "fas fa-trophy", label: "Phase 3: Excellence" },
    ],
  },
  {
    title: "Tracking",
    items: [
      { href: "/tasks", icon: "fas fa-tasks", label: "Tasks & Goals" },
      { href: "/team", icon: "fas fa-user-friends", label: "Team Assessment" },
      { href: "/learning", icon: "fas fa-book", label: "Learning Resources" },
      { href: "/metrics", icon: "fas fa-chart-line", label: "KPI Metrics" },
    ],
  },
  {
    title: "Tools",
    items: [
      { href: "/assessment", icon: "fas fa-clipboard-check", label: "Self-Assessment" },
      { href: "/risks", icon: "fas fa-exclamation-triangle", label: "Risk Mitigation" },
      { href: "/followups", icon: "fas fa-tasks", label: "Follow-up Tracker" },
      { href: "/checklists", icon: "fas fa-list-check", label: "Checklists" },
    ],
  },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set default collapsed state for devices < 8 inches (576px)
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileDevice = window.innerWidth < 576; // 8 inches ≈ 576px
      setIsMobile(isMobileDevice);
      
      // Auto-collapse on mobile devices by default
      if (isMobileDevice && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "bg-white shadow-lg min-h-screen transition-all duration-300 ease-in-out z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          isCollapsed 
            ? isMobile 
              ? "-translate-x-full" 
              : "w-16" 
            : "w-64"
        )} 
        data-testid="sidebar"
      >
        {/* Header */}
        <div className={cn(
          "border-b border-slate-200 flex items-center justify-between",
          isCollapsed ? "p-3" : "p-6"
        )}>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-slate-800">Leadership Transition</h1>
              <p className="text-sm text-slate-600 mt-1">90-Day Development Plan</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "text-slate-600 hover:text-slate-800 hover:bg-slate-100",
              isCollapsed ? "w-full justify-center" : ""
            )}
            data-testid="button-toggle-sidebar"
          >
            <i className={cn(
              "fas text-lg",
              isCollapsed ? "fa-chevron-right" : "fa-chevron-left"
            )}></i>
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <div className={cn("px-4", isCollapsed && "px-2")}>
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-4">
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => {
                  const isActive = location === item.href || 
                    (item.href === "/" && location === "/");
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-lg mt-1 transition-colors relative group",
                        isCollapsed ? "px-3 py-3 justify-center" : "px-3 py-2",
                        isActive
                          ? "text-slate-700 bg-blue-50 border-l-4 border-primary"
                          : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                      )}
                      onClick={() => isMobile && setIsCollapsed(true)}
                      data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <i className={cn(
                        item.icon, 
                        isCollapsed ? "text-lg" : "mr-3", 
                        isActive ? "text-primary" : ""
                      )}></i>
                      
                      {!isCollapsed && item.label}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Toggle button for mobile when collapsed - positioned in header area */}
      {isMobile && isCollapsed && (
        <Button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-[60] bg-primary hover:bg-blue-800 text-white shadow-lg rounded-full w-10 h-10 p-0"
          data-testid="button-open-mobile-sidebar"
        >
          <i className="fas fa-bars text-sm"></i>
        </Button>
      )}
    </>
  );
}
