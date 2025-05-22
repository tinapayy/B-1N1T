"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

interface Sensor {
  sensorId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  status: string;
}

interface MapRealtimeProps {
  onSensorSelect: (sensorId: string) => void;
}

// Fix default Leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapRealtime({ onSensorSelect }: MapRealtimeProps) {
  const [sensors, setSensors] = useState<Sensor[]>([]);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await fetch("/api/dashboard/map-realtime");
        const json = await res.json();
        if (Array.isArray(json.sensors)) {
          setSensors(json.sensors);
        }
      } catch (err) {
        console.error("Failed to fetch sensors:", err);
      }
    };

    fetchSensors();
  }, []);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[10.6433, 122.2355]} // Centered on Miagao
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {sensors.map((sensor) => (
          <Marker
            key={sensor.sensorId}
            position={[sensor.location.lat, sensor.location.lng]}
            eventHandlers={{
              click: () => onSensorSelect(sensor.sensorId),
            }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{sensor.name}</strong>
                <br />
                Sensor ID: {sensor.sensorId}
                <br />
                Status: {sensor.status}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}