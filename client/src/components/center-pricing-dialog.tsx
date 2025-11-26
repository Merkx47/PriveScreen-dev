import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Check, Plus, Trash2, Package, TestTube } from "lucide-react";

interface CenterPricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TestService {
  id: string;
  name: string;
  price: string;
  enabled: boolean;
  turnaround: string;
}

interface TestPackage {
  id: string;
  name: string;
  price: string;
  tests: string[];
  enabled: boolean;
}

// Mock data for center's current pricing
const initialServices: TestService[] = [
  { id: "s1", name: "HIV 1&2 Antibody Test", price: "3500", enabled: true, turnaround: "24 hours" },
  { id: "s2", name: "Hepatitis B Surface Antigen", price: "3000", enabled: true, turnaround: "24 hours" },
  { id: "s3", name: "Hepatitis C Antibody", price: "3000", enabled: true, turnaround: "24 hours" },
  { id: "s4", name: "Syphilis VDRL", price: "2500", enabled: true, turnaround: "24 hours" },
  { id: "s5", name: "Gonorrhea PCR", price: "4500", enabled: true, turnaround: "48 hours" },
  { id: "s6", name: "Chlamydia PCR", price: "4500", enabled: true, turnaround: "48 hours" },
  { id: "s7", name: "Herpes HSV 1&2", price: "5000", enabled: false, turnaround: "48 hours" },
];

const initialPackages: TestPackage[] = [
  {
    id: "p1",
    name: "Comprehensive STI Panel",
    price: "12500",
    tests: ["HIV 1&2", "Hepatitis B", "Hepatitis C", "Syphilis", "Gonorrhea", "Chlamydia"],
    enabled: true,
  },
  {
    id: "p2",
    name: "HIV & Hepatitis Screening",
    price: "7500",
    tests: ["HIV 1&2", "Hepatitis B", "Hepatitis C"],
    enabled: true,
  },
  {
    id: "p3",
    name: "Basic STI Check",
    price: "5000",
    tests: ["Gonorrhea", "Chlamydia", "Syphilis"],
    enabled: true,
  },
];

export function CenterPricingDialog({ open, onOpenChange }: CenterPricingDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"services" | "packages">("services");
  const [services, setServices] = useState<TestService[]>(initialServices);
  const [packages, setPackages] = useState<TestPackage[]>(initialPackages);
  const [hasChanges, setHasChanges] = useState(false);

  const handleServicePriceChange = (id: string, price: string) => {
    setServices(services.map(s => s.id === id ? { ...s, price } : s));
    setHasChanges(true);
  };

  const handleServiceToggle = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    setHasChanges(true);
  };

  const handlePackagePriceChange = (id: string, price: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, price } : p));
    setHasChanges(true);
  };

  const handlePackageToggle = (id: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    setHasChanges(true);
  };

  const handleSave = () => {
    toast({
      title: "Pricing Updated",
      description: "Your test prices and packages have been saved successfully.",
    });
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Pricing & Services</DialogTitle>
          <DialogDescription>
            Set your test prices and manage available packages
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "services" ? "default" : "outline"}
            onClick={() => setActiveTab("services")}
            className="flex-1"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Individual Tests
          </Button>
          <Button
            variant={activeTab === "packages" ? "default" : "outline"}
            onClick={() => setActiveTab("packages")}
            className="flex-1"
          >
            <Package className="h-4 w-4 mr-2" />
            Test Packages
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {activeTab === "services" && (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg ${!service.enabled ? 'opacity-60 bg-muted/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {service.turnaround}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={service.enabled}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Label className="text-sm text-muted-foreground">Price (₦)</Label>
                    <Input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                      className="w-32 font-mono"
                      disabled={!service.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "packages" && (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-4 border rounded-lg ${!pkg.enabled ? 'opacity-60 bg-muted/30' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{pkg.name}</h4>
                      <div className="flex flex-wrap gap-1">
                        {pkg.tests.map((test, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Switch
                      checked={pkg.enabled}
                      onCheckedChange={() => handlePackageToggle(pkg.id)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Label className="text-sm text-muted-foreground">Package Price (₦)</Label>
                    <Input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => handlePackagePriceChange(pkg.id, e.target.value)}
                      className="w-32 font-mono"
                      disabled={!pkg.enabled}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <p className="text-sm text-muted-foreground">
            {hasChanges ? "You have unsaved changes" : "All changes saved"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
