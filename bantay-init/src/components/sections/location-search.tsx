"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { debounce } from "lodash";
import { Location, fetchLocations } from "@/lib/open-meteo";

interface LocationSearchProps {
  mode: "forecast" | "analytics";
  initialLocation?: string;
  onLocationChange?: (location: Location) => void; // forecast mode only
  onSensorSelect?: (sensorId: string) => void; // analytics mode only
}

interface SensorItem {
  sensorId: string;
  sensorName: string;
}

export function LocationSearch({
  mode,
  initialLocation = "",
  onLocationChange,
  onSensorSelect,
}: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const [locations, setLocations] = useState<Location[]>([]);
  const [sensors, setSensors] = useState<SensorItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔍 Forecast mode: debounce Open-Meteo API
  const debouncedFetchLocations = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setLocations([]);
        setNoResults(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await fetchLocations(query);
        console.log("Filtered Locations:", results); // Debug log
        setLocations(results);
        setNoResults(results.length === 0);
      } catch (error) {
        setLocations([]);
        setNoResults(true);
      }
      setIsLoading(false);
    }, 300),
    []
  );

  // 📡 Analytics mode: fetch sensor list once
  useEffect(() => {
    if (mode === "analytics") {
      fetch("/api/sensors/names")
        .then((res) => res.json())
        .then((data) => setSensors(data.sensors || []))
        .catch(() => setSensors([]));
    }
  }, [mode]);

  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClearClick = useCallback(() => {
    setSearchValue("");
    setLocations([]);
    setNoResults(false);
    inputRef.current?.focus();
  }, []);

  const handleBlur = useCallback(() => {
    if (searchValue.trim() === "") {
      setSearchValue(initialLocation);
      setIsSearching(false);
      setLocations([]);
      setNoResults(false);
    }
  }, [initialLocation, searchValue]);

  const handleSelectForecastLocation = useCallback(
    (location: Location) => {
      setSearchValue(location.name);
      setIsSearching(false);
      setLocations([]);
      setNoResults(false);
      onLocationChange?.(location);
    },
    [onLocationChange]
  );

  const handleSelectSensor = useCallback(
    (sensor: SensorItem) => {
      setSearchValue(sensor.sensorName);
      setIsSearching(false);
      setNoResults(false);
      onSensorSelect?.(sensor.sensorId);
    },
    [onSensorSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setSearchValue(initialLocation);
        setIsSearching(false);
        setLocations([]);
        setNoResults(false);
      } else if (e.key === "Enter") {
        if (mode === "forecast" && locations.length > 0) {
          handleSelectForecastLocation(locations[0]);
        }
      }
    },
    [initialLocation, locations, mode, handleSelectForecastLocation]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (searchValue.trim() === "") {
          setSearchValue(initialLocation);
        }
        setIsSearching(false);
        setLocations([]);
        setNoResults(false);
      }
    };

    if (isSearching) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearching, initialLocation, searchValue]);

  return (
    <div ref={containerRef} className="relative flex items-center w-full">
      {isSearching ? (
        <div className="flex items-center w-full">
          <Search className="absolute left-3 z-10 h-5 w-5 text-[var(--orange-primary)]" />
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (process.env.NODE_ENV === "development") {
                console.log("Search Value:", e.target.value);
              }
              if (mode === "forecast") {
                debouncedFetchLocations(e.target.value);
              }
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
            placeholder={
              mode === "forecast"
                ? "Search Philippine cities..."
                : "Search sensor names..."
            }
          />
          {searchValue && (
            <button
              onClick={handleClearClick}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex items-center justify-between w-full cursor-pointer"
          onClick={handleSearchClick}
        >
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[var(--orange-primary)]" />
            <span className="font-medium">{searchValue}</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isSearching && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto top-full"
          >
            {isLoading && mode === "forecast" ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : mode === "forecast" ? (
              noResults ? (
                <div className="p-4 text-sm text-gray-500">
                  No Philippine cities found
                </div>
              ) : (
                locations.map((location) => (
                  <div
                    key={`${location.name}-${location.latitude}`}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectForecastLocation(location)}
                  >
                    <span className="font-medium">{location.name}</span>
                    {location.admin1 && (
                      <span className="text-sm text-gray-500">
                        , {location.admin1}
                      </span>
                    )}
                  </div>
                ))
              )
            ) : (
              sensors
                .filter((sensor) =>
                  sensor.sensorName
                    .toLowerCase()
                    .includes(searchValue.toLowerCase())
                )
                .map((sensor) => (
                  <div
                    key={sensor.sensorId}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectSensor(sensor)}
                  >
                    <span className="font-medium">{sensor.sensorName}</span>
                    <span className="text-sm text-gray-500">
                      {" "}
                      ({sensor.sensorId})
                    </span>
                  </div>
                ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
