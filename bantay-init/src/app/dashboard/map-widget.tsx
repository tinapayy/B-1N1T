"use client";

import { useState } from "react";
import useSWR from "swr";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Thermometer, Flame, Server } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const ZoomHandler = ({ setZoom }: { setZoom: (zoom: number) => void }) => {
  useMapEvents({
    zoomend: (event) => {
      setZoom(event.target.getZoom());
    },
  });
  return null;
};

interface MapWidgetProps {
  onSensorSelect?: (sensorId: string) => void;
}

const MapWidget = ({ onSensorSelect }: MapWidgetProps) => {
  const [zoom, setZoom] = useState(13);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);
  const [subscribedSensors, setSubscribedSensors] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [showSubscribedList, setShowSubscribedList] = useState(false);

  const { data } = useSWR("/api/dashboard/map-realtime", fetcher);
  const sensorData = data?.sensors ?? [];
  const receiverData = data?.receivers ?? [];

  const getAlertColor = (heatIndex: number) => {
    if (heatIndex < 27) return "#00A65A";
    if (heatIndex < 32) return "#FFD700";
    if (heatIndex < 41) return "#FFB029";
    if (heatIndex < 51) return "#FF7123";
    return "#CD0201";
  };

  const createSensorIcon = (heatIndex: number, id: string) => {
    const color = getAlertColor(heatIndex);
    return L.divIcon({
      html: `<div style="
        background-color: ${color};
        color: white;
        padding: 8px 8px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 12px;
        text-align: center;
        box-shadow: 0 0 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 80px;
        ${
          selectedSensor === id
            ? "transform: scale(1.1); border: 2px solid white;"
            : ""
        }
      ">${heatIndex.toFixed(1)}°C</div>`,
      className: "custom-marker",
      iconSize: [65, 50],
      iconAnchor: [40, 25],
    });
  };

  const createReceiverIcon = () =>
    L.divIcon({
      html: `<div style="
        background-color: #ff0000;
        width: 16px;
        height: 16px;
        border-radius: 9999px;
        box-shadow: 0 0 4px rgba(0,0,0,0.5);
      "></div>`,
      className: "receiver-marker",
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

  const handleMarkerClick = (sensorId: string) => {
    const newSelected = selectedSensor === sensorId ? null : sensorId;
    setSelectedSensor(newSelected);
    if (onSensorSelect && newSelected) {
      onSensorSelect(newSelected);
    }
  };

  const handleSubscribeToggle = (sensorId: string, location: string) => {
    setSubscribedSensors((prev) => {
      if (prev.includes(sensorId)) {
        setConfirmation(`Unsubscribed from sensor at ${location}`);
        setTimeout(() => setConfirmation(null), 3000);
        return prev.filter((id) => id !== sensorId);
      } else {
        setConfirmation(`Subscribed to sensor at ${location}!`);
        setTimeout(() => setConfirmation(null), 3000);
        return [...prev, sensorId];
      }
    });
  };

  const truncateLocation = (location: string, maxLength: number = 20) => {
    if (location.length <= maxLength) return location;
    return `${location.slice(0, maxLength - 3)}...`;
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[10.6442, 122.2352]} // Miagao, Iloilo coordinates
        zoom={zoom}
        className="h-full w-full rounded-xl"
        scrollWheelZoom
        style={{ zIndex: 1 }}
        zoomControl={false}
      >
        <ZoomHandler setZoom={setZoom} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {/* Sensor Markers */}
        {sensorData.map((sensor: any) => (
          <Marker
            key={sensor.sensorId}
            position={[sensor.lat, sensor.lng]}
            icon={createSensorIcon(sensor.heatIndex, sensor.sensorId)}
            eventHandlers={{ click: () => handleMarkerClick(sensor.sensorId) }}
          />
        ))}

        {/* Receiver Markers */}
        {receiverData.map((receiver: any) => (
          <Marker
            key={receiver.receiverId}
            position={[receiver.lat, receiver.lng]}
            icon={createReceiverIcon()}
          />
        ))}
      </MapContainer>

      {/* Sensor popup */}
      {selectedSensor && (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg z-[1000] text-sm"
          style={{ minWidth: "200px", maxWidth: "90%" }}
        >
          {(() => {
            const sensor = sensorData.find(
              (s: any) => s.sensorId === selectedSensor
            );
            if (!sensor) return null;
            const isSubscribed = subscribedSensors.includes(sensor.sensorId);
            return (
              <>
                <div className="flex flex-col mb-1">
                  <div className="font-bold">
                    {truncateLocation(sensor.location, 40)}
                  </div>
                  <div className="text-gray-500 text-sm">
                    ID: {sensor.sensorId}
                  </div>
                </div>
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <Thermometer className="w-4 h-4 mr-1 text-gray-700" />
                    <span>{sensor.temp ?? "-"}°C</span>
                  </div>
                  <div className="flex items-center ml-4">
                    <Flame className="w-4 h-4 mr-1 text-gray-700" />
                    <span>{sensor.heatIndex ?? "-"}°C</span>
                  </div>
                </div>
                <label className="flex items-center text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSubscribed}
                    onChange={() =>
                      handleSubscribeToggle(sensor.sensorId, sensor.location)
                    }
                    className="mr-2 h-4 w-4 text-[var(--orange-primary)] border-gray-300 rounded focus:ring-[var(--orange-primary)]"
                  />
                  <span>Subscribe to this sensor for alerts</span>
                </label>
              </>
            );
          })()}
        </div>
      )}

      {/* Toast feedback */}
      {confirmation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[var(--orange-primary)] text-white p-2 rounded-lg shadow-lg z-[1000] text-sm animate-fade-in-out">
          {confirmation}
        </div>
      )}

      {/* Subscribed list toggle */}
      <button
        onClick={() => setShowSubscribedList((prev) => !prev)}
        className="absolute bottom-4 right-4 bg-[var(--orange-primary)] text-white p-2 rounded-full shadow-lg z-[10] hover:bg-[var(--dark-gray-1)] transition-colors"
      >
        <Server className="w-5 h-5" />
      </button>

      {/* Subscribed Sensors */}
      {showSubscribedList && (
        <div className="absolute bottom-16 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] text-sm w-64 max-h-64 overflow-y-auto">
          <h3 className="font-bold mb-2">Subscribed Sensors</h3>
          {subscribedSensors.length === 0 ? (
            <p className="text-gray-500 text-xs">No sensors subscribed.</p>
          ) : (
            subscribedSensors.map((sensorId) => {
              const sensor = sensorData.find(
                (s: any) => s.sensorId === sensorId
              );
              if (!sensor) return null;
              return (
                <div
                  key={sensor.sensorId}
                  className="flex items-center justify-between py-1 border-b border-gray-200 last:border-b-0"
                >
                  <span className="text-xs">
                    {truncateLocation(sensor.location)}
                  </span>
                  <label className="flex items-center text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() =>
                        handleSubscribeToggle(sensor.sensorId, sensor.location)
                      }
                      className="ml-2 h-4 w-4 text-[var(--orange-primary)] border-gray-300 rounded focus:ring-[var(--orange-primary)]"
                    />
                  </label>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MapWidget;