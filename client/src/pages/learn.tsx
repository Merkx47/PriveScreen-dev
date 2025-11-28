import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Shield,
  Heart,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Stethoscope,
  Users,
  Clock,
  Phone,
  ExternalLink,
  MessageCircle
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

// Nigeria-specific STI statistics
const nigeriaStats = {
  hivPrevalence: "1.3%",
  hivAffected: "1.9 million",
  syphilisRate: "3.1%",
  chlamydiaRate: "6.5%",
  youthAffected: "24%",
  womenBurden: "56%",
};

// Common STIs information
const stiInfo = [
  {
    name: "HIV/AIDS",
    description: "Human Immunodeficiency Virus attacks the immune system. With treatment, people with HIV can live long, healthy lives.",
    symptoms: ["Often no symptoms for years", "Flu-like illness 2-4 weeks after infection", "Fatigue, weight loss", "Frequent infections"],
    transmission: "Blood, semen, vaginal fluids, breast milk",
    treatment: "Antiretroviral therapy (ART) - highly effective, free in Nigeria",
    windowPeriod: "2-12 weeks for antibody tests",
    curable: false,
    manageable: true,
  },
  {
    name: "Chlamydia",
    description: "One of the most common bacterial STIs. Often has no symptoms but can cause serious complications if untreated.",
    symptoms: ["Often no symptoms", "Unusual discharge", "Painful urination", "Lower abdominal pain"],
    transmission: "Vaginal, anal, or oral sex",
    treatment: "Antibiotics - single dose or short course",
    windowPeriod: "1-5 days",
    curable: true,
    manageable: true,
  },
  {
    name: "Gonorrhea",
    description: "Bacterial infection that can infect the genitals, rectum, and throat. Increasing antibiotic resistance is a concern.",
    symptoms: ["Discharge from penis/vagina", "Painful urination", "Sore throat", "Sometimes no symptoms"],
    transmission: "Vaginal, anal, or oral sex",
    treatment: "Dual antibiotic therapy",
    windowPeriod: "2-6 days",
    curable: true,
    manageable: true,
  },
  {
    name: "Syphilis",
    description: "Bacterial infection that progresses in stages. Highly treatable in early stages but can cause serious complications if untreated.",
    symptoms: ["Painless sore (chancre)", "Rash on body", "Flu-like symptoms", "Late stage: organ damage"],
    transmission: "Direct contact with syphilis sore",
    treatment: "Penicillin injection",
    windowPeriod: "3-6 weeks",
    curable: true,
    manageable: true,
  },
  {
    name: "Hepatitis B",
    description: "Viral infection affecting the liver. Vaccine is available and highly effective for prevention.",
    symptoms: ["Often no symptoms", "Jaundice (yellow skin/eyes)", "Dark urine", "Fatigue"],
    transmission: "Blood, semen, vaginal fluids",
    treatment: "Antiviral medications for chronic cases",
    windowPeriod: "4-10 weeks",
    curable: false,
    manageable: true,
    vaccineAvailable: true,
  },
  {
    name: "Herpes (HSV)",
    description: "Viral infection causing sores on the genitals or mouth. Very common and manageable with medication.",
    symptoms: ["Blisters or sores", "Itching or tingling", "Flu-like symptoms during outbreaks"],
    transmission: "Skin-to-skin contact with infected area",
    treatment: "Antiviral medications reduce outbreaks",
    windowPeriod: "2-12 days",
    curable: false,
    manageable: true,
  },
];

