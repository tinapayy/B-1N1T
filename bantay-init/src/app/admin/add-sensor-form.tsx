"use client";

import { useState, useEffect, useMemo } from "react";
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
  getUnverifiedSensorIds,
  addVerifiedSensor,
  updateReceiverSensorMapping,
} from "@/lib/adminDevices";

interface Sensor {
  id: number;
  sensorName: string;
  location: string;
  sensorId: string;
  receiverId: string;
  registerDate: string;
  status: string;
  longitude?: string;
  latitude?: string;
}

interface Receiver {
  id: number;
  sensorName: string;
  receiverId: string;
  longitude: string;
  latitude: string;
}

interface AddSensorFormProps {
  onAdd: (sensor: any) => void;
  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
  editingDevice?: any;
  onCancel: () => void;
  existingSensors?: Sensor[];
  existingReceivers?: Receiver[];
}

export function AddSensorForm({
  onAdd,
  selectedLocation,
  editingDevice,
  onCancel,
  existingSensors = [],
  existingReceivers = [],
}: AddSensorFormProps) {
  const [formData, setFormData] = useState({
    sensorName: "",
    sensorId: "",
    receiverName: "",
    receiverId: "",
    longitude: "",
    latitude: "",
    location: "",
  });

  const [unverifiedSensorIds, setUnverifiedSensorIds] = useState<string[]>([]);

  useEffect(() => {
    const loadUnverified = async () => {
      const ids = await getUnverifiedSensorIds();
      setUnverifiedSensorIds(ids);
    };
    loadUnverified();
  }, []);

  useEffect(() => {
    if (editingDevice) {
      setFormData({
        sensorName: editingDevice.sensorName || "",
        sensorId: editingDevice.sensorId || "",
        receiverName: editingDevice.receiverName || "",
        receiverId: editingDevice.receiverId || "",
        longitude: editingDevice.longitude || "",
        latitude: editingDevice.latitude || "",
        location: editingDevice.location || "",
      });
    }
  }, [editingDevice]);

  useEffect(() => {
    if (selectedLocation) {
      setFormData((prev) => ({
        ...prev,
        longitude: selectedLocation.lng.toFixed(6),
        latitude: selectedLocation.lat.toFixed(6),
        location: selectedLocation.address || prev.location,
      }));
    }
  }, [selectedLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sensorId || !formData.receiverId || !formData.latitude || !formData.longitude) {
      alert("Missing required fields.");
      return;
    }

    const newSensor = {
      name: formData.sensorName,
      location: formData.location,
      sensorID: formData.sensorId,
      receiverID: formData.receiverId,
      receiverName: formData.receiverName,
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
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    // Commit to Firestore: move to verified and update receiver mapping
    try {
      await addVerifiedSensor(formData.sensorId, newSensor);
      await updateReceiverSensorMapping(formData.receiverId, formData.sensorId);
      onAdd(newSensor);
    } catch (err) {
      console.error("Error verifying sensor:", err);
      alert("Verification failed. See console for details.");
      return;
    }

    // Reset state
    setFormData({
      sensorName: "",
      sensorId: "",
      receiverName: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
    });
    onCancel();
  };

  const sortedReceivers = useMemo(() => {
    if (!selectedLocation) return existingReceivers;

    return [...existingReceivers].sort((a, b) => {
      const distA = getDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        parseFloat(a.latitude),
        parseFloat(a.longitude)
      );
      const distB = getDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        parseFloat(b.latitude),
        parseFloat(b.longitude)
      );
      return distA - distB;
    });
  }, [existingReceivers, selectedLocation]);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleReceiverSelect = (value: string) => {
    const selected = existingReceivers.find((r) => r.sensorName === value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        receiverName: selected.sensorName,
        receiverId: selected.receiverId,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sensorName">Sensor Name</Label>
          <Input
            id="sensorName"
            name="sensorName"
            placeholder="ILO-01"
            value={formData.sensorName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sensorId">Sensor ID</Label>
          <Select
            value={formData.sensorId}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, sensorId: value }))
            }
          >
            <SelectTrigger id="sensorId">
              <SelectValue placeholder="Select unverified sensor ID..." />
            </SelectTrigger>
            <SelectContent>
              {unverifiedSensorIds.length > 0 ? (
                unverifiedSensorIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  No unverified sensors
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receiverName">Receiver</Label>
          <Select
            value={formData.receiverName}
            onValueChange={handleReceiverSelect}
          >
            <SelectTrigger id="receiverName">
              <SelectValue placeholder="Select nearest receiver..." />
            </SelectTrigger>
            <SelectContent>
              {sortedReceivers.map((r) => (
                <SelectItem key={r.receiverId} value={r.sensorName}>
                  {r.sensorName} ({parseFloat(r.latitude).toFixed(4)}, {parseFloat(r.longitude).toFixed(4)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="Select from map..."
            value={formData.location}
            readOnly
            tabIndex={-1}
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            placeholder="122.562100"
            value={formData.longitude}
            readOnly
            tabIndex={-1}
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            placeholder="10.720200"
            value={formData.latitude}
            readOnly
            tabIndex={-1}
            className="bg-gray-100 cursor-not-allowed select-none pointer-events-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setFormData({
              sensorName: "",
              sensorId: "",
              receiverName: "",
              receiverId: "",
              longitude: "",
              latitude: "",
              location: "",
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
