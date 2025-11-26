import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, QrCode, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeDialog } from "@/components/qr-code-dialog";
import type { AssessmentCode } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AssessmentCodeCardProps {
  code: AssessmentCode;
  compact?: boolean;
}

export function AssessmentCodeCard({ code, compact = false }: AssessmentCodeCardProps) {
  const { toast } = useToast();
  const [showQR, setShowQR] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code.code);
    toast({
      title: "Code Copied",
      description: "Assessment code copied to clipboard",
    });
  };

  const getStatusBadge = () => {
    switch (code.status) {
      case 'pending':
        return <Badge variant="secondary" data-testid="badge-status"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'used':
        return <Badge variant="default" data-testid="badge-status"><CheckCircle2 className="h-3 w-3 mr-1" />Used</Badge>;
      case 'expired':
        return <Badge variant="destructive" data-testid="badge-status"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
    }
  };

  const getSponsorBadge = () => {
    if (code.sponsorType === 'self') return null;
    return <Badge variant="outline" data-testid="badge-sponsor">Sponsored by {code.sponsorType}</Badge>;
  };

  if (compact) {
    return (
      <Card data-testid={`card-code-${code.id}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <div className="font-mono text-lg font-bold tracking-widest" data-testid="text-code">
              {code.code}
            </div>
          </div>
          {getStatusBadge()}
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <div className="text-sm text-muted-foreground">
            Valid until {new Date(code.validUntil).toLocaleDateString()}
          </div>
          {getSponsorBadge()}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`card-code-${code.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Assessment Code</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Present this code at any approved diagnostic center
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-card border rounded-lg p-6 text-center space-y-4">
          <div className="text-4xl font-mono font-bold tracking-widest" data-testid="text-code">
            {code.code}
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyCode}
              data-testid="button-copy-code"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQR(true)}
              data-testid="button-qr"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Show QR
            </Button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient Name:</span>
            <span className="font-medium" data-testid="text-patient-name">{code.patientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Valid Until:</span>
            <span className="font-medium" data-testid="text-valid-until">
              {new Date(code.validUntil).toLocaleDateString()} 
              ({formatDistanceToNow(new Date(code.validUntil), { addSuffix: true })})
            </span>
          </div>
          {getSponsorBadge()}
        </div>

        {code.status === 'pending' && (
          <Button className="w-full" asChild data-testid="button-find-center">
            <a href="/centers">Find Diagnostic Center</a>
          </Button>
        )}
      </CardContent>

      <QRCodeDialog
        open={showQR}
        onOpenChange={setShowQR}
        code={code.code}
        patientName={code.patientName}
      />
    </Card>
  );
}
