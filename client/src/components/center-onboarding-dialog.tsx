import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  FileCheck,
  Upload,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  User,
  Shield,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  TestTube,
  Home,
  Car,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllTests, type TestStandard } from "@/lib/api/tests";
import { Separator } from "@/components/ui/separator";

interface CenterOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "info" | "documents" | "pricing" | "compliance" | "review" | "submitted";

interface TestPricing {
  testStandardId: string;
  price: string;
  homeServicePrice: string;
}

interface CenterFormData {
  // Basic Info
  centerName: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  contactPerson: string;
  contactRole: string;
  operatingHours: string;

  // Documents
  cacCertificate: File | null;
  medicalLicense: File | null;
  facilityPhotos: File[];

  // Pricing
  testPricing: TestPricing[];
  offersHomeService: boolean;
  homeServiceRadius: string; // in km

  // Compliance
  hasQualifiedStaff: boolean;
  hasPrivateTestingArea: boolean;
  canFollowStandards: boolean;
  hasWasteDisposal: boolean;
  agreeToAudits: boolean;
  agreeToTerms: boolean;
}

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

// Initialize test pricing with default suggested prices
const initializeTestPricing = (tests: TestStandard[]): TestPricing[] => {
  return tests.map(test => ({
    testStandardId: test.id,
    price: test.price, // Use standard price as default suggestion
    homeServicePrice: String(Math.round(parseFloat(test.price) * 1.3)), // 30% markup for home service
  }));
};

