import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Clock, Star, Navigation, ArrowLeft, MessageSquarePlus } from "lucide-react";
import { mockDiagnosticCenters } from "@/lib/mock-data";
import { RateCenterDialog } from "@/components/rate-center-dialog";
import { PriveScreenLogo } from "@/components/logo";
import type { DiagnosticCenter } from "@shared/schema";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icon for selected center
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map view changes
function MapController({ center, zoom }: { center: [number, number] | null; zoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, {
        duration: 1
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function Centers() {
  const searchString = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<DiagnosticCenter | null>(null);
  const [centers] = useState<DiagnosticCenter[]>(mockDiagnosticCenters);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [centerToRate, setCenterToRate] = useState<DiagnosticCenter | null>(null);

  // Determine back destination based on where user came from
  const getBackDestination = () => {
    if (searchString.includes("from=patient")) return "/patient";
    if (searchString.includes("from=sponsor")) return "/sponsor";
    return "/";
  };

  const handleRateCenter = (center: DiagnosticCenter, e: React.MouseEvent) => {
    e.stopPropagation();
    setCenterToRate(center);
    setShowRateDialog(true);
  };

  const filteredCenters = centers.filter((center) =>
    center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    center.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lagosCenter = { lat: 6.5244, lng: 3.3792 };

  // Handle center selection - pan map and open popup
  const handleSelectCenter = (center: DiagnosticCenter) => {
    setSelectedCenter(center);
    if (center.latitude && center.longitude) {
      setMapCenter([parseFloat(center.latitude), parseFloat(center.longitude)]);
      // Open the popup for this marker after a short delay
      setTimeout(() => {
        const marker = markerRefs.current[center.id];
        if (marker) {
          marker.openPopup();
        }
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild data-testid="button-back">
              <a href={getBackDestination()}>
                <ArrowLeft className="h-5 w-5" />
              </a>
            </Button>
            <div className="flex items-center gap-3">
              <PriveScreenLogo size={32} />
              <div>
                <h1 className="text-xl font-bold">Find Diagnostic Center</h1>
                <p className="text-sm text-muted-foreground">Verified centers in Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Input
            placeholder="Search by name, location, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
            data-testid="input-search"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4 order-2 lg:order-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Approved Centers</h2>
              <Badge variant="secondary" data-testid="badge-count">{filteredCenters.length} centers</Badge>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto p-1">
              {filteredCenters.map((center) => (
                <Card
                  key={center.id}
                  className={`cursor-pointer transition-all hover-elevate ${
                    selectedCenter?.id === center.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectCenter(center)}
                  data-testid={`card-center-${center.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{center.name}</CardTitle>
                          {center.verified && (
                            <Badge variant="default" className="text-xs" data-testid="badge-verified">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{center.address}, {center.city}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">{center.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{center.phone}</span>
                    </div>
                    {center.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{center.email}</span>
                      </div>
                    )}
                    {center.hours && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{center.hours}</span>
                      </div>
                    )}
                    <div className="pt-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        data-testid={`button-directions-${center.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (center.latitude && center.longitude) {
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`,
                              '_blank'
                            );
                          }
                        }}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        data-testid={`button-rate-${center.id}`}
                        onClick={(e) => handleRateCenter(center, e)}
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-2" />
                        Rate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 h-[600px] rounded-lg overflow-hidden border">
            <MapContainer
              center={[lagosCenter.lat, lagosCenter.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              data-testid="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController center={mapCenter} />
              {filteredCenters.map((center) => (
                center.latitude && center.longitude && (
                  <Marker
                    key={center.id}
                    position={[parseFloat(center.latitude), parseFloat(center.longitude)]}
                    icon={selectedCenter?.id === center.id ? selectedIcon : defaultIcon}
                    ref={(ref) => {
                      markerRefs.current[center.id] = ref;
                    }}
                    eventHandlers={{
                      click: () => handleSelectCenter(center),
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-semibold mb-1">{center.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{center.address}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{center.rating}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{center.phone}</p>
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`,
                              '_blank'
                            );
                          }}
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </main>

      {/* Rate Center Dialog */}
      {centerToRate && (
        <RateCenterDialog
          open={showRateDialog}
          onOpenChange={setShowRateDialog}
          centerName={centerToRate.name}
          centerId={centerToRate.id}
        />
      )}
    </div>
  );
}
