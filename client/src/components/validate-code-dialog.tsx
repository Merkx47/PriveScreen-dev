import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle2, User, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockCodeValidation } from "@/lib/mock-data";

interface ValidateCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
}

export function ValidateCodeDialog({ open, onOpenChange, code }: ValidateCodeDialogProps) {
  const { toast } = useToast();
  const codeData = mockCodeValidation;

  const handleProceed = () => {
    toast({
      title: "Code Validated",
      description: "You can now proceed with sample collection",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assessment Code Validation</DialogTitle>
          <DialogDescription>
            Verify patient identity with government-issued ID
          </DialogDescription>
        </DialogHeader>

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
                <p className="text-sm text-muted-foreground mb-1">Patient Name for Verification</p>
                <p className="font-semibold" data-testid="text-patient-name">{codeData.patientName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify with BVN, NIN, or government-issued ID
                </p>
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

          <div className="bg-muted/30 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Important:</p>
            <ul className="text-muted-foreground space-y-1 ml-4 text-xs">
              <li>• Verify patient identity matches the name on code</li>
              <li>• Follow PriveScreen Sexual Health Test Standards</li>
              <li>• Patient name will NOT appear on final report</li>
              <li>• Upload results within 48 hours of sample collection</li>
            </ul>
          </div>

          <Button onClick={handleProceed} className="w-full" data-testid="button-proceed">
            Proceed with Sample Collection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
