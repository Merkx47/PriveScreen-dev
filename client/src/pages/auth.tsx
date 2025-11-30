import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Mail, Lock, User, Phone, Building2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CenterOnboardingDialog } from "@/components/center-onboarding-dialog";
import { PriveScreenLogo } from "@/components/logo";
import { useLogin, useRegister, useGoogleAuth } from "@/lib/api/hooks";
import { getGoogleOAuthUrl, getMicrosoftOAuthUrl, resendVerificationEmail, forgotPassword } from "@/lib/api/auth";

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
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Email verification state
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendingVerification, setResendingVerification] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const config = portalConfig[portalType];

  // API mutations
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // SSO authentication - redirect to OAuth provider
  const handleSSO = async (provider: string) => {
    // All SSO providers coming soon for now
    toast({
      title: "Coming Soon",
      description: `${provider} Sign In will be available soon`,
    });
  };

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast({
        title: "Login Failed",
        description: "Please enter your email and password",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });

      if (response.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });

        // Redirect based on user role
        const userRole = response.data.user.role;
        if (userRole === 'admin') {
          setLocation('/admin');
        } else if (userRole === portalType) {
          setLocation(config.redirectPath);
        } else {
          // Redirect to appropriate portal based on actual role
          setLocation(`/${userRole}`);
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive"
      });
    }
  };

  // Signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Signup Failed",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength
    if (signupPassword.length < 8) {
      toast({
        title: "Signup Failed",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword) {
      toast({
        title: "Signup Failed",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        email: signupEmail,
        password: signupPassword,
        firstName: signupFirstName,
        lastName: signupLastName,
        phone: signupPhone || undefined,
        role: portalType,
      });

      if (response.success && response.data) {
        // Show verification pending state instead of redirecting
        setPendingVerificationEmail(response.data.email);
        setShowVerificationPending(true);
        toast({
          title: "Account Created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!pendingVerificationEmail) return;

    setResendingVerification(true);
    try {
      const response = await resendVerificationEmail(pendingVerificationEmail);
      if (response.success) {
        toast({
          title: "Email Sent",
          description: "A new verification link has been sent to your email.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message || "Could not resend verification email.",
        variant: "destructive"
      });
    } finally {
      setResendingVerification(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setSendingResetEmail(true);
    try {
      const response = await forgotPassword(forgotPasswordEmail);
      if (response.success) {
        setForgotPasswordSent(true);
        toast({
          title: "Email Sent",
          description: "If an account exists, you will receive a reset link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message || "Could not send reset email.",
        variant: "destructive"
      });
    } finally {
      setSendingResetEmail(false);
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

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
          {/* Forgot Password State */}
          {showForgotPassword ? (
            <Card className="shadow-lg">
              <CardContent className="pt-8 pb-8 space-y-6">
                {forgotPasswordSent ? (
                  <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Check Your Email</h2>
                      <p className="text-muted-foreground">
                        If an account exists for <span className="font-medium text-primary">{forgotPasswordEmail}</span>,
                        you will receive a password reset link.
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The link will expire in 1 hour.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordSent(false);
                        setForgotPasswordEmail("");
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-bold">Forgot Password?</h2>
                      <p className="text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={sendingResetEmail}>
                        {sendingResetEmail ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </form>
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Login
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : showVerificationPending ? (
            <Card className="shadow-lg">
              <CardContent className="pt-8 pb-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Check Your Email</h2>
                  <p className="text-muted-foreground">
                    We've sent a verification link to
                  </p>
                  <p className="font-medium text-primary">{pendingVerificationEmail}</p>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account and start using PriveScreen.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The link will expire in 24 hours.
                  </p>
                </div>
                <div className="pt-4 space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                  >
                    {resendingVerification ? "Sending..." : "Resend Verification Email"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setShowVerificationPending(false);
                      setActiveTab("login");
                    }}
                  >
                    Back to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
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
                      <Button
                        variant="link"
                        className="px-0 text-sm"
                        type="button"
                        onClick={() => {
                          setForgotPasswordEmail(loginEmail);
                          setShowForgotPassword(true);
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup" className="space-y-4 mt-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-firstname">First Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-firstname"
                            type="text"
                            placeholder="Adebayo"
                            className="pl-10"
                            value={signupFirstName}
                            onChange={(e) => setSignupFirstName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-lastname">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          type="text"
                          placeholder="Okonkwo"
                          value={signupLastName}
                          onChange={(e) => setSignupLastName(e.target.value)}
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
                      <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
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
                          placeholder="Create a password (min 8 chars)"
                          className="pl-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={8}
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
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
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
          )}

          {/* Portal switcher - hide when verification pending */}
          {!showVerificationPending && (
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
          )}

          {/* Center Onboarding CTA - only show for center portal and not when verification pending */}
          {portalType === "center" && !showVerificationPending && (
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
