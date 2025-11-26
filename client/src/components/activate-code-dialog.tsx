import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin, Gift, User, Calendar, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCodeValidation } from "@/lib/mock-data";

interface ActivateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivateCodeDialog({ open, onOpenChange }: ActivateCodeDialogProps) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enter" | "preview" | "activated">("enter");
  const [isValidating, setIsValidating] = useState(false);

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

  const handleClose = () => {
    setCode("");
    setStep("enter");
    onOpenChange(false);
  };

  const handleFindCenter = () => {
    handleClose();
    window.location.href = "/centers";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "enter" && "Activate Assessment Code"}
            {step === "preview" && "Code Details"}
            {step === "activated" && "Code Activated!"}
          </DialogTitle>
          <DialogDescription>
            {step === "enter" && "Enter the code you received from your sponsor"}
            {step === "preview" && "Review your test details before activating"}
            {step === "activated" && "You're ready to take your test"}
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
                onClick={handleActivate}
                className="flex-1"
                disabled={isValidating}
                data-testid="button-activate-code"
              >
                {isValidating ? "Activating..." : "Activate Code"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Activated Success */}
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
                  <span>Government-issued ID (BVN, NIN, or National ID)</span>
                </li>
              </ul>
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
      </DialogContent>
    </Dialog>
  );
}
