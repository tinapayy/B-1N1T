// analytics/heat-alerts-table.tsx

"use client";

import { useEffect, useRef, useState } from "react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";

export default function HeatAlertTable({
  alerts = [],
  selectedAlertType,
  setSelectedAlertType,
  selectedDateRange,
  setSelectedDateRange,
}: {
  alerts: any[];
  selectedAlertType: string;
  setSelectedAlertType: (val: string) => void;
  selectedDateRange: string;
  setSelectedDateRange: (val: string) => void;
}) {
  const alertTypeOptions = [
    "All Types",
    "Danger",
    "Extreme Caution",
    "Extreme Danger",
  ];
  const dateOptions = ["Today", "This Week", "This Month"];

  const [filteredAlerts, setFilteredAlerts] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!Array.isArray(alerts)) return;

    let filtered = [...alerts];

    if (selectedAlertType !== "All Types") {
      filtered = filtered.filter((a) => a.alertType === selectedAlertType);
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];
        if (sortField === "heatIndex") {
          aVal = parseFloat(aVal);
          bVal = parseFloat(bVal);
        }
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    setFilteredAlerts(filtered);
  }, [alerts, selectedAlertType, selectedDateRange, sortField, sortDirection]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showMobileFilters &&
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        const dropdownContent = document.querySelector(
          "[data-radix-popper-content-wrapper]"
        );
        if (dropdownContent?.contains(e.target as Node)) return;
        setShowMobileFilters(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileFilters]);

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
    return <ChevronDown className="h-4 w-4 inline ml-1 text-gray-400" />;
  };

  const filters = [
    {
      id: "alertType",
      label: "Alert Type",
      value: selectedAlertType,
      setter: setSelectedAlertType,
      options: alertTypeOptions,
    },
    {
      id: "dateRange",
      label: "Date Range",
      value: selectedDateRange,
      setter: setSelectedDateRange,
      options: dateOptions,
    },
  ];

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
              onClick={() => setShowMobileFilters((p) => !p)}
              className="h-8 w-8"
            >
              <SlidersHorizontal
                className={`w-5 h-5 transform duration-200 ${
                  showMobileFilters ? "rotate-90" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 flex-grow flex flex-col">
        <div
          ref={filterRef}
          className={`flex flex-wrap gap-2 mb-4 pb-2 ${
            showMobileFilters ? "block" : "hidden"
          } sm:flex`}
        >
          {filters.map(({ value, setter, options, id }) => (
            <DropdownMenu
              key={id}
              open={openDropdown === id}
              onOpenChange={(o) => setOpenDropdown(o ? id : null)}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 truncate"
                >
                  {value}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onSelect={() => setter(option)}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>

        {/* Add scroll + max height */}
        <div className="overflow-y-auto flex-grow max-h-[250px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  onClick={() => handleSort("alertType")}
                  className="cursor-pointer w-1/3 py-2"
                >
                  Type {getSortIcon("alertType")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("heatIndex")}
                  className="text-center cursor-pointer py-2"
                >
                  Heat Index {getSortIcon("heatIndex")}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("timestamp")}
                  className="text-right cursor-pointer py-2"
                >
                  Date & Time {getSortIcon("timestamp")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.timestamp} className="hover:bg-muted/50">
                    <TableCell className="py-2">
                      <div className="flex items-center">
                        <div
                          className={`h-3 w-3 rounded-full mr-2 ${
                            alert.alertType === "Danger"
                              ? "bg-[var(--orange-primary)]"
                              : alert.alertType === "Extreme Caution"
                              ? "bg-yellow-500"
                              : "bg-red-600"
                          }`}
                        />
                        {alert.alertType}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {alert.heatIndex}°C
                    </TableCell>
                    <TableCell className="text-right text-gray-500">
                      {new Date(alert.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
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
      </CardContent>
    </Card>
  );
}
