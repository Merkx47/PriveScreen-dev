import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Mail, User, AlertCircle, KeyRound, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { adminLogin, verifyOtp, resendOtp, adminRegister, validateInvite } from "@/lib/api/admin";

type AuthStep = "credentials" | "otp" | "registration_success";

export default function AdminAuth() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("credentials");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");

  // Registration success state
  const [registeredEmail, setRegisteredEmail] = useState("");

  // OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStep === "otp" && otpExpiry > 0) {
      interval = setInterval(() => {
        setOtpExpiry((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, otpExpiry]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedValue.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await adminLogin({ email: loginEmail, password: loginPassword });

      if (response.success && response.data) {
        setUserId(response.data.userId);
        toast({
          title: "Verification Required",
          description: response.data.message || "A 6-digit code has been sent to your email",
        });
        setAuthStep("otp");
        setOtpExpiry(300); // Reset timer
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);

        // Focus first OTP input after transition
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to connect to server. Please try again.";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Session Expired",
        description: "Please start the login process again",
        variant: "destructive",
      });
      setAuthStep("credentials");
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyOtp({ userId, otp: otpCode });

      if (response.success && response.data) {
        toast({
          title: "Welcome back!",
          description: "You are now logged in as admin",
        });
        setLocation("/admin/dashboard");
      } else {
        toast({
          title: "Verification Failed",
          description: response.error || "Invalid or expired code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Unable to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId) {
      toast({
        title: "Session Expired",
        description: "Please start the login process again",
        variant: "destructive",
      });
      setAuthStep("credentials");
      return;
    }

    setIsLoading(true);
    try {
      const response = await resendOtp(userId);

      if (response.success) {
        toast({
          title: "Code Resent",
          description: "A new verification code has been sent to your email",
        });
        setOtpExpiry(300);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      } else {
        toast({
          title: "Resend Failed",
          description: response.error || "Unable to resend code",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to connect to server. Please try again.";
      toast({
        title: "Resend Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setAuthStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setOtpExpiry(300);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupFirstName || !signupLastName || !signupEmail || !signupPassword || !signupConfirmPassword || !adminCode) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (adminCode.length < 6) {
      toast({
        title: "Invalid Admin Code",
        description: "Please enter a valid admin invite code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Normalize email to lowercase
      const normalizedEmail = signupEmail.trim().toLowerCase();

      // First validate the invite code
      const validateResponse = await validateInvite({ code: adminCode, email: normalizedEmail });

      if (!validateResponse.success) {
        toast({
          title: "Invalid Invite Code",
          description: validateResponse.error || "The invite code is invalid or has expired",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Register the admin
      const response = await adminRegister({
        email: normalizedEmail,
        password: signupPassword,
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        inviteCode: adminCode,
      });

      if (response.success && response.data) {
        // Show success state instead of auto-login
        setRegisteredEmail(signupEmail);
        setAuthStep("registration_success");
        toast({
          title: "Account Created!",
          description: "Your admin account has been created successfully.",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: response.error || "Unable to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to connect to server. Please try again.";
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">PriveScreen Admin</h1>
                <p className="text-sm text-muted-foreground">Management Portal</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          {authStep === "registration_success" ? (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Account Created Successfully!</CardTitle>
                <CardDescription className="space-y-2">
                  <span className="block">Your admin account has been created for</span>
                  <span className="block font-medium text-primary">{registeredEmail}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You can now sign in to access the admin dashboard. For security,
                    you'll need to verify your identity with a one-time code sent to your email.
                  </p>
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <Shield className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200 text-xs">
                      Your account is ready. Please sign in to continue.
                    </AlertDescription>
                  </Alert>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setLoginEmail(registeredEmail);
                    setAuthStep("credentials");
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue to Sign In
                </Button>
              </CardContent>
            </>
          ) : authStep === "credentials" ? (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>
                  Sign in or create an admin account to manage PriveScreen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="admin@privescreen.com"
                            className="pl-10"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            className="pl-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Continue"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        Admin registration requires a valid invite code sent to your email by an existing admin.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="signup-firstname">First Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="signup-firstname"
                              type="text"
                              placeholder="First name"
                              className="pl-10"
                              value={signupFirstName}
                              onChange={(e) => setSignupFirstName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-lastname">Last Name</Label>
                          <Input
                            id="signup-lastname"
                            type="text"
                            placeholder="Last name"
                            value={signupLastName}
                            onChange={(e) => setSignupLastName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="admin@privescreen.com"
                            className="pl-10"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a password"
                            className="pl-10"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-confirm"
                            type="password"
                            placeholder="Confirm your password"
                            className="pl-10"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-code">Admin Invite Code</Label>
                        <div className="relative">
                          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="admin-code"
                            type="text"
                            placeholder="Enter invite code from email"
                            className="pl-10 font-mono"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Verify Your Identity</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{loginEmail}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Input */}
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (otpInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                      {otpExpiry > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Code expires in <span className="font-mono font-medium text-foreground">{formatTime(otpExpiry)}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-destructive">Code has expired</p>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading || otp.join("").length !== 6}>
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                </form>

                {/* Resend & Back buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleResendOtp}
                    disabled={isLoading || !canResend}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {canResend ? "Resend Code" : "Resend code available after expiry"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleBackToLogin}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </div>

                {/* Security notice */}
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs">
                    For security, all admin logins require OTP verification. Never share your code with anyone.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </>
          )}
        </Card>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary">Back to PriveScreen</a>
        </div>
      </footer>
    </div>
  );
}
