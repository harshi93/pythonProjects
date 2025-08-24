import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Timeline from "@/pages/timeline";
import Tasks from "@/pages/tasks";
import Team from "@/pages/team";
import Learning from "@/pages/learning";
import Metrics from "@/pages/metrics";
import Assessment from "@/pages/assessment";
import Risks from "@/pages/risks";
import FollowUps from "@/pages/followups";
import Checklists from "@/pages/checklists";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/team" component={Team} />
      <Route path="/learning" component={Learning} />
      <Route path="/metrics" component={Metrics} />
      <Route path="/assessment" component={Assessment} />
      <Route path="/risks" component={Risks} />
      <Route path="/followups" component={FollowUps} />
      <Route path="/checklists" component={Checklists} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
