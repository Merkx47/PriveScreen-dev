import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, CheckCircle2, Upload, ArrowLeft } from "lucide-react";
import { ValidateCodeDialog } from "@/components/validate-code-dialog";
import { mockCenterTests } from "@/lib/mock-data";

export default function CenterHome() {
  const [codeInput, setCodeInput] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const recentTests = mockCenterTests;

  const handleValidate = () => {
    if (!codeInput) return;
    setShowValidate(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Lifebridge Medical Diagnostics</h1>
                <Badge variant="secondary" className="text-xs" data-testid="badge-role">Diagnostic Center</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="px-3 py-1" data-testid="badge-verified">Verified</Badge>
              <Button variant="ghost" size="icon" data-testid="button-back" asChild>
                <a href="/">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">Diagnostic Center Portal</h2>
          <p className="text-muted-foreground">Validate assessment codes and upload test results</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Validate Assessment Code</CardTitle>
              <CardDescription>
                Verify patient code before sample collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 12-digit code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  className="font-mono text-lg tracking-wider"
                  maxLength={12}
                  data-testid="input-assessment-code"
                />
                <Button 
                  onClick={handleValidate}
                  disabled={codeInput.length !== 12}
                  data-testid="button-validate-code"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Validate
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the patient's assessment code to verify their test package and identity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                Submit structured test results to platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" data-testid="button-upload-results">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Results
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tests Processed</CardTitle>
            <CardDescription>
              Tests conducted at your facility in the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTests.map((test) => (
                <div
                  key={test.id}
                  className="p-4 border rounded-lg"
                  data-testid={`card-test-${test.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold" data-testid={`text-test-code-${test.id}`}>Code: {test.code}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-patient-${test.id}`}>
                        Patient verified as: {test.patientName}
                      </p>
                    </div>
                    <Badge variant="default" data-testid={`badge-status-${test.id}`}>Completed</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Test Type</p>
                      <p className="font-medium" data-testid={`text-type-${test.id}`}>{test.testType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Test Date</p>
                      <p data-testid={`text-date-${test.id}`}>{test.testedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <ValidateCodeDialog 
        open={showValidate} 
        onOpenChange={setShowValidate}
        code={codeInput}
      />
    </div>
  );
}
