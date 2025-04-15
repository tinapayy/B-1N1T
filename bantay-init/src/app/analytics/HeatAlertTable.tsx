"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  heatIndex: string;
  dateTime: string;
}

export default function HeatAlertTable({
  alerts,
  selectedAlertType,
  setSelectedAlertType,
  selectedDateRange,
  setSelectedDateRange,
}: any) {
  const alertTypeOptions = [
    "All Types",
    "Danger",
    "Extreme Caution",
    "Extreme Danger",
  ];
  const dateOptions = ["Today", "This Week", "This Month", "Custom Range"];

  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Click outside to hide filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMobileFilters &&
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowMobileFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileFilters]);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...alerts];

    if (selectedAlertType !== "All Types") {
      filtered = filtered.filter((a) => a.type === selectedAlertType);
    }

    if (selectedDateRange !== "Custom Range") {
      // Simplified placeholder
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortField as keyof Alert];
        let bVal: any = b[sortField as keyof Alert];
        if (sortField === "heatIndex") {
          aVal = parseInt(aVal.replace("°C", ""));
          bVal = parseInt(bVal.replace("°C", ""));
        }
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredAlerts(filtered);
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
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Extreme Heat Alerts
          </CardTitle>
          <div className="sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="h-8 w-8"
            >
              <SlidersHorizontal
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  showMobileFilters ? "rotate-90" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-grow flex flex-col">
        {/* Filters */}
        <div
          ref={filterRef}
          className={`flex flex-wrap gap-2 mb-4 pb-2 transition-all duration-300 ease-in-out ${
            showMobileFilters ? "block" : "hidden"
          } sm:flex`}
        >
          <div className="flex gap-2 flex-wrap">
            {[
              {
                label: selectedAlertType,
                setter: setSelectedAlertType,
                options: alertTypeOptions,
              },
              {
                label: selectedDateRange,
                setter: setSelectedDateRange,
                options: dateOptions,
              },
            ].map(({ label, setter, options }, i) => (
              <DropdownMenu key={i}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 flex-shrink-0 justify-start truncate"
                  >
                    {label}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {options.map((option) => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setter(option)}
                    >
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>

        {/* Alert list */}
        {isMobile ? (
          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className="p-3 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div
                        className={`h-3 w-3 min-w-[0.75rem] rounded-full mr-2 ${
                          alert.type === "Danger"
                            ? "bg-[var(--orange-primary)]"
                            : alert.type === "Extreme Caution"
                            ? "bg-yellow-500"
                            : "bg-red-600"
                        }`}
                      />
                      <span className="font-medium">{alert.type}</span>
                    </div>
                    <span className="font-bold">{alert.heatIndex}</span>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {alert.dateTime}
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No alerts match your filters
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-auto flex-grow">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead
                    className="w-1/3 py-2 cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    Type {getSortIcon("type")}
                  </TableHead>
                  <TableHead
                    className="w-1/3 text-center py-2 cursor-pointer"
                    onClick={() => handleSort("heatIndex")}
                  >
                    Heat Index {getSortIcon("heatIndex")}
                  </TableHead>
                  <TableHead
                    className="w-1/3 text-right py-2 cursor-pointer"
                    onClick={() => handleSort("dateTime")}
                  >
                    Date & Time {getSortIcon("dateTime")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <TableRow key={alert.id} className="hover:bg-muted/50">
                      <TableCell className="py-2 pl-2">
                        <div className="flex items-center">
                          <div
                            className={`h-3 w-3 min-w-[0.75rem] rounded-full mr-2 ${
                              alert.type === "Danger"
                                ? "bg-[var(--orange-primary)]"
                                : alert.type === "Extreme Caution"
                                ? "bg-yellow-500"
                                : "bg-red-600"
                            }`}
                          />
                          <span className="truncate">{alert.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-center">
                        {alert.heatIndex}
                      </TableCell>
                      <TableCell className="py-2 text-right text-gray-500 whitespace-nowrap">
                        {alert.dateTime}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-gray-500"
                    >
                      No alerts match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
