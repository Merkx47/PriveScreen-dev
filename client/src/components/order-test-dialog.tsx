import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Info, Home, Building2, Clock, AlertCircle, Plus, Minus, MapPin, Star, ArrowLeft, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TestStandard, DiagnosticCenter } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { mockTestStandards, sexualWellnessAddOns, mockDiagnosticCenters, getCenterTestPrice } from "@/lib/mock-data";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface OrderTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TestingMode = "center" | "at-home";
type Step = "select-center" | "select-test";

export function OrderTestDialog({ open, onOpenChange }: OrderTestDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("select-center");
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [testingMode, setTestingMode] = useState<TestingMode>("center");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [showWindowPeriodInfo, setShowWindowPeriodInfo] = useState(false);
  const tests = mockTestStandards;
  const centers = mockDiagnosticCenters;
  const isLoading = false;

  // Get center-specific price for a test
  const getTestPrice = (testStandardId: string): string => {
    if (!selectedCenter) return "0";
    const centerPrice = getCenterTestPrice(selectedCenter, testStandardId);
    return centerPrice || tests.find(t => t.id === testStandardId)?.price || "0";
  };

  // Calculate total price
  const selectedTestData = tests.find(t => t.id === selectedTest);
  const addOnTotal = selectedAddOns.reduce((sum, addonId) => {
    const addon = sexualWellnessAddOns.find(a => a.id === addonId);
    return sum + (addon ? parseFloat(addon.price) : 0);
  }, 0);
  const testPrice = selectedTest ? parseFloat(getTestPrice(selectedTest)) : 0;
  const totalPrice = testPrice + addOnTotal;

  const selectedCenterData = centers.find(c => c.id === selectedCenter);

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const orderMutation = {
    mutate: (testStandardId: string) => {
      const test = tests.find(t => t.id === testStandardId);
      const center = centers.find(c => c.id === selectedCenter);
      const modeLabel = testingMode === "at-home" ? "At-Home Service" : center?.name;
      toast({
        title: "Test Ordered",
        description: `Assessment code generated for ${test?.name} at ${modeLabel}`,
      });
      onOpenChange(false);
      resetForm();
    },
    isPending: false,
  };

  const resetForm = () => {
    setStep("select-center");
    setSelectedCenter(null);
    setSelectedTest(null);
    setSelectedAddOns([]);
    setTestingMode("center");
  };

  const handleOrder = () => {
    if (selectedTest) {
      orderMutation.mutate(selectedTest);
    }
  };

  const handleCenterSelect = (centerId: string) => {
    setSelectedCenter(centerId);
    setStep("select-test");
  };

  const handleBack = () => {
    setStep("select-center");
    setSelectedTest(null);
    setSelectedAddOns([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === "select-center" ? "Select Diagnostic Center" : "Order Sexual Health Test"}
          </DialogTitle>
          <DialogDescription>
            {step === "select-center"
              ? "Choose a diagnostic center to view their pricing and available tests"
              : `Pricing from ${selectedCenterData?.name}`
            }
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : step === "select-center" ? (
          /* Step 1: Center Selection */
          <div className="space-y-4">
            {/* Testing Mode Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Testing Mode</Label>
              <RadioGroup
                value={testingMode}
                onValueChange={(value) => setTestingMode(value as TestingMode)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="center"
                    id="center"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="center"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Building2 className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Diagnostic Center</span>
                    <span className="text-xs text-muted-foreground mt-1">Visit a center near you</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="at-home"
                    id="at-home"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="at-home"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Home className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">At-Home Service</span>
                    <span className="text-xs text-muted-foreground mt-1">Sample collection at home</span>
                  </Label>
                </div>
              </RadioGroup>
              {testingMode === "at-home" && (
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                  A certified phlebotomist will visit your location for sample collection. Additional logistics fee may apply based on your area.
                </p>
              )}
            </div>

            <Separator />

            {/* Center Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {testingMode === "at-home" ? "Select Center for Sample Processing" : "Select Diagnostic Center"}
              </Label>
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
          </div>
        ) : (
          /* Step 2: Test Selection */
          <div className="space-y-6">
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

            {/* Test Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Test Type</Label>
              {tests.map((test) => {
                const hasWindowInfo = (test as any).hasWindowPeriodInfo;
                const windowDays = (test as any).windowPeriodDays;
                const isDefault = (test as any).isDefault;
                const centerPrice = getTestPrice(test.id);

                return (
                  <Card
                    key={test.id}
                    className={`cursor-pointer transition-all hover-elevate ${
                      selectedTest === test.id ? 'ring-2 ring-primary' : ''
                    } ${isDefault ? 'border-primary/50' : ''}`}
                    onClick={() => setSelectedTest(test.id)}
                    data-testid={`card-test-${test.id}`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{test.name}</CardTitle>
                          {isDefault && (
                            <Badge variant="default" className="text-xs">Recommended</Badge>
                          )}
                          {hasWindowInfo && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowWindowPeriodInfo(!showWindowPeriodInfo);
                                    }}
                                    className="inline-flex items-center justify-center"
                                  >
                                    <Info className="h-4 w-4 text-amber-500" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="font-semibold mb-1">HIV Window Period Info</p>
                                  <p className="text-sm">
                                    This test can detect HIV as early as {windowDays} days after exposure.
                                    Standard antibody tests may take up to 90 days to detect infection.
                                    If you've had recent exposure, this test provides earlier detection.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <CardDescription className="mt-1">{test.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-lg font-semibold whitespace-nowrap">
                        ₦{parseFloat(centerPrice).toLocaleString()}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">What's Included:</p>
                        <ul className="grid grid-cols-2 gap-2">
                          {test.testsIncluded.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        {test.turnaroundTime && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                            <Clock className="h-4 w-4" />
                            <span>Results in: {test.turnaroundTime}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Separator />

            {/* Sexual Wellness Add-Ons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-base font-semibold">Sexual Wellness Add-Ons</Label>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Enhance your screening with additional wellness tests
              </p>
              <div className="space-y-2">
                {sexualWellnessAddOns.map((addon) => (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAddOns.includes(addon.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={addon.id}
                        checked={selectedAddOns.includes(addon.id)}
                        onCheckedChange={() => toggleAddOn(addon.id)}
                      />
                      <div>
                        <Label htmlFor={addon.id} className="font-medium cursor-pointer">
                          {addon.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{addon.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {addon.turnaroundTime}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      +₦{parseFloat(addon.price).toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {selectedTest && (
              <>
                <Separator />
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Center:</span>
                    <span className="font-medium text-foreground">{selectedCenterData?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Test: {selectedTestData?.name}</span>
                    <span>₦{testPrice.toLocaleString()}</span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Add-Ons ({selectedAddOns.length})</span>
                      <span>₦{addOnTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₦{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleOrder}
              disabled={!selectedTest || orderMutation.isPending}
              className="w-full"
              data-testid="button-confirm-order"
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Order Test${totalPrice > 0 ? ` - ₦${totalPrice.toLocaleString()}` : ''}`
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
