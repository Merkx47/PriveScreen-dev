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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Nigerian Banks list for bank selection dropdown
const nigerianBanks = [
  "Access Bank",
  "Citibank Nigeria",
  "Ecobank Nigeria",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank",
  "Globus Bank",
  "Guaranty Trust Bank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Providus Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "SunTrust Bank",
  "Titan Trust Bank",
  "Union Bank of Nigeria",
  "United Bank for Africa",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
  accountType: "center" | "admin";
}

type Step = "form" | "confirm" | "processing" | "success";

export function WithdrawDialog({ open, onOpenChange, availableBalance, accountType }: WithdrawDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const balance = parseFloat(availableBalance);
  const withdrawAmount = parseFloat(amount) || 0;
  const minWithdrawal = 5000;
  const maxWithdrawal = balance;

  const isValidAmount = withdrawAmount >= minWithdrawal && withdrawAmount <= maxWithdrawal;
  const isFormValid = isValidAmount && bankName && accountNumber.length === 10 && accountName;

  const handleVerifyAccount = async () => {
    if (accountNumber.length !== 10) {
      toast({
        title: "Invalid account number",
        description: "Please enter a valid 10-digit account number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    // Simulate account verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock account name based on account type
    if (accountType === "center") {
      setAccountName("Lifebridge Medical Ltd");
    } else {
      setAccountName("PriveScreen Technologies Ltd");
    }
    setIsVerifying(false);

    toast({
      title: "Account verified",
      description: "Bank account details confirmed",
    });
  };

  const handleContinue = () => {
    if (!isFormValid) {
      toast({
        title: "Please complete all fields",
        description: "Ensure all details are correct before proceeding",
        variant: "destructive",
      });
      return;
    }
    setStep("confirm");
  };

  const handleSubmit = async () => {
    setStep("processing");
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep("success");
  };

  const resetDialog = () => {
    setStep("form");
    setAmount("");
    setBankName("");
    setAccountNumber("");
    setAccountName("");
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            {step === "form" && "Withdraw Funds"}
            {step === "confirm" && "Confirm Withdrawal"}
            {step === "processing" && "Processing..."}
            {step === "success" && "Withdrawal Initiated"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Transfer funds to your bank account"}
            {step === "confirm" && "Review your withdrawal details"}
            {step === "processing" && "Please wait while we process your request"}
            {step === "success" && "Your withdrawal has been submitted"}
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-6 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold">₦{parseFloat(availableBalance).toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Amount to Withdraw</Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: ₦{minWithdrawal.toLocaleString()} | Maximum: ₦{maxWithdrawal.toLocaleString()}
                </p>
              </div>

              <div>
                <Label>Bank</Label>
                <Select value={bankName} onValueChange={setBankName}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {nigerianBanks.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Account Number</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    type="text"
                    placeholder="10-digit account number"
                    value={accountNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAccountNumber(val);
                      setAccountName(""); // Reset account name when number changes
                    }}
                    maxLength={10}
                  />
                  <Button
                    variant="outline"
                    onClick={handleVerifyAccount}
                    disabled={accountNumber.length !== 10 || !bankName || isVerifying}
                  >
                    {isVerifying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
              </div>

              {accountName && (
                <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      {accountName}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Withdrawals are processed within 24 hours on business days.
                A fee of ₦50 applies to transfers below ₦50,000.
              </AlertDescription>
            </Alert>

            <Button onClick={handleContinue} className="w-full" disabled={!isFormValid}>
              Continue
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6 py-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">₦{withdrawAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bank</span>
                <span>{bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-mono">{accountNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Name</span>
                <span>{accountName}</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">Transfer Fee</span>
                <span>{withdrawAmount < 50000 ? "₦50" : "Free"}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>You'll Receive</span>
                <span>₦{(withdrawAmount - (withdrawAmount < 50000 ? 50 : 0)).toLocaleString()}</span>
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm">
                Please verify the account details are correct. Funds sent to the wrong account cannot be recovered.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Processing your withdrawal request...</p>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Withdrawal Submitted!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your withdrawal of ₦{withdrawAmount.toLocaleString()} has been submitted for processing.
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono">WDR-{Date.now().toString(36).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expected Arrival</span>
                <span>Within 24 hours</span>
              </div>
            </div>

            <Button onClick={() => handleClose(false)} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
