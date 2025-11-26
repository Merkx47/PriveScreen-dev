import { useState, useEffect } from "react";
import { useRoute, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ArrowLeft, CheckCircle2, AlertCircle, XCircle, Eye, Shield, Lock } from "lucide-react";
import { mockTestResults, mockDiagnosticCenters, mockTestStandards, mockAssessmentCodes } from "@/lib/mock-data";
import { PriveScreenLogo } from "@/components/logo";
import { ShareResultDialog } from "@/components/share-result-dialog";
import { format } from "date-fns";

export default function ResultDetail() {
  const [, params] = useRoute("/results/:id");
  const searchString = useSearch();
  const [showShare, setShowShare] = useState(false);
  const [hasViewedResults, setHasViewedResults] = useState(false);

  // Check if viewing as sponsor (from URL query param)
  const isSponsorView = searchString.includes("view=sponsor");

  const result = mockTestResults.find(r => r.id === params?.id);
  const center = result ? mockDiagnosticCenters.find(c => c.id === result.diagnosticCenterId) : null;
  const testStandard = result ? mockTestStandards.find(t => t.id === result.testStandardId) : null;

  // Find if this result was from a sponsored test
  const assessmentCode = result ? mockAssessmentCodes.find(c => c.id === result.assessmentCodeId) : null;
  const sponsorInfo = assessmentCode && assessmentCode.sponsorType !== "self" ? {
    name: assessmentCode.sponsorType === "employer" ? "Your Employer" : "Anonymous Sponsor",
    type: assessmentCode.sponsorType,
  } : undefined;

  // Mark results as viewed when patient opens this page (Phase 5: Patient views results first)
  useEffect(() => {
    if (result && !result.viewed) {
      // In a real app, this would call an API to mark as viewed
      setHasViewedResults(true);
    } else if (result?.viewed) {
      setHasViewedResults(true);
    }
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Result Not Found</h2>
            <p className="text-muted-foreground mb-4">This test result does not exist</p>
            <Button asChild>
              <a href="/">Go Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAbnormal = result.results.some(r => r.status === 'abnormal' || r.status === 'borderline');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'borderline':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'abnormal':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="default">Normal</Badge>;
      case 'borderline':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Borderline</Badge>;
      case 'abnormal':
        return <Badge variant="destructive">Abnormal</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild data-testid="button-back">
              <a href={isSponsorView ? "/sponsor" : "/patient"}>
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">{isSponsorView ? "Shared Results" : "Test Results"}</h1>
                <p className="text-sm text-muted-foreground">
                  {isSponsorView ? "Anonymous View (Read Only)" : "Anonymous Results Vault"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Sponsor View Banner */}
        {isSponsorView && (
          <Card className="mb-6 border-muted bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-muted-foreground mb-1">Anonymous Results View</h3>
                  <p className="text-sm text-muted-foreground">
                    You are viewing shared results with the patient's consent.
                    Personal information has been removed to protect privacy.
                    This view is read-only — you cannot download or share these results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consent Notice Banner - Only for patients */}
        {!isSponsorView && !result.viewed && (
          <Card className="mb-6 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Eye className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary mb-1">Your Results Require Your Consent to Share</h3>
                  <p className="text-sm text-muted-foreground">
                    These results are private and belong to you.
                    {sponsorInfo ? (
                      <> Your sponsor ({sponsorInfo.type}) has been notified that your test is complete,
                      but <strong>they cannot see these results unless you explicitly grant consent</strong>.</>
                    ) : (
                      <> No one else can view your medical information without your explicit consent.</>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {hasAbnormal ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                )}
                <div>
                  <CardTitle className="text-2xl">{testStandard?.name}</CardTitle>
                  <CardDescription>Test ID: {result.id.toUpperCase()}</CardDescription>
                </div>
              </div>
              {!result.viewed && (
                <Badge variant="destructive" data-testid="badge-new-result">New</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Test Date</p>
                <p className="font-medium" data-testid="text-test-date">{format(new Date(result.testedAt), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Uploaded</p>
                <p className="font-medium" data-testid="text-upload-date">{format(new Date(result.uploadedAt), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Diagnostic Center</p>
                <p className="font-medium" data-testid="text-center-name">{center?.name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall Status</p>
                <Badge variant={hasAbnormal ? "destructive" : "default"} data-testid="badge-overall-status">
                  {hasAbnormal ? "Attention Required" : "All Normal"}
                </Badge>
              </div>
            </div>

            {/* Only show share/download for patients, not sponsors */}
            {!isSponsorView && (
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setShowShare(true)} data-testid="button-share">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </Button>
                <Button variant="outline" data-testid="button-download">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Parameters & Results</CardTitle>
            <CardDescription>
              All values are compared against standard reference ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.results.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`result-item-${idx}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(item.status)}
                        <h3 className="font-semibold">{item.parameter}</h3>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Your Result</p>
                      <p className="font-mono font-bold text-lg" data-testid={`result-value-${idx}`}>{item.value}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Reference Range</p>
                      <p className="font-mono">{item.referenceRange}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy footer - only for patients */}
        {!isSponsorView && (
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-2 text-primary">Your Results, Your Control</p>
                  <p className="text-muted-foreground mb-2">
                    <strong>You're viewing your personal results.</strong> Anyone else will only see an anonymous version of this result — and <em>only when you give consent</em>.
                  </p>
                  <p className="text-muted-foreground">
                    No one — not sponsors, employers, or partners — can access your medical information without your explicit permission. You decide who sees what, and for how long.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <ShareResultDialog
        open={showShare}
        onOpenChange={setShowShare}
        resultId={result.id}
        sponsorInfo={sponsorInfo}
      />
    </div>
  );
}
