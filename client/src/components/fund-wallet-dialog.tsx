import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Smartphone, Building2, Copy, Clock, CheckCircle2, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FundWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mobile money providers
const mobileMoneyProviders = [
  {
    id: 'mtn',
    name: 'MTN Mobile Money',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg',
    color: '#FFCC00',
  },
  {
    id: 'airtel',
    name: 'Airtel Money',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Airtel_logo-01.png',
    color: '#ED1C24',
  },
  {
    id: 'glo',
    name: 'Glo Mobile Money',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Globacom_Limited_Logo.png',
    color: '#50B848',
  },
  {
    id: '9mobile',
    name: '9mobile Money',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/9mobile_Nigeria_Logo.png',
    color: '#006B53',
  },
  {
    id: 'opay',
    name: 'OPay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/OPay_Logo.png',
    color: '#1DCF9F',
  },
  {
    id: 'palmpay',
    name: 'PalmPay',
    logo: 'https://play-lh.googleusercontent.com/Wd5H9-7LO7-hLXqvHCWvCVCqC8VC7FoXxuGTuK-GdKuZIoF2Vxz5U8xvLPWTrSGLOQ',
    color: '#6B2D83',
  },
];

// Generate random account number
function generateAccountNumber(): string {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// USSD Bank options
const ussdBanks = [
  {
    id: 'gtb',
    name: 'GTBank',
    code: '*737*',
    color: '#E35205',
    initials: 'GT'
  },
  {
    id: 'firstbank',
    name: 'First Bank',
    code: '*894*',
    color: '#003366',
    initials: 'FB'
  },
  {
    id: 'uba',
    name: 'UBA',
    code: '*919*',
    color: '#ED1C24',
    initials: 'UBA'
  },
  {
    id: 'zenith',
    name: 'Zenith Bank',
    code: '*966*',
    color: '#ED1C24',
    initials: 'ZB'
  },
  {
    id: 'access',
    name: 'Access Bank',
    code: '*901*',
    color: '#F47920',
    initials: 'AB'
  },
  {
    id: 'fidelity',
    name: 'Fidelity Bank',
    code: '*770*',
    color: '#0033A0',
    initials: 'FD'
  },
  {
    id: 'stanbic',
    name: 'Stanbic IBTC',
    code: '*909*',
    color: '#004A8F',
    initials: 'SI'
  },
  {
    id: 'fcmb',
    name: 'FCMB',
    code: '*329*',
    color: '#660066',
    initials: 'FC'
  },
];

// Rubies Bank Logo - local file
function RubiesLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/rubies-logo.png"
      alt="Rubies Bank"
      className={`object-contain ${className}`}
    />
  );
}

