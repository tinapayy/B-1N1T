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
import { Checkbox } from "@/components/ui/checkbox";

interface Sensor {
  id: string;
  name: string;
  location: string | any;
  sensorId: string;
  receiverId: string;
  registerDate: string;
  status: string;
}

interface Receiver {
  id: string;
  name: string;
  location: string | any;
  receiverId: string;
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
  onUpdateReceiverSensors?: (receiverId: string, sensorIds: string[]) => void;
  allSensors?: Sensor[];
}

const SortIcon = ({ field, sortField, sortDirection }: { field: string; sortField: string; sortDirection: "asc" | "desc" }) => {
  if (field !== sortField) return <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4 opacity-50" />;
  return sortDirection === "asc" ? <ChevronUp className="ml-1 h-3 w-3 md:h-4 md:w-4" /> : <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />;
};

export function AdminDevicesTable({
  sensors,
  onDelete,
  onEdit,
  deviceType,
  onUpdateReceiverSensors,
  allSensors = [],
}: AdminDevicesTableProps) {
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewSensorsOpen, setViewSensorsOpen] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedSensors, setCheckedSensors] = useState<Set<string>>(new Set());

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSensors = [...sensors].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortField === "deviceID") {
      if (deviceType === "receiver") {
        aValue = "connectedSensorIds" in a ? (a as Receiver).connectedSensorIds?.length ?? 0 : 0;
        bValue = "connectedSensorIds" in b ? (b as Receiver).connectedSensorIds?.length ?? 0 : 0;
      } else {
        aValue = "sensorId" in a ? (a as Sensor).sensorId : "";
        bValue = "sensorId" in b ? (b as Sensor).sensorId : "";
      }
    } else {
      aValue = typeof a[sortField as keyof Device] === "string" ? (a[sortField as keyof Device] as string).toLowerCase() : "";
      bValue = typeof b[sortField as keyof Device] === "string" ? (b[sortField as keyof Device] as string).toLowerCase() : "";
    }

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

  const filteredSensors = (sensorIds: string[] = []) => {
    if (!searchQuery) return sensorIds;
    return sensorIds.filter((sensorId) =>
      sensorId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleViewSensors = (receiver: Receiver, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReceiver(receiver);
    setCheckedSensors(new Set(receiver.connectedSensorIds));
    setViewSensorsOpen(true);
  };

  const handleCheckboxChange = (sensorId: string) => (checked: boolean) => {
    const newCheckedSensors = new Set(checkedSensors);
    if (checked) {
      newCheckedSensors.add(sensorId);
    } else {
      newCheckedSensors.delete(sensorId);
    }
    setCheckedSensors(newCheckedSensors);
  };

  const handleSaveSensors = async () => {
    if (selectedReceiver && onUpdateReceiverSensors) {
      try {
        await onUpdateReceiverSensors(selectedReceiver.id, Array.from(checkedSensors));
        setViewSensorsOpen(false);
        setSelectedReceiver(null);
        setCheckedSensors(new Set());
      } catch (err) {
        console.error("Failed to update sensor connections:", err);
        alert("Failed to update sensor connections. See console for details.");
      }
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const availableSensors = allSensors.filter((sensor) => {
    if (!sensor.receiverId) return true;
    if (selectedReceiver && sensor.receiverId === selectedReceiver.receiverId) return true;
    return false;
  });

  return (
    <>
      <div className="hidden lg:block overflow-x-auto shadow-sm">
        <div className="min-w-[700px] h-[265px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
              <TableRow>
                {["name", "location", "deviceID", "receiverId", "registerDate", "status"].map((key) => (
                  <TableHead
                    key={key}
                    onClick={() => handleSort(key)}
                    className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                  >
                    <div className="flex items-center">
                      {key === "name"
                        ? `${deviceType === "sensor" ? "Sensor" : "Receiver"} Name`
                        : key === "deviceID"
                        ? "Device ID"
                        : key === "receiverId"
                        ? "Receiver ID"
                        : key === "registerDate"
                        ? "Register Date"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                      <SortIcon field={key} sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[80px] whitespace-nowrap text-sm font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSensors.length > 0 ? (
                sortedSensors.map((device) => (
                  <TableRow
                    key={device.id}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <TableCell className="font-medium whitespace-nowrap text-sm">
                      {device.name || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm max-w-[180px] overflow-hidden text-ellipsis" title={typeof device.location === "string" ? device.location : ""}>
                      <span className="inline-block truncate max-w-[180px] align-middle">
                        {typeof device.location === "string" ? device.location : "—"}
                      </span>
                    </TableCell>
                    {isReceiver(device) ? (
                      <TableCell className="whitespace-nowrap text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleViewSensors(device, e)}
                          className="text-xs"
                        >
                          View Sensors ({device.connectedSensorIds?.length || 0})
                        </Button>
                      </TableCell>
                    ) : (
                      <TableCell className="whitespace-nowrap text-sm">
                        {"sensorId" in device ? (device as Sensor).sensorId : "—"}
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap text-sm">
                      {device.receiverId || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {device.registerDate || "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(device.status)} mr-2`}
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
                  <TableCell colSpan={8} className="text-center text-sm">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="block lg:hidden h-[265px] overflow-y-auto space-y-4 p-2">
        {sortedSensors.length > 0 ? (
          sortedSensors.map((device) => (
            <div
              key={device.id}
              className="border rounded-lg p-3 shadow-sm bg-white hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-sm">{device.name}</h3>
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(device.status)}`}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {capitalizeStatus(device.status)}
                  </p>
                </div>
                <div className="flex gap-1">
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
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-semibold">Location:</span>{" "}
                  {typeof device.location === "string" ? device.location : "—"}
                </div>
                <div>
                  <span className="font-semibold">
                    {deviceType === "sensor" ? "Sensor" : "Device"} ID:
                  </span>{" "}
                  {deviceType === "sensor" ? (
                    "sensorId" in device ? (device as Sensor).sensorId : "—"
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const receiver = device as Receiver;
                        setSelectedReceiver(receiver);
                        setSearchQuery("");
                        setViewSensorsOpen(true);
                      }}
                      className="p-0 h-auto text-xs text-blue-600 hover:underline"
                    >
                      View Sensors ({isReceiver(device) ? device.connectedSensorIds?.length || 0 : 0})
                    </Button>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Receiver ID:</span>{" "}
                  {device.receiverId || "—"}
                </div>
                <div>
                  <span className="font-semibold">Register Date:</span>{" "}
                  {device.registerDate || "—"}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            No results
          </div>
        )}
      </div>

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
                {filteredSensors(availableSensors.map((s) => s.sensorId)).length > 0 ? (
                  filteredSensors(availableSensors.map((s) => s.sensorId)).map((sensorId) => (
                    <div key={sensorId} className="flex items-center p-2 md:p-3 border-b">
                      <Checkbox
                        id={sensorId}
                        checked={checkedSensors.has(sensorId)}
                        onCheckedChange={handleCheckboxChange(sensorId)}
                      />
                      <label htmlFor={sensorId} className="ml-2 text-xs md:text-sm">
                        {sensorId}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="py-3 md:py-4 text-center text-xs md:text-sm text-gray-500">
                    No sensors available
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setViewSensorsOpen(false)}
                  className="w-full sm:w-auto text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveSensors}
                  className="bg-[var(--orange-primary)] hover:bg-orange-600 w-full sm:w-auto text-sm"
                >
                  Save
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}