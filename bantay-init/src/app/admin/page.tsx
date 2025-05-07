"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SuspenseCard } from "@/components/ui/suspense-card";
import LoadingComponent from "../loading";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { useAuth } from "@/components/providers/auth-provider";

import { AdminDevicesTable } from "@/app/admin/admin-devices-table";
import { AddSensorForm } from "@/app/admin/add-sensor-form";
import { AddReceiverForm } from "@/app/admin/add-receiver-form";

// Dynamically load map widget
const MapWidget = dynamic(() => import("./map-widget").then(mod => mod.MapWidget), { ssr: false });

const initialSensors = [
  {
    id: 1,
    sensorName: "ILO-01",
    location: "Miagao Municipal, Iloilo",
    sensorId: "S-001",
    receiverId: "R-001",
    registerDate: "12.09.2019",
    status: "Online",
  },
  {
    id: 2,
    sensorName: "ILO-02",
    location: "Jaro Fire Station, Iloilo, Jaro",
    sensorId: "S-002",
    receiverId: "R-002",
    registerDate: "12.09.2019",
    status: "Pinged",
  },
  {
    id: 3,
    sensorName: "MNL-04",
    location: "Poblacion Makati, Metro Manila",
    sensorId: "S-003",
    receiverId: "R-001",
    registerDate: "12.09.2019",
    status: "Offline",
  },
];

const initialReceivers = [
  {
    id: 1,
    sensorName: "RCV-01",
    location: "Miagao Municipal, Iloilo",
    sensorId: "S-001",
    receiverId: "R-001",
    connectedSensorIds: ["S-001", "S-002", "S-003"],
    registerDate: "12.09.2019",
    status: "Online",
  },
  {
    id: 2,
    sensorName: "RCV-02",
    location: "Jaro Fire Station, Iloilo, Jaro",
    sensorId: "S-002",
    receiverId: "R-002",
    connectedSensorIds: ["S-004"],
    registerDate: "12.09.2019",
    status: "Offline",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { setIsMobileMenuOpen } = useSidebar();
  const { user, logout, isAdmin, isLoading: authLoading } = useAuth();

  const [sensors, setSensors] = useState(initialSensors);
  const [receivers, setReceivers] = useState(initialReceivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [formType, setFormType] = useState<"sensor" | "receiver">("sensor");
  const [deviceTab, setDeviceTab] = useState("sensors");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [editingDevice, setEditingDevice] = useState<any | null>(null);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // UseEffect redirect AFTER all hooks are initialized
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    const savedTab = localStorage.getItem("adminDeviceTab");
    if (savedTab === "sensors" || savedTab === "receivers") {
      setDeviceTab(savedTab);
      setFormType(savedTab === "sensors" ? "sensor" : "receiver");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adminDeviceTab", deviceTab);
  }, [deviceTab]);

  const filteredSensors = sensors.filter(
    (sensor) =>
      sensor.sensorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReceivers = receivers.filter(
    (receiver) =>
      receiver.sensorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receiver.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDevice = (newDevice: any) => {
    if (formType === "sensor") {
      if (editingDevice) {
        setSensors((prev) =>
          prev.map((sensor) =>
            sensor.id === editingDevice.id
              ? { ...newDevice, id: editingDevice.id }
              : sensor
          )
        );
      } else {
        setSensors((prev) => [...prev, { ...newDevice, id: prev.length + 1 }]);
      }
    } else {
      if (editingDevice) {
        setReceivers((prev) =>
          prev.map((receiver) =>
            receiver.id === editingDevice.id
              ? { ...newDevice, id: editingDevice.id }
              : receiver
          )
        );
      } else {
        setReceivers((prev) => [
          ...prev,
          { ...newDevice, id: prev.length + 1 },
        ]);
      }
    }

    setEditingDevice(null);
    setSelectedLocation(null);
  };

  const handleDeleteDevice = (id: number) => {
    if (deviceTab === "sensors") {
      setSensors((prev) => prev.filter((s) => s.id !== id));
    } else {
      setReceivers((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleEditDevice = (device: any) => {
    setEditingDevice(device);
    setFormType(deviceTab === "sensors" ? "sensor" : "receiver");
    setSelectedLocation({
      lat: Number.parseFloat(device.latitude || "10.7202"),
      lng: Number.parseFloat(device.longitude || "122.5621"),
      address: device.location,
    });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  const handleTabChange = (value: string) => {
    setDeviceTab(value);
    setFormType(value === "sensors" ? "sensor" : "receiver");
  };

  const confirmLogout = () => {
    setIsLogoutDialogOpen(false);
    setTimeout(() => logout(), 100); // avoid render-time conflict
  };

  if (authLoading) return <LoadingComponent />;

  if (!isAdmin) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[var(--dark-gray-1)] rounded-lg">
        <h1 className="text-xl md:text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search Device"
              className="pl-10 w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="icon" title="Logout" className="flex-shrink-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                <DialogDescription>
                  You will be signed out of your admin account and redirected to the login page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmLogout}>
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Device Tabs */}
      <Tabs defaultValue="sensors" value={deviceTab} onValueChange={handleTabChange} className="mt-2">
        <TabsList className="mb-4 justify-start overflow-x-auto">
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="receivers">Receivers</TabsTrigger>
        </TabsList>
        <TabsContent value="sensors" className="mt-0">
          <SuspenseCard height="min-h-[200px] md:min-h-[300px]">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <AdminDevicesTable
                  sensors={filteredSensors}
                  onDelete={handleDeleteDevice}
                  onEdit={handleEditDevice}
                  deviceType="sensor"
                />
              </CardContent>
            </Card>
          </SuspenseCard>
        </TabsContent>
        <TabsContent value="receivers" className="mt-0">
          <SuspenseCard height="min-h-[200px] md:min-h-[300px]">
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <AdminDevicesTable
                  sensors={filteredReceivers}
                  onDelete={handleDeleteDevice}
                  onEdit={handleEditDevice}
                  deviceType="receiver"
                />
              </CardContent>
            </Card>
          </SuspenseCard>
        </TabsContent>
      </Tabs>

      {/* Form + Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <SuspenseCard>
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  {editingDevice ? "Edit" : "Add"} {formType === "sensor" ? "Sensor" : "Receiver"}
                </h2>
                <Select
                  value={formType}
                  onValueChange={(val) => setFormType(val as "sensor" | "receiver")}
                >
                  <SelectTrigger className="w-full sm:w-[120px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sensor">Sensor</SelectItem>
                    <SelectItem value="receiver">Receiver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formType === "sensor" ? (
                <AddSensorForm
                  onAdd={handleAddDevice}
                  selectedLocation={selectedLocation}
                  editingDevice={editingDevice}
                  onCancel={() => setEditingDevice(null)}
                  existingSensors={sensors}
                />
              ) : (
                <AddReceiverForm
                  onAdd={handleAddDevice}
                  selectedLocation={selectedLocation}
                  editingDevice={editingDevice}
                  onCancel={() => setEditingDevice(null)}
                  existingReceivers={receivers}
                />
              )}
            </CardContent>
          </Card>
        </SuspenseCard>
        <SuspenseCard height="h-[300px] md:h-[400px] lg:h-[525px]">
          <Card>
            <CardContent className="p-4 h-full">
              <MapWidget onLocationSelect={handleLocationSelect} />
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>
    </div>
  );
}
