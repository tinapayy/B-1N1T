"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sections/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AdminSensorTable } from "@/app/admin/admin-sensor-table";
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
    sensorId: "S-001",
    receiverId: "R-002",
    registerDate: "12.09.2019",
    status: "Pinged",
  },
  {
    id: 3,
    sensorName: "MNL-04",
    location: "Poblacion Makati, Metro Manila",
    sensorId: "S-001",
    receiverId: "R-001",
    registerDate: "12.09.2019",
    status: "Offline",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sensors, setSensors] = useState(initialSensors);
  const [searchQuery, setSearchQuery] = useState("");
  const [formType, setFormType] = useState<"sensor" | "receiver">("sensor");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Filter sensors based on search query
  const filteredSensors = sensors.filter(
    (sensor) =>
      sensor.sensorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sensor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add new sensor
  const handleAddSensor = (newSensor: any) => {
    setSensors([...sensors, { ...newSensor, id: sensors.length + 1 }]);
    // Reset selected location after adding
    setSelectedLocation(null);
  };

  // Delete sensor
  const handleDeleteSensor = (id: number) => {
    setSensors(sensors.filter((sensor) => sensor.id !== id));
  };

  // Handle location selection from map
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search Sensor"
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sensor Table */}
          <Card className="bg-white rounded-xl shadow-sm">
            <CardContent className="p-0">
              <AdminSensorTable
                sensors={filteredSensors}
                onDelete={handleDeleteSensor}
              />
            </CardContent>
          </Card>

          {/* Add Form and Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Form Section - Always visible */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Add {formType === "sensor" ? "Sensor" : "Receiver"}
                  </h2>
                  <Select
                    value={formType}
                    onValueChange={(value) =>
                      setFormType(value as "sensor" | "receiver")
                    }
                  >
                    <SelectTrigger className="w-[120px]">
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
                    onAdd={handleAddSensor}
                    selectedLocation={selectedLocation}
                  />
                ) : (
                  <AddReceiverForm
                    onAdd={handleAddSensor}
                    selectedLocation={selectedLocation}
                  />
                )}
              </CardContent>
            </Card>

            {/* Map Widget */}
            <Card className="bg-white rounded-xl shadow-sm">
              <CardContent className="p-4 h-[500px]">
                <MapWidget onLocationSelect={handleLocationSelect} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
