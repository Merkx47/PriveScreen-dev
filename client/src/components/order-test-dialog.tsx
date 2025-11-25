import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { TestStandard } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { mockTestStandards } from "@/lib/mock-data";

interface OrderTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderTestDialog({ open, onOpenChange }: OrderTestDialogProps) {
  const { toast } = useToast();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const tests = mockTestStandards;
  const isLoading = false;

  const orderMutation = {
    mutate: (testStandardId: string) => {
      const test = tests.find(t => t.id === testStandardId);
      toast({
        title: "Test Ordered",
        description: `Assessment code generated for ${test?.name}`,
      });
      onOpenChange(false);
      setSelectedTest(null);
    },
    isPending: false,
  };

  const handleOrder = () => {
    if (selectedTest) {
      orderMutation.mutate(selectedTest);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Sexual Health Test</DialogTitle>
          <DialogDescription>
            Select a test package to generate your assessment code
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => (
              <Card
                key={test.id}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedTest === test.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTest(test.id)}
                data-testid={`card-test-${test.id}`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription className="mt-1">{test.description}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    ₦{test.price}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">What's Included:</p>
                    <ul className="grid grid-cols-2 gap-2">
                      {test.testsIncluded.map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {test.turnaroundTime && (
                      <p className="text-sm text-muted-foreground mt-3">
                        Results in: {test.turnaroundTime}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              onClick={handleOrder}
              disabled={!selectedTest || orderMutation.isPending}
              className="w-full"
              data-testid="button-confirm-order"
            >
              {orderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Order Test'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
