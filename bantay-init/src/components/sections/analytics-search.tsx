"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface AnalyticsSearchProps {
  initialLocation?: string;
  onLocationChange?: (location: string) => void;
}

const miagaoLocations = [
  "Town Center, Miagao, Iloilo",
  "Quezon St., Miagao, Iloilo",
  "Noble St., Miagao, Iloilo",
  "Barangay Baybay Norte, Miagao, Iloilo",
  "Barangay Dingle, Miagao, Iloilo",
  "Barangay Kirayan, Miagao, Iloilo",
];

export function AnalyticsSearch({
  initialLocation = "",
  onLocationChange,
}: AnalyticsSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [noResults, setNoResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filterLocations = useCallback((query: string) => {
    if (query.length === 0) {
      setFilteredLocations([]);
      setNoResults(false);
      return;
    }
    const filtered = miagaoLocations.filter((location) =>
      location.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLocations(filtered);
    setNoResults(filtered.length === 0);
  }, []);

  const handleSearchClick = useCallback(() => {
    setIsSearching(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleClearClick = useCallback(() => {
    setSearchValue("");
    setFilteredLocations([]);
    setNoResults(false);
    inputRef.current?.focus();
  }, []);

  const handleBlur = useCallback(() => {
    if (searchValue.trim() === "") {
      setSearchValue(initialLocation);
      setIsSearching(false);
      setFilteredLocations([]);
      setNoResults(false);
    }
  }, [initialLocation, searchValue]);

  const handleSelectLocation = useCallback(
    (location: string) => {
      setSearchValue(location);
      setIsSearching(false);
      setFilteredLocations([]);
      setNoResults(false);
      onLocationChange?.(location);
    },
    [onLocationChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setSearchValue(initialLocation);
        setIsSearching(false);
        setFilteredLocations([]);
        setNoResults(false);
      } else if (e.key === "Enter" && filteredLocations.length > 0) {
        handleSelectLocation(filteredLocations[0]);
      }
    },
    [initialLocation, filteredLocations, handleSelectLocation]
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
        setFilteredLocations([]);
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
              filterLocations(e.target.value);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
            placeholder="Search locations in Miagao, Iloilo..."
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
            {filteredLocations.length === 0 && noResults ? (
              <div className="p-4 text-sm text-gray-500">
                No locations found in Miagao, Iloilo
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectLocation(location)}
                >
                  <span className="font-medium">{location}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
