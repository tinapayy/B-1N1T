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
  name: string;
  receiverId: string;
  longitude: string | number;
  latitude: string | number;
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

  const handleReceiverSelect = (receiverId: string) => {
    console.log("handleReceiverSelect triggered with receiverId:", receiverId);
    const selected = existingReceivers.find((r) => r.receiverId === receiverId);
    console.log("Selected receiver:", selected);
    if (selected) {
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          receiverId,
          receiverName: selected.name || "(Unnamed Receiver)",
        };
        console.log("Updated formData:", newFormData);
        return newFormData;
      });
    } else {
      console.warn("No receiver found for receiverId:", receiverId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { sensorId, receiverId, latitude, longitude } = formData;

    // In edit mode, make sensorId and receiverId optional
    if (!editingDevice && (!sensorId || !receiverId || !latitude || !longitude)) {
      alert("Missing required fields.");
      return;
    }

    if (editingDevice && (!latitude || !longitude)) {
      alert("Missing required fields: latitude and longitude.");
      return;
    }

    const receiver = existingReceivers.find((r) => r.receiverId === receiverId);

    const newSensor = {
      name: formData.sensorName,
      location: formData.location,
      // Use existing sensorId if formData.sensorId is empty during edit
      sensorId: editingDevice && !formData.sensorId ? editingDevice.sensorId : sensorId,
      // Use existing receiverId if formData.receiverId is empty during edit
      receiverId: editingDevice && !formData.receiverId ? editingDevice.receiverId : receiverId,
      receiverName: receiver?.name || "(Unnamed Receiver)",
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
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    try {
      await addVerifiedSensor(newSensor.sensorId, newSensor);
      await updateReceiverSensorMapping(newSensor.receiverId, newSensor.sensorId);
      onAdd(newSensor);
    } catch (err) {
      console.error("Error verifying sensor:", err);
      alert("Verification failed. See console for details.");
      return;
    }

    setFormData({
      sensorName: "",
      sensorId: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
    });
    onCancel();
  };

  const sortedReceivers = useMemo(() => {
    console.log(
      "existingReceivers:",
      existingReceivers.map((r) => ({
        receiverId: r.receiverId,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
      }))
    );

    console.log("selectedLocation:", selectedLocation);

    const filteredReceivers = [...existingReceivers].filter((r) => {
      const validReceiverId =
        r.receiverId && typeof r.receiverId === "string" && r.receiverId.trim() !== "";
      const validLatitude = !isNaN(parseFloat(String(r.latitude)));
      const validLongitude = !isNaN(parseFloat(String(r.longitude)));
      if (!validReceiverId) console.log("Filtered out due to invalid receiverId:", r);
      if (!validLatitude) console.log("Filtered out due to invalid latitude:", r);
      if (!validLongitude) console.log("Filtered out due to invalid longitude:", r);
      return validReceiverId && validLatitude && validLongitude;
    });

    console.log("filteredReceivers:", filteredReceivers);

    if (selectedLocation) {
      return filteredReceivers.sort((a, b) => {
        const distA = getDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          parseFloat(String(a.latitude)),
          parseFloat(String(a.longitude))
        );
        const distB = getDistance(
          selectedLocation.lat,
          selectedLocation.lng,
          parseFloat(String(b.latitude)),
          parseFloat(String(b.longitude))
        );
        return distA - distB;
      });
    }

    return filteredReceivers;
  }, [existingReceivers, selectedLocation]);

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  console.log(
    "sortedReceivers:",
    sortedReceivers.map((r) => ({
      receiverId: r.receiverId,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
    }))
  );

  // Ensure the current sensorId is included in the dropdown options during edit
  const sensorIdOptions = editingDevice
    ? [...new Set([editingDevice.sensorId, ...unverifiedSensorIds])].filter(Boolean)
    : unverifiedSensorIds;

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
              <SelectValue placeholder="Add or edit sensors..." />
            </SelectTrigger>
            <SelectContent>
              {sensorIdOptions.length > 0 ? (
                sensorIdOptions.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="no-unverified-sensors">
                  No unverified sensors
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="receiverId">Receiver</Label>
          <Select
            value={formData.receiverId}
            onValueChange={handleReceiverSelect}
          >
            <SelectTrigger id="receiverId">
              <SelectValue placeholder="Select nearest receiver..." />
            </SelectTrigger>
            <SelectContent>
              {sortedReceivers.length > 0 ? (
                sortedReceivers.map((r) => (
                  <SelectItem key={r.receiverId} value={r.receiverId}>
                    {r.name || "(Unnamed Receiver)"} (
                    {Number(r.latitude).toFixed(4)},{" "}
                    {Number(r.longitude).toFixed(4)})
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="no-receivers">
                  No receivers available
                </SelectItem>
              )}
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