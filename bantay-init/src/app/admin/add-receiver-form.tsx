"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  getUnverifiedReceiverIds,
  addVerifiedReceiver,
} from "@/lib/adminDevices";

interface Receiver {
  id: number;
  sensorName: string;
  location: string;
  receiverId: string;
  connectedSensorIds?: string[];
  registerDate: string;
  status: string;
  latitude?: string;
  longitude?: string;
  wifiSSID?: string;
  wifiPassword?: string;
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
    wifiSSID: "",
    wifiPassword: "",
  });

  const [unverifiedReceiverIds, setUnverifiedReceiverIds] = useState<string[]>([]);

  useEffect(() => {
    const loadUnverified = async () => {
      const ids = await getUnverifiedReceiverIds();
      setUnverifiedReceiverIds(ids);
    };
    loadUnverified();
  }, []);

  useEffect(() => {
    if (editingDevice) {
      setFormData({
        receiverName: editingDevice.sensorName || "",
        receiverId: editingDevice.receiverId || "",
        longitude: editingDevice.longitude || "",
        latitude: editingDevice.latitude || "",
        location: editingDevice.location || "",
        wifiSSID: editingDevice.wifiSSID || "",
        wifiPassword: editingDevice.wifiPassword || "",
      });
    }
  }, [editingDevice]);

  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        longitude: selectedLocation.lng.toFixed(6),
        latitude: selectedLocation.lat.toFixed(6),
        location: selectedLocation.address,
      }));
    }
  }, [selectedLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.receiverId || !formData.latitude || !formData.longitude) {
      alert("Missing required fields.");
      return;
    }

    const newReceiver = {
      name: formData.receiverName.trim(),
      receiverID: formData.receiverId,
      location: formData.location,
      longitude: parseFloat(formData.longitude),
      latitude: parseFloat(formData.latitude),
      connectedSensorIds: [],
      wifiSSID: formData.wifiSSID,
      wifiPassword: formData.wifiPassword,
      installDate:
        editingDevice?.installDate ||
        new Date().toISOString(),
      status: editingDevice?.status || "Offline",
    };

    try {
      await addVerifiedReceiver(formData.receiverId, newReceiver);
      onAdd(newReceiver);
    } catch (err) {
      console.error("Error verifying receiver:", err);
      alert("Verification failed. See console for details.");
      return;
    }

    setFormData({
      receiverName: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
      wifiSSID: "",
      wifiPassword: "",
    });
    onCancel();
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
          <Select
            value={formData.receiverId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, receiverId: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unverified receiver ID..." />
            </SelectTrigger>
            <SelectContent>
              {unverifiedReceiverIds.length > 0 ? (
                unverifiedReceiverIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  No unverified receivers
                </SelectItem>
              )}
            </SelectContent>
          </Select>
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
        <div className="space-y-2">
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

        <div className="space-y-2 md:col-span-2">
          <Label>Location</Label>
          <Input
            value={formData.location}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label>Longitude</Label>
          <Input
            value={formData.longitude}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <Label>Latitude</Label>
          <Input
            value={formData.latitude}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[var(--orange-primary)] hover:bg-orange-600">
          {editingDevice ? "Update" : "+ Add"}
        </Button>
      </div>
    </form>
  );
}
