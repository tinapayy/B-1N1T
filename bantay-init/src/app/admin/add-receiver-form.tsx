"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddReceiverFormProps {
  onAdd: (receiver: any) => void;
  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  editingDevice?: any;
  onCancel: () => void;
}

// Sample sensor data with region, province, and municipality
const availableSensors = [
  {
    id: "ILO-01-S-001",
    name: "ILO-01-S-001",
    region: "Region VI",
    province: "Iloilo",
    municipality: "Miagao",
  },
  {
    id: "ILO-02-S-001",
    name: "ILO-02-S-001",
    region: "Region VI",
    province: "Iloilo",
    municipality: "Jaro",
  },
  {
    id: "MNL-04-S-001",
    name: "MNL-04-S-001",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Makati",
  },
  {
    id: "ILO-03-S-002",
    name: "ILO-03-S-002",
    region: "Region VI",
    province: "Iloilo",
    municipality: "Miagao",
  },
  {
    id: "MNL-05-S-002",
    name: "MNL-05-S-002",
    region: "NCR",
    province: "Metro Manila",
    municipality: "Quezon City",
  },
];

export function AddReceiverForm({
  onAdd,
  selectedLocation,
  editingDevice,
  onCancel,
}: AddReceiverFormProps) {
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverId: "",
    longitude: "",
    latitude: "",
    location: "",
    connectedSensors: [] as string[],
    wifiSSID: "",
    wifiPassword: "",
  });
  const [isUpdatingWifi, setIsUpdatingWifi] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | null>(
    null
  );
  const [isSensorDialogOpen, setIsSensorDialogOpen] = useState(false);
  const [tempConnectedSensors, setTempConnectedSensors] = useState<string[]>(
    []
  );
  const [sensorSearch, setSensorSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterMunicipality, setFilterMunicipality] = useState("all");

  // Update form when editing device is set
  useEffect(() => {
    if (editingDevice) {
      const connectedSensors =
        editingDevice.connectedSensors ||
        [editingDevice.sensorId].filter(Boolean);
      setFormData({
        receiverName: editingDevice.sensorName || "",
        receiverId: editingDevice.receiverId || "",
        longitude: editingDevice.longitude || "",
        latitude: editingDevice.latitude || "",
        location: editingDevice.location || "",
        connectedSensors: connectedSensors,
        wifiSSID: editingDevice.wifiSSID || "",
        wifiPassword: editingDevice.wifiPassword || "",
      });
      setTempConnectedSensors(connectedSensors);
    }
  }, [editingDevice]);

  // Update form when location is selected on map
  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        longitude: selectedLocation.lng.toString(),
        latitude: selectedLocation.lat.toString(),
        location: selectedLocation.address,
      }));
    }
  }, [selectedLocation]);

  // Initialize tempConnectedSensors when dialog opens
  useEffect(() => {
    if (isSensorDialogOpen) {
      setTempConnectedSensors(formData.connectedSensors);
    }
  }, [isSensorDialogOpen, formData.connectedSensors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new receiver object
    const newReceiver = {
      sensorName: formData.receiverName,
      location: formData.location,
      connectedSensors: formData.connectedSensors,
      receiverId: formData.receiverId,
      registerDate:
        editingDevice?.registerDate ||
        new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "."),
      status: editingDevice?.status || "Offline",
      longitude: formData.longitude,
      latitude: formData.latitude,
      wifiSSID: formData.wifiSSID,
      wifiPassword: formData.wifiPassword,
    };

    onAdd(newReceiver);

    // Reset form
    setFormData({
      receiverName: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
      connectedSensors: [],
      wifiSSID: "",
      wifiPassword: "",
    });
    setUpdateStatus(null);
  };

  const handleUpdateWifi = async () => {
    if (!formData.wifiSSID || !formData.wifiPassword) {
      setUpdateStatus("failed");
      return;
    }

    setIsUpdatingWifi(true);
    setUpdateStatus(null);

    // Simulate an API call to update Arduino Wi-Fi settings
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success or failure randomly for demo purposes
          Math.random() > 0.3
            ? resolve("Success")
            : reject(new Error("Failed"));
        }, 2000);
      });
      setUpdateStatus("success");
    } catch (error) {
      setUpdateStatus("failed");
    } finally {
      setIsUpdatingWifi(false);
    }
  };

  const handleSensorToggle = (sensorId: string) => {
    setTempConnectedSensors((prev) => {
      const isSelected = prev.includes(sensorId);
      return isSelected
        ? prev.filter((id) => id !== sensorId)
        : [...prev, sensorId];
    });
  };

  const handleSaveSensors = () => {
    setFormData((prev) => ({
      ...prev,
      connectedSensors: tempConnectedSensors,
    }));
    setIsSensorDialogOpen(false);
  };

  // Filter sensors based on search and location filters
  const filteredSensors = availableSensors.filter((sensor) => {
    const matchesSearch = sensor.name
      .toLowerCase()
      .includes(sensorSearch.toLowerCase());
    const matchesRegion =
      filterRegion === "all" ? true : sensor.region === filterRegion;
    const matchesProvince =
      filterProvince === "all" ? true : sensor.province === filterProvince;
    const matchesMunicipality =
      filterMunicipality === "all"
        ? true
        : sensor.municipality === filterMunicipality;
    return (
      matchesSearch && matchesRegion && matchesProvince && matchesMunicipality
    );
  });

  // Get unique regions, provinces, and municipalities for filters
  const regions = [...new Set(availableSensors.map((sensor) => sensor.region))];
  const provinces =
    filterRegion === "all"
      ? [...new Set(availableSensors.map((sensor) => sensor.province))]
      : [
          ...new Set(
            availableSensors
              .filter((sensor) => sensor.region === filterRegion)
              .map((sensor) => sensor.province)
          ),
        ];
  const municipalities =
    filterProvince === "all"
      ? [...new Set(availableSensors.map((sensor) => sensor.municipality))]
      : [
          ...new Set(
            availableSensors
              .filter((sensor) => sensor.province === filterProvince)
              .map((sensor) => sensor.municipality)
          ),
        ];

  // Reset province and municipality when region changes
  const handleRegionChange = (value: string) => {
    setFilterRegion(value);
    setFilterProvince("all");
    setFilterMunicipality("all");
  };

  // Reset municipality when province changes
  const handleProvinceChange = (value: string) => {
    setFilterProvince(value);
    setFilterMunicipality("all");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="receiverName">Receiver Name</Label>
          <Input
            id="receiverName"
            name="receiverName"
            placeholder="Receiver 1"
            value={formData.receiverName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receiverId">Receiver ID</Label>
          <Input
            id="receiverId"
            name="receiverId"
            placeholder="R-001"
            value={formData.receiverId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            placeholder="38.8951"
            value={formData.longitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            placeholder="77.0364"
            value={formData.latitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Miagao Municipal Hall, Iloilo"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wifiSSID">Wi-Fi SSID</Label>
          <Input
            id="wifiSSID"
            name="wifiSSID"
            placeholder="Enter Wi-Fi SSID"
            value={formData.wifiSSID}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2 flex items-end gap-2">
          <div className="flex-1">
            <Label htmlFor="wifiPassword">Wi-Fi Password</Label>
            <Input
              id="wifiPassword"
              name="wifiPassword"
              placeholder="Enter Wi-Fi Password"
              value={formData.wifiPassword}
              onChange={handleChange}
              type="password"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleUpdateWifi}
              disabled={
                isUpdatingWifi || !formData.wifiSSID || !formData.wifiPassword
              }
              className="relative"
            >
              Update Wi-Fi
              {isUpdatingWifi && (
                <span className="ml-2 inline-block h-4 w-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
              )}
            </Button>
            {updateStatus && (
              <span
                className={`text-sm ${
                  updateStatus === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {updateStatus === "success" ? "Success" : "Failed"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Connected Sensors</Label>
          <Dialog
            open={isSensorDialogOpen}
            onOpenChange={setIsSensorDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="ml-2" type="button" variant="outline">
                Select Sensors ({formData.connectedSensors.length} selected)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Sensors</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Search sensors..."
                  value={sensorSearch}
                  onChange={(e) => setSensorSearch(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Select
                      onValueChange={handleRegionChange}
                      value={filterRegion}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Province</Label>
                    <Select
                      onValueChange={handleProvinceChange}
                      value={filterProvince}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Provinces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Provinces</SelectItem>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Municipality</Label>
                    <Select
                      onValueChange={setFilterMunicipality}
                      value={filterMunicipality}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Municipalities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Municipalities</SelectItem>
                        {municipalities.map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>
                            {municipality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredSensors.map((sensor) => (
                    <div
                      key={sensor.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={sensor.id}
                        checked={tempConnectedSensors.includes(sensor.id)}
                        onCheckedChange={() => handleSensorToggle(sensor.id)}
                      />
                      <Label htmlFor={sensor.id}>
                        {sensor.name} ({sensor.region}, {sensor.province},{" "}
                        {sensor.municipality})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSensorDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={handleSaveSensors}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              receiverName: "",
              receiverId: "",
              longitude: "",
              latitude: "",
              location: "",
              connectedSensors: [],
              wifiSSID: "",
              wifiPassword: "",
            });
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[var(--orange-primary)] hover:bg-orange-600"
        >
          {editingDevice ? "Update" : "+ Add"}
        </Button>
      </div>
    </form>
  );
}
