import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen" data-testid="sidebar">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Leadership Transition</h1>
        <p className="text-sm text-slate-600 mt-1">90-Day Development Plan</p>
      </div>
      
      <nav className="mt-6">
        <div className="px-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              {section.items.map((item) => {
                const isActive = location === item.href || 
                  (item.href === "/" && location === "/");
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg mt-1 transition-colors",
                      isActive
                        ? "text-slate-700 bg-blue-50 border-l-4 border-primary"
                        : "text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                    )}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <i className={cn(item.icon, "mr-3", isActive ? "text-primary" : "")}></i>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
