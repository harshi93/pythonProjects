export interface DashboardStats {
  overallProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  currentPhase: {
    id: string;
    name: string;
    description: string;
    startDay: number;
    endDay: number;
  } | null;
  teamSatisfactionAvg: number;
  learningProgress: number;
}

export interface NavigationItem {
  href: string;
  icon: string;
  label: string;
  isActive?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const PRIORITY_COLORS = {
  high: "bg-amber-100 text-amber-800",
  medium: "bg-blue-100 text-blue-800", 
  low: "bg-slate-100 text-slate-600",
} as const;

export const STATUS_COLORS = {
  pending: "bg-slate-100 text-slate-600",
  in_progress: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
} as const;

export const PHASE_DATA = [
  {
    id: "phase1",
    name: "Phase 1: Foundation Building",
    description: "Team assessment, quick wins, leadership foundation",
    startDay: 1,
    endDay: 30,
    orderIndex: 1,
  },
  {
    id: "phase2", 
    name: "Phase 2: Leadership Development",
    description: "People management, strategic thinking, collaboration",
    startDay: 31,
    endDay: 60,
    orderIndex: 2,
  },
  {
    id: "phase3",
    name: "Phase 3: Leadership Excellence", 
    description: "Change management, scaling, innovation",
    startDay: 61,
    endDay: 90,
    orderIndex: 3,
  },
];

export const KPI_METRICS = {
  deploymentFreq: {
    label: "Deployment Frequency",
    icon: "fas fa-rocket",
    color: "text-success",
    target: "+20%",
  },
  leadTime: {
    label: "Lead Time Reduction", 
    icon: "fas fa-clock",
    color: "text-primary",
    target: "-15%",
  },
  mttr: {
    label: "MTTR Improvement",
    icon: "fas fa-tools", 
    color: "text-warning",
    target: "-25%",
  },
  failureRate: {
    label: "Change Failure Rate",
    icon: "fas fa-shield-alt",
    color: "text-accent", 
    target: "<5%",
  },
};
