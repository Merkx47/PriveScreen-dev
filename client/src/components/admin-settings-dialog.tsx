import * as React from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Percent,
  Crown,
  Wallet,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlatformSettings {
  // Commission rates (percentages)
  testCommissionRate: number;

  // Prime settings
  primeMonthlyPrice: number;
  primeAnnualPrice: number;
  primeHomeServiceDiscount: number;
  primePriorityProcessingHours: number;

  // Withdrawal settings
  minWithdrawalAmount: number;
  withdrawalFeeThreshold: number;
  withdrawalFee: number;

  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  withdrawalAlerts: boolean;
  lowBalanceAlerts: boolean;
  newCenterAlerts: boolean;

  // Security
  twoFactorRequired: boolean;
  sessionTimeout: number;
}

const defaultSettings: PlatformSettings = {
  testCommissionRate: 15,

  primeMonthlyPrice: 5000,
  primeAnnualPrice: 48000,
  primeHomeServiceDiscount: 25,
  primePriorityProcessingHours: 12,

  minWithdrawalAmount: 5000,
  withdrawalFeeThreshold: 50000,
  withdrawalFee: 50,

  emailNotifications: true,
  smsNotifications: true,
  withdrawalAlerts: true,
  lowBalanceAlerts: true,
  newCenterAlerts: true,

  twoFactorRequired: false,
  sessionTimeout: 30,
};

export function AdminSettingsDialog({ open, onOpenChange }: AdminSettingsDialogProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof PlatformSettings>(
    key: K,
    value: PlatformSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);

    toast({
      title: "Settings saved",
      description: "Platform settings have been updated successfully",
    });
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && hasChanges) {
      // Could add confirmation dialog here
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </DialogTitle>
          <DialogDescription>
            Configure platform rates, pricing, and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="commissions" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="commissions">
              <Percent className="h-4 w-4 mr-2" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="prime">
              <Crown className="h-4 w-4 mr-2" />
              Prime
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <Wallet className="h-4 w-4 mr-2" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Commission Rates Tab */}
          <TabsContent value="commissions" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Commission Rates</CardTitle>
                <CardDescription>
                  Platform commission on each transaction type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Test Commission</Label>
                      <p className="text-sm text-muted-foreground">
                        Platform fee on all tests conducted at diagnostic centers
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.testCommissionRate}
                        onChange={(e) => updateSetting('testCommissionRate', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right"
                        min={0}
                        max={100}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prime Settings Tab */}
          <TabsContent value="prime" className="space-y-4 mt-4">
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-600" />
                  Prime Subscription Pricing
                </CardTitle>
                <CardDescription>
                  Set pricing for Prime membership tiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Monthly Price</Label>
                      <p className="text-sm text-muted-foreground">
                        Per month subscription cost
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={settings.primeMonthlyPrice}
                        onChange={(e) => updateSetting('primeMonthlyPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Annual Price</Label>
                      <p className="text-sm text-muted-foreground">
                        Yearly subscription (save {Math.round((1 - settings.primeAnnualPrice / (settings.primeMonthlyPrice * 12)) * 100)}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={settings.primeAnnualPrice}
                        onChange={(e) => updateSetting('primeAnnualPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prime Benefits</CardTitle>
                <CardDescription>
                  Configure Prime member benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Home Service Discount</Label>
                      <p className="text-sm text-muted-foreground">
                        Discount on home collection for Prime members
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.primeHomeServiceDiscount}
                        onChange={(e) => updateSetting('primeHomeServiceDiscount', parseFloat(e.target.value) || 0)}
                        className="w-20 text-right"
                        min={0}
                        max={100}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Priority Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Guaranteed result turnaround time
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={settings.primePriorityProcessingHours}
                        onChange={(e) => updateSetting('primePriorityProcessingHours', parseInt(e.target.value) || 0)}
                        className="w-20 text-right"
                        min={1}
                        max={72}
                      />
                      <span className="text-muted-foreground">hrs</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawal Settings Tab */}
          <TabsContent value="withdrawals" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payout Settings</CardTitle>
                <CardDescription>
                  Configure withdrawal limits and fees
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Minimum Withdrawal</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum amount for withdrawal requests
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={settings.minWithdrawalAmount}
                        onChange={(e) => updateSetting('minWithdrawalAmount', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Fee-Free Threshold</Label>
                      <p className="text-sm text-muted-foreground">
                        Withdrawals above this are free
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={settings.withdrawalFeeThreshold}
                        onChange={(e) => updateSetting('withdrawalFeeThreshold', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Withdrawal Fee</Label>
                      <p className="text-sm text-muted-foreground">
                        Fee for withdrawals below threshold
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={settings.withdrawalFee}
                        onChange={(e) => updateSetting('withdrawalFee', parseFloat(e.target.value) || 0)}
                        className="w-28 text-right"
                        min={0}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notification Preferences</CardTitle>
                <CardDescription>
                  Configure admin alerts and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive platform updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Critical alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Withdrawal Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify on new withdrawal requests
                    </p>
                  </div>
                  <Switch
                    checked={settings.withdrawalAlerts}
                    onCheckedChange={(checked) => updateSetting('withdrawalAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Low Balance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert when platform balance is low
                    </p>
                  </div>
                  <Switch
                    checked={settings.lowBalanceAlerts}
                    onCheckedChange={(checked) => updateSetting('lowBalanceAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Center Registration</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when new centers register
                    </p>
                  </div>
                  <Switch
                    checked={settings.newCenterAlerts}
                    onCheckedChange={(checked) => updateSetting('newCenterAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Admin account security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for admin login
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorRequired}
                    onCheckedChange={(checked) => updateSetting('twoFactorRequired', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto logout after inactivity
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 0)}
                      className="w-20 text-right"
                      min={5}
                      max={120}
                    />
                    <span className="text-muted-foreground">min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-amber-600 bg-amber-50 dark:bg-amber-950">
                Unsaved changes
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
