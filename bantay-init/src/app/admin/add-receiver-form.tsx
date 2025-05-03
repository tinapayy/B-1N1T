"use client";

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
import { Checkbox } from "@/components/ui/checkbox";

interface Receiver {
  id: number;
  sensorName: string;
  location: string;
  receiverId: string;
  connectedSensorIds?: string[];
  registerDate: string;
  status: string;
}

interface AddReceiverFormProps {
  onAdd: (receiver: any) => void;
  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  editingDevice?: any;
  onCancel: () => void;
  existingReceivers: Receiver[];
}

const availableSensors = [
  { id: "ILO-01-S-001", name: "ILO-01-S-001" },
  { id: "ILO-02-S-001", name: "ILO-02-S-001" },
  { id: "MNL-04-S-001", name: "MNL-04-S-001" },
];

export function AddReceiverForm({
  onAdd,
  selectedLocation,
  editingDevice,
  onCancel,
  existingReceivers,
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

  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [tempConnectedSensors, setTempConnectedSensors] = useState<string[]>(
    []
  );
  const [isUpdatingWifi, setIsUpdatingWifi] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | null>(
    null
  );

  useEffect(() => {
    if (editingDevice) {
      setFormData({
        receiverName: editingDevice.sensorName || "",
        receiverId: editingDevice.receiverId || "",
        longitude: editingDevice.longitude || "",
        latitude: editingDevice.latitude || "",
        location: editingDevice.location || "",
        connectedSensors: editingDevice.connectedSensors || [],
        wifiSSID: editingDevice.wifiSSID || "",
        wifiPassword: editingDevice.wifiPassword || "",
      });
      setTempConnectedSensors(editingDevice.connectedSensors || []);
    } else {
      const existingIds = existingReceivers
        .map((r) => parseInt(r.receiverId.replace(/^R-/, "")))
        .filter((n) => !isNaN(n));
      const nextId = Math.max(0, ...existingIds) + 1;
      setFormData((prev) => ({
        ...prev,
        receiverId: `R-${nextId.toString().padStart(3, "0")}`,
      }));
    }
  }, [existingReceivers, editingDevice]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReceiver = {
      sensorName: formData.receiverName.trim(),
      receiverId: formData.receiverId,
      location: formData.location,
      longitude: formData.longitude,
      latitude: formData.latitude,
      connectedSensors: formData.connectedSensors,
      wifiSSID: formData.wifiSSID,
      wifiPassword: formData.wifiPassword,
      registerDate:
        editingDevice?.registerDate ||
        new Date().toLocaleDateString("en-GB").replace(/\//g, "."),
      status: editingDevice?.status || "Offline",
    };
    onAdd(newReceiver);
    onCancel();
  };

  const handleUpdateWifi = async () => {
    if (!formData.wifiSSID || !formData.wifiPassword) {
      setUpdateStatus("failed");
      return;
    }
    setIsUpdatingWifi(true);
    setUpdateStatus(null);
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          Math.random() > 0.3 ? resolve("OK") : reject("Fail");
        }, 1500);
      });
      setUpdateStatus("success");
    } catch {
      setUpdateStatus("failed");
    } finally {
      setIsUpdatingWifi(false);
    }
  };

  const toggleSensor = (sensorId: string) => {
    setTempConnectedSensors((prev) =>
      prev.includes(sensorId)
        ? prev.filter((id) => id !== sensorId)
        : [...prev, sensorId]
    );
  };

  const saveSensors = () => {
    setFormData((prev) => ({
      ...prev,
      connectedSensors: tempConnectedSensors,
    }));
    setSensorDialogOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Receiver Name</Label>
          <Input
            name="receiverName"
            value={formData.receiverName}
            onChange={handleChange}
            placeholder="RCV-01"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Receiver ID</Label>
          <Input
            name="receiverId"
            value={formData.receiverId}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label>Wi-Fi SSID</Label>
          <Input
            name="wifiSSID"
            value={formData.wifiSSID}
            onChange={handleChange}
            placeholder="Enter SSID"
            required
          />
        </div>
        <div className="space-y-2 flex gap-2 items-end">
          <div className="flex-1">
            <Label>Wi-Fi Password</Label>
            <Input
              name="wifiPassword"
              value={formData.wifiPassword}
              onChange={handleChange}
              placeholder="Enter Password"
              type="password"
              required
            />
          </div>
          <div>
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
                className={`text-sm ml-2 ${
                  updateStatus === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {updateStatus === "success" ? "Success" : "Failed"}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            readOnly
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input
            value={formData.longitude}
            readOnly
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input
            value={formData.latitude}
            readOnly
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          <Label>Connected Sensors</Label>
          <Dialog open={sensorDialogOpen} onOpenChange={setSensorDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="ml-2">
                Select Sensors ({formData.connectedSensors.length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Sensors</DialogTitle>
              </DialogHeader>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableSensors.map((sensor) => (
                  <div key={sensor.id} className="flex items-center gap-2">
                    <Checkbox
                      id={sensor.id}
                      checked={tempConnectedSensors.includes(sensor.id)}
                      onCheckedChange={() => toggleSensor(sensor.id)}
                    />
                    <Label htmlFor={sensor.id}>{sensor.name}</Label>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" onClick={saveSensors}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex justify-end gap-2 self-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[var(--orange-primary)] hover:bg-orange-600"
          >
            {editingDevice ? "Update" : "+ Add"}
          </Button>
        </div>
      </div>
    </form>
  );
}
