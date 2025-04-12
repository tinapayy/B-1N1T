"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Sensor {
  id: number;
  sensorName: string;
  location: string;
  sensorId: string;
  receiverId: string;
  registerDate: string;
  status: string;
}

interface AdminSensorTableProps {
  sensors: Sensor[];
  onDelete: (id: number) => void;
}

export function AdminSensorTable({ sensors, onDelete }: AdminSensorTableProps) {
  const [sortField, setSortField] = useState<keyof Sensor>("sensorName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSort = (field: keyof Sensor) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedSensors = [...sensors].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId !== null) {
      onDelete(deleteId);
      setShowDeleteDialog(false);
    }
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

  const SortIcon = ({ field }: { field: keyof Sensor }) => {
    if (field !== sortField)
      return <ChevronDown className="ml-1 h-4 w-4 opacity-50" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" />
    );
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="h-[265px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("sensorName")}
                >
                  <div className="flex items-center">
                    Sensor Name
                    <SortIcon field="sensorName" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("location")}
                >
                  <div className="flex items-center">
                    Location
                    <SortIcon field="location" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("sensorId")}
                >
                  <div className="flex items-center">
                    Sensor ID
                    <SortIcon field="sensorId" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("receiverId")}
                >
                  <div className="flex items-center">
                    Receiver ID
                    <SortIcon field="receiverId" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("registerDate")}
                >
                  <div className="flex items-center">
                    Register Date
                    <SortIcon field="registerDate" />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon field="status" />
                  </div>
                </TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSensors.length > 0 ? (
                sortedSensors.map((sensor) => (
                  <TableRow
                    key={sensor.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-medium">
                      {sensor.sensorName}
                    </TableCell>
                    <TableCell>{sensor.location}</TableCell>
                    <TableCell>{sensor.sensorId}</TableCell>
                    <TableCell>{sensor.receiverId}</TableCell>
                    <TableCell>{sensor.registerDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                            sensor.status
                          )} mr-2`}
                        ></div>
                        {sensor.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => confirmDelete(sensor.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              sensor and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
