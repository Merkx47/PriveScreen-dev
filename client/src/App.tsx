import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { isAdminSubdomain } from "@/lib/subdomain";
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
import VerifyEmail from "@/pages/verify-email";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";

// Admin-only router for admin.privescreen.com
function AdminRouter() {
  return (
    <Switch>
      {/* Main admin routes */}
      <Route path="/admin/login" component={AdminAuth} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      {/* Redirect root to dashboard (will redirect to login if not authenticated) */}
      <Route path="/">
        <Redirect to="/admin/dashboard" />
      </Route>
      {/* Legacy routes */}
      <Route path="/auth">
        <Redirect to="/admin/login" />
      </Route>
      <Route path="/login">
        <Redirect to="/admin/login" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Admin component - serves admin pages directly (no subdomain redirect)
// Since Amplify doesn't have admin subdomain configured, serve admin on main domain
function AdminPage({ path }: { path: string }) {
  if (path === '/admin/auth' || path === '/admin/login') {
    return <AdminAuth />;
  }
  return <AdminDashboard />;
}

// Main app router for privescreen.com
function MainRouter() {
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
      <Route path="/sponsor-request/:code" component={SponsorRequest} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/reset-password" component={ResetPassword} />
      {/* Admin routes - serve directly on main domain */}
      <Route path="/admin/login">
        <AdminPage path="/admin/login" />
      </Route>
      <Route path="/admin/dashboard">
        <AdminPage path="/admin/dashboard" />
      </Route>
      <Route path="/admin/auth">
        <AdminPage path="/admin/auth" />
      </Route>
      <Route path="/admin">
        <AdminPage path="/admin" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Select router based on subdomain
function Router() {
  const isAdmin = isAdminSubdomain();
  return isAdmin ? <AdminRouter /> : <MainRouter />;
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
