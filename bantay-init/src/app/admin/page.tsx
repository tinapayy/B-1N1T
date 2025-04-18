"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogOut, Search } from "lucide-react";
import { AdminDevicesTable } from "@/app/admin/admin-devices-table";
import { AddSensorForm } from "@/app/admin/add-sensor-form";
import { AddReceiverForm } from "@/app/admin/add-receiver-form";
import { MapWidget } from "@/app/admin/map-widget";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SuspenseCard } from "@/components/ui/suspense-card";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Sample data for the sensors
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

// Sample data for the receivers
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
  const pathname = usePathname();
  const { setIsMobileMenuOpen } = useSidebar();
  const { user, logout, isAdmin, isLoading: authLoading } = useAuth();
  const [sensors, setSensors] = useState(initialSensors); // Initialize as array
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

  // Redirect if not admin, but only after auth state is resolved
  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved

    if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, authLoading, router]);

  // Persist the deviceTab state in localStorage to maintain tab selection on refresh
  useEffect(() => {
    const savedTab = localStorage.getItem("adminDeviceTab");
    if (savedTab && (savedTab === "sensors" || savedTab === "receivers")) {
      setDeviceTab(savedTab);
      setFormType(savedTab === "sensors" ? "sensor" : "receiver");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("adminDeviceTab", deviceTab);
  }, [deviceTab]);

  // Filter devices based on search query
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

  // Add new device
  const handleAddDevice = (newDevice: any) => {
    if (formType === "sensor") {
      if (editingDevice) {
        // Update existing sensor
        setSensors(
          sensors.map((sensor) =>
            sensor.id === editingDevice.id
              ? { ...newDevice, id: editingDevice.id }
              : sensor
          )
        );
      } else {
        // Add new sensor
        setSensors([...sensors, { ...newDevice, id: sensors.length + 1 }]);
      }
    } else {
      if (editingDevice) {
        // Update existing receiver
        setReceivers(
          receivers.map((receiver) =>
            receiver.id === editingDevice.id
              ? { ...newDevice, id: editingDevice.id }
              : receiver
          )
        );
      } else {
        // Add new receiver
        setReceivers([
          ...receivers,
          { ...newDevice, id: receivers.length + 1 },
        ]);
      }
    }
    // Reset editing state and selected location
    setEditingDevice(null);
    setSelectedLocation(null);
  };

  // Delete device
  const handleDeleteDevice = (id: number) => {
    if (deviceTab === "sensors") {
      setSensors(sensors.filter((sensor) => sensor.id !== id));
    } else {
      setReceivers(receivers.filter((receiver) => receiver.id !== id));
    }
  };

  // Edit device
  const handleEditDevice = (device: any) => {
    setEditingDevice(device);
    setFormType(deviceTab === "sensors" ? "sensor" : "receiver");
    setSelectedLocation({
      lat: Number.parseFloat(device.latitude || "10.7202"),
      lng: Number.parseFloat(device.longitude || "122.5621"),
      address: device.location,
    });
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setDeviceTab(value);
    setFormType(value === "sensors" ? "sensor" : "receiver");
  };

  // Handle logout confirmation
  const confirmLogout = () => {
    logout();
    setIsLogoutDialogOpen(false);
  };

  // Show a loading state while auth is being resolved
  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

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
          <Dialog
            open={isLogoutDialogOpen}
            onOpenChange={setIsLogoutDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                title="Logout"
                className="flex-shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to logout?</DialogTitle>
                <DialogDescription>
                  You will be signed out of your admin account and redirected to
                  the login page.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  className="mt-2"
                  variant="outline"
                  onClick={() => setIsLogoutDialogOpen(false)}
                >
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
      <Tabs
        defaultValue="sensors"
        value={deviceTab}
        onValueChange={handleTabChange}
        className="mt-2"
      >
        <TabsList className="mb-4 justify-start overflow-x-auto">
          <TabsTrigger value="sensors" className="flex-shrink-0">
            Sensors
          </TabsTrigger>
          <TabsTrigger value="receivers" className="flex-shrink-0">
            Receivers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sensors" className="mt-0">
          {/* Sensor Table */}
          <SuspenseCard
            height="min-h-[200px] md:min-h-[300px]"
            className="bg-white rounded-xl shadow-sm"
          >
            <Card className="bg-white rounded-xl shadow-sm">
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
          {/* Receiver Table */}
          <SuspenseCard
            height="min-h-[200px] md:min-h-[300px]"
            className="bg-white rounded-xl shadow-sm"
          >
            <Card className="bg-white rounded-xl shadow-sm">
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

      {/* Add Form and Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Add Form Section */}
        <SuspenseCard height="auto" className="bg-white rounded-xl shadow-sm">
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  {editingDevice ? "Edit" : "Add"}{" "}
                  {formType === "sensor" ? "Sensor" : "Receiver"}
                </h2>
                <Select
                  value={formType}
                  onValueChange={(value) =>
                    setFormType(value as "sensor" | "receiver")
                  }
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
                  existingSensors={sensors} // Pass sensors state
                />
              ) : (
                <AddReceiverForm
                  onAdd={handleAddDevice}
                  selectedLocation={selectedLocation}
                  editingDevice={editingDevice}
                  onCancel={() => setEditingDevice(null)}
                  existingReceivers={receivers} // Already passing receivers
                />
              )}
            </CardContent>
          </Card>
        </SuspenseCard>

        {/* Map Widget */}
        <SuspenseCard
          height="h-[300px] md:h-[400px] lg:h-[500px]"
          className="bg-white rounded-xl shadow-sm"
        >
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-4 h-[300px] md:h-[400px] lg:h-[500px]">
              <MapWidget onLocationSelect={handleLocationSelect} />
            </CardContent>
          </Card>
        </SuspenseCard>
      </div>
    </div>
  );
}
