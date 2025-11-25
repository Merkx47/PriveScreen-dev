import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import PatientHome from "@/pages/patient-home";
import SponsorHome from "@/pages/sponsor-home";
import CenterHome from "@/pages/center-home";
import Centers from "@/pages/centers";
import ResultDetail from "@/pages/result-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/patient" component={PatientHome} />
      <Route path="/sponsor" component={SponsorHome} />
      <Route path="/center" component={CenterHome} />
      <Route path="/centers" component={Centers} />
      <Route path="/results/:id" component={ResultDetail} />
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
