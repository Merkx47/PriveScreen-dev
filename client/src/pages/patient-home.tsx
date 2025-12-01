import * as React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet as WalletIcon,
  Plus,
  FileText,
  MapPin,
  History,
  Gift,
  Crown,
  Home,
  Clock,
  CheckCircle2,
  BookOpen,
  HandCoins,
  LogOut
} from "lucide-react";
import { FundWalletDialog } from "@/components/fund-wallet-dialog";
import { PriveScreenLogo } from "@/components/logo";
import { OrderTestDialog } from "@/components/order-test-dialog";
import { ActivateCodeDialog } from "@/components/activate-code-dialog";
import { RequestSponsorDialog } from "@/components/request-sponsor-dialog";
import { AssessmentCodeCard } from "@/components/assessment-code-card";
import { TestResultCard } from "@/components/test-result-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser, useWallet, useMyActiveCodes, useMyResults, useLogout } from "@/lib/api/hooks";
import { getAuthToken } from "@/lib/api/config";

export default function PatientHome() {
  const [, setLocation] = useLocation();
  const [showFundWallet, setShowFundWallet] = useState(false);
  const [showOrderTest, setShowOrderTest] = useState(false);
  const [showActivateCode, setShowActivateCode] = useState(false);
  const [showRequestSponsor, setShowRequestSponsor] = useState(false);

  // API queries
  const { data: user, isLoading: userLoading } = useCurrentUser();

  // Check auth and role
  useEffect(() => {
    if (!getAuthToken()) {
      setLocation('/auth/patient');
      return;
    }
    // Verify user role matches this portal
    if (user && user.role !== 'patient') {
      // Redirect to correct portal based on role
      const roleRedirects: Record<string, string> = {
        sponsor: '/sponsor',
        center_owner: '/center',
        admin: '/admin'
      };
      setLocation(roleRedirects[user.role] || '/auth/patient');
    }
  }, [setLocation, user]);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: codes, isLoading: codesLoading } = useMyActiveCodes();
  const { data: resultsData, isLoading: resultsLoading } = useMyResults(0, 10);
  const logoutMutation = useLogout();

  const results = resultsData?.content || [];
  const activeCode = codes?.find(c => c.status === 'pending');
  const newResults = results.filter(r => !r.viewed);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/auth/patient');
  };

  // Format wallet balance
  const formatBalance = (balance: string | undefined) => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    return num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
                <Badge variant="secondary" className="text-xs" data-testid="badge-role">Patient</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.firstName} {user.lastName}
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
          {userLoading ? (
            <Skeleton className="h-10 w-64 mb-2" />
          ) : (
            <h2 className="text-3xl font-semibold mb-2">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'there'}
            </h2>
          )}
          <p className="text-muted-foreground">Your private sexual health dashboard</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <WalletIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <Skeleton className="h-10 w-32" />
              ) : (
                <div className="space-y-4">
                  <div className="text-3xl font-bold" data-testid="text-balance">
                    ₦{formatBalance(wallet?.balance)}
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

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with sexual health testing</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                onClick={() => setShowOrderTest(true)}
                data-testid="button-order-test"
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Order Test</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2 border-primary/50 bg-primary/5"
                onClick={() => setShowActivateCode(true)}
                data-testid="button-activate-code"
              >
                <Gift className="h-6 w-6 text-primary" />
                <span className="text-sm">Activate Code</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 px-2 flex-col gap-2 border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                onClick={() => setShowRequestSponsor(true)}
                data-testid="button-request-sponsor"
              >
                <HandCoins className="h-6 w-6 text-blue-600" />
                <span className="text-sm whitespace-nowrap">Request Sponsor</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                asChild
                data-testid="button-find-center"
              >
                <a href="/centers?from=patient">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Find Center</span>
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                asChild
                data-testid="button-learn"
              >
                <a href="/learn">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm">Learn</span>
                </a>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-6 flex-col gap-2"
                asChild
                data-testid="button-history"
              >
                <a href="/history">
                  <History className="h-6 w-6" />
                  <span className="text-sm">View History</span>
                </a>
              </Button>
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
                  Get tested from the comfort of your home. Our certified phlebotomists come to you for sample collection with complete privacy.
                </p>
                <div className="flex flex-wrap gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-amber-600" />
                    <span>Home Sample Collection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span>Results in 12hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    <span>100% Privacy</span>
                  </div>
                </div>
                <Button variant="outline" className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900" asChild>
                  <a href="/book-home-service">
                    <Crown className="h-4 w-4 mr-2" />
                    Book Home Service
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {newResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">New Test Results</h3>
              <Badge variant="destructive" data-testid="badge-new-results">{newResults.length} New</Badge>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {newResults.map((result) => (
                <TestResultCard key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}

        {activeCode && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Active Assessment Code</h3>
            <AssessmentCodeCard code={activeCode} />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">My Assessment Codes</h3>
              {codes && codes.length > 0 && (
                <Badge variant="secondary" data-testid="badge-codes-count">{codes.length}</Badge>
              )}
            </div>
            {codesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : !codes || codes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No assessment codes yet</p>
                  <p className="text-sm">Order a test to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {codes.slice(0, 3).map((code) => (
                  <AssessmentCodeCard key={code.id} code={code} compact />
                ))}
                {codes.length > 3 && (
                  <Button variant="outline" className="w-full" asChild data-testid="button-view-all-codes">
                    <a href="/codes">View All Codes</a>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Recent Results</h3>
              {results.length > 0 && (
                <Badge variant="secondary" data-testid="badge-results-count">{results.length}</Badge>
              )}
            </div>
            {resultsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : results.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <PriveScreenLogo size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Your anonymous results will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.slice(0, 3).map((result) => (
                  <TestResultCard key={result.id} result={result} compact />
                ))}
                {results.length > 3 && (
                  <Button variant="outline" className="w-full" asChild data-testid="button-view-all-results">
                    <a href="/results">View All Results</a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <FundWalletDialog open={showFundWallet} onOpenChange={setShowFundWallet} />
      <OrderTestDialog open={showOrderTest} onOpenChange={setShowOrderTest} />
      <ActivateCodeDialog open={showActivateCode} onOpenChange={setShowActivateCode} />
      <RequestSponsorDialog open={showRequestSponsor} onOpenChange={setShowRequestSponsor} />
    </div>
  );
}
