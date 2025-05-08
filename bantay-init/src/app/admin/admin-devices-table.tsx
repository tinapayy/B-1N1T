"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Sensor {
  id: string;
  name: string;
  location: string | any;
  sensorID: string;
  receiverID: string;
  registerDate: string;
  status: string;
}

interface Receiver {
  id: string;
  name: string;
  location: string | any;
  receiverID: string;
  connectedSensorIds?: string[];
  registerDate: string;
  status: string;
}

type Device = Sensor | Receiver;

interface AdminDevicesTableProps {
  sensors: Device[];
  onDelete: (id: string) => void;
  onEdit: (sensor: Device) => void;
  deviceType: "sensor" | "receiver";
}

const SortIcon = ({
  field,
  sortField,
  sortDirection,
}: {
  field: keyof Device;
  sortField: keyof Device;
  sortDirection: "asc" | "desc";
}) => {
  if (field !== sortField)
    return <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4 opacity-50" />;
  return sortDirection === "asc" ? (
    <ChevronUp className="ml-1 h-3 w-3 md:h-4 md:w-4" />
  ) : (
    <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
  );
};

export function AdminDevicesTable({
  sensors,
  onDelete,
  onEdit,
  deviceType,
}: AdminDevicesTableProps) {
  const [sortField, setSortField] = useState<keyof Device>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewSensorsOpen, setViewSensorsOpen] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSort = (field: keyof Device) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSensors = [...sensors].sort((a, b) => {
    const aValue = typeof a[sortField] === "string" ? (a[sortField] as string).toLowerCase() : "";
    const bValue = typeof b[sortField] === "string" ? (b[sortField] as string).toLowerCase() : "";
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteId !== null) {
      onDelete(deleteId);
      setDeleteId(null);
      setShowDeleteDialog(false);
    }
  };

  const handleEdit = (device: Device, e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(device);
  };

  const getStatusColor = (status: string | undefined | null) => {
    const safeStatus = typeof status === "string" ? status.toLowerCase() : "unknown";
    switch (safeStatus) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "pinged":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const capitalizeStatus = (status: string | undefined | null) => {
    if (typeof status !== "string" || status.length === 0) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const isReceiver = (device: Device): device is Receiver => {
    return "connectedSensorIds" in device;
  };

  const filteredSensors = (connectedSensorIds: string[]) => {
    if (!searchQuery) return connectedSensorIds;
    return connectedSensorIds.filter((sensorId) =>
      sensorId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="hidden lg:block overflow-x-auto shadow-sm">
        <div className="min-w-[700px] h-[265px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
              <TableRow>
                {["name", "location", "receiverID", "registerDate", "status"].map((key) => (
                  <TableHead
                    key={key}
                    onClick={() => handleSort(key as keyof Device)}
                    className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                  >
                    <div className="flex items-center">
                      {key === "name"
                        ? `${deviceType === "sensor" ? "Sensor" : "Receiver"} Name`
                        : key === "receiverID"
                        ? "Receiver ID"
                        : key === "registerDate"
                        ? "Register Date"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      <SortIcon
                        field={key as keyof Device}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[80px] text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSensors.length > 0 ? (
                sortedSensors.map((device) => (
                  <TableRow
                    key={device.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell className="text-sm">
                      {typeof device.name === "string" ? device.name : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {typeof device.location === "string" ? device.location : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {device.receiverID || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {device.registerDate || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                            device.status
                          )} mr-2`}
                        />
                        {capitalizeStatus(device.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleEdit(device, e)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => confirmDelete(device.id, e)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Sensors Dialog (if receiver) */}
      <Dialog open={viewSensorsOpen} onOpenChange={setViewSensorsOpen}>
        <DialogContent
          className="w-[90vw] max-w-[400px] rounded-lg"
          onClick={handleContentClick}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Connected Sensors for {selectedReceiver?.name || "Receiver"}
            </DialogTitle>
          </DialogHeader>
          {selectedReceiver && (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sensors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {filteredSensors(selectedReceiver.connectedSensorIds ?? []).length > 0 ? (
                  filteredSensors(selectedReceiver.connectedSensorIds ?? []).map((sensorId, index) => (
                    <div key={index} className="p-2 md:p-3 border-b">
                      <p className="text-xs md:text-sm">{sensorId}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-3 md:py-4 text-center text-xs md:text-sm text-gray-500">
                    No sensors found
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="w-[90vw] max-w-[400px] rounded-lg"
          onClick={handleContentClick}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Are you sure?</DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              This action cannot be undone. This will permanently delete the {deviceType}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(false);
              }}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
