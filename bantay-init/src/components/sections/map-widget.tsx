"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Hook to track zoom changes
const ZoomHandler = ({ setZoom }: { setZoom: (zoom: number) => void }) => {
  useMapEvents({
    zoomend: (event) => {
      setZoom(event.target.getZoom());
    },
  });
  return null;
};

const MapWidget = () => {
  const [zoom, setZoom] = useState(13);

  // 🌡 Sensor Data
  const sensorData = [
    { id: 1, lat: 10.7202, lng: 122.5621, temp: 33, heatIndex: 38 }, // Iloilo City Proper
    { id: 2, lat: 10.713, lng: 122.5514, temp: 34, heatIndex: 40 }, // Molo, Iloilo
    { id: 3, lat: 10.7026, lng: 122.5451, temp: 32, heatIndex: 37 }, // Arevalo, Iloilo
    { id: 4, lat: 10.6905, lng: 122.5643, temp: 31, heatIndex: 36 }, // Mandurriao, Iloilo
    { id: 5, lat: 10.687, lng: 122.5697, temp: 35, heatIndex: 42 }, // Jaro, Iloilo
  ];

  // 🎨 Heat Index Alert Colors
  const getAlertColor = (heatIndex: number) => {
    if (heatIndex < 27) return "#00A65A"; // 🟩 Safe (Green)
    if (heatIndex < 32) return "#FFFF00"; // 🟨 Caution (Yellow)
    if (heatIndex < 41) return "#FFB029"; // 🟧 Extreme Caution (Orange)
    if (heatIndex < 51) return "#FF7123"; // 🟥 Danger (Red)
    return "#CD0201"; // 🛑 Extreme Danger (Dark Red)
  };

  // 📌 Custom Marker Using DivIcon
  const createCustomIcon = (heatIndex: number) => {
    const color = getAlertColor(heatIndex);
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        color: white;
        padding: 6px 10px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        box-shadow: 0 0 8px rgba(0,0,0,0.3);
      ">
        ${heatIndex}°C
      </div>`,
      className: "custom-marker",
      iconSize: [50, 50],
      iconAnchor: [25, 25],
    });
  };

  return (
    <MapContainer
      center={[10.7202, 122.5621]} // Iloilo City Proper
      zoom={zoom}
      className="h-full w-full rounded-xl"
      scrollWheelZoom={true}
      style={{ zIndex: 1 }} // Lower z-index
    >
      <ZoomHandler setZoom={setZoom} /> {/* Handle zoom events */}
      {/* 🗺 Beige/Brown Themed Map */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png

"
      />
      {/* 🔥 Sensor Markers with DivIcons */}
      {sensorData.map((sensor) => (
        <Marker
          key={sensor.id}
          position={[sensor.lat, sensor.lng]}
          icon={createCustomIcon(sensor.heatIndex)}
        >
          <Popup>
            <div className="text-sm font-medium">
              📍 Sensor {sensor.id}
              <br />
              🌡 Temp: {sensor.temp}°C
              <br />
              🔥 Heat Index: {sensor.heatIndex}°C
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapWidget;
