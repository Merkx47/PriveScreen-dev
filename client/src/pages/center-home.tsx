import * as React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  CheckCircle2,
  Upload,
  ArrowLeft,
  Settings,
  Wallet,
  TrendingUp,
  Home,
  Award,
  ArrowDownToLine,
  Clock,
  FileText,
  LogOut
} from "lucide-react";
import { ValidateCodeDialog } from "@/components/validate-code-dialog";
import { CenterPricingDialog } from "@/components/center-pricing-dialog";
import { WithdrawDialog } from "@/components/withdraw-dialog";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser, useMyCenter, useCenterResults, useLogout } from "@/lib/api/hooks";
import { getAuthToken } from "@/lib/api/config";

type RevenueType = 'test' | 'home_service' | 'prime_referral';

export default function CenterHome() {
  const [, setLocation] = useLocation();
  const [codeInput, setCodeInput] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // Check auth
  useEffect(() => {
    if (!getAuthToken()) {
      setLocation('/auth/center');
    }
  }, [setLocation]);

  // API queries
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: center, isLoading: centerLoading } = useMyCenter();
  const { data: resultsData, isLoading: resultsLoading } = useCenterResults(0, 10);
  const logoutMutation = useLogout();

  const recentTests = resultsData?.content || [];

  // Mock wallet data (would come from API in production)
  const wallet = {
    balance: '425750.00',
    totalEarnings: '1250000.00',
    currency: 'NGN'
  };

  // Mock revenue data (would come from API in production)
  const revenue: { id: string; type: RevenueType; description: string; amount: string; patientCode: string; date: Date }[] = [
    { id: 'rev-1', type: 'test', description: 'Comprehensive STI Panel', amount: '14500.00', patientCode: 'PSN3X7Y2Q9W5', date: new Date(Date.now() - 2 * 86400000) },
    { id: 'rev-2', type: 'home_service', description: 'Home Service - HIV & Hepatitis Screening', amount: '20800.00', patientCode: 'PSN8K2M9L4P7', date: new Date(Date.now() - 3 * 86400000) },
  ];

  // Mock withdrawals
  const withdrawals: { id: string; amount: string; bankName: string; accountNumber: string; status: string; createdAt: Date; processedAt?: Date }[] = [];

  // Calculate revenue stats
  const testRevenue = revenue.filter(r => r.type === 'test').reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const homeServiceRevenue = revenue.filter(r => r.type === 'home_service').reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const referralRevenue = revenue.filter(r => r.type === 'prime_referral').reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const getRevenueBadge = (type: RevenueType) => {
    switch (type) {
      case 'test':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"><FileText className="h-3 w-3 mr-1" />Test</Badge>;
      case 'home_service':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"><Home className="h-3 w-3 mr-1" />Home</Badge>;
      case 'prime_referral':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"><Award className="h-3 w-3 mr-1" />Referral</Badge>;
    }
  };

  const handleValidate = () => {
    if (!codeInput) return;
    setShowValidate(true);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation('/');
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString('en-NG', { minimumFractionDigits: 2 });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                {centerLoading ? (
                  <Skeleton className="h-6 w-48" />
                ) : (
                  <h1 className="text-xl font-bold">{center?.name || 'Diagnostic Center'}</h1>
                )}
                <Badge variant="secondary" className="text-xs" data-testid="badge-role">Diagnostic Center</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {center?.verified && (
                <Badge variant="default" className="px-3 py-1" data-testid="badge-verified">Verified</Badge>
              )}
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
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
          <h2 className="text-3xl font-semibold mb-2">Diagnostic Center Portal</h2>
          <p className="text-muted-foreground">Validate assessment codes, upload results, and manage earnings</p>
        </div>

        {/* Wallet & Stats Row */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Card className="md:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Available Balance
                </CardTitle>
                <Badge variant="outline" className="text-xs">NGN</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                ₦{formatBalance(wallet.balance)}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowWithdraw(true)} className="flex-1">
                  <ArrowDownToLine className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Total Earnings: ₦{formatBalance(wallet.totalEarnings)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Test Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₦{testRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">From walk-in tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Home Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">₦{homeServiceRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Home collection fees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">₦{referralRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Prime referral bonus</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Validate Assessment Code</CardTitle>
              <CardDescription>
                Verify patient code before sample collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 12-digit code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-wider"
                  maxLength={12}
                  data-testid="input-assessment-code"
                />
                <Button
                  onClick={handleValidate}
                  disabled={codeInput.length !== 12}
                  data-testid="button-validate-code"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Validate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the patient's assessment code to verify their test package and identity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Submit structured test results to platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                data-testid="button-upload-results"
                asChild
              >
                <a href="/center/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Results
                </a>
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Full-screen form for entering test results with document upload
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Services</CardTitle>
              <CardDescription>
                Set your tests, packages and prices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                data-testid="button-manage-services"
                onClick={() => setShowPricing(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure Pricing
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Customize your test offerings and set competitive prices
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Revenue & Tests */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue History
            </TabsTrigger>
            <TabsTrigger value="tests">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Recent Tests
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Withdrawals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue History</CardTitle>
                <CardDescription>
                  Your earnings from tests, home services, and referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No revenue yet</p>
                    <p className="text-sm">Your earnings will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revenue.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="w-24 flex-shrink-0">
                          {getRevenueBadge(item.type)}
                        </div>
                        <div className="flex-1 min-w-0 px-4">
                          <p className="font-medium truncate">{item.description}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            Code: {item.patientCode}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-green-600">+₦{parseFloat(item.amount).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{item.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tests">
            <Card>
              <CardHeader>
                <CardTitle>Recent Tests Processed</CardTitle>
                <CardDescription>
                  Tests conducted at your facility in the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : recentTests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tests processed yet</p>
                    <p className="text-sm">Completed tests will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTests.map((test: any) => (
                      <div
                        key={test.id}
                        className="p-4 border rounded-lg"
                        data-testid={`card-test-${test.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">Code: {test.assessmentCode?.code || 'N/A'}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Result #: {test.resultNumber}
                            </p>
                          </div>
                          <Badge variant="default">Completed</Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Test Type</p>
                            <p className="font-medium">{test.testStandard?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Test Date</p>
                            <p>{new Date(test.testedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>
                  Your past withdrawal requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowDownToLine className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No withdrawals yet</p>
                    <p className="text-sm">Your withdrawal history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
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
                          <Badge variant={withdrawal.status === 'completed' ? 'default' : withdrawal.status === 'processing' ? 'secondary' : 'outline'}>
                            {withdrawal.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {withdrawal.status === 'processing' && <Clock className="h-3 w-3 mr-1" />}
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString() : new Date(withdrawal.createdAt).toLocaleDateString()}
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

      <ValidateCodeDialog
        open={showValidate}
        onOpenChange={setShowValidate}
        code={codeInput}
      />

      <CenterPricingDialog
        open={showPricing}
        onOpenChange={setShowPricing}
      />

      <WithdrawDialog
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        availableBalance={wallet.balance}
        accountType="center"
      />
    </div>
  );
}
