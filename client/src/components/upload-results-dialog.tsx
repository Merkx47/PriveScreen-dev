import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle2, Plus, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateCode, type CodeValidation } from "@/lib/api/codes";

interface UploadResultsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TestParameter {
  id: string;
  parameter: string;
  value: string;
  referenceRange: string;
  status: "normal" | "abnormal" | "critical";
}

export function UploadResultsDialog({ open, onOpenChange }: UploadResultsDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"code" | "upload" | "confirm">("code");
  const [assessmentCode, setAssessmentCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [validatedData, setValidatedData] = useState<CodeValidation | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testParameters, setTestParameters] = useState<TestParameter[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidateCode = async () => {
    if (assessmentCode.length !== 12) return;

    setIsValidating(true);
    try {
      const response = await validateCode(assessmentCode);
      if (response.success && response.data && response.data.valid) {
        setCodeValid(true);
        setValidatedData(response.data);
        // Initialize test parameters based on test standard
        const testsIncluded = response.data.testStandard?.testsIncluded || [];
        if (testsIncluded.length > 0) {
          const initialParams = testsIncluded.map((test, idx) => ({
            id: `param-${idx}`,
            parameter: test,
            value: "",
            referenceRange: getDefaultReference(test),
            status: "normal" as const,
          }));
          setTestParameters(initialParams);
        } else {
          // Default to one empty parameter if no tests specified
          setTestParameters([{
            id: `param-0`,
            parameter: "",
            value: "",
            referenceRange: "",
            status: "normal" as const,
          }]);
        }
        setStep("upload");
      } else {
        toast({
          title: "Invalid Code",
          description: response.data?.message || response.error || "This code is not valid or has expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to validate code:", error);
      toast({
        title: "Validation Failed",
        description: "Unable to validate the code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
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
      resetDialog();
      onOpenChange(false);
    }, 1500);
  };

  const resetDialog = () => {
    setStep("code");
    setAssessmentCode("");
    setCodeValid(false);
    setSelectedFile(null);
    setTestParameters([]);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Test Results</DialogTitle>
          <DialogDescription>
            {step === "code" && "Enter the assessment code to upload results"}
            {step === "upload" && "Enter test results and attach supporting document"}
            {step === "confirm" && "Review and confirm the test results"}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-2 ${step === "code" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "code" ? "bg-primary text-primary-foreground" :
              (step === "upload" || step === "confirm") ? "bg-primary/20 text-primary" : "bg-muted"
            }`}>
              {(step === "upload" || step === "confirm") ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Validate Code</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === "upload" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "upload" ? "bg-primary text-primary-foreground" :
              step === "confirm" ? "bg-primary/20 text-primary" : "bg-muted"
            }`}>
              {step === "confirm" ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Enter Results</span>
          </div>
          <div className="flex-1 h-px bg-border" />
          <div className={`flex items-center gap-2 ${step === "confirm" ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === "confirm" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              3
            </div>
            <span className="text-sm font-medium hidden sm:inline">Submit</span>
          </div>
        </div>

        {/* Step 1: Validate Code */}
        {step === "code" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assessment-code">Assessment Code</Label>
              <div className="flex gap-2">
                <Input
                  id="assessment-code"
                  placeholder="Enter 12-digit code"
                  value={assessmentCode}
                  onChange={(e) => setAssessmentCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-wider"
                  maxLength={12}
                  data-testid="input-upload-code"
                />
                <Button
                  onClick={handleValidateCode}
                  disabled={assessmentCode.length !== 12 || isValidating}
                  data-testid="button-validate-upload-code"
                >
                  {isValidating ? "Validating..." : "Validate"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the patient's assessment code to begin uploading results
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Upload Results */}
        {step === "upload" && validatedData && (
          <div className="space-y-6">
            {/* Validated Code Info */}
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">Code Validated</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Code: </span>
                  <span className="font-mono font-semibold">{assessmentCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Test: </span>
                  <span className="font-medium">{validatedData.testStandard?.name || "Unknown"}</span>
                </div>
              </div>
            </Card>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Supporting Document (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium">Click to upload or drag and drop</p>
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
            </div>

            {/* Test Parameters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Test Results</Label>
                <Button variant="outline" size="sm" onClick={addParameter}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Parameter
                </Button>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {testParameters.map((param, index) => (
                  <Card key={param.id} className="p-3">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Parameter {index + 1}
                        </span>
                        {testParameters.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeParameter(param.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Test Name</Label>
                          <Input
                            placeholder="e.g., HIV 1&2"
                            value={param.parameter}
                            onChange={(e) => updateParameter(param.id, "parameter", e.target.value)}
                            className="h-9"
                            data-testid={`input-param-name-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Result Value</Label>
                          <Input
                            placeholder="e.g., Non-Reactive"
                            value={param.value}
                            onChange={(e) => updateParameter(param.id, "value", e.target.value)}
                            className="h-9"
                            data-testid={`input-param-value-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Status</Label>
                          <Select
                            value={param.status}
                            onValueChange={(value) => updateParameter(param.id, "status", value)}
                          >
                            <SelectTrigger className="h-9" data-testid={`select-param-status-${index}`}>
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
                      <div>
                        <Label className="text-xs">Reference Range</Label>
                        <Input
                          placeholder="e.g., Non-Reactive"
                          value={param.referenceRange}
                          onChange={(e) => updateParameter(param.id, "referenceRange", e.target.value)}
                          className="h-9"
                          data-testid={`input-param-reference-${index}`}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("code")}>
                Back
              </Button>
              <Button onClick={() => setStep("confirm")} data-testid="button-proceed-to-confirm">
                Review Results
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Submit */}
        {step === "confirm" && validatedData && (
          <div className="space-y-6">
            <Card className="p-4">
              <h4 className="font-semibold mb-3">Results Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assessment Code:</span>
                  <span className="font-mono font-semibold">{assessmentCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test Type:</span>
                  <span>{validatedData.testStandard?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Attached:</span>
                  <span>{selectedFile ? selectedFile.name : "None"}</span>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <h4 className="font-semibold">Test Results</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Parameter</th>
                      <th className="px-3 py-2 text-left font-medium">Result</th>
                      <th className="px-3 py-2 text-left font-medium">Reference</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testParameters.map((param, idx) => (
                      <tr key={param.id} className={idx % 2 === 0 ? "" : "bg-muted/30"}>
                        <td className="px-3 py-2">{param.parameter}</td>
                        <td className="px-3 py-2 font-medium">{param.value}</td>
                        <td className="px-3 py-2 text-muted-foreground">{param.referenceRange}</td>
                        <td className="px-3 py-2">
                          <Badge
                            variant={param.status === "normal" ? "default" : "destructive"}
                            className="text-xs"
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

            <Card className="p-3 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Important Notice</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Once submitted, results cannot be modified. Please verify all information is correct.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                data-testid="button-submit-results"
              >
                {isSubmitting ? "Submitting..." : "Submit Results"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
