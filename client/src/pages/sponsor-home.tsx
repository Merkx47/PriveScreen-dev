import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Lock,
  Eye,
  Wallet as WalletIcon,
  Crown,
  Home,
  Gift,
  Building2,
  XCircle,
} from "lucide-react";
import { PurchaseCodesDialog } from "@/components/purchase-codes-dialog";
import { FundWalletDialog } from "@/components/fund-wallet-dialog";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { mockSponsoredCodes, mockWallet, mockDiagnosticCenters, mockSponsorTestRequests, mockTestStandards } from "@/lib/mock-data";

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
  const sponsoredCodes = mockSponsoredCodes;

  const handleDeclineRequest = (requestId: string, patientName: string) => {
    setDeclinedRequests(prev => [...prev, requestId]);
    toast({
      title: "Request Declined",
      description: `You have declined the sponsorship request from ${hashName(patientName)}. They will be notified.`,
    });
  };
  const wallet = mockWallet;
  const walletLoading = false;

  const pendingCodes = sponsoredCodes.filter(c => c.status === 'pending').length;
  const completedCodes = sponsoredCodes.filter(c => c.status === 'completed').length;
  const sharedWithYou = sponsoredCodes.filter(c => c.status === 'completed' && c.sharedWithSponsor).length;

  // Get center info for a code
  const getCenterForCode = (code: typeof sponsoredCodes[0]) => {
    // Mock: assign centers based on code
    const centerIndex = code.id.charCodeAt(code.id.length - 1) % mockDiagnosticCenters.length;
    return mockDiagnosticCenters[centerIndex];
  };

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
              <ThemeToggle />
              <Button variant="ghost" size="icon" data-testid="button-back" asChild>
                <a href="/">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Sponsor Dashboard</h2>
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
              <div className="text-3xl font-bold" data-testid="text-total-codes">{sponsoredCodes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-pending">{pendingCodes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-completed">{completedCodes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results Shared</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary" data-testid="text-shared">{sharedWithYou}</div>
              <p className="text-xs text-muted-foreground mt-1">of {completedCodes} completed</p>
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

        {/* Incoming Sponsorship Requests from Patients */}
        {mockSponsorTestRequests.filter(r => r.status === 'pending' && !declinedRequests.includes(r.id)).length > 0 && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-blue-600" />
                    Incoming Sponsorship Requests
                  </CardTitle>
                  <CardDescription>
                    Patients have requested that you sponsor their tests
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  {mockSponsorTestRequests.filter(r => r.status === 'pending' && !declinedRequests.includes(r.id)).length} Pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSponsorTestRequests.filter(r => r.status === 'pending' && !declinedRequests.includes(r.id)).map((request) => {
                  const center = mockDiagnosticCenters.find(c => c.id === request.centerId);
                  const testPkg = mockTestStandards.find(t => t.id === request.testPackageId);
                  return (
                    <div
                      key={request.id}
                      className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{hashName(request.patientName)}</h3>
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              Awaiting Response
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            Code: {request.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">₦{parseFloat(request.testPrice).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Requested amount</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground">Center</p>
                            <p className="font-medium">{center?.name}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Test Package</p>
                          <p className="font-medium">{testPkg?.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requested</p>
                          <p>{request.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expires</p>
                          <p>{request.expiresAt.toLocaleDateString()}</p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="p-3 bg-background rounded border mb-4">
                          <p className="text-sm italic text-muted-foreground">"{request.message}"</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button size="sm" asChild>
                          <a href={`/sponsor-request/${request.code}`}>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Review & Accept
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id, request.patientName)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sponsored Assessment Codes</CardTitle>
            <CardDescription>
              Track codes you've purchased and their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sponsoredCodes.map((item) => {
                const center = getCenterForCode(item);
                return (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`card-sponsored-${item.id}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Show hashed name: FirstName L*** */}
                          <h3 className="font-semibold" data-testid={`text-recipient-${item.id}`}>
                            {hashName(item.recipientName)}
                          </h3>
                          <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} data-testid={`badge-status-${item.id}`}>
                            {item.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono" data-testid={`text-code-${item.id}`}>
                          Code: {item.code}
                        </p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Test Type</p>
                        <p className="font-medium" data-testid={`text-test-type-${item.id}`}>{item.testType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Sent</p>
                        <p data-testid={`text-sent-${item.id}`}>{item.sentAt.toLocaleDateString()}</p>
                      </div>
                      {item.status === 'completed' && item.completedAt && (
                        <>
                          <div>
                            <p className="text-muted-foreground mb-1">Center</p>
                            <p className="font-medium">{center?.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Test Date</p>
                            <p data-testid={`text-completed-${item.id}`}>{item.completedAt.toLocaleDateString()}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {item.status === 'completed' && (
                      <div className={`mt-3 p-3 rounded-md text-sm ${
                        item.sharedWithSponsor
                          ? 'bg-primary/10 border border-primary/20'
                          : 'bg-muted/50'
                      }`}>
                        {item.sharedWithSponsor ? (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-primary">
                                <Eye className="h-4 w-4" />
                                <span className="font-medium">Results Shared by Patient</span>
                              </div>
                              <Button
                                size="sm"
                                asChild
                                data-testid={`button-view-results-${item.id}`}
                              >
                                <a href={`/results/${item.resultId}?view=sponsor`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Results
                                </a>
                              </Button>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              Patient has granted you access to view their anonymous results.
                            </p>
                            <div className="mt-2 p-2 bg-background rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-muted-foreground">Assessment Code:</span>
                                <span className="font-mono font-semibold">{item.code}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Overall Status:</span>
                                <Badge variant="default">{item.overallStatus}</Badge>
                              </div>
                              {item.shareExpiresAt && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Access expires: {item.shareExpiresAt.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Lock className="h-4 w-4" />
                              <span className="font-medium">Privacy Firewall Active</span>
                            </div>
                            <p className="text-muted-foreground mt-1">
                              Test completed. Patient has not shared medical results with you.
                              You will only see results if the patient grants consent.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>

      <PurchaseCodesDialog open={showPurchase} onOpenChange={setShowPurchase} />
      <FundWalletDialog open={showFundWallet} onOpenChange={setShowFundWallet} />
    </div>
  );
}