export function FundWalletDialog({ open, onOpenChange }: FundWalletDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("bank");

  // Mobile money state
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessingMobile, setIsProcessingMobile] = useState(false);

  // Bank transfer state
  const [bankDetails, setBankDetails] = useState<{
    accountNumber: string;
    accountName: string;
    bankName: string;
    expiresAt: Date;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isGeneratingAccount, setIsGeneratingAccount] = useState(false);

  // USSD state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [ussdCode, setUssdCode] = useState<string | null>(null);
  const [isGeneratingUssd, setIsGeneratingUssd] = useState(false);

  // Countdown timer for bank transfer
  useEffect(() => {
    if (!bankDetails) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = bankDetails.expiresAt.getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setBankDetails(null);
        toast({
          title: "Account Expired",
          description: "The temporary account has expired. Please generate a new one.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bankDetails, toast]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedProvider(null);
      setPhoneNumber("");
      setBankDetails(null);
      setAmount("");
      setSelectedBank(null);
      setUssdCode(null);
    }
  }, [open]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMobilePayment = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProvider) {
      toast({
        title: "Select Provider",
        description: "Please select a mobile money provider",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingMobile(true);

    // Simulate USSD prompt
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessingMobile(false);
    toast({
      title: "USSD Request Sent",
      description: `Check your phone for the ${mobileMoneyProviders.find(p => p.id === selectedProvider)?.name} prompt`,
    });
  };

  const handleGenerateBankAccount = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAccount(true);

    // Simulate Rubies Bank account generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    setBankDetails({
      accountNumber: generateAccountNumber(),
      accountName: "PriveScreen/Adebayo Okonkwo",
      bankName: "Rubies Bank",
      expiresAt,
    });
    setTimeRemaining(30 * 60);
    setIsGeneratingAccount(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const handleGenerateUssd = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBank) {
      toast({
        title: "Select Bank",
        description: "Please select your bank",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingUssd(true);

    // Simulate USSD code generation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const bank = ussdBanks.find(b => b.id === selectedBank);
    // Generate USSD code format: *bankcode*amount*merchantcode#
    const generatedCode = `${bank?.code}50*${Math.floor(amountNum)}*8012345678#`;
    setUssdCode(generatedCode);
    setIsGeneratingUssd(false);
  };

  const dialUssd = () => {
    if (ussdCode) {
      // On mobile, this would open the dialer
      window.location.href = `tel:${encodeURIComponent(ussdCode)}`;
      toast({
        title: "Opening Dialer",
        description: "Complete the transaction on your phone",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fund Wallet</DialogTitle>
          <DialogDescription>
            Add funds to your wallet to purchase sexual health tests
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (NGN)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              step="100"
              data-testid="input-amount"
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-sm text-muted-foreground">
                You will fund ₦{parseFloat(amount).toLocaleString()}
              </p>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bank" data-testid="tab-bank">
                <Building2 className="h-4 w-4 mr-1" />
                Transfer
              </TabsTrigger>
              <TabsTrigger value="mobile" data-testid="tab-mobile">
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </TabsTrigger>
              <TabsTrigger value="ussd" data-testid="tab-ussd">
                <Hash className="h-4 w-4 mr-1" />
                USSD
              </TabsTrigger>
            </TabsList>

            {/* Bank Transfer Tab */}
            <TabsContent value="bank" className="space-y-4 mt-4">
              {!bankDetails ? (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-20 h-20 mx-auto mb-1 rounded-xl overflow-hidden">
                      <RubiesLogo className="w-full h-full" />
                    </div>
                    <p className="font-semibold text-lg mb-1">Rubies Bank</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a temporary Rubies Bank account number to receive your transfer.
                      The account expires in 30 minutes.
                    </p>
                  </div>

                  <Button
                    onClick={handleGenerateBankAccount}
                    disabled={isGeneratingAccount || !amount}
                    className="w-full"
                    data-testid="button-generate-account"
                  >
                    {isGeneratingAccount ? (
                      <>Generating Account...</>
                    ) : (
                      <>Generate Account for ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Timer */}
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
                    timeRemaining < 300 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    <Clock className="h-5 w-5" />
                    <span className="font-mono text-lg font-bold">{formatTime(timeRemaining)}</span>
                    <span className="text-sm">remaining</span>
                  </div>

                  {/* Amount to transfer */}
                  <div className="bg-muted/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Transfer exactly</p>
                    <p className="text-3xl font-bold text-primary">₦{parseFloat(amount).toLocaleString()}</p>
                  </div>

                  {/* Bank Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden">
                          <RubiesLogo className="w-full h-full" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bank Name</p>
                          <p className="font-medium">{bankDetails.bankName}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.bankName, 'Bank name')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Account Number</p>
                        <p className="font-mono text-xl font-bold tracking-wider">{bankDetails.accountNumber}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-card border rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Account Name</p>
                        <p className="font-medium">{bankDetails.accountName}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountName, 'Account name')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setBankDetails(null)}
                    className="w-full"
                  >
                    Generate New Account
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Mobile Money Tab */}
            <TabsContent value="mobile" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Select your mobile money provider
              </p>

              <div className="grid grid-cols-2 gap-3">
                {mobileMoneyProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedProvider === provider.id
                        ? 'ring-2 ring-primary border-primary'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedProvider(provider.id)}
                    data-testid={`provider-${provider.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white"
                        style={{ border: `2px solid ${provider.color}20` }}
                      >
                        <img
                          src={provider.logo}
                          alt={provider.name}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${encodeURIComponent(provider.color)}"><circle cx="12" cy="12" r="10"/><text x="12" y="16" text-anchor="middle" fill="white" font-size="10">${provider.name[0]}</text></svg>`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{provider.name}</p>
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {selectedProvider && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08012345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      data-testid="input-phone"
                    />
                  </div>

                  <Button
                    onClick={handleMobilePayment}
                    disabled={isProcessingMobile || !amount || !phoneNumber}
                    className="w-full"
                    data-testid="button-pay-mobile"
                  >
                    {isProcessingMobile ? (
                      <>Sending USSD Request...</>
                    ) : (
                      <>Pay ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* USSD Tab */}
            <TabsContent value="ussd" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Pay directly from your bank account using USSD - no internet required
              </p>

              {!ussdCode ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {ussdBanks.map((bank) => (
                      <Card
                        key={bank.id}
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          selectedBank === bank.id
                            ? 'ring-2 ring-primary border-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedBank(bank.id)}
                        data-testid={`ussd-bank-${bank.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: bank.color }}
                          >
                            {bank.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{bank.name}</p>
                            <p className="text-xs text-muted-foreground">{bank.code}</p>
                          </div>
                          {selectedBank === bank.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <Button
                    onClick={handleGenerateUssd}
                    disabled={isGeneratingUssd || !amount || !selectedBank}
                    className="w-full"
                    data-testid="button-generate-ussd"
                  >
                    {isGeneratingUssd ? (
                      <>Generating USSD Code...</>
                    ) : (
                      <>Generate USSD Code for ₦{amount ? parseFloat(amount).toLocaleString() : '0'}</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-2">Dial this code on your phone</p>
                    <p className="text-2xl font-mono font-bold text-primary tracking-wider mb-4">
                      {ussdCode}
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(ussdCode, 'USSD code')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={dialUssd}
                      >
                        <Smartphone className="h-4 w-4 mr-1" />
                        Dial Now
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                    <p className="font-medium">Instructions:</p>
                    <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                      <li>Dial the USSD code above on your phone</li>
                      <li>Follow the prompts to authorize payment</li>
                      <li>Enter your bank PIN when requested</li>
                      <li>Your wallet will be credited automatically</li>
                    </ol>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setUssdCode(null);
                      setSelectedBank(null);
                    }}
                    className="w-full"
                  >
                    Generate New Code
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
