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
import { Button } from "@/components/ui/button";

// Sample notification data - replace with actual data later
const sampleNotifications = [
  {
    id: 1,
    type: "danger",
    message: "Heat index reached 47°C in Miagao, Iloilo",
    time: "10 minutes ago",
  },
  {
    id: 2,
    type: "warning",
    message: "Extreme caution: Heat index at 38°C in Jaro, Iloilo",
    time: "1 hour ago",
  },
  {
    id: 3,
    type: "info",
    message: "New sensor added to your subscriptions",
    time: "Yesterday",
  },
];

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [hasUnread, setHasUnread] = useState(true);

  const markAllAsRead = () => {
    setHasUnread(false);
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
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
            <DropdownMenuItem className="justify-center text-sm text-gray-500">
              View all notifications
            </DropdownMenuItem>
          </>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
