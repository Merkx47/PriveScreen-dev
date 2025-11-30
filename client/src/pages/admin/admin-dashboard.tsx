import * as React from "react";
import { useState, useEffect } from "react";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Building2,
  Heart,
  Activity,
  TrendingUp,
  Wallet,
  FileText,
  Search,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  LogOut,
  Settings,
  Eye,
  UserCheck,
  UserX,
  RefreshCw,
  Crown,
  ArrowDownToLine,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { AdminSettingsDialog } from "@/components/admin-settings-dialog";
import { InviteAdminDialog } from "@/components/invite-admin-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  getDashboardStats,
  getUsers,
  getUserById,
  searchUsers,
  getCenters,
  getSponsors,
  getAuditLogs,
  suspendUser,
  unsuspendUser,
  verifyCenter,
  suspendCenter,
  verifySponsor,
  type UserListItem,
  type CenterListItem,
  type SponsorListItem,
  type AuditLog,
} from "@/lib/api/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Stats interface matching backend response
interface DashboardStats {
  totalPatients: number;
  newPatientsLastMonth: number;
  activeSubscriptions: number;
  openTickets: number;
  totalPlatformBalance: string;
}

type Tab = "overview" | "revenue" | "patients" | "centers" | "sponsors" | "admins" | "logs";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteAdmin, setShowInviteAdmin] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  // Auth check state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [centers, setCenters] = useState<CenterListItem[]>([]);
  const [sponsors, setSponsors] = useState<SponsorListItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pendingCenters, setPendingCenters] = useState<CenterListItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserListItem[]>([]);

  // Auth check - must be before any conditional returns but after all hooks
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === "admin") {
          setIsAuthenticated(true);
          return;
        }
      } catch {
        // Invalid stored data
      }
    }
    setIsAuthenticated(false);
  }, []);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, centersRes, sponsorsRes, logsRes, pendingCentersRes, adminsRes] = await Promise.all([
        getDashboardStats(),
        getUsers("patient", 0, 20),
        getCenters(undefined, 0, 20),
        getSponsors(undefined, 0, 20),
        getAuditLogs(undefined, undefined, 0, 20),
        getCenters("pending", 0, 10),
        getUsers("admin", 0, 20),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data as unknown as DashboardStats);
      }
      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.content || []);
      }
      if (centersRes.success && centersRes.data) {
        setCenters(centersRes.data.content || []);
      }
      if (sponsorsRes.success && sponsorsRes.data) {
        setSponsors(sponsorsRes.data.content || []);
      }
      if (logsRes.success && logsRes.data) {
        setAuditLogs(logsRes.data.content || []);
      }
      if (pendingCentersRes.success && pendingCentersRes.data) {
        setPendingCenters(pendingCentersRes.data.content || []);
      }
      if (adminsRes.success && adminsRes.data) {
        setAdminUsers(adminsRes.data.content || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Unable to load dashboard data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search users (patients only)
  const handleSearch = async (query: string) => {
    try {
      if (!query.trim()) {
        const res = await getUsers("patient", 0, 20);
        if (res.success && res.data) {
          setUsers(res.data.content || []);
        }
        return;
      }
      const res = await searchUsers(query, 0, 20);
      if (res.success && res.data) {
        // Filter to only show patients in search results
        setUsers((res.data.content || []).filter(u => u.role === "patient"));
      }
    } catch (err) {
      console.error("Search failed:", err);
      // Keep existing users on search failure
    }
  };

  // View user details
  const handleViewUserDetails = async (user: UserListItem) => {
    setSelectedUser(user);
    setShowUserDetails(true);
    setLoadingUserDetails(true);
    try {
      const res = await getUserById(user.id);
      if (res.success && res.data) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Redirect to login if not authenticated (after all hooks)
  if (isAuthenticated === false) {
    return <Redirect to="/admin/login" />;
  }

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleUserStatusChange = async (userId: string, action: "suspend" | "unsuspend") => {
    try {
      if (action === "suspend") {
        const res = await suspendUser(userId, "Suspended by admin");
        if (res.success) {
          toast({ title: "User Suspended", description: "User has been suspended successfully" });
          fetchDashboardData();
        } else {
          toast({ title: "Error", description: res.message || "Failed to suspend user", variant: "destructive" });
        }
      } else {
        const res = await unsuspendUser(userId);
        if (res.success) {
          toast({ title: "User Activated", description: "User has been activated successfully" });
          fetchDashboardData();
        } else {
          toast({ title: "Error", description: res.message || "Failed to activate user", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleCenterAction = async (centerId: string, action: "verify" | "suspend") => {
    try {
      if (action === "verify") {
        const res = await verifyCenter(centerId);
        if (res.success) {
          toast({ title: "Center Verified", description: "Center has been verified successfully" });
          fetchDashboardData();
        } else {
          toast({ title: "Error", description: res.message || "Failed to verify center", variant: "destructive" });
        }
      } else {
        const res = await suspendCenter(centerId, "Suspended by admin");
        if (res.success) {
          toast({ title: "Center Suspended", description: "Center has been suspended" });
          fetchDashboardData();
        } else {
          toast({ title: "Error", description: res.message || "Failed to suspend center", variant: "destructive" });
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const handleSponsorVerify = async (sponsorId: string) => {
    try {
      const res = await verifySponsor(sponsorId);
      if (res.success) {
        toast({ title: "Sponsor Verified", description: "Sponsor has been verified successfully" });
        fetchDashboardData();
      } else {
        toast({ title: "Error", description: res.message || "Failed to verify sponsor", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "verified":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{status}</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">{status}</Badge>;
      case "inactive":
        return <Badge variant="secondary">{status}</Badge>;
      case "suspended":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getEntityBadge = (type: string) => {
    switch (type) {
      case "patient":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><Users className="h-3 w-3 mr-1" />Patient</Badge>;
      case "center":
        return <Badge variant="outline" className="text-purple-600 border-purple-200"><Building2 className="h-3 w-3 mr-1" />Center</Badge>;
      case "sponsor":
        return <Badge variant="outline" className="text-green-600 border-green-200"><Heart className="h-3 w-3 mr-1" />Sponsor</Badge>;
      case "test":
        return <Badge variant="outline" className="text-amber-600 border-amber-200"><FileText className="h-3 w-3 mr-1" />Test</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">PriveScreen Admin</h1>
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowInviteAdmin(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Admin
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <a href="/admin/auth">
                  <LogOut className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-2xl font-bold">{(stats?.totalPatients || 0).toLocaleString()}</p>
                  )}
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diagnostic Centers</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{centers.length}</p>
                  )}
                </div>
                <Building2 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sponsors</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold">{sponsors.length}</p>
                  )}
                </div>
                <Heart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platform Balance</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <p className="text-2xl font-bold">₦{((parseFloat(stats?.totalPlatformBalance || "0")) / 1000000).toFixed(1)}M</p>
                  )}
                </div>
                <Wallet className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">New Users (30 days)</p>
                  {isLoading ? <Skeleton className="h-5 w-8" /> : <p className="font-bold">{stats?.newPatientsLastMonth || 0}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Pending Verifications</p>
                  {isLoading ? <Skeleton className="h-5 w-8" /> : <p className="font-bold">{pendingCenters.length}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Subscriptions</p>
                  {isLoading ? <Skeleton className="h-5 w-8" /> : <p className="font-bold">{stats?.activeSubscriptions || 0}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Open Tickets</p>
                  {isLoading ? <Skeleton className="h-5 w-8" /> : <p className="font-bold">{stats?.openTickets || 0}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="space-y-4">
          <TabsList className="grid grid-cols-7 w-full max-w-4xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="centers">Centers</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                          <Skeleton className="h-6 w-24" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-3 w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                  ) : (
                    <div className="space-y-3">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 py-2">
                          <div className="w-24 flex-shrink-0">
                            {getEntityBadge(log.resourceType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.action}</p>
                            <p className="text-xs text-muted-foreground truncate">{log.resourceId || "System"}</p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">{formatTimeAgo(new Date(log.createdAt))}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Verifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Verifications</CardTitle>
                  <CardDescription>Centers awaiting approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pendingCenters.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending verifications</p>
                  ) : (
                    pendingCenters.map((center) => (
                      <div key={center.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{center.name}</p>
                          <p className="text-sm text-muted-foreground">{center.city}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleCenterAction(center.id, "verify")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleCenterAction(center.id, "suspend")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab - Coming Soon */}
          <TabsContent value="revenue" className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="py-16">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Revenue Management Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Track platform revenue, manage payouts, and view financial reports. This feature is currently under development.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      In Development
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Balance Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Balance</p>
                      <p className="text-2xl font-bold">₦{((parseFloat(stats?.totalPlatformBalance || "0")) / 1000000).toFixed(2)}M</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <Button disabled size="sm" className="w-full mt-4">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Withdraw (Coming Soon)
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Prime Subscriptions</p>
                      <p className="text-2xl font-bold">₦0.00M</p>
                    </div>
                    <Crown className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Test Commissions</p>
                      <p className="text-2xl font-bold">₦0.00M</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Patient Management</CardTitle>
                    <CardDescription>Manage registered patients</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No patients found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users
                      .filter(u => statusFilter === "all" || (statusFilter === "suspended" ? u.suspended : !u.suspended))
                      .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant="outline" className="text-xs">{user.role}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(user.suspended ? "suspended" : "active")}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.suspended ? (
                                <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, "unsuspend")}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleUserStatusChange(user.id, "suspend")} className="text-destructive">
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Centers Tab */}
          <TabsContent value="centers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Diagnostic Centers</CardTitle>
                    <CardDescription>Manage partner diagnostic centers</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search centers..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-40 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : centers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No diagnostic centers found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {centers
                      .filter(c => statusFilter === "all" || c.status === statusFilter)
                      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((center) => (
                      <div key={center.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{center.name}</p>
                            <p className="text-sm text-muted-foreground">{center.city}, {center.state}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              {center.verified ? (
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Unverified
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Rating: {center.rating?.toFixed(1) || "N/A"} ({center.ratingCount || 0} reviews)
                            </p>
                          </div>
                          {getStatusBadge(center.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {!center.verified && (
                                <DropdownMenuItem onClick={() => handleCenterAction(center.id, "verify")}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Verify
                                </DropdownMenuItem>
                              )}
                              {center.status !== "suspended" ? (
                                <DropdownMenuItem onClick={() => handleCenterAction(center.id, "suspend")} className="text-destructive">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : null}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sponsors Tab */}
          <TabsContent value="sponsors" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sponsor Management</CardTitle>
                    <CardDescription>Manage corporate and individual sponsors</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search sponsors..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-40 mb-1" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sponsors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No sponsors found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sponsors
                      .filter(s => statusFilter === "all" || s.status === statusFilter)
                      .filter(s => (s.companyName || s.contactName || "").toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((sponsor) => (
                      <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">{sponsor.companyName || sponsor.contactName || "Unnamed Sponsor"}</p>
                            <p className="text-sm text-muted-foreground">{sponsor.contactEmail}</p>
                            {sponsor.companyType && (
                              <Badge variant="outline" className="text-xs mt-1">{sponsor.companyType}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {sponsor.city && sponsor.state ? `${sponsor.city}, ${sponsor.state}` : "Location not set"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(sponsor.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(sponsor.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {sponsor.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleSponsorVerify(sponsor.id)}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Verify
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Admin Users</CardTitle>
                    <CardDescription>Manage administrator accounts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : adminUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No admin users found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminUsers.map((admin) => {
                      const currentUser = JSON.parse(localStorage.getItem("authUser") || "{}");
                      const isSuperAdmin = currentUser.adminAccessLevel === "super_admin";
                      const isCurrentUser = admin.id === currentUser.id;

                      return (
                        <div key={admin.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{admin.firstName} {admin.lastName}</p>
                              <p className="text-sm text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              admin.adminAccessLevel === "super_admin" ? "default" :
                              admin.adminAccessLevel === "editor" ? "secondary" : "outline"
                            }>
                              {admin.adminAccessLevel === "super_admin" ? (
                                <><Crown className="h-3 w-3 mr-1" /> Super Admin</>
                              ) : admin.adminAccessLevel === "editor" ? (
                                "Editor"
                              ) : (
                                "Read Only"
                              )}
                            </Badge>
                            {admin.suspended ? (
                              <Badge variant="destructive">Suspended</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
                            )}
                            {isSuperAdmin && !isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {admin.suspended ? (
                                    <DropdownMenuItem onClick={() => handleUserStatusChange(admin.id, "unsuspend")}>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Unsuspend
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleUserStatusChange(admin.id, "suspend")} className="text-destructive">
                                      <UserX className="h-4 w-4 mr-2" />
                                      Suspend
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Audit Logs</CardTitle>
                    <CardDescription>System activity and admin actions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchDashboardData} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center p-4 border rounded-lg">
                        <Skeleton className="w-28 h-6" />
                        <div className="flex-1 px-4">
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                        <Skeleton className="w-24 h-8" />
                      </div>
                    ))}
                  </div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No audit logs found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center p-4 border rounded-lg hover:bg-muted/50">
                        <div className="w-28 flex-shrink-0">
                          {getEntityBadge(log.resourceType)}
                        </div>
                        <div className="flex-1 min-w-0 px-4">
                          <p className="font-medium truncate">{log.action}</p>
                          <p className="text-sm text-muted-foreground truncate">{log.resourceId || "System Action"}</p>
                        </div>
                        <div className="w-32 flex-shrink-0 text-right">
                          <p className="text-sm">{formatTimeAgo(new Date(log.createdAt))}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : "System"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <WithdrawDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        availableBalance={stats?.totalPlatformBalance || "0"}
        accountType="admin"
      />

      <AdminSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />

      <InviteAdminDialog
        open={showInviteAdmin}
        onOpenChange={setShowInviteAdmin}
      />

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "Loading..."}
            </DialogDescription>
          </DialogHeader>
          {loadingUserDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Role</p>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Status</p>
                  {getStatusBadge(selectedUser.suspended ? "suspended" : "active")}
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Email Verified</p>
                  <Badge variant={selectedUser.emailVerified ? "default" : "secondary"}>
                    {selectedUser.emailVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Joined</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.lastLoginAt && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase">Last Login</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedUser.lastLoginAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedUser.suspended && selectedUser.suspendedReason && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-medium">Suspension Reason:</span> {selectedUser.suspendedReason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2 pt-4">
                {selectedUser.suspended ? (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleUserStatusChange(selectedUser.id, "unsuspend");
                      setShowUserDetails(false);
                    }}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Activate User
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      handleUserStatusChange(selectedUser.id, "suspend");
                      setShowUserDetails(false);
                    }}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
