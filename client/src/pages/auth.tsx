import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, User, Phone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CenterOnboardingDialog } from "@/components/center-onboarding-dialog";
import { PriveScreenLogo } from "@/components/logo";

// SVG icons for SSO providers
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#F25022" d="M1 1h10v10H1z"/>
    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
    <path fill="#FFB900" d="M13 13h10v10H13z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

type PortalType = "patient" | "sponsor" | "center";

interface AuthPageProps {
  portalType: PortalType;
}

const portalConfig = {
  patient: {
    title: "Patient Portal",
    description: "Access your tests, results, and health records",
    color: "text-primary",
    redirectPath: "/patient"
  },
  sponsor: {
    title: "Sponsor Portal",
    description: "Manage sponsored tests for employees or beneficiaries",
    color: "text-blue-600",
    redirectPath: "/sponsor"
  },
  center: {
    title: "Diagnostic Center Portal",
    description: "Validate codes and upload test results",
    color: "text-green-600",
    redirectPath: "/center"
  }
};

export default function Auth({ portalType }: AuthPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const config = portalConfig[portalType];

  // Mock SSO authentication
  const handleSSO = async (provider: string) => {
    setIsLoading(true);

    // Simulate SSO authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Authentication Successful",
      description: `Signed in with ${provider}`,
    });

    // Store mock auth state
    localStorage.setItem("authUser", JSON.stringify({
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: `user@${provider.toLowerCase()}.com`,
      name: "Demo User",
      role: portalType,
      provider: provider
    }));

    setIsLoading(false);
    setLocation(config.redirectPath);
  };

  // Mock email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (loginEmail && loginPassword) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      localStorage.setItem("authUser", JSON.stringify({
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: loginEmail,
        name: loginEmail.split("@")[0],
        role: portalType,
        provider: "email"
      }));

      setLocation(config.redirectPath);
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  // Mock signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    // Simulate signup delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (signupName && signupEmail && signupPassword) {
      toast({
        title: "Account Created",
        description: "Welcome to PriveScreen!",
      });

      localStorage.setItem("authUser", JSON.stringify({
        id: "user-" + Math.random().toString(36).substr(2, 9),
        email: signupEmail,
        name: signupName,
        phone: signupPhone,
        role: portalType,
        provider: "email"
      }));

      setLocation(config.redirectPath);
    } else {
      toast({
        title: "Signup Failed",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <a href="/">
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="flex items-center gap-2">
              <PriveScreenLogo size={32} />
              <span className="text-xl font-bold">PriveScreen</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className={`text-2xl ${config.color}`}>
                {config.title}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* SSO Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium justify-center"
                  onClick={() => handleSSO("Google")}
                  disabled={isLoading}
                >
                  <div className="flex items-center" style={{ width: "200px" }}>
                    <div className="w-8 flex-shrink-0">
                      <GoogleIcon />
                    </div>
                    <span>Continue with Google</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium justify-center"
                  onClick={() => handleSSO("Microsoft")}
                  disabled={isLoading}
                >
                  <div className="flex items-center" style={{ width: "200px" }}>
                    <div className="w-8 flex-shrink-0">
                      <MicrosoftIcon />
                    </div>
                    <span>Continue with Microsoft</span>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium justify-center"
                  onClick={() => handleSSO("Apple")}
                  disabled={isLoading}
                >
                  <div className="flex items-center" style={{ width: "200px" }}>
                    <div className="w-8 flex-shrink-0">
                      <AppleIcon />
                    </div>
                    <span>Continue with Apple</span>
                  </div>
                </Button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Login/Signup Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 mt-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      <Button variant="link" className="px-0 text-sm">
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Adebayo Okonkwo"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+234 803 456 7890"
                          className="pl-10"
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          className="pl-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      By signing up, you agree to our{" "}
                      <a href="#" className="underline hover:text-foreground">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="underline hover:text-foreground">Privacy Policy</a>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Portal switcher */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Looking for a different portal?</p>
            <div className="flex gap-4 justify-center mt-2">
              {portalType !== "patient" && (
                <a href="/auth/patient" className="text-primary hover:underline">Patient</a>
              )}
              {portalType !== "sponsor" && (
                <a href="/auth/sponsor" className="text-blue-600 hover:underline">Sponsor</a>
              )}
              {portalType !== "center" && (
                <a href="/auth/center" className="text-green-600 hover:underline">Diagnostic Center</a>
              )}
            </div>
          </div>

          {/* Center Onboarding CTA - only show for center portal */}
          {portalType === "center" && (
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-200">New Diagnostic Center?</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Join the PriveScreen network and start offering verified sexual health testing services.
              </p>
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-700 hover:bg-green-100 dark:border-green-500 dark:text-green-300 dark:hover:bg-green-900"
                onClick={() => setShowOnboarding(true)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Apply to Join Network
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Center Onboarding Dialog */}
      <CenterOnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
      />
    </div>
  );
}
