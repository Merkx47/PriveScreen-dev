import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, User, FileText, Calendar, ShieldCheck, Fingerprint, CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCodeValidation } from "@/lib/mock-data";

interface ValidateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

type VerificationStep = "code_valid" | "identity_verification" | "verified";

export function ValidateCodeDialog({ open, onOpenChange, code }: ValidateCodeDialogProps) {
  const { toast } = useToast();
  const codeData = mockCodeValidation;

  const [step, setStep] = useState<VerificationStep>("code_valid");
  const [idType, setIdType] = useState<"bvn" | "nin" | "govt_id">("bvn");
  const [idNumber, setIdNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    name: string;
    matchScore: number;
  } | null>(null);

  const handleProceedToVerification = () => {
    setStep("identity_verification");
  };

  const handleVerifyIdentity = async () => {
    if (!idNumber) {
      toast({
        title: "ID Number Required",
        description: "Please enter the patient's ID number",
        variant: "destructive",
      });
      return;
    }

    // Validate format based on ID type
    if (idType === "bvn" && idNumber.length !== 11) {
      toast({
        title: "Invalid BVN",
        description: "BVN must be exactly 11 digits",
        variant: "destructive",
      });
      return;
    }

    if (idType === "nin" && idNumber.length !== 11) {
      toast({
        title: "Invalid NIN",
        description: "NIN must be exactly 11 digits",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Simulate verification API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock verification result - in production this would call NIBSS/NIMC API
    setVerificationResult({
      verified: true,
      name: codeData.patientName,
      matchScore: 98,
    });

    setIsVerifying(false);
    setStep("verified");
  };

  const handleProceedWithCollection = () => {
    toast({
      title: "Identity Verified",
      description: "You can now proceed with sample collection",
    });
    onOpenChange(false);
    // Reset state for next use
    setStep("code_valid");
    setIdNumber("");
    setVerificationResult(null);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setStep("code_valid");
    setIdNumber("");
    setVerificationResult(null);
  };

  const getIdLabel = () => {
    switch (idType) {
      case "bvn": return "Bank Verification Number (BVN)";
      case "nin": return "National Identification Number (NIN)";
      case "govt_id": return "Government ID Number";
    }
  };

  const getIdPlaceholder = () => {
    switch (idType) {
      case "bvn": return "22012345678";
      case "nin": return "12345678901";
      case "govt_id": return "A12345678";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "code_valid" && "Assessment Code Validation"}
            {step === "identity_verification" && "Identity Verification"}
            {step === "verified" && "Verification Complete"}
          </DialogTitle>
          <DialogDescription>
            {step === "code_valid" && "Code validated successfully. Proceed to verify patient identity."}
            {step === "identity_verification" && "Verify patient identity using BVN, NIN, or government-issued ID"}
            {step === "verified" && "Patient identity has been verified successfully"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Code Valid */}
        {step === "code_valid" && (
          <div className="space-y-6">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary" data-testid="text-status">Valid Code</span>
              </div>
              <div className="text-center mb-2">
                <div className="text-2xl font-mono font-bold tracking-widest" data-testid="text-code-value">
                  {codeData.code}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Patient Name</p>
                  <p className="font-semibold" data-testid="text-patient-name">{codeData.patientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Test Package</p>
                  <p className="font-semibold mb-2">{codeData.testType}</p>
                  <div className="flex flex-wrap gap-1">
                    {codeData.testsIncluded.map((test, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-test-${idx}`}>
                        {test}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
                  <p className="font-medium" data-testid="text-valid-until">{codeData.validUntil.toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Payment Source</span>
                <Badge variant="outline" data-testid="badge-sponsor-type">{codeData.sponsorType}</Badge>
              </div>
            </div>

            <Button onClick={handleProceedToVerification} className="w-full" data-testid="button-proceed-verify">
              <Fingerprint className="h-4 w-4 mr-2" />
              Proceed to Identity Verification
            </Button>
          </div>
        )}

        {/* Step 2: Identity Verification */}
        {step === "identity_verification" && (
          <div className="space-y-6">
            <Card className="p-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Verifying Identity For</p>
                  <p className="font-semibold">{codeData.patientName}</p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Verification Method</Label>
                <RadioGroup value={idType} onValueChange={(v) => setIdType(v as "bvn" | "nin" | "govt_id")}>
                  <div className="grid grid-cols-1 gap-3">
                    <Card
                      className={`p-3 cursor-pointer transition-all ${
                        idType === "bvn" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => setIdType("bvn")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="bvn" id="bvn" />
                        <div className="flex items-center gap-2 flex-1">
                          <CreditCard className="h-5 w-5 text-green-600" />
                          <div>
                            <Label htmlFor="bvn" className="font-medium cursor-pointer">BVN Verification</Label>
                            <p className="text-xs text-muted-foreground">Bank Verification Number (Recommended)</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">Instant</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-3 cursor-pointer transition-all ${
                        idType === "nin" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => setIdType("nin")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="nin" id="nin" />
                        <div className="flex items-center gap-2 flex-1">
                          <Fingerprint className="h-5 w-5 text-blue-600" />
                          <div>
                            <Label htmlFor="nin" className="font-medium cursor-pointer">NIN Verification</Label>
                            <p className="text-xs text-muted-foreground">National Identification Number</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">Instant</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-3 cursor-pointer transition-all ${
                        idType === "govt_id" ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                      }`}
                      onClick={() => setIdType("govt_id")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="govt_id" id="govt_id" />
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="h-5 w-5 text-orange-600" />
                          <div>
                            <Label htmlFor="govt_id" className="font-medium cursor-pointer">Government ID</Label>
                            <p className="text-xs text-muted-foreground">Driver's License, Voter's Card, Int'l Passport</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">Manual</Badge>
                      </div>
                    </Card>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber">{getIdLabel()}</Label>
                <Input
                  id="idNumber"
                  placeholder={getIdPlaceholder()}
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={idType === "govt_id" ? 20 : 11}
                  data-testid="input-id-number"
                />
                {(idType === "bvn" || idType === "nin") && (
                  <p className="text-xs text-muted-foreground">
                    Enter the 11-digit {idType.toUpperCase()} exactly as registered
                  </p>
                )}
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Privacy Notice</p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                Identity verification is required by PriveScreen protocol. The ID number is used only for verification
                and will not be stored with test results. Patient identity remains anonymous in the final report.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("code_valid")} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleVerifyIdentity}
                disabled={isVerifying || !idNumber}
                className="flex-1"
                data-testid="button-verify"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verify Identity
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verified */}
        {step === "verified" && verificationResult && (
          <div className="space-y-6">
            <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                  Identity Verified
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Patient identity has been successfully verified
                </p>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Verified Name</span>
                <span className="font-medium" data-testid="text-verified-name">{verificationResult.name}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Verification Method</span>
                <Badge variant="secondary">{idType.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Match Confidence</span>
                <Badge variant="default" className="bg-green-600">{verificationResult.matchScore}%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Test Package</span>
                <span className="font-medium">{codeData.testType}</span>
              </div>
            </div>

            <div className="bg-muted/30 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Next Steps:</p>
              <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
                <li>• Collect sample following PriveScreen protocols</li>
                <li>• Perform standardized tests as specified</li>
                <li>• Upload results within 48 hours</li>
                <li>• Patient name will NOT appear on final report</li>
              </ul>
            </div>

            <Button onClick={handleProceedWithCollection} className="w-full" data-testid="button-proceed-collection">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Proceed with Sample Collection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
