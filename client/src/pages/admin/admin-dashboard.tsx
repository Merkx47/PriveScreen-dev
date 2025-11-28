import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  ArrowUpRight,
  Banknote
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { AdminSettingsDialog } from "@/components/admin-settings-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  mockAdminRevenueStats,
  mockAdminRevenue,
  mockAdminWithdrawals,
  mockCenterWithdrawals,
  type AdminRevenueItem
} from "@/lib/mock-data";

// Mock data for admin dashboard
const mockStats = {
  totalPatients: 1247,
  totalCenters: 32,
  totalSponsors: 89,
  totalTests: 3421,
  revenue: 15234000,
  activeSubscriptions: 156,
  pendingVerifications: 5,
  todayTests: 47,
};

const mockPatients = [
  { id: "p1", name: "Adebayo Okonkwo", email: "adebayo@example.com", status: "active", tests: 3, joined: "2024-01-15" },
  { id: "p2", name: "Chioma Nwosu", email: "chioma@example.com", status: "active", tests: 5, joined: "2024-02-20" },
  { id: "p3", name: "Emeka Okafor", email: "emeka@example.com", status: "inactive", tests: 1, joined: "2024-03-10" },
  { id: "p4", name: "Fatima Abubakar", email: "fatima@example.com", status: "active", tests: 2, joined: "2024-04-05" },
  { id: "p5", name: "Oluwaseun Adeyemi", email: "seun@example.com", status: "suspended", tests: 0, joined: "2024-05-12" },
];

const mockCenters = [
  { id: "c1", name: "Lifebridge Medical Diagnostics", city: "Lagos", status: "verified", tests: 450, rating: 4.75 },
  { id: "c2", name: "St. Nicholas Hospital Lab", city: "Lagos", status: "verified", tests: 380, rating: 4.85 },
  { id: "c3", name: "Clina-Lancet Laboratories", city: "Lagos", status: "pending", tests: 0, rating: 0 },
  { id: "c4", name: "Cedarcrest Hospitals", city: "Lagos", status: "verified", tests: 290, rating: 4.70 },
  { id: "c5", name: "New Horizon Labs", city: "Abuja", status: "suspended", tests: 45, rating: 3.20 },
];

const mockSponsors = [
  { id: "s1", name: "TechCorp Nigeria", email: "hr@techcorp.ng", status: "active", codes: 45, spent: 675000 },
  { id: "s2", name: "Health First NGO", email: "admin@healthfirst.org", status: "active", codes: 120, spent: 1800000 },
  { id: "s3", name: "Individual Sponsor", email: "john@email.com", status: "active", codes: 3, spent: 45000 },
  { id: "s4", name: "Corporate Care Ltd", email: "wellness@corpcare.com", status: "inactive", codes: 0, spent: 0 },
];

const mockAuditLogs = [
  { id: "a1", action: "Patient Registration", entity: "Fatima Abubakar", entityType: "patient", timestamp: new Date(Date.now() - 1000 * 60 * 5), admin: null },
  { id: "a2", action: "Center Verified", entity: "Lifebridge Medical", entityType: "center", timestamp: new Date(Date.now() - 1000 * 60 * 30), admin: "Admin User" },
  { id: "a3", action: "Test Completed", entity: "PSN8K2M9L4P7", entityType: "test", timestamp: new Date(Date.now() - 1000 * 60 * 60), admin: null },
  { id: "a4", action: "Sponsor Code Purchase", entity: "TechCorp Nigeria", entityType: "sponsor", timestamp: new Date(Date.now() - 1000 * 60 * 90), admin: null },
  { id: "a5", action: "Patient Suspended", entity: "Oluwaseun Adeyemi", entityType: "patient", timestamp: new Date(Date.now() - 1000 * 60 * 120), admin: "Admin User" },
  { id: "a6", action: "Center Application", entity: "Clina-Lancet Labs", entityType: "center", timestamp: new Date(Date.now() - 1000 * 60 * 180), admin: null },
  { id: "a7", action: "Prime Subscription", entity: "Chioma Nwosu", entityType: "patient", timestamp: new Date(Date.now() - 1000 * 60 * 240), admin: null },
  { id: "a8", action: "Results Uploaded", entity: "center-1", entityType: "center", timestamp: new Date(Date.now() - 1000 * 60 * 300), admin: null },
];

