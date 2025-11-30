import * as React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  CheckCircle2,
  Clock,
  Lock,
  Eye,
  Wallet as WalletIcon,
  Crown,
  Home,
  Gift,
  Building2,
  XCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import { PurchaseCodesDialog } from "@/components/purchase-codes-dialog";
import { FundWalletDialog } from "@/components/fund-wallet-dialog";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  useCurrentUser,
  useWallet,
  useSponsorProfile,
  useSponsorTestRequests,
  useLogout
} from "@/lib/api/hooks";
import { getAuthToken, clearAuthTokens } from "@/lib/api/config";

// Helper to hash name: FirstName L***
function hashName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}***`;
}

export default function SponsorHome() {
  const { toast } = useToast();
  const [showPurchase, setShowPurchase] = useState(false);
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [declinedRequests, setDeclinedRequests] = useState<string[]>([]);

  // Check auth on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      window.location.href = '/auth';
    }
  }, []);

  // API hooks
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: sponsorProfile, isLoading: profileLoading } = useSponsorProfile();
  const { data: testRequests, isLoading: requestsLoading } = useSponsorTestRequests(0, 50);
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuthTokens();
        window.location.href = '/auth';
      },
      onError: () => {
        clearAuthTokens();
        window.location.href = '/auth';
      }
    });
  };

  const handleDeclineRequest = (requestId: string, patientName: string) => {
    setDeclinedRequests(prev => [...prev, requestId]);
    toast({
      title: "Request Declined",
      description: `You have declined the sponsorship request from ${hashName(patientName)}. They will be notified.`,
    });
  };

  // Calculate stats from test requests
  const requests = testRequests?.content || [];
  const totalCodes = requests.reduce((sum, req) => sum + req.totalCodes, 0);
  const usedCodes = requests.reduce((sum, req) => sum + req.usedCodes, 0);
  const pendingCodes = totalCodes - usedCodes;

  // Loading state
  if (userLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sponsor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">PriveScreen</h1>
                <Badge variant="secondary" className="text-xs" data-testid="badge-role">Sponsor Portal</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {sponsorProfile?.companyName || `${user.firstName} ${user.lastName}`}
                </span>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">
            {sponsorProfile?.companyName ? `${sponsorProfile.companyName} Dashboard` : 'Sponsor Dashboard'}
          </h2>
          <p className="text-muted-foreground">Provide sexual health testing while respecting privacy</p>
        </div>

        {/* Wallet + Stats Row */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          {/* Wallet Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <WalletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              ) : (
                <div className="space-y-4">
                  <div className="text-3xl font-bold" data-testid="text-balance">
                    ₦{wallet?.balance || '0.00'}
                  </div>
                  <Button
                    onClick={() => setShowFundWallet(true)}
                    className="w-full"
                    data-testid="button-fund-wallet"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Fund Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Codes Issued</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-total-codes">{totalCodes}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-pending">{pendingCodes}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <div className="text-3xl font-bold" data-testid="text-completed">{usedCodes}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-primary" data-testid="text-shared">
                    {requests.filter(r => r.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">of {requests.length} total</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prime Service Banner */}
        <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  Prime Service
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Premium</Badge>
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to Prime for exclusive benefits including home service tests, priority processing, and dedicated support for your sponsored recipients.
                </p>
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-amber-600" />
                    <span>Home Sample Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Priority Results (12hrs)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span>Dedicated Support</span>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900" asChild>
                  <a href="/get-prime">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Prime
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Purchase Assessment Codes</CardTitle>
            <CardDescription>
              Sponsor sexual health tests for employees, partners, or beneficiaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowPurchase(true)}
              data-testid="button-purchase-codes"
            >
              <Plus className="h-4 w-4 mr-2" />
              Purchase New Codes
            </Button>
          </CardContent>
        </Card>

        {/* Test Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Test Requests</CardTitle>
            <CardDescription>
              Track codes you've purchased and their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Test Requests Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Purchase assessment codes to sponsor health tests for your employees or beneficiaries.
                </p>
                <Button onClick={() => setShowPurchase(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Purchase Codes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`card-request-${request.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{request.title}</h3>
                          <Badge variant={request.status === 'completed' ? 'default' : request.status === 'active' ? 'secondary' : 'destructive'}>
                            {request.status === 'completed' ? 'Completed' : request.status === 'active' ? 'Active' : 'Cancelled'}
                          </Badge>
                        </div>
                        {request.description && (
                          <p className="text-sm text-muted-foreground">{request.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₦{parseFloat(request.totalAmount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{request.currency}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Total Codes</p>
                        <p className="font-medium">{request.totalCodes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Used</p>
                        <p className="font-medium">{request.usedCodes} / {request.totalCodes}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Valid Until</p>
                        <p>{new Date(request.validUntil).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/sponsor/requests/${request.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Codes
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <PurchaseCodesDialog open={showPurchase} onOpenChange={setShowPurchase} />
      <FundWalletDialog open={showFundWallet} onOpenChange={setShowFundWallet} />
    </div>
  );
}
