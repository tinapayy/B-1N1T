"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

interface Alert {
  id: number;
  type: "Danger" | "Extreme Danger" | "Extreme Caution";
  heatIndex: string;
  dateTime: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HeatAlertTable({
  selectedAlertType,
  setSelectedAlertType,
  selectedDateRange,
  setSelectedDateRange,
}: any) {
  const { data: alerts = [], isLoading } = useSWR("/api/analytics/alerts", fetcher, {
    refreshInterval: 30000,
    dedupingInterval: 30000,
  });

  const alertTypeOptions = ["All Types", "Danger", "Extreme Caution", "Extreme Danger"];
  const dateOptions = ["Today", "This Week", "This Month"];

  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setFilteredAlerts(alerts);
  }, [alerts]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  // Click outside to hide filters, but only for non-dropdown interactions

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showMobileFilters && filterRef.current && !filterRef.current.contains(e.target as Node)) {
        // Check if the click is within a DropdownMenuContent
        const dropdownContent = document.querySelector("[data-radix-popper-content-wrapper]");
        if (dropdownContent?.contains(e.target as Node)) return; // Don't close if clicking inside dropdown content
        setShowMobileFilters(false);
        setOpenDropdown(null); // Close any open dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileFilters]);
  // Filter and sort logic
  useEffect(() => {
    if (!Array.isArray(alerts)) return;
  
    let filtered = [...alerts];
  
    if (selectedAlertType !== "All Types") {
      filtered = filtered.filter((a) => a.type === selectedAlertType);
    }
  
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortField as keyof Alert];
        let bVal: any = b[sortField as keyof Alert];
        if (sortField === "heatIndex") {
          aVal = parseFloat(aVal.replace("°C", ""));
          bVal = parseFloat(bVal.replace("°C", ""));
        }
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
  
    // Only update if values truly changed
    setFilteredAlerts((prev) => {
      const prevJSON = JSON.stringify(prev);
      const nextJSON = JSON.stringify(filtered);
      return prevJSON !== nextJSON ? filtered : prev;
    });
  }, [alerts, selectedAlertType, selectedDateRange, sortField, sortDirection]);  

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <ChevronUp className="h-4 w-4 inline ml-1" />
      ) : (
        <ChevronDown className="h-4 w-4 inline ml-1" />
      );
    }
    // Show default ChevronDown when not sorted
    return <ChevronDown className="h-4 w-4 inline ml-1 text-gray-400" />;
  };

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Extreme Heat Alerts</CardTitle>
          <div className="sm:hidden">
            <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters((p) => !p)} className="h-8 w-8">
              <SlidersHorizontal className={`w-5 h-5 transform duration-200 ${showMobileFilters ? "rotate-90" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4 flex-grow flex flex-col">
        {/* Filters */}
        <div ref={filterRef} className={`flex flex-wrap gap-2 mb-4 pb-2 ${showMobileFilters ? "block" : "hidden"} sm:flex`}>
          {[{ label: selectedAlertType, setter: setSelectedAlertType, options: alertTypeOptions, id: "alertType" },
            { label: selectedDateRange, setter: setSelectedDateRange, options: dateOptions, id: "dateRange" }]
            .map(({ label, setter, options, id }, i) => (
              <DropdownMenu key={i} open={openDropdown === id} onOpenChange={(o) => setOpenDropdown(o ? id : null)}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-xs h-8 truncate">
                    {label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {options.map((option) => (
                    <DropdownMenuItem key={option} onSelect={() => setter(option)}>
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
        </div>

        {/* Table */}
        <div className="overflow-auto flex-grow">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead onClick={() => handleSort("type")} className="cursor-pointer w-1/3 py-2">
                  Type {getSortIcon("type")}
                </TableHead>
                <TableHead onClick={() => handleSort("heatIndex")} className="text-center cursor-pointer py-2">
                  Heat Index {getSortIcon("heatIndex")}
                </TableHead>
                <TableHead onClick={() => handleSort("dateTime")} className="text-right cursor-pointer py-2">
                  Date & Time {getSortIcon("dateTime")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert: any) => (
                  <TableRow key={alert.id} className="hover:bg-muted/50">
                    <TableCell className="py-2">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${
                          alert.type === "Danger" ? "bg-[var(--orange-primary)]" :
                          alert.type === "Extreme Caution" ? "bg-yellow-500" : "bg-red-600"}`} />
                        {alert.type}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{alert.heatIndex}</TableCell>
                    <TableCell className="text-right text-gray-500">{alert.dateTime}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                    {isLoading ? "Loading..." : "No alerts match your filters"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
