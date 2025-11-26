import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  FileText,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PriveScreenLogo } from "@/components/logo";
import { mockCodeValidation, mockTestStandards } from "@/lib/mock-data";

interface TestParameter {
  id: string;
  parameter: string;
  value: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
}

export default function UploadResults() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"code" | "upload" | "confirm">("code");
  const [assessmentCode, setAssessmentCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get test type from validated code
  const validatedData = codeValid ? mockCodeValidation : null;

  const handleValidateCode = () => {
    if (assessmentCode.length !== 12) return;

    setIsValidating(true);
    // Simulate API call
    setTimeout(() => {
      // For demo, accept any 12-char code
      if (assessmentCode.length === 12) {
        setCodeValid(true);
        // Initialize test parameters based on test standard
        if (mockCodeValidation.testsIncluded) {
          const initialParams = mockCodeValidation.testsIncluded.map((test, idx) => ({
            id: `param-${idx}`,
            parameter: test,
            value: "",
            referenceRange: getDefaultReference(test),
            status: "normal" as const,
          }));
          setTestParameters(initialParams);
        }
        setStep("upload");
      }
      setIsValidating(false);
    }, 1000);
  };

  const getDefaultReference = (testName: string): string => {
    const references: Record<string, string> = {
      "HIV 1&2": "Non-Reactive",
      "Hepatitis B": "Negative",
      "Hepatitis C": "Negative",
      "Syphilis": "Non-Reactive",
      "Gonorrhea": "Not Detected",
      "Chlamydia": "Not Detected",
      "HIV 1&2 Antibody": "Non-Reactive",
      "Hepatitis B Surface Antigen": "Negative",
      "Hepatitis C Antibody": "Negative",
      "Gonorrhea PCR": "Not Detected",
      "Chlamydia PCR": "Not Detected",
      "Syphilis VDRL": "Non-Reactive",
    };
    return references[testName] || "Normal";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const updateParameter = (id: string, field: keyof TestParameter, value: string) => {
    setTestParameters(params =>
      params.map(p => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          // Auto-determine status based on value vs reference
          if (field === "value") {
            const isNormal = value.toLowerCase() === p.referenceRange.toLowerCase() ||
              value.toLowerCase().includes("non-reactive") ||
              value.toLowerCase().includes("negative") ||
              value.toLowerCase().includes("not detected") ||
              value.toLowerCase().includes("normal");
            updated.status = isNormal ? "normal" : "abnormal";
          }
          return updated;
        }
        return p;
      })
    );
  };

  const addParameter = () => {
    const newId = `param-${Date.now()}`;
    setTestParameters([...testParameters, {
      id: newId,
      parameter: "",
      value: "",
      referenceRange: "",
      status: "normal",
    }]);
  };

  const removeParameter = (id: string) => {
    setTestParameters(params => params.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    const incompleteParams = testParameters.filter(p => !p.parameter || !p.value);
    if (incompleteParams.length > 0) {
      toast({
        title: "Incomplete data",
        description: "Please fill in all test parameters and values",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Results uploaded successfully",
        description: `Test results for code ${assessmentCode} have been submitted`,
      });
      setIsSubmitting(false);
      setLocation("/center");
    }, 1500);
  };

  const resetFlow = () => {
    setStep("code");
    setAssessmentCode("");
    setCodeValid(false);
    setSelectedFile(null);
    setTestParameters([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <a href="/center">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">Upload Test Results</h1>
                <p className="text-sm text-muted-foreground">Diagnostic Center Portal</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {step === "code" ? "Step 1 of 3" : step === "upload" ? "Step 2 of 3" : "Step 3 of 3"}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === "code" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step === "code" ? "bg-primary text-primary-foreground border-primary" :
                (step === "upload" || step === "confirm") ? "bg-primary/20 text-primary border-primary" : "bg-muted border-muted"
              }`}>
                {(step === "upload" || step === "confirm") ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <span className="font-medium hidden sm:inline">Validate Code</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded">
              <div className={`h-full rounded transition-all duration-300 ${
                step === "upload" || step === "confirm" ? "bg-primary w-full" : "bg-transparent w-0"
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step === "upload" ? "bg-primary text-primary-foreground border-primary" :
                step === "confirm" ? "bg-primary/20 text-primary border-primary" : "bg-muted border-muted"
              }`}>
                {step === "confirm" ? <CheckCircle2 className="h-5 w-5" /> : "2"}
              </div>
              <span className="font-medium hidden sm:inline">Enter Results</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded">
              <div className={`h-full rounded transition-all duration-300 ${
                step === "confirm" ? "bg-primary w-full" : "bg-transparent w-0"
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${step === "confirm" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step === "confirm" ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-muted"
              }`}>
                3
              </div>
              <span className="font-medium hidden sm:inline">Submit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: Validate Code */}
        {step === "code" && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Enter Assessment Code</CardTitle>
              <CardDescription>
                Enter the patient's assessment code to begin uploading results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="assessment-code" className="text-base">Assessment Code</Label>
                  <Input
                    id="assessment-code"
                    placeholder="Enter 12-character code (e.g., PSN8K2M9L4P7)"
                    value={assessmentCode}
                    onChange={(e) => setAssessmentCode(e.target.value.toUpperCase())}
                    className="font-mono text-xl tracking-widest text-center h-14"
                    maxLength={12}
                    data-testid="input-upload-code"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {assessmentCode.length}/12 characters
                  </p>
                </div>

                <Button
                  onClick={handleValidateCode}
                  disabled={assessmentCode.length !== 12 || isValidating}
                  className="w-full h-12 text-base"
                  data-testid="button-validate-upload-code"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      Validate Code
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground text-center">
                  The assessment code is printed on the patient's test request form or can be shown from their PriveScreen app.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload Results */}
        {step === "upload" && validatedData && (
          <div className="space-y-6">
            {/* Validated Code Info */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <span className="font-semibold text-lg text-primary">Code Validated Successfully</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Code: </span>
                    <span className="font-mono font-bold text-base">{assessmentCode}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Test: </span>
                    <span className="font-medium">{validatedData.testType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until: </span>
                    <span className="font-medium">{validatedData.validUntil.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Supporting Document</CardTitle>
                <CardDescription>Upload the lab report or supporting document (optional but recommended)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="h-12 w-12 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-lg">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium text-lg mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PDF, JPG, PNG (max 10MB)</p>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        data-testid="input-file-upload"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Test Parameters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Test Results</CardTitle>
                    <CardDescription>Enter the results for each test parameter</CardDescription>
                  </div>
                  <Button variant="outline" onClick={addParameter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testParameters.map((param, index) => (
                    <Card key={param.id} className="p-4 bg-muted/30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Parameter {index + 1}</span>
                          {testParameters.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParameter(param.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Test Name</Label>
                            <Input
                              placeholder="e.g., HIV 1&2"
                              value={param.parameter}
                              onChange={(e) => updateParameter(param.id, "parameter", e.target.value)}
                              data-testid={`input-param-name-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Result Value</Label>
                            <Input
                              placeholder="e.g., Non-Reactive"
                              value={param.value}
                              onChange={(e) => updateParameter(param.id, "value", e.target.value)}
                              data-testid={`input-param-value-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Reference Range</Label>
                            <Input
                              placeholder="e.g., Non-Reactive"
                              value={param.referenceRange}
                              onChange={(e) => updateParameter(param.id, "referenceRange", e.target.value)}
                              data-testid={`input-param-reference-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Status</Label>
                            <Select
                              value={param.status}
                              onValueChange={(value) => updateParameter(param.id, "status", value)}
                            >
                              <SelectTrigger data-testid={`select-param-status-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="abnormal">Abnormal</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4 justify-between">
              <Button variant="outline" onClick={() => { resetFlow(); }} className="h-12 px-8">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Start Over
              </Button>
              <Button onClick={() => setStep("confirm")} className="h-12 px-8" data-testid="button-proceed-to-confirm">
                Review Results
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Submit */}
        {step === "confirm" && validatedData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit Results</CardTitle>
                <CardDescription>Please verify all information before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid sm:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Assessment Code</p>
                    <p className="font-mono font-bold text-lg">{assessmentCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Test Type</p>
                    <p className="font-medium">{validatedData.testType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Document</p>
                    <p className="font-medium">{selectedFile ? selectedFile.name : "None attached"}</p>
                  </div>
                </div>

                {/* Results Table */}
                <div>
                  <h4 className="font-semibold mb-3">Test Results Summary</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Parameter</th>
                          <th className="px-4 py-3 text-left font-medium">Result</th>
                          <th className="px-4 py-3 text-left font-medium">Reference</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testParameters.map((param, idx) => (
                          <tr key={param.id} className={idx % 2 === 0 ? "" : "bg-muted/30"}>
                            <td className="px-4 py-3">{param.parameter}</td>
                            <td className="px-4 py-3 font-medium">{param.value}</td>
                            <td className="px-4 py-3 text-muted-foreground">{param.referenceRange}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={param.status === "normal" ? "default" : "destructive"}
                              >
                                {param.status === "normal" ? "Normal" :
                                 param.status === "abnormal" ? "Abnormal" : "Critical"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Warning */}
                <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Important Notice</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          Once submitted, results cannot be modified. The patient will be notified immediately and can view their results. Please verify all information is accurate before proceeding.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex gap-4 justify-between">
              <Button variant="outline" onClick={() => setStep("upload")} className="h-12 px-8">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Edit
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 px-8"
                data-testid="button-submit-results"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Submit Results
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
