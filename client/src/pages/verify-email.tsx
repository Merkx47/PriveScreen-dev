import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { verifyEmail, AuthResponse } from "@/lib/api/auth";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [userRole, setUserRole] = useState<string>("patient");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Invalid verification link. No token provided.");
      return;
    }

    // Call the verify-email API
    verifyEmail(token)
      .then((response) => {
        if (response.success && response.data) {
          setStatus("success");
          // Store the user's role for proper redirect
          setUserRole(response.data.user.role);
        } else {
          setStatus("error");
          setErrorMessage(response.message || "Verification failed. Please try again.");
        }
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error.message || "Verification failed. The link may have expired.");
      });
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <PriveScreenLogo size={40} />
            <span className="text-2xl font-bold">PriveScreen</span>
          </div>

          {status === "loading" && (
            <>
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verifying Your Email</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your email address...
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Email Verified!</h2>
                <p className="text-muted-foreground">
                  Your email has been successfully verified. You are now logged in.
                </p>
              </div>
              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    // Redirect based on user role
                    const roleRedirects: Record<string, string> = {
                      patient: "/patient",
                      sponsor: "/sponsor",
                      center: "/center",
                      admin: "/admin"
                    };
                    setLocation(roleRedirects[userRole] || "/patient");
                  }}
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => setLocation("/auth/patient")}
                >
                  Back to Login
                </Button>
                <p className="text-sm text-muted-foreground">
                  If you continue to have issues, please contact support.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
