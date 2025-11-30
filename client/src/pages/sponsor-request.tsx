import * as React from "react";
import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  HandCoins,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  getPatientSponsorRequest,
  respondToPatientSponsorRequest,
  type PatientSponsorRequest,
} from "@/lib/api/sponsors";

export default function SponsorRequest() {
  const { toast } = useToast();
  const [, params] = useRoute("/sponsor-request/:code");
  const code = params?.code || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<'accepted' | 'declined' | null>(null);
  const [request, setRequest] = useState<PatientSponsorRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch the sponsor test request
  useEffect(() => {
    const fetchRequest = async () => {
      if (!code) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getPatientSponsorRequest(code);
        if (result.success && result.data) {
          setRequest(result.data);
        } else {
          setError(result.error || "Request not found");
        }
      } catch (err) {
        setError("Unable to load request. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [code]);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const result = await respondToPatientSponsorRequest(code, 'accept');
      if (result.success) {
        setResponse('accepted');
        toast({
          title: "Request Accepted!",
          description: "You have agreed to sponsor this health test. The patient will be notified.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept request",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to process your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      const result = await respondToPatientSponsorRequest(code, 'decline');
      if (result.success) {
        setResponse('declined');
        toast({
          title: "Request Declined",
          description: "The patient will be notified of your decision.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to decline request",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to process your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading request...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This sponsorship request doesn't exist or has expired.
            </p>
            <Button asChild>
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Expired state
  if (request.status === 'expired' || new Date() > new Date(request.expiresAt)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Clock className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-semibold mb-2">Request Expired</h2>
            <p className="text-muted-foreground mb-4">
              This sponsorship request has expired. The patient will need to send a new request.
            </p>
            <Button asChild>
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Declined state
  if (response === 'declined' || request.status === 'declined') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Request Declined</h2>
            <p className="text-muted-foreground mb-4">
              You have declined this sponsorship request. {request.patientName} will be notified.
            </p>
            <Button asChild>
              <a href="/">Go to Home</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Accepted state
  if (response === 'accepted' || request.status === 'accepted') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PriveScreenLogo size={32} />
                <h1 className="text-xl font-bold">PriveScreen</h1>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-lg">
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Thank You for Sponsoring!</h2>
              <p className="text-muted-foreground mb-6">
                You have agreed to sponsor {request.patientName}'s health test.
              </p>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Sponsorship Details</CardTitle>
              <CardDescription>Summary of your sponsorship</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Patient: {request.patientName}</p>
                    <p className="text-sm text-muted-foreground">Will receive a test code</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{request.centerName}</p>
                    <p className="text-sm text-muted-foreground">{request.centerLocation}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Test Package</p>
                <p className="font-medium">{request.testPackageName}</p>
                <p className="text-xs text-muted-foreground mt-1">{request.testPackageDescription}</p>
              </div>

              <div className="p-4 border rounded-lg bg-primary/5">
                <p className="text-sm text-muted-foreground mb-1">Amount Sponsored</p>
                <p className="text-2xl font-bold text-primary">₦{parseFloat(request.testPrice).toLocaleString()}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Reference Code</p>
                <p className="font-mono text-lg font-bold">{request.code}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep this for your records
                </p>
              </div>

              <Button className="w-full" asChild>
                <a href="/sponsor">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Go to Sponsor Dashboard
                </a>
              </Button>
            </CardContent>
          </Card>

          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Protected:</strong> You will only see that the test was completed.
              The patient's actual test results remain completely private and confidential.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Pending state - show the request
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <h1 className="text-xl font-bold">PriveScreen</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
            <HandCoins className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Sponsorship Request</h2>
          <p className="text-muted-foreground">
            <strong>{request.patientName}</strong> has requested that you sponsor their health test
          </p>
        </div>

        {request.message && (
          <Card className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <p className="text-sm italic text-center">"{request.message}"</p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                - {request.patientName}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{request.patientName}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Diagnostic Center</p>
                <p className="font-medium">{request.centerName}</p>
                <p className="text-sm text-muted-foreground">{request.centerLocation}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <HandCoins className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Test Package</p>
                <p className="font-medium">{request.testPackageName}</p>
                <p className="text-sm text-muted-foreground">{request.testPackageDescription}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Amount to Sponsor</p>
                <p className="text-2xl font-bold text-primary">₦{parseFloat(request.testPrice).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This covers the full cost of the patient's test
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Request Expires</p>
                <p className="font-medium">{new Date(request.expiresAt).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">
                  Accept before this date to sponsor the test
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Your privacy is protected.</strong> You will only know that the test was completed.
            The patient's actual test results are 100% confidential and will NOT be shared with you.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            onClick={handleAccept}
            className="w-full"
            size="lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Accept & Sponsor Test
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          <Button
            onClick={handleDecline}
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By accepting, you agree to pay for the patient's health screening test.
          You will receive a confirmation and the patient will be notified.
        </p>
      </main>
    </div>
  );
}
