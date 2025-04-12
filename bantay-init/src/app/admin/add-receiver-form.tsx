"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddReceiverFormProps {
  onAdd: (receiver: any) => void;
  selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  } | null;
}

export function AddReceiverForm({
  onAdd,
  selectedLocation,
}: AddReceiverFormProps) {
  const [formData, setFormData] = useState({
    receiverName: "",
    receiverId: "",
    longitude: "",
    latitude: "",
    location: "",
    connectedSensor: "",
  });

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

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, connectedSensor: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create a new receiver object (in this demo, we're using the same structure as sensors)
    const newReceiver = {
      sensorName: formData.receiverName,
      location: formData.location,
      sensorId: formData.connectedSensor,
      receiverId: formData.receiverId,
      registerDate: new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "."),
      status: "Offline",
    };

    onAdd(newReceiver);

    // Reset form
    setFormData({
      receiverName: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
      connectedSensor: "",
    });
  };

  // Sample connected sensors
  const connectedSensors = ["ILO-01-S-001", "ILO-02-S-001", "MNL-04-S-001"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="receiverName">Receiver Name</Label>
          <Input
            id="receiverName"
            name="receiverName"
            placeholder="ILO-01"
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
            placeholder="-77.0364"
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="connectedSensor">Connected Sensors</Label>
          <Select
            value={formData.connectedSensor}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a sensor" />
            </SelectTrigger>
            <SelectContent>
              {connectedSensors.map((sensor) => (
                <SelectItem key={sensor} value={sensor}>
                  {sensor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              connectedSensor: "",
            });
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[var(--orange-primary)] hover:bg-orange-600"
        >
          + Add
        </Button>
      </div>
    </form>
  );
}
