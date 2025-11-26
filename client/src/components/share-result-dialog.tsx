import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Gift, UserCheck, Trash2, AlertCircle, ShieldAlert, MessageCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ShareResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resultId: string;
  sponsorInfo?: {
    name: string;
    type: string;
  };
}

// Mock active shares for this result
const mockActiveShares = [
  {
    id: "share-1",
    sharedWith: "dr.amina@healthclinic.ng",
    type: "email" as const,
    accessLevel: "full" as const,
    expiresAt: new Date("2024-12-14"),
    createdAt: new Date("2024-11-14"),
  },
];

export function ShareResultDialog({ open, onOpenChange, resultId, sponsorInfo }: ShareResultDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("share");
  const [shareWith, setShareWith] = useState("");
  const [shareType, setShareType] = useState<"email" | "phone">("email");
  const [accessLevel, setAccessLevel] = useState<"full" | "summary">("full");
  const [duration, setDuration] = useState("7");
  const [activeShares, setActiveShares] = useState(mockActiveShares);
  const [sponsorShared, setSponsorShared] = useState(false);
  const [showCoercionReport, setShowCoercionReport] = useState(false);
  const [coercionReport, setCoercionReport] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

  const handleShareWithSponsor = () => {
    setSponsorShared(true);
    toast({
      title: "Shared with Sponsor",
      description: `Your sponsor can now view your overall test status for ${duration} days`,
    });
  };

  const handleRevokeAccess = (shareId: string, recipient: string) => {
    setActiveShares(shares => shares.filter(s => s.id !== shareId));
    toast({
      title: "Access Revoked",
      description: `${recipient} can no longer view your results`,
    });
  };

  const handleRevokeSponsorAccess = () => {
    setSponsorShared(false);
    toast({
      title: "Sponsor Access Revoked",
      description: "Your sponsor can no longer view your results",
    });
  };

  const handleSubmitCoercionReport = async () => {
    if (!coercionReport.trim()) {
      toast({
        title: "Please describe your concern",
        description: "Tell us what's happening so we can help",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReport(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmittingReport(false);
    setCoercionReport("");
    setShowCoercionReport(false);

    toast({
      title: "Report Submitted Confidentially",
      description: "Our support team will review this privately. Stay safe.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Test Results</DialogTitle>
          <DialogDescription>
            Control who can see your results. You decide, you're in control.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share Results</TabsTrigger>
            <TabsTrigger value="manage">
              Manage Access
              {(activeShares.length > 0 || sponsorShared) && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 justify-center">
                  {activeShares.length + (sponsorShared ? 1 : 0)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6 mt-4">
            {/* Share with Sponsor Quick Option */}
            {sponsorInfo && !sponsorShared && (
              <Card className="p-4 border-primary/30 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Share with Your Sponsor</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {sponsorInfo.name} ({sponsorInfo.type}) sponsored this test.
                      You can share your results with them.
                    </p>
                    <div className="flex gap-2">
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleShareWithSponsor} size="sm">
                        Share with Sponsor
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {sponsorShared && (
              <Card className="p-4 border-green-500/30 bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <UserCheck className="h-5 w-5" />
                  <span className="font-medium">Shared with Sponsor</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your sponsor can view your overall test status.
                </p>
              </Card>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or share with others
                </span>
              </div>
            </div>

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
                  <SelectItem value="90">90 Days</SelectItem>
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

            {/* No Coercion Prevention Section */}
            <div className="pt-4 border-t">
              {!showCoercionReport ? (
                <button
                  onClick={() => setShowCoercionReport(true)}
                  className="w-full text-left p-3 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-rose-800 dark:text-rose-200 text-sm">
                        Feeling pressured to share?
                      </p>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                        If someone is forcing you to share your results, click here for confidential support.
                        Your safety matters to us.
                      </p>
                    </div>
                  </div>
                </button>
              ) : (
                <Card className="p-4 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="h-5 w-5 text-rose-600" />
                    <span className="font-semibold text-rose-800 dark:text-rose-200">Confidential Report</span>
                  </div>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mb-3">
                    This report is completely confidential. We take coercion seriously and will investigate discreetly.
                    You are NOT required to share your results with anyone.
                  </p>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Tell us what's happening. Who is pressuring you? How can we help? (Your identity will be protected)"
                      value={coercionReport}
                      onChange={(e) => setCoercionReport(e.target.value)}
                      rows={4}
                      className="bg-white dark:bg-gray-900"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCoercionReport(false);
                          setCoercionReport("");
                        }}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmitCoercionReport}
                        disabled={isSubmittingReport}
                        className="flex-1 bg-rose-600 hover:bg-rose-700"
                      >
                        {isSubmittingReport ? (
                          <>Submitting...</>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Submit Report
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-center text-rose-600 dark:text-rose-400">
                      🔒 This report is encrypted and only visible to our safety team
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Active Shares
              </h4>

              {sponsorShared && (
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Gift className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{sponsorInfo?.name || "Your Sponsor"}</p>
                        <p className="text-sm text-muted-foreground">{sponsorInfo?.type || "Sponsor"}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Expires in {duration} days</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleRevokeSponsorAccess}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              )}

              {activeShares.map((share) => (
                <Card key={share.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{share.sharedWith}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {share.accessLevel} access via {share.type}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Expires {share.expiresAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRevokeAccess(share.id, share.sharedWith)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {!sponsorShared && activeShares.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No active shares</p>
                  <p className="text-sm">Your results are completely private</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">Revoke Anytime</p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                    Click the trash icon to immediately revoke access. The recipient will no longer
                    be able to view your results.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
