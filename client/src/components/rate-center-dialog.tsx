import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Star, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RateCenterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  centerName: string;
  centerId: string;
}

const ratingLabels = [
  { value: 1, label: "Poor", emoji: "😞" },
  { value: 2, label: "Fair", emoji: "😐" },
  { value: 3, label: "Good", emoji: "🙂" },
  { value: 4, label: "Very Good", emoji: "😊" },
  { value: 5, label: "Excellent", emoji: "🤩" },
];

const ratingCategories = [
  { id: "cleanliness", label: "Cleanliness" },
  { id: "professionalism", label: "Staff Professionalism" },
  { id: "wait_time", label: "Wait Time" },
  { id: "privacy", label: "Privacy & Confidentiality" },
];

export function RateCenterDialog({ open, onOpenChange, centerName, centerId }: RateCenterDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"rate" | "details" | "submitted">("rate");
  const [overallRating, setOverallRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [review, setReview] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev => ({ ...prev, [categoryId]: rating }));
  };

  const handleContinue = () => {
    if (overallRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select an overall rating",
        variant: "destructive",
      });
      return;
    }
    setStep("details");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep("submitted");
  };

  const handleClose = () => {
    // Reset state
    setStep("rate");
    setOverallRating(0);
    setCategoryRatings({});
    setReview("");
    setWouldRecommend(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md z-[9999]">
        <DialogHeader>
          <DialogTitle>
            {step === "submitted" ? "Thank You!" : "Rate Your Experience"}
          </DialogTitle>
          <DialogDescription>
            {step === "rate" && `How was your experience at ${centerName}?`}
            {step === "details" && "Help others by sharing more details"}
            {step === "submitted" && "Your feedback helps improve our network"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Overall Rating */}
        {step === "rate" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Tap a star to rate
              </p>
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setOverallRating(star);
                      setHoveredRating(0);
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="p-2 focus:outline-none"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || overallRating)
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-3 h-6">
                {(hoveredRating || overallRating) > 0 && (
                  <p className="font-medium text-muted-foreground">
                    {ratingLabels[(hoveredRating || overallRating) - 1]?.label}
                  </p>
                )}
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full" disabled={overallRating === 0}>
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Detailed Ratings */}
        {step === "details" && (
          <div className="space-y-6">
            {/* Category Ratings */}
            <div className="space-y-4">
              <Label>Rate specific aspects (optional)</Label>
              {ratingCategories.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <span className="text-sm">{category.label}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCategoryRating(category.id, star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            star <= (categoryRatings[category.id] || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Would Recommend */}
            <div className="space-y-2">
              <Label>Would you recommend this center?</Label>
              <div className="flex gap-3">
                <Card
                  className={`flex-1 p-4 cursor-pointer text-center transition-all ${
                    wouldRecommend === true
                      ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950"
                      : "hover:border-green-500"
                  }`}
                  onClick={() => setWouldRecommend(true)}
                >
                  <ThumbsUp className={`h-6 w-6 mx-auto mb-1 ${
                    wouldRecommend === true ? "text-green-600" : "text-muted-foreground"
                  }`} />
                  <span className={`text-sm font-medium ${
                    wouldRecommend === true ? "text-green-700 dark:text-green-300" : ""
                  }`}>Yes</span>
                </Card>
                <Card
                  className={`flex-1 p-4 cursor-pointer text-center transition-all ${
                    wouldRecommend === false
                      ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950"
                      : "hover:border-red-500"
                  }`}
                  onClick={() => setWouldRecommend(false)}
                >
                  <ThumbsDown className={`h-6 w-6 mx-auto mb-1 ${
                    wouldRecommend === false ? "text-red-600" : "text-muted-foreground"
                  }`} />
                  <span className={`text-sm font-medium ${
                    wouldRecommend === false ? "text-red-700 dark:text-red-300" : ""
                  }`}>No</span>
                </Card>
              </div>
            </div>

            {/* Written Review */}
            <div className="space-y-2">
              <Label htmlFor="review">Write a review (optional)</Label>
              <Textarea
                id="review"
                placeholder="Share your experience... (e.g., staff friendliness, wait time, cleanliness)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Your review will be anonymous to protect your privacy
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("rate")} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Submitted */}
        {step === "submitted" && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold mb-2">Review Submitted!</p>
              <p className="text-sm text-muted-foreground">
                Thank you for helping improve our diagnostic center network.
                Your feedback is valuable to us and other patients.
              </p>
            </div>
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= overallRating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
