import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import Landing from "@/pages/landing";
import PatientHome from "@/pages/patient-home";
import SponsorHome from "@/pages/sponsor-home";
import CenterHome from "@/pages/center-home";
import Centers from "@/pages/centers";
import ResultDetail from "@/pages/result-detail";
import History from "@/pages/history";
import Auth from "@/pages/auth";
import UploadResults from "@/pages/upload-results";
import BookHomeService from "@/pages/book-home-service";
import GetPrime from "@/pages/get-prime";
import Learn from "@/pages/learn";
import AdminAuth from "@/pages/admin/admin-auth";
import AdminDashboard from "@/pages/admin/admin-dashboard";
import SponsorRequest from "@/pages/sponsor-request";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/auth/patient">
        <Auth portalType="patient" />
      </Route>
      <Route path="/auth/sponsor">
        <Auth portalType="sponsor" />
      </Route>
      <Route path="/auth/center">
        <Auth portalType="center" />
      </Route>
      <Route path="/patient" component={PatientHome} />
      <Route path="/sponsor" component={SponsorHome} />
      <Route path="/center" component={CenterHome} />
      <Route path="/center/upload" component={UploadResults} />
      <Route path="/centers" component={Centers} />
      <Route path="/results/:id" component={ResultDetail} />
      <Route path="/history" component={History} />
      <Route path="/book-home-service" component={BookHomeService} />
      <Route path="/get-prime" component={GetPrime} />
      <Route path="/learn" component={Learn} />
      <Route path="/admin/auth" component={AdminAuth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/sponsor-request/:code" component={SponsorRequest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
