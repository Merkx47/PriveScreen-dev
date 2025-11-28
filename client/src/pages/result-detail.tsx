import { useState, useEffect } from "react";
import { useRoute, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ArrowLeft, CheckCircle2, AlertCircle, XCircle, Eye, Shield, Lock, Phone, MessageCircle, Calendar, Clock, Info, Stethoscope } from "lucide-react";
import { mockTestResults, mockDiagnosticCenters, mockTestStandards, mockAssessmentCodes } from "@/lib/mock-data";
import { PriveScreenLogo } from "@/components/logo";
import { ShareResultDialog } from "@/components/share-result-dialog";
import { format, addDays } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

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

  // Check if this is an HIV test and if retest reminder should be shown
  const isHIVTest = result.results.some(r =>
    r.parameter.toLowerCase().includes('hiv')
  );
  const hivResult = result.results.find(r =>
    r.parameter.toLowerCase().includes('hiv')
  );
  const isHIVNegative = hivResult && hivResult.status === 'normal';

  // Calculate retest date (90 days from test for window period)
  const retestDate = addDays(new Date(result.testedAt), 90);
  const shouldShowRetestReminder = isHIVTest && isHIVNegative && new Date() < retestDate;

  // Medical interpretation helper
  const getMedicalInterpretation = (parameter: string, status: string, value: string) => {
    const interpretations: Record<string, Record<string, string>> = {
      "HIV 1&2 Antibody": {
        normal: "Your HIV test result is Non-Reactive, meaning no HIV antibodies were detected. If you've had potential exposure within the last 90 days, consider retesting after the window period.",
        abnormal: "Your HIV test result is Reactive. This is a preliminary positive result that requires confirmation testing. Please speak with a healthcare provider for confirmatory testing and counseling.",
      },
      "Hepatitis B Surface Antigen": {
        normal: "Your Hepatitis B test is Negative, indicating no current Hepatitis B infection. Consider vaccination if not already vaccinated.",
        abnormal: "Your Hepatitis B test is Positive, indicating possible current or chronic infection. Please consult a healthcare provider for further evaluation and management.",
      },
      "Hepatitis C Antibody": {
        normal: "Your Hepatitis C test is Negative, indicating no detectable antibodies. No further action needed unless recent exposure.",
        abnormal: "Your Hepatitis C test is Positive. This indicates exposure to Hepatitis C. Further testing (HCV RNA) is needed to confirm active infection.",
      },
      "Syphilis VDRL": {
        normal: "Your Syphilis test is Non-Reactive, indicating no current infection.",
        abnormal: "Your Syphilis test is Reactive. This may indicate current or past infection. Please consult a healthcare provider for confirmatory testing and treatment if needed.",
      },
      "Gonorrhea PCR": {
        normal: "No Gonorrhea detected. Your result is negative.",
        abnormal: "Gonorrhea has been detected. This is a treatable bacterial infection. Please consult a healthcare provider for antibiotic treatment.",
      },
      "Chlamydia PCR": {
        normal: "No Chlamydia detected. Your result is negative.",
        abnormal: "Chlamydia has been detected. This is a treatable bacterial infection. Please consult a healthcare provider for antibiotic treatment.",
      },
    };

    const key = Object.keys(interpretations).find(k =>
      parameter.toLowerCase().includes(k.toLowerCase().split(' ')[0])
    );

    if (key && interpretations[key][status]) {
      return interpretations[key][status];
    }

    // Default interpretations
    if (status === 'normal') {
      return "Your result is within the normal reference range. No immediate action required.";
    } else if (status === 'borderline') {
      return "Your result is at the edge of the normal range. Consider discussing with a healthcare provider.";
    } else {
      return "Your result is outside the normal range. Please consult a healthcare provider for guidance.";
    }
  };

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

        {/* Talk to Clinician - Only show for abnormal results */}
        {!isSponsorView && hasAbnormal && (
          <Card className="mb-6 border-rose-200 bg-rose-50 dark:bg-rose-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full">
                  <Stethoscope className="h-6 w-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-rose-800 dark:text-rose-200 mb-2">
                    Speak with a Healthcare Professional
                  </h3>
                  <p className="text-sm text-rose-700 dark:text-rose-300 mb-4">
                    Your results indicate some values that need attention. We recommend speaking with a qualified
                    healthcare professional who can explain your results and discuss next steps.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="default" className="bg-rose-600 hover:bg-rose-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Clinician Hotline
                    </Button>
                    <Button variant="outline" className="border-rose-300 text-rose-700 hover:bg-rose-100">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat with Counselor
                    </Button>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-3">
                    All conversations are confidential and HIPAA-compliant.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* HIV Retest Reminder */}
        {!isSponsorView && shouldShowRetestReminder && (
          <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    HIV Window Period Reminder
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                    Your HIV test was negative, but if you've had recent potential exposure, antibodies may not
                    yet be detectable. The window period for standard HIV tests is up to 90 days.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg mb-3">
                    <Clock className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Recommended Retest Date
                      </p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100">
                        {format(retestDate, 'MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    <Calendar className="h-4 w-4 mr-2" />
                    Set Retest Reminder
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  <div className="grid sm:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground mb-1">Your Value</p>
                      <p className="font-mono font-bold text-lg" data-testid={`result-value-${idx}`}>
                        {item.value}
                        {item.unit && <span className="text-sm font-normal text-muted-foreground ml-1">{item.unit}</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Reference Range</p>
                      <p className="font-mono">{item.referenceRange}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Interpretation</p>
                      <p className={`font-semibold ${
                        item.status === 'normal' ? 'text-primary' :
                        item.status === 'borderline' ? 'text-yellow-600' :
                        'text-destructive'
                      }`}>
                        {item.interpretation || (item.status === 'normal' ? 'Normal' : item.status === 'borderline' ? 'Borderline' : 'Abnormal')}
                      </p>
                    </div>
                  </div>

                  {/* Medical Interpretation */}
                  <Separator className="my-3" />
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        What This Means
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getMedicalInterpretation(item.parameter, item.status, item.value)}
                      </p>
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
