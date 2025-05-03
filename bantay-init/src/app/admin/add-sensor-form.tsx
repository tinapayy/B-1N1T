"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  existingReceivers?: Sensor[];
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

  const formatReceiverName = (name: string) =>
    name.trim().toUpperCase().replace(/\s+/g, " ");

  useEffect(() => {
    if (!editingDevice) {
      const ids = existingSensors
        .map((s) => {
          const match = s.sensorId.match(/^S-(\d{3})$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      const next = Math.max(0, ...ids) + 1;
      const formatted = `S-${next.toString().padStart(3, "0")}`;
      setFormData((prev) => ({ ...prev, sensorId: formatted }));
    }
  }, [existingSensors, editingDevice]);

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

  useEffect(() => {
    if (formData.receiverName) {
      const formatted = formatReceiverName(formData.receiverName);
      const existing = existingReceivers?.find(
        (r) => formatReceiverName(r.sensorName) === formatted
      );
      if (existing) {
        setFormData((prev) => ({ ...prev, receiverId: existing.receiverId }));
      } else {
        const idNum = existingReceivers?.length + 1 || 1;
        const autoId = `R-${idNum.toString().padStart(3, "0")}`;
        setFormData((prev) => ({ ...prev, receiverId: autoId }));
      }
    }
  }, [formData.receiverName, existingReceivers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "receiverName") {
      const formatted = formatReceiverName(value);
      setFormData((prev) => ({ ...prev, receiverName: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isDuplicateReceiver = existingReceivers?.some(
      (r) =>
        formatReceiverName(r.sensorName) ===
        formatReceiverName(formData.receiverName)
    );

    if (isDuplicateReceiver && !editingDevice) {
      alert("Receiver name already exists.");
      return;
    }

    const newSensor = {
      sensorName: formData.sensorName.trim(),
      location: formData.location.trim(),
      sensorId: formData.sensorId,
      receiverId: formData.receiverId,
      receiverName: formatReceiverName(formData.receiverName),
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
    };

    onAdd(newSensor);

    setFormData({
      sensorName: "",
      sensorId: "",
      receiverName: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
    });
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
          <Input
            id="sensorId"
            name="sensorId"
            placeholder="S-001"
            value={formData.sensorId}
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receiverName">Receiver Name</Label>
          <Input
            id="receiverName"
            name="receiverName"
            placeholder="RCV-01"
            value={formData.receiverName}
            onChange={handleChange}
            required
          />
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
