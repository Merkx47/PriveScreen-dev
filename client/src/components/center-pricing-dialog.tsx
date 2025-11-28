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
  turnaroundHours: number;
  isCustom?: boolean;
}

interface TestPackage {
  id: string;
  name: string;
  price: string;
  tests: string[];
  enabled: boolean;
  turnaroundHours: number;
  isCustom?: boolean;
}

// Mock data for center's current pricing
const initialServices: TestService[] = [
  { id: "s1", name: "HIV 1&2 Antibody Test", price: "3500", enabled: true, turnaroundHours: 24 },
  { id: "s2", name: "Hepatitis B Surface Antigen", price: "3000", enabled: true, turnaroundHours: 24 },
  { id: "s3", name: "Hepatitis C Antibody", price: "3000", enabled: true, turnaroundHours: 24 },
  { id: "s4", name: "Syphilis VDRL", price: "2500", enabled: true, turnaroundHours: 24 },
  { id: "s5", name: "Gonorrhea PCR", price: "4500", enabled: true, turnaroundHours: 48 },
  { id: "s6", name: "Chlamydia PCR", price: "4500", enabled: true, turnaroundHours: 48 },
  { id: "s7", name: "Herpes HSV 1&2", price: "5000", enabled: false, turnaroundHours: 48 },
];

const initialPackages: TestPackage[] = [
  {
    id: "p1",
    name: "Comprehensive STI Panel",
    price: "12500",
    tests: ["HIV 1&2", "Hepatitis B", "Hepatitis C", "Syphilis", "Gonorrhea", "Chlamydia"],
    enabled: true,
    turnaroundHours: 48,
  },
  {
    id: "p2",
    name: "HIV & Hepatitis Screening",
    price: "7500",
    tests: ["HIV 1&2", "Hepatitis B", "Hepatitis C"],
    enabled: true,
    turnaroundHours: 24,
  },
  {
    id: "p3",
    name: "Basic STI Check",
    price: "5000",
    tests: ["Gonorrhea", "Chlamydia", "Syphilis"],
    enabled: true,
    turnaroundHours: 48,
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

  const handleServiceTurnaroundChange = (id: string, hours: number) => {
    setServices(services.map(s => s.id === id ? { ...s, turnaroundHours: hours } : s));
    setHasChanges(true);
  };

  const handleServiceNameChange = (id: string, name: string) => {
    setServices(services.map(s => s.id === id ? { ...s, name } : s));
    setHasChanges(true);
  };

  const handleAddService = () => {
    const newService: TestService = {
      id: `s-${Date.now()}`,
      name: "",
      price: "0",
      enabled: true,
      turnaroundHours: 24,
      isCustom: true,
    };
    setServices([...services, newService]);
    setHasChanges(true);
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
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

  const handlePackageNameChange = (id: string, name: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, name } : p));
    setHasChanges(true);
  };

  const handlePackageTurnaroundChange = (id: string, hours: number) => {
    setPackages(packages.map(p => p.id === id ? { ...p, turnaroundHours: hours } : p));
    setHasChanges(true);
  };

  const handlePackageTestsChange = (id: string, testsString: string) => {
    const tests = testsString.split(',').map(t => t.trim()).filter(t => t);
    setPackages(packages.map(p => p.id === id ? { ...p, tests } : p));
    setHasChanges(true);
  };

  const handleAddPackage = () => {
    const newPackage: TestPackage = {
      id: `p-${Date.now()}`,
      name: "",
      price: "0",
      tests: [],
      enabled: true,
      turnaroundHours: 24,
      isCustom: true,
    };
    setPackages([...packages, newPackage]);
    setHasChanges(true);
  };

  const handleDeletePackage = (id: string) => {
    setPackages(packages.filter(p => p.id !== id));
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
                      {service.isCustom ? (
                        <Input
                          value={service.name}
                          onChange={(e) => handleServiceNameChange(service.id, e.target.value)}
                          placeholder="Enter test name"
                          className="font-medium mb-2"
                          disabled={!service.enabled}
                        />
                      ) : (
                        <h4 className="font-medium mb-2">{service.name}</h4>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {service.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">Price (₦)</Label>
                      <Input
                        type="number"
                        value={service.price}
                        onChange={(e) => handleServicePriceChange(service.id, e.target.value)}
                        className="w-28 font-mono"
                        disabled={!service.enabled}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">Turnaround</Label>
                      <Input
                        type="number"
                        value={service.turnaroundHours}
                        onChange={(e) => handleServiceTurnaroundChange(service.id, parseInt(e.target.value) || 0)}
                        className="w-20 font-mono"
                        disabled={!service.enabled}
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddService}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Test
              </Button>
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
                      {pkg.isCustom ? (
                        <Input
                          value={pkg.name}
                          onChange={(e) => handlePackageNameChange(pkg.id, e.target.value)}
                          placeholder="Enter package name"
                          className="font-medium mb-2"
                          disabled={!pkg.enabled}
                        />
                      ) : (
                        <h4 className="font-medium mb-2">{pkg.name}</h4>
                      )}
                      {pkg.isCustom ? (
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Tests (comma separated)</Label>
                          <Input
                            value={pkg.tests.join(', ')}
                            onChange={(e) => handlePackageTestsChange(pkg.id, e.target.value)}
                            placeholder="e.g., HIV 1&2, Hepatitis B, Syphilis"
                            className="text-sm"
                            disabled={!pkg.enabled}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {pkg.tests.map((test, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {pkg.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeletePackage(pkg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Switch
                        checked={pkg.enabled}
                        onCheckedChange={() => handlePackageToggle(pkg.id)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">Price (₦)</Label>
                      <Input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => handlePackagePriceChange(pkg.id, e.target.value)}
                        className="w-28 font-mono"
                        disabled={!pkg.enabled}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground whitespace-nowrap">Turnaround</Label>
                      <Input
                        type="number"
                        value={pkg.turnaroundHours}
                        onChange={(e) => handlePackageTurnaroundChange(pkg.id, parseInt(e.target.value) || 0)}
                        className="w-20 font-mono"
                        disabled={!pkg.enabled}
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={handleAddPackage}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
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
