"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Location, fetchLocations } from "@/lib/open-meteo";
import { debounce } from "lodash";

interface LocationSearchProps {
  initialLocation: string;
  onLocationChange: (location: Location) => void;
}

export function LocationSearch({
  initialLocation,
  onLocationChange,
}: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
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

  const handleSelectLocation = useCallback(
    (location: Location) => {
      setSearchValue(location.name);
      setIsSearching(false);
      setLocations([]);
      setNoResults(false);
      onLocationChange(location);
    },
    [onLocationChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setSearchValue(initialLocation);
        setIsSearching(false);
        setLocations([]);
        setNoResults(false);
      } else if (e.key === "Enter" && locations.length > 0) {
        handleSelectLocation(locations[0]);
      }
    },
    [initialLocation, locations, handleSelectLocation]
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
          <MapPin className="absolute left-3 z-10 h-5 w-5 text-[var(--orange-primary)]" />
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (process.env.NODE_ENV === "development") {
                console.log("Search Value:", e.target.value); // Debug log
              }
              debouncedFetchLocations(e.target.value);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
            placeholder="Search Philippine cities..."
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
            <MapPin className="h-5 w-5 text-[var(--orange-primary)]" />
            <span className="font-medium">{searchValue}</span>
          </div>
          <Search className="h-4 w-4 text-[var(--dark-gray-1)]" />
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
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : noResults ? (
              <div className="p-4 text-sm text-gray-500">
                No Philippine cities found
              </div>
            ) : (
              locations.map((location) => (
                <div
                  key={`${location.name}-${location.latitude}`}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  <span className="font-medium">{location.name}</span>
                  {location.admin1 && (
                    <span className="text-sm text-gray-500">
                      , {location.admin1}
                    </span>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
