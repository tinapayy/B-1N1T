"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MapWidgetProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
}

// Fix marker icon loading
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({
  onMove,
}: {
  onMove: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapResizeHandler() {
  const map = useMapEvents({});
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.observe(container);
    return () => resizeObserver.unobserve(container);
  }, [map]);
  return null;
}

export function MapWidget({ onLocationSelect }: MapWidgetProps) {
  const defaultPosition: [number, number] = [10.7202, 122.5621];
  const [position, setPosition] = useState<[number, number]>(defaultPosition);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchSuggestions = async (q: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ph&q=${encodeURIComponent(
        q
      )}`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  useEffect(() => {
    if (!search.trim() || !isTyping) {
      setSuggestions([]);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchSuggestions(search), 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search, isTyping]);

  const reverseGeocode = async (lat: number, lng: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    const rawAddress = data?.display_name || "Unknown location";
    const cleanAddress = rawAddress
      .replace(/\b\d{4,5}\b/g, "")
      .replace(/,\s*Philippines/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    setSearch(cleanAddress);
    onLocationSelect(
      Number(lat.toFixed(6)),
      Number(lng.toFixed(6)),
      cleanAddress
    );
  };

  const handleSelectSuggestion = (s: Suggestion) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
    setSuggestions([]);
    setIsTyping(false);
  };

  const handleDrag = (e: L.LeafletEvent) => {
    const marker = e.target as L.Marker;
    const pos = marker.getLatLng();
    setPosition([pos.lat, pos.lng]);
    reverseGeocode(pos.lat, pos.lng);
    setIsTyping(false);
  };

  return (
    <div className="relative w-full h-full min-h-[300px]">
      {/* Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-2 bg-white">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsTyping(true);
            }}
            placeholder="Search location in the Philippines..."
            className="pl-10 pr-4 text-sm w-full"
          />
          {isTyping && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white z-[1001] border border-gray-200 rounded shadow-md max-h-48 overflow-y-auto text-sm">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectSuggestion(s)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {s.display_name
                    .replace(/\b\d{4,5}\b/g, "")
                    .replace(/,\s*Philippines/i, "")
                    .trim()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-full rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom
          className="w-full h-full min-h-[300px] z-0"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker
            position={position}
            draggable
            eventHandlers={{ dragend: handleDrag }}
          />
          <MapClickHandler
            onMove={(lat, lng) => {
              setPosition([lat, lng]);
              reverseGeocode(lat, lng);
            }}
          />
          <MapResizeHandler />
        </MapContainer>
        {/* Re-add zoom buttons in bottom right */}
        <div className="leaflet-bottom leaflet-right z-[1000] absolute bottom-2 right-2">
          <div className="leaflet-control leaflet-bar flex flex-col shadow">
            <button
              className="leaflet-control-zoom-in text-xl px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100"
              onClick={() =>
                (
                  document.querySelector(".leaflet-container") as any
                )?._leaflet_map?.zoomIn()
              }
            >
              +
            </button>
            <button
              className="leaflet-control-zoom-out text-xl px-2 py-1 bg-white border border-gray-300 hover:bg-gray-100"
              onClick={() =>
                (
                  document.querySelector(".leaflet-container") as any
                )?._leaflet_map?.zoomOut()
              }
            >
              −
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
