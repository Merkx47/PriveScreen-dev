import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Heart, Users, CheckCircle2, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">PriveScreen</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild data-testid="button-patient">
              <a href="/patient">Patient</a>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="button-sponsor">
              <a href="/sponsor">Sponsor</a>
            </Button>
            <Button variant="outline" size="sm" asChild data-testid="button-center">
              <a href="/center">Center</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Globe className="h-4 w-4" />
              <span>Serving Nigeria & Expanding Across Africa</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Privacy-First Sexual Health Diagnostics
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Make sexual health testing easy to access, confidential, and safe. 
              Anonymous testing with complete control over your results.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/patient">Get Started as Patient</a>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <a href="#how-it-works">How It Works</a>
              </Button>
            </div>
            <div className="flex gap-3 justify-center text-sm text-muted-foreground mt-4">
              <a href="/sponsor" className="hover:text-foreground hover-elevate px-3 py-1 rounded-md" data-testid="link-sponsor">Sponsor Portal</a>
              <span>•</span>
              <a href="/center" className="hover:text-foreground hover-elevate px-3 py-1 rounded-md" data-testid="link-center">Diagnostic Center</a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold mb-4">Why Choose PriveScreen</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've built a comprehensive platform that prioritizes your privacy while ensuring quality healthcare
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Complete Anonymity</CardTitle>
                <CardDescription>
                  Your results are stored without your name. You control who sees them and when.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Quality Assured</CardTitle>
                <CardDescription>
                  All diagnostic centers follow strict Sexual Health Test Standards for consistency.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Partner Sponsored</CardTitle>
                <CardDescription>
                  Employers, NGOs, or loved ones can sponsor tests while you maintain full privacy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold mb-4">How It Works</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to private, quality sexual health testing
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2">Order Your Test</h4>
                <p className="text-muted-foreground">
                  Fund your wallet and purchase a test package. You'll receive a unique Assessment Code tied to your name for verification only.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2">Visit Approved Center</h4>
                <p className="text-muted-foreground">
                  Find a nearby diagnostic center, present your code and ID for verification, and get tested using standardized procedures.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold mb-2">View & Share Results</h4>
                <p className="text-muted-foreground">
                  Access your anonymous results in-app. Share selectively with healthcare providers or sponsors using consent-based controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold mb-4">For Everyone</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              PriveScreen serves multiple stakeholders while protecting patient privacy
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="text-lg">Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Order tests anonymously</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Control who sees results</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Keep results in one place</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="text-lg">Sponsors</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Purchase codes for employees/partners</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Get completion notification only</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>No access to medical data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-3" />
                <CardTitle className="text-lg">Diagnostic Centers</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Validate assessment codes</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Follow standardized procedures</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Upload structured results</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Ready to Take Control of Your Sexual Health?
            </h3>
            <p className="text-lg text-muted-foreground">
              Join PriveScreen today and experience privacy-first healthcare
            </p>
            <Button size="lg" asChild data-testid="button-cta">
              <a href="/patient">Get Started Now</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 PriveScreen. Privacy-First | Quality-Assured | Consent-Driven</p>
        </div>
      </footer>
    </div>
  );
}
