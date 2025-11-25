import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Users, CheckCircle2, Clock, ArrowLeft } from "lucide-react";
import { PurchaseCodesDialog } from "@/components/purchase-codes-dialog";
import { mockSponsoredCodes } from "@/lib/mock-data";

export default function SponsorHome() {
  const [showPurchase, setShowPurchase] = useState(false);
  const sponsoredCodes = mockSponsoredCodes;

  const pendingCodes = sponsoredCodes.filter(c => c.status === 'pending').length;
  const completedCodes = sponsoredCodes.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">PriveScreen</h1>
                <Badge variant="secondary" className="text-xs" data-testid="badge-role">Sponsor Portal</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
        </div>

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

        <Card>
          <CardHeader>
            <CardTitle>Sponsored Assessment Codes</CardTitle>
            <CardDescription>
              Track codes you've purchased and their completion status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sponsoredCodes.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`card-sponsored-${item.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold" data-testid={`text-recipient-${item.id}`}>{item.recipientName}</h3>
                        <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} data-testid={`badge-status-${item.id}`}>
                          {item.status === 'completed' ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-contact-${item.id}`}>{item.recipientContact}</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Test Type</p>
                      <p className="font-medium" data-testid={`text-test-type-${item.id}`}>{item.testType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Code</p>
                      <p className="font-mono font-bold" data-testid={`text-code-${item.id}`}>{item.code}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Sent</p>
                      <p data-testid={`text-sent-${item.id}`}>{item.sentAt.toLocaleDateString()}</p>
                    </div>
                    {item.completedAt && (
                      <div>
                        <p className="text-muted-foreground mb-1">Completed</p>
                        <p data-testid={`text-completed-${item.id}`}>{item.completedAt.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  {item.status === 'completed' && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                      <div className="flex items-center gap-2 text-primary">
                        <Shield className="h-4 w-4" />
                        <span className="font-medium">Privacy Protected</span>
                      </div>
                      <p className="text-muted-foreground mt-1">
                        Test completed. Medical results remain private unless patient chooses to share.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <PurchaseCodesDialog open={showPurchase} onOpenChange={setShowPurchase} />
    </div>
  );
}
