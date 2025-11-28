import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  MapPin,
  Gift,
  User,
  Calendar,
  Shield,
  Heart,
  AlertTriangle,
  Phone,
  ExternalLink,
  XCircle,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCodeValidation } from "@/lib/mock-data";

interface ActivateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "enter" | "preview" | "consent" | "safety" | "activated" | "declined";

// Safety resources - discreet and helpful
const safetyResources = [
  {
    name: "WARIF (Women at Risk International Foundation)",
    phone: "0800 0000 321",
    description: "24/7 confidential support for gender-based violence",
  },
  {
    name: "Mirabel Centre",
    phone: "+234 1 461 9747",
    description: "Free medical, counseling, and legal support",
  },
  {
    name: "NAPTIP Helpline",
    phone: "0800 0000 123",
    description: "National Agency for trafficking and exploitation",
  },
];

// ID types accepted
const acceptedIdTypes = [
  { value: "nin", label: "National Identification Number (NIN)" },
  { value: "bvn", label: "Bank Verification Number (BVN)" },
  { value: "passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "voters_card", label: "Voter's Card" },
  { value: "residence_permit", label: "Residence Permit (for visitors)" },
];

export function ActivateCodeDialog({ open, onOpenChange }: ActivateCodeDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("enter");
  const [isValidating, setIsValidating] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);

  // Simulated validated code data
  const validatedCode = step !== "enter" ? mockCodeValidation : null;

  const handleValidate = () => {
    if (code.length !== 12) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 12-character assessment code",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    // Simulate API validation
    setTimeout(() => {
      setIsValidating(false);
      setStep("preview");
    }, 1000);
  };

  const handleProceedToConsent = () => {
    setStep("consent");
  };

  const handleConsentYes = () => {
    // User confirms voluntary participation
    handleActivate();
  };

  const handleConsentUnsure = () => {
    // Show safety resources without alerting sponsor
    setStep("safety");
  };

  const handleActivate = () => {
    setIsValidating(true);
    // Simulate activation
    setTimeout(() => {
      setIsValidating(false);
      setStep("activated");
      toast({
        title: "Code Activated!",
        description: "Your assessment code is now active. Visit any approved center to take your test.",
      });
    }, 1000);
  };

  const handleDecline = (reason: string) => {
    setDeclineReason(reason);
    setStep("declined");
    // In real app: notify sponsor of decline (without revealing reason if safety-related)
    toast({
      title: "Code Declined",
      description: "The sponsor has been notified. You can request a refund if applicable.",
    });
  };

  const handleClose = () => {
    setCode("");
    setStep("enter");
    setDeclineReason(null);
    onOpenChange(false);
  };

  const handleFindCenter = () => {
    handleClose();
    window.location.href = "/centers";
  };

  const handleLearnAboutSTIs = () => {
    handleClose();
    window.location.href = "/learn";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "enter" && "Activate Assessment Code"}
            {step === "preview" && "Code Details"}
            {step === "consent" && "Before You Continue"}
            {step === "safety" && "Your Safety Matters"}
            {step === "activated" && "Code Activated!"}
            {step === "declined" && "Code Declined"}
          </DialogTitle>
          <DialogDescription>
            {step === "enter" && "Enter the code you received from your sponsor"}
            {step === "preview" && "Review your test details before activating"}
            {step === "consent" && "We want to ensure you're comfortable"}
            {step === "safety" && "Confidential resources for you"}
            {step === "activated" && "You're ready to take your test"}
            {step === "declined" && "The sponsor has been notified"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Enter Code */}
        {step === "enter" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="activation-code">Assessment Code</Label>
              <Input
                id="activation-code"
                placeholder="Enter 12-digit code (e.g., PSN8K2M9L4P7)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                className="font-mono text-lg tracking-wider text-center"
                maxLength={12}
                data-testid="input-activation-code"
              />
              <p className="text-xs text-muted-foreground text-center">
                Check your SMS or email for your assessment code
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sponsored Code</span>
              </div>
              <p className="text-xs text-muted-foreground">
                If you received this code from an employer, NGO, or someone who cares about you,
                activating it will allow you to take a sexual health test at no cost to you.
              </p>
            </div>

            {/* Learn More Link */}
            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={handleLearnAboutSTIs}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Not sure what STI testing involves? Learn more
            </Button>

            <Button
              onClick={handleValidate}
              className="w-full"
              disabled={code.length !== 12 || isValidating}
              data-testid="button-validate-code"
            >
              {isValidating ? "Validating..." : "Validate Code"}
            </Button>
          </div>
        )}

        {/* Step 2: Preview Code Details */}
        {step === "preview" && validatedCode && (
          <div className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">Valid Code</span>
              </div>
              <div className="text-center mb-3">
                <span className="text-2xl font-mono font-bold tracking-widest">{code}</span>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Test Package</p>
                  <p className="font-semibold">{validatedCode.testType}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {validatedCode.testsIncluded.map((test, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {test}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Sponsored By</p>
                  <p className="font-medium">{validatedCode.sponsorType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Valid Until</p>
                  <p className="font-medium">{validatedCode.validUntil.toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Privacy Protected</p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                    Your sponsor will only know when you complete the test.
                    They will NOT see your medical results unless you choose to share.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("enter")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleProceedToConsent}
                className="flex-1"
                data-testid="button-continue-consent"
              >
                Continue
              </Button>
            </div>

            <Separator />

            {/* Decline option */}
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => handleDecline("user_choice")}
            >
              <XCircle className="h-4 w-4 mr-2" />
              I don't want to take this test
            </Button>
          </div>
        )}

        {/* Step 3: Consent Check */}
        {step === "consent" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Choice Matters</h3>
              <p className="text-sm text-muted-foreground">
                Taking an STI test should always be your personal decision.
              </p>
            </div>

            <Card className="p-4 bg-muted/50">
              <p className="text-sm font-medium mb-3">Are you taking this test voluntarily?</p>
              <div className="space-y-2">
                <Button
                  onClick={handleConsentYes}
                  className="w-full justify-start"
                  variant="outline"
                  disabled={isValidating}
                >
                  <CheckCircle2 className="h-4 w-4 mr-3 text-green-600" />
                  Yes, this is my choice
                </Button>
                <Button
                  onClick={handleConsentUnsure}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <HelpCircle className="h-4 w-4 mr-3 text-amber-600" />
                  I'm not sure / I'd like more information
                </Button>
              </div>
            </Card>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                <strong>No pressure, no judgment.</strong> Your response here is completely private
                and will NOT be shared with your sponsor.
              </AlertDescription>
            </Alert>

            <Button variant="ghost" onClick={() => setStep("preview")} className="w-full">
              ← Back to code details
            </Button>
          </div>
        )}

        {/* Step 4: Safety Resources (if user clicks "not sure") */}
        {step === "safety" && (
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Heart className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                We understand. Here are some confidential resources if you need support.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">Confidential Support Lines (Nigeria)</p>
              {safetyResources.map((resource, idx) => (
                <Card key={idx} className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{resource.name}</p>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                    <a
                      href={`tel:${resource.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      {resource.phone}
                    </a>
                  </div>
                </Card>
              ))}
            </div>

            <Separator />

            <div className="space-y-3">
              <p className="text-sm font-medium">Understanding Your Rights</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• You have the right to decide when and if you take a health test</p>
                <p>• No one should pressure, threaten, or force you into testing</p>
                <p>• Testing should be for your benefit, not to control you</p>
                <p>• If you feel unsafe, please reach out to the resources above</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-medium">What would you like to do?</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleConsentYes}
                  variant="outline"
                  className="h-auto py-3"
                  disabled={isValidating}
                >
                  <div className="text-center">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <span className="text-xs">Proceed with test</span>
                  </div>
                </Button>
                <Button
                  onClick={() => handleDecline("needs_time")}
                  variant="outline"
                  className="h-auto py-3"
                >
                  <div className="text-center">
                    <XCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <span className="text-xs">Decline for now</span>
                  </div>
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={() => setStep("consent")} className="w-full">
              ← Back
            </Button>
          </div>
        )}

        {/* Step 5: Activated Success */}
        {step === "activated" && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1">You're All Set!</h3>
              <p className="text-sm text-muted-foreground">
                Your code has been activated. Visit any approved diagnostic center to take your test.
              </p>
            </div>

            <Card className="p-4 bg-muted/50 text-left">
              <h4 className="font-medium mb-2">What to bring:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Your assessment code: <span className="font-mono font-bold">{code}</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Valid ID (any of the following):</span>
                </li>
              </ul>
              <div className="ml-6 mt-2 flex flex-wrap gap-1">
                {acceptedIdTypes.slice(0, 4).map((id) => (
                  <Badge key={id.value} variant="outline" className="text-xs">
                    {id.label.split(' ')[0]}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 ml-6">
                International visitors: Passport or Residence Permit accepted
              </p>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Done
              </Button>
              <Button onClick={handleFindCenter} className="flex-1" data-testid="button-find-center">
                <MapPin className="h-4 w-4 mr-2" />
                Find Center
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Declined */}
        {step === "declined" && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-1">Code Declined</h3>
              <p className="text-sm text-muted-foreground">
                We've notified the sponsor that you've declined this test.
                They may be eligible for a refund.
              </p>
            </div>

            <Card className="p-4 bg-muted/50 text-left">
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> Your health decisions are yours to make.
                If you ever want to get tested on your own terms, you can:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Order a test through your own wallet
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Visit a center directly for anonymous testing
                </li>
              </ul>
            </Card>

            {/* Learn about STIs */}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLearnAboutSTIs}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Learn About STI Testing
            </Button>

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
