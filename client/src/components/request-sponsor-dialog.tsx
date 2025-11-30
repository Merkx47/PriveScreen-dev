import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Send,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Share2,
  Building2,
  MapPin,
  Star,
  Gift,
  TestTube,
  Plus,
  Minus,
  X,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getCenters,
  getCenterPricing,
  type DiagnosticCenter,
  type CenterPricing,
} from "@/lib/api/centers";

// Type for center packages derived from pricing
type CenterPackage = {
  id: string;
  name: string;
  description: string;
  price: string;
};

interface RequestSponsorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "center" | "details" | "preview" | "sent";

// Type for selected test with quantity
type SelectedTest = {
  package: CenterPackage;
  quantity: number;
};

export function RequestSponsorDialog({ open, onOpenChange }: RequestSponsorDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("center");
  const [selectedCenter, setSelectedCenter] = useState<DiagnosticCenter | null>(null);
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
  const [sponsorEmail, setSponsorEmail] = useState("");
  const [sponsorPhone, setSponsorPhone] = useState("");
  const [sponsorName, setSponsorName] = useState("");
  const [includeMessage, setIncludeMessage] = useState(true);
  const [customMessage, setCustomMessage] = useState(
    "Hello, I would like to request that you sponsor my health screening test. This is part of a routine health check and I would greatly appreciate your support."
  );
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [shareLink, setShareLink] = useState("");

  // API data states
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);
  const [centerPackages, setCenterPackages] = useState<CenterPackage[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);
  const [centerTestCounts, setCenterTestCounts] = useState<Record<string, number>>({});

  // Load centers on dialog open
  useEffect(() => {
    if (open && centers.length === 0) {
      const fetchCenters = async () => {
        setIsLoadingCenters(true);
        try {
          const response = await getCenters(0, 50);
          if (response.success && response.data) {
            const verifiedCenters = response.data.content.filter(c => c.verified);
            setCenters(verifiedCenters);
            // Fetch pricing counts for all centers
            const counts: Record<string, number> = {};
            await Promise.all(verifiedCenters.map(async (center) => {
              const pricingResponse = await getCenterPricing(center.id);
              if (pricingResponse.success && pricingResponse.data) {
                counts[center.id] = pricingResponse.data.length;
              } else {
                counts[center.id] = 0;
              }
            }));
            setCenterTestCounts(counts);
          }
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load diagnostic centers",
            variant: "destructive",
          });
        } finally {
          setIsLoadingCenters(false);
        }
      };
      fetchCenters();
    }
  }, [open, centers.length, toast]);

  // Load pricing when center is selected
  useEffect(() => {
    if (selectedCenter) {
      const fetchPricing = async () => {
        setIsLoadingPricing(true);
        setCenterPackages([]);
        try {
          const response = await getCenterPricing(selectedCenter.id);
          if (response.success && response.data) {
            const packages: CenterPackage[] = response.data.map((p: CenterPricing) => ({
              id: p.testId,
              name: p.testName,
              description: `Test at ${selectedCenter.name}`,
              price: p.price,
            }));
            setCenterPackages(packages);
          }
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load test pricing",
            variant: "destructive",
          });
        } finally {
          setIsLoadingPricing(false);
        }
      };
      fetchPricing();
    }
  }, [selectedCenter, toast]);

  // Calculate total price of selected tests
  const totalPrice = useMemo(() => {
    return selectedTests.reduce((sum, test) => {
      return sum + (parseFloat(test.package.price) * test.quantity);
    }, 0);
  }, [selectedTests]);

  // Get available tests count per center
  const getCenterTestCount = (centerId: string) => {
    return centerTestCounts[centerId] || 0;
  };

  // Add or update a test selection
  const toggleTestSelection = (pkg: CenterPackage) => {
    setSelectedTests(prev => {
      const existing = prev.find(t => t.package.id === pkg.id);
      if (existing) {
        // Remove if already selected
        return prev.filter(t => t.package.id !== pkg.id);
      } else {
        // Add new selection with quantity 1
        return [...prev, { package: pkg, quantity: 1 }];
      }
    });
  };

  // Update quantity for a selected test
  const updateTestQuantity = (pkgId: string, delta: number) => {
    setSelectedTests(prev => {
      return prev.map(t => {
        if (t.package.id === pkgId) {
          const newQty = Math.max(1, t.quantity + delta);
          return { ...t, quantity: newQty };
        }
        return t;
      });
    });
  };

  // Remove a test from selection
  const removeTest = (pkgId: string) => {
    setSelectedTests(prev => prev.filter(t => t.package.id !== pkgId));
  };

  // Check if a test is selected
  const isTestSelected = (pkgId: string) => {
    return selectedTests.some(t => t.package.id === pkgId);
  };

  const handleSelectCenter = (center: DiagnosticCenter) => {
    setSelectedCenter(center);
    setSelectedTests([]); // Reset tests when center changes
  };

  const handleContinueToDetails = () => {
    if (!selectedCenter) {
      toast({
        title: "Center required",
        description: "Please select a diagnostic center",
        variant: "destructive",
      });
      return;
    }
    if (selectedTests.length === 0) {
      toast({
        title: "Tests required",
        description: "Please select at least one test",
        variant: "destructive",
      });
      return;
    }
    setStep("details");
  };

  const handleContinueToPreview = () => {
    if (!sponsorEmail && !sponsorPhone) {
      toast({
        title: "Contact required",
        description: "Please provide the sponsor's email or phone number",
        variant: "destructive",
      });
      return;
    }
    if (!agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the privacy terms",
        variant: "destructive",
      });
      return;
    }
    setStep("preview");
  };

  const handleSendRequest = () => {
    // Generate code and share link
    const code = `STR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const link = `https://privescreen.com/sponsor-request/${code}`;
    setGeneratedCode(code);
    setShareLink(link);
    setStep("sent");
    toast({
      title: "Request sent!",
      description: "Your sponsorship request has been sent successfully",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const resetDialog = () => {
    setStep("center");
    setSelectedCenter(null);
    setSelectedTests([]);
    setSponsorEmail("");
    setSponsorPhone("");
    setSponsorName("");
    setIncludeMessage(true);
    setCustomMessage(
      "Hello, I would like to request that you sponsor my health screening test. This is part of a routine health check and I would greatly appreciate your support."
    );
    setAgreeToTerms(false);
    setGeneratedCode("");
    setShareLink("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            {step === "center" && "Select Test & Center"}
            {step === "details" && "Sponsor Details"}
            {step === "preview" && "Review Request"}
            {step === "sent" && "Request Sent!"}
          </DialogTitle>
          <DialogDescription>
            {step === "center" && "Choose the test you need and where you'll get tested"}
            {step === "details" && "Enter your sponsor's contact information"}
            {step === "preview" && "Review your request before sending"}
            {step === "sent" && "Share this with your sponsor"}
          </DialogDescription>
        </DialogHeader>

        {step === "center" && (
          <div className="space-y-4 py-4">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
              <Gift className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm">
                Request a sponsor (employer, organization, or benefactor) to pay for your health screening tests. You can select multiple tests!
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label>Select Diagnostic Center</Label>
              {isLoadingCenters ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : centers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No verified centers available</p>
                </div>
              ) : (
                centers.map((center) => {
                  const testCount = getCenterTestCount(center.id);
                  return (
                    <Card
                      key={center.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${
                        selectedCenter?.id === center.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleSelectCenter(center)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{center.name}</span>
                              {selectedCenter?.id === center.id && (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{center.address}, {center.city}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {center.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-medium">{center.rating}</span>
                              </div>
                            )}
                            {/* Available Tests Dial */}
                            <div className="flex items-center gap-1.5">
                              <div className="relative w-8 h-8">
                                <svg className="w-8 h-8 transform -rotate-90">
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r="12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    className="text-muted/30"
                                  />
                                  <circle
                                    cx="16"
                                    cy="16"
                                    r="12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    strokeDasharray={`${(testCount / 6) * 75.4} 75.4`}
                                    className="text-primary"
                                  />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                  {testCount}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">tests</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {selectedCenter && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Select Tests at {selectedCenter.name}</Label>
                  <Badge variant="outline" className="text-xs">
                    <TestTube className="h-3 w-3 mr-1" />
                    {centerPackages.length} available
                  </Badge>
                </div>

                {/* Test selection cards */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {isLoadingPricing ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                              <Skeleton className="h-5 w-16" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : centerPackages.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <TestTube className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No tests available at this center</p>
                    </div>
                  ) : (
                    centerPackages.map((pkg) => {
                      const isSelected = isTestSelected(pkg.id);
                      const selectedTest = selectedTests.find(t => t.package.id === pkg.id);
                      return (
                      <Card
                        key={pkg.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/30'
                        }`}
                        onClick={() => !isSelected && toggleTestSelection(pkg)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleTestSelection(pkg)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-sm font-medium truncate">{pkg.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 ml-6">
                                {pkg.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && selectedTest && (
                                <div className="flex items-center gap-1 bg-muted rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTestQuantity(pkg.id, -1);
                                    }}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-4 text-center">
                                    {selectedTest.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateTestQuantity(pkg.id, 1);
                                    }}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                              <span className="text-sm font-semibold text-primary whitespace-nowrap">
                                ₦{parseFloat(pkg.price).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                  )}
                </div>

                {/* Selected tests summary */}
                {selectedTests.length > 0 && (
                  <div className="p-3 bg-muted rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Selected Tests ({selectedTests.length})</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={() => setSelectedTests([])}
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {selectedTests.map((test) => (
                        <div key={test.package.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => removeTest(test.package.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <span className="text-muted-foreground">
                              {test.package.name} {test.quantity > 1 && `(×${test.quantity})`}
                            </span>
                          </div>
                          <span className="font-medium">
                            ₦{(parseFloat(test.package.price) * test.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleContinueToDetails} className="w-full" disabled={!selectedCenter || selectedTests.length === 0}>
              Continue
            </Button>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-6 py-4">
            {selectedCenter && selectedTests.length > 0 && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">{selectedCenter.name}</span>
                </div>
                <div className="space-y-1">
                  {selectedTests.map((test) => (
                    <div key={test.package.id} className="flex justify-between text-muted-foreground">
                      <span>{test.package.name} {test.quantity > 1 && `(×${test.quantity})`}</span>
                      <span>₦{(parseFloat(test.package.price) * test.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1 border-t flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-primary">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label>Sponsor's Name / Organization</Label>
                <Input
                  placeholder="e.g., HR Department, Company Name, NGO"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Sponsor's Email</Label>
                <Input
                  type="email"
                  placeholder="sponsor@company.com"
                  value={sponsorEmail}
                  onChange={(e) => setSponsorEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label>Sponsor's Phone (Alternative)</Label>
                <Input
                  type="tel"
                  placeholder="+234 XXX XXX XXXX"
                  value={sponsorPhone}
                  onChange={(e) => setSponsorPhone(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeMessage"
                  checked={includeMessage}
                  onCheckedChange={(checked) => setIncludeMessage(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="includeMessage" className="font-normal cursor-pointer">
                    Include a personal message
                  </Label>
                </div>
              </div>

              {includeMessage && (
                <div>
                  <Label>Your Message to Sponsor</Label>
                  <textarea
                    className="mt-1.5 w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>
              )}

              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                <Shield className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <strong>Privacy Protected:</strong> Your sponsor will NOT see your test results.
                  They will only know that you completed the test. Results remain 100% confidential.
                </AlertDescription>
              </Alert>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="agreeTerms" className="font-normal cursor-pointer text-sm">
                    I understand that my sponsor can choose to accept or decline this request,
                    and my test results will remain private.
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("center")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleContinueToPreview} className="flex-1">
                Review Request
              </Button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6 py-4">
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium">Request Summary</h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Center:</span>
                  <span>{selectedCenter?.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sponsor:</span>
                  <span>{sponsorName || sponsorEmail || sponsorPhone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{sponsorEmail || sponsorPhone}</span>
                </div>

                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">Tests Requested:</span>
                  <div className="mt-1 space-y-1">
                    {selectedTests.map((test) => (
                      <div key={test.package.id} className="flex justify-between pl-2">
                        <span>{test.package.name} {test.quantity > 1 && `(×${test.quantity})`}</span>
                        <span>₦{(parseFloat(test.package.price) * test.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between">
                  <span className="text-muted-foreground">Total Amount Requested:</span>
                  <span className="font-semibold text-primary text-lg">₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {includeMessage && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Message to Sponsor</h4>
                <p className="text-sm text-muted-foreground italic">"{customMessage}"</p>
              </div>
            )}

            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm">
                Your sponsor will receive a request with options to:
                <ul className="list-disc list-inside mt-1">
                  <li>Accept and pay for your test</li>
                  <li>Decline the request (you'll be notified)</li>
                  <li>See only completion status, not your results</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("details")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSendRequest} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>
          </div>
        )}

        {step === "sent" && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Request Sent Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your sponsor has been notified via {sponsorEmail ? "email" : "SMS"}
              </p>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Sponsor Request Code</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-lg font-mono">
                    {generatedCode}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(generatedCode, "Code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Share Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                    {shareLink}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(shareLink, "Link")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm text-left">
                You can also share this link directly with your sponsor via WhatsApp,
                text message, or any messaging app.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const text = `${customMessage}\n\nPlease use this link to sponsor my health test: ${shareLink}\nOr enter code: ${generatedCode}`;
                  if (navigator.share) {
                    navigator.share({ title: "Sponsor Test Request", text });
                  } else {
                    copyToClipboard(text, "Invitation");
                  }
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => handleClose(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
