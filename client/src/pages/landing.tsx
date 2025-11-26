import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Heart, Users, CheckCircle2, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { LanguageSelector } from "@/lib/i18n";
import { PriveScreenLogo } from "@/components/logo";

// Nigerian medical professionals slideshow images
const heroImages = [
  {
    url: "/hero-1.jpg",
    alt: "Nigerian medical professional",
    caption: "Professional Healthcare You Can Trust"
  },
  {
    url: "/hero-2.jpg",
    alt: "Nigerian healthcare team",
    caption: "Compassionate Care, Complete Privacy"
  },
  {
    url: "/hero-3.jpg",
    alt: "Nigerian diagnostic center",
    caption: "State-of-the-Art Diagnostic Services"
  },
  {
    url: "/hero-4.jpeg",
    alt: "Nigerian healthcare professional",
    caption: "Your Health, Your Control"
  },
  {
    url: "/hero-5.jpg",
    alt: "Nigerian medical team",
    caption: "Expert Teams Across Nigeria"
  }
];

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % heroImages.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + heroImages.length) % heroImages.length);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PriveScreenLogo size={32} className="md:w-9 md:h-9" />
            <h1 className="text-xl md:text-2xl font-bold">PriveScreen</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <LanguageSelector />
            <div className="hidden sm:flex gap-2">
              <Button variant="outline" size="sm" asChild data-testid="button-patient">
                <a href="/auth/patient">Patient</a>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="button-sponsor">
                <a href="/auth/sponsor">Sponsor</a>
              </Button>
              <Button variant="outline" size="sm" asChild data-testid="button-center">
                <a href="/auth/center">Center</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Slideshow */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            </div>
          ))}
        </div>

        {/* Slideshow Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium border border-white/20">
                <Globe className="h-4 w-4" />
                <span>Serving Nigeria & Expanding Across Africa</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
                Privacy-First Sexual Health Diagnostics
              </h2>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Make sexual health testing easy to access, confidential, and safe.
                Anonymous testing with complete control over your results.
              </p>
              {/* Dynamic caption from current slide */}
              <p className="text-sm text-primary-foreground/80 font-medium uppercase tracking-wider">
                {heroImages[currentSlide].caption}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" asChild data-testid="button-get-started" className="bg-primary hover:bg-primary/90">
                  <a href="/auth/patient">Get Started as Patient</a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-learn-more" className="text-white border-white/30 hover:bg-white/10">
                  <a href="#how-it-works">How It Works</a>
                </Button>
              </div>
              <div className="flex gap-3 text-sm text-white/70 mt-4">
                <a href="/auth/sponsor" className="hover:text-white transition-colors px-3 py-1 rounded-md" data-testid="link-sponsor">Sponsor Portal</a>
                <span>•</span>
                <a href="/auth/center" className="hover:text-white transition-colors px-3 py-1 rounded-md" data-testid="link-center">Diagnostic Center</a>
              </div>
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
                <PriveScreenLogo size={48} className="mb-4" />
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
              <a href="/auth/patient">Get Started Now</a>
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
