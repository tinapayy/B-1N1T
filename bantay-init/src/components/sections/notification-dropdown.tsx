// src/components/sections/notification-dropdown.tsx
"use client";

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getFcmToken } from "@/components/fcm-client";

const fetcher = async (url: string, token: string | null) => {
  if (!token) return { alerts: [] };
  const res = await fetch(`${url}?type=alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("[NotificationDropdown] Fetch failed:", res.status, errorText);
    throw new Error(`Failed to fetch notifications: ${res.status}`);
  }
  const data = await res.json();
  console.log("[NotificationDropdown] Fetched alerts:", JSON.stringify(data, null, 2));
  return data;
};

export function NotificationDropdown({ sensorId }: { sensorId?: string }) {
  const [hasUnread, setHasUnread] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubscriptions, setHasSubscriptions] = useState(false);
  const [persistedAlerts, setPersistedAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setNotificationsEnabled(false);
      });
  }, []);

  const { data, error: fetchError } = useSWR(
    notificationsEnabled && token
      ? ["/api/notifications/subscribed-sensors?type=alerts", token]
      : null,
    ([url, token]) => fetcher(url, token),
    { refreshInterval: 60000, dedupingInterval: 5000 }
  );

  useEffect(() => {
    if (fetchError) {
      setError("Failed to load notifications");
      console.error("[NotificationDropdown] SWR error:", fetchError);
    } else if (data?.alerts) {
      setPersistedAlerts(data.alerts);
      setError(null);
      setIsLoading(false);
      console.log("[NotificationDropdown] Updated persistedAlerts:", data.alerts.length);
    } else if (data) {
      setPersistedAlerts([]);
      setIsLoading(false);
    }

    // Check subscriptions
    if (token) {
      fetch("/api/notifications/subscribed-sensors?type=sensorIds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((res) => res.json())
        .then((data) => {
          setHasSubscriptions(data.sensorIds?.length > 0);
          console.log("[NotificationDropdown] Subscriptions:", data.sensorIds);
        })
        .catch((err) =>
          console.error("[NotificationDropdown] Subscription check failed:", err)
        );
    }
  }, [fetchError, data, token]);

  const notifications = persistedAlerts.map((alert: any, index: number) => ({
    id: index,
    type:
      alert.alertCategory === "Extreme Danger"
        ? "danger"
        : alert.alertCategory === "Danger"
        ? "warning"
        : "info",
    message: `${alert.alertCategory} – ${alert.heatIndex}°C`,
    sensorId: alert.sensorId,
    sensorName: alert.sensorName ?? alert.sensorId,
    location: alert.location ?? "Unknown",
    time: new Date(alert.timestamp?.seconds * 1000 || Date.now()).toLocaleString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        month: "short",
        day: "numeric",
      }
    ),
  }));

  const displayed = notifications.slice(0, 3);
  const markAllAsRead = () => setHasUnread(false);
  const toggleNotifications = () => {
    if (permissionDenied) return;
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    setHasUnread(next);
    setTimeout(() => {
      mutate(["/api/notifications/subscribed-sensors?type=alerts", token], undefined, {
        revalidate: true,
      });
      console.log("[NotificationDropdown] Scheduled SWR mutate for notifications toggle");
    }, 1000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-[var(--orange-primary)]";
      case "info":
      default:
        return "bg-blue-500";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && notificationsEnabled && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={toggleNotifications}
                className="sr-only peer"
                disabled={permissionDenied}
              />
              <div
                className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                  permissionDenied
                    ? "opacity-50"
                    : "peer-checked:bg-[var(--orange-primary)]"
                }`}
              />
            </label>
            <span className="text-xs">{notificationsEnabled ? "On" : "Off"}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {error ? (
          <div className="py-4 text-center text-sm text-red-500">{error}</div>
        ) : isLoading ? (
          <div className="py-4 text-center text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : notificationsEnabled && displayed.length > 0 ? (
          <>
            {displayed.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start p-3"
              >
                <div className="flex items-center mb-1">
                  <div
                    className={`${getTypeColor(n.type)} h-2 w-2 rounded-full mr-2`}
                  />
                  <span className="text-sm font-medium">{n.message}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {n.sensorName} • {n.location}
                </div>
                <div className="text-xs text-gray-400">{n.time}</div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  className="justify-center text-sm text-gray-500 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  View all notifications
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>All Notifications</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex flex-col p-3 border-b">
                      <div className="flex items-center">
                        <div
                          className={`${getTypeColor(n.type)} h-2 w-2 rounded-full mr-2`}
                        />
                        <span className="font-medium">{n.message}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Sensor: {n.sensorName} • {n.location}
                      </div>
                      <div className="text-xs text-gray-400">{n.time}</div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            {hasUnread && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="justify-center text-sm text-gray-500 cursor-pointer"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            {notificationsEnabled
              ? permissionDenied
                ? "Notifications blocked. Enable in browser settings."
                : hasSubscriptions
                ? "Subscribed, no alerts yet"
                : "No sensors subscribed"
              : "Notifications are disabled"}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}