import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  ArrowLeft,
  Crown,
  Home,
  MapPin,
  Clock,
  CheckCircle2,
  Star,
  Calendar as CalendarIcon,
  Shield,
  Lock,
  ChevronRight,
  Building2,
  Phone,
  AlertCircle
} from "lucide-react";
import { PriveScreenLogo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import {
  mockTestStandards,
  mockDiagnosticCenters,
  getHomeServiceCenters,
  getHomeServicePrice,
  mockWallet
} from "@/lib/mock-data";

type Step = "select-center" | "select-test" | "schedule" | "address" | "review" | "confirmed";

export default function BookHomeService() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("select-center");
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [address, setAddress] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+234 ");

  const homeServiceCenters = getHomeServiceCenters();
  const tests = mockTestStandards;
  const wallet = mockWallet;

  const selectedTestData = tests.find(t => t.id === selectedTest);
  const selectedCenterData = homeServiceCenters.find(c => c.centerId === selectedCenter);
  const selectedCenterDetails = selectedCenterData?.centerDetails;

  // Get price for selected test at selected center
  const getPrice = () => {
    if (!selectedCenter || !selectedTest) return 0;
    const price = getHomeServicePrice(selectedCenter, selectedTest);
    return price ? parseFloat(price) : 0;
  };

  // Generate time slots based on center's operating hours
  const getTimeSlots = () => {
    if (!selectedCenterData) return [];
    const { startHour, endHour } = selectedCenterData.operatingHours;
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      slots.push(`${displayHour}:00 ${ampm}`);
    }
    return slots;
  };

  // Check if a date is unavailable for the selected center
  const isDateUnavailable = (date: Date) => {
    if (!selectedCenterData) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Can't book in the past or today
    if (date <= today) return true;

    // Check if the day of week is in unavailable days
    return selectedCenterData.unavailableDays.includes(date.getDay());
  };

  // Format operating hours for display
  const formatOperatingHours = () => {
    if (!selectedCenterData) return "";
    const { startHour, endHour } = selectedCenterData.operatingHours;
    const formatHour = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return `${displayHour}:00 ${ampm}`;
    };
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  // Get unavailable days text
  const getUnavailableDaysText = () => {
    if (!selectedCenterData || selectedCenterData.unavailableDays.length === 0) return "Open every day";
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const closedDays = selectedCenterData.unavailableDays.map(d => dayNames[d]).join(', ');
    return `Closed on ${closedDays}`;
  };

  const handleNextStep = () => {
    const steps: Step[] = ["select-center", "select-test", "schedule", "address", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: Step[] = ["select-center", "select-test", "schedule", "address", "review"];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleConfirmBooking = () => {
    const price = getPrice();
    const balance = parseFloat(wallet.balance);

    if (balance < price) {
      toast({
        title: "Insufficient Balance",
        description: "Please fund your wallet to complete this booking",
        variant: "destructive",
      });
      return;
    }

    setStep("confirmed");
    toast({
      title: "Booking Confirmed!",
      description: "A phlebotomist will arrive at your location on the scheduled date.",
    });
  };

  const getStepNumber = () => {
    const steps: Step[] = ["select-center", "select-test", "schedule", "address", "review"];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  Prime Home Service
                </h1>
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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {step !== "confirmed" && (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold mb-2">Book Home Sample Collection</h2>
              <p className="text-muted-foreground">
                Get tested from the comfort and privacy of your home
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {["Center", "Test", "Schedule", "Address", "Review"].map((label, idx) => (
                <div key={label} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${idx < getStepNumber() ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      idx < getStepNumber()
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {idx < getStepNumber() - 1 ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block">{label}</span>
                  </div>
                  {idx < 4 && (
                    <div className={`flex-1 h-1 mx-1 ${
                      idx < getStepNumber() - 1 ? "bg-primary" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Step 1: Select Center */}
        {step === "select-center" && (
          <div className="space-y-6">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <Home className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                These centers offer home sample collection within their service areas. Prices include travel and convenience fee.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Diagnostic Center</Label>
              <div className="space-y-3">
                {homeServiceCenters.map((hsc) => {
                  const center = hsc.centerDetails;
                  if (!center) return null;

                  return (
                    <Card
                      key={hsc.centerId}
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedCenter === hsc.centerId ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedCenter(hsc.centerId)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{center.name}</h3>
                              {center.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{center.address}, {center.city}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {center.rating}
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Home className="h-3.5 w-3.5" />
                                {hsc.serviceRadius}km radius
                              </span>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
                            Home Service
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleNextStep} disabled={!selectedCenter}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Test */}
        {step === "select-test" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Select Test Package</Label>
              <p className="text-sm text-muted-foreground">
                Prices shown are for home service at {selectedCenterDetails?.name}
              </p>
              <div className="space-y-3">
                {tests.map((test) => {
                  const homePrice = selectedCenter ? getHomeServicePrice(selectedCenter, test.id) : null;

                  return (
                    <Card
                      key={test.id}
                      className={`cursor-pointer transition-all hover-elevate ${
                        selectedTest === test.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTest(test.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{test.name}</h3>
                              {(test as any).isDefault && (
                                <Badge variant="secondary" className="text-xs">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {test.testsIncluded.map((item, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Home Service Price</p>
                            <p className="font-bold text-lg">
                              ₦{homePrice ? parseFloat(homePrice).toLocaleString() : parseFloat(test.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button onClick={handleNextStep} disabled={!selectedTest}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule */}
        {step === "schedule" && (
          <div className="space-y-6">
            {/* Center operating info */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="font-medium">{selectedCenterDetails?.name}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Hours: {formatOperatingHours()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{getUnavailableDaysText()}</span>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Date</Label>
                <Card className="p-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setSelectedTime(""); // Reset time when date changes
                    }}
                    disabled={isDateUnavailable}
                    fromDate={new Date(Date.now() + 86400000)} // Tomorrow
                    toDate={new Date(Date.now() + 90 * 86400000)} // 90 days from now
                    className="mx-auto"
                  />
                </Card>
              </div>

              {/* Time Selection */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Time</Label>
                {selectedDate ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Available times for {selectedDate.toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {getTimeSlots().map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "default" : "outline"}
                          className="h-auto py-3"
                          onClick={() => setSelectedTime(slot)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot}
                        </Button>
                      ))}
                    </div>
                    {selectedTime && (
                      <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-200">
                          Appointment: {selectedDate.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Please select a date first</p>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button onClick={handleNextStep} disabled={!selectedDate || !selectedTime}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Address */}
        {step === "address" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Collection Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your full address including house/flat number, street, and landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Please provide detailed address for the phlebotomist to locate you easily
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="+234 XXX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The phlebotomist will call this number when arriving
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special instructions or accessibility notes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <Lock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Your address is kept confidential and only shared with the assigned phlebotomist for sample collection.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button onClick={handleNextStep} disabled={!address || phoneNumber.length < 10}>
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === "review" && (
          <div className="space-y-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Booking Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Test Package</p>
                    <p className="font-medium">{selectedTestData?.name}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnostic Center</p>
                    <p className="font-medium">{selectedCenterDetails?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedCenterDetails?.address}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Schedule</p>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString('en-NG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm">{selectedTime}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Collection Address</p>
                    <p className="font-medium">{address}</p>
                    <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold">₦{getPrice().toLocaleString()}</span>
                </div>

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <p>Wallet Balance: ₦{parseFloat(wallet.balance).toLocaleString()}</p>
                  {parseFloat(wallet.balance) < getPrice() && (
                    <p className="text-destructive mt-1">
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                      Insufficient balance. Please fund your wallet.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <span className="font-semibold">Privacy Guaranteed:</span> Your results will be anonymous and only accessible by you. The phlebotomist will not have access to your results.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevStep}>
                Back
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={parseFloat(wallet.balance) < getPrice()}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 6: Confirmed */}
        {step === "confirmed" && (
          <div className="space-y-6 text-center py-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                Your home service appointment has been scheduled
              </p>
            </div>

            <Card className="p-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString('en-NG', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedTime}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{selectedCenterDetails?.name}</p>
                    <p className="text-sm text-muted-foreground">Certified phlebotomist will visit</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{address}</p>
                    <p className="text-sm text-muted-foreground">{phoneNumber}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-muted/50 text-left">
              <h4 className="font-medium mb-3">What's Next?</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>You'll receive a confirmation SMS/email with booking details</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>The phlebotomist will call you 30 minutes before arrival</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Results will be available in your app within 24-48 hours</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1" asChild>
                <a href="/patient">Back to Dashboard</a>
              </Button>
              <Button className="flex-1" asChild>
                <a href="/history">View My Bookings</a>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
