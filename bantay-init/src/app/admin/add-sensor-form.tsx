"use client";

import type React from "react";
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
  existingSensors?: Sensor[]; // Made optional to handle undefined
}

export function AddSensorForm({
  onAdd,
  selectedLocation,
  editingDevice,
  onCancel,
  existingSensors = [], // Default to empty array
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

  // Generate the next sensorId in the format S-###
  useEffect(() => {
    if (!editingDevice) {
      // Only auto-generate if not editing an existing sensor
      const existingIds = existingSensors
        .map((sensor) => {
          const match = sensor.sensorId.match(/^S-(\d{3})$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => !isNaN(num));

      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const nextId = maxId + 1;
      const formattedId = `S-${nextId.toString().padStart(3, "0")}`; // e.g., S-001, S-002
      setFormData((prev) => ({ ...prev, sensorId: formattedId }));
    }
  }, [existingSensors, editingDevice]);

  // Update form when editing device is set
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new sensor object
    const newSensor = {
      sensorName: formData.sensorName,
      location: formData.location,
      sensorId: formData.sensorId,
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
    };

    onAdd(newSensor);

    // Reset form
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
            readOnly // Make the input read-only since it's auto-generated
            className="bg-gray-100 cursor-not-allowed" // Style to indicate it's disabled
          />
        </div>

        <div className="space-y-2">
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
            placeholder="e.g. 38.8951"
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
            placeholder="e.g. -77.0364"
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
