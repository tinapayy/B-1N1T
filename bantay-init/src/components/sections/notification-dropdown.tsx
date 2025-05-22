// /src/components/sections/notification-dropdown.tsx

"use client";

import { useState } from "react";
import useSWR from "swr";
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

type NotificationItem = {
  id: number;
  type: "danger" | "warning" | "info";
  message: string;
  time: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationDropdown() {
  const [hasUnread, setHasUnread] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data } = useSWR(
    "/api/analytics/alerts?range=week&sensorId=SENSOR_001", // TEMP: Replace with dynamic multi-sensor source
    fetcher,
    { refreshInterval: 30000 }
  );

  const alerts = data?.alerts ?? [];

  const notifications: NotificationItem[] = alerts.slice(0, 10).map((alert: any, index: number) => ({
    id: index,
    type:
      alert.alertType === "Extreme Danger"
        ? "danger"
        : alert.alertType === "Danger"
        ? "warning"
        : "info",
    message: `Heat index at ${alert.heatIndex}°C – ${alert.alertType}`,
    time: new Date(alert.timestamp).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      month: "short",
      day: "numeric",
    }),
  }));

  const markAllAsRead = () => setHasUnread(false);

  const toggleNotifications = () => {
    const next = !notificationsEnabled;
    setNotificationsEnabled(next);
    setHasUnread(next);
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

  const displayedNotifications = notifications.slice(0, 3);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {hasUnread && notificationsEnabled && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1"></span>
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
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--orange-primary)]"></div>
              </label>
              <span className="text-xs">
                {notificationsEnabled ? "On" : "Off"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notificationsEnabled ? (
            displayedNotifications.length > 0 ? (
              <>
                {displayedNotifications.map((notification: NotificationItem) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex items-start p-3 cursor-pointer"
                  >
                    <div
                      className={`${getTypeColor(
                        notification.type
                      )} h-2 w-2 rounded-full mt-1.5 mr-2 flex-shrink-0`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
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
                      {notifications.map((notification: NotificationItem) => (
                        <div
                          key={notification.id}
                          className="flex items-start p-3 border-b"
                        >
                          <div
                            className={`${getTypeColor(
                              notification.type
                            )} h-2 w-2 rounded-full mt-1.5 mr-2 flex-shrink-0`}
                          />
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
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
                No notifications
              </div>
            )
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">
              Notifications are disabled
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
