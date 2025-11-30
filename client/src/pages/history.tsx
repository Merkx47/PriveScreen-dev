import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, CheckCircle2, Clock, XCircle, Home, MapPin, Calendar, Crown, Building2, Loader2 } from "lucide-react";
import { AssessmentCodeCard } from "@/components/assessment-code-card";
import { PriveScreenLogo } from "@/components/logo";
import { TestResultCard } from "@/components/test-result-card";
import { format } from "date-fns";
import {
  useMyActiveCodes,
  useMyResults,
  useTransactions,
  useHomeServiceBookings
} from "@/lib/api/hooks";

export default function History() {
  // API hooks
  const { data: codesData, isLoading: codesLoading } = useMyActiveCodes();
  const { data: resultsData, isLoading: resultsLoading } = useMyResults(0, 50);
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(0, 50);
  const { data: bookingsData, isLoading: bookingsLoading } = useHomeServiceBookings();

  const codes = codesData || [];
  const results = resultsData?.content || [];
  const transactions = transactionsData?.content || [];
  const bookings = bookingsData?.content || [];

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="results" data-testid="tab-results">
              Results
              {results.length > 0 && (
                <Badge variant="secondary" className="ml-2">{results.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              Bookings
              {bookings.length > 0 && (
                <Badge variant="secondary" className="ml-2">{bookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="codes" data-testid="tab-codes">
              Codes
              {codes.length > 0 && (
                <Badge variant="secondary" className="ml-2">{codes.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              Wallet
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
            {resultsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                {results.map((result) => (
                  <TestResultCard key={result.id} result={result} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Home Service Bookings
              </h2>
              <p className="text-sm text-muted-foreground">{bookings.length} total</p>
            </div>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No home service bookings yet</p>
                  <p className="text-sm">Book a home sample collection to get started</p>
                  <Button className="mt-4" asChild>
                    <a href="/book-home-service">
                      <Home className="h-4 w-4 mr-2" />
                      Book Home Service
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => {
                  const isUpcoming = new Date(booking.scheduledDate) > new Date();

                  return (
                    <Card key={booking.id} className={isUpcoming ? "border-amber-200 dark:border-amber-800" : ""} data-testid={`card-booking-${booking.id}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                              <Home className="h-4 w-4 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{booking.testName || 'Test'}</h3>
                              <p className="text-sm text-muted-foreground">Home Sample Collection</p>
                            </div>
                          </div>
                          <Badge className={getBookingStatusColor(booking.status)}>
                            {booking.status === 'in_progress' ? 'In Progress' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>
                                {format(new Date(booking.scheduledDate), 'EEEE, MMMM d, yyyy')} at {booking.scheduledTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{booking.centerName || 'Center'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                              <span>{booking.address}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Booked: {format(new Date(booking.createdAt), 'PP')}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">₦{parseFloat(booking.price || '0').toLocaleString()}</span>
                            {booking.status === 'completed' && booking.resultId && (
                              <Button size="sm" variant="outline" asChild>
                                <a href={`/results/${booking.resultId}`}>
                                  View Results
                                </a>
                              </Button>
                            )}
                            {isUpcoming && booking.status === 'confirmed' && (
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="codes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assessment Codes</h2>
              <p className="text-sm text-muted-foreground">{codes.length} total</p>
            </div>
            {codesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : codes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No assessment codes yet</p>
                  <p className="text-sm">Order a test to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {codes.map((code: any) => (
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
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Your wallet activity will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn: any) => (
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
