import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { validateResetToken, resetPassword } from "@/lib/api/auth";

type PageState = "loading" | "valid" | "invalid" | "success";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  // Extract token from URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setPageState("invalid");
      return;
    }

    setToken(tokenParam);

    // Validate token
    validateResetToken(tokenParam).then((response) => {
      if (response.success && response.data?.valid) {
        setPageState("valid");
      } else {
        setPageState("invalid");
      }
    }).catch(() => {
      setPageState("invalid");
    });
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, newPassword });

      if (response.success) {
        setPageState("success");
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: response.error || "Failed to reset password",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {pageState === "loading" && (
              <CardContent className="pt-8 pb-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">Validating reset link...</p>
              </CardContent>
            )}

            {pageState === "invalid" && (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle>Invalid or Expired Link</CardTitle>
                  <CardDescription>
                    This password reset link is invalid or has expired.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Password reset links expire after 1 hour for security reasons.
                    Please request a new password reset link.
                  </p>
                  <Button
                    className="w-full"
                    onClick={() => setLocation("/auth/patient")}
                  >
                    Back to Login
                  </Button>
                </CardContent>
              </>
            )}

            {pageState === "valid" && (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Reset Your Password</CardTitle>
                  <CardDescription>
                    Enter your new password below
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password (min 8 chars)"
                          className="pl-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          className="pl-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {pageState === "success" && (
              <>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>Password Reset Complete</CardTitle>
                  <CardDescription>
                    Your password has been successfully reset
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      You can now log in with your new password.
                    </AlertDescription>
                  </Alert>
                  <Button
                    className="w-full"
                    onClick={() => setLocation("/auth/patient")}
                  >
                    Go to Login
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
