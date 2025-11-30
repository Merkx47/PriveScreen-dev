import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Building2, Copy, Clock, CheckCircle2, Hash, Loader2, Construction } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInitializePayment } from "@/lib/api/hooks";

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

  // Bank transfer state
  const [bankDetails, setBankDetails] = useState<{
    accountNumber: string;
    accountName: string;
    bankName: string;
    expiresAt: Date;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // USSD state
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [ussdCode, setUssdCode] = useState<string | null>(null);

  // API hooks
  const initializePaymentMutation = useInitializePayment();

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

    initializePaymentMutation.mutate(
      { amount: amountNum.toString(), paymentMethod: 'mobile_money', provider: selectedProvider },
      {
        onSuccess: (data) => {
          toast({
            title: "USSD Request Sent",
            description: `Check your phone for the ${mobileMoneyProviders.find(p => p.id === selectedProvider)?.name} prompt`,
          });
        },
        onError: (error: any) => {
          // Fallback to simulation for demo
          toast({
            title: "USSD Request Sent",
            description: `Check your phone for the ${mobileMoneyProviders.find(p => p.id === selectedProvider)?.name} prompt`,
          });
        }
      }
    );
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

    initializePaymentMutation.mutate(
      { amount: amountNum.toString(), paymentMethod: 'bank_transfer' },
      {
        onSuccess: (data) => {
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 30);

          setBankDetails({
            accountNumber: generateAccountNumber(),
            accountName: "PriveScreen/User",
            bankName: "Rubies Bank",
            expiresAt,
          });
          setTimeRemaining(30 * 60);
        },
        onError: (error: any) => {
          // Fallback to simulation for demo
          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 30);

          setBankDetails({
            accountNumber: generateAccountNumber(),
            accountName: "PriveScreen/User",
            bankName: "Rubies Bank",
            expiresAt,
          });
          setTimeRemaining(30 * 60);
        }
      }
    );
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

    initializePaymentMutation.mutate(
      { amount: amountNum.toString(), paymentMethod: 'ussd', bank: selectedBank },
      {
        onSuccess: (data) => {
          const bank = ussdBanks.find(b => b.id === selectedBank);
          const generatedCode = `${bank?.code}50*${Math.floor(amountNum)}*8012345678#`;
          setUssdCode(generatedCode);
        },
        onError: (error: any) => {
          // Fallback to simulation for demo
          const bank = ussdBanks.find(b => b.id === selectedBank);
          const generatedCode = `${bank?.code}50*${Math.floor(amountNum)}*8012345678#`;
          setUssdCode(generatedCode);
        }
      }
    );
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
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
                <h3 className="font-semibold text-lg mb-2">Bank Transfer</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Fund your wallet via bank transfer. This payment method will be available soon.
                </p>
              </div>
            </TabsContent>

            {/* Mobile Money Tab */}
            <TabsContent value="mobile" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
                <h3 className="font-semibold text-lg mb-2">Mobile Money</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Pay with MTN MoMo, OPay, PalmPay and other mobile money providers. Coming soon.
                </p>
              </div>
            </TabsContent>

            {/* USSD Tab */}
            <TabsContent value="ussd" className="space-y-4 mt-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Hash className="h-8 w-8 text-muted-foreground" />
                </div>
                <Badge variant="secondary" className="mb-3">Coming Soon</Badge>
                <h3 className="font-semibold text-lg mb-2">USSD Banking</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Pay directly from your bank account using USSD codes. No internet required. Coming soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
