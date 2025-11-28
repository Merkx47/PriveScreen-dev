import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Crown,
  Home,
  Clock,
  CheckCircle2,
  Star,
  Shield,
  Zap,
  Gift,
  Percent,
  Phone,
  Heart,
  Sparkles
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { mockWallet } from "@/lib/mock-data";

type PlanType = "monthly" | "annual";

const PRIME_MONTHLY_PRICE = 5000; // NGN
const PRIME_ANNUAL_PRICE = 50000; // NGN (2 months free)

const primeFeatures = [
  {
    icon: Home,
    title: "Priority Home Service",
    description: "Book home sample collection with priority scheduling and dedicated phlebotomists"
  },
  {
    icon: Clock,
    title: "Express Results",
    description: "Get your results faster with priority processing (12-24 hours)"
  },
  {
    icon: Percent,
    title: "15% Discount on Tests",
    description: "Save on all test packages ordered through PriveScreen"
  },
  {
    icon: Phone,
    title: "24/7 Support Line",
    description: "Direct access to our medical support team anytime"
  },
  {
    icon: Gift,
    title: "Monthly Wellness Check",
    description: "Complimentary basic health check every month"
  },
  {
    icon: Shield,
    title: "Extended Result Storage",
    description: "Keep your results securely stored for up to 5 years"
  },
];

export default function GetPrime() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const wallet = mockWallet;

  const getPrice = () => {
    return selectedPlan === "monthly" ? PRIME_MONTHLY_PRICE : PRIME_ANNUAL_PRICE;
  };

  const getSavings = () => {
    if (selectedPlan === "annual") {
      return (PRIME_MONTHLY_PRICE * 12) - PRIME_ANNUAL_PRICE;
    }
    return 0;
  };

  const handleSubscribe = async () => {
    const price = getPrice();
    const balance = parseFloat(wallet.balance);

    if (balance < price) {
      toast({
        title: "Insufficient Balance",
        description: "Please fund your wallet to subscribe to Prime",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSubscribed(true);

    toast({
      title: "Welcome to Prime!",
      description: "You now have access to all Prime benefits",
    });
  };

  if (isSubscribed) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PriveScreenLogo size={32} />
                <div>
                  <h1 className="text-xl font-bold">PriveScreen Prime</h1>
                  <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" asChild>
                  <a href="/patient">
                    <ArrowLeft className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto">
              <Crown className="h-12 w-12 text-white" />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Prime!</h2>
              <p className="text-muted-foreground">
                You're now a PriveScreen Prime member
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Subscription Plan</span>
                  <Badge className="bg-amber-100 text-amber-800">
                    {selectedPlan === "monthly" ? "Monthly" : "Annual"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Next Billing Date</span>
                  <span>
                    {new Date(Date.now() + (selectedPlan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {primeFeatures.slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <feature.icon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href="/patient">Back to Dashboard</a>
              </Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700" asChild>
                <a href="/book-home-service">
                  <Home className="h-4 w-4 mr-2" />
                  Book Home Service
                </a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">PriveScreen Prime</h1>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">Premium</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" asChild>
                <a href="/patient">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Upgrade Your Health Experience</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Get <span className="text-amber-600">Prime</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium features including home sample collection, priority results, and exclusive discounts on all tests
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {primeFeatures.map((feature, idx) => (
            <Card key={idx} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <feature.icon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <Card
            className={`cursor-pointer transition-all ${
              selectedPlan === "monthly" ? "ring-2 ring-amber-500" : ""
            }`}
            onClick={() => setSelectedPlan("monthly")}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Monthly</span>
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                  {selectedPlan === "monthly" && (
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                  )}
                </div>
              </CardTitle>
              <CardDescription>Pay monthly, cancel anytime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">₦{PRIME_MONTHLY_PRICE.toLocaleString()}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>All Prime features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>Flexible cancellation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card
            className={`cursor-pointer transition-all relative ${
              selectedPlan === "annual" ? "ring-2 ring-amber-500" : ""
            }`}
            onClick={() => setSelectedPlan("annual")}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-green-600 text-white">Save ₦{getSavings().toLocaleString()}</Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Annual</span>
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                  {selectedPlan === "annual" && (
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                  )}
                </div>
              </CardTitle>
              <CardDescription>Best value - 2 months free!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-4xl font-bold">₦{PRIME_ANNUAL_PRICE.toLocaleString()}</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>All Prime features</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>2 months FREE</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Selected Plan</span>
                <span className="font-medium">{selectedPlan === "monthly" ? "Monthly" : "Annual"}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Total Amount</span>
                <span className="font-bold text-2xl">₦{getPrice().toLocaleString()}</span>
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>Wallet Balance: ₦{parseFloat(wallet.balance).toLocaleString()}</p>
                {parseFloat(wallet.balance) < getPrice() && (
                  <p className="text-destructive mt-1">
                    Insufficient balance. Please fund your wallet.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscribe Button */}
        <div className="space-y-4">
          <Button
            className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
            onClick={handleSubscribe}
            disabled={isProcessing || parseFloat(wallet.balance) < getPrice()}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Subscribe to Prime
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            You can cancel anytime from your account settings.
          </p>
        </div>

        {/* Testimonial */}
        <Card className="mt-12 bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-2">
                  "Prime has been a game-changer for me. The home service is so convenient, and I feel much more in control of my health. The priority results feature gives me peace of mind."
                </p>
                <p className="text-sm font-medium">- Verified Prime Member, Lagos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
