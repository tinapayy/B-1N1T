"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationSearchProps {
  initialLocation: string;
  onLocationChange?: (location: string) => void;
}

export function LocationSearch({
  initialLocation,
  onLocationChange,
}: LocationSearchProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState(initialLocation);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearchClick = () => {
    setIsSearching(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleClearClick = () => {
    setSearchValue("");
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    if (searchValue.trim() === "") {
      setSearchValue(initialLocation);
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchValue(initialLocation);
      setIsSearching(false);
    } else if (e.key === "Enter") {
      if (onLocationChange && searchValue.trim() !== "") {
        onLocationChange(searchValue);
      }
      setIsSearching(false);
    }
  };

  // Handle clicks outside to collapse
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
    <div ref={containerRef} className="relative flex items-center">
      {isSearching ? (
        <div className="flex items-center w-full">
          <MapPin className="absolute left-3 z-10 h-5 w-5 text-[var(--orange-primary)]" />
          <Input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 w-full"
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
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleSearchClick}
        >
          <MapPin className="h-5 w-5 text-[var(--orange-primary)]" />
          <span className="font-medium">{searchValue}</span>
          <Search className="h-4 w-4 text-gray-400 ml-1" />
        </div>
      )}
    </div>
  );
}
