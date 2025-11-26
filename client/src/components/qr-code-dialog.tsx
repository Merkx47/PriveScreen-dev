import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef, useCallback } from "react";
import QRCode from "react-qr-code";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  patientName?: string;
  testType?: string;
}

export function QRCodeDialog({ open, onOpenChange, code, patientName, testType }: QRCodeDialogProps) {
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied",
      description: "Assessment code copied to clipboard",
    });
  };

  const downloadQR = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 250;
    canvas.height = 250;

    // Create image from SVG
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the QR code
      ctx.drawImage(img, 25, 25, 200, 200);

      // Download
      const link = document.createElement("a");
      link.download = `privescreen-qr-${code}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "QR Code Downloaded",
        description: "QR code image saved to your device",
      });
    };
    img.src = url;
  }, [code, toast]);

  // Create QR code data
  const qrData = JSON.stringify({
    type: "privescreen_assessment",
    code: code,
    v: 1
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Assessment QR Code
          </DialogTitle>
          <DialogDescription>
            Show this QR code at the diagnostic center for verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-6 bg-white flex flex-col items-center">
            <div ref={qrRef} className="bg-white p-4 rounded-lg" data-testid="qr-container">
              <QRCode
                value={qrData}
                size={180}
                level="M"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="font-mono text-lg font-bold tracking-widest text-black" data-testid="text-code">
                {code}
              </p>
              {patientName && (
                <p className="text-sm text-gray-600 mt-1">{patientName}</p>
              )}
              {testType && (
                <p className="text-xs text-gray-500">{testType}</p>
              )}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={copyCode} data-testid="button-copy">
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={downloadQR}
              data-testid="button-download"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium mb-1">Privacy Protected</p>
            <p className="text-xs">
              This code contains no personal health information.
              Only the diagnostic center can validate it against your test order.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
