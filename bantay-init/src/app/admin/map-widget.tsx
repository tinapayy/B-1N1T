"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

interface MapWidgetProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

export function MapWidget({ onLocationSelect }: MapWidgetProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    if (window.google && window.google.maps) {
      initializeMap();
      setIsApiAvailable(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsApiAvailable(true);
      initializeMap();
    };
    script.onerror = () => {
      console.error("Google Maps API failed to load.");
      setIsApiAvailable(false);
    };
    document.head.appendChild(script);

    return () => {
      if (!window.google) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = { lat: 10.7202, lng: 122.5621 };
    const mapOptions: google.maps.MapOptions = {
      center: defaultLocation,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    const newMarker = new google.maps.Marker({
      position: defaultLocation,
      map: newMap,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    setMarker(newMarker);

    getAddressFromLatLng(defaultLocation.lat, defaultLocation.lng);

    newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      newMarker.setPosition(e.latLng);
      getAddressFromLatLng(lat, lng);
    });

    newMarker.addListener("dragend", () => {
      const position = newMarker.getPosition();
      if (!position) return;
      getAddressFromLatLng(position.lat(), position.lng());
    });
  };

  const getAddressFromLatLng = (lat: number, lng: number) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address;
        onLocationSelect(lat, lng, address);
      }
    });
  };

  const handleSearch = () => {
    if (!map || !marker || !window.google || !searchQuery) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (
        status === "OK" &&
        results &&
        results[0] &&
        results[0].geometry &&
        results[0].geometry.location
      ) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(15);
        marker.setPosition(location);
        getAddressFromLatLng(location.lat(), location.lng());
      }
    });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search location..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          className="ml-2 bg-[var(--orange-primary)] hover:bg-orange-600"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      <div className="relative flex-1 rounded-lg overflow-hidden">
        {!isApiAvailable ? (
          <div className="absolute inset-0 bg-gray-200 rounded-lg flex flex-col items-center justify-center p-4 text-center">
            <MapPin className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-500">
              Map fallback — Google Maps API is not available. Please add a
              valid API key.
            </p>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full rounded-lg" />
        )}
      </div>
    </div>
  );
}
