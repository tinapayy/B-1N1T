// src/app/dashboard/map-widget.tsx
"use client";

import { useState, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Thermometer, Flame, Server } from "lucide-react";
import { getFcmToken } from "@/components/fcm-client";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const fetchSubscribedSensors = async (url: string, token: string | null) => {
  if (!token) return [];
  const res = await fetch(`${url}?type=sensorIds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    console.error("[fetchSubscribedSensors] Failed to fetch:", res.statusText);
    return [];
  }
  const data = await res.json();
  console.log("[fetchSubscribedSensors] Response:", JSON.stringify(data, null, 2));
  return Array.isArray(data.sensorIds) ? data.sensorIds : [];
};

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
  const [subscribedSensors, setSubscribedSensors] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("subscribedSensors");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [showSubscribedList, setShowSubscribedList] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate } = useSWRConfig();

  useEffect(() => {
    getFcmToken()
      .then((t) => {
        setToken(t);
        setPermissionDenied(false);
      })
      .catch(() => {
        setToken(null);
        setPermissionDenied(true);
      });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("subscribedSensors", JSON.stringify(subscribedSensors));
      console.log("[MapWidget] Saved subscribedSensors to localStorage:", subscribedSensors);
    }
  }, [subscribedSensors]);

  const { data: subscribedData, error: fetchError } = useSWR(
    token ? ["/api/notifications/subscribed-sensors", token] : null,
    ([url, token]) => fetchSubscribedSensors(url, token),
    { refreshInterval: 10000 }
  );

  useEffect(() => {
    if (fetchError) {
      console.error("[MapWidget] SWR fetch error:", fetchError);
      setError("Failed to load subscribed sensors");
    } else if (Array.isArray(subscribedData)) {
      setSubscribedSensors(subscribedData);
      setError(null);
      console.log("[MapWidget] Updated subscribedSensors from SWR:", subscribedData);
    }
  }, [subscribedData, fetchError]);

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

  const handleSubscribeToggle = async (sensorId: string, location: string) => {
    if (permissionDenied) {
      setConfirmation("Notifications blocked. Enable in browser settings.");
      setTimeout(() => setConfirmation(null), 3000);
      return;
    }

    const isSubscribed = Array.isArray(subscribedSensors) && subscribedSensors.includes(sensorId);
    console.log(`[handleSubscribeToggle] ${isSubscribed ? "Unsubscribing" : "Subscribing"} sensor ${sensorId}`);

    const previousSensors = subscribedSensors;
    setSubscribedSensors((prev) =>
      isSubscribed ? prev.filter((id) => id !== sensorId) : [...prev, sensorId]
    );

    try {
      const res = await fetch(
        `/api/notifications/${isSubscribed ? "unsubscribe" : "subscribe"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sensorId, token }),
        }
      );

      if (!res.ok) throw new Error("Subscription request failed");

      setTimeout(() => {
        mutate(["/api/notifications/subscribed-sensors", token], undefined, { revalidate: true });
        console.log("[handleSubscribeToggle] Scheduled SWR mutate for sensor", sensorId);
      }, 1000);

      setConfirmation(
        `${isSubscribed ? "Unsubscribed" : "Subscribed"} to sensor at ${location}${!isSubscribed ? "!" : ""}`
      );
      setTimeout(() => setConfirmation(null), 3000);
      console.log(`[handleSubscribeToggle] Success: ${isSubscribed ? "Unsubscribed" : "Subscribed"} sensor ${sensorId}`);
    } catch (err) {
      console.error(`[handleSubscribeToggle] Failed to ${isSubscribed ? "unregister" : "register"} token:`, err);
      setSubscribedSensors(previousSensors);
      setConfirmation(`${isSubscribed ? "Unsubscription" : "Subscription"} failed.`);
      setTimeout(() => setConfirmation(null), 3000);
    }
  };

  const truncateLocation = (location: string, maxLength: number = 20) => {
    if (location.length <= maxLength) return location;
    return `${location.slice(0, maxLength - 3)}...`;
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[10.6442, 122.2352]}
        zoom={zoom}
        className="h-full w-full rounded-xl"
        scrollWheelZoom
        style={{ zIndex: 1 }}
        zoomControl={false}
      >
        <ZoomHandler setZoom={setZoom} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

        {sensorData.map((sensor: any) => (
          <Marker
            key={sensor.sensorId}
            position={[sensor.lat, sensor.lng]}
            icon={createSensorIcon(sensor.heatIndex, sensor.sensorId)}
            eventHandlers={{ click: () => handleMarkerClick(sensor.sensorId) }}
          />
        ))}

        {receiverData.map((receiver: any) => (
          <Marker
            key={receiver.receiverId}
            position={[receiver.lat, receiver.lng]}
            icon={createReceiverIcon()}
          />
        ))}
      </MapContainer>

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
            const isSubscribed = Array.isArray(subscribedSensors) && subscribedSensors.includes(sensor.sensorId);
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
                    disabled={permissionDenied}
                  />
                  <span>Subscribe to this sensor for alerts</span>
                </label>
              </>
            );
          })()}
        </div>
      )}

      {confirmation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[var(--orange-primary)] text-white p-2 rounded-lg shadow-lg z-[1000] text-sm animate-fade-in-out">
          {confirmation}
        </div>
      )}

      {error && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-2 rounded-lg shadow-lg z-[1000] text-sm animate-fade-in-out">
          {error}
        </div>
      )}

      <button
        onClick={() => setShowSubscribedList((prev) => !prev)}
        className="absolute bottom-4 right-4 bg-[var(--orange-primary)] text-white p-2 rounded-full shadow-lg z-[10] hover:bg-[var(--dark-gray-1)] transition-colors"
      >
        <Server className="w-5 h-5" />
      </button>

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
                      disabled={permissionDenied}
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