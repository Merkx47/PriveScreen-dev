import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: string;
}

export function ShareResultDialog({ open, onOpenChange, resultId }: ShareResultDialogProps) {
  const { toast } = useToast();
  const [shareWith, setShareWith] = useState("");
  const [shareType, setShareType] = useState<"email" | "phone">("email");
  const [accessLevel, setAccessLevel] = useState<"full" | "summary">("full");
  const [duration, setDuration] = useState("7");

  const handleShare = () => {
    if (!shareWith) {
      toast({
        title: "Missing Information",
        description: "Please enter an email or phone number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Results Shared",
      description: `Access granted for ${duration} days`,
    });
    onOpenChange(false);
    setShareWith("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Test Results</DialogTitle>
          <DialogDescription>
            Grant time-limited access to your test results. You can revoke access at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Share With</Label>
            <RadioGroup value={shareType} onValueChange={(v) => setShareType(v as "email" | "phone")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" data-testid="radio-email" />
                <Label htmlFor="email" className="font-normal cursor-pointer">Email Address</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="phone" id="phone" data-testid="radio-phone" />
                <Label htmlFor="phone" className="font-normal cursor-pointer">Phone Number</Label>
              </div>
            </RadioGroup>
            <Input
              placeholder={shareType === "email" ? "doctor@example.com" : "+234 XXX XXX XXXX"}
              value={shareWith}
              onChange={(e) => setShareWith(e.target.value)}
              type={shareType === "email" ? "email" : "tel"}
              data-testid="input-share-with"
            />
          </div>

          <div className="space-y-3">
            <Label>Access Level</Label>
            <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as "full" | "summary")}>
              <SelectTrigger data-testid="select-access-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Results - All test parameters and values</SelectItem>
                <SelectItem value="summary">Summary Only - Overall status only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Access Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger data-testid="select-duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">24 Hours</SelectItem>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-medium">Privacy Controls</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Recipient gets secure link to view results</li>
              <li>• Access expires automatically after set duration</li>
              <li>• You can revoke access anytime</li>
              <li>• All access attempts are logged</li>
            </ul>
          </div>

          <Button onClick={handleShare} className="w-full" data-testid="button-grant-access">
            Grant Access
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