// FAQs about testing
const faqs = [
  {
    question: "Does getting tested mean I'm promiscuous?",
    answer: "No. Getting tested is a responsible health decision. Many STIs can be transmitted even with one partner, and some can be passed from mother to child. Regular testing is recommended for anyone who is sexually active, regardless of the number of partners.",
  },
  {
    question: "Will my results be shared with anyone?",
    answer: "Your test results are completely confidential. On PriveScreen, only you can see your detailed results. Your sponsor (if you have one) will only know that you completed a test, not your actual results. Medical staff are bound by confidentiality laws.",
  },
  {
    question: "What happens if I test positive?",
    answer: "First, don't panic. Most STIs are treatable, and many are curable. You'll be connected with healthcare providers who can explain your treatment options. Many treatments are free or low-cost in Nigeria. With proper care, you can still live a healthy, fulfilling life.",
  },
  {
    question: "How often should I get tested?",
    answer: "It depends on your situation. Generally: annually if sexually active, every 3-6 months if you have multiple partners, after any unprotected sex with a new partner, and immediately if you have symptoms or your partner tests positive.",
  },
  {
    question: "Is the test painful?",
    answer: "Most STI tests are simple and relatively painless. They may involve a blood sample (small needle prick), urine sample, or a swab. The brief discomfort is worth the peace of mind and health benefits.",
  },
  {
    question: "Can I test myself at home?",
    answer: "Some home testing kits are available, but they may not be as accurate as laboratory tests. PriveScreen offers both center-based testing and home sample collection by trained professionals for maximum accuracy and privacy.",
  },
  {
    question: "What if I'm scared of the results?",
    answer: "It's normal to feel anxious. But remember: not knowing doesn't protect you. Early detection means better outcomes. If you test positive, you'll have options and support. If you test negative, you'll have peace of mind. Either way, knowledge is power.",
  },
  {
    question: "Can I get an STI even if I use condoms?",
    answer: "Condoms significantly reduce risk but don't eliminate it completely. Some STIs like herpes and HPV can spread through skin-to-skin contact in areas not covered by condoms. That's why regular testing is still important even if you practice safe sex.",
  },
];

// Support resources
const supportResources = [
  {
    name: "NACA Helpline (National Agency for Control of AIDS)",
    phone: "6222",
    description: "Free HIV/AIDS information and referral services",
  },
  {
    name: "NHIS Helpline",
    phone: "0800 2255 6362",
    description: "National Health Insurance information",
  },
  {
    name: "Planned Parenthood (PPFN)",
    phone: "+234 1 774 8507",
    description: "Sexual and reproductive health services",
  },
];

