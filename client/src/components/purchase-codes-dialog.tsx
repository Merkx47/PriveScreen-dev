import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ShieldCheck, AlertTriangle, Edit2, Info, Heart, MapPin, Star, ArrowLeft, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockTestStandards, mockDiagnosticCenters, getCenterTestPrice } from "@/lib/mock-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PurchaseCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "select-center" | "form" | "confirmation";

export function PurchaseCodesDialog({ open, onOpenChange }: PurchaseCodesDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("select-center");
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [testType, setTestType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [acceptedConfidentiality, setAcceptedConfidentiality] = useState(false);
  const tests = mockTestStandards;
  const centers = mockDiagnosticCenters;

  const selectedCenterData = centers.find(c => c.id === selectedCenter);

  // Get center-specific price for a test
  const getTestPrice = (testStandardId: string): string => {
    if (!selectedCenter) return "0";
    const centerPrice = getCenterTestPrice(selectedCenter, testStandardId);
    return centerPrice || tests.find(t => t.id === testStandardId)?.price || "0";
  };

  const selectedTest = tests.find(t => t.id === testType);
  const testPrice = testType ? parseFloat(getTestPrice(testType)) : 0;
  const totalAmount = testPrice * parseInt(quantity || "1");

  const handlePurchase = () => {
    if (!firstName || !lastName || !recipientContact || !testType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!acceptedConfidentiality) {
      toast({
        title: "Confidentiality Required",
        description: "Please accept the confidentiality statement to proceed",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation before sending
    if (step === "form") {
      setStep("confirmation");
      return;
    }

    toast({
      title: "Codes Purchased",
      description: `Assessment code for ${selectedCenterData?.name} sent to ${recipientContact}. Valid for 72 hours.`,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep("select-center");
    setSelectedCenter(null);
    setFirstName("");
    setLastName("");
    setRecipientContact("");
    setTestType("");
    setQuantity("1");
    setAcceptedConfidentiality(false);
  };

  const handleCenterSelect = (centerId: string) => {
    setSelectedCenter(centerId);
    setStep("form");
  };

  const handleBack = () => {
    if (step === "confirmation") {
      setStep("form");
    } else if (step === "form") {
      setStep("select-center");
      setTestType("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "select-center" ? "Select Diagnostic Center" : "Purchase Assessment Codes"}
          </DialogTitle>
          <DialogDescription>
            {step === "select-center"
              ? "Choose a diagnostic center to view their pricing"
              : `Pricing from ${selectedCenterData?.name}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "select-center" ? (
            /* Step 1: Center Selection */
            <div className="space-y-4">
              {/* Voluntary Testing Reminder */}
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <Heart className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Reminder:</span> Testing should always be voluntary.
                  By sending this code, you're offering support - not imposing a requirement.
                </AlertDescription>
              </Alert>

              <Label className="text-base font-semibold">Select Diagnostic Center</Label>
              <p className="text-sm text-muted-foreground">
                Choose where the recipient will take their test. Prices vary by center.
              </p>
              <div className="space-y-3">
                {centers.map((center) => (
                  <Card
                    key={center.id}
                    className="cursor-pointer transition-all hover-elevate hover:border-primary/50"
                    onClick={() => handleCenterSelect(center.id)}
                    data-testid={`card-center-${center.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{center.name}</h3>
                            {center.verified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{center.address}, {center.city}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                              {center.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {center.hours}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Pricing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : step === "confirmation" ? (
            /* Step 3: Confirmation View */
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <h4 className="font-semibold">Review Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Center:</span>
                    <span className="font-medium">{selectedCenterData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient:</span>
                    <span className="font-medium">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{recipientContact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Test:</span>
                    <span className="font-medium">{selectedTest?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-lg">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="w-full mt-2"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
              </div>

              {/* Expiration Notice */}
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Code Expiration:</span> This assessment code will be valid for
                  <span className="font-bold"> 72 hours</span> from the time of purchase.
                  After expiration, the recipient will need a new code.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="flex-1"
                  data-testid="button-confirm-send"
                >
                  Confirm & Send
                </Button>
              </div>
            </div>
          ) : (
            /* Step 2: Form View */
            <div className="space-y-4">
              {/* Back Button and Selected Center Info */}
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Change Center
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedCenterData?.name}</span>
                </div>
              </div>

              <Separator />

              {/* Voluntary Testing Reminder */}
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <Heart className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Reminder:</span> Testing should always be voluntary.
                  By sending this code, you're offering support - not imposing a requirement.
                  The recipient has the right to decline.
                </AlertDescription>
              </Alert>

              {/* First Name and Last Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientContact">Recipient Contact (Email or Phone)</Label>
                <Input
                  id="recipientContact"
                  placeholder="email@example.com or +234 XXX XXX XXXX"
                  value={recipientContact}
                  onChange={(e) => setRecipientContact(e.target.value)}
                  data-testid="input-recipient-contact"
                />
                <p className="text-xs text-muted-foreground">
                  Code will be sent to this email or phone number
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select Test Package</Label>
                <div className="space-y-3">
                  {tests.map((test) => {
                    const centerPrice = getTestPrice(test.id);
                    return (
                      <Card
                        key={test.id}
                        className={`cursor-pointer p-4 transition-all hover-elevate ${
                          testType === test.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setTestType(test.id)}
                        data-testid={`card-test-${test.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{test.name}</h3>
                            <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                              {test.testsIncluded.map((item, idx) => (
                                <li key={idx} className="flex gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Badge variant="secondary" className="text-base font-semibold">
                            ₦{parseFloat(centerPrice).toLocaleString()}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  data-testid="input-quantity"
                />
              </div>

              {selectedTest && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Center:</span>
                    <span className="font-medium text-foreground">{selectedCenterData?.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold">
                      ₦{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quantity} × {selectedTest.name} @ ₦{testPrice.toLocaleString()} each
                  </p>
                </div>
              )}

              <Separator />

              {/* Confidentiality Statement */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <h4 className="font-semibold text-sm">Confidentiality Agreement</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      By sending this assessment code, I acknowledge that:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                      <li>• The recipient's test results are their private medical information</li>
                      <li>• I will only receive notification that testing was completed, not the results</li>
                      <li>• I will not pressure or coerce the recipient to share their results</li>
                      <li>• Medical results can only be shared with the recipient's explicit consent</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confidentiality"
                    checked={acceptedConfidentiality}
                    onCheckedChange={(checked) => setAcceptedConfidentiality(checked as boolean)}
                  />
                  <Label
                    htmlFor="confidentiality"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    I accept the confidentiality agreement
                  </Label>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                className="w-full"
                disabled={!testType || !acceptedConfidentiality || !firstName || !lastName || !recipientContact}
                data-testid="button-confirm-purchase"
              >
                Review & Purchase
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
