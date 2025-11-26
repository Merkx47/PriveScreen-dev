import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { AssessmentCodeCard } from "@/components/assessment-code-card";
import { PriveScreenLogo } from "@/components/logo";
import { TestResultCard } from "@/components/test-result-card";
import { mockAssessmentCodes, mockTestResults, mockTransactions } from "@/lib/mock-data";
import { format } from "date-fns";

export default function History() {
  const codes = mockAssessmentCodes;
  const results = mockTestResults;
  const transactions = mockTransactions;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild data-testid="button-back">
              <a href="/patient">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">History</h1>
                <p className="text-sm text-muted-foreground">Your activity and records</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="results" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="results" data-testid="tab-results">
              Test Results
              {results.length > 0 && (
                <Badge variant="secondary" className="ml-2">{results.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="codes" data-testid="tab-codes">
              Assessment Codes
              {codes.length > 0 && (
                <Badge variant="secondary" className="ml-2">{codes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              Transactions
              {transactions.length > 0 && (
                <Badge variant="secondary" className="ml-2">{transactions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="results" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Test Results</h2>
              <p className="text-sm text-muted-foreground">{results.length} total</p>
            </div>
            {results.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <PriveScreenLogo size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No test results yet</p>
                  <p className="text-sm">Your anonymous results will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <TestResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assessment Codes</h2>
              <p className="text-sm text-muted-foreground">{codes.length} total</p>
            </div>
            {codes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No assessment codes yet</p>
                  <p className="text-sm">Order a test to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {codes.map((code) => (
                  <AssessmentCodeCard key={code.id} code={code} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <p className="text-sm text-muted-foreground">{transactions.length} total</p>
            </div>
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your wallet activity will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <Card key={txn.id} data-testid={`card-transaction-${txn.id}`}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            txn.type === 'credit'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                              : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                          }`}>
                            {txn.type === 'credit' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium" data-testid={`text-description-${txn.id}`}>
                              {txn.description}
                            </p>
                            <p className="text-sm text-muted-foreground" data-testid={`text-date-${txn.id}`}>
                              {txn.createdAt ? format(new Date(txn.createdAt), 'PPP') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            txn.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} data-testid={`text-amount-${txn.id}`}>
                            {txn.type === 'credit' ? '+' : '-'}₦{txn.amount}
                          </p>
                          <Badge
                            variant={txn.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                            data-testid={`badge-status-${txn.id}`}
                          >
                            {txn.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                        <span>Ref: {txn.reference}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
