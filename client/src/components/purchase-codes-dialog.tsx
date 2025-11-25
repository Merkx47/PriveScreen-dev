import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockTestStandards } from "@/lib/mock-data";

interface PurchaseCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseCodesDialog({ open, onOpenChange }: PurchaseCodesDialogProps) {
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState("");
  const [recipientContact, setRecipientContact] = useState("");
  const [testType, setTestType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const tests = mockTestStandards;

  const selectedTest = tests.find(t => t.id === testType);

  const handlePurchase = () => {
    if (!recipientName || !recipientContact || !testType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Codes Purchased",
      description: `Assessment code sent to ${recipientContact}`,
    });
    onOpenChange(false);
    setRecipientName("");
    setRecipientContact("");
    setTestType("");
    setQuantity("1");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Purchase Assessment Codes</DialogTitle>
          <DialogDescription>
            Buy test codes for employees, partners, or beneficiaries
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                placeholder="John Doe or Employee #1234"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                data-testid="input-recipient-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientContact">Recipient Contact (Email or Phone)</Label>
              <Input
                id="recipientContact"
                placeholder="email@example.com or +234 XXX XXX XXXX"
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                data-testid="input-recipient-contact"
              />
              <p className="text-xs text-muted-foreground">
                Code will be sent to this email or phone number
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Test Package</Label>
              <div className="space-y-3">
                {tests.map((test) => (
                  <Card
                    key={test.id}
                    className={`cursor-pointer p-4 transition-all hover-elevate ${
                      testType === test.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setTestType(test.id)}
                    data-testid={`card-test-${test.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{test.name}</h3>
                        <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                          {test.testsIncluded.map((item, idx) => (
                            <li key={idx} className="flex gap-1">
                              <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Badge variant="secondary" className="text-base font-semibold">
                        ₦{test.price}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                data-testid="input-quantity"
              />
            </div>
          </div>

          {selectedTest && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Total Amount</span>
                <span className="text-2xl font-bold">
                  ₦{(parseFloat(selectedTest.price) * parseInt(quantity)).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {quantity} × {selectedTest.name} @ ₦{selectedTest.price} each
              </p>
            </div>
          )}

          <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
            <p className="font-medium">Privacy Guarantee:</p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• Recipient receives code via their contact method</li>
              <li>• Only recipient can activate and use the code</li>
              <li>• You receive anonymous completion notification only</li>
              <li>• Medical results remain private unless recipient shares</li>
            </ul>
          </div>

          <Button 
            onClick={handlePurchase} 
            className="w-full"
            disabled={!testType}
            data-testid="button-confirm-purchase"
          >
            Purchase & Send Codes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
