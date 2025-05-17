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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  getUnverifiedReceiverIds,
  addVerifiedReceiver,
} from "@/lib/adminDevices";

interface Receiver {
  id: number;
  name: string;
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
    name: "",
    receiverId: "",
    longitude: "",
    latitude: "",
    location: "",
    wifiSSID: "",
    wifiPassword: "",
  });

  const [unverifiedReceiverIds, setUnverifiedReceiverIds] = useState<string[]>(
    []
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingReceiver, setPendingReceiver] = useState<any | null>(null);

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
        name: editingDevice.name || "",
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

    const { receiverId, latitude, longitude } = formData;

    if (!editingDevice && (!receiverId || !latitude || !longitude)) {
      alert("Missing required fields.");
      return;
    }

    if (editingDevice && (!latitude || !longitude)) {
      alert("Missing required fields: latitude and longitude.");
      return;
    }

    const newReceiver = {
      name: formData.name.trim(),
      receiverId:
        editingDevice && !formData.receiverId
          ? editingDevice.receiverId
          : receiverId,
      location: formData.location,
      longitude: parseFloat(formData.longitude),
      latitude: parseFloat(formData.latitude),
      connectedSensorIds: [],
      wifiSSID: formData.wifiSSID,
      wifiPassword: formData.wifiPassword,
      installDate: editingDevice?.installDate || new Date().toISOString(),
      status: editingDevice?.status || "Online",
    };

    setPendingReceiver(newReceiver);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!pendingReceiver) return;

    try {
      await addVerifiedReceiver(pendingReceiver.receiverId, pendingReceiver);
      onAdd(pendingReceiver);
    } catch (err) {
      console.error("Error verifying receiver:", err);
      alert("Verification failed. See console for details.");
      return;
    }

    setFormData({
      name: "",
      receiverId: "",
      longitude: "",
      latitude: "",
      location: "",
      wifiSSID: "",
      wifiPassword: "",
    });
    setPendingReceiver(null);
    setShowConfirmDialog(false);
    onCancel();
  };

  const receiverIdOptions = editingDevice
    ? [...new Set([editingDevice.receiverId, ...unverifiedReceiverIds])].filter(
        Boolean
      )
    : unverifiedReceiverIds;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Receiver Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="RCV-01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiverId">Receiver Id</Label>
            <Select
              value={formData.receiverId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, receiverId: value }))
              }
            >
              <SelectTrigger id="receiverId">
                <SelectValue placeholder="Select receiver Id..." />
              </SelectTrigger>
              <SelectContent>
                {receiverIdOptions.length > 0 ? (
                  receiverIdOptions.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="no-unverified-receivers">
                    No unverified receivers
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifiSSID">Wi-Fi SSID</Label>
            <Input
              name="wifiSSID"
              value={formData.wifiSSID}
              onChange={handleChange}
              placeholder="Enter SSID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wifiPassword">Wi-Fi Password</Label>
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
            <Label htmlFor="location">Location</Label>
            <Input
              value={formData.location}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              value={formData.longitude}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
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
          <Button
            type="submit"
            className="bg-[var(--orange-primary)] hover:bg-orange-600"
          >
            {editingDevice ? "Update" : "+ Add"}
          </Button>
        </div>
      </form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent
          className="w-[90vw] max-w-[400px] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">
              Confirm {editingDevice ? "Update" : "Add"} Receiver
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base">
              Are you sure you want to {editingDevice ? "update" : "add"} this
              receiver? Please confirm the details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-[var(--orange-primary)] hover:bg-orange-600 w-full sm:w-auto text-sm"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
