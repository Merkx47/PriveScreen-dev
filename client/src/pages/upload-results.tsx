import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Shield,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PriveScreenLogo } from "@/components/logo";
import { validateCode, type CodeValidation } from "@/lib/api/codes";

interface TestEntry {
  id: string;
  testName: string;
  yourValue: string;
  referenceRange: string;
  result: string;
}

export default function UploadResults() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"code" | "results" | "confirm">("code");
  const [assessmentCode, setAssessmentCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [codeValid, setCodeValid] = useState(false);
  const [validatedData, setValidatedData] = useState<CodeValidation | null>(null);
  const [tests, setTests] = useState<TestEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValidateCode = async () => {
    if (assessmentCode.length !== 12) return;

    setIsValidating(true);
    try {
      const response = await validateCode(assessmentCode);
      if (response.success && response.data && response.data.valid) {
        setCodeValid(true);
        setValidatedData(response.data);
        // Initialize with one empty test entry
        setTests([createEmptyTest()]);
        setStep("results");
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

  const createEmptyTest = (): TestEntry => ({
    id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    testName: "",
    yourValue: "",
    referenceRange: "",
    result: "",
  });

  const addTest = () => {
    setTests([...tests, createEmptyTest()]);
  };

  const removeTest = (id: string) => {
    if (tests.length > 1) {
      setTests(tests.filter(t => t.id !== id));
    }
  };

  const updateTest = (id: string, field: keyof TestEntry, value: string) => {
    setTests(tests.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleSubmit = () => {
    // Validate all fields are filled
    const incompleteTests = tests.filter(t => !t.testName || !t.yourValue || !t.referenceRange || !t.result);
    if (incompleteTests.length > 0) {
      toast({
        title: "Incomplete data",
        description: "Please fill in all fields for each test",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Results submitted successfully",
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
    setTests([]);
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
                <h1 className="text-xl font-bold">Enter Test Results</h1>
                <p className="text-sm text-muted-foreground">Diagnostic Center Portal</p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              {step === "code" ? "Step 1 of 3" : step === "results" ? "Step 2 of 3" : "Step 3 of 3"}
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
                (step === "results" || step === "confirm") ? "bg-primary/20 text-primary border-primary" : "bg-muted border-muted"
              }`}>
                {(step === "results" || step === "confirm") ? <CheckCircle2 className="h-5 w-5" /> : "1"}
              </div>
              <span className="font-medium hidden sm:inline">Validate Code</span>
            </div>
            <div className="flex-1 h-1 bg-border rounded">
              <div className={`h-full rounded transition-all duration-300 ${
                step === "results" || step === "confirm" ? "bg-primary w-full" : "bg-transparent w-0"
              }`} />
            </div>
            <div className={`flex items-center gap-2 ${step === "results" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step === "results" ? "bg-primary text-primary-foreground border-primary" :
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
                Enter the patient's assessment code to begin entering results
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

        {/* Step 2: Enter Results */}
        {step === "results" && validatedData && (
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
                    <span className="font-medium">{validatedData.testStandard?.name || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until: </span>
                    <span className="font-medium">{new Date(validatedData.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Privacy First:</strong> Enter only test results below. Do NOT include patient names or identifying information.
                Results are linked anonymously via the assessment code only.
              </AlertDescription>
            </Alert>

            {/* Test Entries */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Test Results</CardTitle>
                  <CardDescription>Enter the results for each test performed</CardDescription>
                </div>
                <Button onClick={addTest} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Test
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tests.map((test, index) => (
                    <Card key={test.id} className="p-4 bg-muted/30">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm">Test Name</Label>
                            <Input
                              placeholder="e.g., HIV 1/2"
                              value={test.testName}
                              onChange={(e) => updateTest(test.id, "testName", e.target.value)}
                              data-testid={`input-test-name-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Your Value</Label>
                            <Input
                              placeholder="e.g., Negative"
                              value={test.yourValue}
                              onChange={(e) => updateTest(test.id, "yourValue", e.target.value)}
                              data-testid={`input-your-value-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Reference Range</Label>
                            <Input
                              placeholder="e.g., Negative"
                              value={test.referenceRange}
                              onChange={(e) => updateTest(test.id, "referenceRange", e.target.value)}
                              data-testid={`input-reference-range-${index}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm">Result</Label>
                            <Input
                              placeholder="e.g., Normal"
                              value={test.result}
                              onChange={(e) => updateTest(test.id, "result", e.target.value)}
                              data-testid={`input-result-${index}`}
                            />
                          </div>
                        </div>
                        {tests.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive mt-6"
                            onClick={() => removeTest(test.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Assessment Code</p>
                    <p className="font-mono font-bold text-lg">{assessmentCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Test Type</p>
                    <p className="font-medium">{validatedData.testStandard?.name || "Unknown"}</p>
                  </div>
                </div>

                {/* Results Table */}
                <div>
                  <h4 className="font-semibold mb-3">Test Results Summary</h4>
                  <div className="border rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium">Test Name</th>
                          <th className="px-4 py-3 text-left font-medium">Your Value</th>
                          <th className="px-4 py-3 text-left font-medium">Reference Range</th>
                          <th className="px-4 py-3 text-left font-medium">Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map((test, idx) => (
                          <tr key={test.id} className={idx % 2 === 0 ? "" : "bg-muted/30"}>
                            <td className="px-4 py-3">{test.testName}</td>
                            <td className="px-4 py-3 font-medium">{test.yourValue}</td>
                            <td className="px-4 py-3 text-muted-foreground">{test.referenceRange}</td>
                            <td className="px-4 py-3 font-medium">{test.result}</td>
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
              <Button variant="outline" onClick={() => setStep("results")} className="h-12 px-8">
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