export default function Learn() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <a href="/">
                  <ArrowLeft className="h-5 w-5" />
                </a>
              </Button>
              <div className="flex items-center gap-3">
                <PriveScreenLogo size={32} />
                <div>
                  <h1 className="text-xl font-bold">Learn About STIs</h1>
                  <p className="text-sm text-muted-foreground">Education & Resources</p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Understanding Sexual Health</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Knowledge is the first step to taking control of your health.
            Learn about STIs, testing, treatment, and how to protect yourself.
          </p>
        </div>

        {/* Nigeria Context Alert */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription>
            <span className="font-medium">STIs in Nigeria:</span> An estimated {nigeriaStats.hivAffected} Nigerians
            are living with HIV. {nigeriaStats.youthAffected} of new infections are among young people aged 15-24.
            Early testing and treatment can prevent complications and transmission.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stis">STI Types</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  What are STIs?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Sexually Transmitted Infections (STIs) are infections passed from one person
                  to another through sexual contact. They can be caused by bacteria, viruses, or parasites.
                </p>
                <p>
                  <strong>Key facts:</strong>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Many STIs have no symptoms, so testing is the only way to know for sure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Most STIs are treatable, and many are completely curable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Early detection leads to better health outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                    <span>Treatment prevents transmission to partners</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Nigeria STI Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>HIV Prevalence:</span>
                      <Badge variant="secondary">{nigeriaStats.hivPrevalence}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>People Living with HIV:</span>
                      <Badge variant="secondary">{nigeriaStats.hivAffected}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Syphilis Rate:</span>
                      <Badge variant="secondary">{nigeriaStats.syphilisRate}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Youth (15-24) New Infections:</span>
                      <Badge variant="secondary">{nigeriaStats.youthAffected}</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Women's Share of HIV Burden:</span>
                      <Badge variant="secondary">{nigeriaStats.womenBurden}</Badge>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    Prevention Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Use condoms correctly every time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get tested regularly with partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Limit number of sexual partners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Get vaccinated (Hepatitis B, HPV)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Communicate openly with partners</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Ready to Get Tested?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      PriveScreen offers confidential, judgment-free STI testing.
                      Your results are private and secure.
                    </p>
                    <div className="flex gap-2">
                      <Button asChild>
                        <a href="/patient">Order a Test</a>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="/centers">Find a Center</a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STI Types Tab */}
          <TabsContent value="stis" className="space-y-4">
            <p className="text-muted-foreground">
              Click on any STI to learn more about symptoms, treatment, and window periods.
            </p>
            <Accordion type="single" collapsible className="space-y-2">
              {stiInfo.map((sti, idx) => (
                <AccordionItem key={idx} value={`sti-${idx}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <span className="font-semibold">{sti.name}</span>
                      <div className="flex gap-1">
                        {sti.curable ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 text-xs">Curable</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Manageable</Badge>
                        )}
                        {sti.vaccineAvailable && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs">Vaccine Available</Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      <p className="text-sm">{sti.description}</p>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Common Symptoms</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {sti.symptoms.map((symptom, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Key Information</h4>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            <li><strong>Transmission:</strong> {sti.transmission}</li>
                            <li><strong>Treatment:</strong> {sti.treatment}</li>
                            <li><strong>Window Period:</strong> {sti.windowPeriod}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  The Testing Process
                </CardTitle>
                <CardDescription>What to expect when you get tested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">1</div>
                    <div>
                      <h4 className="font-medium">Order Your Test</h4>
                      <p className="text-sm text-muted-foreground">Choose a test package and select a center or home collection.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">2</div>
                    <div>
                      <h4 className="font-medium">Sample Collection</h4>
                      <p className="text-sm text-muted-foreground">Quick and discreet. Usually a blood sample and/or urine test.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">3</div>
                    <div>
                      <h4 className="font-medium">Laboratory Analysis</h4>
                      <p className="text-sm text-muted-foreground">Samples are tested at certified laboratories with high accuracy.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">4</div>
                    <div>
                      <h4 className="font-medium">Receive Results</h4>
                      <p className="text-sm text-muted-foreground">Results available in 12-24 hours, accessible only to you.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">5</div>
                    <div>
                      <h4 className="font-medium">Next Steps</h4>
                      <p className="text-sm text-muted-foreground">If needed, connect with healthcare providers for treatment and support.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-left text-sm hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <Heart className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>You are not alone.</strong> Whether you're waiting for results,
                processing a diagnosis, or supporting someone else, help is available.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Helplines & Resources (Nigeria)
                </CardTitle>
                <CardDescription>Free and confidential support services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportResources.map((resource, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                    </div>
                    <a
                      href={`tel:${resource.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-primary hover:underline font-medium"
                    >
                      <Phone className="h-4 w-4" />
                      {resource.phone}
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  If You Test Positive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Take a Breath</h4>
                      <p className="text-sm text-muted-foreground">
                        It's okay to feel scared, confused, or upset. These feelings are normal.
                        Remember: a positive result is not a death sentence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Seek Medical Care</h4>
                      <p className="text-sm text-muted-foreground">
                        Connect with a healthcare provider as soon as possible.
                        Many STI treatments are free in Nigeria. Early treatment = better outcomes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Inform Partners</h4>
                      <p className="text-sm text-muted-foreground">
                        This can be difficult, but it's important. Your recent sexual partners
                        should be tested too. PriveScreen can help with anonymous partner notification.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-primary">4</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Get Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Talk to someone you trust, or reach out to support groups.
                        You don't have to go through this alone.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                      Feeling Pressured or Unsafe?
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                      If you're being pressured to take a test, or if you're experiencing
                      domestic violence or coercion, help is available.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        WARIF Helpline: 0800 0000 321
                      </p>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Mirabel Centre: +234 1 461 9747
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