export function CenterOnboardingDialog({ open, onOpenChange }: CenterOnboardingDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testStandards, setTestStandards] = useState<TestStandard[]>([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);

  const [formData, setFormData] = useState<CenterFormData>({
    centerName: "",
    registrationNumber: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    contactPerson: "",
    contactRole: "",
    operatingHours: "",
    cacCertificate: null,
    medicalLicense: null,
    facilityPhotos: [],
    testPricing: [],
    offersHomeService: false,
    homeServiceRadius: "10",
    hasQualifiedStaff: false,
    hasPrivateTestingArea: false,
    canFollowStandards: false,
    hasWasteDisposal: false,
    agreeToAudits: false,
    agreeToTerms: false,
  });

  // Fetch test standards when dialog opens
  useEffect(() => {
    if (open && testStandards.length === 0) {
      const fetchTests = async () => {
        setIsLoadingTests(true);
        try {
          const response = await getAllTests();
          if (response.success && response.data) {
            const activeTests = response.data.filter(t => t.active);
            setTestStandards(activeTests);
            // Initialize pricing if not already set
            setFormData(prev => ({
              ...prev,
              testPricing: prev.testPricing.length === 0 ? initializeTestPricing(activeTests) : prev.testPricing
            }));
          }
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to load test standards",
            variant: "destructive",
          });
        } finally {
          setIsLoadingTests(false);
        }
      };
      fetchTests();
    }
  }, [open, testStandards.length, toast]);

  const updateField = <K extends keyof CenterFormData>(field: K, value: CenterFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTestPrice = (testStandardId: string, price: string) => {
    setFormData(prev => ({
      ...prev,
      testPricing: prev.testPricing.map(tp =>
        tp.testStandardId === testStandardId ? { ...tp, price } : tp
      ),
    }));
  };

  const updateHomeServicePrice = (testStandardId: string, homeServicePrice: string) => {
    setFormData(prev => ({
      ...prev,
      testPricing: prev.testPricing.map(tp =>
        tp.testStandardId === testStandardId ? { ...tp, homeServicePrice } : tp
      ),
    }));
  };

  const handleFileUpload = (field: "cacCertificate" | "medicalLicense", file: File | null) => {
    updateField(field, file);
  };

  const handlePhotosUpload = (files: FileList | null) => {
    if (files) {
      updateField("facilityPhotos", Array.from(files).slice(0, 5));
    }
  };

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case "info":
        if (!formData.centerName || !formData.registrationNumber || !formData.address ||
            !formData.city || !formData.state || !formData.phone || !formData.email ||
            !formData.contactPerson || !formData.contactRole) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields",
            variant: "destructive",
          });
          return false;
        }
        // Basic email validation
        if (!formData.email.includes("@")) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case "documents":
        if (!formData.cacCertificate || !formData.medicalLicense) {
          toast({
            title: "Missing Documents",
            description: "Please upload all required documents",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case "pricing":
        const invalidPrices = formData.testPricing.filter(tp => {
          const price = parseFloat(tp.price);
          return isNaN(price) || price <= 0;
        });
        if (invalidPrices.length > 0) {
          toast({
            title: "Invalid Pricing",
            description: "Please enter valid prices for all tests",
            variant: "destructive",
          });
          return false;
        }
        return true;

      case "compliance":
        if (!formData.hasQualifiedStaff || !formData.hasPrivateTestingArea ||
            !formData.canFollowStandards || !formData.hasWasteDisposal ||
            !formData.agreeToAudits || !formData.agreeToTerms) {
          toast({
            title: "Compliance Required",
            description: "Please confirm all compliance requirements",
            variant: "destructive",
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(step)) return;

    const steps: Step[] = ["info", "documents", "pricing", "compliance", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: Step[] = ["info", "documents", "pricing", "compliance", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep("submitted");
  };

  const handleClose = () => {
    setStep("info");
    setFormData({
      centerName: "",
      registrationNumber: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      contactPerson: "",
      contactRole: "",
      operatingHours: "",
      cacCertificate: null,
      medicalLicense: null,
      facilityPhotos: [],
      testPricing: initializeTestPricing(),
      offersHomeService: false,
      homeServiceRadius: "10",
      hasQualifiedStaff: false,
      hasPrivateTestingArea: false,
      canFollowStandards: false,
      hasWasteDisposal: false,
      agreeToAudits: false,
      agreeToTerms: false,
    });
    onOpenChange(false);
  };

  const getStepNumber = () => {
    const steps: Step[] = ["info", "documents", "pricing", "compliance", "review"];
    return steps.indexOf(step) + 1;
  };

  const getTestById = (id: string) => testStandards.find(t => t.id === id);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {step === "submitted" ? "Application Submitted" : "Center Onboarding Application"}
          </DialogTitle>
          <DialogDescription>
            {step === "info" && "Step 1 of 5: Basic center information"}
            {step === "documents" && "Step 2 of 5: Upload required documents"}
            {step === "pricing" && "Step 3 of 5: Set your test pricing"}
            {step === "compliance" && "Step 4 of 5: Compliance requirements"}
            {step === "review" && "Step 5 of 5: Review and submit"}
            {step === "submitted" && "Your application is being reviewed"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        {step !== "submitted" && (
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  num <= getStepNumber()
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {num < getStepNumber() ? <CheckCircle2 className="h-4 w-4" /> : num}
                </div>
                {num < 5 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    num < getStepNumber() ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Basic Information */}
        {step === "info" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="centerName">Center Name *</Label>
                <Input
                  id="centerName"
                  placeholder="e.g., Lagos Diagnostic Center"
                  value={formData.centerName}
                  onChange={(e) => updateField("centerName", e.target.value)}
                  data-testid="input-center-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationNumber">CAC Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  placeholder="RC-XXXXXXX"
                  value={formData.registrationNumber}
                  onChange={(e) => updateField("registrationNumber", e.target.value)}
                  data-testid="input-registration-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianStates.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Ikeja"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  data-testid="input-city"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  data-testid="input-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+234 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Official Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@center.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  placeholder="Full name"
                  value={formData.contactPerson}
                  onChange={(e) => updateField("contactPerson", e.target.value)}
                  data-testid="input-contact-person"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactRole">Role/Position *</Label>
                <Input
                  id="contactRole"
                  placeholder="e.g., Lab Manager"
                  value={formData.contactRole}
                  onChange={(e) => updateField("contactRole", e.target.value)}
                  data-testid="input-contact-role"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  placeholder="e.g., Mon-Fri: 8AM-6PM, Sat: 9AM-2PM"
                  value={formData.operatingHours}
                  onChange={(e) => updateField("operatingHours", e.target.value)}
                  data-testid="input-operating-hours"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={nextStep} data-testid="button-next-step">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Document Upload */}
        {step === "documents" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>CAC Certificate *</Label>
                <Card className={`p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors ${
                  formData.cacCertificate ? "border-primary bg-primary/5" : ""
                }`}>
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload("cacCertificate", e.target.files?.[0] || null)}
                      data-testid="input-cac-certificate"
                    />
                    {formData.cacCertificate ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                        <span className="text-sm font-medium">{formData.cacCertificate.name}</span>
                        <span className="text-xs text-muted-foreground">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload CAC Certificate</span>
                        <span className="text-xs text-muted-foreground">PDF, JPG, PNG (max 5MB)</span>
                      </>
                    )}
                  </label>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Medical/Laboratory License *</Label>
                <Card className={`p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors ${
                  formData.medicalLicense ? "border-primary bg-primary/5" : ""
                }`}>
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload("medicalLicense", e.target.files?.[0] || null)}
                      data-testid="input-medical-license"
                    />
                    {formData.medicalLicense ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-primary" />
                        <span className="text-sm font-medium">{formData.medicalLicense.name}</span>
                        <span className="text-xs text-muted-foreground">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Medical License</span>
                        <span className="text-xs text-muted-foreground">PDF, JPG, PNG (max 5MB)</span>
                      </>
                    )}
                  </label>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Facility Photos (Optional)</Label>
                <Card className="p-4 border-dashed cursor-pointer hover:bg-muted/50 transition-colors">
                  <label className="flex flex-col items-center gap-2 cursor-pointer">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      onChange={(e) => handlePhotosUpload(e.target.files)}
                      data-testid="input-facility-photos"
                    />
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {formData.facilityPhotos.length > 0
                        ? `${formData.facilityPhotos.length} photo(s) selected`
                        : "Upload Facility Photos"}
                    </span>
                    <span className="text-xs text-muted-foreground">Up to 5 photos (JPG, PNG)</span>
                  </label>
                </Card>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Document Requirements</p>
                  <ul className="mt-1 text-muted-foreground space-y-1">
                    <li>• Documents must be clear and legible</li>
                    <li>• All licenses must be current and valid</li>
                    <li>• CAC certificate must match the center name provided</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={nextStep} data-testid="button-next-step">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing */}
        {step === "pricing" && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Set Your Pricing</p>
                  <p className="text-blue-700 dark:text-blue-300 mt-1">
                    Set competitive prices for each test. The suggested prices are based on market averages.
                    You can adjust these based on your costs and location.
                  </p>
                </div>
              </div>
            </div>

            {/* In-Center Pricing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">In-Center Test Pricing (NGN)</h4>
              </div>

              <div className="space-y-3">
                {formData.testPricing.map((tp) => {
                  const test = getTestById(tp.testStandardId);
                  if (!test) return null;

                  return (
                    <Card key={tp.testStandardId} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{test.name}</h4>
                            {(test as any).isDefault && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {test.testsIncluded.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="w-36">
                          <Label htmlFor={`price-${tp.testStandardId}`} className="text-xs text-muted-foreground">
                            In-Center Price (₦)
                          </Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                            <Input
                              id={`price-${tp.testStandardId}`}
                              type="number"
                              min="0"
                              step="100"
                              className="pl-7"
                              value={tp.price}
                              onChange={(e) => updateTestPrice(tp.testStandardId, e.target.value)}
                              data-testid={`input-price-${tp.testStandardId}`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Suggested: ₦{parseFloat(test.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Home Service Option */}
            <div className="space-y-4">
              <Card className={`p-4 cursor-pointer transition-all ${
                formData.offersHomeService ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/20" : ""
              }`} onClick={() => updateField("offersHomeService", !formData.offersHomeService)}>
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={formData.offersHomeService}
                    onCheckedChange={(checked) => updateField("offersHomeService", !!checked)}
                    data-testid="checkbox-home-service"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-5 w-5 text-amber-600" />
                      <h4 className="font-semibold">Offer Home Service (Prime)</h4>
                      <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Premium</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Send phlebotomists to collect samples at patient's location. Home service attracts premium pricing and more patients who value convenience and privacy.
                    </p>
                  </div>
                </div>
              </Card>

              {formData.offersHomeService && (
                <div className="space-y-4 pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                  {/* Service Radius */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-amber-600" />
                      Service Radius
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.homeServiceRadius}
                        onChange={(e) => updateField("homeServiceRadius", e.target.value)}
                        className="w-24"
                        data-testid="input-service-radius"
                      />
                      <span className="text-sm text-muted-foreground">km from your center</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum distance your team can travel for home sample collection
                    </p>
                  </div>

                  {/* Home Service Pricing */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-amber-600" />
                      <h5 className="font-medium text-sm">Home Service Pricing</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set your home service prices (typically 20-50% higher than in-center to cover travel and convenience)
                    </p>

                    {formData.testPricing.map((tp) => {
                      const test = getTestById(tp.testStandardId);
                      if (!test) return null;

                      return (
                        <div key={`home-${tp.testStandardId}`} className="flex items-center justify-between gap-4 p-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-lg">
                          <div className="flex-1">
                            <span className="font-medium text-sm">{test.name}</span>
                            <p className="text-xs text-muted-foreground">
                              In-center: ₦{parseFloat(tp.price).toLocaleString()}
                            </p>
                          </div>
                          <div className="w-32">
                            <Label htmlFor={`home-price-${tp.testStandardId}`} className="text-xs text-muted-foreground">
                              Home Price (₦)
                            </Label>
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₦</span>
                              <Input
                                id={`home-price-${tp.testStandardId}`}
                                type="number"
                                min="0"
                                step="100"
                                className="pl-7"
                                value={tp.homeServicePrice}
                                onChange={(e) => updateHomeServicePrice(tp.testStandardId, e.target.value)}
                                data-testid={`input-home-price-${tp.testStandardId}`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Pricing Tips</p>
                  <ul className="mt-1 text-amber-700 dark:text-amber-300 space-y-1">
                    <li>• Competitive pricing helps attract more patients</li>
                    <li>• You can update your pricing later from your dashboard</li>
                    <li>• Prices are shown to patients when they select your center</li>
                    {formData.offersHomeService && (
                      <li>• Home service prices should cover travel time and convenience</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={nextStep} data-testid="button-next-step">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Compliance */}
        {step === "compliance" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please confirm your center meets the following requirements to join the PriveScreen network:
              </p>

              <div className="space-y-3">
                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.hasQualifiedStaff ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("hasQualifiedStaff", !formData.hasQualifiedStaff)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.hasQualifiedStaff}
                      onCheckedChange={(checked) => updateField("hasQualifiedStaff", !!checked)}
                      data-testid="checkbox-qualified-staff"
                    />
                    <div>
                      <p className="font-medium">Qualified Medical Staff</p>
                      <p className="text-sm text-muted-foreground">
                        We have licensed medical laboratory scientists or technicians to conduct sexual health tests
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.hasPrivateTestingArea ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("hasPrivateTestingArea", !formData.hasPrivateTestingArea)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.hasPrivateTestingArea}
                      onCheckedChange={(checked) => updateField("hasPrivateTestingArea", !!checked)}
                      data-testid="checkbox-private-area"
                    />
                    <div>
                      <p className="font-medium">Private Testing Area</p>
                      <p className="text-sm text-muted-foreground">
                        We have a private, confidential space for sample collection and patient consultations
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.canFollowStandards ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("canFollowStandards", !formData.canFollowStandards)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.canFollowStandards}
                      onCheckedChange={(checked) => updateField("canFollowStandards", !!checked)}
                      data-testid="checkbox-standards"
                    />
                    <div>
                      <p className="font-medium">Sexual Health Test Standards</p>
                      <p className="text-sm text-muted-foreground">
                        We agree to follow PriveScreen's standardized testing protocols and result formatting
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.hasWasteDisposal ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("hasWasteDisposal", !formData.hasWasteDisposal)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.hasWasteDisposal}
                      onCheckedChange={(checked) => updateField("hasWasteDisposal", !!checked)}
                      data-testid="checkbox-waste-disposal"
                    />
                    <div>
                      <p className="font-medium">Proper Waste Disposal</p>
                      <p className="text-sm text-muted-foreground">
                        We have proper medical waste disposal procedures in compliance with health regulations
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.agreeToAudits ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("agreeToAudits", !formData.agreeToAudits)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.agreeToAudits}
                      onCheckedChange={(checked) => updateField("agreeToAudits", !!checked)}
                      data-testid="checkbox-audits"
                    />
                    <div>
                      <p className="font-medium">Quality Audits</p>
                      <p className="text-sm text-muted-foreground">
                        We agree to periodic quality audits and inspections by PriveScreen
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="pt-4 border-t">
                <Card className={`p-4 cursor-pointer transition-all ${
                  formData.agreeToTerms ? "ring-2 ring-primary bg-primary/5" : ""
                }`} onClick={() => updateField("agreeToTerms", !formData.agreeToTerms)}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => updateField("agreeToTerms", !!checked)}
                      data-testid="checkbox-terms"
                    />
                    <div>
                      <p className="font-medium">Terms and Conditions</p>
                      <p className="text-sm text-muted-foreground">
                        I agree to the PriveScreen Partner Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={nextStep} data-testid="button-next-step">
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === "review" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Center Information</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Center Name</p>
                    <p className="font-medium">{formData.centerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registration</p>
                    <p className="font-medium">{formData.registrationNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium">{formData.address}, {formData.city}, {formData.state}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{formData.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contact Person</p>
                    <p className="font-medium">{formData.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium">{formData.contactRole}</p>
                  </div>
                  {formData.operatingHours && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Operating Hours</p>
                      <p className="font-medium">{formData.operatingHours}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Documents</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>CAC Certificate: {formData.cacCertificate?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Medical License: {formData.medicalLicense?.name}</span>
                  </div>
                  {formData.facilityPhotos.length > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{formData.facilityPhotos.length} facility photo(s)</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Test Pricing</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs text-muted-foreground font-medium mb-2">In-Center Pricing:</p>
                  {formData.testPricing.map((tp) => {
                    const test = getTestById(tp.testStandardId);
                    if (!test) return null;
                    return (
                      <div key={tp.testStandardId} className="flex justify-between">
                        <span className="text-muted-foreground">{test.name}</span>
                        <span className="font-medium">₦{parseFloat(tp.price).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {formData.offersHomeService && (
                <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold">Home Service (Prime)</h4>
                    <Badge className="bg-amber-100 text-amber-800 text-xs">Enabled</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Service Radius:</span>
                      <span className="font-medium">{formData.homeServiceRadius} km</span>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground font-medium mb-2">Home Service Pricing:</p>
                    {formData.testPricing.map((tp) => {
                      const test = getTestById(tp.testStandardId);
                      if (!test) return null;
                      return (
                        <div key={`review-home-${tp.testStandardId}`} className="flex justify-between">
                          <span className="text-muted-foreground">{test.name}</span>
                          <span className="font-medium">₦{parseFloat(tp.homeServicePrice).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Compliance Confirmations</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Qualified Staff</Badge>
                  <Badge variant="secondary">Private Testing Area</Badge>
                  <Badge variant="secondary">Test Standards</Badge>
                  <Badge variant="secondary">Waste Disposal</Badge>
                  <Badge variant="secondary">Quality Audits</Badge>
                  <Badge variant="secondary">Terms Accepted</Badge>
                </div>
              </Card>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Review Process</p>
                  <p className="text-amber-700 dark:text-amber-300 mt-1">
                    Your application will be reviewed within 5-7 business days. We may contact you for additional information or to schedule an on-site verification visit.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-submit-application">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Submitted */}
        {step === "submitted" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Application Submitted!</h3>
              <p className="text-muted-foreground">
                Thank you for applying to join the PriveScreen network.
              </p>
            </div>

            <Card className="p-4 bg-muted/50 text-left">
              <h4 className="font-medium mb-3">What happens next?</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Document Verification</p>
                    <p className="text-muted-foreground">Our team will verify your submitted documents</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Site Visit (if required)</p>
                    <p className="text-muted-foreground">We may schedule an on-site inspection</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">Approval & Onboarding</p>
                    <p className="text-muted-foreground">Once approved, you'll receive login credentials and training materials</p>
                  </div>
                </li>
              </ul>
            </Card>

            <div className="text-sm text-muted-foreground">
              <p>Application reference: <span className="font-mono font-bold">APP-{Date.now().toString(36).toUpperCase()}</span></p>
              <p className="mt-1">A confirmation email has been sent to {formData.email}</p>
            </div>

            <Button onClick={handleClose} className="w-full" data-testid="button-done">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
