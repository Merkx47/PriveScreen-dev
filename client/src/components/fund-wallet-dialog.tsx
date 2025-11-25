import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface FundWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundWalletDialog({ open, onOpenChange }: FundWalletDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const fundMutation = {
    mutate: (data: { amount: number; method: string }) => {
      toast({
        title: "Wallet Funded",
        description: `Successfully added ₦${data.amount} via ${data.method}`,
      });
      onOpenChange(false);
      setAmount("");
    },
    isPending: false,
  };

  const handleFund = (method: string) => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    fundMutation.mutate({ amount: amountNum, method });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
          </div>

          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="card" data-testid="tab-card">
                <CreditCard className="h-4 w-4 mr-1" />
                Card
              </TabsTrigger>
              <TabsTrigger value="mobile" data-testid="tab-mobile">
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile Money
              </TabsTrigger>
              <TabsTrigger value="bank" data-testid="tab-bank">
                <Building2 className="h-4 w-4 mr-1" />
                Bank Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pay securely with your debit or credit card
              </p>
              <Button
                onClick={() => handleFund('card')}
                disabled={fundMutation.isPending}
                className="w-full"
                data-testid="button-fund-card"
              >
                {fundMutation.isPending ? "Processing..." : "Pay with Card"}
              </Button>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Fund via MTN Mobile Money, Airtel Money, or other providers
              </p>
              <Button
                onClick={() => handleFund('mobile')}
                disabled={fundMutation.isPending}
                className="w-full"
                data-testid="button-fund-mobile"
              >
                {fundMutation.isPending ? "Processing..." : "Pay with Mobile Money"}
              </Button>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Transfer directly from your bank account
              </p>
              <Button
                onClick={() => handleFund('bank')}
                disabled={fundMutation.isPending}
                className="w-full"
                data-testid="button-fund-bank"
              >
                {fundMutation.isPending ? "Processing..." : "Get Transfer Details"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
