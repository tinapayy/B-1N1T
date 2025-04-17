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
  id: number;
  sensorName: string;
  location: string;
  sensorId: string;
  receiverId: string;
  registerDate: string;
  status: string;
}

interface Receiver {
  id: number;
  sensorName: string;
  location: string;
  receiverId: string;
  connectedSensorIds: string[];
  registerDate: string;
  status: string;
}

type Device = Sensor | Receiver;

interface AdminSensorTableProps {
  sensors: Device[];
  onDelete: (id: number) => void;
  onEdit: (sensor: Device) => void;
  deviceType: "sensor" | "receiver";
}

export function AdminSensorTable({
  sensors: propSensors,
  onDelete,
  onEdit,
  deviceType,
}: AdminSensorTableProps) {
  const [sortField, setSortField] = useState<keyof Device>("sensorName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [viewSensorsOpen, setViewSensorsOpen] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mockReceivers: Receiver[] = [
    {
      id: 1,
      sensorName: "Receiver 1",
      location: "Lab A",
      receiverId: "R-001",
      connectedSensorIds: ["S-001", "S-002", "S-003"],
      registerDate: "2023-01-01",
      status: "online",
    },
    {
      id: 2,
      sensorName: "Receiver 2",
      location: "Lab B",
      receiverId: "R-002",
      connectedSensorIds: ["S-004"],
      registerDate: "2023-01-02",
      status: "offline",
    },
    {
      id: 3,
      sensorName: "Receiver 3",
      location: "Field",
      receiverId: "R-003",
      connectedSensorIds: [],
      registerDate: "2023-01-03",
      status: "pinged",
    },
  ];

  const sensors = deviceType === "receiver" ? mockReceivers : propSensors;

  const handleSort = (field: keyof Device) => {
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

    if (sortField === "receiverId" && deviceType === "receiver") {
      aValue =
        "connectedSensorIds" in a
          ? (a as Receiver).connectedSensorIds.length
          : 0;
      bValue =
        "connectedSensorIds" in b
          ? (b as Receiver).connectedSensorIds.length
          : 0;
    } else if (sortField === "receiverId" && deviceType === "sensor") {
      aValue = (a as Sensor).sensorId;
      bValue = (b as Sensor).sensorId;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const confirmDelete = (id: number, e: React.MouseEvent) => {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const SortIcon = ({ field }: { field: keyof Device }) => {
    if (field !== sortField)
      return <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 md:h-4 md:w-4" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
    );
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
      {/* Table Layout for lg and above */}
      <div className="hidden lg:block overflow-x-auto shadow-sm">
        <div className="min-w-[700px] h-[265px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("sensorName")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    {deviceType === "sensor" ? "Sensor" : "Receiver"} Name
                    <SortIcon field="sensorName" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("location")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    Location
                    <SortIcon field="location" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("receiverId")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    {deviceType === "sensor" ? "Sensor" : "Device"} ID
                    <SortIcon field="receiverId" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("receiverId")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    Receiver ID
                    <SortIcon field="receiverId" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("registerDate")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    Register Date
                    <SortIcon field="registerDate" />
                  </div>
                </TableHead>
                <TableHead
                  onClick={() => handleSort("status")}
                  className="cursor-pointer whitespace-nowrap text-sm font-semibold"
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </TableHead>
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
                      {device.sensorName}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {device.location}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {deviceType === "sensor" ? (
                        (device as Sensor).sensorId
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReceiver(device as Receiver);
                            setSearchQuery("");
                            setViewSensorsOpen(true);
                          }}
                          className="text-xs"
                        >
                          View Sensors (
                          {(device as Receiver).connectedSensorIds.length})
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {device.receiverId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {device.registerDate}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
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

      {/* Card Layout for md and sm */}
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
                    <h3 className="font-medium text-sm">{device.sensorName}</h3>
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(
                        device.status
                      )}`}
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
                  {device.location}
                </div>
                <div>
                  <span className="font-semibold">
                    {deviceType === "sensor" ? "Sensor" : "Device"} ID:
                  </span>{" "}
                  {deviceType === "sensor" ? (
                    (device as Sensor).sensorId
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceiver(device as Receiver);
                        setSearchQuery("");
                        setViewSensorsOpen(true);
                      }}
                      className="p-0 h-auto text-xs text-blue-600 hover:underline"
                    >
                      View Sensors (
                      {(device as Receiver).connectedSensorIds.length})
                    </Button>
                  )}
                </div>
                <div>
                  <span className="font-semibold">Receiver ID:</span>{" "}
                  {device.receiverId}
                </div>
                <div>
                  <span className="font-semibold">Register Date:</span>{" "}
                  {device.registerDate}
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

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent
          className="w-[90vw] max-w-[400px] rounded-lg"
          onClick={handleContentClick}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Are you sure?
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              This action cannot be undone. This will permanently delete the{" "}
              {deviceType}.
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

      {/* View Sensors Dialog */}
      <Dialog open={viewSensorsOpen} onOpenChange={setViewSensorsOpen}>
        <DialogContent
          className="w-[90vw] max-w-[400px] rounded-lg"
          onClick={handleContentClick}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Connected Sensors for {selectedReceiver?.sensorName || "Receiver"}
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
                {filteredSensors(selectedReceiver.connectedSensorIds).length >
                0 ? (
                  filteredSensors(selectedReceiver.connectedSensorIds).map(
                    (sensorId, index) => (
                      <div key={index} className="p-2 md:p-3 border-b">
                        <p className="text-xs md:text-sm">{sensorId}</p>
                      </div>
                    )
                  )
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
    </>
  );
}
