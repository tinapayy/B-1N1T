"use client";

import { useState } from "react";
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

// Sample notification data - replace with actual data later
const sampleNotifications =
  [
    {
      id: 1,
      type: "danger",
      message: "Heat index reached 45.8°C at Miagao Elementary School",
      time: "Just now",
    },
    {
      id: 2,
      type: "danger",
      message: "Heat index spiked to 44.1°C at St. Louise de Marillac School of Miagao",
      time: "5 minutes ago",
    },
    {
      id: 3,
      type: "warning",
      message: "Heat index at 42.3°C near Daja Crossing, Miagao",
      time: "10 minutes ago",
    },
    {
      id: 4,
      type: "warning",
      message: "Heat index at 41.7°C near Tacas Zone, Miagao",
      time: "20 minutes ago",
    },
    {
      id: 5,
      type: "info",
      message: "Sensor SENSOR_003 has been subscribed successfully",
      time: "30 minutes ago",
    }
  ]
  

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [hasUnread, setHasUnread] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const markAllAsRead = () => {
    setHasUnread(false);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      setHasUnread(true); // Reset unread status when re-enabling
    } else {
      setHasUnread(false); // Clear unread status when disabling
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-red-500";
      case "warning":
        return "bg-[var(--orange-primary)]";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Limit notifications to 3 for dropdown
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
                {displayedNotifications.map((notification) => (
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
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
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
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
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