type Tab = "overview" | "revenue" | "patients" | "centers" | "sponsors" | "logs";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const revenueStats = mockAdminRevenueStats;
  const adminRevenue = mockAdminRevenue;
  const adminWithdrawals = mockAdminWithdrawals;
  const centerPayouts = mockCenterWithdrawals;

  const getRevenueBadge = (type: AdminRevenueItem['type']) => {
    switch (type) {
      case 'prime_subscription':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"><Crown className="h-3 w-3 mr-1" />Prime</Badge>;
      case 'test_commission':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><FileText className="h-3 w-3 mr-1" />Test</Badge>;
      case 'center_payout':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><ArrowUpRight className="h-3 w-3 mr-1" />Payout</Badge>;
      case 'withdrawal':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"><Banknote className="h-3 w-3 mr-1" />Withdraw</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleStatusChange = (entityType: string, entityId: string, newStatus: string) => {
    toast({
      title: "Status Updated",
      description: `${entityType} status changed to ${newStatus}`,
    });
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">{mockStats.totalPatients.toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">{mockStats.totalCenters}</p>
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
                  <p className="text-2xl font-bold">{mockStats.totalSponsors}</p>
                </div>
                <Heart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₦{(mockStats.revenue / 1000000).toFixed(1)}M</p>
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
                  <p className="text-xs text-muted-foreground">Tests Today</p>
                  <p className="font-bold">{mockStats.todayTests}</p>
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
                  <p className="font-bold">{mockStats.pendingVerifications}</p>
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
                  <p className="font-bold">{mockStats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Tests</p>
                  <p className="font-bold">{mockStats.totalTests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)} className="space-y-4">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="centers">Centers</TabsTrigger>
            <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
            <TabsTrigger value="logs">Audit Logs</TabsTrigger>
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
                  <div className="space-y-3">
                    {mockAuditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 py-2">
                        <div className="w-24 flex-shrink-0">
                          {getEntityBadge(log.entityType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{log.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{log.entity}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 w-16 text-right">{formatTimeAgo(log.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Verifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Verifications</CardTitle>
                  <CardDescription>Centers awaiting approval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCenters.filter(c => c.status === "pending").map((center) => (
                    <div key={center.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{center.name}</p>
                        <p className="text-sm text-muted-foreground">{center.city}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {mockCenters.filter(c => c.status === "pending").length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending verifications</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            {/* Revenue Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Platform Balance</p>
                      <p className="text-2xl font-bold">₦{(parseFloat(revenueStats.platformBalance) / 1000000).toFixed(2)}M</p>
                    </div>
                    <Wallet className="h-8 w-8 text-primary" />
                  </div>
                  <Button onClick={() => setShowWithdraw(true)} size="sm" className="w-full mt-4">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Prime Subscriptions</p>
                      <p className="text-2xl font-bold">₦{(parseFloat(revenueStats.primeSubscriptions) / 1000000).toFixed(2)}M</p>
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
                      <p className="text-2xl font-bold">₦{(parseFloat(revenueStats.testCommissions) / 1000000).toFixed(2)}M</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pending Payouts</p>
                      <p className="font-bold">₦{parseFloat(revenueStats.pendingPayouts).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Completed Payouts</p>
                      <p className="font-bold">₦{(parseFloat(revenueStats.completedPayouts) / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Transactions</CardTitle>
                  <CardDescription>Recent income and payouts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adminRevenue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="w-20 flex-shrink-0">
                          {getRevenueBadge(item.type)}
                        </div>
                        <div className="flex-1 min-w-0 px-3">
                          <p className="text-sm font-medium truncate">{item.description}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.reference}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-semibold ${parseFloat(item.amount) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {parseFloat(item.amount) < 0 ? '-' : '+'}₦{Math.abs(parseFloat(item.amount)).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Center Payout Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Center Payout Requests</CardTitle>
                  <CardDescription>Withdrawals from diagnostic centers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {centerPayouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">₦{parseFloat(payout.amount).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {payout.bankName} - ****{payout.accountNumber.slice(-4)}
                          </p>
                          <p className="text-xs text-muted-foreground">{payout.accountName}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'processing' ? 'secondary' : 'outline'}>
                            {payout.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {payout.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {payout.processedAt ? payout.processedAt.toLocaleDateString() : payout.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Withdrawals History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Withdrawals</CardTitle>
                <CardDescription>Your withdrawals to bank account</CardDescription>
              </CardHeader>
              <CardContent>
                {adminWithdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No withdrawals yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {adminWithdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="flex items-center p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">₦{parseFloat(withdrawal.amount).toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {withdrawal.bankName} - ****{withdrawal.accountNumber.slice(-4)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={withdrawal.status === 'completed' ? 'default' : 'secondary'}>
                            {withdrawal.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {withdrawal.processedAt?.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockPatients
                    .filter(p => statusFilter === "all" || p.status === statusFilter)
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">{patient.tests} tests</p>
                          <p className="text-xs text-muted-foreground">Joined {patient.joined}</p>
                        </div>
                        {getStatusBadge(patient.status)}
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
                            <DropdownMenuItem onClick={() => handleStatusChange("Patient", patient.id, "active")}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Patient", patient.id, "suspended")} className="text-destructive">
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
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
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockCenters
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
                          <p className="text-sm text-muted-foreground">{center.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">{center.tests} tests</p>
                          <p className="text-xs text-muted-foreground">Rating: {center.rating || "N/A"}</p>
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
                            <DropdownMenuItem onClick={() => handleStatusChange("Center", center.id, "verified")}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Center", center.id, "suspended")} className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sponsors..."
                      className="pl-9 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockSponsors
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((sponsor) => (
                    <div key={sponsor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{sponsor.name}</p>
                          <p className="text-sm text-muted-foreground">{sponsor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm">{sponsor.codes} codes purchased</p>
                          <p className="text-xs text-muted-foreground">₦{sponsor.spent.toLocaleString()} spent</p>
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
                            <DropdownMenuItem onClick={() => handleStatusChange("Sponsor", sponsor.id, "active")}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange("Sponsor", sponsor.id, "inactive")} className="text-destructive">
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockAuditLogs.map((log) => (
                    <div key={log.id} className="flex items-center p-4 border rounded-lg hover:bg-muted/50">
                      <div className="w-28 flex-shrink-0">
                        {getEntityBadge(log.entityType)}
                      </div>
                      <div className="flex-1 min-w-0 px-4">
                        <p className="font-medium truncate">{log.action}</p>
                        <p className="text-sm text-muted-foreground truncate">{log.entity}</p>
                      </div>
                      <div className="w-24 flex-shrink-0 text-right">
                        <p className="text-sm">{formatTimeAgo(log.timestamp)}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.admin ? `by ${log.admin}` : "System"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <WithdrawDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        availableBalance={revenueStats.platformBalance}
        accountType="admin"
      />

      <AdminSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
