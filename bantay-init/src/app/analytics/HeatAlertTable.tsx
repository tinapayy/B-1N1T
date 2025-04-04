"use client";

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
import { ChevronDown } from "lucide-react";

export default function HeatAlertTable({
  alerts,
  selectedAlertType,
  setSelectedAlertType,
  selectedHeatIndex,
  setSelectedHeatIndex,
  selectedDateRange,
  setSelectedDateRange,
}: any) {
  const alertTypeOptions = [
    "All Types",
    "Danger",
    "Extreme Caution",
    "Extreme Danger",
  ];
  const heatIndexOptions = ["All Values", "30°C+", "40°C+", "50°C+"];
  const dateOptions = ["Today", "This Week", "This Month", "Custom Range"];

  return (
    <Card className="bg-white rounded-3xl shadow-sm flex flex-col h-full">
      <CardHeader className="px-6 py-4">
        <CardTitle className="text-xl font-semibold">
          Extreme Heat Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 flex-grow flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            {
              label: selectedAlertType,
              setter: setSelectedAlertType,
              options: alertTypeOptions,
            },
            {
              label: selectedHeatIndex,
              setter: setSelectedHeatIndex,
              options: heatIndexOptions,
            },
            {
              label: selectedDateRange,
              setter: setSelectedDateRange,
              options: dateOptions,
            },
          ].map(({ label, setter, options }, i) => (
            <DropdownMenu key={i}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  {label} <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {options.map((option) => (
                  <DropdownMenuItem key={option} onClick={() => setter(option)}>
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </div>
        <div className="overflow-auto flex-grow" style={{ maxHeight: "250px" }}>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-1/3 py-2">Type</TableHead>
                <TableHead className="w-1/3 text-center py-2">
                  Heat Index
                </TableHead>
                <TableHead className="w-1/3 text-right py-2">
                  Date & Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert: any) => (
                <TableRow key={alert.id} className="hover:bg-muted/50">
                  <TableCell className="py-2 pl-2">
                    <div className="flex items-center">
                      <div
                        className={`h-3 w-3 rounded-full mr-2 ${
                          alert.type === "Danger"
                            ? "bg-[var(--orange-primary)]"
                            : alert.type === "Extreme Caution"
                            ? "bg-yellow-500"
                            : "bg-red-600"
                        }`}
                      />
                      {alert.type}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    {alert.heatIndex}
                  </TableCell>
                  <TableCell className="py-2 text-right text-gray-500">
                    {alert.dateTime}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
