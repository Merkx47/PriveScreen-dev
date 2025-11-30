import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Mail,
  Shield,
  Copy,
  CheckCircle2,
  Info,
  Crown,
  Eye,
  Pencil,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ADMIN_ACCESS_LEVELS, type AdminAccessLevel } from "@shared/schema";

interface InviteAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "form" | "success";

// Generate a random invite code
const generateInviteCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function InviteAdminDialog({ open, onOpenChange }: InviteAdminDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState<AdminAccessLevel>("read_only");
  const [notes, setNotes] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");

  // Generated invite data
  const [generatedCode, setGeneratedCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const accessLevelInfo = {
    super_admin: {
      label: "Super Admin",
      description: "Full access including withdrawals and financial operations",
      icon: Crown,
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    editor: {
      label: "Editor",
      description: "Can edit and manage data but cannot delete or access financials",
      icon: Pencil,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    read_only: {
      label: "Read Only",
      description: "Can only view the dashboard, no modifications allowed",
      icon: Eye,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-800/50",
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter the admin's email address",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate invite code and link
    const code = generateInviteCode();
    const link = `${window.location.origin}/admin/auth?invite=${code}`;

    setGeneratedCode(code);
    setInviteLink(link);
    setStep("success");
    setIsLoading(false);

    toast({
      title: "Invite Created",
      description: `Admin invite sent to ${email}`,
    });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast({
      title: "Email Sent",
      description: `Invite email sent to ${email}`,
    });
  };

  const resetDialog = () => {
    setStep("form");
    setEmail("");
    setAccessLevel("read_only");
    setNotes("");
    setExpiryDays("7");
    setGeneratedCode("");
    setInviteLink("");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetDialog();
    }
    onOpenChange(open);
  };

  const AccessLevelIcon = accessLevelInfo[accessLevel].icon;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {step === "form" ? "Invite Admin" : "Invite Created"}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Send an invite code to add a new administrator"
              : "Share these credentials with the new admin"}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The invite code will be tied to this email address
              </p>
            </div>

            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select
                value={accessLevel}
                onValueChange={(v) => setAccessLevel(v as AdminAccessLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(accessLevelInfo).map(([key, info]) => {
                    const Icon = info.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${info.color}`} />
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {/* Access level info card */}
              <Card className={`${accessLevelInfo[accessLevel].bgColor} border-0`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <AccessLevelIcon
                      className={`h-4 w-4 mt-0.5 ${accessLevelInfo[accessLevel].color}`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {accessLevelInfo[accessLevel].label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {accessLevelInfo[accessLevel].description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Code Expiry</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Internal notes about this admin..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                The new admin will need both the invite code and access to the specified
                email to complete signup.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Invite..." : "Create Invite"}
            </Button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Invite created for <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {/* Invite Code */}
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedCode}
                  readOnly
                  className="font-mono text-center text-lg tracking-wider"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(generatedCode, "Invite code")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(inviteLink, "Invite link")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Access Level Badge */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Access Level</span>
              <Badge
                variant="secondary"
                className={accessLevelInfo[accessLevel].bgColor}
              >
                <AccessLevelIcon className={`h-3 w-3 mr-1 ${accessLevelInfo[accessLevel].color}`} />
                {accessLevelInfo[accessLevel].label}
              </Badge>
            </div>

            {/* Expiry Info */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Expires In</span>
              <span className="text-sm font-medium">{expiryDays} days</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleSendEmail}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Sending..." : "Send Email"}
              </Button>
              <Button
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                Done
              </Button>
            </div>

            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Shield className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                Share these credentials securely. The code can only be used with the specified email.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
